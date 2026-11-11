import { describe, expect, it, vi } from 'vitest';
import { createCommitGate, withCommitFaults } from '../../scripts/scenarios/fault-repository';
import type { CommitFault } from '../../scripts/scenarios/fault-repository';
import provider from '../../scripts/scenarios/fixture-acceptance';
import { SaveConflictError } from '../../src/infrastructure/persistence/errors';

describe('commit fault injection', () => {
  it.each(['error', 'conflict'] as const)('injects %s once without delegating, then permits retry', async (kind) => {
    const repository = provider.createRepository();
    const commit = vi.spyOn(repository, 'commit');
    const wrapped = withCommitFaults(repository, [{ kind }]);
    const save = provider.initialSave();

    const pending = wrapped.commit(save, null);
    if (kind === 'conflict') await expect(pending).rejects.toBeInstanceOf(SaveConflictError);
    else await expect(pending).rejects.toThrow('Injected commit failure');
    expect(commit).not.toHaveBeenCalled();
    expect(await wrapped.load()).toBeNull();
    expect(await wrapped.loadBackup()).toBeNull();

    await wrapped.commit(save, null);
    expect(commit).toHaveBeenCalledTimes(1);
    expect(await wrapped.load()).toEqual(save);
  });

  it('holds the captured commit until release and delegates backup reads', async () => {
    const repository = provider.createRepository();
    const initial = provider.initialSave();
    const candidate = provider.candidateSave();
    const originalCandidate = structuredClone(candidate);
    await repository.commit(initial, null);
    const commit = vi.spyOn(repository, 'commit');
    const gate = createCommitGate();
    const wrapped = withCommitFaults(repository, [{ kind: 'delay', wait: gate.wait }]);
    const expected = { runId: initial.state.meta.runId, revision: 0 };
    const pending = wrapped.commit(candidate, expected);
    await gate.entered;

    expect(commit).not.toHaveBeenCalled();
    expect(await wrapped.load()).toEqual(initial);
    candidate.state.economy.cash = 999;
    expected.revision = 99;
    gate.release();
    await pending;

    expect(await wrapped.load()).toEqual(originalCandidate);
    expect(await wrapped.loadBackup()).toEqual(initial);
  });

  it('rechecks CAS in the underlying repository after latency', async () => {
    const repository = provider.createRepository();
    const initial = provider.initialSave();
    const candidate = provider.candidateSave();
    const expected = { runId: initial.state.meta.runId, revision: 0 };
    await repository.commit(initial, null);
    const gate = createCommitGate();
    const wrapped = withCommitFaults(repository, [{ kind: 'delay', wait: gate.wait }]);
    const pending = wrapped.commit(candidate, expected);
    const rejected = expect(pending).rejects.toBeInstanceOf(SaveConflictError);
    await gate.entered;
    await repository.commit(candidate, expected);
    gate.release();
    await rejected;

    expect(await wrapped.load()).toEqual(candidate);
    expect(await wrapped.loadBackup()).toEqual(initial);
  });

  it('assigns faults by attempt order even when a previous commit is held', async () => {
    const repository = provider.createRepository();
    const gate = createCommitGate();
    const faults: CommitFault[] = [{ kind: 'delay', wait: gate.wait }, { kind: 'conflict' }];
    const wrapped = withCommitFaults(repository, faults);
    const pending = wrapped.commit(provider.initialSave(), null);
    await gate.entered;
    await expect(wrapped.commit(provider.initialSave(), null)).rejects.toBeInstanceOf(SaveConflictError);
    gate.release();
    await pending;
    expect(await wrapped.load()).toEqual(provider.initialSave());
  });
});
