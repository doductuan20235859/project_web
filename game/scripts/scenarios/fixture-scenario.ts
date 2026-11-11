import {
  fixtureExecutor,
  makePlanningDay1,
  makePlanningDay2,
  makeReviewDay1,
} from '../../src/testing/day-fixtures';
import type { GameCommand } from '../../src/domain/model/command';
import type { Scenario, ScenarioProvider } from './runner';

export const fixtureProvider: ScenarioProvider = { name: 'common-base-day-fixture', kind: 'fixture', execute: fixtureExecutor };

export function makeFixtureScenario(): Scenario {
  const execute = {
    type: 'EXECUTE_DAY', commandId: 'fixture-execute-day-1', expectedRevision: 0, activityId: 'fixture-study',
  } satisfies GameCommand;
  const acknowledge = {
    type: 'ACK_DAY', commandId: 'fixture-ack-day-1', expectedRevision: 1,
  } satisfies GameCommand;

  return {
    name: 'day-one-command-baseline',
    initialState: makePlanningDay1(),
    steps: [
      { command: { ...acknowledge, expectedRevision: 0 }, expect: { error: 'INVALID_PHASE' } },
      { command: { ...execute, expectedRevision: 1 }, expect: { error: 'STALE_COMMAND' } },
      { command: execute, expect: { state: makeReviewDay1() } },
      // Refresh the revision to isolate duplicate-ID rejection from the revision check.
      { command: { ...execute, expectedRevision: 1 }, expect: { error: 'STALE_COMMAND' } },
      { command: acknowledge, expect: { state: makePlanningDay2() } },
    ],
  };
}
