import { deepStrictEqual } from 'node:assert/strict';
import type { CommandExecutor } from '../../src/application/ports/command-executor';
import type { GameRuleError } from '../../src/domain/errors';
import type { EngineResult, GameCommand } from '../../src/domain/model/command';
import type { GameState } from '../../src/domain/model/game-state';

export interface ScenarioProvider {
  name: string;
  kind: 'fixture' | 'test' | 'production';
  execute: CommandExecutor;
}

export interface ScenarioStep {
  command: GameCommand;
  expect: { state: GameState } | { error: GameRuleError['code'] };
}

export interface Scenario {
  name: string;
  initialState: GameState;
  steps: readonly ScenarioStep[];
}

function checkpoint(state: GameState) {
  return { ...state.clock, revision: state.meta.revision };
}

interface StepReport {
  commandIndex: number;
  command: GameCommand;
  before: ReturnType<typeof checkpoint>;
  after: ReturnType<typeof checkpoint>;
  outcome: 'accepted' | 'rejected' | 'threw';
  errorCode: GameRuleError['code'] | null;
  failures: string[];
}

function compare(actual: unknown, expected: unknown, context: string, failures: string[]): void {
  try {
    deepStrictEqual(actual, expected);
  } catch (error) {
    failures.push(`${context}\n${error instanceof Error ? error.message : String(error)}`);
  }
}

function checkStep(provider: ScenarioProvider, state: GameState, step: ScenarioStep, commandIndex: number) {
  const original = structuredClone(state);
  const failures: string[] = [];
  let result: EngineResult | undefined;
  try {
    result = provider.execute(state, structuredClone(step.command));
  } catch (error) {
    failures.push(`Executor threw: ${error instanceof Error ? error.message : String(error)}`);
  }

  compare(state, original, 'Executor mutated its input state.', failures);
  if (result?.ok) {
    if ('state' in step.expect) {
      compare(result.nextState, step.expect.state, 'Next state differs from the expected snapshot.', failures);
    } else {
      failures.push(`Expected rejection ${step.expect.error}, received success.`);
    }
  } else if (result !== undefined) {
    if ('error' in step.expect) {
      compare(result.error.code, step.expect.error, 'Rejection code differs from the expected code.', failures);
    } else {
      failures.push(`Expected success, received ${result.error.code}: ${result.error.message}`);
    }
  }

  const nextState = result?.ok ? result.nextState : state;
  const report: StepReport = {
    commandIndex,
    command: step.command,
    before: checkpoint(original),
    after: checkpoint(nextState),
    outcome: result === undefined ? 'threw' : result.ok ? 'accepted' : 'rejected',
    errorCode: result?.ok === false ? result.error.code : null,
    failures,
  };
  return { nextState, report };
}

export function runScenario(provider: ScenarioProvider, scenario: Scenario) {
  let state = structuredClone(scenario.initialState);
  const steps: StepReport[] = [];
  for (const [commandIndex, step] of scenario.steps.entries()) {
    const { nextState, report } = checkStep(provider, state, step, commandIndex);
    steps.push(report);
    if (report.failures.length > 0) break;
    state = structuredClone(nextState);
  }

  return {
    scenario: scenario.name,
    provider: { name: provider.name, kind: provider.kind },
    seed: scenario.initialState.random.seed,
    passed: steps.every((step) => step.failures.length === 0),
    totalCommands: scenario.steps.length,
    steps,
  };
}
