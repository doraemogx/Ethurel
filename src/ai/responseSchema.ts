import type { NarrativeMood, NarrativeResponse, RequestedCheck, SuggestedAction } from '@/ai/NarrativeProvider';

const MOODS: NarrativeMood[] = ['neutral', 'tense', 'hopeful', 'grim', 'mysterious', 'triumphant'];
const ATTRS = ['vigor', 'reflexo', 'mente', 'presenca'];

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
