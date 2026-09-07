import { describe, it, expect } from 'vitest';
import { arcaneIdentityForClass, arcaneResonance } from '@/arcane/identity';
import { CLASSES } from '@/data/classes';

describe('ArcaneIdentity', () => {
  it('toda classe tem um sigilo com label próprio e motivo derivado do tema', () => {
    for (const c of CLASSES) {
      const identity = arcaneIdentityForClass(c.id);
      expect(identity.label).toBeTruthy();
      expect(identity.label).not.toBe('Sigilo Sem Nome');
      expect(identity.motif).toBeTruthy();
    }
  });

  it('classe desconhecida cai num sigilo genérico em vez de quebrar', () => {
    const identity = arcaneIdentityForClass('classe-que-nao-existe');
    expect(identity.label).toBe('Sigilo Sem Nome');
  });

  it('cor de ressonância muda por zona, nunca o verde do sistema antigo', () => {
    const controle = arcaneResonance('controle');
    const saturacao = arcaneResonance('saturacao');
    const ruptura = arcaneResonance('ruptura');
    expect(new Set([controle, saturacao, ruptura]).size).toBe(3);
    for (const color of [controle, saturacao, ruptura]) {
      expect(color.toLowerCase()).not.toContain('green');
    }
  });
});
