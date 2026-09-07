/** 8 estados (Phase 3 §9) — nem todo personagem tem arte para todos; ver
 * `src/characters/visualRegistry.ts` para o fallback (sempre neutral, nunca
 * o retrato de outro personagem). */
export type PortraitExpression = 'neutral' | 'happy' | 'sad' | 'angry' | 'afraid' | 'surprised' | 'suspicious' | 'hurt';

export interface DialogueLine {
  speakerId: string;
  speakerName: string;
  text: string;
  expression?: PortraitExpression;
}

export interface DialogueChoice {
  id: string;
  text: string;
}

export interface DialogueNode {
  lines: DialogueLine[];
  choices?: DialogueChoice[];
}
