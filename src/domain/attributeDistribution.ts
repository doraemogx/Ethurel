/**
 * Distribuição de Atributos (Phase 3 §11) — passo real de criação, não um
 * número fixo escondido atrás da classe. Mantém a escala pequena já existente
 * (2-6 na criação, ver `src/domain/dice.ts`) por decisão deliberada: o prompt
 * permite migrar para 8-18 com modificador derivado, mas exige, se isso for
 * feito, uma respec completa de HP/Foco/Marca/checks/classes/saves — fora do
 * escopo de uma fatia vertical (§29). Documentado em docs/HANDOFF-CURRENT.md.
 *
 * Mecânica: preset recomendado pela classe (+ ancestralidade) é o piso; o
 * jogador tem um pequeno orçamento de pontos para reforçar até 2 atributos,
 * nunca reduzir abaixo do preset (sem "sacrificar" Vigor para inflar Mente —
 * simples de explicar em uma tela, sem precisar de uma calculadora).
 */
import type { Attrs } from '@/classes/types';

export const ATTR_POINT_BUDGET = 3;
export const MAX_BONUS_PER_ATTR = 2;

export type AttrAdjustments = Attrs;

export function emptyAdjustments(): AttrAdjustments {
  return { vigor: 0, reflexo: 0, mente: 0, presenca: 0 };
}

export function pointsSpent(adjustments: AttrAdjustments): number {
  return adjustments.vigor + adjustments.reflexo + adjustments.mente + adjustments.presenca;
}

export function canIncrease(adjustments: AttrAdjustments, attr: keyof Attrs): boolean {
  return pointsSpent(adjustments) < ATTR_POINT_BUDGET && adjustments[attr] < MAX_BONUS_PER_ATTR;
}

export function increase(adjustments: AttrAdjustments, attr: keyof Attrs): AttrAdjustments {
  if (!canIncrease(adjustments, attr)) return adjustments;
  return { ...adjustments, [attr]: adjustments[attr] + 1 };
}

export function decrease(adjustments: AttrAdjustments, attr: keyof Attrs): AttrAdjustments {
  if (adjustments[attr] <= 0) return adjustments;
  return { ...adjustments, [attr]: adjustments[attr] - 1 };
}

export function applyAdjustments(preset: Attrs, adjustments: AttrAdjustments): Attrs {
  return {
    vigor: preset.vigor + adjustments.vigor,
    reflexo: preset.reflexo + adjustments.reflexo,
    mente: preset.mente + adjustments.mente,
    presenca: preset.presenca + adjustments.presenca,
  };
}
