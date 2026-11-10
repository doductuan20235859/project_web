import { describe, expect, it, vi } from 'vitest';
import { fixtureProvider, makeFixtureScenario } from '../../scripts/scenarios/fixture-scenario';
import { runScenario } from '../../scripts/scenarios/runner';
import type { Scenario, ScenarioProvider } from '../../scripts/scenarios/runner';
import { makePlanningDay1, makeReviewDay1 } from '../../src/testing/day-fixtures';

function makeSingleStep(): Scenario {
  return {
    name: 'single-execute',
    initialState: makePlanningDay1(),
    steps: [{
      command: { type: 'EXECUTE_DAY', commandId: 'fixture-execute-day-1', expectedRevision: 0, activityId: 'fixture-study' },
      expect: { state: makeReviewDay1() },
    }],
  };
}

describe('headless scenario runner', () => {
  it('keeps expected rejections in the report and reaches day 2 using the fixture', () => {
    const report = runScenario(fixtureProvider, makeFixtureScenario());

    expect(report).toMatchObject({ passed: true, seed: 123, provider: { kind: 'fixture' }, totalCommands: 5 });
    expect(report.steps.map(({ outcome, errorCode }) => [outcome, errorCode])).toEqual([
      ['rejected', 'INVALID_PHASE'],
      ['rejected', 'STALE_COMMAND'],
      ['accepted', null],
      ['rejected', 'STALE_COMMAND'],
      ['accepted', null],
    ]);
    expect(report.steps[3]).toMatchObject({
      commandIndex: 3,
      before: { day: 1, phase: 'review', revision: 1 },
      after: { day: 1, phase: 'review', revision: 1 },
    });
    expect(report.steps[4]?.after).toEqual({ day: 2, phase: 'planning', revision: 2 });
  });

  it('accepts a replacement executor without changing the runner', () => {
    const provider: ScenarioProvider = {
      name: 'fixed-review', kind: 'test', execute: () => ({ ok: true, nextState: makeReviewDay1(), notices: [] }),
    };

    expect(runScenario(provider, makeSingleStep())).toMatchObject({
      passed: true, provider: { name: 'fixed-review', kind: 'test' },
    });
  });

  it('stops at the first wrong snapshot and reports a diff for nested data', () => {
    const scenario = makeSingleStep();
    const nextState = makeReviewDay1();
    nextState.economy.cash = 9_999;
    const execute = vi.fn<ScenarioProvider['execute']>(() => ({ ok: true, nextState, notices: [] }));
    const report = runScenario({ name: 'wrong-cash', kind: 'test', execute }, {
      ...scenario, steps: [...scenario.steps, ...scenario.steps],
    });

    expect(report).toMatchObject({ passed: false, totalCommands: 2 });
    expect(execute).toHaveBeenCalledTimes(1);
    expect(report.steps[0]).toMatchObject({
      commandIndex: 0,
      before: { day: 1, phase: 'planning', revision: 0 },
      after: { day: 1, phase: 'review', revision: 1 },
      failures: [expect.stringMatching(/cash: 9999[\s\S]+cash: 4700/)],
    });
  });

  it('catches input mutation even when the rejection code is correct', () => {
    const scenario = makeFixtureScenario();
    const execute: ScenarioProvider['execute'] = (state) => {
      state.random.state = 999;
      return { ok: false, error: { code: 'INVALID_PHASE', message: 'Rejected' } };
    };

    const report = runScenario({ name: 'mutates-on-reject', kind: 'test', execute }, scenario);

    expect(report.passed).toBe(false);
    expect(report.steps[0]?.failures[0]).toContain('Executor mutated its input state.');
    expect(report.steps[0]?.failures[0]).toContain('state: 999');
    expect(scenario.initialState.random.state).toBe(123);
  });

  it('reports unexpected success and incorrect rejection codes', () => {
    const scenario = makeFixtureScenario();
    const success: ScenarioProvider['execute'] = () => ({ ok: true, nextState: makeReviewDay1(), notices: [] });
    const rejection: ScenarioProvider['execute'] = () => ({ ok: false, error: { code: 'INVALID_CHOICE', message: 'Wrong code' } });

    const accepted = runScenario({ name: 'accepts-invalid', kind: 'test', execute: success }, scenario);
    const rejected = runScenario({ name: 'wrong-code', kind: 'test', execute: rejection }, scenario);

    expect(accepted).toMatchObject({ passed: false, steps: [{ failures: ['Expected rejection INVALID_PHASE, received success.'] }] });
    expect(rejected).toMatchObject({ passed: false, steps: [{ errorCode: 'INVALID_CHOICE' }] });
    expect(rejected.steps[0]?.failures[0]).toContain('INVALID_PHASE');
  });

  it('reports executor exceptions with the failing command and checkpoint', () => {
    const execute: ScenarioProvider['execute'] = () => { throw new Error('Injected executor failure'); };
    const report = runScenario({ name: 'throws', kind: 'test', execute }, makeSingleStep());

    expect(report).toMatchObject({
      passed: false,
      steps: [{
        commandIndex: 0,
        command: { type: 'EXECUTE_DAY' },
        outcome: 'threw',
        before: { day: 1, phase: 'planning', revision: 0 },
        after: { day: 1, phase: 'planning', revision: 0 },
        failures: ['Executor threw: Injected executor failure'],
      }],
    });
  });
});
