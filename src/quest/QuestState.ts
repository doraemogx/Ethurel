import type { QuestProgressState, SaveDataV6 } from '@/save/schema';

export function getQuestState(save: SaveDataV6, questId: string): QuestProgressState {
  return save.quests[questId] ?? 'not_started';
}

export function setQuestState(save: SaveDataV6, questId: string, state: QuestProgressState): void {
  save.quests[questId] = state;
}
