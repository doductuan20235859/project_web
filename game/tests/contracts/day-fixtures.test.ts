import { describe, expect, it } from 'vitest';
import type { SaveEnvelope } from '../../src/application/ports/save-repository';
import { assertGameState } from '../../src/domain/invariants';
import type { GameState } from '../../src/domain/model/game-state';
import { parseSaveEnvelope } from '../../src/infrastructure/persistence/save-schema';
import {
  fixtureActivityOptions,
  fixtureExecutor,
  makeExhaustedPlanning,
  makePendingEvent,
  makePlanningDay1,
  makePlanningDay2,
  makePoorPlanning,
  makeReviewDay1,
} from '../../src/testing/day-fixtures';

function envelope(state: GameState): SaveEnvelope {
  return { schemaVersion: 1, appVersion: '0.1.0', savedAt: '2026-11-09T00:00:00.000Z', state };
}

const factories = [
  makePlanningDay1,
  makeReviewDay1,
  makePlanningDay2,
  makePoorPlanning,
  makeExhaustedPlanning,
  makePendingEvent,
] as const;

describe('shared day fixtures stay inside the real schema-1 contract', () => {
  it.each(factories)('%s returns a JSON snapshot accepted by invariants and save parsing', (factory) => {
    const state = factory();
    expect(() => assertGameState(state)).not.toThrow();
    expect(JSON.parse(JSON.stringify(state))).toEqual(state);
    expect(parseSaveEnvelope(envelope(state)).state).toEqual(state);
  });

  it('keeps handwritten review values and the two-field DaySummary oracle stable', () => {
    const review = makeReviewDay1();
    expect(review.clock).toEqual({ day: 1, phase: 'review' });
    expect(review.meta.revision).toBe(1);
    expect(review.economy.cash).toBe(4_700);
    expect(review.economy.unpaidWages).toBe(1_000);
    expect(review.character).toMatchObject({ energy: 75, health: 91, stress: 21, japaneseXp: 15 });
    expect(Object.keys(review.turn.summary ?? {}).sort()).toEqual(['day', 'message']);
    expect(makePlanningDay2().turn).toEqual({ activityId: null, eventQueue: [], summary: null });
    expect(makePlanningDay2().clock).toEqual({ day: 2, phase: 'planning' });
  });

  it.each(factories)('%s creates independent nested objects on every call', (factory) => {
    const first = factory();
    const expected = factory();
    first.relationships.lan = 0;
    first.story.flags['mutated'] = true;
    first.economy.paidPayrollPeriods.push('mutated');
    first.journal.push({ id: 'mutated', day: 1, kind: 'system', message: 'mutated' });
    const event = first.turn.eventQueue[0];
    if (event) event.snapshot.choices.push({ id: 'mutated', label: 'mutated' });
    expect(factory()).toEqual(expected);
  });

  it('supplies locked options for poor/exhausted UI scenarios without consuming state', () => {
    const poor = makePoorPlanning();
    const before = structuredClone(poor);
    const paid = fixtureActivityOptions(poor).find((activity) => activity.id === 'fixture-study');
    expect(paid).toMatchObject({ available: false, cashCost: 200 });
    expect(paid?.unavailableReason).toBeTruthy();
    expect(fixtureActivityOptions(makeExhaustedPlanning()).find((activity) => activity.id === 'fixture-overtime')?.available).toBe(false);
    expect(poor).toEqual(before);
  });

  it('scripts a fixture-only transition and rejects production state or stale commands', () => {
    const planning = makePlanningDay1();
    const before = structuredClone(planning);
    const command = { type: 'EXECUTE_DAY', activityId: 'fixture-study', commandId: 'fixture-execute-day-1', expectedRevision: 0 } as const;
    const result = fixtureExecutor(planning, command);
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.error.message);
    expect(result.nextState).toEqual(makeReviewDay1());
    expect(planning).toEqual(before);
    expect(fixtureExecutor(result.nextState, command)).toMatchObject({ ok: false, error: { code: 'STALE_COMMAND' } });
    const production = makePlanningDay1();
    production.meta.contentVersion = '0.1.0';
    production.meta.rulesVersion = '0.1.0';
    expect(fixtureExecutor(production, command)).toMatchObject({ ok: false, error: { code: 'INVALID_PHASE' } });
  });
});
