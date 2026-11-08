export const MVP_DAY_COUNT = 30;

export function isMvpDay(day: number): boolean {
  return Number.isSafeInteger(day) && day >= 1 && day <= MVP_DAY_COUNT;
}

/** Weeks are simulation weeks; the device timezone does not affect them. */
export function getWeekIndex(day: number): number {
  if (!Number.isSafeInteger(day) || day < 1) {
    throw new RangeError('Ngày mô phỏng phải là số nguyên dương.');
  }
  return Math.floor((day - 1) / 7);
}
