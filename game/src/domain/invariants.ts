import { GameValidationError } from './errors';
import type { GameState } from './model/game-state';
import { AVATAR_IDS, BACKGROUND_IDS, GOAL_IDS, NPC_IDS, isKnownId } from './model/ids';

/** Semantic validation after the persistence boundary has checked the shape. */
export function getGameStateIssues(state: GameState): string[] {
  const issues: string[] = [];
  const integer = (label: string, value: number, min = 0, max = Number.MAX_SAFE_INTEGER) => {
    if (!Number.isSafeInteger(value) || value < min || value > max) {
      issues.push(`${label} phải là số nguyên trong [${min}, ${max}].`);
    }
  };
  const unique = (label: string, values: readonly string[]) => {
    if (new Set(values).size !== values.length) issues.push(`${label} có ID trùng.`);
  };

  if (!state.meta.runId.trim()) issues.push('Thiếu runId.');
  if (!state.meta.rulesVersion.trim() || !state.meta.contentVersion.trim()) {
    issues.push('Thiếu phiên bản luật hoặc nội dung.');
  }
  integer('revision', state.meta.revision);
  integer('day', state.clock.day, 1, 30);
  if (!['planning', 'event', 'review', 'finished'].includes(state.clock.phase)) {
    issues.push('Phase không hợp lệ.');
  }
  const { character } = state;
  if (!character.name.trim() || character.name.length > 40) issues.push('Tên phải dài 1–40 ký tự.');
  if (!isKnownId(AVATAR_IDS, character.avatarId)) issues.push('Avatar không hợp lệ.');
  if (!isKnownId(BACKGROUND_IDS, character.backgroundId)) issues.push('Hoàn cảnh không hợp lệ.');
  if (!isKnownId(GOAL_IDS, character.goalId)) issues.push('Mục tiêu không hợp lệ.');
  for (const stat of ['energy', 'health', 'stress'] as const) integer(stat, character[stat], 0, 100);
  integer('japaneseXp', character.japaneseXp);
  integer('cash', state.economy.cash);
  integer('unpaidWages', state.economy.unpaidWages);
  integer('unpaidEssentialCosts', state.economy.unpaidEssentialCosts);
  unique('paidPayrollPeriods', state.economy.paidPayrollPeriods);
  unique('ledger', state.economy.ledger.map((entry) => entry.id));
  for (const entry of state.economy.ledger) {
    integer('ledger.day', entry.day, 1, state.clock.day);
    integer('ledger.amount', entry.amount);
  }
  for (const npcId of NPC_IDS) integer(`relationships.${npcId}`, state.relationships[npcId], 0, 100);
  if (Object.keys(state.relationships).some((id) => !isKnownId(NPC_IDS, id))) {
    issues.push('Quan hệ chứa NPC không hợp lệ.');
  }
  integer('work.trust', state.work.trust, 0, 100);
  for (const day of state.work.overtimeDays) integer('overtimeDays', day, 1, state.clock.day);
  if (new Set(state.work.overtimeDays).size !== state.work.overtimeDays.length) {
    issues.push('Một ngày làm thêm được ghi nhiều lần.');
  }
  integer('daysWithoutLivingMoney', state.counters.daysWithoutLivingMoney, 0, state.clock.day);
  integer('consecutiveExhaustedDays', state.counters.consecutiveExhaustedDays, 0, state.clock.day);
  integer('random.seed', state.random.seed, 0, 0xffff_ffff);
  integer('random.state', state.random.state, 0, 0xffff_ffff);
  if (state.random.algorithm !== 'mulberry32-v1') issues.push('Thuật toán RNG chưa được hỗ trợ.');
  unique('eventQueue', state.turn.eventQueue.map((event) => event.id));
  unique('promises', state.story.promises.map((promise) => promise.id));
  unique('scheduledConsequences', state.story.scheduledConsequences.map((item) => item.id));
  unique('journal', state.journal.map((entry) => entry.id));
  for (const promise of state.story.promises) {
    if (!isKnownId(NPC_IDS, promise.npcId)) issues.push('Lời hứa tham chiếu NPC không hợp lệ.');
    integer('promise.dueDay', promise.dueDay, 1);
  }
  for (const item of state.story.scheduledConsequences) integer('consequence.dueDay', item.dueDay, 1);
  for (const day of Object.values(state.story.cooldowns)) integer('cooldown.day', day, 1);
  for (const event of state.turn.eventQueue) {
    integer('event.day', event.day, 1, state.clock.day);
    if (event.contentVersion !== state.meta.contentVersion) issues.push('Event khác phiên bản nội dung.');
  }
  for (const item of state.story.history) integer('history.day', item.day, 1, state.clock.day);
  for (const item of state.journal) integer('journal.day', item.day, 1, state.clock.day);
  if (state.clock.phase === 'event' && state.turn.eventQueue.length === 0) {
    issues.push('Phase event phải có sự kiện đang chờ.');
  }
  if (state.clock.phase !== 'event' && state.turn.eventQueue.length > 0) {
    issues.push('Sự kiện đang chờ phải ở phase event.');
  }
  if (state.clock.phase === 'planning' && (state.turn.activityId !== null || state.turn.summary !== null)) {
    issues.push('Ngày đang lập kế hoạch chưa được thực hiện hoặc tổng kết.');
  }
  if (state.clock.phase === 'review' || state.clock.phase === 'finished') {
    if (state.turn.summary?.day !== state.clock.day) issues.push('Thiếu tổng kết đúng ngày.');
  }
  if (state.clock.phase === 'finished' && state.clock.day !== 30) {
    issues.push('MVP chỉ kết thúc ở ngày 30.');
  }
  return issues;
}

export function assertGameState(state: GameState): void {
  const issues = getGameStateIssues(state);
  if (issues.length > 0) throw new GameValidationError('INVALID_STATE', issues.join('\n'));
}
