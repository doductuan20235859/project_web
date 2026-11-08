import type { AvatarId, BackgroundId, GoalId, NpcId } from './ids';

export interface NamedDefinition<TId extends string> {
  readonly id: TId;
  readonly name: string;
  readonly description: string;
}

export interface InitialBalance {
  readonly cash: number;
  readonly energy: number;
  readonly health: number;
  readonly stress: number;
  readonly japaneseXp: number;
  readonly trust: number;
  readonly relationships: Readonly<Record<NpcId, number>>;
}

export interface ContentRegistry {
  readonly version: string;
  readonly rulesVersion: string;
  readonly backgrounds: readonly NamedDefinition<BackgroundId>[];
  readonly goals: readonly NamedDefinition<GoalId>[];
  readonly avatars: readonly NamedDefinition<AvatarId>[];
  readonly npcs: readonly NamedDefinition<NpcId>[];
  readonly balance: { readonly initial: InitialBalance };
}
