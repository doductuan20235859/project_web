import type { ActivityDefinition, DayEffects } from '../../domain/model/day-rules';

const effectKeys = [
  'energyDelta',
  'healthDelta',
  'stressDelta',
  'japaneseXpDelta',
  'unpaidWagesDelta',
] as const satisfies readonly (keyof DayEffects)[];

/** Basic checks for the typed catalog; this is not yet the complete DayRules validator. */
export function validateActivityBasics(catalog: readonly ActivityDefinition[]): string[] {
  const issues: string[] = [];
  const ids = new Set<string>();

  catalog.forEach((activity, index) => {
    const path = `activities[${index}]`;
    if (typeof activity.id !== 'string' || !activity.id.trim() || activity.id !== activity.id.trim()) {
      issues.push(`${path}.id: cần ID không rỗng và không có khoảng trắng đầu/cuối.`);
    } else {
      if (ids.has(activity.id)) issues.push(`${path}.id: ID trùng ${activity.id}.`);
      ids.add(activity.id);
    }

    if (!Number.isSafeInteger(activity.cashCost) || activity.cashCost < 0) {
      issues.push(`${path}.cashCost: phải là số nguyên JPY không âm và an toàn.`);
    }
    if (!Number.isSafeInteger(activity.minimumEnergy) || activity.minimumEnergy < 0 || activity.minimumEnergy > 100) {
      issues.push(`${path}.minimumEnergy: phải là số nguyên trong [0, 100].`);
    }
    for (const key of effectKeys) {
      if (!Number.isSafeInteger(activity.effects?.[key])) {
        issues.push(`${path}.effects.${key}: phải là số nguyên an toàn, có thể âm.`);
      }
    }
  });

  return issues;
}
