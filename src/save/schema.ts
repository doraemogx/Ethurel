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
export const CURRENT_SCHEMA_VERSION = 5 as const;

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
import type { Echo } from '@/domain/echoes';
import type { KnowledgeEntry } from '@/domain/knowledge';

export interface CompanionRelationshipState {
  affinity: number;
  trust: number;
  fear: number;
  respect: number;
  flags: string[];
}

/** Velocidade de texto (Fase 2 §17): Instantâneo (sem typewriter),
 * Rápido, Cinematográfico (mais pausado, pausas em pontuação). */
export type TextSpeed = 'instant' | 'fast' | 'cinematic';

export interface GameSettings {
  /** Volume mestre (0-1) — multiplica todos os canais (Phase 3 §16 AudioDirector). */
  masterVolume: number;
  musicOn: boolean;
  ambienceOn: boolean;
  sfxOn: boolean;
  textSpeed: TextSpeed;
  reduceMotion: boolean;
}

export function defaultSettings(): GameSettings {
  return { masterVolume: 0.8, musicOn: true, ambienceOn: true, sfxOn: true, textSpeed: 'fast', reduceMotion: false };
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

// ---- V5 — Ecos, Diário de Campanha, confiança de NPC narrativa (Fase 2) ----

/** Estado de descoberta de um local: 4 estados armazenados (Phase 3 §13 —
 * mais granular que os 3 da Fase 2: `descoberto` fica entre "ouviu falar" e
 * "esteve lá" — o nome aparece no mapa, mas o jogador nunca visitou). O 5º
 * estado do prompt ("atual") não é armazenado por local — é derivado em
 * tempo de render comparando com `currentLocationId` (`src/ui/screens/MapScreen.tsx`),
 * porque "está aqui agora" é sempre verdade sobre exatamente um local e não
 * faz sentido persistir como um valor que pode ficar desatualizado.
 * String-union alargada é aditiva: saves antigos com os 3 valores originais
 * continuam válidos sem migração (nenhum dos 3 valores mudou de nome). */
export type LocationDiscoveryState = 'desconhecido' | 'conhecido' | 'descoberto' | 'visitado';

export interface SaveDataV5 {
  schemaVersion: 5;
  character: CharacterModel | null;
  originCharacterId: string | null;
  narrative: NarrativeProgressState;
  worldEvents: WorldEvent[];
  quests: Record<string, QuestProgressState>;
  relationships: Record<string, CompanionRelationshipState>;
  /** Confiança por NPC nomeado (0 = neutro) — nunca mostrada como número na
   * UI, só como rótulo narrativo (ver src/social/relationship.ts). */
  npcTrust: Record<string, number>;
  echoes: Echo[];
  knowledge: KnowledgeEntry[];
  locationStates: Record<string, LocationDiscoveryState>;
  discoveredLocations: string[];
  currentLocationId: string;
  inventory: string[];
  createdAt: number;
  updatedAt: number;
}

export type SaveData = SaveDataV1 | SaveDataV2 | SaveDataV3 | SaveDataV4 | SaveDataV5;

export const STARTING_LOCATION_ID = 'varreth';

export function createEmptySaveV5(): SaveDataV5 {
  const now = Date.now();
  return {
    schemaVersion: 5,
    character: null,
    originCharacterId: null,
    narrative: { currentSceneId: 'intro', flags: [] },
    worldEvents: [],
    quests: {},
    relationships: {},
    npcTrust: {},
    echoes: [],
    knowledge: [],
    // Estado inicial recuperado do handoff (Parte 14): varreth visitado,
    // borda-musgos já conhecido de ouvir falar — o resto desconhecido.
    locationStates: { varreth: 'visitado', 'borda-musgos': 'conhecido', 'estrada-velha': 'desconhecido', fronteira: 'desconhecido' },
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
