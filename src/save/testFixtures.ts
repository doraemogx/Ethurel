import type { SaveDataV1, SaveDataV2, SaveDataV3, PlayerSaveState, CharacterSaveStateV3 } from '@/save/schema';

/** Fixtures de saves de schema antigo, só para testar a cadeia de migração
 * (não usado em runtime do jogo). */
export function createSaveV1Fixture(): SaveDataV1 {
  const now = Date.now();
  return { schemaVersion: 1, sessionCount: 3, createdAt: now, updatedAt: now };
}

export function createSaveV2Fixture(player: PlayerSaveState): SaveDataV2 {
  const now = Date.now();
  return { schemaVersion: 2, sessionCount: 3, player, createdAt: now, updatedAt: now };
}

export function createSaveV3Fixture(character: CharacterSaveStateV3 | null): SaveDataV3 {
  const now = Date.now();
  return {
    schemaVersion: 3,
    sessionCount: 3,
    player: { mapId: 'varreth-arredores', x: 100, y: 100 },
    character,
    indole: {},
    reputation: {},
    quests: {},
    worldFlags: {},
    audio: { soundOn: true },
    createdAt: now,
    updatedAt: now,
  };
}
