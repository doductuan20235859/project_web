import type { ActivityDefinition } from '../../domain/model/day-rules';

/** Draft balance for issue #2. These optional activities do not include the basic work shift. */
export const activities: readonly ActivityDefinition[] = [
  {
    id: 'rest',
    name: 'Nghỉ ngơi',
    description: 'Dành thời gian ngoài ca để phục hồi và giảm căng thẳng.',
    cashCost: 0,
    minimumEnergy: 0,
    isOvertime: false,
    effects: {
      energyDelta: 18,
      healthDelta: 1,
      stressDelta: -8,
      japaneseXpDelta: 0,
      unpaidWagesDelta: 0,
    },
  },
  {
    id: 'study',
    name: 'Học tiếng Nhật',
    description: 'Dành một buổi học có phí để cải thiện khả năng giao tiếp.',
    cashCost: 300,
    minimumEnergy: 15,
    isOvertime: false,
    effects: {
      energyDelta: -8,
      healthDelta: 0,
      stressDelta: 1,
      japaneseXpDelta: 3,
      unpaidWagesDelta: 0,
    },
  },
  {
    id: 'overtime',
    name: 'Làm thêm',
    description: 'Nhận thêm việc ngoài ca cơ bản, đổi thể lực lấy lương chờ nhận.',
    cashCost: 0,
    minimumEnergy: 35,
    isOvertime: true,
    effects: {
      energyDelta: -18,
      healthDelta: 0,
      stressDelta: 7,
      japaneseXpDelta: 0,
      unpaidWagesDelta: 2_500,
    },
  },
];
