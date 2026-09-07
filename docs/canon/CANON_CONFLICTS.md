# CANON_CONFLICTS — inicial (Fase 0)

> Nenhum conflito abaixo foi resolvido silenciosamente. Cada um lista o que
> o jogo atual tem, o que a Bíblia V7 diz, e uma recomendação — mas a decisão
> é do usuário, não minha. Severidade: **CRÍTICO** (bloqueia coerência
> canônica central) / **ALTO** (nomes/identidades divergentes, precisa
> decisão) / **MÉDIO** (enriquecimento pendente, não é contradição) /
> **BAIXO** (nota de qualidade do próprio documento-fonte).

## §0 — Duplicação interna do Livro 0 [BAIXO, nota de qualidade da fonte]

`Livro 0.01`, `0.11` e `0.21` têm o título idêntico ("Hierarquia canônica") e
corpo de texto quase palavra-por-palavra idêntico (só "Aplicação 1" vira
"Aplicação 11"/"Aplicação 21", e a partir da segunda repetição aparece uma
frase extra de boilerplate). O mesmo padrão se repete para as outras 9
entradas de fundamentos (0.02≈0.12≈0.22, 0.03≈0.13≈0.23, etc.). Isto não é um
conflito de fato canônico — é uma característica do próprio documento (ver
`CANON_INGESTION_PLAN.md`). Registrado aqui porque afeta como qualquer
ingestão futura deve tratar contagens/volume do documento: 2.560 títulos não
implica 2.560 unidades de informação únicas.

**Recomendação:** ao ingerir Livro 0, usar só uma das 3 repetições como fonte
(a primeira, 0.01-0.10); não tratar as 3 como conteúdo adicional.

## §1 — Geografia: "Borda dos Musgos" e "Estrada Velha" não existem na V7 [CRÍTICO]

**No jogo atual** (`src/data/locations.ts`, `docs/design/06-WORLD-NARRATIVE-BIBLE.md`,
cânone herdado do handoff pré-V7): Varreth fica na região "Borda dos Musgos";
"Estrada Velha" é a rota a leste; "Fronteira Partida" é o destino final,
isolado por uma fissura arcana permanente.

**Na Bíblia V7** (busca de texto completo, 0 ocorrências de ambos os termos):
"Borda dos Musgos" e "Estrada Velha" **não aparecem em lugar nenhum** do
documento de 2.560 entradas. Varreth é confirmado canônico (`Livro III.007`),
mas pertence ao território **"Orren"**, não a "Borda dos Musgos" — Orren é um
dos 8 territórios da macrogeografia oficial (`Livro 0.03`); "Borda dos
Musgos" não é nome de território, região ou assentamento em nenhuma menção
encontrada. "Fronteira Partida" **é** canônica (548 ocorrências) — mas como
um dos 8 territórios macro, não como "destino isolado por uma fissura" (essa
descrição específica ainda não foi verificada contra o texto do território
na V7).

**Por que é crítico:** toda a fatia vertical jogável hoje (Fases 1-3) foi
construída em cima de "Varreth, na Borda dos Musgos" como identidade
geográfica central — é o texto da criação de personagem, do mapa, da tela de
Campanhas, de todo o primeiro capítulo. Se "Borda dos Musgos" não é cânone
V7, o jogo está descrevendo Varreth com uma identidade regional que a Bíblia
autoritativa não reconhece.

**Recomendação (não decidida por mim):** ler `Livro III.007-008` (Varreth)
por completo junto com as entradas de "Orren" no Livro III, e decidir se
"Borda dos Musgos"/"Estrada Velha" (a) eram nomes de uma versão anterior da
Bíblia (V1-V6) que a V7 descontinuou, (b) podem coexistir como um apelido
local/sub-região dentro de Orren (não contradiz, só precisa ser encaixado),
ou (c) devem ser substituídos por nomenclatura V7 (Orren + o que a V7 chamar
a estrada/rota relevante).

## §2 — Ancestralidade: sistema inventado na Fase 3 colide com os 10 povos canônicos [ALTO]

