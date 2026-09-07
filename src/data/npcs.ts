import type { NPC } from '@/npcs/types';
import { NPC_ID, NPC_NAME } from '@/content/firstChapterQuest';

export const NPCS: NPC[] = [
  {
    id: NPC_ID,
    name: NPC_NAME,
    role: 'Guarda-caminho de Varreth',
    location: 'varreth',
    visualProfileId: 'npc-tolven',
    personality: 'Cansado, mas atento — desconfia de coisas que "não são naturais" antes de qualquer outra coisa.',
    relationship: 0,
    quests: ['raiz-sussurrou'],
    dialogueState: {},
    flags: {},
    alive: true,
  },
];
