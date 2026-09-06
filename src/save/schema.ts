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
export const CURRENT_SCHEMA_VERSION = 2 as const;

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

export type SaveData = SaveDataV1 | SaveDataV2;

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
