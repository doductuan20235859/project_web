import type { ContentRegistry } from './content';
import type { ActivityId } from './ids';

/** Signed changes. Wages accrue separately from the cash available to spend. */
export interface DayEffects {
  readonly energyDelta: number;
  readonly healthDelta: number;
  readonly stressDelta: number;
  readonly japaneseXpDelta: number;
  readonly unpaidWagesDelta: number;
}

export interface ActivityDefinition {
  readonly id: ActivityId;
  readonly name: string;
  readonly description: string;
  readonly cashCost: number;
  readonly minimumEnergy: number;
  readonly isOvertime: boolean;
  readonly effects: DayEffects;
}

export interface EndOfDayRules {
  readonly essentialCost: number;
  readonly sleep: DayEffects;
  readonly exhaustion: {
    readonly energyBelow: number;
    /** Probability in [0, 1], evaluated before sleep restores energy. */
    readonly healthLossChance: number;
    /** Nonnegative amount subtracted from health when the risk occurs. */
    readonly healthLoss: number;
  };
}

/**
 * One scheduled basic shift plus one optional activity per simulated day.
 * Overtime is an optional activity, not a second application of the basic shift.
 * This contract contains no production balance values or gameplay evaluator.
 */
export interface DayRules {
  readonly version: string;
  readonly workDays: readonly number[];
  readonly payrollDays: readonly number[];
  readonly basicShift: DayEffects;
  readonly activities: readonly ActivityDefinition[];
  readonly endOfDay: EndOfDayRules;
}

/** The initial-character registry remains usable without invented day rules. */
export interface GameplayContent {
  readonly registry: ContentRegistry;
  readonly dayRules: DayRules;
}
