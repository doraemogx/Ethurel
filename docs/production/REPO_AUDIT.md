# REPO_AUDIT — Fase 0

> Diagnóstico técnico completo do repositório `doraemogx/Ethurel`, branch
> `claude/ethurel-reconstrucao-uz59be`, no estado após a Fase 3 (commit
> `c277763`). Nenhum problema aqui foi corrigido ainda — esta é só a
> auditoria pedida como Fase 0. "Build verde" e "103 testes passando" (Fase
> 3) **não significam que a experiência real funciona** — dois dos achados
> críticos abaixo (§Crítico-1, §Crítico-2) passam por `tsc`/`vitest`/`vite
> build` sem erro nenhum, porque nenhum dos dois é um erro de compilação.

## Problemas — CRÍTICO

### Crítico-1 — Todo asset novo da Fase 3 usa caminho absoluto e quebra em produção

**Confirmado, causa raiz identificada.** `vite.config.ts` usa `base: './'`
(relativo) — necessário porque o deploy real é
`https://doraemogx.github.io/Ethurel/`, um subcaminho, não a raiz do domínio.
Isso funciona corretamente para tudo que passa pelo pipeline de import do
Vite (JS/CSS bundlados). **Mas 9 arquivos da Fase 3** escrevem caminhos de
imagem como string literal começando com `/assets/...`
(`src/characters/visualRegistry.ts`, `src/ui/visual/locationArt.ts`,
`src/ui/theme.css`, `src/ui/screens/{CombatScreen,MapScreen,TitleScreen,
CampaignsScreen,CharacterCreationScreen}.tsx`, `src/ui/components/ItemIcon.tsx`).
Um caminho começando com `/` é absoluto à raiz do domínio — no navegador,
`/assets/img/backgrounds/varreth-market.webp` dentro de
`https://doraemogx.github.io/Ethurel/` resolve para
`https://doraemogx.github.io/assets/img/backgrounds/varreth-market.webp`
(sem `/Ethurel/`), que não existe → 404.

Isso não aparece em nenhum teste (`vitest` não renderiza no navegador com
`base` real) nem no `vite preview` local (serve da raiz, `/`, onde o bug não
se manifesta) — só se manifestaria abrindo o deploy real no Android, que é
exatamente o que a Fase 3 não fez (só validou via `vite preview` local,
confirmado relendo o handoff anterior). **Isto explica meu próprio relatório
final da Fase 3 estar incorreto** ao reportar sucesso visual — as capturas de
tela eram de `localhost`, não do deploy publicado.

**Escopo do dano:** praticamente 100% do trabalho visual da Fase 3
(backgrounds de local, retratos/expressões, mapa em pergaminho, ícones de
item, texturas de pergaminho do Diário) — tudo carrega em branco/quebrado no
Android real hoje. Os únicos assets que carregam corretamente são os ícones
do PWA (`public/icons/*.svg`), porque o `manifest.webmanifest` usa caminho
relativo sem barra inicial.

**Correção recomendada (não aplicada agora):** trocar todo `/assets/...` por
`${import.meta.env.BASE_URL}assets/...` (mecanismo nativo do Vite, já
reflete o `base` configurado) — ou, mais simples, remover a barra inicial
(`assets/...`) já que não há rotas aninhadas no app (SPA de tela única, sem
`react-router`). Qualquer uma resolve; a segunda é uma mudança menor.

### Crítico-2 — "Outra ação..." nunca usa a camada de IA; viola cânone explícito

