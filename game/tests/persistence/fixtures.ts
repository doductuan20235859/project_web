import type { SaveEnvelope } from '../../src/application/ports/save-repository';
import { contentRegistry } from '../../src/content/registry';
import type { CharacterConfig } from '../../src/domain/model/character';
import { AVATAR_IDS, BACKGROUND_IDS, GOAL_IDS } from '../../src/domain/model/ids';
import { createGame } from '../../src/engine/create-game';

export const characterConfig: CharacterConfig = {
  name: 'Minh',
  avatarId: AVATAR_IDS[0],
  backgroundId: BACKGROUND_IDS[0],
  goalId: GOAL_IDS[0],
};

export function makeSave(): SaveEnvelope {
  return {
    schemaVersion: 1,
    appVersion: '0.1.0',
    savedAt: '2026-11-08T03:00:00.000Z',
    state: createGame(characterConfig, 123, 'run-test', contentRegistry),
  };
}

export function nextSave(current: SaveEnvelope): SaveEnvelope {
  const next = structuredClone(current);
  next.state.meta.revision += 1;
  next.state.meta.lastCommandId = `command-${next.state.meta.revision}`;
  next.state.economy.cash += 10;
  return next;
}
