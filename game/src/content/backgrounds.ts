import type { NamedDefinition } from '../domain/model/content';
import type { BackgroundId } from '../domain/model/ids';

export const backgrounds = [
  {
    id: 'ordinary',
    name: 'Gia đình bình thường',
    description: 'Bạn bắt đầu hành trình với mong muốn xây dựng cuộc sống ổn định.',
  },
  {
    id: 'family',
    name: 'Cải thiện kinh tế gia đình',
    description: 'Bạn mang theo hy vọng giúp gia đình có thêm điều kiện trong tương lai.',
  },
  {
    id: 'growth',
    name: 'Phát triển bản thân',
    description: 'Bạn muốn học tiếng Nhật, tích lũy kỹ năng và tìm hướng đi cho mình.',
  },
] as const satisfies readonly NamedDefinition<BackgroundId>[];
