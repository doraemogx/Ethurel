# Character Asset Registry

> Rodada de Recuperação do Produto §2/§B. Auditoria completa de toda imagem
> de personagem disponível ao projeto — `incoming-assets/`, `public/assets/`,
> `docs/assets/`, histórico do Git. Objetivo: parar de reciclar as mesmas 4
> "viajante" para tudo, e documentar exatamente o que existe, o que falta, e
> por que cada imagem foi (ou não foi) usada onde foi.

## Onde procurei

- `incoming-assets/` — 2 arquivos compactados, nunca extraídos pelo código:
  `[FREE] Fantasy Character Portraits RPG.rar` (14 MB) e `rpg_icons_set.7z`
  (1,3 MB). Extraídos nesta rodada (ver abaixo) — **isso nunca tinha sido
  feito antes**, apesar do diretório existir desde a Fase 3 original
  (commit `2d8a602`/`c277763`).
- `public/assets/img/` — 70 arquivos WebP já curados e em uso (66 até a
  fase anterior + 4 novos desta rodada).
- `docs/assets/ASSET-CATALOG.md`/`ASSET-LICENSES.md` — catálogo e licenças
  do que já estava em `public/`.
- `src/assets/` — **não existe** neste repositório (só `public/assets/`).
- Histórico do Git (`git log --all --oneline`, 30 commits) — não existe
  nenhum commit anterior removendo ou descartando arte de personagem; os 66
  arquivos WebP atuais são o total já processado até a fase anterior.

## O que havia dentro de `incoming-assets/` (nunca extraído antes)

### `[FREE] Fantasy Character Portraits RPG.rar` — Nyteon (nyteon.itch.io)

5 bustos (cintura para cima, fundo transparente, 1792×1792 ou 2048×2048,
licença livre para uso comercial e pessoal, sem redistribuição do arquivo
avulso, crédito apreciado mas não obrigatório):

| Arquivo | Aparência | Apresentação lida | Usado agora como |
|---|---|---|---|
| `DarkElf.png` | Armadura/pauldron prateado, capa laranja/preta, cabelo escuro, confiante | Feminino | Vitrine da classe **Caçador de Fissuras** |
| `DarkPrincess.png` | Coroa de espinhos vermelha, vestido escuro elegante com dourado | Feminino | Vitrine de **Andarilho do Selo** + retrato de **Ynara Voss** (Personagem de Origem) |
| `Druid.png` | Cabelo verde, folhas no cabelo, colar tribal de madeira, tatuagens | Feminino | Vitrine de **Arauto do Musgo** |
| `Oracle.png` | Capuz escuro com runas douradas, olhos azuis, amuleto, brasa no peito | Masculino | **Duplicata** do `oracle.webp` já em uso (mesmo conceito/estilo — ver nota abaixo) |
| `Vampire.png` | Capa preta/vermelha, colar dourado, expressão fria e formal | Masculino | Vitrine de **Guardião do Bastião** + retrato de **Sera Doventh** (Personagem de Origem) |

Nota sobre `Oracle.png`: é visualmente quase idêntico ao `oracle.webp` já
processado em `public/assets/img/portraits/` (capuz escuro, runas douradas,
brasa) — quase certamente a mesma arte, re-enviada pelo usuário numa leva
posterior de `incoming-assets/`. Não reprocessado de novo; o arquivo já
existente foi mantido, só sua tag de `presentation` foi corrigida (estava
`'feminino'`, a arte é claramente masculina — ver §31 da rodada).

### `rpg_icons_set.7z` — System G6/Qoma

1 atlas único (1024×1024, 245 ícones de 64×64, licença livre, crédito
opcional). **Auditado e descartado para uso em ancestralidade/emblema**:
são ícones de item de inventário (poções, gemas, pergaminhos, armas,
comida) — nenhum comunica "povo"/cultura de um jeito que um emblema
heráldico precisa comunicar. Preferido criar SVG original para os 4 povos
(ver §E da rodada) em vez de forçar um ícone de poção como símbolo de
ancestralidade — exatamente o que o usuário pediu para evitar.

## Registro completo — todo personagem catalogado

Categorias: **PLAYER** (corpo inteiro, usável como opção de aparência do
jogador), **CLASS** (vitrine/capa da classe na criação), **ORIGIN**
(retrato de Personagem de Origem), **NPC** (personagem do mundo),
**GENERAL** (fundo/textura, não personagem), **UNSUITABLE** (auditado e
rejeitado para uso em personagem).

