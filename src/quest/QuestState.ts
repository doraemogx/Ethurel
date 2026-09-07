import type { QuestProgressState, SaveDataV4 } from '@/save/schema';

export function getQuestState(save: SaveDataV4, questId: string): QuestProgressState {
  return save.quests[questId] ?? 'not_started';
}

export function setQuestState(save: SaveDataV4, questId: string, state: QuestProgressState): void {
  save.quests[questId] = state;
}
