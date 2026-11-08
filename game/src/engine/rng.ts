import { GameValidationError } from '../domain/errors';
import type { RandomState } from '../domain/model/game-state';

export function createRandomState(seed: number): RandomState {
  if (!Number.isSafeInteger(seed) || seed < 0 || seed > 0xffff_ffff) {
    throw new GameValidationError('INVALID_SEED', 'Seed phải là số nguyên không dấu 32 bit.');
  }
  return { seed, state: seed, algorithm: 'mulberry32-v1' };
}

/** Mulberry32: returns a new snapshot and a value in [0, 1), without mutating input. */
export function nextRandom(random: Readonly<RandomState>): { value: number; random: RandomState } {
  if (random.algorithm !== 'mulberry32-v1') {
    throw new GameValidationError('INVALID_STATE', 'Thuật toán RNG chưa được hỗ trợ.');
  }
  createRandomState(random.seed);
  createRandomState(random.state);
  const nextState = (random.state + 0x6d2b79f5) >>> 0;
  let value = Math.imul(nextState ^ (nextState >>> 15), nextState | 1);
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
  return {
    value: ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296,
    random: { seed: random.seed, state: nextState, algorithm: random.algorithm },
  };
}
