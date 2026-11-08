import { contentRegistry } from '../src/content/registry';
import { validateContent } from '../src/content/validate';

const issues = validateContent(contentRegistry);
if (issues.length > 0) {
  console.error('Nội dung bộ khung không hợp lệ:\n' + issues.map((issue) => `- ${issue}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log(
    `Nội dung ${contentRegistry.version} hợp lệ: ${contentRegistry.backgrounds.length} hoàn cảnh, ` +
      `${contentRegistry.goals.length} mục tiêu, ${contentRegistry.npcs.length} NPC.`,
  );
}
