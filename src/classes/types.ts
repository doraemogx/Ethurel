import type { Ability } from '@/effects/types';

export interface Attrs {
  vigor: number;
  reflexo: number;
  mente: number;
  presenca: number;
}

export interface ClassEvolution {
  id: string;
  name: string;
  description: string;
}

export interface ClassDefinition {
  id: string;
  name: string;
  tagline: string;
  concept: string;
  combatStyle: string;
  role: string;
  mainAttrs: (keyof Attrs)[];
  difficulty: 1 | 2 | 3;
  strengths: string;
  weaknesses: string;
  arcaneAffinity: string;
  /** Multiplica o ganho de Tensão ao usar habilidades desta classe. */
  tensionMult: number;
  /** Multiplica o ganho de Marca Arcana ao cruzar para Ruptura. */
  markMult: number;
  baseAttrs: Attrs;
  /** Descrição textual dos itens iniciais — vira referência a Item.id real na Fase 4. */
  startingItems: string[];
  abilities: [Ability, Ability, Ability]; // uma por tier: controle, saturacao, ruptura
  evolutions: [ClassEvolution, ClassEvolution, ClassEvolution];
}
