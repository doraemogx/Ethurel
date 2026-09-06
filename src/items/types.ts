import type { Effect } from '@/effects/types';

export type ItemCategory =
  | 'arma'
  | 'armadura'
  | 'acessorio'
  | 'consumivel'
  | 'material'
  | 'questItem'
  | 'artefato';

export type ItemRarity = 'comum' | 'incomum' | 'raro' | 'artefato';

export interface Item {
  id: string;
  name: string;
  category: ItemCategory;
  rarity: ItemRarity;
  stats?: Partial<{ atk: number; def: number; hp: number; arcaneFocus: number }>;
  effects?: Effect[];
  classRestriction?: string[];
  requirements?: { level?: number };
  spriteKey: string;
  description: string;
  value: number;
}
