import type { InitialBalance } from '../domain/model/content';

/** Scaffold values for previewing state, not a playtested economy or real-world data. */
export const initialBalance = {
  cash: 65_000,
  energy: 80,
  health: 85,
  stress: 20,
  japaneseXp: 0,
  trust: 40,
  relationships: { lan: 50, sato: 45, haru: 40, family: 60 },
} as const satisfies InitialBalance;
