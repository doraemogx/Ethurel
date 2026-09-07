import { describe, it, expect } from 'vitest';
import { createCharacterModel } from '@/domain/characterFactory';
import { ANCESTRIES } from '@/data/ancestries';

describe('characterFactory — ancestralidade e retrato (Phase 3)', () => {
  it('sem ancestryId, o personagem nasce sem ancestralidade (compatibilidade retroativa, nunca inventa uma)', () => {
    const c = createCharacterModel({ name: 'Teste', gender: 'outro', classId: 'portador-de-cinza', originId: 'cinzas-longas' });
    expect(c.ancestryId).toBeUndefined();
  });

  it('com ancestryId, aplica o attrBonus da ancestralidade por cima do baseAttrs da classe', () => {
    const ancestry = ANCESTRIES.find((a) => a.attrBonus.vigor)!;
    const withAncestry = createCharacterModel({
      name: 'Teste', gender: 'outro', classId: 'portador-de-cinza', originId: 'cinzas-longas', ancestryId: ancestry.id,
    });
    const without = createCharacterModel({ name: 'Teste', gender: 'outro', classId: 'portador-de-cinza', originId: 'cinzas-longas' });
    expect(withAncestry.attrs.vigor).toBe(without.attrs.vigor + (ancestry.attrBonus.vigor ?? 0));
    expect(withAncestry.ancestryId).toBe(ancestry.id);
  });

  it('baseAttrs custom (passo Atributos) é respeitado antes do bônus de Origem', () => {
    const c = createCharacterModel({
      name: 'Teste',
      gender: 'outro',
      classId: 'portador-de-cinza',
      originId: 'cinzas-longas', // +1 vigor
      baseAttrs: { vigor: 9, reflexo: 9, mente: 9, presenca: 9 },
    });
    expect(c.attrs).toEqual({ vigor: 10, reflexo: 9, mente: 9, presenca: 9 });
  });

  it('com portraitProfileId válido, o visualProfile carrega o retrato escolhido', () => {
    const c = createCharacterModel({
      name: 'Teste', gender: 'feminino', classId: 'arauto-do-musgo', originId: 'fronteira-partida', portraitProfileId: 'player-viajante-a',
    });
    expect(c.visualProfile.id).toBe('player-viajante-a');
    expect(c.visualProfile.portrait).toBeTruthy();
    expect(c.visualProfile.presentation).toBe('feminino');
  });

  it('sem portraitProfileId, o visualProfile fica sem imagem (fallback de silhueta na UI, nunca quebra)', () => {
    const c = createCharacterModel({ name: 'Teste', gender: 'masculino', classId: 'portador-de-cinza', originId: 'cinzas-longas' });
    expect(c.visualProfile.portrait).toBeUndefined();
  });
});
