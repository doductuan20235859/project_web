import { create } from 'zustand';
import type { GameState } from '../domain/model/game-state';

export type GameStatus = 'loading' | 'ready' | 'saving' | 'error';

export interface GameStoreState {
  state: GameState | null;
  status: GameStatus;
  error: string | null;
  hasLoaded: boolean;
}

export const useGameStore = create<GameStoreState>(() => ({
  state: null,
  status: 'loading',
  error: null,
  hasLoaded: false,
}));
