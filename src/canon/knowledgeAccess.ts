/**
 * Knowledge Model arquitetural — Fase 2 §2. Evolui o modelo documental da
 * Fase 1 (`docs/canon/knowledge-model-crosswalk.md`) para algo que o código
 * usa de verdade: um fato canônico tem uma CAMADA DE VERDADE, e um NPC só
 * acessa automaticamente o que a camada dele permite — nunca a informação
 * inteira recuperada pela cena.
 *
 * As 5 camadas pedidas nesta rodada (mais operacionais que as 8 do Livro
 * 0.01, mapeadas em `docs/canon/knowledge-model-crosswalk.md`):
 *
 * - `verdade_autoral`: o estado real, decidido pelo jogo — nunca exposto
 *   diretamente como "conhecimento de um NPC" sem evento de descoberta
 *   (é o que o GameEngine/World State usa para manter consistência, não
 *   algo que um personagem simplesmente sabe).
 * - `conhecimento_do_mundo`: fato público, qualquer NPC do contexto pode
 *   citar (ex.: "Tolven é ferreiro").
 * - `crenca`: algo que alguém específico acredita — pode estar errado.
 * - `rumor`: circula, não confirmado — mesma visibilidade pública que
 *   conhecimento do mundo, mas com o peso epistêmico menor (a narrativa
 *   deve tratar como boato, não fato).
 * - `segredo_de_campanha`: só quem está em `knownBy` acessa.
 *
 * Isto NÃO substitui `src/domain/knowledge.ts` (o Diário de Campanha do
 * jogador — o que O JOGADOR sabe, com estado rumor/confirmed/disputed/
 * unknown). São sistemas relacionados mas distintos: este módulo filtra o
 * que entra no CONTEXTO DA IA por NPC; `domain/knowledge.ts` é o que aparece
 * na UI do Diário. Um mesmo fato pode existir nos dois, com propósitos
 * diferentes.
 */

export type TruthLayer = 'verdade_autoral' | 'conhecimento_do_mundo' | 'crenca' | 'rumor' | 'segredo_de_campanha';

export interface CanonFact {
  id: string;
  statement: string;
  truthLayer: TruthLayer;
  /** Só relevante para `segredo_de_campanha` (obrigatório de fato, senão
   * ninguém acessa) e opcionalmente `crenca` (quem especificamente acredita
   * nisso, se não for uma crença comunitária geral). Ausente + camada
   * pública (`conhecimento_do_mundo`/`rumor`) = qualquer NPC do contexto
   * pode citar. */
  knownBy?: string[];
  relatedEntityIds?: string[];
}

const PUBLIC_LAYERS: readonly TruthLayer[] = ['conhecimento_do_mundo', 'rumor'];

/**
 * Decide se um NPC específico pode citar este fato no contexto narrativo
 * dele. `verdade_autoral` nunca é exposta diretamente (é a verdade que o
 * motor usa para manter consistência, não conhecimento narrável de um
 * personagem sem evento de descoberta — Livro 0.01, já citado em
 * CANON_CORE.md §1).
 */
export function npcCanAccessFact(fact: CanonFact, npcId: string): boolean {
  if (fact.truthLayer === 'verdade_autoral') return false;
  if (fact.knownBy) return fact.knownBy.includes(npcId);
  return PUBLIC_LAYERS.includes(fact.truthLayer);
}

/** Filtra uma lista de fatos para o que ESTE NPC especificamente pode
 * acessar — nunca repassa a lista inteira sem passar por este filtro. */
export function filterFactsForNpc(facts: CanonFact[], npcId: string): CanonFact[] {
  return facts.filter((f) => npcCanAccessFact(f, npcId));
}

export function factsAboutEntity(facts: CanonFact[], entityId: string): CanonFact[] {
  return facts.filter((f) => f.relatedEntityIds?.includes(entityId));
}

/**
 * Fatos-semente derivados do dossiê de Tolven Marr (`src/canon/npcRegistry.ts`)
 * — demonstra o filtro funcionando com dado canônico real, não um exemplo
 * artificial. O segredo dele (Livro VII.001.4) só é acessível a quem a
 * própria fonte lista como sabendo.
 */
export const SEED_CANON_FACTS: CanonFact[] = [
  { id: 'tolven-profession', statement: 'Tolven Marr é ferreiro em Varreth, nascido em Veyr.', truthLayer: 'conhecimento_do_mundo', relatedEntityIds: ['tolven-marr'] },
  {
    id: 'tolven-secret-altered-record',
    statement: 'Tolven alterou uma informação num registro menor para proteger Thessa Aster de uma consequência desproporcional.',
    truthLayer: 'segredo_de_campanha',
    knownBy: ['tolven-marr', 'thessa-aster'],
    relatedEntityIds: ['tolven-marr', 'thessa-aster'],
  },
  {
    id: 'hadrik-can-contradict-tolven',
    statement: 'Hadrik Arven pode contradizer a versão pública do segredo de Tolven, se perguntado com a pista certa.',
    truthLayer: 'segredo_de_campanha',
    knownBy: ['tolven-marr', 'hadrik-arven'],
    relatedEntityIds: ['tolven-marr', 'hadrik-arven'],
  },
  {
    id: 'bram-suspects-tolven',
    statement: 'Bram Kest desconfia que Tolven esconde algo, mas não sabe o quê.',
    truthLayer: 'crenca',
    knownBy: ['bram-kest'],
    relatedEntityIds: ['tolven-marr', 'bram-kest'],
  },
];
