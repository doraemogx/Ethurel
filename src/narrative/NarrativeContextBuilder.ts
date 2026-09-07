import type { SaveDataV6 } from '@/save/schema';
import type { Location } from '@/world/types';
import type { NarrativeContext } from '@/ai/NarrativeProvider';
import { CLASSES } from '@/data/classes';
import { ORIGINS } from '@/data/origins';
import { WorldEventLog } from '@/domain/worldEvents';
import { retrieveCanonContext } from '@/canon/canonRetrieval';
import { filterFactsForNpc, SEED_CANON_FACTS } from '@/canon/knowledgeAccess';

/**
 * Constrói o contexto ENVIADO à IA — nunca o save inteiro (spec §51). Só a
 * cena atual, personagem resumido, NPC atual, eventos recentes relevantes ao
 * local/tags, e o resultado mecânico já decidido (que a IA só dramatiza).
 */
export function buildNarrativeContext(
  save: SaveDataV6,
  location: Location,
  sceneId: string,
  opts: { npcId?: string; npcName?: string; relevantTags?: string[]; mechanicalResult?: string } = {}
): NarrativeContext {
  const character = save.character;
  const classDef = character ? CLASSES.find((c) => c.id === character.classId) : undefined;
  const origin = character ? ORIGINS.find((o) => o.id === character.originId) : undefined;

  const log = new WorldEventLog(save.worldEvents);
  const recentEvents = log.relevantTo({ location: location.id, tags: opts.relevantTags, limit: 6 });

  // Canon retrieval (Fase 2 §1): recorte pequeno por localização/NPC, nunca
  // o registro/Bíblia inteiros. Filtrado pelo Knowledge Model (§2) para o
  // NPC específico da cena, para que um segredo de campanha não vaze pelo
  // contexto só porque a cena o menciona — só entra se ESTE NPC souber dele.
  const canon = retrieveCanonContext({ locationId: location.id, npcName: opts.npcName });
  // Usa o canonicalId resolvido (não o `opts.npcId` do jogo, ex.: 'tolven')
  // — o Knowledge Model indexa `knownBy` pelo id canônico (ex.: 'tolven-marr').
  const npcFacts = canon.npc ? filterFactsForNpc(SEED_CANON_FACTS, canon.npc.canonicalId) : [];
  const canonSummary = [...canon.summaryLines, ...npcFacts.map((f) => `[NPC-SABE] ${f.statement}`)];

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
    canonSummary,
  };
}
