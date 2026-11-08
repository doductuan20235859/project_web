import type { NamedDefinition } from '../domain/model/content';
import type { AvatarId } from '../domain/model/ids';

/** Asset IDs are stable; the scaffold renders simple local avatar illustrations. */
export const avatars = [
  { id: 'traveler-1', name: 'Người lữ hành 1', description: 'Mẫu đại diện thứ nhất.' },
  { id: 'traveler-2', name: 'Người lữ hành 2', description: 'Mẫu đại diện thứ hai.' },
  { id: 'traveler-3', name: 'Người lữ hành 3', description: 'Mẫu đại diện thứ ba.' },
] as const satisfies readonly NamedDefinition<AvatarId>[];
