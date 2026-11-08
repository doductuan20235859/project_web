import type { GameRuleError } from '../errors';
import type { ActivityId, ChoiceId } from './ids';
import type { GameState } from './game-state';

/** Reserved contracts: the scaffold does not execute day or story commands. */
export type GameCommand = {
  commandId: string;
  expectedRevision: number;
} & (
  | { type: 'EXECUTE_DAY'; activityId: ActivityId }
  | { type: 'CHOOSE_EVENT'; instanceId: string; choiceId: ChoiceId }
  | { type: 'ACK_DAY' }
);

export interface GameNotice {
  kind: 'info' | 'warning';
  message: string;
}

export type EngineResult =
  | { ok: true; nextState: GameState; notices: GameNotice[] }
  | { ok: false; error: GameRuleError };
