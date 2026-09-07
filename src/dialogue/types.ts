export type PortraitExpression = 'neutral' | 'happy' | 'angry' | 'sad' | 'afraid' | 'hurt';

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
