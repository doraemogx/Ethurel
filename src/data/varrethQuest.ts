/**
 * Conteúdo mínimo e reversível da quest piloto desta vertical slice —
 * "O que a raiz sussurrou" (nome já referenciado em
 * docs/design/04-VERTICAL-SLICE-E-ROADMAP.md). NÃO define causa definitiva
 * do Arcane, vilão, nem cosmologia — só uma perturbação local investigável,
 * por instrução explícita (spec §31). `docs/design/06-WORLD-NARRATIVE-BIBLE.md`
 * continua sendo a fonte de cânone; nada aqui contradiz ou expande seus
 * itens [EM ABERTO].
 */
export const QUEST_ID = 'raiz-sussurrou';
export const QUEST_TITLE = 'O que a raiz sussurrou';

export const NPC_ID = 'tolven';
export const NPC_NAME = 'Tolven';
/** Frame em assets/ansimuz/portraits/npc-faces.png (grade 3×4 de 16×16px). */
export const NPC_PORTRAIT_FRAME = 1;

export const WORLD_FLAG_REPORTED = 'raiz-sussurrou:reportou';
export const WORLD_FLAG_KEPT = 'raiz-sussurrou:guardou';

export const DIALOGUE_OFFER = {
  lines: [
    {
      speakerName: NPC_NAME,
      text: 'Você vem dos arredores? Bom. Há dias uma raiz rompeu perto da clareira leste — nada cresce direito por perto, e os bichos evitam o lugar.',
      portraitFrame: NPC_PORTRAIT_FRAME,
    },
    {
      speakerName: NPC_NAME,
      text: 'Não sei dizer o que é. Só sei que não é natural. Se for até lá e me disser o que encontrar, agradeço.',
      portraitFrame: NPC_PORTRAIT_FRAME,
    },
  ],
};

export const DIALOGUE_REMINDER = {
  lines: [
    { speakerName: NPC_NAME, text: 'A clareira leste, lembra? Tome cuidado por lá.', portraitFrame: NPC_PORTRAIT_FRAME },
  ],
};

export const DIALOGUE_OBJECTIVE_COMPLETE = {
  lines: [
    {
      speakerName: NPC_NAME,
      text: 'Você voltou inteiro — e com uma prova. Isso pulsa devagar, como se ainda estivesse... acordando.',
      portraitFrame: NPC_PORTRAIT_FRAME,
    },
    {
      speakerName: NPC_NAME,
      text: 'O que prefere fazer com isso?',
      portraitFrame: NPC_PORTRAIT_FRAME,
    },
  ],
  choices: [
    { id: 'report', text: 'Entregar para ser lacrado com segurança' },
    { id: 'keep', text: 'Guardar para si e dizer que "está resolvido"' },
  ],
};

export const DIALOGUE_COMPLETED_REPORT = {
  lines: [
    { speakerName: NPC_NAME, text: 'Bem pensado. Isso vai ficar bem longe de mãos curiosas.', portraitFrame: NPC_PORTRAIT_FRAME },
  ],
};

export const DIALOGUE_COMPLETED_KEEP = {
  lines: [
    { speakerName: NPC_NAME, text: 'Resolvido, então. Se você diz...', portraitFrame: NPC_PORTRAIT_FRAME },
  ],
};

export const QUEST_BONUS_XP = 10;
