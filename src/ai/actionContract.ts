/**
 * Narrative Action Contract — Fase 2 §8. Contrato estruturado entre a IA
 * (local ou remota) e o GameEngine. A IA interpreta uma frase livre em
 * INTENÇÃO estruturada — inclusive intenções compostas ("empurro Tolven e
 * tento pegar a chave" = interação física + intenção secundária de adquirir
 * item) — mas nunca decide o resultado mecânico. `resolveNarrativeAction`
 * é o lado GameEngine do contrato: recebe a intenção, decide DC/se a ação é
 * sequer possível dado o estado real do jogo, e devolve uma resolução que
 * ainda precisa passar pelo d20 real (`src/domain/dice.ts`) para virar
 * sucesso/falha — a IA não decide DC final, sucesso, dano, mudança de
 * inventário nem reputação final (nenhum desses campos existe neste
 * arquivo do lado da IA; só do lado da resolução, calculado aqui).
 */
import type { Attribute } from '@/domain/passiveInsights';

export type NarrativeIntentType =
  | 'physical_interaction'
  | 'social_interaction'
  | 'acquire_item'
  | 'use_item'
  | 'movement'
  | 'expression'
  | 'inquiry'
  | 'refusal'
  | 'unknown';

/**
 * O que a IA propõe — nunca um resultado, só uma leitura estruturada da
 * intenção do jogador. `suggestedDc`/`suggestedAttribute` são SUGESTÕES; só
 * `resolveNarrativeAction` (GameEngine) decide o que realmente vale.
 */
export interface NarrativeActionIntent {
  intent: NarrativeIntentType;
  /** Id de NPC/entidade alvo, quando a ação tem um (ex.: 'npc_tolven_marr'). */
  target?: string;
  /** Verbo curto que descreve a tentativa (ex.: 'push', 'hug', 'examine'). */
  attempt?: string;
  /** Intenção composta — ex.: empurrar E tentar pegar algo na mesma frase. */
  secondaryIntent?: NarrativeIntentType;
  item?: string;
  requiresCheck: boolean;
  suggestedAttribute?: Attribute;
  suggestedDc?: number;
}

/** O que o GameEngine decidiu depois de validar a intenção — isto sim é
 * autoritativo. `allowed=false` significa que a ação nem chega a virar um
 * check (ex.: tentar pegar um item que não existe na cena). */
export interface NarrativeActionResolution {
  allowed: boolean;
  requiresCheck: boolean;
  attribute?: Attribute;
  /** DC final — SEMPRE decidida aqui, nunca copiada cegamente de `suggestedDc`. */
  dc?: number;
  reason?: string;
}

const DC_MIN = 5;
const DC_MAX = 25;
const DEFAULT_DC = 12;

/** Clampa e valida a sugestão da IA — nunca aceita um valor fora de uma
 * faixa plausível, e cai para o default canônico se a sugestão faltar. */
function resolveDc(suggested: number | undefined): number {
  if (suggested === undefined || Number.isNaN(suggested)) return DEFAULT_DC;
  return Math.max(DC_MIN, Math.min(DC_MAX, Math.round(suggested)));
}

export interface ResolveActionContext {
  /** Ids de itens realmente presentes/acessíveis na cena atual — usado para
   * validar `acquire_item` sem confiar na IA sobre o que "existe". */
  availableItemIds?: string[];
  /** Se o alvo (`intent.target`) está de fato presente/vivo nesta cena. */
  targetPresent?: boolean;
}

/**
 * Lado GameEngine do contrato — a única função autorizada a decidir DC
 * final e se uma ação é sequer possível. Nunca aceita um valor da IA sem
 * revalidar contra o estado real do jogo.
 */
export function resolveNarrativeAction(intent: NarrativeActionIntent, ctx: ResolveActionContext = {}): NarrativeActionResolution {
  if (intent.target && ctx.targetPresent === false) {
    return { allowed: false, requiresCheck: false, reason: 'Alvo não está presente nesta cena.' };
  }

  if ((intent.intent === 'acquire_item' || intent.secondaryIntent === 'acquire_item') && intent.item) {
    const available = ctx.availableItemIds ?? [];
    if (!available.includes(intent.item)) {
      return { allowed: false, requiresCheck: false, reason: `Item "${intent.item}" não está disponível nesta cena.` };
    }
  }

  if (!intent.requiresCheck) {
    return { allowed: true, requiresCheck: false };
  }

  return {
    allowed: true,
    requiresCheck: true,
    attribute: intent.suggestedAttribute ?? 'vigor',
    dc: resolveDc(intent.suggestedDc),
  };
}
