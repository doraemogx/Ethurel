/**
 * WorldEventLog — memória narrativa estruturada (spec §30, fortalecido na
 * Fase 2 §4). A IA nunca recebe o save inteiro; recebe uma seleção destes
 * eventos via `NarrativeContextBuilder` (src/narrative/NarrativeContextBuilder.ts).
 * Cada evento também pode carregar `indoleDelta`/`reputationDelta`/`witnesses`
 * (reaproveitando `src/social/indole.ts`) quando tiver peso moral — o log é
 * só o registro; quem resolve Índole/Reputação continua sendo
 * `resolveWorldEvent`.
 *
 * `type` é uma taxonomia fechada de eventos POTENCIALMENTE relevantes para
 * consequência futura — não um log de todo clique (spec Fase 2 §4: "não
 * tente registrar cada clique do jogador"). `visibility` formaliza o que
 * `witnesses` já implicava informalmente: 'private' (ninguém viu),
 * 'witnessed' (NPCs específicos viram, `witnesses` lista quem),
 * 'public' (a comunidade/facção relevante sabe, independente de testemunha
 * individual nomeada — ex.: um ato feito abertamente na praça).
 */
export type WorldEventType =
  | 'player_helped_npc'
  | 'player_attacked_npc'
  | 'player_killed_npc'
  | 'player_discovered_secret'
  | 'player_betrayed_faction'
  | 'player_destroyed_item'
  | 'player_crossed_arcane_threshold'
  | 'player_completed_quest'
  | 'player_failed_check'
  | 'other';

export type EventVisibility = 'private' | 'witnessed' | 'public';

export interface WorldEvent {
  id: string;
  type: WorldEventType;
  turn: number;
  actor: string;
  action: string;
  target?: string;
  location: string;
  witnesses: string[];
  visibility: EventVisibility;
  result: string;
  /** Descrições curtas de efeitos concretos já decididos pelo GameEngine
   * (nunca preenchido pela IA) — ex.: "Tolven perdeu 4 de confiança". */
  consequences: string[];
  /** canonicalIds (`src/canon/entityRegistry.ts`) ou ids de jogo envolvidos,
   * além de actor/target — para o World State/Canon Retrieval conseguirem
   * achar "todo evento que envolveu esta entidade" sem varrer texto livre. */
  relatedEntities: string[];
  tags: string[];
  timestamp: number;
}

export interface WorldEventInput {
  actor: string;
  action: string;
  target?: string;
  location: string;
  witnesses?: string[];
  /** Default: 'other'. Preencher com um tipo da taxonomia quando o evento
   * for potencialmente relevante para consequência futura (spec Fase 2 §4). */
  type?: WorldEventType;
  /** Default: derivado de `witnesses` ('private' se vazio, 'witnessed' se não) — passar explicitamente quando o evento é 'public' (testemunhado pela comunidade, não só por indivíduos nomeados). */
  visibility?: EventVisibility;
  consequences?: string[];
  relatedEntities?: string[];
  result: string;
  tags?: string[];
}

export class WorldEventLog {
  private events: WorldEvent[] = [];
  private turnCounter = 0;

  constructor(existing: WorldEvent[] = []) {
    // Cópia defensiva — `record()` faz `push` in-place; sem isto, o array
    // passado pelo chamador (ex.: `save.worldEvents` antes do reassign em
    // `appendWorldEvent`) seria mutado por referência, quebrando a promessa
    // de "atalho imutável" do comentário abaixo.
    this.events = [...existing];
    this.turnCounter = existing.length ? Math.max(...existing.map((e) => e.turn)) : 0;
  }

  record(input: WorldEventInput): WorldEvent {
    this.turnCounter += 1;
    const witnesses = input.witnesses ?? [];
    const event: WorldEvent = {
      id: `evt-${this.turnCounter}-${Math.random().toString(36).slice(2, 8)}`,
      type: input.type ?? 'other',
      turn: this.turnCounter,
      actor: input.actor,
      action: input.action,
      target: input.target,
      location: input.location,
      witnesses,
      visibility: input.visibility ?? (witnesses.length > 0 ? 'witnessed' : 'private'),
      result: input.result,
      consequences: input.consequences ?? [],
      relatedEntities: input.relatedEntities ?? (input.target ? [input.target] : []),
      tags: input.tags ?? [],
      timestamp: Date.now(),
    };
    this.events.push(event);
    return event;
  }

  all(): readonly WorldEvent[] {
    return this.events;
  }

  /** Eventos relevantes para um local, tags e/ou entidade relacionada
   * específicos — usado pelo NarrativeContextBuilder para não mandar o
   * histórico inteiro à IA (spec §30/Fase 2 §1). */
  relevantTo(opts: { location?: string; tags?: string[]; relatedEntity?: string; limit?: number }): WorldEvent[] {
    const limit = opts.limit ?? 8;
    const hasFilter = Boolean(opts.location || opts.tags?.length || opts.relatedEntity);
    const filtered = this.events.filter((e) => {
      if (!hasFilter) return true;
      const locationMatch = Boolean(opts.location) && e.location === opts.location;
      const tagMatch = Boolean(opts.tags?.length) && e.tags.some((t) => opts.tags!.includes(t));
      const entityMatch = Boolean(opts.relatedEntity) && (e.relatedEntities.includes(opts.relatedEntity!) || e.actor === opts.relatedEntity || e.target === opts.relatedEntity);
      return locationMatch || tagMatch || entityMatch;
    });
    return filtered.slice(-limit);
  }

  /** Todos os eventos que envolveram uma entidade (ator, alvo, ou listada em
   * `relatedEntities`) — sem limite de janela, usado por World State/auditoria. */
  involving(entityId: string): WorldEvent[] {
    return this.events.filter((e) => e.actor === entityId || e.target === entityId || e.relatedEntities.includes(entityId));
  }

  toJSON(): WorldEvent[] {
    return this.events;
  }
}

/** Atalho imutável para telas/handlers de UI: registra um evento numa lista
 * existente (ex.: `save.worldEvents`) e devolve a lista atualizada, sem expor
 * a classe `WorldEventLog` a quem só precisa registrar um evento pontual. */
export function appendWorldEvent(events: WorldEvent[], input: WorldEventInput): WorldEvent[] {
  const log = new WorldEventLog(events);
  log.record(input);
  return [...log.toJSON()];
}
