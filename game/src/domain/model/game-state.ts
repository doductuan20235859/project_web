import type { CharacterState } from './character';
import type { ActivityId, NpcId } from './ids';
import type { ActiveEventInstance, StoryState } from './story-event';

export type DayPhase = 'planning' | 'event' | 'review' | 'finished';

export interface GameMeta {
  runId: string;
  revision: number;
  lastCommandId: string | null;
  rulesVersion: string;
  contentVersion: string;
}

export interface LedgerEntry {
  id: string;
  day: number;
  kind: 'wage-accrual' | 'payroll' | 'expense' | 'payment';
  amount: number;
  reason: string;
}

export interface EconomyState {
  cash: number;
  unpaidWages: number;
  unpaidEssentialCosts: number;
  paidPayrollPeriods: string[];
  ledger: LedgerEntry[];
}

export interface WorkState {
  trust: number;
  overtimeDays: number[];
}

export interface DaySummary {
  day: number;
  message: string;
}

export interface TurnState {
  activityId: ActivityId | null;
  eventQueue: ActiveEventInstance[];
  summary: DaySummary | null;
}

export interface GameCounters {
  daysWithoutLivingMoney: number;
  consecutiveExhaustedDays: number;
}

export interface RandomState {
  seed: number;
  state: number;
  algorithm: 'mulberry32-v1';
}

export interface JournalEntry {
  id: string;
  day: number;
  kind: 'milestone' | 'decision' | 'system';
  message: string;
}

export interface GameState {
  meta: GameMeta;
  clock: { day: number; phase: DayPhase };
  character: CharacterState;
  economy: EconomyState;
  relationships: Record<NpcId, number>;
  work: WorkState;
  story: StoryState;
  turn: TurnState;
  counters: GameCounters;
  random: RandomState;
  journal: JournalEntry[];
}