**Confirmado, causa raiz identificada.** `SceneScreen.submitFreeAction()`
resolve texto livre do jogador com 3 padrões de regex
(`examinar|observar|investigar|olhar`, `escutar|ouvir`,
`forçar|quebrar|empurrar|levantar|escalar|correr`) e cai num fallback fixo
para qualquer outra coisa: *"Você tenta: '{texto}'. Nada muda de forma
perceptível, mas a tentativa fica registrada."* — exatamente o comportamento
que o usuário descreveu como inaceitável ("CHORAR → nada muda", "DEITAR →
mesma resposta genérica").

A arquitetura de IA (`NarrativeEngine`, `LocalNarrativeProvider`,
`RemoteNarrativeProvider`, `interpretFreeText()`) **existe, está definida,
está exposta via `GameContext`** — mas `grep` confirma que
**`interpretFreeText`/`requestNarration` não são chamados em lugar nenhum**
fora dos próprios arquivos que os definem. `SceneScreen` só usa
`useGame()` para `save`/`updateAndPersist`; nunca destrutura
`narrativeEngine`. A "arquitetura de IA pronta" documentada nos handoffs de
todas as fases anteriores é real como *código*, mas **nunca foi conectada ao
jogo em execução**.

Isto não é só um problema de qualidade de experiência — `Livro 0.10 —
Liberdade` da Bíblia V7 é texto canônico explícito: *"Ações livres devem
receber interpretação contextual. Não existe fallback narrativo genérico
para ações compreensíveis."* A implementação atual viola isso diretamente.

**Correção recomendada (não aplicada agora, é a Trilha F/G do prompt):**
conectar `submitFreeAction` a `narrativeEngine.interpretFreeText()`, com o
`LocalNarrativeProvider` fazendo interpretação semântica real (não regex) e
o `GameEngine` continuando como única autoridade sobre consequência
mecânica. Isso é trabalho de implementação real, não uma correção de 1
linha — envolve desenhar o que `LocalNarrativeProvider.interpretFreeText`
de fato faz hoje (verificar antes de assumir).

## Problemas — ALTO

### Alto-1 — Nomenclatura geográfica: "Borda dos Musgos"/"Estrada Velha" não são cânone V7

Ver `docs/canon/CANON_CONFLICTS.md` §1 — não repetido aqui em detalhe. Afeta
`src/data/locations.ts`, toda a Fase 3 (mapa, fundos, textos de criação),
`docs/design/06-WORLD-NARRATIVE-BIBLE.md`.

### Alto-2 — "PWA" é só um manifesto; não há service worker

`public/manifest.webmanifest` existe e está correto (instalável, ícones,
`start_url`/`scope` relativos corretos). Mas não há **nenhum** service
worker registrado (`grep` de `serviceWorker`/`workbox`/`vite-plugin-pwa` no
projeto inteiro: zero resultados). Isso significa: instalável como app
("adicionar à tela inicial") sim; funcionar de fato offline, não — um
carregamento sem rede falha como qualquer site estático sem cache
configurado. Documentos de fases anteriores usam a palavra "PWA" e "funciona
offline" de forma intercambiável; **isso está impreciso**. Também significa
que o risco que a Trilha O menciona ("PWA update não pode destruir
campanha") não existe hoje na forma descrita (não há cache de service worker
para invalidar) — mas o risco real e presente é outro: sem service worker,
não há proteção nenhuma contra a página abrir sem internet.

### Alto-3 — Falha ao salvar é só logada no console, nunca mostrada ao jogador

`SaveStore.save()` retorna `boolean` e loga um `console.warn` em caso de
falha (quota excedida, modo privado), mas **nenhum chamador verifica o
retorno** (`grep` em `src/save/gameSave.ts` e nos pontos de
`updateAndPersist`) — o jogo segue normalmente como se tivesse salvo. Em
modo privado do navegador (comum em Android/Chrome) ou quota esgotada, o
jogador pode perder progresso sem nenhum aviso. Trilha O pede
explicitamente investigar por que saves não persistiam — isto é uma causa
plausível ainda não confirmada como *a* causa, mas é um gap real
independente da causa original.

### Alto-4 — Ancestralidade e Personagens de Origem da Fase 3/2 colidem com cânone V7

Ver `docs/canon/CANON_CONFLICTS.md` §2 e §3.

## Problemas — MÉDIO

### Médio-1 — Conteúdo de Origem no jogo é muito mais raso que o cânone V7

`src/data/origins.ts` tem 1-2 frases por origem; `Livro V.O1-O5` da Bíblia
tem 5 entradas profundas por origem. Não é conflito, é lacuna de
enriquecimento — listado em `CANON_CONFLICTS.md` §5 e no plano de ingestão.

### Médio-2 — Saturação e Ruptura usam o mesmo fundo tratado

Já documentado honestamente no handoff da Fase 3
(`docs/HANDOFF-CURRENT.md` §9 "Limitações conhecidas"). Repetido aqui só
para constar na lista consolidada de problemas — não é um achado novo desta
auditoria.

### Médio-3 — Identidade visual por classe é só partícula+cor, não tratamento de tela

Idem — já documentado no handoff da Fase 3, listado aqui por completude.

### Médio-4 — Sistema de Ecos: nome coincide com cânone, mecanismo não verificado

Ver `docs/canon/CANON_CONFLICTS.md` §6.

## Problemas — BAIXO

### Baixo-1 — `AudioManager.ts` não foi renomeado apesar de virar um "AudioDirector"

Débito técnico cosmético, já registrado no handoff da Fase 3.

### Baixo-2 — `CharacterVisualProfile.visualTheme` é escrito, nunca lido

Campo morto, candidato a remoção — já registrado no handoff da Fase 3.

### Baixo-3 — `incoming-assets/` versiona ~15MB de binário bruto (RAR/7z) no git

Ver `ASSET_AUDIT.md`. Não é urgente, mas contraria a prática já adotada em
`docs/assets/ASSET-CATALOG.md` de manter originais brutos fora do
repositório.

## O que está CORRETO e não precisa mudar

Registrado explicitamente porque a Fase 0 pede honestidade nos dois sentidos
— não só listar problemas:

- **Fronteira GameEngine/IA já é real, não só documentada.** Todo o
  domínio (`src/domain/`, `src/combat/`, `src/quest/`, `src/social/`,
  `src/arcane/`) é TypeScript puro sem dependência de IA; dano, HP, Foco,
  XP, checks, Tensão, Marca, Índole, Reputação são 100% determinísticos e
  testados. Isso bate exatamente com `Livro 0.09` do cânone V7 ("IA
  interpreta intenção e narra; GameEngine valida"). O problema do
  Crítico-2 não é a fronteira estar errada — é a camada de IA nunca ser
  chamada.
- **8 classes + 5 origens: nomes e conceitos centrais são cânone V7
  confirmado**, sem necessidade de rework de nomenclatura.
- **Nenhuma chave de API no bundle** — `RemoteNarrativeProvider` só lê
  `import.meta.env.VITE_NARRATIVE_PROXY_URL` (uma URL, não um segredo), e
  não há `.env` no repositório. Consistente com a exigência de segurança
  da Trilha G.
- **Save é versionado com migração explícita** (`SaveDataV1..V5`,
  `src/save/migrations/`) — a arquitetura de versionamento pedida pela
  Trilha O já existe e é usada corretamente.
- **Registro de assets vs filesystem está consistente** — todo caminho
  referenciado no código (fora do bug de `base`) aponta para um arquivo que
  de fato existe; não há referência a asset inexistente.
- **`base: './'` no `vite.config.ts` já está correto** — a causa do
  Crítico-1 não é a configuração do Vite, é código que ignora essa
  configuração escrevendo caminhos absolutos manualmente.

## Arquitetura atual (resumo)

```
src/
  domain/    → regras puras (d20, atributos, HP/Foco, Ecos, WorldEvent, conhecimento) — TypeScript sem UI, testado
  combat/    → motor de combate por turnos
  quest/     → estado de missão determinístico
  social/    → Índole/Reputação, relações
  arcane/    → zonas Controle/Saturação/Ruptura, identidade arcana
  characters/→ modelo de personagem + registro visual (retratos/expressões)
  data/      → conteúdo autoral estático (classes, origens, ancestralidades, itens, locais, NPCs)
  content/   → cenas/diálogos/quests escritos à mão do capítulo 1
  ai/        → NarrativeProvider (Local/Remote) — DEFINIDO MAS NÃO CONECTADO (Crítico-2)
  narrative/ → NarrativeEngine, NarrativeContextBuilder — idem
  save/      → save versionado + migração + configurações
  ui/        → telas React + sistema visual (ExperienceDirector, temas, componentes)
  app/       → roteamento de tela (App.tsx) + GameContext (Provider único)
```

Camadas corretamente separadas; o problema não é a arquitetura, é que uma
camada inteira (`ai/`+`narrative/`) está desconectada do fluxo real.

## Arquitetura proposta (incremental, não redesign)

1. **`docs/canon/`** (criado nesta auditoria) — camada de cânone
   consultável, separada do código, alimentada sob demanda.
2. **Um helper único de caminho de asset** (`src/ui/assetPath.ts` ou
   similar) que centraliza `import.meta.env.BASE_URL` — elimina a classe
   inteira de bugs do Crítico-1 e evita que uma futura Fase reintroduza o
   mesmo erro caminho por caminho.
3. **Conectar `submitFreeAction` → `narrativeEngine.interpretFreeText`**
   (Crítico-2) — antes de qualquer expansão de conteúdo novo, porque é o
   sistema que a Trilha F/G do prompt trata como prioridade central
   ("Outra ação..." é chamada de "feature CRÍTICA").
4. **World State vs Canon vs Campaign State vs Character State** (Trilha
   I) — hoje o save (`SaveDataV5`) já separa razoavelmente
   personagem/mundo/campanha, mas não tem um conceito explícito de "Canon"
   como camada imutável separada — isso é natural agora que `docs/canon/`
   existe como a fonte read-only, e o save representa só o delta por
   campanha (ex.: NPC morto). Não requer mudança de schema imediata, só
   disciplina de onde cada fato mora.
5. Considerar `vite-plugin-pwa` (ou service worker manual mínimo) se
   "funciona offline de verdade" for um requisito real, não só a intenção
   (Alto-2).

## Próximo passo sugerido

Ver resumo executivo na resposta principal desta sessão — a ordem sugerida
segue a Fase 1 do prompt do usuário (fundação canônica) antes de qualquer
correção técnica, mas os dois achados Crítico já têm causa raiz identificada
e correção de baixo risco descrita acima, então podem ser corrigidos em
paralelo assim que autorizado, sem esperar a ingestão completa da Bíblia.
