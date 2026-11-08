import type { NamedDefinition } from '../domain/model/content';
import type { NpcId } from '../domain/model/ids';

/** Names and relationship examples come from the GDD; descriptions are draft copy. */
export const npcs = [
  { id: 'lan', name: 'Lan', description: 'Một người bạn Việt Nam trong hành trình.' },
  { id: 'sato', name: 'Sato', description: 'Một đồng nghiệp tại nơi làm việc.' },
  { id: 'haru', name: 'Haru', description: 'Một người bạn để cùng giao lưu và học hỏi.' },
  { id: 'family', name: 'Gia đình', description: 'Những người thân luôn gắn bó với bạn.' },
] as const satisfies readonly NamedDefinition<NpcId>[];
