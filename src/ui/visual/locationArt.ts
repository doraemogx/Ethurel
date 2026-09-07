/**
 * Registro de arte de local (Phase 3 §12/§50) — fundo real por local, não só
 * gradiente. Cada entrada pode reaproveitar a MESMA imagem com tratamentos
 * diferentes (dia/Arcane/combate) em vez de exigir arte única por momento
 * (§12). Origem/licença de cada arquivo em docs/assets/ASSET-CATALOG.md.
 *
 * Nem todo local tem arte curada ainda (ex.: `fronteira`/Fronteira Partida —
 * nenhum pack da Phase 3 cobria essa região) — ausência aqui é intencional,
 * a UI cai para o gradiente atmosférico de sempre (`sceneArtFor`), nunca
 * quebra.
 */
const IMG = '/assets/img';

export interface LocationArtEntry {
  /** Fundo padrão (Controle). */
  base: string;
  /** Usado quando a zona Arcana é Saturação/Ruptura — mesmo local, tratamento diferente. */
  arcaneTreatment?: string;
  /** Camadas de primeiro plano (parallax simples), opcionais. */
  foreground?: string[];
}

export const LOCATION_ART: Record<string, LocationArtEntry> = {
  varreth: {
    base: `${IMG}/backgrounds/varreth-market.webp`,
  },
  'borda-musgos': {
    base: `${IMG}/backgrounds/borda-musgos-day.webp`,
    arcaneTreatment: `${IMG}/backgrounds/borda-musgos-bloodmoon.webp`,
    foreground: [`${IMG}/overlays/mushrooms-glow.webp`, `${IMG}/overlays/foliage.webp`],
  },
  'estrada-velha': {
    base: `${IMG}/backgrounds/estrada-velha-day.webp`,
  },
};

export function locationArtFor(locationId: string): LocationArtEntry | undefined {
  return LOCATION_ART[locationId];
}
