/**
 * Timeline canônica — Fase 1 §Fundação Canônica, prioridade 4 (ver
 * docs/canon/CANON_INGESTION_PLAN.md). Fonte: Livro II (320 títulos, "a.P." =
 * anterior ao Presente, Ano 0 é a referência de saves novos — Livro 0.04).
 *
 * Leitura de amostragem (10 entradas de territórios/eras diferentes, corpo
 * completo) confirmou o MESMO padrão de texto-modelo genérico já registrado
 * em CANON_CONFLICTS.md §0 para Livro 0/III/IV/VI/VIII: cada um dos 320
 * "episódios" segue exatamente a mesma estrutura de parágrafos, com nomes de
 * personagem gerados por contador (“Arel N”, “Mera N”, “Torven N” — N é o
 * índice sequencial da entrada, não uma pessoa distinta por episódio) — não
 * são 320 eventos historicamente únicos, são um padrão procedural aplicado a
 * 320 combinações de (ano, tipo de evento, território). Por isso este módulo
 * NÃO transcreve as 320 entradas individuais (transcrevê-las criaria uma
 * falsa aparência de especificidade que a própria fonte não tem) — só os
 * marcos fixos, que SÃO citados de forma idêntica e consistente em toda
 * "Validação cronológica" de cada uma das 320 entradas amostradas, portanto
 * são fato canônico real, não gerado por template.
 */

export interface CanonMilestone {
  /** Ano relativo ao Ano 0 (Livro 0.04) — negativo = "a.P.", anterior ao presente. */
  year: number;
  name: string;
  source: string;
}

/** Os 5 marcos fixos citados identicamente em toda "Validação cronológica" do Livro II amostrado — nenhum evento do Livro II pode contradizê-los. */
export const CANON_FIXED_MILESTONES: CanonMilestone[] = [
  { year: -1088, name: 'Pacto dos Bastiões', source: 'Livro II, "Validação cronológica" (citado em toda entrada amostrada)' },
  { year: -401, name: 'Queda do Arquivo', source: 'Livro II, "Validação cronológica"' },
  { year: -117, name: 'Fratura', source: 'Livro II, "Validação cronológica"' },
  { year: -63, name: 'Orven', source: 'Livro II, "Validação cronológica"' },
  { year: -41, name: 'Concordata', source: 'Livro II, "Validação cronológica"' },
];

/**
 * Nomes de era observados nas 10 entradas amostradas do Livro II (não é uma
 * lista fechada/completa — só o que foi lido nesta sessão). Cada entrada do
 * Livro II pertence a uma dessas eras; útil para situar um evento de save
 * relativo ao período canônico sem precisar ler o livro inteiro.
 */
export const OBSERVED_ERAS: readonly string[] = [
  'Bastiões Antigos',
  'Ascensão de Valdren',
  'Depois do Arquivo',
  'Guerras do Selo',
  'Longa Recomposição',
  'Depois da Fratura',
  'Orven e as Marchas',
  'Concordata',
];

export function milestonesBefore(year: number): CanonMilestone[] {
  return CANON_FIXED_MILESTONES.filter((m) => m.year < year).sort((a, b) => a.year - b.year);
}
