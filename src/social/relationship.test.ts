import { describe, it, expect } from 'vitest';
import { relationshipLabel } from '@/social/relationship';

describe('relationshipLabel — nunca expõe o número cru', () => {
  it('mapeia confiança para os 4 rótulos narrativos esperados', () => {
    expect(relationshipLabel(-5)).toBe('Desconfiado');
    expect(relationshipLabel(0)).toBe('Neutro');
    expect(relationshipLabel(3)).toBe('Receptivo');
    expect(relationshipLabel(9)).toBe('Próximo');
  });
});
