import type { SaveDataV4, SaveDataV5 } from '@/save/schema';

/**
 * v4 → v5: puramente aditivo (Ecos, Diário, confiança de NPC, estado de
 * descoberta de local) — nenhum dado de v4 é perdido ou remapeado de forma
 * incompatível, ao contrário da fronteira v3→v4. `character`,
 * `worldEvents`, `quests`, `relationships`, `discoveredLocations`,
 * `currentLocationId`, `inventory` são preservados tal como estavam.
 */
export function migrate004To005(old: SaveDataV4): SaveDataV5 {
  return {
    schemaVersion: 5,
    character: old.character,
    originCharacterId: old.originCharacterId,
    narrative: old.narrative,
    worldEvents: old.worldEvents,
    quests: old.quests,
    relationships: old.relationships,
    npcTrust: {},
    echoes: [],
    knowledge: [],
    locationStates: Object.fromEntries(old.discoveredLocations.map((id) => [id, 'visitado' as const])),
    discoveredLocations: old.discoveredLocations,
    currentLocationId: old.currentLocationId,
    inventory: old.inventory,
    createdAt: old.createdAt,
    updatedAt: Date.now(),
  };
}
