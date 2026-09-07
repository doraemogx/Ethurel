# Asset Audit — Fase 0

> Classificação: **KEEP** (usar como está) / **REWORK** (usar, mas precisa
> ajuste) / **REPLACE** (trocar por outro asset/abordagem) / **BROKEN**
> (não carrega hoje, mesmo que o arquivo exista) / **UNUSED** (existe, não é
> referenciado por nada).
>
> Nota importante que atravessa quase toda esta tabela: os arquivos em
> `public/assets/img/` são **visualmente corretos e bem tratados** (curadoria
> feita na Fase 3, documentada em `docs/assets/ASSET-CATALOG.md`) — o
> problema não é a qualidade do asset, é que **nenhum deles carrega no deploy
> real** por causa do bug de caminho absoluto documentado em
> `REPO_AUDIT.md` §Crítico-1. Por isso a coluna "Status real" abaixo marca
> BROKEN para o carregamento em produção, mesmo quando o conteúdo em si é
> KEEP.

## `public/assets/img/backgrounds/` (7 arquivos, ~1,7MB)

Fundos reais de Varreth (mercado, taverna, taverna-batalha), Borda dos
Musgos (dia, noite bioluminescente, "lua de sangue"/Arcano) e Estrada Velha.
Curadoria e tratamento (recorte/cor/grading) documentados em
`docs/assets/ASSET-CATALOG.md`.

- **Conteúdo:** KEEP — qualidade e tratamento adequados, mesclam bem com a
  direção de arte pedida (medieval/rústico/material, não neon).
- **Nomenclatura geográfica:** REWORK potencial — se `CANON_CONFLICTS.md` §1
  levar a renomear "Borda dos Musgos" para algo compatível com "Orren"
  (cânone V7), os nomes de arquivo/registro precisam acompanhar.
- **Status real no deploy:** **BROKEN** (caminho absoluto, ver
  `REPO_AUDIT.md`).

## `public/assets/img/portraits/` + `fullbody/` + `poses/` (37 arquivos, ~5,3MB)

Tolven (retrato real + 5 expressões + full body + pose), 4 opções de retrato
de jogador (viajante-a..d, 5 expressões cada + full body + pose), Oracle,
Pyromancer, Black Witch (5 expressões).

- **Conteúdo:** KEEP para Tolven e as 4 opções de jogador (em uso ativo). As
  4 opções de retrato do jogador são genéricas (não ligadas a
  ancestralidade/povo) — se `CANON_CONFLICTS.md` §2 levar a adotar os 10
  povos canônicos, associar retrato↔povo é um REWORK futuro, não um
  problema agora.
- **Oracle/Pyromancer/Black Witch:** processados mas **UNUSED** — nenhuma
  cena do capítulo 1 os referencia (documentado como "reservado" no handoff
  da Fase 3). Mantê-los é razoável (baixo custo, ~700KB total) mas não
  contam como "em uso".
- **Status real no deploy:** **BROKEN** (mesmo bug de caminho).

## `public/assets/img/map/`, `parchment/`, `overlays/`, `icons/` (16 arquivos, ~370KB)

Moldura de pergaminho do mapa, 5 recortes de itens de pergaminho (Diário),
3 sobreposições de primeiro plano (cogumelos/folhagem/caixotes), 8 ícones de
item (um por motivo: ash/thread/trail/shadow/stone/moss/sigil/bone).

- **Conteúdo:** KEEP — todos em uso ativo, tamanho de arquivo pequeno
  (ícones ~2KB cada).
- **Status real no deploy:** **BROKEN** (mesmo bug de caminho).

## `public/icons/icon-192.svg`, `icon-512.svg` (ícones do PWA)

- **Conteúdo:** KEEP — SVG simples, referenciados corretamente em
  `manifest.webmanifest` com caminho relativo (`"icons/icon-192.svg"`, sem
  barra inicial) — **estes SIM carregam certo em produção**, ao contrário de
  tudo em `assets/img/`. Não foram inspecionados visualmente nesta auditoria
  (fora do escopo desta sessão) — confirmar se são um logo real ou
  placeholder genérico antes de aprovar como identidade final do app.

## `incoming-assets/` (upload manual do usuário, 3 arquivos, ~15,4MB)

`rpg_icons_set.7z` e `[FREE] Fantasy Character Portraits RPG.rar` — cópias
brutas dos Packs #10 e #1 já auditados e processados em
`docs/assets/ASSET-CATALOG.md` (a Fase 3 já recebeu e processou o mesmo
conteúdo via upload de chat, não deste diretório).

- **Status:** **UNUSED** pelo código (nada em `src/` referencia
  `incoming-assets/`) — e são arquivos brutos (RAR/7z) versionados
  diretamente no git, o que `docs/assets/ASSET-CATALOG.md` já registra como
  prática a evitar (~15MB de binário bruto no histórico do repositório).
- **Recomendação:** não apagar sem confirmação do usuário (foi um upload
  deliberado dele, feito durante esta mesma sessão) — mas o conteúdo já foi
  processado; manter o RAR/7z no histórico do git daqui pra frente não traz
  benefício técnico. Perguntar antes de remover.

## Assets legados de fases anteriores (Phaser/top-down)

Busca em `public/` e `src/assets/` não encontrou nenhum asset remanescente do
protótipo top-down (Kenney Tiny Town, sprites JRPG, etc.) mencionado nos docs
de fases anteriores — parecem já ter sido removidos em reconstruções
anteriores. **Nada para classificar aqui.**

## Resumo por classificação

| Classificação | O quê | Contagem |
|---|---|---|
| KEEP (conteúdo) | Todos os 66 WebP em `public/assets/img/`, exceto os 3 abaixo | 63 |
| UNUSED | Oracle, Pyromancer, Black Witch (sem cena que os use) | 8 arquivos (1 retrato + 5 expr. Black Witch + 2 únicos) |
| BROKEN (carregamento) | **Todos os 66 arquivos de `public/assets/img/`** | 66 — ver `REPO_AUDIT.md` §Crítico-1 |
| KEEP, funcionando | `public/icons/*.svg` via manifest | 2 |
| UNUSED (repo) | `incoming-assets/*` (raw, não referenciado por código) | 3 |
