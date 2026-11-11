import { deepStrictEqual, rejects } from 'node:assert/strict';
import type { SaveEnvelope, SaveRepository } from '../../src/application/ports/save-repository';
import { SaveConflictError } from '../../src/infrastructure/persistence/errors';
import { createCommitGate, withCommitFaults } from './fault-repository';
import { runScenario } from './runner';
import type { Scenario, ScenarioProvider } from './runner';

export interface AcceptanceProvider {
  /** Labels the complete suite, including its snapshots and command executor. */
  name: string;
  kind: ScenarioProvider['kind'];
  commands: ScenarioProvider;
  scenario: () => Scenario;
  initialSave: () => SaveEnvelope;
  candidateSave: () => SaveEnvelope;
  /** Must return a fresh empty repository for each independent case. */
  createRepository: () => SaveRepository;
}

export async function runAcceptance(provider: AcceptanceProvider) {
  const scenario = provider.scenario();
  const initial = provider.initialSave();
  const candidate = provider.candidateSave();
  const expected = { runId: initial.state.meta.runId, revision: initial.state.meta.revision };
  const repositoryCases: { name: string; passed: boolean; failure: string | null }[] = [];
  const configurationFailures: string[] = [];
  if (scenario.steps.length === 0) configurationFailures.push('The command scenario must contain at least one step.');
  if (provider.kind === 'production' && provider.commands.kind !== 'production') {
    configurationFailures.push('A production acceptance suite must use a production command provider.');
  }

  async function check(name: string, verify: (repository: SaveRepository) => Promise<void>) {
    try {
      const repository = provider.createRepository();
      await repository.commit(structuredClone(initial), null);
      await verify(repository);
      repositoryCases.push({ name, passed: true, failure: null });
    } catch (error) {
      repositoryCases.push({ name, passed: false, failure: error instanceof Error ? error.stack ?? error.message : String(error) });
    }
  }

  await check('commit persists candidate and keeps previous save as backup', async (repository) => {
    await repository.commit(structuredClone(candidate), expected);
    deepStrictEqual(await repository.load(), candidate);
    deepStrictEqual(await repository.loadBackup(), initial);
  });

  await check('commit failure keeps both saves and permits retry', async (repository) => {
    const backup = await repository.loadBackup();
    const faulty = withCommitFaults(repository, [{ kind: 'error' }]);
    await rejects(faulty.commit(structuredClone(candidate), expected), /Injected commit failure/);
    deepStrictEqual(await repository.load(), initial);
    deepStrictEqual(await repository.loadBackup(), backup);
    await faulty.commit(structuredClone(candidate), expected);
    deepStrictEqual(await repository.load(), candidate);
    deepStrictEqual(await repository.loadBackup(), initial);
  });

  await check('injected CAS conflict leaves the saved state intact', async (repository) => {
    const backup = await repository.loadBackup();
    const faulty = withCommitFaults(repository, [{ kind: 'conflict' }]);
    await rejects(faulty.commit(structuredClone(candidate), expected), SaveConflictError);
    deepStrictEqual(await repository.load(), initial);
    deepStrictEqual(await repository.loadBackup(), backup);
  });

  await check('stale writer cannot overwrite a committed revision', async (repository) => {
    await repository.commit(structuredClone(candidate), expected);
    await rejects(repository.commit(structuredClone(candidate), expected), SaveConflictError);
    deepStrictEqual(await repository.load(), candidate);
    deepStrictEqual(await repository.loadBackup(), initial);
  });

  await check('delayed commit becomes visible only after release', async (repository) => {
    const backup = await repository.loadBackup();
    const gate = createCommitGate();
    const faulty = withCommitFaults(repository, [{ kind: 'delay', wait: gate.wait }]);
    const pending = faulty.commit(structuredClone(candidate), expected);
    // Attach a rejection handler immediately while inspecting the held commit.
    void pending.catch(() => undefined);
    try {
      await gate.entered;
      deepStrictEqual(await repository.load(), initial);
      deepStrictEqual(await repository.loadBackup(), backup);
    } finally {
      gate.release();
      await pending;
    }
    deepStrictEqual(await repository.load(), candidate);
    deepStrictEqual(await repository.loadBackup(), initial);
  });

  const commandReport = runScenario(provider.commands, scenario);
  return {
    provider: { name: provider.name, kind: provider.kind },
    passed: configurationFailures.length === 0 && commandReport.passed && repositoryCases.every((entry) => entry.passed),
    configurationFailures,
    reproduction: { scenario, initialSave: initial, candidateSave: candidate },
    commands: commandReport,
    repositoryCases,
  };
}
