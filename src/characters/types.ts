import type { Attrs } from '@/classes/types';
import type { IndoleState, ReputationState } from '@/social/indole';
import type { PortraitExpression } from '@/dialogue/types';

/**
 * Identidade selecionável na criação (spec Fase 2 §9) — apresentação do
 * personagem, não uma escolha mecânica: nenhum atributo/regra depende deste
 * valor. Substitui "Homem/Mulher" da primeira reconstrução por pedido
 * explícito do usuário nesta fase.
 */
export type Gender = 'masculino' | 'feminino' | 'outro';

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
 * Registro de identidade visual de um personagem (Phase 3 §8) — mesma forma
 * para NPC, Personagem de Origem e jogador customizado, para que a mesma
 * identidade apareça em criação/ficha/diálogo/jornal/Origens sem nunca trocar
 * de rosto por engano. Sem arte (`portrait` ausente), a UI usa o fallback
 * elegante de sempre (silhueta/moldura, `Portrait.tsx`), nunca um quadrado
 * colorido nem pixel art gerada por código.
 *
 * `expressions` é parcial de propósito (spec §9 — nem todo personagem precisa
 * de todos os 8 estados); a resolução de qual imagem mostrar para um estado
 * ausente é sempre "usa neutral", nunca o retrato de outro personagem — ver
 * `resolveExpressionImage` em `src/characters/visualRegistry.ts`.
 */
export interface CharacterVisualProfile {
  /** Chave estável do registro (`src/characters/visualRegistry.ts`) — vazio para personagens sem arte catalogada ainda. */
  id: string;
  portrait?: string;
  fullBody?: string;
  pose?: string;
  expressions?: Partial<Record<PortraitExpression, string>>;
  ancestry?: string;
  presentation?: Gender;
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
  /** Ausente em personagens criados antes da Phase 3 (save migrado) — a UI
   * trata ausência como "ancestralidade não registrada", nunca inventa uma. */
  ancestryId?: string;
  ancestryVariantId?: string;
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

  /** Assinatura visual Arcane do personagem — derivada da classe (spec Fase 2
   * §12), nunca altera regra/mecânica. Ver src/arcane/identity.ts. */
  arcaneIdentityId: string;

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
  approxAge: string;
  /** Frase que resume a voz do personagem — mostrada na seleção (spec Fase 2 §13). */
  catchphrase: string;
  shortHook: string;
  background: string;
  personalGoal: string;
  fear: string;
  /** Algo que o PRÓPRIO personagem sabe — mostrado ao jogador (diferente do segredo). */
  knownFact: string;
  /** Não revelado ao jogador na criação — usado pela narrativa mais tarde. */
  secret: string;
  traits: string[];
  startingRelationships: { npcId: string; affinity: number; note: string }[];
  uniqueTags: string[];
  personalQuestId?: string;
  voiceStyle: string;
  startingIndoleBias: Partial<IndoleState>;
  visualProfile: CharacterVisualProfile;
}
