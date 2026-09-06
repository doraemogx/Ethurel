import type { Attrs } from '@/classes/types';
import type { IndoleState, ReputationState } from '@/social/indole';

export type Gender = 'homem' | 'mulher';

export type SkinTone = 'palida' | 'clara' | 'morena' | 'escura';
export type HairStyle = 'curto' | 'longo' | 'preso' | 'raspado';
export type HairColor = 'preto' | 'castanho' | 'louro' | 'grisalho' | 'ruivo' | 'branco';

/**
 * Cor de destaque do sigilo — paleta de Ethurel (docs/design/02-STACK-E-ARQUITETURA.md §8),
 * não neon/roxo genérico. É a cor de base do sigilo do personagem; durante o
 * jogo, a cor do sigilo passa a refletir a zona de Arcane atual (ver
 * `src/arcane/zone.ts`) — isto aqui é só a escolha visual de criação.
 */
export type SigilAccent = 'esmeralda' | 'ambar' | 'azul-noturno' | 'vermelho-profundo' | 'osso' | 'ardosia';

/**
 * Estrutura mínima e extensível de aparência para a vertical slice — apenas as
 * escolhas que já têm representação visual planejada (sprite/paleta/sigilo).
 * Não é um character creator completo; é o suficiente para a aparência
 * escolhida na criação ter um valor determinístico persistido no save.
 */
export interface CharacterAppearance {
  skinTone: SkinTone;
  hairStyle: HairStyle;
  hairColor: HairColor;
  sigilAccent: SigilAccent;
}

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
  appearance: CharacterAppearance;
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
