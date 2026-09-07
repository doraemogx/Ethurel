/**
 * Relacionamento multi-dimensional por NPC (Fase 2 §5) — evolui
 * `CompanionRelationshipState` (save.relationships, `src/save/schema.ts`) de
 * forma dedicada e testável, sem reduzir tudo a uma única barra -100/+100
 * como `npcTrust`/`relationshipLabel` (`src/social/relationship.ts`, que
 * continua existindo — é o rótulo simples já usado no diálogo do capítulo 1,
 * não foi substituído). As duas coisas coexistem por design: `npcTrust` é o
 * atalho simples já em uso; `CompanionRelationshipState` é a arquitetura
 * mais rica, pronta para quando comportamento de NPC precisar de mais de uma
 * dimensão (ex.: alguém pode confiar em você E temer você ao mesmo tempo).
 */
import type { CompanionRelationshipState } from '@/save/schema';
import { createEmptyRelationshipState } from '@/save/schema';

export type RelationshipDimension = 'affinity' | 'trust' | 'fear' | 'respect' | 'resentment' | 'debt' | 'suspicion';

export interface RelationshipDelta {
  dimension: RelationshipDimension;
  delta: number;
}

const CLAMPED_MIN = -100;
const CLAMPED_MAX = 100;

function clamp(value: number): number {
  return Math.max(CLAMPED_MIN, Math.min(CLAMPED_MAX, value));
}

/** Aplica deltas a um estado existente (ou cria um novo, se o NPC ainda não
 * tinha relação registrada) — imutável, cada dimensão clampada
 * independentemente (spec: "não reduza necessariamente tudo a uma única
 * barra"). `flags` não é tocado aqui — narrativa/quest adicionam flags via
 * spread direto quando precisar. */
export function applyRelationshipDelta(
  state: CompanionRelationshipState | undefined,
  deltas: RelationshipDelta[]
): CompanionRelationshipState {
  const next = { ...(state ?? createEmptyRelationshipState()) };
  for (const { dimension, delta } of deltas) {
    next[dimension] = clamp(next[dimension] + delta);
  }
  return next;
}

export function getOrCreateRelationship(
  relationships: Record<string, CompanionRelationshipState>,
  npcId: string
): CompanionRelationshipState {
  return relationships[npcId] ?? createEmptyRelationshipState();
}
