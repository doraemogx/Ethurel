export type QuestStatus = 'desconhecida' | 'descoberta' | 'ativa' | 'concluida' | 'falhou';

export interface Objective {
  id: string;
  text: string;
  done: boolean;
}

export interface QuestReward {
  xp?: number;
  gold?: number;
  items?: string[];
  reputation?: { entity: string; delta: number }[];
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  giver: string;
  status: QuestStatus;
  objectives: Objective[];
  optionalObjectives?: Objective[];
  rewards?: QuestReward;
  consequences?: string[];
  prerequisites?: string[];
  discoveredAt?: number;
  completedAt?: number;
}
