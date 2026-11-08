import type { ContentRegistry } from '../domain/model/content';
import { avatars } from './avatars';
import { backgrounds } from './backgrounds';
import { initialBalance } from './balance';
import { goals } from './goals';
import { npcs } from './npcs';

export const contentRegistry: ContentRegistry = {
  version: '0.1.0',
  rulesVersion: '0.1.0',
  backgrounds,
  goals,
  avatars,
  npcs,
  balance: { initial: initialBalance },
};
