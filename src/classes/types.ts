import type { Ability, Effect } from '@/effects/types';

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
  /**
   * Efeitos passivos sempre ativos da classe (ex.: o stack de risco do Portador
   * de Cinza, a mitigação inata do Guardião do Bastião) — mesmo vocabulário de
   * efeitos das habilidades, tipicamente via `Trigger`. Array vazio para classes
   * cuja identidade já é totalmente carregada pelas 3 habilidades.
   */
  passives: Effect[];
  abilities: [Ability, Ability, Ability]; // uma por tier: controle, saturacao, ruptura
  evolutions: [ClassEvolution, ClassEvolution, ClassEvolution];
}
