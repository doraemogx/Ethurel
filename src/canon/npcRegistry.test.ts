import { describe, it, expect } from 'vitest';
import { CANON_NPC_DOSSIERS, findCanonNpcDossier } from '@/canon/npcRegistry';
import { resolveCanonEntity } from '@/canon/entityRegistry';

describe('CANON_NPC_DOSSIERS — Livro VII (dossiê bespoke, não texto-modelo)', () => {
  it('Tolven Marr tem os fatos específicos lidos na Bíblia, não texto genérico', () => {
    const d = findCanonNpcDossier('tolven-marr')!;
    expect(d.birthplace).toBe('Veyr');
    expect(d.profession).toContain('Ferreiro');
    expect(d.relations.map((r) => r.npcName)).toEqual(['Thessa Aster', 'Hadrik Arven', 'Bram Kest']);
    expect(d.secret.length).toBeGreaterThan(0);
  });

  it('findCanonNpcDossier retorna undefined para id não catalogado, sem lançar erro', () => {
    expect(findCanonNpcDossier('npc-que-nao-existe')).toBeUndefined();
  });

  it('todo dossiê tem canonicalId correspondente no Entity Registry', () => {
    for (const d of CANON_NPC_DOSSIERS) {
      expect(resolveCanonEntity(d.canonicalName)?.canonicalId).toBe(d.canonicalId);
    }
  });
});
