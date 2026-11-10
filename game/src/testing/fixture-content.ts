import { contentRegistry } from '../content/registry';
import type { ContentRegistry } from '../domain/model/content';
import type { GameplayContent } from '../domain/model/day-rules';

export const FIXTURE_CONTENT_VERSION = 'fixture-content-v1';
export const FIXTURE_RULES_VERSION = 'fixture-rules-v1';

const registry: ContentRegistry = {
  ...contentRegistry,
  version: FIXTURE_CONTENT_VERSION,
  rulesVersion: FIXTURE_RULES_VERSION,
  balance: {
    initial: {
      cash: 5_000,
      energy: 80,
      health: 90,
      stress: 20,
      japaneseXp: 10,
      trust: 40,
      relationships: { lan: 50, sato: 45, haru: 40, family: 60 },
    },
  },
};

/** Synthetic data for tests/workbench only; these are not production game rules. */
export const fixtureGameplayContent: GameplayContent = {
  registry,
  dayRules: {
    version: FIXTURE_RULES_VERSION,
    workDays: [1, 2],
    payrollDays: [30],
    basicShift: {
      energyDelta: -10,
      healthDelta: 0,
      stressDelta: 2,
      japaneseXpDelta: 0,
      unpaidWagesDelta: 1_000,
    },
    activities: [
      {
        id: 'fixture-rest',
        name: 'Nghỉ ngơi — mẫu',
        description: 'Dữ liệu mẫu để kiểm tra hoạt động miễn phí.',
        cashCost: 0,
        minimumEnergy: 0,
        isOvertime: false,
        effects: {
          energyDelta: 5,
          healthDelta: 0,
          stressDelta: -5,
          japaneseXpDelta: 0,
          unpaidWagesDelta: 0,
        },
      },
      {
        id: 'fixture-study',
        name: 'Học tiếng Nhật — mẫu',
        description: 'Dữ liệu mẫu để kiểm tra chi phí và lựa chọn bị khóa.',
        cashCost: 200,
        minimumEnergy: 20,
        isOvertime: false,
        effects: {
          energyDelta: -5,
          healthDelta: 0,
          stressDelta: 1,
          japaneseXpDelta: 5,
          unpaidWagesDelta: 0,
        },
      },
      {
        id: 'fixture-overtime',
        name: 'Làm thêm — mẫu',
        description: 'Dữ liệu mẫu để phân biệt làm thêm với ca làm cơ bản.',
        cashCost: 0,
        minimumEnergy: 40,
        isOvertime: true,
        effects: {
          energyDelta: -15,
          healthDelta: 0,
          stressDelta: 5,
          japaneseXpDelta: 0,
          unpaidWagesDelta: 500,
        },
      },
    ],
    endOfDay: {
      essentialCost: 100,
      sleep: {
        energyDelta: 10,
        healthDelta: 1,
        stressDelta: -2,
        japaneseXpDelta: 0,
        unpaidWagesDelta: 0,
      },
      exhaustion: { energyBelow: 20, healthLossChance: 0.25, healthLoss: 2 },
    },
  },
};
