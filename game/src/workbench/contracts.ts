import type { ReactNode } from 'react';
import type { DayActions } from '../application/ports/day-actions';
import type { ActivityOption } from '../domain/model/day-view';
import type { GameState } from '../domain/model/game-state';

export type WorkbenchStatus = 'ready' | 'saving' | 'error';
export type WorkbenchSaveMode = 'success' | 'hold' | 'failure';

/** UI adapters can consume this context without importing a session or database. */
export interface DayWorkbenchContext {
  state: Readonly<GameState>;
  activityOptions: readonly ActivityOption[];
  status: WorkbenchStatus;
  error: string | null;
  actions: DayActions;
}

/** Add the real feature components here after the UI job implements them. */
export interface DayWorkbenchSlots {
  activityPanel?: (context: DayWorkbenchContext) => ReactNode;
  dayReview?: (context: DayWorkbenchContext) => ReactNode;
}