**No jogo atual** (`src/data/ancestries.ts`, criado nesta mesma sessão, Fase
3, ANTES deste prompt/Bíblia serem recebidos): 4 ancestralidades inventadas
do zero — Filhos da Pedra-Funda, **Povo do Musgo Antigo**, Errantes da
Estrada, Marcados do Selo — explicitamente descritas no código como "não são
raças de D&D reaproveitadas" e criadas "porque nenhuma ancestralidade citada
em conversas anteriores era cânone".

**Na Bíblia V7** (`Livro IV`, 255 entradas): 10 povos canônicos com biologia/
variação próprias — Humanos de Avarra, Elen da Lua Fria, Elen do Bosque
Profundo, Dhorim de Orren, Dhorim Errantes, Myr de Caldra, Myr de Lúmen, Veyl
de Selka, Veyl de Nacre, e **"Povo do Musgo Antigo"** (com variantes
"Guardiões de Raiz" e "Dispersos").

**"Povo do Musgo Antigo" é uma colisão de nome exata** — inventei
independentemente o mesmo nome que já existe no cânone, com variantes
diferentes das minhas ("Enraizados"/"Dispersos" vs canônico "Guardiões de
Raiz"/"Dispersos" — só "Dispersos" bate). Isto reforça que a Fase 3 rodou sem
acesso a esta Bíblia (que só chegou agora) e reinventou parcialmente algo que
já era cânone, por coincidência temática.

Também explica retroativamente uma nota que eu mesmo deixei no handoff da
Fase 3: "'Elfo/Moon Elf/Forest Elf foram EXEMPLOS dados durante discussão' —
referenciando uma parte da conversa fora do meu contexto visível". Os nomes
"Elen da Lua Fria" / "Elen do Bosque Profundo" no Livro IV batem
tematicamente com "Moon Elf"/"Forest Elf" — é bem provável que essa discussão
anterior já estivesse se referindo a esta mesma Bíblia (uma versão anterior,
V6 ou antes), que eu não tinha em mãos na Fase 3.

**Recomendação:** as 4 ancestralidades da Fase 3 são candidatas fortes a
serem **substituídas** pelos 10 povos canônicos (ou um subconjunto deles,
mantendo a orientação do prompt original de "3-4 ancestralidades para
começar") — mas isso é uma decisão de escopo (a V7 tem 10 povos × dezenas de
sub-entradas cada; usar todos não é trivial) que cabe ao usuário aprovar
antes de qualquer rework.

## §3 — Personagens de Origem: 4 de 5 nomes batem, mas a fonte parece ser a mesma Bíblia [ALTO]

**No jogo atual** (`src/content/originCharacters.ts`, Fase 2): 5 Personagens
de Origem — Serel Doventh, Ynara Voss, Doran Kessig, Mireth Sable, Corwin
Thale.

**Na Bíblia V7** (`Livro VI`, 8 entradas × 8 sub-temas): 8 Personagens de
Origem canônicos — **Sera Doventh**, **Ynara Voss**, **Doran Kessig**,
**Mireth Sable**, **Corwin Thale**, Asera Morn, Kael Orren, Leth Arven.

**4 de 5 nomes são idênticos** (Ynara Voss/Doran Kessig/Mireth Sable/Corwin
Thale) — isto quase certamente não é coincidência: como no §2, a Fase 2 deste
projeto (antes desta sessão) muito provavelmente teve acesso a uma versão
anterior desta Bíblia (ou a estes nomes especificamente) durante uma parte da
conversa que não está no meu contexto atual. O 5º nome diverge por uma letra:
"**Serel** Doventh" (jogo) vs "**Sera** Doventh" (cânone) — pode ser erro de
transcrição em qualquer uma das duas direções. Além disso, a Bíblia define
**8** Personagens de Origem (Asera Morn e Kael Orren não existem no jogo),
enquanto o jogo só implementou 5, ligados às 5 Origens em vez de tentar
mapear os 8 (que provavelmente correspondem às 8 Classes, um por classe —
não verificado ainda).

**Recomendação:** corrigir "Serel" → "Sera" Doventh é uma correção trivial e
de baixo risco (é literalmente o mesmo personagem com um typo). Adicionar
Asera Morn e Kael Orren como os 6º/7º/(8º, se a Bíblia listar mais um que
falta mapear) Personagens de Origem é um trabalho de conteúdo maior — os
textos atuais de Serel/Ynara/Doran/Mireth/Corwin no jogo (background,
segredo, traits) foram escritos sem a Bíblia e **precisam ser comparados
linha a linha com `Livro VI.1-5`** antes de decidir se são compatíveis,
complementares, ou precisam ser reescritos para bater com o cânone.

## §4 — NPC Tolven vs "Tolven Marr" [MÉDIO]

**No jogo atual**: NPC único do capítulo 1, `id: 'tolven'`, `name: 'Tolven'`,
"Guarda-caminho de Varreth", "Cansado, mas atento — desconfia de coisas que
'não são naturais'".

**Na Bíblia V7** (`Livro VII.001.1-5`, 145 ocorrências do nome): "Tolven
Marr" — nasceu em **Veyr** (não Varreth), povo Humanos de Avarra, 5 entradas
biográficas completas (infância, juventude/profissão, psicologia/crenças/
voz, [não lidas: segredo/relações, rotina/arcos]).

**Provavelmente o mesmo personagem** (o sobrenome "Marr" simplesmente nunca
foi usado no jogo) — mas a biografia canônica (nascido em Veyr) precisa ser
reconciliada com o papel dele em Varreth no jogo (mudou-se para lá? A que
idade? Por quê?) antes de tratar o diálogo/personalidade atual como
definitivo. `Livro VII.001.3` ("psicologia, crenças e voz") ainda não foi
lido — é a comparação mais importante a fazer antes de re-escrever qualquer
fala dele.

## §5 — Origens e Classes: SEM conflito, confirmado compatível [informativo, não é problema]

Os 8 nomes de classe e os 5 nomes de origem do jogo atual batem exatamente
com o Livro V da Bíblia, com estrutura profunda por trás de cada um (12
sub-entradas por classe, 5 por origem). **Nenhuma mudança de nome ou conceito
central é necessária.** O conteúdo curto de cada origem em
`src/data/origins.ts` (1-2 frases) é muito mais raso que as 5 entradas
canônicas — candidato a enriquecimento (não conflito), documentado no plano
de ingestão.

## §6 — Sistema de Ecos: nome coincide, mecanismo não verificado [MÉDIO]

O termo "Eco" aparece no Livro 0.08 ("Eco, memória ou ressonância não
equivalem a ressurreição integral") no mesmo sentido geral do sistema `Ecos`
já implementado (`src/domain/echoes.ts`, Fase 2). Não foi possível, no tempo
desta Fase 0, ler as entradas do Livro I especificamente sobre Eco/memória/
ressonância para confirmar se o *mecanismo* de jogo (registrar um momento
narrativo marcante) corresponde ao *conceito* canônico ou é só uma
coincidência de nome. Pendente de leitura mais profunda antes de assumir
compatibilidade total.

## §7 — Regra canônica explícita já violada pela implementação atual [CRÍTICO — ver REPO_AUDIT.md]

`Livro 0.10 — Liberdade`: **"Ações livres devem receber interpretação
contextual. Não existe fallback narrativo genérico para ações
compreensíveis."** Isto é texto canônico, não preferência de design. A
implementação atual de "Outra ação..." (`SceneScreen.submitFreeAction`) usa
3 padrões de regex (examinar/escutar/forçar) e cai num fallback genérico
("Nada muda de forma perceptível...") para qualquer coisa fora desses 3
padrões — exatamente o comportamento que o próprio cânone proíbe. Detalhado
em `REPO_AUDIT.md`, não repetido aqui — mas registrado nesta lista porque é,
tecnicamente, tanto um problema técnico quanto uma violação canônica direta.

---

## Resumo de severidade

| # | Conflito | Severidade |
|---|---|---|
| 0 | Duplicação interna do Livro 0 | Baixo (nota de qualidade da fonte) |
| 1 | "Borda dos Musgos"/"Estrada Velha" ausentes da V7 | **Crítico** |
| 2 | Ancestralidades da Fase 3 colidem com os 10 povos canônicos | Alto |
| 3 | Personagens de Origem: 4/5 nomes batem, 1 typo, 3 faltando | Alto |
| 4 | Tolven vs Tolven Marr (biografia a reconciliar) | Médio |
| 5 | Classes/Origens: sem conflito | — (informativo) |
| 6 | Sistema de Ecos: nome coincide, mecanismo não verificado | Médio |
| 7 | Regra canônica de "sem fallback genérico" já violada | **Crítico** |
