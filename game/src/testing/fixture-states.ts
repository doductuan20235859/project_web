import type { GameState } from '../domain/model/game-state';
import { FIXTURE_CONTENT_VERSION, FIXTURE_RULES_VERSION } from './fixture-content';

/** Fresh handwritten schema-1 snapshots. No gameplay engine computes these oracles. */
export function makePlanningDay1(): GameState {
  return {
    meta: {
      runId: 'fixture-run',
      revision: 0,
      lastCommandId: null,
      rulesVersion: FIXTURE_RULES_VERSION,
      contentVersion: FIXTURE_CONTENT_VERSION,
    },
    clock: { day: 1, phase: 'planning' },
    character: {
      name: 'Minh — mẫu kiểm thử',
      avatarId: 'traveler-1',
      backgroundId: 'ordinary',
      goalId: 'career',
      energy: 80,
      health: 90,
      stress: 20,
      japaneseXp: 10,
    },
    economy: {
      cash: 5_000,
      unpaidWages: 0,
      unpaidEssentialCosts: 0,
      paidPayrollPeriods: [],
      ledger: [],
    },
    relationships: { lan: 50, sato: 45, haru: 40, family: 60 },
    work: { trust: 40, overtimeDays: [] },
    story: { flags: {}, history: [], promises: [], scheduledConsequences: [], cooldowns: {} },
    turn: { activityId: null, eventQueue: [], summary: null },
    counters: { daysWithoutLivingMoney: 0, consecutiveExhaustedDays: 0 },
    random: { seed: 123, state: 123, algorithm: 'mulberry32-v1' },
    journal: [],
  };
}

export function makeReviewDay1(): GameState {
  const state = makePlanningDay1();
  state.meta.revision = 1;
  state.meta.lastCommandId = 'fixture-execute-day-1';
  state.clock.phase = 'review';
  state.character.energy = 75;
  state.character.health = 91;
  state.character.stress = 21;
  state.character.japaneseXp = 15;
  state.economy.cash = 4_700;
  state.economy.unpaidWages = 1_000;
  state.economy.ledger = [
    { id: 'fixture-wage-1', day: 1, kind: 'wage-accrual', amount: 1_000, reason: 'Ca làm mẫu' },
    { id: 'fixture-study-1', day: 1, kind: 'expense', amount: 200, reason: 'Học mẫu' },
    { id: 'fixture-essential-1', day: 1, kind: 'expense', amount: 100, reason: 'Sinh hoạt mẫu' },
  ];
  state.turn.activityId = 'fixture-study';
  state.turn.summary = {
    day: 1,
    message: 'KẾT QUẢ MẪU: học +5 XP; tiền mặt −300 JPY; lương chờ nhận +1.000 JPY; thể lực −5. Đây là snapshot kiểm thử, chưa phải gameplay.',
  };
  state.journal = [{
    id: 'fixture-journal-1',
    day: 1,
    kind: 'system',
    message: 'Kết quả ngày 1 được viết sẵn cho kiểm thử giao diện và save schema 1.',
  }];
  return state;
}

export function makePlanningDay2(): GameState {
  const state = makeReviewDay1();
  state.meta.revision = 2;
  state.meta.lastCommandId = 'fixture-ack-day-1';
  state.clock = { day: 2, phase: 'planning' };
  state.turn = { activityId: null, eventQueue: [], summary: null };
  return state;
}

export function makePoorPlanning(): GameState {
  const state = makePlanningDay1();
  state.economy.cash = 0;
  return state;
}

export function makeExhaustedPlanning(): GameState {
  const state = makePlanningDay1();
  state.character.energy = 19;
  return state;
}

export function makePendingEvent(): GameState {
  const state = makePlanningDay1();
  state.meta.revision = 1;
  state.meta.lastCommandId = 'fixture-open-event';
  state.clock.phase = 'event';
  state.turn.activityId = 'fixture-study';
  state.turn.eventQueue = [{
    id: 'fixture-event-1',
    eventId: 'fixture-invitation',
    contentVersion: FIXTURE_CONTENT_VERSION,
    day: 1,
    parameters: { npc: 'lan' },
    snapshot: {
      title: 'Lời mời — mẫu kiểm thử',
      description: 'Sự kiện viết sẵn để kiểm tra việc hiển thị và lưu event đang chờ.',
      choices: [
        { id: 'continue', label: 'Tiếp tục trong bản mẫu' },
        { id: 'decline', label: 'Từ chối trong bản mẫu' },
      ],
    },
  }];
  return state;
}
