import { describe, it, expect } from 'vitest';
import { checkPassiveInsight, passiveScore, resolveInsightForScene, PASSIVE_INSIGHTS } from '@/domain/passiveInsights';
import type { Attrs } from '@/classes/types';

const baseAttrs: Attrs = { vigor: 2, reflexo: 2, mente: 2, presenca: 2 };

describe('Passive Insights', () => {
  it('passiveScore é 10 + modificador (convenção passiva d20)', () => {
    expect(passiveScore(3)).toBe(13);
    expect(passiveScore(0)).toBe(10);
  });

  it('checkPassiveInsight passa quando 10+atributo >= DC', () => {
    const insight = PASSIVE_INSIGHTS[0];
    const highAttrs: Attrs = { ...baseAttrs, [insight.attribute]: 10 };
    const lowAttrs: Attrs = { ...baseAttrs, [insight.attribute]: 0 };
    expect(checkPassiveInsight(insight, highAttrs)).toBe(true);
    expect(checkPassiveInsight(insight, lowAttrs)).toBe(false);
  });

  it('resolveInsightForScene não repete um insight já visto', () => {
    const insight = PASSIVE_INSIGHTS.find((i) => i.sceneId === 'intro')!;
    const highAttrs: Attrs = { ...baseAttrs, [insight.attribute]: 10 };
    expect(resolveInsightForScene('intro', highAttrs, [])).toEqual(insight);
    expect(resolveInsightForScene('intro', highAttrs, [insight.id])).toBeNull();
  });

  it('resolveInsightForScene devolve null para cena sem insight configurado', () => {
    expect(resolveInsightForScene('epilogue', baseAttrs, [])).toBeNull();
  });
});
