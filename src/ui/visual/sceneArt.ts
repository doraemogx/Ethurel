import type { AmbientProfile } from '@/world/types';
import type { ArcaneZone } from '@/arcane/zone';

/**
 * Fallback atmosférico por local (spec §65: sem arte final, usar
 * gradientes/camadas elegantes via CSS — nunca pixel art procedural nem
 * assets antigos do top-down). A arte muda por cena, não a UI (spec §13):
 * isto é conteúdo de `Location`, a moldura ao redor é sempre mística.
 */
export interface SceneArtStyle {
  gradient: string;
  particleColor: string;
  particleMotif: 'ash' | 'thread' | 'trail' | 'shadow' | 'stone' | 'moss' | 'sigil' | 'bone' | 'rain' | 'spore';
}

const AMBIENT_STYLES: Record<AmbientProfile, SceneArtStyle> = {
  village: {
    gradient: 'radial-gradient(120% 90% at 50% 0%, #3a2f2a 0%, #241c1e 45%, #14101a 100%)',
    particleColor: '#d8b872',
    particleMotif: 'ash',
  },
  forest: {
    gradient: 'radial-gradient(120% 90% at 50% 0%, #1e3327 0%, #16241f 45%, #10121a 100%)',
    particleColor: '#8fd19a',
    particleMotif: 'spore',
  },
  road: {
    gradient: 'radial-gradient(120% 90% at 50% 0%, #2c2a3a 0%, #1e1c2c 45%, #100e1a 100%)',
    particleColor: '#a79fc4',
    particleMotif: 'rain',
  },
  cave: {
    gradient: 'radial-gradient(120% 90% at 50% 0%, #1a1a24 0%, #131320 45%, #0b0a16 100%)',
    particleColor: '#6f8ab0',
    particleMotif: 'stone',
  },
  fissure: {
    gradient: 'radial-gradient(120% 90% at 50% 0%, #332419 0%, #211810 45%, #14100c 100%)',
    particleColor: '#c9973f',
    particleMotif: 'sigil',
  },
  ashlands: {
    gradient: 'radial-gradient(120% 90% at 50% 0%, #3d2620 0%, #271a1c 45%, #14101a 100%)',
    particleColor: '#d97a4f',
    particleMotif: 'ash',
  },
  archive: {
    gradient: 'radial-gradient(120% 90% at 50% 0%, #1c2a3a 0%, #16202c 45%, #0b0a16 100%)',
    particleColor: '#7fa8d9',
    particleMotif: 'thread',
  },
};

export function sceneArtFor(ambientProfile: AmbientProfile): SceneArtStyle {
  return AMBIENT_STYLES[ambientProfile];
}

/** Tensão Arcane reage sutilmente por cima da arte da cena — não substitui a
 * atmosfera do local (spec §43: Controle quase imperceptível, Saturação
 * pulsa, Ruptura distorce de verdade). */
export function arcaneOverlayFor(zone: ArcaneZone): { opacity: number; pulseMs: number; hueShift: number } {
  if (zone === 'ruptura') return { opacity: 0.55, pulseMs: 900, hueShift: 40 };
  if (zone === 'saturacao') return { opacity: 0.25, pulseMs: 1800, hueShift: 15 };
  return { opacity: 0.06, pulseMs: 3200, hueShift: 0 };
}
