import type {
  ActionContext,
  DialogueContext,
  InterpretedAction,
  NarrativeProvider,
  WorldEventForFlavor,
} from '@/ai/NarrativeProvider';

/**
 * Implementação local e determinística — sem rede. É o provider ativo durante
 * toda a vertical slice (Fases 1-8). Não é um fallback genérico pobre: diálogos,
 * quest e Códice essenciais são escritos à mão nos dados do jogo (src/data/*),
 * não gerados aqui. Este provider só cobre a parte que é opcional por natureza
 * (variação e interpretação de texto livre) e devolve `null`/interpretação
 * simples quando não tem uma resposta melhor — nunca trava o jogo.
 *
 * Fase 1: stub estrutural, sem conteúdo ainda (não há diálogos/eventos até a
 * Fase 3/6). Interpretação de texto livre por palavra-chave é implementada
 * junto com o sistema de diálogo real, na Fase 6.
 */
export class LocalNarrativeProvider implements NarrativeProvider {
  async enrichDialogue(_npcId: string, _context: DialogueContext): Promise<string | null> {
    return null;
  }

  async interpretFreeText(_text: string, _context: ActionContext): Promise<InterpretedAction | null> {
    return { kind: 'unknown' };
  }

  async flavorForEvent(_event: WorldEventForFlavor): Promise<string | null> {
    return null;
  }
}
