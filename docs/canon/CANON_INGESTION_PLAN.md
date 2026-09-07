# Plano de Ingestão da Bíblia Canônica V7

## O que é a fonte

`ETHUREL_BIBLIA_CANONICA_V7_FINAL.docx`, anexado pelo usuário nesta sessão.
Medido diretamente nesta auditoria:

- **25.816 parágrafos**, dos quais **2.560 são títulos** (estilo "Heading 2")
  e o resto é corpo de texto.
- `word/document.xml` interno tem **8,5MB** descompactado — o arquivo `.docx`
  em si tem ~240KB (a maior parte do peso é texto, comprime bem).
- Extraído para texto plano nesta sessão (`full_text.txt`, ~7MB, guardado
  fora do repositório, no scratchpad da sessão — **não commitado**, ver
  "Onde o texto extraído vive" abaixo).

## Estrutura confirmada (12 Livros numerados + Livro 0 + 1 Apêndice)

| Livro | Título temático | Entradas | Observação |
|---|---|---|---|
| 0 | Fundamentos (hierarquia, mundo, Ano 0, Arcane, Arcane-zonas, Índole/Reputação, Morte, IA/motor, Liberdade) | 25 | Repete os mesmos 10 temas ~2,5×, ver `CANON_CONFLICTS.md` §0 |
| I | "Arcane e X" (ontologia, dor, memória, sonhos, cura, gravidez, etc.) | 260 | Enciclopédia temática de Arcane |
| II | Cronologia histórica (notação "a.P.") | 320 | Eventos datados por território |
| III | Cidades (fundação, bairros, economia, ... por cidade) | 240 | Inclui Varreth (`III.007`/`III.008`+) |
| IV | Povos (biologia/infância/família/... por povo) + religiões | 255 | 10 povos, ver `CANON_CONFLICTS.md` §2 |
| V | Classes (12 entradas × 8) + Origens (5 entradas × 5) | 121 | **Confirmado compatível com o código atual** |
| VI | 8 Personagens de Origem canônicos | 64 | Conflita parcialmente com `originCharacters.ts`, ver §3 |
| VII | 150 NPCs-âncora (5 entradas cada) | 750 | O maior livro; inclui Tolven Marr |
| VIII | Facções (10 facções × 10 entradas) | 100 | Inclui "A Vigília", já citada em docs antigos |
| IX | Bestiário (25 criaturas × 4 variantes) | 100 | |
| X | Itens/relíquias (~14 itens × 7 registros) | 100 | |
| XI | Arquitetura narrativa (ação livre/diálogo/checks × 3 camadas) | 120 | Relevante para Trilha F/G — ainda não lido |
| XII | 80 assentamentos ("Malha de campanha") | 80 | Geografia detalhada além de Varreth |
| Apêndice A | 25 "Protocolos de coerência" | 25 | Meta-regras de consistência do próprio documento |

## Qualidade do corpus — observação importante

Boa parte do corpo de texto (confirmado por amostragem manual em várias
seções, não só no Livro 0) repete um pequeno conjunto de frases-modelo quase
palavra-por-palavra entre entradas próximas (ex.: "Neste capítulo, a
aplicação é específica a '<título>', e qualquer implementação deve registrar
esse contexto..." aparece dezenas de vezes; `Livro 0.01` e `Livro 0.11` têm
corpo quase idêntico, só variando "Aplicação 1"/"Aplicação 11"). Isso não
invalida o documento — a V7 se declara explicitamente como sucessora de
V1-V6 e "documento-mãe de produção" — mas significa que **2.560 títulos não
equivalem a 2.560 unidades de informação genuinamente distintas**. Ao
consumir uma seção específica, vale checar se o parágrafo é conteúdo único ou
o boilerplate repetido, e extrair só o que é de fato específico daquele
título.

## Onde o texto extraído vive

O `full_text.txt` (texto completo, com marcação `## ` nos títulos) foi salvo
no scratchpad da sessão para permitir buscas (`grep`) sem precisar reabrir o
`.docx` a cada consulta. **Não foi commitado no repositório** — 7MB de texto
bruto redundante com o `.docx` original não pertence ao histórico do jogo.
Uma sessão futura que precise consultar a Bíblia deve: (a) pedir o `.docx`
de novo ao usuário, ou (b) usar uma cópia já commitada, se o usuário decidir
commitar uma versão processada (ver "Próximo passo" abaixo).

