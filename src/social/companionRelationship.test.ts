import { describe, it, expect } from 'vitest';
import { applyRelationshipDelta, getOrCreateRelationship } from '@/social/companionRelationship';
import { createEmptyRelationshipState } from '@/save/schema';

describe('applyRelationshipDelta — múltiplas dimensões, não uma barra única', () => {
  it('aplica deltas em dimensões distintas independentemente, sem afetar as outras', () => {
    const state = applyRelationshipDelta(undefined, [
      { dimension: 'trust', delta: 5 },
      { dimension: 'fear', delta: 3 },
    ]);
    expect(state.trust).toBe(5);
    expect(state.fear).toBe(3);
    expect(state.affinity).toBe(0);
    expect(state.resentment).toBe(0);
  });

  it('confiança e medo podem crescer ao mesmo tempo — não são opostos forçados', () => {
    const state = applyRelationshipDelta(createEmptyRelationshipState(), [
      { dimension: 'trust', delta: 10 },
      { dimension: 'fear', delta: 10 },
    ]);
    expect(state.trust).toBe(10);
    expect(state.fear).toBe(10);
  });

  it('cada dimensão é clampada -100..100 independentemente', () => {
    const state = applyRelationshipDelta(undefined, [{ dimension: 'resentment', delta: 500 }]);
    expect(state.resentment).toBe(100);
    const state2 = applyRelationshipDelta(state, [{ dimension: 'resentment', delta: -1000 }]);
    expect(state2.resentment).toBe(-100);
  });

  it('não muta o estado original (imutável)', () => {
    const original = createEmptyRelationshipState();
    applyRelationshipDelta(original, [{ dimension: 'debt', delta: 5 }]);
    expect(original.debt).toBe(0);
  });

  it('dívida aceita valores negativos (o personagem pode dever ao NPC)', () => {
    const state = applyRelationshipDelta(undefined, [{ dimension: 'debt', delta: -20 }]);
    expect(state.debt).toBe(-20);
  });
});

describe('getOrCreateRelationship', () => {
  it('devolve o estado existente quando o NPC já tem relação registrada', () => {
    const relationships = { tolven: applyRelationshipDelta(undefined, [{ dimension: 'trust', delta: 8 }]) };
    expect(getOrCreateRelationship(relationships, 'tolven').trust).toBe(8);
  });

  it('devolve um estado vazio (não undefined) para NPC sem relação registrada ainda', () => {
    expect(getOrCreateRelationship({}, 'npc-novo')).toEqual(createEmptyRelationshipState());
  });
});
