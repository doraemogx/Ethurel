/**
 * Save versionado desde o primeiro estado jogável (docs/design/02-STACK-E-ARQUITETURA.md §4).
 * Cada fase integra progressivamente seus próprios campos a este schema — a Fase 7
 * cuida só de migração/export/import/recuperação de falha e do teste final.
 *
 * Fase 1: schema mínimo (`SaveDataV1`), só o dev-check (provou que o save grava/lê
 * um objeto versionado). Fase 2 (esta versão, `SaveDataV2`): acrescenta posição do
 * jogador e mapa atual — o mínimo pedido para o protótipo de movimento persistir.
 * Fases seguintes acrescentam NPCs conhecidos, inventário, quests, combate, etc.
 * — sempre com uma nova interface `SaveDataVN` e uma função de migração nomeada
 * (ver `src/save/migrations/`), nunca uma edição silenciosa do shape anterior.
 *
 * `CharacterAppearance` (src/player/types.ts) já existe como tipo, mas ainda
 * NÃO faz parte deste schema — só entra quando `CharacterModel` completo for
 * integrado ao save (junto com stats/classe/origem, na Fase 4).
 */
export const CURRENT_SCHEMA_VERSION = 3 as const;

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
  /** Preservado da Fase 1 só por continuidade — não é mais usado para provar nada
   * sozinho; o teste real agora é a posição do jogador persistindo. */
  sessionCount: number;
  player: PlayerSaveState;
  createdAt: number;
  updatedAt: number;
}

/**
 * Fase "vertical slice jogável" (V3): primeiro save que carrega personagem
 * real (criação), progresso de quest, Índole/Reputação/Arcane e preferência
 * de áudio — o mínimo que o fluxo completo pedido precisa persistir.
 *
 * `QuestProgressState` é deliberadamente mais simples que `QuestStatus`
 * (src/quests/types.ts, que descreve o CATÁLOGO de quests) — aqui é só o
 * progresso determinístico do jogador nesta quest específica, nas 4 fases
 * pedidas pela especificação desta entrega.
 */
export type QuestProgressState = 'not_started' | 'active' | 'objective_complete' | 'completed';

export interface CharacterSaveState {
  name: string;
  gender: 'homem' | 'mulher';
  appearance: {
    skinTone: string;
    hairStyle: string;
    hairColor: string;
    sigilAccent: string;
  };
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
  character: CharacterSaveState | null;
  indole: Record<string, number>;
  reputation: Record<string, number>;
  quests: Record<string, QuestProgressState>;
  /** Consequência local persistente da decisão da quest piloto — ver
   * docs/design §16 do prompt de implementação. Vazio até a decisão ocorrer. */
  worldFlags: Record<string, boolean>;
  audio: { soundOn: boolean };
  createdAt: number;
  updatedAt: number;
}

export type SaveData = SaveDataV1 | SaveDataV2 | SaveDataV3;

export function createEmptySaveV3(): SaveDataV3 {
  const now = Date.now();
  return {
    schemaVersion: 3,
    sessionCount: 0,
    player: { ...DEFAULT_SPAWN },
    character: null,
    indole: {},
    reputation: {},
    quests: {},
    worldFlags: {},
    audio: { soundOn: true },
    createdAt: now,
    updatedAt: now,
  };
}

/** Único mapa jogável até agora: o primeiro microambiente visual, os arredores
 * de Varreth (docs/design/06-WORLD-NARRATIVE-BIBLE.md §2) — ainda não a vila
 * inteira. A vila completa (Fase 3+) introduzirá o(s) próximo(s) `mapId`. */
export const VARRETH_OUTSKIRTS_MAP_ID = 'varreth-arredores';

export const DEFAULT_SPAWN: PlayerSaveState = { mapId: VARRETH_OUTSKIRTS_MAP_ID, x: 56, y: 160 };

export function createEmptySaveV2(): SaveDataV2 {
  const now = Date.now();
  return {
    schemaVersion: 2,
    sessionCount: 0,
    player: { ...DEFAULT_SPAWN },
    createdAt: now,
    updatedAt: now,
  };
}
