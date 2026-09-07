import { describe, it, expect } from 'vitest';
import { WorldEventLog, appendWorldEvent, type WorldEvent } from '@/domain/worldEvents';

describe('WorldEventLog — taxonomia estruturada (Fase 2 §4)', () => {
  it('type default é "other" quando não especificado, mas aceita a taxonomia fechada', () => {
    const log = new WorldEventLog();
    const e1 = log.record({ actor: 'Kael', action: 'ajudou Tolven', location: 'varreth', result: 'ok' });
    expect(e1.type).toBe('other');

    const e2 = log.record({ actor: 'Kael', action: 'atacou o goblin', location: 'varreth', result: 'ok', type: 'player_attacked_npc' });
    expect(e2.type).toBe('player_attacked_npc');
  });

  it('visibility é derivada de witnesses quando não especificada: vazio -> private, não-vazio -> witnessed', () => {
    const log = new WorldEventLog();
    const priv = log.record({ actor: 'Kael', action: 'x', location: 'varreth', result: 'y' });
    expect(priv.visibility).toBe('private');

    const witnessed = log.record({ actor: 'Kael', action: 'x', location: 'varreth', result: 'y', witnesses: ['tolven'] });
    expect(witnessed.visibility).toBe('witnessed');

    const pub = log.record({ actor: 'Kael', action: 'x', location: 'varreth', result: 'y', visibility: 'public' });
    expect(pub.visibility).toBe('public');
  });

  it('consequences e relatedEntities default a array vazio/derivado de target, nunca undefined', () => {
    const log = new WorldEventLog();
    const e = log.record({ actor: 'Kael', action: 'ajudou', target: 'tolven', location: 'varreth', result: 'y' });
    expect(e.consequences).toEqual([]);
    expect(e.relatedEntities).toEqual(['tolven']);

    const e2 = log.record({ actor: 'Kael', action: 'ajudou', target: 'tolven', location: 'varreth', result: 'y', consequences: ['+4 confiança'], relatedEntities: ['tolven', 'thessa-aster'] });
    expect(e2.consequences).toEqual(['+4 confiança']);
    expect(e2.relatedEntities).toEqual(['tolven', 'thessa-aster']);
  });

  it('relevantTo também filtra por relatedEntity, além de location/tags', () => {
    const log = new WorldEventLog();
    log.record({ actor: 'Kael', action: 'a', location: 'estrada-velha', result: 'r', relatedEntities: ['ynara-voss'] });
    log.record({ actor: 'Kael', action: 'b', location: 'estrada-velha', result: 'r' });
    const found = log.relevantTo({ relatedEntity: 'ynara-voss' });
    expect(found).toHaveLength(1);
    expect(found[0].action).toBe('a');
  });

  it('involving traz todos os eventos onde a entidade é ator, alvo, ou relacionada, sem limite de janela', () => {
    const log = new WorldEventLog();
    log.record({ actor: 'tolven', action: 'a', location: 'varreth', result: 'r' });
    log.record({ actor: 'Kael', action: 'b', target: 'tolven', location: 'varreth', result: 'r' });
    log.record({ actor: 'Kael', action: 'c', location: 'varreth', result: 'r', relatedEntities: ['tolven'] });
    log.record({ actor: 'Kael', action: 'd', location: 'varreth', result: 'r' });
    expect(log.involving('tolven')).toHaveLength(3);
  });
});

describe('appendWorldEvent — atalho imutável preserva os novos campos', () => {
  it('não muta a lista original e o evento novo tem type/visibility/consequences/relatedEntities', () => {
    const original: WorldEvent[] = [];
    const next = appendWorldEvent(original, { actor: 'Kael', action: 'x', location: 'varreth', result: 'y', type: 'player_discovered_secret' });
    expect(original).toEqual([]);
    expect(next).toHaveLength(1);
    expect(next[0].type).toBe('player_discovered_secret');
    expect(next[0].consequences).toEqual([]);
  });
});
