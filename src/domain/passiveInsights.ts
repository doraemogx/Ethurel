/**
 * Passive Insights (Fase 2 §20) — atributos detectam coisas automaticamente,
 * sem rolagem visível (convenção "passiva" d20: 10 + modificador vs. DC,
 * nunca mostrado como teste). No máximo 1 por cena, para não virar spam.
 */
import type { Attrs } from '@/classes/types';

export type Attribute = keyof Attrs;

export interface PassiveInsight {
  id: string;
  sceneId: string;
  attribute: Attribute;
  dc: number;
  text: string;
}

export const PASSIVE_INSIGHTS: PassiveInsight[] = [
  {
    id: 'tolven-avoids-estrada-velha',
    sceneId: 'intro',
    attribute: 'presenca',
    dc: 12,
    text: 'Tolven desvia os olhos, só por um instante, quando menciona a Estrada Velha.',
  },
  {
    id: 'mark-not-tool-made',
    sceneId: 'toward-clearing',
    attribute: 'mente',
    dc: 13,
    text: 'A marca na pedra rachada não foi feita por nenhuma ferramenta que você reconhece.',
  },
  {
    id: 'something-moved',
    sceneId: 'clearing-check',
    attribute: 'reflexo',
    dc: 14,
    text: 'Alguma coisa se moveu do outro lado da clareira — rápido demais para ver o quê.',
  },
];

export function passiveScore(modifier: number): number {
  return 10 + modifier;
}

export function checkPassiveInsight(insight: PassiveInsight, attrs: Attrs): boolean {
  return passiveScore(attrs[insight.attribute]) >= insight.dc;
}

/** No máximo um insight por cena, e só o primeiro elegível ainda não visto. */
export function resolveInsightForScene(sceneId: string, attrs: Attrs, alreadySeenIds: string[]): PassiveInsight | null {
  const candidate = PASSIVE_INSIGHTS.find((i) => i.sceneId === sceneId && !alreadySeenIds.includes(i.id));
  if (!candidate) return null;
  return checkPassiveInsight(candidate, attrs) ? candidate : null;
}
