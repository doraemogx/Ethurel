import type { SaveDataV5 } from '@/save/schema';
import type { Location } from '@/world/types';
import type { NarrativeContext } from '@/ai/NarrativeProvider';
import { CLASSES } from '@/data/classes';
import { ORIGINS } from '@/data/origins';
import { WorldEventLog } from '@/domain/worldEvents';

/**
 * Constrói o contexto ENVIADO à IA — nunca o save inteiro (spec §51). Só a
 * cena atual, personagem resumido, NPC atual, eventos recentes relevantes ao
 * local/tags, e o resultado mecânico já decidido (que a IA só dramatiza).
 */
export function buildNarrativeContext(
  save: SaveDataV5,
  location: Location,
  sceneId: string,
  opts: { npcId?: string; npcName?: string; relevantTags?: string[]; mechanicalResult?: string } = {}
): NarrativeContext {
  const character = save.character;
  const classDef = character ? CLASSES.find((c) => c.id === character.classId) : undefined;
  const origin = character ? ORIGINS.find((o) => o.id === character.originId) : undefined;

  const log = new WorldEventLog(save.worldEvents);
  const recentEvents = log.relevantTo({ location: location.id, tags: opts.relevantTags, limit: 6 });

  return {
    sceneId,
    locationName: location.name,
    locationDescription: location.description,
    ambientProfile: location.ambientProfile,
    characterName: character?.name ?? 'Viajante',
    className: classDef?.name ?? '',
    originName: origin?.name ?? '',
    npcId: opts.npcId,
    npcName: opts.npcName,
    recentEvents,
    mechanicalResult: opts.mechanicalResult,
  };
}
