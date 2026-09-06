/**
 * Camada de IA como enhancement opcional (docs/design/02-STACK-E-ARQUITETURA.md §5).
 * O jogo precisa ser completo e coerente com esta interface implementada apenas
 * por `LocalNarrativeProvider` (conteúdo autoral, sem rede) — um provider real
 * conectado a um backend só é construído na Fase 9, depois da Fase 8 fechar.
 *
 * Regra permanente: nenhuma implementação desta interface decide HP, dano, XP,
 * loot, estado de quest ou vitória/derrota — isso é sempre código determinístico.
 */
export interface DialogueContext {
  npcId: string;
  location: string;
}

export interface ActionContext {
  location: string;
  nearbyNpcIds: string[];
}

export interface InterpretedAction {
  kind: 'talk' | 'examine' | 'unknown';
  targetId?: string;
}

export interface WorldEventForFlavor {
  id: string;
  location: string;
}

export interface NarrativeProvider {
  enrichDialogue(npcId: string, context: DialogueContext): Promise<string | null>;
  interpretFreeText(text: string, context: ActionContext): Promise<InterpretedAction | null>;
  flavorForEvent(event: WorldEventForFlavor): Promise<string | null>;
}
