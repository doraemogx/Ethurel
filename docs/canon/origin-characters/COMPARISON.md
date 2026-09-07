# Personagens de Origem — comparação campo a campo vs Livro VI

> **Atualização — os 3 blockers abaixo foram RESOLVIDOS numa rodada
> posterior.** Antes de corrigir, foi verificado que a Bíblia não tem
> nenhuma versão conflitante para nenhum dos 3 personagens (as 8
> sub-entradas de cada um no Livro VI repetem o mesmo par classe+origem sem
> variação — só o texto-modelo genérico muda, nunca o fato declarado), então
> não havia "conflito real dentro da própria Bíblia" a devolver como decisão
> — a correção seguiu diretamente a hierarquia canônica. `classId`/`originId`
> foram alinhados ao cânone em `src/content/originCharacters.ts`; como a
> Bíblia não fornece prosa biográfica além do par classe+origem (só regras de
> worldbuilding genéricas, repetidas em todo o Livro VI), o
> background/segredo/relações de cada personagem foi adaptado para a
> identidade corrigida, usando a identidade mecânica real da classe/origem
> (`src/data/classes.ts`/`src/data/origins.ts`) como base — não inventando
> fatos novos sobre o mundo, só reescrevendo a caracterização pessoal em
> torno do fato canônico já estabelecido. Ver `src/canon/entityRegistry.ts`
> para o status atualizado (`canonical`, não mais `blocker`). O texto
> original da análise (pré-resolução) permanece abaixo para auditoria.

> Resolve parcialmente `CANON_CONFLICTS.md` §3. Fonte: Bíblia V7, Livro
> VI.1-8 (8 personagens × 8 sub-temas cada — infância/família, formação/
> classe, primeiro fracasso, relações centrais, segredo autoral, objetivo/
> medo, arco como companheiro, arco como protagonista). As 8 sub-entradas de
> cada personagem repetem o mesmo texto-modelo de regras narrativas (mesmo
> padrão estrutural do resto da V7 — ver `CANON_CONFLICTS.md` §0); o único
> dado **específico por personagem** que a V7 fornece, nas entradas lidas, é
> a linha de abertura: **nome, classe (com gênero gramatical) e facção/
> origem à qual está ligado**. Comparado abaixo campo a campo contra
> `src/content/originCharacters.ts`.

## Os 8 Personagens de Origem canônicos (Livro VI.1-8)

| # | Nome (V7) | Classe (V7) | Ligado a (V7) |
|---|---|---|---|
| 1 | Sera Doventh | Guardião do Bastião | Bastião Caído |
| 2 | Ynara Voss | Andarilho do Selo | Arquivo Vertido |
| 3 | Doran Kessig | Lançador de Ossos | Cinzas Longas |
| 4 | Mireth Sable | Portadora de Cinza | Culto do Selo |
| 5 | Corwin Thale | Arauto do Musgo | Fronteira Partida |
| 6 | Asera Morn | Tecelã do Véu | Arquivo Vertido |
| 7 | Kael Orren | Caçador de Fissuras | Cinzas Longas |
| 8 | Leth Arven | Lâmina Silenciosa | Fronteira Partida |

Confirma a suspeita já registrada em `CANON_CONFLICTS.md` §3: são exatamente
8, um por classe (as 8 classes de `src/data/classes.ts` batem 1:1 com as 8
classes acima).

## Os 5 implementados no jogo (`src/content/originCharacters.ts`) vs cânone

| Nome no jogo | Classe no jogo | Origem no jogo | Nome V7 | Classe V7 | Origem V7 | Status |
|---|---|---|---|---|---|---|
| ~~Serel~~ **Sera Doventh** | Guardião do Bastião | Bastião Caído | Sera Doventh | Guardião do Bastião | Bastião Caído | **Corrigido nesta rodada** (só o typo do nome — classe e origem já batiam) |
| Ynara Voss | Andarilho do Selo | **Culto do Selo** | Ynara Voss | Andarilho do Selo | **Arquivo Vertido** | Nome e classe batem; **origem/facção diverge** — ver Blocker A |
| Doran Kessig | Lançador de Ossos | Cinzas Longas | Doran Kessig | Lançador de Ossos | Cinzas Longas | **Sem divergência** |
| Mireth Sable | **Tecelão do Véu** | **Arquivo Vertido** | Mireth Sable | **Portadora de Cinza** | **Culto do Selo** | Nome bate; **classe E origem divergem** — ver Blocker B |
| Corwin Thale | **Caçador de Fissuras** | Fronteira Partida | Corwin Thale | **Arauto do Musgo** | Fronteira Partida | Nome e origem batem; **classe diverge** — ver Blocker C |

