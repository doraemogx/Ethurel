export interface NPC {
  id: string;
  name: string;
  role: string;
  location: string;
  personality: string; // 1 traço marcante, não um parágrafo
  relationship: number; // -100..100
  faction?: string;
  /** Chave em `src/characters/visualRegistry.ts` — ausente = fallback silhueta. */
  visualProfileId?: string;
  quests?: string[];
  dialogueState: Record<string, boolean | number>;
  flags: Record<string, boolean>;
  alive: boolean;
}
