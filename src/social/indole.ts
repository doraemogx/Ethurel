/**
 * Índole (quem o personagem se torna) e Reputação (como o mundo o vê) — dois
 * sistemas distintos. Ver docs/design/03-GAMEPLAY-E-COMBATE.md §9.
 *
 * Regra central (corrigida na revisão 2): eventos moral ou comportamentalmente
 * relevantes PODEM alterar as dimensões de Índole, independentemente de haver
 * testemunha. Ações neutras simplesmente não definem `indoleDelta` — não há
 * nenhuma mudança "automática" por qualquer ação. Reputação só muda quando o
 * evento é conhecido (`witnesses !== 'none'`).
 *
 * As 12 dimensões são a fonte de verdade. `indoleLabel` é só uma síntese de
 * apresentação (ficha, diálogo) — nunca a base de uma condição de jogo; use as
 * dimensões (ou combinações delas) diretamente em `Condition` (ver src/effects/types.ts).
 */

export type IndoleTrait =
  | 'compaixao'
  | 'crueldade'
  | 'altruismo'
  | 'egoismo'
  | 'honra'
  | 'pragmatismo'
  | 'ambicao'
  | 'misericordia'
  | 'lealdade'
  | 'manipulacao'
  | 'impulsividade'
  | 'autocontrole';

export const INDOLE_TRAITS: readonly IndoleTrait[] = [
  'compaixao',
  'crueldade',
  'altruismo',
  'egoismo',
  'honra',
  'pragmatismo',
  'ambicao',
  'misericordia',
  'lealdade',
  'manipulacao',
  'impulsividade',
  'autocontrole',
];

export type IndoleState = Record<IndoleTrait, number>;

export function createInitialIndole(): IndoleState {
  const state = {} as IndoleState;
  for (const trait of INDOLE_TRAITS) state[trait] = 0;
  return state;
}

const INDOLE_MIN = -100;
const INDOLE_MAX = 100;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export interface IndoleDelta {
  trait: IndoleTrait;
  delta: number;
}

/** Aplica deltas de Índole de forma incondicional (a condicionalidade — se o
 * evento tem peso moral/comportamental — já foi decidida por quem gerou o
 * WorldEvent; ver `resolveWorldEvent`). Retorna um novo estado (imutável). */
export function applyIndoleDelta(state: IndoleState, deltas: IndoleDelta[]): IndoleState {
  const next = { ...state };
  for (const { trait, delta } of deltas) {
    next[trait] = clamp(next[trait] + delta, INDOLE_MIN, INDOLE_MAX);
  }
  return next;
}

export type IndoleLabel =
  | 'Cruel'
  | 'Implacável'
  | 'Benevolente'
  | 'Honrado'
  | 'Oportunista'
  | 'Pragmático'
  | 'Ambíguo';

/** Síntese de apresentação — nunca usar o retorno desta função em condição de
 * jogo (`Condition` usa as dimensões brutas via `IndoleAtLeast`/`IndoleBelow`). */
export function indoleLabel(state: IndoleState): IndoleLabel {
  const warmth =
    state.compaixao + state.altruismo + state.misericordia + state.lealdade -
    (state.crueldade + state.egoismo + state.manipulacao);
  const order = state.honra + state.autocontrole - (state.impulsividade + state.manipulacao);
  const selfInterest = state.ambicao + state.pragmatismo + state.egoismo;

  if (warmth <= -35 && state.crueldade >= 20) return 'Cruel';
  if (warmth < -15 && selfInterest > 15) return 'Implacável';
  if (warmth > 30 && order > 15) return 'Benevolente';
  if (order > 25) return 'Honrado';
  if (selfInterest > 25 && warmth < 0) return 'Oportunista';
  if (selfInterest > 20) return 'Pragmático';
  return 'Ambíguo';
}

// ---- Reputação ----

/** Reputação é por entidade (NPC, facção, vila) — sem lista pré-definida; entradas
 * novas são criadas ao primeiro evento que as referencia. */
export type ReputationState = Record<string, number>;

export function createInitialReputation(): ReputationState {
  return {};
}

export interface ReputationDelta {
  entity: string;
  delta: number;
}

export function applyReputationDelta(
  state: ReputationState,
  deltas: ReputationDelta[]
): ReputationState {
  const next = { ...state };
  for (const { entity, delta } of deltas) {
    next[entity] = clamp((next[entity] ?? 0) + delta, -100, 100);
  }
  return next;
}

// ---- Sistema simples de testemunhas/conhecimento de eventos ----

/**
 * `witnesses` decide quem "sabe" do evento — não é uma simulação social (sem
 * propagação de rumor, sem memória por NPC de terceiros): é uma decisão tomada
 * por quem desenha a quest/diálogo/combate, no momento em que o evento acontece.
 *
 * - 'none': ninguém sabe — só Índole é afetada.
 * - 'public': a comunidade/facção relevante sabe — Reputação é afetada.
 * - string[]: só os NPCs/facções nomeados sabem (ex.: a própria pessoa ajudada).
 */
export type Witnesses = 'none' | 'public' | string[];

export interface WorldEvent {
  id: string;
  /** Omitido/vazio em eventos neutros — presente só quando o evento tem peso
   * moral/comportamental real. Não é "toda ação gera delta". */
  indoleDelta?: IndoleDelta[];
  reputationDelta?: ReputationDelta[];
  witnesses: Witnesses;
}

export interface SocialState {
  indole: IndoleState;
  reputation: ReputationState;
}

export function resolveWorldEvent(state: SocialState, event: WorldEvent): SocialState {
  const indole = event.indoleDelta ? applyIndoleDelta(state.indole, event.indoleDelta) : state.indole;
  const reputation =
    event.witnesses !== 'none' && event.reputationDelta
      ? applyReputationDelta(state.reputation, event.reputationDelta)
      : state.reputation;
  return { indole, reputation };
}
