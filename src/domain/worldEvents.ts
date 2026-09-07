/**
 * WorldEventLog — memória narrativa estruturada (spec §30). A IA nunca recebe
 * o save inteiro; recebe uma seleção destes eventos via
 * `NarrativeContextBuilder` (src/narrative/NarrativeContextBuilder.ts).
 * Cada evento também pode carregar `indoleDelta`/`reputationDelta`/`witnesses`
 * (reaproveitando `src/social/indole.ts`) quando tiver peso moral — o log é
 * só o registro; quem resolve Índole/Reputação continua sendo
 * `resolveWorldEvent`.
 */
export interface WorldEvent {
  id: string;
  turn: number;
  actor: string;
  action: string;
  target?: string;
  location: string;
  witnesses: string[];
  result: string;
  tags: string[];
  timestamp: number;
}

export interface WorldEventInput {
  actor: string;
  action: string;
  target?: string;
  location: string;
  witnesses?: string[];
  result: string;
  tags?: string[];
}

export class WorldEventLog {
  private events: WorldEvent[] = [];
  private turnCounter = 0;

  constructor(existing: WorldEvent[] = []) {
    this.events = existing;
    this.turnCounter = existing.length ? Math.max(...existing.map((e) => e.turn)) : 0;
  }

  record(input: WorldEventInput): WorldEvent {
    this.turnCounter += 1;
    const event: WorldEvent = {
      id: `evt-${this.turnCounter}-${Math.random().toString(36).slice(2, 8)}`,
      turn: this.turnCounter,
      actor: input.actor,
      action: input.action,
      target: input.target,
      location: input.location,
      witnesses: input.witnesses ?? [],
      result: input.result,
      tags: input.tags ?? [],
      timestamp: Date.now(),
    };
    this.events.push(event);
    return event;
  }

  all(): readonly WorldEvent[] {
    return this.events;
  }

  /** Eventos relevantes para um local e/ou tags específicas — usado pelo
   * NarrativeContextBuilder para não mandar o histórico inteiro à IA. */
  relevantTo(opts: { location?: string; tags?: string[]; limit?: number }): WorldEvent[] {
    const limit = opts.limit ?? 8;
    const filtered = this.events.filter((e) => {
      const locationMatch = !opts.location || e.location === opts.location;
      const tagMatch = !opts.tags?.length || e.tags.some((t) => opts.tags!.includes(t));
      return locationMatch || tagMatch;
    });
    return filtered.slice(-limit);
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
