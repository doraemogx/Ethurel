import { describe, it, expect } from 'vitest';
import { CANON_FIXED_MILESTONES, OBSERVED_ERAS, milestonesBefore } from '@/canon/timeline';

describe('CANON_FIXED_MILESTONES — marcos fixos do Livro II', () => {
  it('tem os 5 marcos confirmados, todos anteriores ao Ano 0', () => {
    expect(CANON_FIXED_MILESTONES).toHaveLength(5);
    for (const m of CANON_FIXED_MILESTONES) {
      expect(m.year).toBeLessThan(0);
      expect(m.name.length).toBeGreaterThan(0);
    }
  });

  it('nomes batem com a "Validação cronológica" lida na Bíblia', () => {
    const names = CANON_FIXED_MILESTONES.map((m) => m.name);
    expect(names).toEqual(['Pacto dos Bastiões', 'Queda do Arquivo', 'Fratura', 'Orven', 'Concordata']);
  });

  it('milestonesBefore retorna só marcos anteriores ao ano dado, em ordem cronológica', () => {
    const before117 = milestonesBefore(-117);
    expect(before117.map((m) => m.name)).toEqual(['Pacto dos Bastiões', 'Queda do Arquivo']);
    expect(milestonesBefore(-2000)).toEqual([]);
    expect(milestonesBefore(0)).toHaveLength(5);
  });
});

describe('OBSERVED_ERAS', () => {
  it('não fica vazio e não duplica nomes', () => {
    expect(OBSERVED_ERAS.length).toBeGreaterThan(0);
    expect(new Set(OBSERVED_ERAS).size).toBe(OBSERVED_ERAS.length);
  });
});
