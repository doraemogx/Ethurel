import { describe, it, expect } from 'vitest';
import { LOCATION_ART, locationArtFor } from '@/ui/visual/locationArt';
import { LOCATIONS } from '@/data/locations';

describe('Registro de arte de local (Phase 3 §12/§50)', () => {
  it('locationArtFor devolve undefined para local sem arte curada, sem quebrar (ex.: fronteira)', () => {
    expect(locationArtFor('fronteira')).toBeUndefined();
    expect(locationArtFor('local-inexistente')).toBeUndefined();
  });

  it('todo local com entrada no registro corresponde a um local real de LOCATIONS', () => {
    const knownIds = new Set(LOCATIONS.map((l) => l.id));
    for (const id of Object.keys(LOCATION_ART)) {
      expect(knownIds.has(id)).toBe(true);
    }
  });

  it('Varreth, Borda dos Musgos e Estrada Velha têm arte real (os 3 locais do capítulo 1)', () => {
    expect(locationArtFor('varreth')?.base).toBeTruthy();
    expect(locationArtFor('borda-musgos')?.base).toBeTruthy();
    expect(locationArtFor('estrada-velha')?.base).toBeTruthy();
  });

  it('Borda dos Musgos tem tratamento Arcano distinto do fundo padrão (mesma arte, tratamento diferente — spec §12)', () => {
    const entry = locationArtFor('borda-musgos')!;
    expect(entry.arcaneTreatment).toBeTruthy();
    expect(entry.arcaneTreatment).not.toBe(entry.base);
  });
});
