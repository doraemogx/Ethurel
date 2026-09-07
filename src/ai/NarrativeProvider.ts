/**
 * Camada de IA como enhancement opcional — a IA É O NARRADOR, NÃO É O MOTOR
 * DO JOGO (spec §6). Regra permanente: nenhuma implementação desta interface
 * decide HP, dano, XP, dinheiro, loot, atributos, sucesso/falha de teste,
 * Tensão, Marca, Reputação numérica, Índole numérica, progressão, conclusão
 * de quest ou condição de combate — isso é sempre código determinístico
 * (src/domain/, src/combat/, src/quest/, src/social/). A IA recebe o
 * RESULTADO já decidido e o dramatiza.
 *
 * O jogo precisa funcionar por completo com `LocalNarrativeProvider`
 * (determinístico, sem rede, conteúdo autoral em src/content/) — um
 * provider remoto é só um enhancement.
 */
import type { AdvantageState } from '@/domain/dice';
import type { WorldEvent } from '@/domain/worldEvents';

export type NarrativeMood = 'neutral' | 'tense' | 'hopeful' | 'grim' | 'mysterious' | 'triumphant';

/** Um teste que a narrativa/ação sugere ser relevante — o GAME ENGINE decide
 * se de fato exige rolagem e com qual DC; a IA só pode SUGERIR (spec §52). */
export interface RequestedCheck {
  attribute: 'vigor' | 'reflexo' | 'mente' | 'presenca';
  reason: string;
  suggestedDc?: number;
  advantageHint?: AdvantageState;
}

export interface SuggestedAction {
  id: string;
  label: string;
  /** Origem da ação (classe/origem/atributo) — mostrada na UI para deixar
   * claro por que aquela opção existe (spec §28, importante para replay). */
  unlockedBy?: string;
}

export interface NarrativeContext {
  sceneId: string;
  locationName: string;
  locationDescription: string;
  ambientProfile: string;
  characterName: string;
  className: string;
  originName: string;
  npcId?: string;
  npcName?: string;
  /** Só as dimensões de Índole relevantes para este momento, não o estado
   * inteiro (spec §31 — a IA nunca recebe a ficha completa como barra). */
  relevantIndoleTags?: string[];
  relevantReputationEntity?: string;
  relevantReputationValue?: number;
  recentEvents: WorldEvent[];
  mechanicalResult?: string;
  /** Recorte canônico já filtrado (spec Fase 2 §1/§2) — linhas curtas prontas
   * para prompt, nunca a Bíblia/registro inteiro. Ver
   * `src/canon/canonRetrieval.ts` (`retrieveCanonContext`) e
   * `src/canon/knowledgeAccess.ts` (filtro por NPC). Opcional para não
   * quebrar construções manuais de contexto em teste. */
  canonSummary?: string[];
}

export interface NarrativeRequest {
  kind: 'scene' | 'dialogue' | 'event-flavor' | 'free-action-interpretation';
  context: NarrativeContext;
  playerInput?: string;
}

export interface NarrativeResponse {
  narration: string;
  dialogue?: { speakerName: string; text: string }[];
  suggestedActions: SuggestedAction[];
  mood: NarrativeMood;
  requestedChecks: RequestedCheck[];
}

export type InterpretedActionKind = 'possible' | 'impossible' | 'requires_check' | 'requires_item' | 'requires_condition' | 'partial';

export interface InterpretedAction {
  kind: InterpretedActionKind;
  reason?: string;
  requestedCheck?: RequestedCheck;
}

export interface NarrativeProvider {
  readonly isAvailable: boolean;
  requestNarration(request: NarrativeRequest): Promise<NarrativeResponse>;
  interpretFreeText(text: string, context: NarrativeContext): Promise<InterpretedAction>;
}
