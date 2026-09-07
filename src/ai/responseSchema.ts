import type { InterpretedAction, InterpretedActionKind, NarrativeMood, NarrativeResponse, RequestedCheck, SuggestedAction } from '@/ai/NarrativeProvider';

const MOODS: NarrativeMood[] = ['neutral', 'tense', 'hopeful', 'grim', 'mysterious', 'triumphant'];
const ATTRS = ['vigor', 'reflexo', 'mente', 'presenca'];
const INTERPRETED_KINDS: InterpretedActionKind[] = ['possible', 'impossible', 'requires_check', 'requires_item', 'requires_condition', 'partial'];

/**
 * Validação do contrato de resposta da IA (spec §52) — a IA pode SUGERIR, o
 * GameEngine valida. Resposta fora do formato esperado nunca chega à UI:
 * retorna `null` e quem chama cai no fallback (`LocalNarrativeProvider`).
 * Validação manual (sem dependência extra) — o contrato é pequeno o
 * suficiente para não precisar de uma lib de schema.
 */
export function validateNarrativeResponse(value: unknown): NarrativeResponse | null {
  if (!value || typeof value !== 'object') return null;
  const v = value as Record<string, unknown>;

  if (typeof v.narration !== 'string' || !v.narration.trim()) return null;
  if (!MOODS.includes(v.mood as NarrativeMood)) return null;
  if (!Array.isArray(v.suggestedActions)) return null;
  if (!Array.isArray(v.requestedChecks)) return null;

  const suggestedActions = v.suggestedActions.filter(isValidSuggestedAction);
  const requestedChecks = v.requestedChecks.filter(isValidRequestedCheck);

  let dialogue: NarrativeResponse['dialogue'];
  if (v.dialogue !== undefined) {
    if (!Array.isArray(v.dialogue)) return null;
    const validDialogue = v.dialogue.filter(
      (d): d is { speakerName: string; text: string } =>
        !!d && typeof d === 'object' && typeof (d as Record<string, unknown>).speakerName === 'string' && typeof (d as Record<string, unknown>).text === 'string'
    );
    if (validDialogue.length !== v.dialogue.length) return null;
    dialogue = validDialogue;
  }

  return {
    narration: v.narration,
    dialogue,
    suggestedActions,
    mood: v.mood as NarrativeMood,
    requestedChecks,
  };
}

function isValidSuggestedAction(value: unknown): value is SuggestedAction {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return typeof v.id === 'string' && typeof v.label === 'string';
}

function isValidRequestedCheck(value: unknown): value is RequestedCheck {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return typeof v.attribute === 'string' && ATTRS.includes(v.attribute) && typeof v.reason === 'string';
}

/**
 * Valida a resposta de `interpretFreeText` de um provider remoto (spec
 * Fase 2 §10) — antes desta função, `RemoteNarrativeProvider.interpretFreeText`
 * fazia `as InterpretedAction` sem checar nada (achado da auditoria desta
 * rodada). Mesma filosofia de `validateNarrativeResponse`: fora do formato
 * esperado nunca chega à UI, `null` faz quem chama cair no fallback local.
 * `intent`/`requestedCheck`, se presentes, também são validados — nunca
 * repassados sem checagem de shape.
 */
export function validateInterpretedAction(value: unknown): InterpretedAction | null {
  if (!value || typeof value !== 'object') return null;
  const v = value as Record<string, unknown>;

  if (typeof v.kind !== 'string' || !INTERPRETED_KINDS.includes(v.kind as InterpretedActionKind)) return null;
  if (v.reason !== undefined && typeof v.reason !== 'string') return null;

  let requestedCheck: RequestedCheck | undefined;
  if (v.requestedCheck !== undefined) {
    if (!isValidRequestedCheck(v.requestedCheck)) return null;
    requestedCheck = v.requestedCheck;
  }

  let intent: InterpretedAction['intent'];
  if (v.intent !== undefined) {
    if (!isValidNarrativeActionIntent(v.intent)) return null;
    intent = v.intent;
  }

  return { kind: v.kind as InterpretedActionKind, reason: v.reason as string | undefined, requestedCheck, intent };
}

function isValidNarrativeActionIntent(value: unknown): value is NonNullable<InterpretedAction['intent']> {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  if (typeof v.intent !== 'string') return false;
  if (typeof v.requiresCheck !== 'boolean') return false;
  if (v.target !== undefined && typeof v.target !== 'string') return false;
  if (v.attempt !== undefined && typeof v.attempt !== 'string') return false;
  if (v.secondaryIntent !== undefined && typeof v.secondaryIntent !== 'string') return false;
  if (v.item !== undefined && typeof v.item !== 'string') return false;
  if (v.suggestedAttribute !== undefined && !ATTRS.includes(v.suggestedAttribute as string)) return false;
  if (v.suggestedDc !== undefined && typeof v.suggestedDc !== 'number') return false;
  return true;
}
