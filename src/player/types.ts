import type { Attrs } from '@/classes/types';
import type { IndoleState, ReputationState } from '@/social/indole';

export type Gender = 'homem' | 'mulher';

export interface OriginDefinition {
  id: string;
  name: string;
  description: string;
  attrBonus: Partial<Attrs>;
  startingItem: string;
  /**
   * "Segredo"/gancho da origem. Os textos exatos de cada origem só existiam em
   * `ETUREL_CURRENT_SOURCE.html` (não anexado ao handoff) — os textos abaixo em
   * `src/data/origins.ts` são rascunho a confirmar contra a fonte original antes
   * de virarem cânone definitivo.
   */
  hook: string;
}

/**
 * Modelo de personagem. Passado/Princípio/Desejo/Medo/Limite são preservados
 * como campos (lore/modelo de dados) mas NÃO são obrigatórios na criação —
 * a criação (Revisão 2) é: gênero → nome → aparência básica → classe → origem
 * → jogar. Personalidade emerge de Índole durante o jogo, não de um formulário.
 */
export interface CharacterModel {
  name: string;
  gender: Gender;
  classId: string;
  originId: string;
  attrs: Attrs;
  hp: number;
  maxHp: number;
  arcaneFocus: number;
  arcaneMax: number;
  tension: number;
  marca: number;
  indole: IndoleState;
  reputation: ReputationState;
  gold: number;
  xp: number;
  level: number;
  inventory: string[]; // ids de Item (src/data/items.ts) — populado na Fase 4
  quests: string[]; // ids de Quest (src/data/quests.ts) — populado na Fase 4
  location: string; // id de nó do mapa

  // Preservados como conceito de lore/modelo, opcionais, não coletados na criação:
  past?: string;
  principle?: string;
  desire?: string;
  fear?: string;
  limit?: string;
}
