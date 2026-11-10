import type { EngineResult, GameCommand } from '../../domain/model/command';
import type { ActivityOption } from '../../domain/model/day-view';
import type { GameState } from '../../domain/model/game-state';

/** Bootstrap binds the actual engine and its content; the session owns saving. */
export type CommandExecutor = (
  state: Readonly<GameState>,
  command: GameCommand,
) => EngineResult;

export type ActivityOptionsProvider = (
  state: Readonly<GameState>,
) => readonly ActivityOption[];
