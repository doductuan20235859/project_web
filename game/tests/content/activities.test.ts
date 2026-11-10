import { describe, expect, it } from 'vitest';
import { activities } from '../../src/content/gameplay/activities';
import { validateActivityBasics } from '../../src/content/gameplay/validate-activities';
import type { ActivityDefinition } from '../../src/domain/model/day-rules';

function findActivity(id: string): ActivityDefinition {
  const activity = activities.find((item) => item.id === id);
  if (!activity) throw new Error(`Missing activity ${id}`);
  return activity;
}

describe('draft activity catalog for issue #2', () => {
  it('keeps rest free, learning useful and overtime separate from cash', () => {
    expect(validateActivityBasics(activities)).toEqual([]);
    const rest = findActivity('rest');
    expect(rest).toMatchObject({ cashCost: 0, minimumEnergy: 0, isOvertime: false });
    expect(rest.effects.energyDelta).toBeGreaterThan(0);
    expect(rest.effects.stressDelta).toBeLessThan(0);
    expect(findActivity('study').effects.japaneseXpDelta).toBeGreaterThan(0);
    const overtime = findActivity('overtime');
    expect(overtime.isOvertime).toBe(true);
    expect(overtime.effects.unpaidWagesDelta).toBeGreaterThan(0);
    expect(overtime.effects.energyDelta).toBeLessThan(0);
  });

  it('reports invalid or duplicate IDs without modifying the input', () => {
    const rest = findActivity('rest');
    const invalid = [rest, { ...rest }, { ...rest, id: '' }, { ...rest, id: ' study ' }];
    const before = structuredClone(invalid);
    const issues = validateActivityBasics(invalid);
    for (const index of [1, 2, 3]) {
      expect(issues.some((issue) => issue.startsWith(`activities[${index}].id:`))).toBe(true);
    }
    expect(invalid).toEqual(before);
  });

  it('accepts valid boundaries and rejects invalid prices or energy requirements', () => {
    const study = findActivity('study');
    for (const minimumEnergy of [0, 100]) {
      expect(validateActivityBasics([{ ...study, cashCost: 0, minimumEnergy }])).toEqual([]);
    }
    for (const cashCost of [-1, 0.5, Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER + 1]) {
      expect(validateActivityBasics([{ ...study, cashCost }]).some((issue) => issue.includes('.cashCost:'))).toBe(true);
    }
    for (const minimumEnergy of [-1, 101, 0.5, Number.NaN]) {
      expect(validateActivityBasics([{ ...study, minimumEnergy }]).some((issue) => issue.includes('.minimumEnergy:'))).toBe(true);
    }
  });

  it('accepts signed integer effects but catches malformed or missing effect values', () => {
    const study = findActivity('study');
    expect(validateActivityBasics([{ ...study, effects: { ...study.effects, energyDelta: -5 } }])).toEqual([]);
    for (const japaneseXpDelta of [Number.NaN, Number.POSITIVE_INFINITY, 0.5, Number.MAX_SAFE_INTEGER + 1]) {
      const invalid = { ...study, effects: { ...study.effects, japaneseXpDelta } };
      expect(validateActivityBasics([invalid]).some((issue) => issue.includes('.effects.japaneseXpDelta:'))).toBe(true);
    }
    const missingEffect = structuredClone(study);
    Reflect.deleteProperty(missingEffect.effects, 'healthDelta');
    expect(validateActivityBasics([missingEffect]).some((issue) => issue.includes('.effects.healthDelta:'))).toBe(true);
  });
});