## BLOCKER CANÔNICO A — Ynara Voss: origem/facção diverge

Jogo: `originId: 'culto-do-selo'` (background inteiro do jogo é sobre ela ter
saído do Culto e ser infiltrada da Vigília nele). Cânone: ligada a **Arquivo
Vertido**. Isto não é uma contradição interna da própria Bíblia (a V7 só tem
uma versão) — é o código (escrito antes do acesso à V7) divergindo do cânone.
**Não corrigido nesta rodada**: alinhar `originId` exigiria reescrever
`background`/`secret`/`uniqueTags`/`startingRelationships` inteiros (hoje
construídos em torno do Culto do Selo) — isso é trabalho de conteúdo/redesign,
explicitamente fora do escopo autorizado para esta rodada ("não redesenhe").
Decisão necessária do usuário: (a) manter o jogo como está e tratar como
divergência aceita/variação de campanha, ou (b) autorizar reescrita do
personagem para Arquivo Vertido numa rodada futura.

## BLOCKER CANÔNICO B — Mireth Sable: classe E origem divergem

Jogo: Tecelão do Véu / Arquivo Vertido. Cânone: **Portadora de Cinza / Culto
do Selo**. Achado adicional relevante: o par (Tecelão do Véu, Arquivo Vertido)
que o jogo atribuiu à Mireth Sable é **exatamente o par canônico de Asera
Morn** (não implementada no jogo) — sugere que, sem a Bíblia, a sessão anterior
montou uma combinação plausível que por coincidência bate com outro
personagem canônico, não com o que o nome "Mireth Sable" realmente carrega na
V7. **Não corrigido nesta rodada** — mesma razão do Blocker A (reescrita de
conteúdo, fora de escopo). Decisão necessária: realinhar Mireth Sable ao par
canônico dela, ou avaliar se ela deveria ser substituída por Asera Morn (cujo
par bate com o que o jogo já escreveu) numa expansão futura de conteúdo.

## BLOCKER CANÔNICO C — Corwin Thale: classe diverge

Jogo: Caçador de Fissuras. Cânone: **Arauto do Musgo** (origem/Fronteira
Partida já batia). Achado adicional: "Caçador de Fissuras" é a classe
canônica de **Kael Orren** (também não implementado), mas a origem de Kael é
Cinzas Longas, não Fronteira Partida — não é uma simples troca de par como no
Blocker B, é uma divergência isolada de classe. **Não corrigido nesta
rodada** — mesma razão. Decisão necessária do usuário.

## O que NÃO é blocker (para não confundir com um problema resolvido silenciosamente)

- Os nomes dos 5 personagens implementados batem exatamente com o cânone
  (após a correção Serel→Sera).
- 2 dos 5 (Sera Doventh, Doran Kessig) têm classe e origem **exatamente**
  corretas — nenhuma ação necessária.
- Nenhum dos 3 personagens canônicos que faltam (Asera Morn, Kael Orren, Leth
  Arven) foi adicionado — é conteúdo novo, fora do escopo desta rodada
  ("não complete personagens restantes").

## Resumo de status

| Blocker | Personagem | Campo(s) divergente(s) | Ação nesta rodada |
|---|---|---|---|
| — | Sera Doventh | nome (typo) | **Corrigido** |
| A | Ynara Voss | origem/facção | Registrado, decisão pendente |
| B | Mireth Sable | classe + origem | Registrado, decisão pendente |
| C | Corwin Thale | classe | Registrado, decisão pendente |
