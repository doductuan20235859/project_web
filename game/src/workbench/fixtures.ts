import type { GameState } from '../domain/model/game-state';
import {
  makeExhaustedPlanning,
  makePendingEvent,
  makePlanningDay1,
  makePlanningDay2,
  makePoorPlanning,
  makeReviewDay1,
} from '../testing/day-fixtures';

export const workbenchFixtures = [
  { id: 'planning-day-1', label: 'Planning · ngày 1', create: makePlanningDay1 },
  { id: 'review-day-1', label: 'Review · ngày 1', create: makeReviewDay1 },
  { id: 'planning-day-2', label: 'Planning · ngày 2', create: makePlanningDay2 },
  { id: 'poor-planning', label: 'Planning · thiếu tiền', create: makePoorPlanning },
  { id: 'exhausted-planning', label: 'Planning · kiệt sức', create: makeExhaustedPlanning },
  { id: 'pending-event', label: 'Event · đang chờ lựa chọn', create: makePendingEvent },
] as const satisfies readonly { id: string; label: string; create: () => GameState }[];

export type WorkbenchFixtureId = (typeof workbenchFixtures)[number]['id'];

export function isWorkbenchFixtureId(value: string): value is WorkbenchFixtureId {
  return workbenchFixtures.some((fixture) => fixture.id === value);
}

export function createWorkbenchFixture(id: WorkbenchFixtureId): GameState {
  const fixture = workbenchFixtures.find((item) => item.id === id);
  if (!fixture) throw new Error(`Không tìm thấy fixture: ${id}`);
  return fixture.create();
}
