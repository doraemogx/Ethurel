/**
 * Save versionado. A partir da reconstrução para RPG narrativo (V4), o shape
 * de save do protótipo top-down (V1-V3: posição x/y num tilemap) deixa de
 * fazer sentido — o jogo não tem mais um mapa navegável em tempo real, e sim
 * `Location`s narrativas (docs/design/07-NOVO-FORMATO-NARRATIVO.md).
 *
 * V1-V3 preservados aqui só para a cadeia de migração não perder saves
 * existentes silenciosamente — mas a migração para V4 não tenta remapear
 * posição x/y nem a antiga `CharacterSaveState` (aparência skinTone/hairStyle
 * não existe mais; personagem agora usa `CharacterVisualProfile` com
 * portrait). Um save V1-V3 migrado nasce como campanha nova (character:null),
 * preservando apenas metadados (createdAt) — documentado explicitamente em
 * `src/save/migrations/003_to_004.ts`, não é um bug.
 */
export const CURRENT_SCHEMA_VERSION = 4 as const;

export interface SaveDataV1 {
  schemaVersion: 1;
  sessionCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface PlayerSaveState {
  mapId: string;
  x: number;
  y: number;
}

export interface SaveDataV2 {
  schemaVersion: 2;
  sessionCount: number;
  player: PlayerSaveState;
  createdAt: number;
  updatedAt: number;
}

export type QuestProgressState = 'not_started' | 'active' | 'objective_complete' | 'completed';

export interface CharacterSaveStateV3 {
  name: string;
  gender: 'homem' | 'mulher';
  appearance: { skinTone: string; hairStyle: string; hairColor: string; sigilAccent: string };
  classId: string;
  originId: string;
  hp: number;
  maxHp: number;
  arcaneFocus: number;
  arcaneMax: number;
  tension: number;
  marca: number;
  xp: number;
  level: number;
}

export interface SaveDataV3 {
  schemaVersion: 3;
  sessionCount: number;
  player: PlayerSaveState;
  character: CharacterSaveStateV3 | null;
  indole: Record<string, number>;
  reputation: Record<string, number>;
  quests: Record<string, QuestProgressState>;
  worldFlags: Record<string, boolean>;
  audio: { soundOn: boolean };
  createdAt: number;
  updatedAt: number;
}

// ---- V4 — RPG narrativo cinematográfico ----

import type { CharacterModel } from '@/characters/types';
import type { WorldEvent } from '@/domain/worldEvents';

export interface CompanionRelationshipState {
  affinity: number;
  trust: number;
  fear: number;
  respect: number;
  flags: string[];
}

export interface GameSettings {
  musicOn: boolean;
  sfxOn: boolean;
  textSpeed: 'instant' | 'animated';
  reduceMotion: boolean;
}

export function defaultSettings(): GameSettings {
  return { musicOn: true, sfxOn: true, textSpeed: 'animated', reduceMotion: false };
}

/** Estado narrativo de progresso — onde a cena/capítulo atual está, para o
 * app retomar exatamente de onde parou. Deliberadamente pequeno: só um id de
 * nó narrativo, não a resposta da IA (spec §50 — nunca salvar a resposta
 * inteira da IA como estado). */
export interface NarrativeProgressState {
  currentSceneId: string;
  /** Ids de flags de progresso narrativo (não confundir com WorldEvent —
   * isto é só "isto já aconteceu", usado por condições simples de conteúdo). */
  flags: string[];
}

export interface SaveDataV4 {
  schemaVersion: 4;
  character: CharacterModel | null;
  originCharacterId: string | null;
  narrative: NarrativeProgressState;
  worldEvents: WorldEvent[];
  quests: Record<string, QuestProgressState>;
  relationships: Record<string, CompanionRelationshipState>;
  discoveredLocations: string[];
  currentLocationId: string;
  inventory: string[];
  createdAt: number;
  updatedAt: number;
}

export type SaveData = SaveDataV1 | SaveDataV2 | SaveDataV3 | SaveDataV4;

export const STARTING_LOCATION_ID = 'varreth';

export function createEmptySaveV4(): SaveDataV4 {
  const now = Date.now();
  return {
    schemaVersion: 4,
    character: null,
    originCharacterId: null,
    narrative: { currentSceneId: 'intro', flags: [] },
    worldEvents: [],
    quests: {},
    relationships: {},
    discoveredLocations: [STARTING_LOCATION_ID],
    currentLocationId: STARTING_LOCATION_ID,
    inventory: [],
    createdAt: now,
    updatedAt: now,
  };
}

// ---- Compat (usado só pela cadeia de migração) ----

export const VARRETH_OUTSKIRTS_MAP_ID = 'varreth-arredores';
export const DEFAULT_SPAWN: PlayerSaveState = { mapId: VARRETH_OUTSKIRTS_MAP_ID, x: 56, y: 160 };
