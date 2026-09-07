import type { QuestProgressState, SaveDataV5 } from '@/save/schema';

export function getQuestState(save: SaveDataV5, questId: string): QuestProgressState {
  return save.quests[questId] ?? 'not_started';
}

export function setQuestState(save: SaveDataV5, questId: string, state: QuestProgressState): void {
  save.quests[questId] = state;
}
