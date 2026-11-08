import type { NamedDefinition } from '../domain/model/content';
import type { GoalId } from '../domain/model/ids';

export const goals = [
  {
    id: 'family',
    name: 'Kiếm tiền cho gia đình',
    description: 'Hướng tới khả năng tiết kiệm và hỗ trợ người thân một cách bền vững.',
  },
  {
    id: 'career',
    name: 'Phát triển sự nghiệp',
    description: 'Ưu tiên học hỏi, tiếng Nhật và những cơ hội nghề nghiệp về sau.',
  },
  {
    id: 'experience',
    name: 'Trải nghiệm cuộc sống',
    description: 'Tìm sự cân bằng giữa sức khỏe, học hỏi và các mối quan hệ.',
  },
] as const satisfies readonly NamedDefinition<GoalId>[];
