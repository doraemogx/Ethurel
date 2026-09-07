/**
 * Canon Retrieval — Fase 2 §1. Uma chamada narrativa NUNCA recebe a Bíblia
 * inteira (25.816 parágrafos) nem o registro canônico inteiro — recebe um
 * recorte pequeno, montado por esta função a partir do que a cena realmente
 * envolve (localização, NPC, facção, classe, origem, povo, evento histórico,
 * entidades relacionadas). CANON_CORE_FACTS é a única parte sempre incluída
 * (é pequena de propósito — 8 fatos, não 2.560 títulos).
 *
 * Exemplo do usuário: cena em Varreth com Tolven deve recuperar CANON_CORE +
 * Varreth + a localização específica + Tolven + entidades relacionadas +
 * fatos relevantes — não a Bíblia inteira. `retrieveCanonContext({
 * locationId: 'varreth', npcId: 'tolven-marr' })` faz exatamente isso.
 */
import { CANON_CORE_FACTS, type CanonCoreFact } from '@/canon/canonCore';
import { CANON_ENTITY_REGISTRY, resolveCanonEntity, type CanonEntity } from '@/canon/entityRegistry';
import { CANON_NPC_DOSSIERS, findCanonNpcDossier, type CanonNpcDossier } from '@/canon/npcRegistry';
import { CANON_FIXED_MILESTONES, type CanonMilestone } from '@/canon/timeline';
import { LOCATIONS } from '@/data/locations';

export interface CanonRetrievalQuery {
  /** Id de `src/data/locations.ts` (ex.: 'varreth') — resolve a própria localização e o macrotterritório dela via `region`. */
  locationId?: string;
  /** canonicalId (`src/canon/entityRegistry.ts`) ou alias/nome — resolve via `resolveCanonEntity`. */
  npcName?: string;
  factionName?: string;
  className?: string;
  originName?: string;
  peopleName?: string;
  /** Nome de marco histórico (`src/canon/timeline.ts`) — ex.: "Fratura". */
  historicalEventName?: string;
  /** Outros nomes/aliases a resolver diretamente (ex.: itens mencionados na cena). */
  relatedEntityNames?: string[];
}

export interface CanonContextBundle {
  core: CanonCoreFact[];
  location?: CanonEntity;
  territory?: CanonEntity;
  npc?: CanonEntity;
  npcDossier?: CanonNpcDossier;
  faction?: CanonEntity;
  classEntity?: CanonEntity;
  origin?: CanonEntity;
  people?: CanonEntity;
  historicalEvent?: CanonMilestone;
  relatedEntities: CanonEntity[];
  /** Linhas curtas, prontas para entrar direto num prompt de IA — é o que
   * `NarrativeContextBuilder` de fato envia adiante, não os objetos crus. */
  summaryLines: string[];
}

function entitySummaryLine(e: CanonEntity): string {
  const notes = e.notes ? ` — ${e.notes}` : '';
  return `${e.canonicalName} (${e.kind}, ${e.status}, fonte: ${e.source})${notes}`;
}

/** Recupera só o recorte de cânone relevante à query — nunca o registro inteiro. */
export function retrieveCanonContext(query: CanonRetrievalQuery): CanonContextBundle {
  const summaryLines: string[] = CANON_CORE_FACTS.map((f) => `[CANON_CORE] ${f.statement}`);

  let location: CanonEntity | undefined;
  let territory: CanonEntity | undefined;
  if (query.locationId) {
    const loc = LOCATIONS.find((l) => l.id === query.locationId);
    if (loc) {
      location = resolveCanonEntity(loc.name);
      territory = resolveCanonEntity(loc.region);
      if (location) summaryLines.push(`[LOCAL] ${entitySummaryLine(location)}`);
      if (territory && territory.canonicalId !== location?.canonicalId) summaryLines.push(`[TERRITÓRIO] ${entitySummaryLine(territory)}`);
    }
  }

  let npc: CanonEntity | undefined;
  let npcDossier: CanonNpcDossier | undefined;
  if (query.npcName) {
    npc = resolveCanonEntity(query.npcName);
    if (npc) {
      summaryLines.push(`[NPC] ${entitySummaryLine(npc)}`);
      npcDossier = findCanonNpcDossier(npc.canonicalId);
      if (npcDossier) {
        summaryLines.push(`[NPC-DOSSIÊ] ${npcDossier.canonicalName}: ${npcDossier.profession} Segredo: ${npcDossier.secret}`);
        for (const rel of npcDossier.relations) summaryLines.push(`[NPC-RELAÇÃO] ${npcDossier.canonicalName} ↔ ${rel.npcName}: ${rel.nature}`);
      }
    }
  }

  let faction: CanonEntity | undefined;
  if (query.factionName) {
    faction = resolveCanonEntity(query.factionName);
    if (faction) summaryLines.push(`[FACÇÃO] ${entitySummaryLine(faction)}`);
  }

  let classEntity: CanonEntity | undefined;
  if (query.className) {
    classEntity = resolveCanonEntity(query.className);
    if (classEntity) summaryLines.push(`[CLASSE] ${entitySummaryLine(classEntity)}`);
  }

  let origin: CanonEntity | undefined;
  if (query.originName) {
    origin = resolveCanonEntity(query.originName);
    if (origin) summaryLines.push(`[ORIGEM] ${entitySummaryLine(origin)}`);
  }

  let people: CanonEntity | undefined;
  if (query.peopleName) {
    people = resolveCanonEntity(query.peopleName);
    if (people) summaryLines.push(`[POVO] ${entitySummaryLine(people)}`);
  }

  let historicalEvent: CanonMilestone | undefined;
  if (query.historicalEventName) {
    historicalEvent = CANON_FIXED_MILESTONES.find((m) => m.name.toLowerCase() === query.historicalEventName!.toLowerCase());
    if (historicalEvent) summaryLines.push(`[EVENTO HISTÓRICO] ${historicalEvent.name} (ano ${historicalEvent.year})`);
  }

  const relatedEntities: CanonEntity[] = [];
  for (const name of query.relatedEntityNames ?? []) {
    const e = resolveCanonEntity(name);
    if (e) {
      relatedEntities.push(e);
      summaryLines.push(`[RELACIONADO] ${entitySummaryLine(e)}`);
    }
  }

  return { core: CANON_CORE_FACTS, location, territory, npc, npcDossier, faction, classEntity, origin, people, historicalEvent, relatedEntities, summaryLines };
}

/** Só para diagnóstico/teste — confirma que uma recuperação normal fica MUITO longe do registro inteiro. */
export function canonRegistrySize(): number {
  return CANON_ENTITY_REGISTRY.length + CANON_NPC_DOSSIERS.length + CANON_FIXED_MILESTONES.length;
}
