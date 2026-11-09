import type { ActivityId } from '../../domain/model/ids';

export type DayActionResult = { ok: true } | { ok: false; message: string };

/**
 * A UI container binds these callbacks to its displayed state/revision.
 * The session keeps command IDs and revisions intact through queuing/retry.
 */
export interface DayActions {
  executeDay(activityId: ActivityId): Promise<DayActionResult>;
  acknowledgeDay(): Promise<DayActionResult>;
}
