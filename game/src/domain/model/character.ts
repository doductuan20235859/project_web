import type { AvatarId, BackgroundId, GoalId } from './ids';

export interface CharacterConfig {
  name: string;
  avatarId: AvatarId;
  backgroundId: BackgroundId;
  goalId: GoalId;
}

export interface CharacterState extends CharacterConfig {
  energy: number;
  health: number;
  stress: number;
  japaneseXp: number;
}
