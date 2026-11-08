import type { ContentRegistry } from '../domain/model/content';
import type { GameState } from '../domain/model/game-state';

export function selectJapaneseLevel(state: GameState): string {
  const xp = state.character.japaneseXp;
  if (xp >= 350) return 'Năng lực nâng cao';
  if (xp >= 220) return 'Thành thạo hơn';
  if (xp >= 120) return 'Giao tiếp công việc';
  if (xp >= 50) return 'Giao tiếp sinh hoạt';
  return 'Mới bắt đầu';
}

export function selectGoalLabel(state: GameState, content: ContentRegistry): string {
  return content.goals.find((goal) => goal.id === state.character.goalId)?.name ?? 'Chưa xác định';
}

export function selectBackgroundLabel(state: GameState, content: ContentRegistry): string {
  return content.backgrounds.find((background) => background.id === state.character.backgroundId)?.name ?? 'Chưa xác định';
}
