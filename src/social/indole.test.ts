import { describe, it, expect } from 'vitest';
import { createInitialIndole, createInitialReputation, resolveWorldEvent, type SocialState } from '@/social/indole';

describe('Índole/Reputação', () => {
  it('evento com witnesses "none" só afeta Índole, nunca Reputação', () => {
    const state: SocialState = { indole: createInitialIndole(), reputation: createInitialReputation() };
    const next = resolveWorldEvent(state, {
      id: 'teste',
      indoleDelta: [{ trait: 'pragmatismo', delta: 5 }],
      reputationDelta: [{ entity: 'varreth', delta: 10 }],
      witnesses: 'none',
    });
    expect(next.indole.pragmatismo).toBe(5);
    expect(next.reputation.varreth).toBeUndefined();
  });

  it('evento com witnesses "public" afeta Índole E Reputação', () => {
    const state: SocialState = { indole: createInitialIndole(), reputation: createInitialReputation() };
    const next = resolveWorldEvent(state, {
      id: 'teste',
      indoleDelta: [{ trait: 'honra', delta: 3 }],
      reputationDelta: [{ entity: 'varreth', delta: 5 }],
      witnesses: 'public',
    });
    expect(next.indole.honra).toBe(3);
    expect(next.reputation.varreth).toBe(5);
  });

  it('as duas decisões da quest piloto produzem estados distintos e independentes', () => {
    const base: SocialState = { indole: createInitialIndole(), reputation: createInitialReputation() };

    const reported = resolveWorldEvent(base, {
      id: 'raiz-sussurrou:reportou',
      indoleDelta: [{ trait: 'honra', delta: 3 }, { trait: 'autocontrole', delta: 2 }],
      reputationDelta: [{ entity: 'varreth', delta: 5 }],
      witnesses: 'public',
    });
    const kept = resolveWorldEvent(base, {
      id: 'raiz-sussurrou:guardou',
      indoleDelta: [{ trait: 'pragmatismo', delta: 3 }, { trait: 'ambicao', delta: 2 }],
      witnesses: 'none',
    });

    expect(reported.reputation.varreth).toBe(5);
    expect(kept.reputation.varreth).toBeUndefined();
    expect(reported.indole.pragmatismo).toBe(0);
    expect(kept.indole.honra).toBe(0);
  });

  it('valores de Índole ficam sempre dentro de [-100,100]', () => {
    const state: SocialState = { indole: createInitialIndole(), reputation: createInitialReputation() };
    const next = resolveWorldEvent(state, {
      id: 'extremo',
      indoleDelta: [{ trait: 'crueldade', delta: 999 }],
      witnesses: 'none',
    });
    expect(next.indole.crueldade).toBe(100);
  });
});
