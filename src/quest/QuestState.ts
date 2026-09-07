import type { QuestProgressState, SaveDataV3 } from '@/save/schema';

export function getQuestState(save: SaveDataV3, questId: string): QuestProgressState {
  return save.quests[questId] ?? 'not_started';
}

export function setQuestState(save: SaveDataV3, questId: string, state: QuestProgressState): void {
  save.quests[questId] = state;
}
