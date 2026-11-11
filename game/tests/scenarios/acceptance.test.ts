import { describe, expect, it } from 'vitest';
import { runAcceptance } from '../../scripts/scenarios/acceptance';
import provider from '../../scripts/scenarios/fixture-acceptance';

describe('acceptance toolkit', () => {
  it('runs all fixture command and repository cases with reproducible inputs', async () => {
    const report = await runAcceptance(provider);

    expect(report.passed).toBe(true);
    expect(report.provider).toEqual({ name: provider.name, kind: 'fixture' });
    expect(report.commands).toMatchObject({ passed: true, seed: 123, totalCommands: 5 });
    expect(report.commands.steps).toHaveLength(5);
    expect(report.repositoryCases).toHaveLength(5);
    expect(report.repositoryCases.every((entry) => entry.passed)).toBe(true);
    const restored = JSON.parse(JSON.stringify(report));
    expect(restored.reproduction.initialSave).toEqual(provider.initialSave());
    expect(restored.reproduction.candidateSave).toEqual(provider.candidateSave());
    expect(restored.reproduction.scenario).toEqual(provider.scenario());
  });

  it('reports a bad repository and still runs the remaining cases', async () => {
    const report = await runAcceptance({
      ...provider,
      name: 'ignores-all-commits',
      kind: 'test',
      createRepository: () => ({
        load: async () => null,
        loadBackup: async () => null,
        commit: async () => undefined,
      }),
    });

    expect(report.passed).toBe(false);
    expect(report.provider.kind).toBe('test');
    expect(report.commands.passed).toBe(true);
    expect(report.repositoryCases).toHaveLength(5);
    expect(report.repositoryCases.every((entry) => !entry.passed)).toBe(true);
    expect(report.repositoryCases[0]?.failure).toContain('AssertionError');
  });

  it('detects premature state changes before a delayed commit reaches storage', async () => {
    const report = await runAcceptance({
      ...provider,
      name: 'reads-uncommitted-candidate',
      kind: 'test',
      createRepository: () => {
        const repository = provider.createRepository();
        return {
          load: async () => provider.candidateSave(),
          loadBackup: () => repository.loadBackup(),
          commit: (candidate, expected) => repository.commit(candidate, expected),
        };
      },
    });

    expect(report.passed).toBe(false);
    expect(report.repositoryCases.find((entry) => entry.name.startsWith('delayed'))).toMatchObject({ passed: false });
  });

  it('combines failed command checks with repository checks instead of accepting a bad executor', async () => {
    const report = await runAcceptance({
      ...provider,
      name: 'wrong-executor',
      kind: 'test',
      commands: {
        name: 'accepts-everything', kind: 'test',
        execute: () => ({ ok: true, nextState: provider.candidateSave().state, notices: [] }),
      },
    });

    expect(report.passed).toBe(false);
    expect(report.commands.steps[0]?.failures[0]).toContain('Expected rejection INVALID_PHASE');
    expect(report.repositoryCases.every((entry) => entry.passed)).toBe(true);
  });

  it('fails an empty scenario and a production suite using fixture commands', async () => {
    const report = await runAcceptance({
      ...provider,
      kind: 'production',
      scenario: () => ({ ...provider.scenario(), steps: [] }),
    });

    expect(report.passed).toBe(false);
    expect(report.configurationFailures).toEqual([
      'The command scenario must contain at least one step.',
      'A production acceptance suite must use a production command provider.',
    ]);
  });
});
