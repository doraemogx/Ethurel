import type { Ability } from '@/effects/types';
import type { ArcaneZone } from '@/arcane/zone';

export interface EnemyStats {
  hp: number;
  atk: number;
  def: number;
}

export interface EnemyAnimations {
  idle: string;
  attack: string;
  hit: string;
  death: string;
}

export interface LootEntry {
  itemId: string;
  chance: number; // 0..1
}

export type EnemyBehavior = 'agressivo' | 'defensivo' | 'oportunista' | 'suporte';

export interface Enemy {
  id: string;
  name: string;
  family: string;
  level: number;
  stats: EnemyStats;
  abilities: Ability[];
  behavior: EnemyBehavior;
  resistances?: string[];
  weaknesses?: string[];
  lootTable: LootEntry[];
  xp: number;
  arcaneAffinity?: 'nenhuma' | ArcaneZone;
  sprite: string;
  animations: EnemyAnimations;
}
