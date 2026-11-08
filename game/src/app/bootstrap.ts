import { GameSession } from '../application/game-session';
import { contentRegistry } from '../content/registry';
import { IndexedDbSaveRepository } from '../infrastructure/persistence/indexeddb-save-repository';

export const gameSession = new GameSession(new IndexedDbSaveRepository(), contentRegistry);
