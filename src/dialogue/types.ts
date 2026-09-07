export interface DialogueLine {
  speakerName: string;
  text: string;
  /** Índice de frame em `assets/ansimuz/portraits/npc-faces.png` (grade
   * 16×16, ver CREDITS.md) — omitido para falar sem portrait. */
  portraitFrame?: number;
}

export interface DialogueChoice {
  id: string;
  text: string;
}

export interface DialogueNode {
  lines: DialogueLine[];
  /** Se presente, mostrado depois da última linha; `onResolve` recebe o id
   * escolhido. Se ausente, o diálogo só fecha (toque para avançar/fechar). */
  choices?: DialogueChoice[];
}
