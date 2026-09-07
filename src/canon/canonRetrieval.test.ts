import { describe, it, expect } from 'vitest';
import { retrieveCanonContext, canonRegistrySize } from '@/canon/canonRetrieval';
import { CANON_CORE_FACTS } from '@/canon/canonCore';

describe('retrieveCanonContext — recorte seletivo, nunca o registro inteiro', () => {
  it('exemplo do usuário: cena em Varreth com Tolven traz CANON_CORE + Varreth + território + Tolven + relações, não o registro inteiro', () => {
    const ctx = retrieveCanonContext({ locationId: 'varreth', npcName: 'Tolven' });

    expect(ctx.core).toEqual(CANON_CORE_FACTS);
    expect(ctx.location?.canonicalId).toBe('varreth');
    expect(ctx.territory?.canonicalId).toBe('orren');
    expect(ctx.npc?.canonicalId).toBe('tolven-marr');
    expect(ctx.npcDossier?.canonicalName).toBe('Tolven Marr');
    expect(ctx.npcDossier?.relations.length).toBeGreaterThan(0);

    // A prova central do requisito: o recorte é uma fração pequena do
    // registro inteiro, não a Bíblia/registro completo carregado de uma vez.
    expect(ctx.summaryLines.length).toBeLessThan(canonRegistrySize());
    expect(ctx.summaryLines.length).toBeLessThan(20);
  });

  it('query vazia traz só CANON_CORE (sempre presente, nunca o resto)', () => {
    const ctx = retrieveCanonContext({});
    expect(ctx.location).toBeUndefined();
    expect(ctx.npc).toBeUndefined();
    expect(ctx.summaryLines.length).toBe(CANON_CORE_FACTS.length);
  });

  it('recupera por classe/origem/povo/facção/evento histórico independentemente', () => {
    const ctx = retrieveCanonContext({
      className: 'Portador de Cinza',
      originName: 'Bastião Caído',
      peopleName: 'Povo do Musgo Antigo',
      factionName: 'A Vigília',
      historicalEventName: 'Fratura',
    });
    expect(ctx.classEntity?.canonicalId).toBe('portador-de-cinza');
    expect(ctx.origin?.canonicalId).toBe('bastiao-caido');
    expect(ctx.people?.canonicalId).toBe('musgo-antigo');
    expect(ctx.faction?.canonicalId).toBe('a-vigilia');
    expect(ctx.historicalEvent?.year).toBe(-117);
  });

  it('nome não resolvível não quebra — campo fica undefined, sem lançar', () => {
    const ctx = retrieveCanonContext({ npcName: 'Alguém Que Não Existe' });
    expect(ctx.npc).toBeUndefined();
    expect(() => retrieveCanonContext({ locationId: 'local-inexistente' })).not.toThrow();
  });

  it('entidades relacionadas são resolvidas em lote, sem duplicar o que já veio de outros campos', () => {
    const ctx = retrieveCanonContext({ npcName: 'Tolven', relatedEntityNames: ['Varreth', 'Orren'] });
    expect(ctx.relatedEntities.map((e) => e.canonicalId).sort()).toEqual(['orren', 'varreth']);
  });
});
