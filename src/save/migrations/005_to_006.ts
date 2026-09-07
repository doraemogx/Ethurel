import type { SaveDataV5, SaveDataV6, CompanionRelationshipState, CompanionRelationshipStateLegacy } from '@/save/schema';
import type { WorldEvent } from '@/domain/worldEvents';
import { createEmptyWorldState } from '@/world/worldState';

function backfillRelationship(old: CompanionRelationshipStateLegacy): CompanionRelationshipState {
  return { ...old, resentment: 0, debt: 0, suspicion: 0 };
}

/** Eventos gravados antes da Fase 2 não têm `type`/`visibility`/
 * `consequences`/`relatedEntities` em disco (mesmo que o tipo `WorldEvent`
 * agora os exija) — backfill com os mesmos defaults que `WorldEventLog.record`
 * já aplicaria para um input sem esses campos. */
function backfillWorldEvent(old: WorldEvent): WorldEvent {
  const anyOld = old as WorldEvent & Partial<Pick<WorldEvent, 'type' | 'visibility' | 'consequences' | 'relatedEntities'>>;
  return {
    ...old,
    type: anyOld.type ?? 'other',
    visibility: anyOld.visibility ?? (old.witnesses.length > 0 ? 'witnessed' : 'private'),
    consequences: anyOld.consequences ?? [],
    relatedEntities: anyOld.relatedEntities ?? (old.target ? [old.target] : []),
  };
}

/**
 * v5 → v6: puramente aditivo — `worldState` (World State formal, Fase 2 §3)
 * nasce vazio (nenhuma entidade tem override, todas assumem o default do
 * cânone); `relationships` ganha as 3 novas dimensões (Fase 2 §5), todas
 * zeradas para relações já existentes; `worldEvents` ganha os campos da
 * taxonomia estruturada (Fase 2 §4). Nada de v5 é perdido ou remapeado.
 */
export function migrate005To006(old: SaveDataV5): SaveDataV6 {
  return {
    schemaVersion: 6,
    character: old.character,
    originCharacterId: old.originCharacterId,
    narrative: old.narrative,
    worldEvents: old.worldEvents.map(backfillWorldEvent),
    quests: old.quests,
    relationships: Object.fromEntries(Object.entries(old.relationships).map(([id, rel]) => [id, backfillRelationship(rel)])),
    npcTrust: old.npcTrust,
    echoes: old.echoes,
    knowledge: old.knowledge,
    locationStates: old.locationStates,
    discoveredLocations: old.discoveredLocations,
    currentLocationId: old.currentLocationId,
    inventory: old.inventory,
    worldState: createEmptyWorldState(),
    createdAt: old.createdAt,
    updatedAt: Date.now(),
  };
}
