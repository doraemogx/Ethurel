import type { NPC } from '@/npcs/types';
import { NPC_ID, NPC_NAME } from '@/content/firstChapterQuest';

/**
 * Tolven — adaptado ao cânone V7 (Fase 2 §13, Livro VII.001.1-5): a versão
 * anterior ("Guarda-caminho de Varreth") foi escrita antes da ingestão da
 * Bíblia. Canônico é Tolven Marr, ferreiro nascido em Veyr — só `role` foi
 * ajustado; `personality` já era compatível com a psicologia canônica
 * (cautela diante do que foge do natural, não fascínio — Livro VII.001.3) e
 * foi preservada. Ver docs/canon/npcs/tolven-marr.md para a análise
 * completa de impacto (o que mudou e por quê) e CANON_CONFLICTS.md §4 para
 * a divergência ainda pendente de decisão (por que ele está em Varreth, não
 * em Veyr, não é coberto pela fonte).
 */
export const NPCS: NPC[] = [
  {
    id: NPC_ID,
    name: NPC_NAME,
    role: 'Ferreiro de Varreth',
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
