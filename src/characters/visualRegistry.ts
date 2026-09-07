/**
 * Registro central de identidade visual (Phase 3 §8/§46) — todo
 * `CharacterVisualProfile` usado no jogo vem daqui, por id, para que a mesma
 * identidade apareça igual em criação/ficha/diálogo/Origens (nunca uma troca
 * aleatória de rosto). Assets processados em `public/assets/img/` — origem e
 * licença de cada um em `docs/assets/ASSET-CATALOG.md`.
 */
import type { CharacterVisualProfile, Gender } from '@/characters/types';
import { IMG } from '@/ui/assetPath';

export const VISUAL_PROFILES: Record<string, CharacterVisualProfile> = {
  // NPCs
  'npc-tolven': {
    id: 'npc-tolven',
    portrait: `${IMG}/portraits/tolven-neutral.webp`,
    fullBody: `${IMG}/fullbody/tolven-full.webp`,
    pose: `${IMG}/poses/tolven-pose.webp`,
    expressions: {
      neutral: `${IMG}/portraits/tolven-neutral.webp`,
      happy: `${IMG}/portraits/tolven-happy.webp`,
      angry: `${IMG}/portraits/tolven-angry.webp`,
      suspicious: `${IMG}/portraits/tolven-suspicious.webp`,
      hurt: `${IMG}/portraits/tolven-hurt.webp`,
    },
    presentation: 'masculino',
    visualTheme: 'guardiao-do-bastiao',
  },
  'npc-oracle': {
    id: 'npc-oracle',
    portrait: `${IMG}/portraits/oracle.webp`,
    expressions: { neutral: `${IMG}/portraits/oracle.webp` },
    presentation: 'feminino',
  },
  'npc-pyromancer': {
    id: 'npc-pyromancer',
    portrait: `${IMG}/portraits/pyromancer.webp`,
    expressions: { neutral: `${IMG}/portraits/pyromancer.webp` },
    presentation: 'feminino',
    visualTheme: 'portador-de-cinza',
  },
  'npc-blackwitch': {
    id: 'npc-blackwitch',
    portrait: `${IMG}/portraits/blackwitch-neutral.webp`,
    expressions: {
      neutral: `${IMG}/portraits/blackwitch-neutral.webp`,
      happy: `${IMG}/portraits/blackwitch-happy.webp`,
      sad: `${IMG}/portraits/blackwitch-sad.webp`,
      angry: `${IMG}/portraits/blackwitch-angry.webp`,
      surprised: `${IMG}/portraits/blackwitch-surprised.webp`,
    },
    presentation: 'feminino',
    visualTheme: 'arauto-do-musgo',
  },

  // Opções de retrato do jogador (criação — passo Masculino/Feminino +
  // Aparência). Fase 3 (Vertical Slice Visual): `presentation` marcado por
  // inspeção visual direta de cada arte (nenhuma delas foi encomendada por
  // gênero — são 4 retratos genéricos herdados do pack de personagens) —
  // viajante-b e viajante-d leem masculino (traços/figurino), viajante-a e
  // viajante-c leem feminino. Isso é o que garante a regra "nunca usar a
  // mesma arte pros dois gêneros": cada apresentação filtra para 2 opções
  // com arte real e distinta, nunca as 4 misturadas.
  'player-viajante-a': {
    id: 'player-viajante-a',
    portrait: `${IMG}/portraits/viajante-a-neutral.webp`,
    fullBody: `${IMG}/fullbody/viajante-a-full.webp`,
    pose: `${IMG}/poses/viajante-a-pose.webp`,
    expressions: {
      neutral: `${IMG}/portraits/viajante-a-neutral.webp`,
      happy: `${IMG}/portraits/viajante-a-happy.webp`,
      angry: `${IMG}/portraits/viajante-a-angry.webp`,
      suspicious: `${IMG}/portraits/viajante-a-suspicious.webp`,
      hurt: `${IMG}/portraits/viajante-a-hurt.webp`,
    },
    presentation: 'feminino',
  },
  'player-viajante-b': {
    id: 'player-viajante-b',
    portrait: `${IMG}/portraits/viajante-b-neutral.webp`,
    fullBody: `${IMG}/fullbody/viajante-b-full.webp`,
    pose: `${IMG}/poses/viajante-b-pose.webp`,
    expressions: {
      neutral: `${IMG}/portraits/viajante-b-neutral.webp`,
      happy: `${IMG}/portraits/viajante-b-happy.webp`,
      angry: `${IMG}/portraits/viajante-b-angry.webp`,
      suspicious: `${IMG}/portraits/viajante-b-suspicious.webp`,
      hurt: `${IMG}/portraits/viajante-b-hurt.webp`,
    },
    presentation: 'masculino',
  },
  'player-viajante-c': {
    id: 'player-viajante-c',
    portrait: `${IMG}/portraits/viajante-c-neutral.webp`,
    fullBody: `${IMG}/fullbody/viajante-c-full.webp`,
    pose: `${IMG}/poses/viajante-c-pose.webp`,
    expressions: {
      neutral: `${IMG}/portraits/viajante-c-neutral.webp`,
      happy: `${IMG}/portraits/viajante-c-happy.webp`,
      angry: `${IMG}/portraits/viajante-c-angry.webp`,
      suspicious: `${IMG}/portraits/viajante-c-suspicious.webp`,
      hurt: `${IMG}/portraits/viajante-c-hurt.webp`,
    },
    presentation: 'feminino',
  },
  'player-viajante-d': {
    id: 'player-viajante-d',
    portrait: `${IMG}/portraits/viajante-d-neutral.webp`,
    fullBody: `${IMG}/fullbody/viajante-d-full.webp`,
    pose: `${IMG}/poses/viajante-d-pose.webp`,
    expressions: {
      neutral: `${IMG}/portraits/viajante-d-neutral.webp`,
      happy: `${IMG}/portraits/viajante-d-happy.webp`,
      angry: `${IMG}/portraits/viajante-d-angry.webp`,
      suspicious: `${IMG}/portraits/viajante-d-suspicious.webp`,
      hurt: `${IMG}/portraits/viajante-d-hurt.webp`,
    },
    presentation: 'masculino',
  },
};