| id | arquivo(s) | tipo | retrato/corpo inteiro | apresentação | povo compatível | classe compatível | uso atual |
|---|---|---|---|---|---|---|---|
| `npc-tolven` | `portraits/tolven-*.webp` (5 expressões) + `fullbody/tolven-full.webp` + `poses/tolven-pose.webp` | **NPC** | ambos | masculino | Humanos de Avarra (canônico, Veyr) | — | Ferreiro de Varreth, NPC nomeado do capítulo 1. Reservado — nunca reaproveitado para jogador/classe. |
| `npc-oracle` | `portraits/oracle.webp` | **NPC** / **ORIGIN** | só retrato | masculino (corrigido nesta rodada) | não especificado | Tecelão do Véu (vitrine) | Retrato de **Corwin Thale** (Personagem de Origem, Arauto do Musgo) — reaproveite cross-categoria: a vitrine da classe dele (Druid) é diferente da sua arte pessoal, ver limitação abaixo. |
| `npc-pyromancer` | `portraits/pyromancer.webp` | **NPC** / **ORIGIN** / **CLASS** | só retrato | feminino | não especificado | Portador de Cinza | Vitrine de **Portador de Cinza** *e* retrato de **Mireth Sable** (mesma classe — reforço de identidade, não coincidência). |
| `npc-blackwitch` | `portraits/blackwitch-*.webp` (5 expressões) | **NPC** / **CLASS** | só retrato | feminino | não especificado | Lâmina Silenciosa (retagueado nesta rodada — estava `arauto-do-musgo`, chapéu de bruxa/gemas roxas não combina com "cura simbiótica com a natureza") | Vitrine de **Lâmina Silenciosa**. |
| `npc-darkelf` | `portraits/darkelf-neutral.webp` | **NPC** / **CLASS** | só retrato | feminino | não especificado | Caçador de Fissuras | Vitrine de **Caçador de Fissuras** (novo). |
| `npc-darkprincess` | `portraits/darkprincess-neutral.webp` | **NPC** / **CLASS** / **ORIGIN** | só retrato | feminino | não especificado | Andarilho do Selo | Vitrine de **Andarilho do Selo** *e* retrato de **Ynara Voss** (mesma classe). |
| `npc-druid` | `portraits/druid-neutral.webp` | **NPC** / **CLASS** | só retrato | feminino | não especificado | Arauto do Musgo | Vitrine de **Arauto do Musgo** (novo). Não usado para Corwin Thale apesar de ser a classe dele — Corwin é `masculino` e esta arte é claramente feminina (ver limitação abaixo). |
| `npc-vampire` | `portraits/vampire-neutral.webp` | **NPC** / **CLASS** / **ORIGIN** | só retrato | masculino | não especificado | Guardião do Bastião | Vitrine de **Guardião do Bastião** *e* retrato de **Sera Doventh** (mesma classe). |
| `player-viajante-a` | `portraits/viajante-a-*.webp` (5 expressões) + `fullbody` + `pose` | **PLAYER** / **CLASS** | ambos | feminino | genérico | Tecelão do Véu (vitrine) | Opção de corpo inteiro na criação (Feminino) *e* vitrine de **Tecelão do Véu** (robes ornamentados, vibe de estudiosa). |
| `player-viajante-b` | `portraits/viajante-b-*.webp` (5) + `fullbody` + `pose` | **PLAYER** / **ORIGIN** | ambos | masculino | genérico | Lançador de Ossos (retrato) | Opção de corpo inteiro na criação (Masculino) *e* retrato de **Doran Kessig** (chapéu teatral combina com "teatral, supersticioso"). |
| `player-viajante-c` | `portraits/viajante-c-*.webp` (5) + `fullbody` + `pose` | **PLAYER** / **CLASS** | ambos | feminino | genérico | Lançador de Ossos (vitrine) | Opção de corpo inteiro na criação (Feminino) *e* vitrine de **Lançador de Ossos**. |
| `player-viajante-d` | `portraits/viajante-d-*.webp` (5) + `fullbody` + `pose` | **PLAYER** | ambos | masculino | genérico | — | Opção de corpo inteiro na criação (Masculino). Sem vitrine de classe própria — sobra do pool, disponível para uso futuro. |
| `rpg_icons_set` (245 ícones) | `incoming-assets/rpg_icons_set.7z` | **UNSUITABLE** | — | — | — | — | Ícones de item de inventário — auditados e rejeitados para emblema de ancestralidade (ver acima). Podem servir para ícones de item de jogo no futuro (fora do escopo desta rodada). |

## Limitações que ficam documentadas, não escondidas

- **Nenhuma arte é "corpo inteiro" fora das 4 viajante.** Os 8 bustos
  (tolven à parte) são só retrato de cintura para cima — não podem virar
  fullBody sem esticar/inventar o resto do corpo, o que seria pior que não
  usar. Por isso continuam só como vitrine de classe/retrato de Origem/NPC,
  nunca como opção de aparência do jogador.
- **Corwin Thale (Arauto do Musgo, masculino) não tem retrato do próprio
  gênero+classe.** A única arte com o tema certo (Druid, natureza/musgo) é
  claramente feminina — usá-la pra ele violaria a regra de apresentação
  correta. Ele usa Oracle (mystic/calmo) em vez disso: gênero certo, tema
  aproximado, não idêntico. Documentado aqui como taxa de compromisso, não
  escondido atrás de silhueta.
- **7 das 8 vitrines de classe reaproveitam arte também usada em Personagem
  de Origem ou opção de jogador** (só Caçador de Fissuras/DarkElf e Arauto
  do Musgo/Druid são exclusivas). Em 4 casos isso é reforço proposital (mesma
  classe). Em nenhum caso duas classes OU dois Personagens de Origem
  diferentes compartilham a mesma arte entre si.
- **`player-viajante-d` não tem papel de vitrine.** Sobra do pool — pode
  virar vitrine alternativa de Guardião do Bastião (fisicamente parece
  "tanque") se o Vampire precisar ser liberado para outra coisa no futuro.

## Contagem final

- 12 identidades de personagem catalogadas (era 8 antes desta rodada).
- 4 arquivos novos processados e commitados (`darkelf`, `darkprincess`,
  `druid`, `vampire` — todos `-neutral.webp`, 900×900, alfa preservado).
- 8 classes agora têm vitrine própria e distinta entre si (era 1).
- 5 Personagens de Origem agora têm retrato próprio (era 0).
- 0 arquivo novo criado do zero (tudo vem de asset já fornecido pelo
  usuário) — consistente com a instrução de não inventar arte quando existe
  material real disponível.
