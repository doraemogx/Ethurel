import { describe, it, expect } from 'vitest';
import { arcaneZone } from '@/arcane/zone';

describe('arcaneZone', () => {
  it('classifica corretamente as fronteiras de Controle/Saturação/Ruptura', () => {
    expect(arcaneZone(0)).toBe('controle');
    expect(arcaneZone(59)).toBe('controle');
    expect(arcaneZone(60)).toBe('saturacao');
    expect(arcaneZone(89)).toBe('saturacao');
    expect(arcaneZone(90)).toBe('ruptura');
    expect(arcaneZone(100)).toBe('ruptura');
  });
});
