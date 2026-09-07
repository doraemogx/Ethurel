import { describe, it, expect } from 'vitest';
import { npcCanAccessFact, filterFactsForNpc, factsAboutEntity, SEED_CANON_FACTS, type CanonFact } from '@/canon/knowledgeAccess';

describe('npcCanAccessFact — um NPC não acessa automaticamente tudo', () => {
  it('verdade_autoral nunca é acessível diretamente por nenhum NPC', () => {
    const fact: CanonFact = { id: 'x', statement: 'y', truthLayer: 'verdade_autoral' };
    expect(npcCanAccessFact(fact, 'qualquer-npc')).toBe(false);
  });

  it('conhecimento_do_mundo e rumor são públicos — qualquer NPC do contexto acessa', () => {
    const world: CanonFact = { id: 'a', statement: 'b', truthLayer: 'conhecimento_do_mundo' };
    const rumor: CanonFact = { id: 'c', statement: 'd', truthLayer: 'rumor' };
    expect(npcCanAccessFact(world, 'npc-qualquer')).toBe(true);
    expect(npcCanAccessFact(rumor, 'outro-npc-qualquer')).toBe(true);
  });

  it('segredo_de_campanha só é acessível a quem está em knownBy', () => {
    const secret: CanonFact = { id: 's', statement: 't', truthLayer: 'segredo_de_campanha', knownBy: ['tolven-marr', 'thessa-aster'] };
    expect(npcCanAccessFact(secret, 'tolven-marr')).toBe(true);
    expect(npcCanAccessFact(secret, 'bram-kest')).toBe(false);
  });

  it('crenca com knownBy restrito só é acessível a quem acredita', () => {
    const belief: CanonFact = { id: 'cr', statement: 'x', truthLayer: 'crenca', knownBy: ['bram-kest'] };
    expect(npcCanAccessFact(belief, 'bram-kest')).toBe(true);
    expect(npcCanAccessFact(belief, 'hadrik-arven')).toBe(false);
  });
});

describe('filterFactsForNpc — dado canônico real (dossiê de Tolven Marr)', () => {
  it('Tolven acessa o próprio segredo e o fato público sobre sua profissão, não a crença de Bram', () => {
    const facts = filterFactsForNpc(SEED_CANON_FACTS, 'tolven-marr');
    const ids = facts.map((f) => f.id);
    expect(ids).toContain('tolven-profession');
    expect(ids).toContain('tolven-secret-altered-record');
    expect(ids).toContain('hadrik-can-contradict-tolven');
    expect(ids).not.toContain('bram-suspects-tolven');
  });

  it('Bram Kest acessa só a própria crença e o fato público — não o segredo de Tolven', () => {
    const facts = filterFactsForNpc(SEED_CANON_FACTS, 'bram-kest');
    const ids = facts.map((f) => f.id);
    expect(ids).toContain('bram-suspects-tolven');
    expect(ids).toContain('tolven-profession');
    expect(ids).not.toContain('tolven-secret-altered-record');
  });

  it('um NPC não catalogado em nenhum knownBy só acessa camadas públicas', () => {
    const facts = filterFactsForNpc(SEED_CANON_FACTS, 'npc-qualquer-sem-relacao');
    expect(facts.map((f) => f.id)).toEqual(['tolven-profession']);
  });
});

describe('factsAboutEntity', () => {
  it('traz só fatos relacionados à entidade pedida', () => {
    const facts = factsAboutEntity(SEED_CANON_FACTS, 'thessa-aster');
    expect(facts.every((f) => f.relatedEntityIds?.includes('thessa-aster'))).toBe(true);
    expect(facts.length).toBeGreaterThan(0);
  });
});
