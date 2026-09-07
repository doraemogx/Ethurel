import { describe, it, expect } from 'vitest';
import {
  ATTR_POINT_BUDGET,
  MAX_BONUS_PER_ATTR,
  emptyAdjustments,
  pointsSpent,
  canIncrease,
  increase,
  decrease,
  applyAdjustments,
} from '@/domain/attributeDistribution';

describe('Distribuição de Atributos (Phase 3 §11)', () => {
  it('começa em zero, sem pontos gastos', () => {
    const adj = emptyAdjustments();
    expect(pointsSpent(adj)).toBe(0);
  });

  it('increase gasta 1 ponto do orçamento', () => {
    let adj = emptyAdjustments();
    adj = increase(adj, 'vigor');
    expect(adj.vigor).toBe(1);
    expect(pointsSpent(adj)).toBe(1);
  });

  it('nunca deixa gastar mais que o orçamento total', () => {
    let adj = emptyAdjustments();
    for (let i = 0; i < 10; i++) adj = increase(adj, 'vigor');
    expect(pointsSpent(adj)).toBeLessThanOrEqual(ATTR_POINT_BUDGET);
  });

  it('nunca deixa um único atributo passar do bônus máximo', () => {
    let adj = emptyAdjustments();
    adj = increase(adj, 'mente');
    adj = increase(adj, 'mente');
    adj = increase(adj, 'mente'); // 3º ponto ainda cabe no orçamento total, mas estoura o teto por atributo
    expect(adj.mente).toBeLessThanOrEqual(MAX_BONUS_PER_ATTR);
  });

  it('canIncrease reflete corretamente os dois limites (orçamento e teto por atributo)', () => {
    let adj = emptyAdjustments();
    adj = increase(adj, 'vigor');
    adj = increase(adj, 'vigor');
    expect(canIncrease(adj, 'vigor')).toBe(false); // bateu no teto por atributo
    expect(canIncrease(adj, 'reflexo')).toBe(true); // ainda tem orçamento
  });

  it('decrease nunca vai abaixo de zero (não pode reduzir o preset da classe)', () => {
    let adj = emptyAdjustments();
    adj = decrease(adj, 'vigor');
    expect(adj.vigor).toBe(0);
  });

  it('applyAdjustments soma o preset da classe + ancestralidade com os pontos distribuídos', () => {
    const preset = { vigor: 4, reflexo: 2, mente: 3, presenca: 2 };
    let adj = emptyAdjustments();
    adj = increase(adj, 'vigor');
    const result = applyAdjustments(preset, adj);
    expect(result).toEqual({ vigor: 5, reflexo: 2, mente: 3, presenca: 2 });
  });

  it('reset (emptyAdjustments) sempre volta exatamente ao preset recomendado', () => {
    const preset = { vigor: 4, reflexo: 2, mente: 3, presenca: 2 };
    expect(applyAdjustments(preset, emptyAdjustments())).toEqual(preset);
  });
});
