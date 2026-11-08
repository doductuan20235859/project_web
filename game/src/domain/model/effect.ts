import type { StatId } from './condition';
import type { EventId, NpcId } from './ids';
import type { PromiseState } from './story-event';

/** Contracts for the later gameplay stage; no effect evaluator exists yet. */
export type Effect =
  | { kind: 'statDelta'; stat: StatId; amount: number }
  | { kind: 'cashDelta'; amount: number; reason: string }
  | { kind: 'accrueWages'; amount: number }
  | { kind: 'relationshipDelta'; npcId: NpcId; amount: number }
  | { kind: 'setFlag'; id: string; value: boolean }
  | { kind: 'scheduleEvent'; eventId: EventId; afterDays: number }
  | { kind: 'createPromise'; promise: PromiseState };
