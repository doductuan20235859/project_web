import { describe, expect, it } from 'vitest';
import { contentRegistry } from '../../src/content/registry';
import type { CharacterConfig } from '../../src/domain/model/character';
import { BACKGROUND_IDS } from '../../src/domain/model/ids';
import { createGame } from '../../src/engine/create-game';
import { createRandomState, nextRandom } from '../../src/engine/rng';

const config: CharacterConfig = {
  name: '  Minh  ',
  avatarId: 'traveler-1',
  backgroundId: 'ordinary',
  goalId: 'family',
};

describe('game initialization contracts', () => {
  it('creates serializable identical snapshots and reproducible RNG without mutating input', () => {
    const first = createGame(config, 42, 'test-run', contentRegistry);
    const second = createGame(config, 42, 'test-run', contentRegistry);
    expect(first).toEqual(second);
    expect(JSON.parse(JSON.stringify(first))).toEqual(first);
    expect(first.character.name).toBe('Minh');
    expect(config.name).toBe('  Minh  ');

    const random = Object.freeze(createRandomState(42));
    const drawn = nextRandom(random);
    expect(nextRandom(random)).toEqual(drawn);
    expect(random.state).toBe(42);
    expect(drawn.value).toBeGreaterThanOrEqual(0);
    expect(drawn.value).toBeLessThan(1);
    expect(nextRandom(drawn.random)).not.toEqual(drawn);
  });

  it('keeps identical finances and stats across all three MVP backgrounds', () => {
    const baseline = createGame(config, 1, 'run', contentRegistry);
    for (const backgroundId of BACKGROUND_IDS) {
      const state = createGame({ ...config, backgroundId }, 1, 'run', contentRegistry);
      expect({ ...state.character, backgroundId: 'ordinary' }).toEqual(baseline.character);
      expect(state.economy).toEqual(baseline.economy);
      expect(state.relationships).toEqual(baseline.relationships);
      expect(state.clock).toEqual({ day: 1, phase: 'planning' });
    }
  });

  it('isolates mutable state between runs and rejects invalid initialization', () => {
    const first = createGame(config, 0, 'run-1', contentRegistry);
    const second = createGame(config, 0, 'run-2', contentRegistry);
    first.relationships.lan = 0;
    first.economy.paidPayrollPeriods.push('test');
    first.story.flags['test'] = true;
    expect(second.relationships.lan).toBe(50);
    expect(second.economy.paidPayrollPeriods).toEqual([]);
    expect(second.story.flags).toEqual({});
    expect(contentRegistry.balance.initial.relationships.lan).toBe(50);
    expect(() => createGame({ ...config, name: ' ' }, 0, 'run', contentRegistry)).toThrow();
    expect(() => createGame(config, -1, 'run', contentRegistry)).toThrow();
    expect(() => createGame(config, 1, '', contentRegistry)).toThrow();
  });
});
