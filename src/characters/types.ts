import type { Attrs } from '@/classes/types';
import type { IndoleState, ReputationState } from '@/social/indole';

export type Gender = 'homem' | 'mulher';

export interface OriginDefinition {
  id: string;
  name: string;
  description: string;
  attrBonus: Partial<Attrs>;
  startingItem: string;
  /** "Segredo"/gancho da origem — rascunho a confirmar contra a fonte original antes de virar cânone definitivo. */
  hook: string;
}

/**
 * Retrato de um personagem — a UI nunca desenha rosto proceduralmente (spec
 * §65/§22). Sem arte final, `portraitDefault` fica ausente e a UI usa um
 * fallback elegante (silhueta/moldura), nunca um quadrado colorido nem pixel
 * art gerada por código.
 */
export interface CharacterVisualProfile {
  portraitDefault?: string;
  portraitExpressions?: Partial<Record<'neutral' | 'happy' | 'angry' | 'sad' | 'afraid' | 'hurt', string>>;
  /** Chave de tema visual (cor/motivo) — ver src/ui/visual/classThemes.ts. */
  visualTheme?: string;
}

/**
 * Modelo de personagem jogável — Passado/Princípio/Desejo/Medo/Limite
 * preservados como campos, não coletados obrigatoriamente na criação
 * (personagem customizado); já vêm preenchidos para Personagens de Origem.
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
  inventory: string[];
  quests: string[];
  location: string;
  visualProfile: CharacterVisualProfile;

  past?: string;
  principle?: string;
  desire?: string;
  fear?: string;
  limit?: string;

  /** Presente só quando o jogo começou por um Personagem de Origem. */
  originCharacterId?: string;
}

/**
 * Personagem de Origem — passado próprio, mas o jogador ainda decide quem
 * ele se torna (Índole emerge do jogo, não do texto de ficha). Ver
 * docs/design/09-ORIGIN-CHARACTERS.md.
 */
export interface OriginCharacter {
  id: string;
  name: string;
  gender: Gender;
  classId: string;
  originId: string;
  shortHook: string;
  background: string;
  personalGoal: string;
  fear: string;
  /** Não revelado ao jogador na criação — usado pela narrativa mais tarde. */
  secret: string;
  startingRelationships: { npcId: string; affinity: number; note: string }[];
  uniqueTags: string[];
  personalQuestId?: string;
  voiceStyle: string;
  startingIndoleBias: Partial<IndoleState>;
  visualProfile: CharacterVisualProfile;
}
