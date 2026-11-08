import { GameValidationError } from '../domain/errors';
import { assertGameState } from '../domain/invariants';
import type { CharacterConfig } from '../domain/model/character';
import type { ContentRegistry } from '../domain/model/content';
import type { GameState } from '../domain/model/game-state';
import { AVATAR_IDS, BACKGROUND_IDS, GOAL_IDS, isKnownId } from '../domain/model/ids';
import { createRandomState } from './rng';

/** Creates only the initial snapshot. Persistence and the UI are application concerns. */
export function createGame(
  config: CharacterConfig,
  seed: number,
  runId: string,
  content: ContentRegistry,
): GameState {
  const name = typeof config.name === 'string' ? config.name.trim() : '';
  if (!name || name.length > 40) {
    throw new GameValidationError('INVALID_CHARACTER', 'Tên nhân vật phải dài 1–40 ký tự.');
  }
  if (
    !isKnownId(AVATAR_IDS, config.avatarId) ||
    !isKnownId(BACKGROUND_IDS, config.backgroundId) ||
    !isKnownId(GOAL_IDS, config.goalId) ||
    !content.avatars.some((item) => item.id === config.avatarId) ||
    !content.backgrounds.some((item) => item.id === config.backgroundId) ||
    !content.goals.some((item) => item.id === config.goalId)
  ) {
    throw new GameValidationError('INVALID_CHARACTER', 'Lựa chọn nhân vật không có trong nội dung hiện tại.');
  }
  if (typeof runId !== 'string' || !runId.trim() || runId.length > 128) {
    throw new GameValidationError('INVALID_RUN_ID', 'runId phải dài 1–128 ký tự.');
  }

  const initial = content.balance.initial;
  const state: GameState = {
    meta: {
      runId,
      revision: 0,
      lastCommandId: null,
      rulesVersion: content.rulesVersion,
      contentVersion: content.version,
    },
    clock: { day: 1, phase: 'planning' },
    character: {
      name,
      avatarId: config.avatarId,
      backgroundId: config.backgroundId,
      goalId: config.goalId,
      energy: initial.energy,
      health: initial.health,
      stress: initial.stress,
      japaneseXp: initial.japaneseXp,
    },
    economy: {
      cash: initial.cash,
      unpaidWages: 0,
      unpaidEssentialCosts: 0,
      paidPayrollPeriods: [],
      ledger: [],
    },
    relationships: { ...initial.relationships },
    work: { trust: initial.trust, overtimeDays: [] },
    story: { flags: {}, history: [], promises: [], scheduledConsequences: [], cooldowns: {} },
    turn: { activityId: null, eventQueue: [], summary: null },
    counters: { daysWithoutLivingMoney: 0, consecutiveExhaustedDays: 0 },
    random: createRandomState(seed),
    journal: [],
  };
  assertGameState(state);
  return state;
}
