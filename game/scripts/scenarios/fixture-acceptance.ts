import type { SaveEnvelope } from '../../src/application/ports/save-repository';
import { MemorySaveRepository } from '../../src/infrastructure/persistence/memory-save-repository';
import { makePlanningDay1, makeReviewDay1 } from '../../src/testing/day-fixtures';
import type { AcceptanceProvider } from './acceptance';
import { fixtureProvider, makeFixtureScenario } from './fixture-scenario';

function envelope(state: SaveEnvelope['state']): SaveEnvelope {
  return { schemaVersion: 1, appVersion: '0.1.0', savedAt: '2026-11-11T00:00:00.000Z', state };
}

/** Fixture commands plus the existing memory repository; exported for CLI and tests. */
const provider: AcceptanceProvider = {
  name: 'fixture-commands-memory-save',
  kind: 'fixture',
  commands: fixtureProvider,
  scenario: makeFixtureScenario,
  initialSave: () => envelope(makePlanningDay1()),
  candidateSave: () => envelope(makeReviewDay1()),
  createRepository: () => new MemorySaveRepository(),
};

export default provider;
