import { describe, it, expect } from 'vitest';
import { ANCESTRIES, findAncestry, findVariant } from '@/data/ancestries';

describe('Ancestralidade (Phase 3 §7)', () => {
  it('tem entre 3 e 4 ancestralidades (spec: preferência inicial 3-4)', () => {
    expect(ANCESTRIES.length).toBeGreaterThanOrEqual(3);
    expect(ANCESTRIES.length).toBeLessThanOrEqual(4);
  });

  it('cada ancestralidade tem ids únicos e ao menos 1 variante com diferença real (descrição própria)', () => {
    const ids = new Set(ANCESTRIES.map((a) => a.id));
    expect(ids.size).toBe(ANCESTRIES.length);
    for (const a of ANCESTRIES) {
      expect(a.variants.length).toBeGreaterThanOrEqual(1);
      const variantIds = new Set(a.variants.map((v) => v.id));
      expect(variantIds.size).toBe(a.variants.length);
      for (const v of a.variants) {
        expect(v.description.length).toBeGreaterThan(10);
        expect(v.flavorNote.length).toBeGreaterThan(5);
      }
    }
  });

  it('não é só "+1 atributo e nada mais" — cada ancestralidade afeta aparência/percepção/reconhecimento', () => {
    for (const a of ANCESTRIES) {
      expect(a.appearanceNote.length).toBeGreaterThan(10);
      expect(a.npcRecognitionHook.length).toBeGreaterThan(10);
      // atrBonus é pequeno (mesma escala do resto do jogo), nunca mais que +1
      const total = Object.values(a.attrBonus).reduce((s, v) => s + (v ?? 0), 0);
      expect(total).toBeLessThanOrEqual(1);
    }
  });

  it('findAncestry/findVariant resolvem por id e são undefined-safe', () => {
    expect(findAncestry(undefined)).toBeUndefined();
    expect(findAncestry('inexistente')).toBeUndefined();
    const a = findAncestry(ANCESTRIES[0].id);
    expect(a).toBeDefined();
    expect(findVariant(a, 'inexistente')).toBeUndefined();
    expect(findVariant(a, a!.variants[0].id)).toEqual(a!.variants[0]);
    expect(findVariant(undefined, 'x')).toBeUndefined();
  });
});
