import type { ActivityId } from './ids';

/** Display data from the same eligibility rules that validate commands. */
export interface ActivityOption {
  readonly id: ActivityId;
  readonly name: string;
  readonly description: string;
  readonly available: boolean;
  readonly unavailableReason: string | null;
  readonly cashCost: number;
  readonly effectLabels: readonly string[];
}
