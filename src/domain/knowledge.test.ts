import { describe, it, expect } from 'vitest';
import { upsertKnowledge } from '@/domain/knowledge';

describe('Diário de Campanha — upsertKnowledge', () => {
  it('insere uma entrada nova', () => {
    const entries = upsertKnowledge([], { id: 'a', category: 'pessoas', title: 'Tolven', summary: 'Guarda', state: 'confirmed' });
    expect(entries).toHaveLength(1);
    expect(entries[0].title).toBe('Tolven');
  });

  it('atualiza (upsert) em vez de duplicar quando o id já existe', () => {
    const first = upsertKnowledge([], { id: 'a', category: 'lugares', title: 'Fronteira', summary: 'rumor inicial', state: 'rumor' });
    const updated = upsertKnowledge(first, { id: 'a', category: 'lugares', title: 'Fronteira', summary: 'confirmado depois', state: 'confirmed' });
    expect(updated).toHaveLength(1);
    expect(updated[0].state).toBe('confirmed');
    expect(updated[0].summary).toBe('confirmado depois');
  });

  it('um rumor pode virar confirmado sem perder discoveredAt original', () => {
    const first = upsertKnowledge([], { id: 'b', category: 'criaturas', title: 'Algo', summary: '...', state: 'rumor' });
    const originalDiscoveredAt = first[0].discoveredAt;
    const updated = upsertKnowledge(first, { id: 'b', category: 'criaturas', title: 'Algo', summary: '...', state: 'confirmed' });
    expect(updated[0].discoveredAt).toBe(originalDiscoveredAt);
  });
});
