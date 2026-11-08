import type { EventId, NpcId } from './ids';

export type StatId = 'energy' | 'health' | 'stress' | 'japaneseXp';
export type CompareOp = 'eq' | 'gt' | 'gte' | 'lt' | 'lte';
export type MetricRef =
  | { kind: 'stat'; stat: StatId }
  | { kind: 'cash' }
  | { kind: 'day' }
  | { kind: 'relationship'; npcId: NpcId }
  | { kind: 'counter'; counter: 'daysWithoutLivingMoney' | 'consecutiveExhaustedDays' };

export type Condition =
  | { kind: 'all'; items: Condition[] }
  | { kind: 'any'; items: Condition[] }
  | { kind: 'not'; item: Condition }
  | { kind: 'compare'; metric: MetricRef; op: CompareOp; value: number }
  | { kind: 'flag'; id: string; value: boolean }
  | { kind: 'eventSeen'; id: EventId };
