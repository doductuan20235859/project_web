import { GameValidationError } from '../domain/errors';
import type { ContentRegistry, NamedDefinition } from '../domain/model/content';
import { AVATAR_IDS, BACKGROUND_IDS, GOAL_IDS, NPC_IDS } from '../domain/model/ids';

/** Validates the registry included in this build; JSON imports will also need shape parsing. */
export function validateContent(content: ContentRegistry): string[] {
  const issues: string[] = [];
  function checkDefinitions(
    label: string,
    definitions: readonly NamedDefinition<string>[],
    requiredIds: readonly string[],
  ) {
    const ids = definitions.map((definition) => definition.id);
    if (new Set(ids).size !== ids.length) issues.push(`${label}: ID trùng.`);
    for (const id of requiredIds) {
      if (!ids.includes(id)) issues.push(`${label}: thiếu ID ${id}.`);
    }
    for (const item of definitions) {
      if (!requiredIds.includes(item.id)) issues.push(`${label}: ID không hỗ trợ ${item.id}.`);
      if (!item.name.trim() || !item.description.trim()) issues.push(`${label}/${item.id}: thiếu nội dung.`);
    }
  }
  if (!content.version.trim() || !content.rulesVersion.trim()) issues.push('Thiếu phiên bản nội dung/luật.');
  checkDefinitions('backgrounds', content.backgrounds, BACKGROUND_IDS);
  checkDefinitions('goals', content.goals, GOAL_IDS);
  checkDefinitions('avatars', content.avatars, AVATAR_IDS);
  checkDefinitions('npcs', content.npcs, NPC_IDS);

  const { initial } = content.balance;
  for (const metric of ['energy', 'health', 'stress', 'trust'] as const) {
    const value = initial[metric];
    if (!Number.isSafeInteger(value) || value < 0 || value > 100) {
      issues.push(`balance.initial.${metric}: phải nằm trong [0, 100].`);
    }
  }
  for (const metric of ['cash', 'japaneseXp'] as const) {
    if (!Number.isSafeInteger(initial[metric]) || initial[metric] < 0) {
      issues.push(`balance.initial.${metric}: phải là số nguyên không âm an toàn.`);
    }
  }
  for (const npcId of NPC_IDS) {
    const value = initial.relationships[npcId];
    if (!Number.isSafeInteger(value) || value < 0 || value > 100) {
      issues.push(`balance.initial.relationships.${npcId}: phải nằm trong [0, 100].`);
    }
  }
  if (Object.keys(initial.relationships).some((id) => !NPC_IDS.some((npcId) => npcId === id))) {
    issues.push('balance.initial.relationships: chứa NPC không hỗ trợ.');
  }
  return issues;
}

export function assertValidContent(content: ContentRegistry): void {
  const issues = validateContent(content);
  if (issues.length > 0) throw new GameValidationError('INVALID_CONTENT', issues.join('\n'));
}
