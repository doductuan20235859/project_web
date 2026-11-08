export const BACKGROUND_IDS = ['ordinary', 'family', 'growth'] as const;
export const GOAL_IDS = ['family', 'career', 'experience'] as const;
export const AVATAR_IDS = ['traveler-1', 'traveler-2', 'traveler-3'] as const;
export const NPC_IDS = ['lan', 'sato', 'haru', 'family'] as const;

export type BackgroundId = (typeof BACKGROUND_IDS)[number];
export type GoalId = (typeof GOAL_IDS)[number];
export type AvatarId = (typeof AVATAR_IDS)[number];
export type NpcId = (typeof NPC_IDS)[number];
export type ActivityId = string;
export type EventId = string;
export type ChoiceId = string;

export function isKnownId<const T extends readonly string[]>(
  ids: T,
  value: unknown,
): value is T[number] {
  return typeof value === 'string' && ids.some((id) => id === value);
}
