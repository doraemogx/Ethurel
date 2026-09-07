import { describe, it, expect } from 'vitest';
import { NPCS } from '@/data/npcs';
import { findCanonNpcDossier } from '@/canon/npcRegistry';

describe('NPCS — Tolven alinhado ao cânone V7 (Fase 2 §13)', () => {
  it('role reflete a profissão canônica (ferreiro), não mais "guarda-caminho"', () => {
    const tolven = NPCS.find((n) => n.id === 'tolven')!;
    expect(tolven.role).toBe('Ferreiro de Varreth');
    expect(tolven.role.toLowerCase()).not.toContain('guarda-caminho');
  });

  it('a profissão do jogo bate com o dossiê canônico de Tolven Marr', () => {
    const dossier = findCanonNpcDossier('tolven-marr')!;
    const tolven = NPCS.find((n) => n.id === 'tolven')!;
    expect(dossier.profession.toLowerCase()).toContain('ferreiro');
    expect(tolven.role.toLowerCase()).toContain('ferreiro');
  });
});