export const PLAYER_PORTRAIT_CHOICES = ['player-viajante-a', 'player-viajante-b', 'player-viajante-c', 'player-viajante-d'];

/** Filtra as opções de retrato do jogador pela apresentação escolhida no
 * passo Masculino/Feminino (Fase 3) — nunca mistura arte de outra
 * apresentação na grade. 'outro' não filtra (mostra todas): não há arte
 * catalogada especificamente fora do binário nesta vertical slice, então
 * negar as 4 opções seria pior do que mostrar todas sem filtrar. */
export function playerPortraitChoicesFor(gender: Gender | null): string[] {
  if (gender === 'masculino' || gender === 'feminino') {
    return PLAYER_PORTRAIT_CHOICES.filter((id) => VISUAL_PROFILES[id].presentation === gender);
  }
  return PLAYER_PORTRAIT_CHOICES;
}

export function visualProfile(id: string | undefined): CharacterVisualProfile | undefined {
  if (!id) return undefined;
  return VISUAL_PROFILES[id];
}

/** Nunca mostra o retrato de outro personagem: estado sem arte cai para
 * `neutral`; se nem `neutral` existir, retorna undefined e a UI usa a
 * silhueta padrão do `Portrait.tsx` (spec §9). */
import type { PortraitExpression } from '@/dialogue/types';

export function resolveExpressionImage(profile: CharacterVisualProfile | undefined, expression: PortraitExpression | undefined): string | undefined {
  if (!profile) return undefined;
  if (expression && profile.expressions?.[expression]) return profile.expressions[expression];
  return profile.expressions?.neutral ?? profile.portrait;
}
