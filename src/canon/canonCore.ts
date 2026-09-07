/**
 * CANON_CORE em código — Fase 2 §1 (Canon Retrieval). `docs/canon/CANON_CORE.md`
 * é a fonte de leitura humana; isto é o mesmo conteúdo como dado
 * selecionável, para que `retrieveCanonContext` possa incluí-lo em QUALQUER
 * recorte (é pequeno de propósito — nunca a Bíblia inteira, sempre presente).
 * Cada fato tem `id` estável e `statement` curto o bastante para entrar
 * direto num prompt de IA sem reprocessamento.
 */

export interface CanonCoreFact {
  id: string;
  statement: string;
  source: string;
}

export const CANON_CORE_FACTS: CanonCoreFact[] = [
  {
    id: 'truth-hierarchy',
    statement:
      'Hierarquia de verdade: verdade autoral > fato histórico confirmado > conhecimento institucional > testemunho > crença > rumor > propaganda > hipótese. Nunca promover uma camada inferior a verdade sem evento de descoberta validado.',
    source: 'Livro 0.01',
  },
  {
    id: 'world-and-continent',
    statement: 'Ethurel é o mundo conhecido; Avarra é o continente principal desta campanha.',
    source: 'Livro 0.02',
  },
  {
    id: 'macro-territories',
    statement: 'Macrogeografia: Veyra, Orren, Liga de Sarn, Domínios de Elnor, Marchas Bastião, Fronteira Partida, Cinzas Longas, Terras de Selka.',
    source: 'Livro 0.03',
  },
  {
    id: 'arcane-zones',
    statement: 'Controle 0-59, Saturação 60-89, Ruptura 90-100. Marca Arcana registra consequência duradoura de Rupturas extremas.',
    source: 'Livro 0.06',
  },
  {
    id: 'indole-reputation-split',
    statement: 'Índole registra padrão interno inferido de ações; Reputação é conhecimento social distribuído e exige testemunho ou transmissão — são sistemas distintos.',
    source: 'Livro 0.07',
  },
  {
    id: 'death-permanent',
    statement: 'Morte é normalmente permanente. Eco/memória/ressonância não equivalem a ressurreição integral.',
    source: 'Livro 0.08',
  },
  {
    id: 'ai-engine-boundary',
    statement: 'A IA interpreta intenção e narra; o GameEngine valida dano, recursos, checks, inventário, progressão, relações estruturadas e mutações de estado. A IA nunca decide valor mecânico final.',
    source: 'Livro 0.09',
  },
  {
    id: 'no-generic-fallback',
    statement: 'Ações livres compreensíveis exigem interpretação contextual — nunca um fallback narrativo genérico.',
    source: 'Livro 0.10',
  },
];

export function findCanonCoreFact(id: string): CanonCoreFact | undefined {
  return CANON_CORE_FACTS.find((f) => f.id === id);
}
