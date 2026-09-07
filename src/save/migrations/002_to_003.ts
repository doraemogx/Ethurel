import type { SaveDataV2, SaveDataV3 } from '@/save/schema';

/**
 * v2 (Fase 2, só posição/mapa) → v3 (vertical slice: personagem, quest,
 * Índole/Reputação, Arcane, áudio). Um save v2 nunca teve personagem criado —
 * migra preservando posição/sessão e nasce com `character: null`, o que faz o
 * boot mostrar a criação de personagem em vez de "Continue" (ver TitleScene).
 */
export function migrate002To003(old: SaveDataV2): SaveDataV3 {
  return {
    schemaVersion: 3,
    sessionCount: old.sessionCount,
    player: old.player,
    character: null,
    indole: {},
    reputation: {},
    quests: {},
    worldFlags: {},
    audio: { soundOn: true },
    createdAt: old.createdAt,
    updatedAt: Date.now(),
  };
}
