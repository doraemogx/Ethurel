/**
 * Entity Registry — Fase 1 §Fundação Canônica, prioridade 2/3/9/10 (ver
 * docs/canon/CANON_INGESTION_PLAN.md). Objetivo específico: impedir que um
 * nome histórico, um apelido legado ou uma variação de grafia da Bíblia V7
 * circule como se fosse uma entidade diferente da canônica — todo lookup por
 * nome passa por `resolveCanonEntity`, nunca por comparação de string solta
 * espalhada pelo código.
 *
 * Cada entrada tem `canonicalId` (estável — nunca muda depois de criado, é
 * o que fica salvo/referenciado) e `canonicalName` (o nome oficial exibível,
 * pode mudar se uma correção de cânone acontecer). `aliases` são nomes
 * alternativos válidos (ex.: apelido, nome curto). `deprecatedAliases` são
 * nomes que o jogo usou antes de bater com o cânone (ex.: o antigo "Serel"
 * para "Sera Doventh") — continuam resolvendo para a mesma entidade, só que
 * marcados como não-preferidos, exatamente para o caso descrito pelo usuário:
 * um nome legado não pode virar uma segunda entidade por acidente.
 *
 * Isto NÃO é a Bíblia inteira — é só o subconjunto de entidades que a fatia
 * jogável atual (Fases 1-3) já referencia, com o resultado das resoluções
 * desta rodada (ver docs/canon/CANON_CONFLICTS.md). Crescimento é aditivo:
 * cada nova entidade canônica ingerida (Fase 1 em diante) ganha uma entrada
 * aqui, nunca substituindo id existente.
 */

export type CanonEntityKind =
  | 'territory'
  | 'location'
  | 'people'
  | 'ancestry-variant'
  | 'class'
  | 'origin'
  | 'origin-character'
  | 'npc'
  | 'faction';

/**
 * `canonical` — confirmado na V7, sem divergência do jogo.
 * `legacy-compatible` — não está na V7, mas não a contradiz (incorporado
 *   como detalhe local, ex.: "Borda dos Musgos").
 * `blocker` — diverge do cânone; decisão do usuário pendente antes de
 *   corrigir (ver docs/canon/CANON_CONFLICTS.md).
 * `not-implemented` — canônico, mas ainda não existe no jogo.
 */
export type CanonStatus = 'canonical' | 'legacy-compatible' | 'blocker' | 'not-implemented';

export interface CanonEntity {
  canonicalId: string;
  canonicalName: string;
  kind: CanonEntityKind;
  aliases: string[];
  deprecatedAliases: string[];
  /** Onde na Bíblia V7 isto foi confirmado, ou nota de origem se não-canônico. */
  source: string;
  status: CanonStatus;
  notes?: string;
}

