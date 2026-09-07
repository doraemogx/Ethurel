import { describe, it, expect } from 'vitest';
import { migrate005To006 } from '@/save/migrations/005_to_006';
import { createEmptySaveV5 } from '@/save/schema';
import type { WorldEvent } from '@/domain/worldEvents';

describe('migrate005To006 — puramente aditivo', () => {
  it('preserva todos os campos de v5 e adiciona worldState vazio', () => {
    const v5 = createEmptySaveV5();
    v5.currentLocationId = 'estrada-velha';
    const v6 = migrate005To006(v5);
    expect(v6.schemaVersion).toBe(6);
    expect(v6.currentLocationId).toBe('estrada-velha');
    expect(v6.worldState).toEqual({ entityOverrides: {} });
  });

  it('backfill de relationships: dimensões novas nascem zeradas, as antigas são preservadas', () => {
    const v5 = createEmptySaveV5();
    v5.relationships = { doran: { affinity: 5, trust: 3, fear: 0, respect: 2, flags: ['aliado'] } };
    const v6 = migrate005To006(v5);
    expect(v6.relationships.doran).toEqual({ affinity: 5, trust: 3, fear: 0, respect: 2, resentment: 0, debt: 0, suspicion: 0, flags: ['aliado'] });
  });

  it('backfill de worldEvents antigos (sem type/visibility/consequences/relatedEntities gravados)', () => {
    const v5 = createEmptySaveV5();
    // Simula um evento gravado por uma versão anterior do código, sem os campos novos.
    const legacyEvent = { id: 'evt-1', turn: 1, actor: 'Kael', action: 'ajudou', target: 'tolven', location: 'varreth', witnesses: ['tolven'], result: 'ok', tags: [], timestamp: 1 } as unknown as WorldEvent;
    v5.worldEvents = [legacyEvent];
    const v6 = migrate005To006(v5);
    expect(v6.worldEvents[0].type).toBe('other');
    expect(v6.worldEvents[0].visibility).toBe('witnessed');
    expect(v6.worldEvents[0].consequences).toEqual([]);
    expect(v6.worldEvents[0].relatedEntities).toEqual(['tolven']);
  });

  it('worldEvent legado sem testemunhas vira visibility private no backfill', () => {
    const v5 = createEmptySaveV5();
    const legacyEvent = { id: 'evt-2', turn: 1, actor: 'Kael', action: 'x', location: 'varreth', witnesses: [], result: 'ok', tags: [], timestamp: 1 } as unknown as WorldEvent;
    v5.worldEvents = [legacyEvent];
    const v6 = migrate005To006(v5);
    expect(v6.worldEvents[0].visibility).toBe('private');
  });
});
