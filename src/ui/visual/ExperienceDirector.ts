/**
 * ExperienceDirector (Phase 3 §15) — evolução do VisualExperienceEngine da
 * Fase 2: recebe o estado do jogo (local, zona Arcana, HP, condição de
 * combate, classe, redução de movimento) e devolve UMA composição visual
 * completa — fundo real + gradiente/partículas + overlay Arcano + vinheta +
 * cor de destaque. Regras de jogo continuam totalmente separadas disto (este
 * módulo só lê estado, nunca decide dano/HP/Foco/etc).
 *
 * Honestidade de escopo (spec §27): a lista do prompt também cita
 * tempo-do-dia, clima e "tratamento de portrait" como entradas — Ethurel não
 * tem sistema de tempo/clima nesta fatia vertical (nenhum dos dois nunca
 * existiu no jogo, não é uma regressão), e tratamento de portrait por humor é
 * feito hoje pelo sistema de expressões (`visualRegistry.ts`), não por este
 * módulo. Este Director cobre exatamente os sinais que o jogo realmente tem:
 * local, zona Arcana, HP, dano recente, veneno, classe, reduceMotion.
 */
import type { AmbientProfile } from '@/world/types';
import type { ArcaneZone } from '@/arcane/zone';
import { sceneArtFor, arcaneOverlayFor, type SceneArtStyle } from '@/ui/visual/sceneArt';
import { getClassTheme } from '@/ui/visual/classThemes';
import { locationArtFor } from '@/ui/visual/locationArt';

export type VignetteKind = 'none' | 'hurt' | 'low-hp' | 'poison';

export interface ExperienceContext {
  /** Id do local (`src/data/locations.ts`) — usado para resolver arte real; opcional para telas sem local (ex.: criação de personagem). */
  locationId?: string;
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

export interface ExperienceComposition {
  art: SceneArtStyle;
  arcaneOverlay: { opacity: number; pulseMs: number; hueShift: number };
  accent: string;
  vignette: VignetteKind;
  reduceMotion: boolean;
  backgroundImage?: string;
  foregroundImages?: string[];
}

export function composeExperience(ctx: ExperienceContext): ExperienceComposition {
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

  const locationArt = ctx.locationId ? locationArtFor(ctx.locationId) : undefined;
  const arcaneActive = ctx.arcaneZone === 'saturacao' || ctx.arcaneZone === 'ruptura';
  const backgroundImage = arcaneActive && locationArt?.arcaneTreatment ? locationArt.arcaneTreatment : locationArt?.base;

  return {
    art,
    arcaneOverlay: arcaneOverlayFor(ctx.arcaneZone),
    accent: theme?.accent ?? '#9f7fe0',
    vignette,
    reduceMotion: ctx.reduceMotion ?? false,
    backgroundImage,
    foregroundImages: locationArt?.foreground,
  };
}
