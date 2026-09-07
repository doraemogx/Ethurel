import { describe, it, expect } from 'vitest';
import { createEmptyWorldState, resolveEntityLifeState, resolveEntityLocation, hasWorldStateFlag, setWorldStateOverride } from '@/world/worldState';

describe('World State — separação CANON (default) vs CAMPAIGN (override)', () => {
  it('exemplo do usuário: cânone diz que Tolven existe, nesta campanha ele morreu', () => {
    const empty = createEmptyWorldState();
    // Sem override: default do cânone (nenhuma fonte documenta morte) é 'alive'.
    expect(resolveEntityLifeState('tolven-marr', empty)).toBe('alive');

    const afterDeath = setWorldStateOverride(empty, 'tolven-marr', { lifeState: 'dead' });
    expect(resolveEntityLifeState('tolven-marr', afterDeath)).toBe('dead');
    // O world state original não foi mutado (imutabilidade).
    expect(resolveEntityLifeState('tolven-marr', empty)).toBe('alive');
  });

  it('override de uma entidade não afeta outra', () => {
    const state = setWorldStateOverride(createEmptyWorldState(), 'tolven-marr', { lifeState: 'dead' });
    expect(resolveEntityLifeState('ynara-voss', state)).toBe('alive');
  });

  it('resolveEntityLocation cai para o default canônico quando não há override', () => {
    const empty = createEmptyWorldState();
    expect(resolveEntityLocation('tolven-marr', empty, 'varreth')).toBe('varreth');
    const moved = setWorldStateOverride(empty, 'tolven-marr', { locationId: 'estrada-velha' });
    expect(resolveEntityLocation('tolven-marr', moved, 'varreth')).toBe('estrada-velha');
  });

  it('flags por campanha são cumulativos, não substituem uns aos outros', () => {
    let state = setWorldStateOverride(createEmptyWorldState(), 'tolven-marr', { flags: { a: true } });
    state = setWorldStateOverride(state, 'tolven-marr', { flags: { b: true } });
    expect(hasWorldStateFlag('tolven-marr', state, 'a')).toBe(true);
    expect(hasWorldStateFlag('tolven-marr', state, 'b')).toBe(true);
    expect(hasWorldStateFlag('tolven-marr', state, 'c')).toBe(false);
  });
});
