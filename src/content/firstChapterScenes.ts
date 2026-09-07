/**
 * Roteiro do primeiro capítulo (spec §55) — ~15-20 minutos, não uma
 * campanha. Ramificação controlada que converge de volta ([PROPOSTA] já
 * orientada em docs/design/06-WORLD-NARRATIVE-BIBLE.md §6): a ação
 * contextual varia por classe/origem (prova de replay, spec §58), mas todas
 * convergem para o mesmo próximo beat.
 */
export type SceneId = 'intro' | 'toward-clearing' | 'clearing-check' | 'return' | 'epilogue';

export interface ContextualAction {
  id: string;
  label: string;
  /** Mostrado na UI para deixar claro por que a opção existe (spec §28). */
  unlockedBy?: string;
  requiresClassId?: string;
  requiresOriginId?: string;
}

export interface SceneScript {
  id: SceneId;
  locationId: string;
  narration: string;
  actions: ContextualAction[];
}

export const FIRST_CHAPTER_SCENES: Record<SceneId, SceneScript> = {
  intro: {
    id: 'intro',
    locationId: 'varreth',
    narration:
      'Varreth acorda devagar. Fumaça fina sobe dos telhados; alguém bate um martelo em algum lugar perto demais para ser ignorado. Você chegou há pouco — o suficiente para ainda ser notado, não o bastante para ser reconhecido.',
    actions: [
      { id: 'talk-tolven', label: 'Falar com Tolven, o guarda-caminho' },
      { id: 'observe-square', label: '[MENTE] Observar a praça com atenção' },
    ],
  },
  'toward-clearing': {
    id: 'toward-clearing',
    locationId: 'borda-musgos',
    narration:
      'A clareira leste fica a pouco mais de uma hora a pé. O musgo aqui cresce em espirais que não deveriam existir, e os pássaros pararam de cantar dois campos atrás.',
    actions: [
      { id: 'approach-root', label: 'Aproximar a mão da raiz', requiresClassId: 'portador-de-cinza', unlockedBy: 'Portador de Cinza' },
      { id: 'recognize-deformation', label: 'Você reconhece esta deformação', requiresOriginId: 'fronteira-partida', unlockedBy: 'Fronteira Partida' },
      { id: 'recall-house-fall', label: 'Isto lembra os registros da sua Casa', requiresOriginId: 'bastiao-caido', unlockedBy: 'Bastião Caído' },
      { id: 'recognize-culto-marks', label: 'Você reconhece um padrão nos esporos', requiresOriginId: 'culto-do-selo', unlockedBy: 'Culto do Selo' },
      { id: 'read-the-bones', label: 'Consultar os ossos antes de continuar', requiresOriginId: 'cinzas-longas', unlockedBy: 'Cinzas Longas' },
      { id: 'continue-forward', label: 'Continuar em frente' },
    ],
  },
  'clearing-check': {
    id: 'clearing-check',
    locationId: 'borda-musgos',
    narration: 'A clareira se abre à sua frente. No centro, uma pedra rachada pulsa devagar — e algo se move perto dela.',
    actions: [{ id: 'engage', label: 'Aproximar-se' }],
  },
  return: {
    id: 'return',
    locationId: 'varreth',
    narration: 'Você volta a Varreth com o que encontrou ainda pulsando de leve na sua bolsa.',
    actions: [{ id: 'talk-tolven-return', label: 'Procurar Tolven' }],
  },
  epilogue: {
    id: 'epilogue',
    locationId: 'varreth',
    narration:
      'A tarde cai sobre Varreth. Seja qual for a decisão que você tomou, algo mudou — e a Estrada Velha, a leste, agora parece menos um rumor e mais um convite.',
    actions: [],
  },
};