export const CANON_ENTITY_REGISTRY: CanonEntity[] = [
  // Territórios macro (Livro 0.03)
  { canonicalId: 'orren', canonicalName: 'Orren', kind: 'territory', aliases: [], deprecatedAliases: [], source: 'Livro 0.03; Livro III.007-012', status: 'canonical' },
  { canonicalId: 'fronteira-partida-territorio', canonicalName: 'Fronteira Partida', kind: 'territory', aliases: [], deprecatedAliases: [], source: 'Livro 0.03 (548 ocorrências)', status: 'canonical' },

  // Locais jogáveis (src/data/locations.ts)
  { canonicalId: 'varreth', canonicalName: 'Varreth', kind: 'location', aliases: [], deprecatedAliases: [], source: 'Livro III.007-012', status: 'canonical', notes: 'Território: Orren.' },
  { canonicalId: 'borda-musgos', canonicalName: 'Borda dos Musgos', kind: 'location', aliases: [], deprecatedAliases: [], source: 'docs/canon/geography/orren-varreth-resolution.md', status: 'legacy-compatible', notes: 'Microrregião dentro de Orren — não é macrotterritório V7.' },
  { canonicalId: 'estrada-velha', canonicalName: 'Estrada Velha', kind: 'location', aliases: [], deprecatedAliases: [], source: 'docs/canon/geography/orren-varreth-resolution.md', status: 'legacy-compatible', notes: 'Localidade dentro de Orren — não é macrotterritório V7.' },
  { canonicalId: 'fronteira', canonicalName: 'Fronteira Partida', kind: 'location', aliases: [], deprecatedAliases: [], source: 'Livro 0.03', status: 'canonical' },

  // Povo do Musgo Antigo (Livro IV.010-011 etc.)
  { canonicalId: 'musgo-antigo', canonicalName: 'Povo do Musgo Antigo', kind: 'people', aliases: [], deprecatedAliases: [], source: 'Livro IV.010-011, 021-022, ... 164-165', status: 'canonical' },
  { canonicalId: 'guardioes-de-raiz', canonicalName: 'Guardiões de Raiz', kind: 'ancestry-variant', aliases: [], deprecatedAliases: ['Enraizados'], source: 'Livro IV.010', status: 'canonical', notes: 'id de código mantido como "enraizados" por estabilidade de save; nome exibido corrigido.' },
  { canonicalId: 'dispersos', canonicalName: 'Dispersos', kind: 'ancestry-variant', aliases: [], deprecatedAliases: [], source: 'Livro IV.011', status: 'canonical' },

  // Classes (Livro V.1-8) — 8/8 confirmadas, sem divergência
  { canonicalId: 'portador-de-cinza', canonicalName: 'Portador de Cinza', kind: 'class', aliases: ['Portadora de Cinza'], deprecatedAliases: [], source: 'Livro V', status: 'canonical' },
  { canonicalId: 'tecelao-do-veu', canonicalName: 'Tecelão do Véu', kind: 'class', aliases: ['Tecelã do Véu'], deprecatedAliases: [], source: 'Livro V', status: 'canonical' },
  { canonicalId: 'cacador-de-fissuras', canonicalName: 'Caçador de Fissuras', kind: 'class', aliases: [], deprecatedAliases: [], source: 'Livro V', status: 'canonical' },
  { canonicalId: 'lamina-silenciosa', canonicalName: 'Lâmina Silenciosa', kind: 'class', aliases: [], deprecatedAliases: [], source: 'Livro V', status: 'canonical' },
  { canonicalId: 'guardiao-do-bastiao', canonicalName: 'Guardião do Bastião', kind: 'class', aliases: [], deprecatedAliases: [], source: 'Livro V', status: 'canonical' },
  { canonicalId: 'arauto-do-musgo', canonicalName: 'Arauto do Musgo', kind: 'class', aliases: [], deprecatedAliases: [], source: 'Livro V', status: 'canonical' },
  { canonicalId: 'andarilho-do-selo', canonicalName: 'Andarilho do Selo', kind: 'class', aliases: [], deprecatedAliases: [], source: 'Livro V', status: 'canonical' },
  { canonicalId: 'lancador-de-ossos', canonicalName: 'Lançador de Ossos', kind: 'class', aliases: [], deprecatedAliases: [], source: 'Livro V', status: 'canonical' },

  // Origens (Livro V.O1-O5) — 5/5 confirmadas
  { canonicalId: 'cinzas-longas', canonicalName: 'Cinzas Longas', kind: 'origin', aliases: [], deprecatedAliases: [], source: 'Livro V.O', status: 'canonical' },
  { canonicalId: 'arquivo-vertido', canonicalName: 'Arquivo Vertido', kind: 'origin', aliases: [], deprecatedAliases: [], source: 'Livro V.O', status: 'canonical' },
  { canonicalId: 'culto-do-selo', canonicalName: 'Culto do Selo', kind: 'origin', aliases: [], deprecatedAliases: [], source: 'Livro V.O', status: 'canonical' },
  { canonicalId: 'fronteira-partida-origem', canonicalName: 'Fronteira Partida', kind: 'origin', aliases: [], deprecatedAliases: [], source: 'Livro V.O', status: 'canonical' },
  { canonicalId: 'bastiao-caido', canonicalName: 'Bastião Caído', kind: 'origin', aliases: [], deprecatedAliases: [], source: 'Livro V.O', status: 'canonical' },

  // Personagens de Origem (Livro VI.1-8) — ver docs/canon/origin-characters/COMPARISON.md
  { canonicalId: 'sera-doventh', canonicalName: 'Sera Doventh', kind: 'origin-character', aliases: [], deprecatedAliases: ['Serel Doventh'], source: 'Livro VI.1', status: 'canonical', notes: 'Classe (Guardião do Bastião) e origem (Bastião Caído) já batiam; só o nome foi corrigido.' },
  { canonicalId: 'ynara-voss', canonicalName: 'Ynara Voss', kind: 'origin-character', aliases: [], deprecatedAliases: [], source: 'Livro VI.2', status: 'canonical', notes: 'BLOCKER A resolvido: originId corrigido de Culto do Selo para Arquivo Vertido. Ver COMPARISON.md.' },
  { canonicalId: 'doran-kessig', canonicalName: 'Doran Kessig', kind: 'origin-character', aliases: [], deprecatedAliases: [], source: 'Livro VI.3', status: 'canonical' },
  { canonicalId: 'mireth-sable', canonicalName: 'Mireth Sable', kind: 'origin-character', aliases: [], deprecatedAliases: [], source: 'Livro VI.4', status: 'canonical', notes: 'BLOCKER B resolvido: classId/originId corrigidos de Tecelão do Véu/Arquivo Vertido (par canônico de Asera Morn, não implementada) para Portadora de Cinza/Culto do Selo. Ver COMPARISON.md.' },
  { canonicalId: 'corwin-thale', canonicalName: 'Corwin Thale', kind: 'origin-character', aliases: [], deprecatedAliases: [], source: 'Livro VI.5', status: 'canonical', notes: 'BLOCKER C resolvido: classId corrigido de Caçador de Fissuras (classe canônica de Kael Orren, não implementado) para Arauto do Musgo. Origem (Fronteira Partida) já batia. Ver COMPARISON.md.' },
  { canonicalId: 'asera-morn', canonicalName: 'Asera Morn', kind: 'origin-character', aliases: [], deprecatedAliases: [], source: 'Livro VI.6', status: 'not-implemented' },
  { canonicalId: 'kael-orren', canonicalName: 'Kael Orren', kind: 'origin-character', aliases: [], deprecatedAliases: [], source: 'Livro VI.7', status: 'not-implemented' },
  { canonicalId: 'leth-arven', canonicalName: 'Leth Arven', kind: 'origin-character', aliases: [], deprecatedAliases: [], source: 'Livro VI.8', status: 'not-implemented' },

  // NPCs (Livro VII) — Tolven Marr lido por completo (VII.001.1-5). Dossiê
  // estruturado em src/canon/npcRegistry.ts; Thessa Aster/Hadrik Arven/Bram
  // Kest são NPCs relacionados canônicos, nenhum implementado no jogo ainda.
  { canonicalId: 'tolven-marr', canonicalName: 'Tolven Marr', kind: 'npc', aliases: ['Tolven'], deprecatedAliases: [], source: 'Livro VII.001.1-5 (completo)', status: 'blocker', notes: 'Profissão RESOLVIDA na Fase 2 §13: role do jogo corrigido para "Ferreiro de Varreth" (era "Guarda-caminho"), consistente com o cânone (Livro VII.001.2). Ainda pendente: nascimento em Veyr — o jogo não afirma isso nem explica a mudança para Varreth (a fonte não cobre o motivo, escrever isso é conteúdo novo, fora do escopo). Ver CANON_CONFLICTS.md §4 e docs/canon/npcs/tolven-marr.md.' },
  { canonicalId: 'thessa-aster', canonicalName: 'Thessa Aster', kind: 'npc', aliases: [], deprecatedAliases: [], source: 'Livro VII.001.1, .4', status: 'not-implemented', notes: 'Vínculo de obrigação/afeto de Tolven Marr; ligada ao segredo autoral dele.' },
  { canonicalId: 'hadrik-arven', canonicalName: 'Hadrik Arven', kind: 'npc', aliases: [], deprecatedAliases: [], source: 'Livro VII.001.2, .4', status: 'not-implemented', notes: 'Prejudicado pelo primeiro erro profissional de Tolven Marr; pode contradizer a versão pública do segredo dele.' },
  { canonicalId: 'bram-kest', canonicalName: 'Bram Kest', kind: 'npc', aliases: [], deprecatedAliases: [], source: 'Livro VII.001.2, .4', status: 'not-implemented', notes: 'Rival profissional de Tolven Marr; interessado no segredo dele mas não conhece sua natureza exata.' },

  // Facções (Livro VIII) — 10 confirmadas pelo título; corpo lido só para "A
  // Vigília" (VIII.1.1-2, texto-modelo genérico, ver CANON_CONFLICTS.md §0).
  // Culto do Selo e Arquivo Vertido são, ao mesmo tempo, Origem (Livro V.O) e
  // Facção (Livro VIII) — não é conflito, são conceitos relacionados na V7.
  { canonicalId: 'a-vigilia', canonicalName: 'A Vigília', kind: 'faction', aliases: [], deprecatedAliases: [], source: 'Livro VIII.1', status: 'canonical', notes: 'Já citada em docs antigos e usada em originCharacters.ts (recruta Ynara Voss) — agora confirmada contra a V7.' },
  { canonicalId: 'casas-bastiao', canonicalName: 'Casas Bastião', kind: 'faction', aliases: [], deprecatedAliases: [], source: 'Livro VIII.2', status: 'canonical' },
  { canonicalId: 'culto-do-selo-faccao', canonicalName: 'Culto do Selo', kind: 'faction', aliases: [], deprecatedAliases: [], source: 'Livro VIII.3', status: 'canonical', notes: 'Mesmo nome da Origem culto-do-selo — conceito relacionado, não duplicata.' },
  { canonicalId: 'arquivo-vertido-faccao', canonicalName: 'Arquivo Vertido', kind: 'faction', aliases: [], deprecatedAliases: [], source: 'Livro VIII.4', status: 'canonical', notes: 'Mesmo nome da Origem arquivo-vertido — conceito relacionado, não duplicata.' },
  { canonicalId: 'companhia-sete-estradas', canonicalName: 'Companhia das Sete Estradas', kind: 'faction', aliases: [], deprecatedAliases: [], source: 'Livro VIII.5', status: 'canonical' },
  { canonicalId: 'confraria-da-cinza', canonicalName: 'Confraria da Cinza', kind: 'faction', aliases: [], deprecatedAliases: [], source: 'Livro VIII.6', status: 'canonical' },
  { canonicalId: 'circulo-da-raiz', canonicalName: 'Círculo da Raiz', kind: 'faction', aliases: [], deprecatedAliases: [], source: 'Livro VIII.7', status: 'canonical' },
  { canonicalId: 'mao-de-sal', canonicalName: 'Mão de Sal', kind: 'faction', aliases: [], deprecatedAliases: [], source: 'Livro VIII.8', status: 'canonical' },
  { canonicalId: 'ordem-do-vidro-baixo', canonicalName: 'Ordem do Vidro Baixo', kind: 'faction', aliases: [], deprecatedAliases: [], source: 'Livro VIII.9', status: 'canonical' },
  { canonicalId: 'os-sem-sino', canonicalName: 'Os Sem-Sino', kind: 'faction', aliases: [], deprecatedAliases: [], source: 'Livro VIII.10', status: 'canonical' },
];

function normalize(name: string): string {
  return name.trim().toLowerCase();
}

/**
 * Resolve um nome (canônico, alias ou alias legado/depreciado) para a
 * entidade única correspondente — nunca deixa um nome legado virar entidade
 * própria por acidente. Retorna `undefined` para nomes não registrados
 * ainda (não é erro: o registro cresce de forma aditiva, ver cabeçalho).
 */
export function resolveCanonEntity(nameOrAlias: string): CanonEntity | undefined {
  const target = normalize(nameOrAlias);
  return CANON_ENTITY_REGISTRY.find(
    (e) =>
      normalize(e.canonicalName) === target ||
      e.aliases.some((a) => normalize(a) === target) ||
      e.deprecatedAliases.some((a) => normalize(a) === target)
  );
}

export function findCanonEntitiesByKind(kind: CanonEntityKind): CanonEntity[] {
  return CANON_ENTITY_REGISTRY.filter((e) => e.kind === kind);
}

/** Entidades com status `blocker` — o que ainda precisa de decisão humana antes de qualquer correção automática. */
export function canonBlockers(): CanonEntity[] {
  return CANON_ENTITY_REGISTRY.filter((e) => e.status === 'blocker');
}
