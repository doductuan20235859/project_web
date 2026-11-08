import type { GameState } from '../../domain/model/game-state';

export interface SaveEnvelope {
  schemaVersion: 1;
  appVersion: string;
  savedAt: string;
  state: GameState;
}

export interface SaveExpectation {
  runId: string;
  revision: number;
}

export interface SaveRepository {
  load(): Promise<SaveEnvelope | null>;
  loadBackup(): Promise<SaveEnvelope | null>;
  commit(candidate: SaveEnvelope, expected: SaveExpectation | null): Promise<void>;
}
