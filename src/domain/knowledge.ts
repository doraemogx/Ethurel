/**
 * Diário de Campanha (Fase 2 §33-34) — conhecimento do PERSONAGEM, não uma
 * wiki onisciente. Cada entrada tem um estado epistêmico: o que o jogador
 * sabe pode ser rumor, confirmado, contestado, ou (para entradas
 * referenciadas mas ainda não reveladas) desconhecido.
 */
export type KnowledgeCategory = 'missoes' | 'pessoas' | 'lugares' | 'criaturas' | 'ecos' | 'codice';
export type KnowledgeState = 'rumor' | 'confirmed' | 'disputed' | 'unknown';

export interface KnowledgeEntry {
  id: string;
  category: KnowledgeCategory;
  title: string;
  summary: string;
  state: KnowledgeState;
  tags: string[];
  discoveredAt: number;
}

export interface KnowledgeEntryInput {
  id: string;
  category: KnowledgeCategory;
  title: string;
  summary: string;
  state: KnowledgeState;
  tags?: string[];
}

/** Insere ou atualiza uma entrada (upsert por id) — permite que um rumor
 * vire confirmado depois, sem duplicar a entrada (spec §34). */
export function upsertKnowledge(entries: KnowledgeEntry[], input: KnowledgeEntryInput): KnowledgeEntry[] {
  const existing = entries.find((e) => e.id === input.id);
  const next: KnowledgeEntry = {
    id: input.id,
    category: input.category,
    title: input.title,
    summary: input.summary,
    state: input.state,
    tags: input.tags ?? [],
    discoveredAt: existing?.discoveredAt ?? Date.now(),
  };
  return [...entries.filter((e) => e.id !== input.id), next];
}
