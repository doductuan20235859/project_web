import type { ChoiceId, EventId, NpcId } from './ids';

export interface ActiveEventInstance {
  id: string;
  eventId: EventId;
  contentVersion: string;
  day: number;
  parameters: Record<string, string | number | boolean>;
  snapshot: {
    title: string;
    description: string;
    choices: Array<{ id: ChoiceId; label: string }>;
  };
}

export interface StoryHistoryEntry {
  instanceId: string;
  eventId: EventId;
  day: number;
  choiceId: ChoiceId;
}

export interface PromiseState {
  id: string;
  npcId: NpcId;
  dueDay: number;
  status: 'pending' | 'fulfilled' | 'broken';
}

export interface ScheduledConsequence {
  id: string;
  eventId: EventId;
  dueDay: number;
  status: 'pending' | 'resolved';
}

export interface StoryState {
  flags: Record<string, boolean>;
  history: StoryHistoryEntry[];
  promises: PromiseState[];
  scheduledConsequences: ScheduledConsequence[];
  cooldowns: Record<string, number>;
}
