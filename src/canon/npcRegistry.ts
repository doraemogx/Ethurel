/**
 * NPC Registry canônico — Fase 1 §Fundação Canônica, prioridade 6. Fonte:
 * Livro VII (150 NPCs-âncora canônicos; só NPC-001/Tolven Marr foi lido por
 * completo nesta sessão — Livro VII.001.1-5, 5 sub-entradas).
 *
 * Ao contrário de Livro 0/II/III/IV/VI/VIII (texto-modelo genérico repetido
 * por entrada, ver CANON_CONFLICTS.md §0), o Livro VII tem prosa bespoke de
 * verdade — fatos específicos por NPC (local de nascimento, profissão,
 * relações nomeadas, segredo com pistas concretas, rotina, arcos). Isto é
 * dado de referência estruturado, NÃO reescreve `src/data/npcs.ts` — o NPC
 * "Tolven" já implementado no jogo (Guarda-caminho de Varreth) diverge desta
 * biografia canônica (Tolven Marr, ferreiro nascido em Veyr) e reconciliar
 * os dois exige tocar diálogo/quest do capítulo 1, fora do escopo autorizado
 * nesta rodada — ver CANON_CONFLICTS.md §4.
 */

export interface CanonRelation {
  npcName: string;
  nature: string;
}

export interface CanonNpcDossier {
  canonicalId: string;
  canonicalName: string;
  birthplace: string;
  people: string;
  profession: string;
  relations: CanonRelation[];
  secret: string;
  routine: string;
  arcs: { positive: string; negative: string; ambiguous: string };
  source: string;
}

export const CANON_NPC_DOSSIERS: CanonNpcDossier[] = [
  {
    canonicalId: 'tolven-marr',
    canonicalName: 'Tolven Marr',
    birthplace: 'Veyr',
    people: 'Humanos de Avarra',
    profession: 'Ferreiro — aprendeu o ofício por necessidade e aptidão; competência é concreta (reconhece qualidade/prazo/risco do trabalho), não erudição genérica.',
    relations: [
      { npcName: 'Thessa Aster', nature: 'Vínculo de obrigação e afeto desde jovem; o segredo autoral de Tolven existe para protegê-la de uma consequência desproporcional.' },
      { npcName: 'Hadrik Arven', nature: 'Prejudicado pelo primeiro erro profissional de Tolven; pode contradizer a versão pública do segredo dele.' },
      { npcName: 'Bram Kest', nature: 'Rival profissional por uma disputa de crédito; interessado no segredo mas não conhece a natureza exata dele.' },
    ],
    secret: 'Alterou uma informação num registro menor para proteger Thessa Aster de uma consequência desproporcional — o ato não enriqueceu ninguém, mas criou vulnerabilidade jurídica. 3 pistas concretas existem (diferença de tinta/data num documento em Veyr; testemunho de Hadrik Arven; um pagamento indireto).',
    routine: 'Manhã: abastecimento/preparação. Meio do dia: trabalho de ferreiro. Fim de tarde: contas/reparo/visita. Duas noites por semana: vínculo comunitário. Muda em dias de chuva forte (gargalo de circulação em Veyr) e em feira/feriado (menos disponível).',
    arcs: {
      positive: 'Aceitar ajuda sem interpretar dependência como perda de autonomia.',
      negative: 'Usar segredo e competência para controlar escolhas de outros.',
      ambiguous: 'Alcançar segurança financeira rompendo uma relação importante.',
    },
    source: 'Livro VII.001.1-5',
  },
];

export function findCanonNpcDossier(canonicalId: string): CanonNpcDossier | undefined {
  return CANON_NPC_DOSSIERS.find((d) => d.canonicalId === canonicalId);
}
