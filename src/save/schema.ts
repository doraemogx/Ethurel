/**
 * Save versionado desde o primeiro estado jogável (docs/design/02-STACK-E-ARQUITETURA.md §4).
 * Cada fase integra progressivamente seus próprios campos a este schema — a Fase 7
 * cuida só de migração/export/import/recuperação de falha e do teste final.
 *
 * Fase 1: só o schema mínimo abaixo existe (prova que o save grava/lê um objeto
 * versionado). Fase 2 acrescenta posição/mapa atual; fases seguintes acrescentam
 * NPCs conhecidos, inventário, quests, combate, etc. — sempre com uma nova
 * interface `SaveDataVN` e uma função de migração nomeada, nunca uma edição
 * silenciosa do shape anterior.
 */
export const CURRENT_SCHEMA_VERSION = 1 as const;

export interface SaveDataV1 {
  schemaVersion: 1;
  /** Contador simples de aberturas do jogo — usado só para provar visualmente
   * que o save persiste entre sessões (ver src/core/BootScene.ts). */
  sessionCount: number;
  createdAt: number;
  updatedAt: number;
}

export type SaveData = SaveDataV1;

export function createEmptySave(): SaveDataV1 {
  const now = Date.now();
  return { schemaVersion: CURRENT_SCHEMA_VERSION, sessionCount: 0, createdAt: now, updatedAt: now };
}
