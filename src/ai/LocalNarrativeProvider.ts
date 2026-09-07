import type {
  InterpretedAction,
  NarrativeContext,
  NarrativeProvider,
  NarrativeRequest,
  NarrativeResponse,
} from '@/ai/NarrativeProvider';

const MOOD_BY_DANGER_WORDS = [
  { words: ['fissura', 'ruptura', 'arcane'], mood: 'mysterious' as const },
  { words: ['ferido', 'sangue', 'dor'], mood: 'grim' as const },
  { words: ['vitória', 'venceu'], mood: 'triumphant' as const },
];

/**
 * Implementação local e determinística — sem rede. É o provider padrão: o
 * jogo abre e é jogável por completo sem nenhuma IA configurada. Não é um
 * fallback pobre — diálogo e quest essenciais são escritos à mão em
 * src/content/, não gerados aqui. Este provider só cobre a parte
 * opcional por natureza: flavor de eventos mecânicos e uma interpretação
 * simples (por palavra-chave) de texto livre ("Outra ação...").
 */
export class LocalNarrativeProvider implements NarrativeProvider {
  readonly isAvailable = true;

  async requestNarration(request: NarrativeRequest): Promise<NarrativeResponse> {
    const { context } = request;
    const mood = this.inferMood(context);
    const narration = context.mechanicalResult
      ? context.mechanicalResult
      : `Você está em ${context.locationName}. ${context.locationDescription}`;

    return {
      narration,
      suggestedActions: [],
      mood,
      requestedChecks: [],
    };
  }

  async interpretFreeText(text: string, _context: NarrativeContext): Promise<InterpretedAction> {
    const normalized = text.trim().toLowerCase();
    if (!normalized) return { kind: 'impossible', reason: 'Ação vazia.' };

    // Interpretação mínima por palavra-chave — o GameEngine tem autoridade
    // final (spec §29); isto só decide se PARECE plausível o bastante para
    // sugerir um teste, nunca decide o resultado.
    if (/\b(examinar|observar|investigar|olhar)\b/.test(normalized)) {
      return { kind: 'requires_check', requestedCheck: { attribute: 'mente', reason: 'Examinar algo com atenção.' } };
    }
    if (/\b(escutar|ouvir)\b/.test(normalized)) {
      return { kind: 'requires_check', requestedCheck: { attribute: 'presenca', reason: 'Perceber algo pelo som.' } };
    }
    if (/\b(subir|escalar|esquivar|correr)\b/.test(normalized)) {
      return { kind: 'requires_check', requestedCheck: { attribute: 'reflexo', reason: 'Ação física arriscada.' } };
    }
    if (/\b(forçar|quebrar|empurrar|levantar)\b/.test(normalized)) {
      return { kind: 'requires_check', requestedCheck: { attribute: 'vigor', reason: 'Ação de força.' } };
    }
    if (normalized.length > 240) {
      return { kind: 'partial', reason: 'Ação longa demais — tente algo mais direto.' };
    }
    return { kind: 'possible' };
  }

  private inferMood(context: NarrativeContext): NarrativeResponse['mood'] {
    const haystack = `${context.locationDescription} ${context.mechanicalResult ?? ''}`.toLowerCase();
    for (const entry of MOOD_BY_DANGER_WORDS) {
      if (entry.words.some((w) => haystack.includes(w))) return entry.mood;
    }
    return 'neutral';
  }
}