## O que foi de fato lido nesta auditoria (Fase 0)

Leitura completa: todos os 2.560 títulos (para mapear a estrutura acima).
Leitura de corpo completo: Livro 0 inteiro (25 entradas, confirmando a
duplicação), 2 entradas de Varreth (`III.007`/`III.008`), início do Livro
VII (`VII.001.1`, Tolven Marr), listagem de nomes do Livro VI (8 personagens)
e Livro IV (10 povos). Buscas direcionadas (grep de nome/termo) em todo o
texto para os conflitos documentados em `CANON_CONFLICTS.md`.

**Não lido ainda** (por volume — fora do escopo de um diagnóstico): o corpo
completo dos Livros I, II, a maior parte do III (240 entradas, só 2 lidas),
IV, VI, VII (750 entradas, só 3 lidas), VIII, IX, X, XI, XII, Apêndice A.

## Plano de ingestão proposto (para a Fase 1, não executado agora)

1. **Não tentar carregar os 2.560 títulos de uma vez em nenhum contexto** —
   nem do desenvolvimento, nem do jogo em produção (Trilha R proíbe
   explicitamente empacotar a Bíblia no bundle).
2. Processar o `.docx` uma vez (script Python/`python-docx`, já usado nesta
   sessão) para um formato intermediário por entrada — 1 arquivo Markdown por
   título de `Livro X.NNN`, agrupado por diretório temático
   (`docs/canon/arcane/`, `docs/canon/npcs/`, etc.), removendo o boilerplate
   repetido identificado acima.
3. Cada arquivo processado carrega seu próprio cabeçalho de metadados (Livro,
   número, entidades citadas) para permitir recuperação seletiva por local/
   NPC/facção relevante à cena atual — exatamente o que `Livro 0.01`/`0.11`
   já pede: "o backend deve enviar ao modelo apenas os trechos relevantes à
   cena, além do estado atual do save".
4. Antes de gerar os arquivos, resolver as duplicações "Livro 0.01 = 0.11 =
   0.21" (e verificar se o mesmo padrão se repete em outros livros) — não
   duplicar o problema na nova estrutura.
5. Priorizar ingestão pela ordem de uso real do jogo: primeiro o que a fatia
   vertical atual já usa (Varreth/`III.007-008`, Tolven Marr/`VII.001.x`,
   as 8 classes/5 origens/`V`, os 8 personagens de origem/`VI`), antes dos
   750 NPCs e 80 assentamentos que a campanha ainda não visita.
6. `GLOSSARY.md` cresce incrementalmente conforme cada lote é ingerido —
   não é gerado de uma vez.

Este plano não foi executado por completo na Fase 0 (diagnóstico) — a Fase 1
autorizada nesta rodada implementou o primeiro pedaço concreto dele, descrito
abaixo.

## Fase 1 — o que foi construído nesta rodada

Prioridades pedidas pelo usuário, em ordem: (1) CANON_CORE definitivo; (2)
Entity Registry; (3) IDs estáveis; (4) Timeline estruturada; (5) Location
hierarchy; (6) NPC registry; (7) Faction registry; (8) Knowledge model; (9)
aliases/deprecated names; (10) canon conflict registry.

**Construído (código, testado):**

- **Entity Registry (prioridade 2)** — `src/canon/entityRegistry.ts` +
  `src/canon/entityRegistry.test.ts` (11 testes). `CanonEntity` com o formato
  exato pedido: `canonicalId`, `canonicalName`, `aliases`, `deprecatedAliases`,
  `source`, `status`. `resolveCanonEntity(nome)` resolve nome canônico, alias
  ou alias legado/depreciado para a MESMA entidade — é o mecanismo que
  impede um nome histórico (ex.: "Serel Doventh", "Enraizados") de circular
  como entidade separada por acidente.
- **IDs estáveis (prioridade 3)** — aplicado em toda correção desta rodada:
  `id`/`canonicalId` nunca mudou quando só o `name` exibido precisava de
  correção (`ancestries.ts` variante "Enraizados"→"Guardiões de Raiz" manteve
  `id: 'enraizados'`; `originCharacters.ts` "Serel"→"Sera" Doventh manteve
  `id: 'serel-doventh'`) — nenhuma referência de save/código quebra.
- **Aliases/deprecated names (prioridade 9)** — é o próprio mecanismo do
  Entity Registry acima, não um sistema separado.
