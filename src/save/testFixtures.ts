import type { SaveDataV1, SaveDataV2, PlayerSaveState } from '@/save/schema';

/** Fixtures de saves de schema antigo, só para testar a cadeia de migração
 * (não usado em runtime do jogo). */
export function createEmptySaveV1V2Fixture(version: 1, player?: never): SaveDataV1;
export function createEmptySaveV1V2Fixture(version: 2, player: PlayerSaveState): SaveDataV2;
export function createEmptySaveV1V2Fixture(version: 1 | 2, player?: PlayerSaveState): SaveDataV1 | SaveDataV2 {
  const now = Date.now();
  if (version === 1) {
    return { schemaVersion: 1, sessionCount: 3, createdAt: now, updatedAt: now };
  }
  return { schemaVersion: 2, sessionCount: 3, player: player!, createdAt: now, updatedAt: now };
}
