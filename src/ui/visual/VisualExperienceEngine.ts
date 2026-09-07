/**
 * VisualExperienceEngine (Fase 2 §6) — ponto único que traduz o estado do
 * jogo (local, classe, zona Arcana, HP, condições, humor narrativo) numa
 * composição visual: fundo/partículas + overlay Arcano + vinheta de
 * status + cor de destaque. Antes disso, cada tela montava essa composição
 * na mão (`sceneArtFor(x)` + `arcaneOverlayFor(y)` espalhados) — isto
 * unifica sem reescrever `sceneArt.ts`/`classThemes.ts` (continuam sendo os
 * blocos de construção, spec §63 "não reescrever o que funciona").
 */
import type { AmbientProfile } from '@/world/types';
import type { ArcaneZone } from '@/arcane/zone';
import { sceneArtFor, arcaneOverlayFor, type SceneArtStyle } from '@/ui/visual/sceneArt';
import { getClassTheme } from '@/ui/visual/classThemes';

export type VignetteKind = 'none' | 'hurt' | 'low-hp' | 'poison';

export interface VisualContext {
  ambientProfile: AmbientProfile;
  classId?: string;
  arcaneZone: ArcaneZone;
  /** 0..1 — usado para decidir vinheta de baixo HP (distinta de dano recente). */
  hpRatio?: number;
  /** true só no instante logo após um golpe — vinheta "hurt" é transitória, não constante. */
  justHurt?: boolean;
  poisoned?: boolean;
  reduceMotion?: boolean;
}

export interface VisualComposition {
  art: SceneArtStyle;
  arcaneOverlay: { opacity: number; pulseMs: number; hueShift: number };
  accent: string;
  vignette: VignetteKind;
  reduceMotion: boolean;
}

export function composeVisualExperience(ctx: VisualContext): VisualComposition {
  const baseArt = sceneArtFor(ctx.ambientProfile);
  const theme = ctx.classId ? getClassTheme(ctx.classId) : undefined;

  // A arte do LOCAL sempre domina a paleta (spec §5); a classe só empresta
  // a cor de partícula quando a cena é sobre o personagem (criação, ficha,
  // combate) — nunca substitui a atmosfera do mundo por completo.
  const art: SceneArtStyle = theme ? { ...baseArt, particleColor: theme.accent } : baseArt;

  let vignette: VignetteKind = 'none';
  if (ctx.justHurt) vignette = 'hurt';
  else if (ctx.poisoned) vignette = 'poison';
  else if (ctx.hpRatio !== undefined && ctx.hpRatio <= 0.3) vignette = 'low-hp';

  return {
    art,
    arcaneOverlay: arcaneOverlayFor(ctx.arcaneZone),
    accent: theme?.accent ?? '#9f7fe0',
    vignette,
    reduceMotion: ctx.reduceMotion ?? false,
  };
}