- **Canon conflict registry (prioridade 10)** — já existia desde a Fase 0
  (`CANON_CONFLICTS.md`), atualizado nesta rodada com os 3 novos "BLOCKER
  CANÔNICO" (Ynara Voss, Mireth Sable, Corwin Thale — ver
  `docs/canon/origin-characters/COMPARISON.md`) e o status resolvido de §1/
  §2/§7. `canonBlockers()` no Entity Registry devolve programaticamente as
  mesmas entidades bloqueadas, para uso futuro por ferramentas/testes.
- **CANON_CORE definitivo (prioridade 1)** — atualizado (não recriado) para
  refletir os itens resolvidos nesta rodada (§3 geografia, §10 ação livre).

**Não construído nesta rodada (honestamente fora do escopo autorizado — "não
redesenhe", "não invente conteúdo novo") — plano registrado, não fingido como
pronto:**

- **Timeline estruturada (prioridade 4)**: o Livro II (320 eventos
  datados "a.P.") não foi lido em profundidade nesta rodada — só os títulos,
  já catalogados na tabela acima. Implementar exigiria ler o corpo de 320
  entradas e decidir quais são relevantes à fatia jogável atual (nenhuma, por
  ora — a campanha do capítulo 1 não referencia eventos históricos
  específicos). `WorldEventLog` (`src/domain/worldEvents.ts`, já
  implementado desde a Fase 1 anterior) já cobre a timeline *de campanha* (o
  que o jogador fez); a timeline *canônica pré-Ano-0* do Livro II é um
  sistema separado, não iniciado.
- **Location hierarchy (prioridade 5)**: parcialmente coberta pelo campo
  `region` de `src/data/locations.ts` (corrigido nesta rodada para apontar
  ao macrotterritório correto) + o novo Entity Registry (`kind: 'territory'`
  vs `kind: 'location'`, com `notes` indicando o território de cada local).
  Uma hierarquia completa (Território → Cidade → Bairro, como o Livro III
  descreve para Varreth) não foi modelada em código — os bairros de Varreth
  (`Livro III.008`) não foram lidos em detalhe específico (o corpo lido é o
  texto-modelo genérico, sem nome de bairro concreto ainda extraído).
- **NPC registry (prioridade 6)**: `src/data/npcs.ts` já existe (só Tolven,
  1 entrada) — o Entity Registry agora também cataloga Tolven Marr
  (`kind: 'npc'`, status `blocker` pela biografia canônica não reconciliada,
  ver `CANON_CONFLICTS.md` §4). Os outros 149 NPCs-âncora do Livro VII não
  foram lidos nem adicionados — fora de escopo (conteúdo novo).
- **Faction registry (prioridade 7)**: Livro VIII (10 facções × 10 entradas)
  não foi lido nesta rodada além do título já catalogado ("A Vigília", citada
  em docs antigos, ainda não confirmada contra a V7). Nenhuma entrada de
  facção foi adicionada ao Entity Registry ainda — precisaria de leitura
  dedicada antes.
- **Knowledge model (prioridade 8)**: `src/domain/knowledge.ts` já existe
  (Fase 2, estados de conhecimento por save) mas não foi cruzado contra a
  hierarquia de verdade do Livro 0.01 ("verdade autoral > fato histórico >
  conhecimento institucional > testemunho > crença > rumor > propaganda >
  hipótese", já citada em `CANON_CORE.md` §1) — fazer esse cruzamento é
  trabalho de próxima rodada, não iniciado.

## Exemplo de recall seletivo (agora possível com o que foi construído)

O exemplo dado pelo usuário — uma cena em Varreth com Tolven e um jogador
Portador-de-Cinza deveria recuperar só CANON_CORE + Varreth + o local
específico + Tolven + Portador de Cinza + eventos de save relevantes, não a
Bíblia inteira — já é mecanicamente possível com as peças construídas nesta
rodada, mesmo sem uma função de composição dedicada ainda:

```ts
resolveCanonEntity('Varreth');          // -> location, região Orren
resolveCanonEntity('Tolven');           // -> npc, status blocker (biografia pendente)
resolveCanonEntity('Portador de Cinza'); // -> class, canonical
worldEventLog.relevantTo({ location: 'varreth', limit: 6 }); // já existe, Fase 1 anterior
```

Compor essas quatro chamadas num único `buildSelectiveCanonContext()` (para
uso por `NarrativeContextBuilder`) é o próximo passo natural, não feito nesta
rodada para não expandir escopo além do pedido.
