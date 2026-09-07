# Catálogo de Assets — Phase 3

Auditoria completa dos 10 packs de assets recebidos para a Phase 3, feita **antes** de
qualquer alteração de código, conforme exigido pelo prompt de execução. Todos os 10 packs
foram extraídos e validados (decodificação PIL sem corrupção) nesta sessão.

Os arquivos **brutos/originais** (RAR/ZIP/7z e PNGs de alta resolução, ~300MB no total) **não
são versionados no repositório** — GitHub Pages não deve carregar centenas de MB de material
não otimizado, e o prompt da Phase 3 pede explicitamente para manter originais fora do bundle
quando fizer sentido. O que entra em `public/assets/` são **derivados otimizados (WebP)**,
recortados/tratados especificamente para uso no jogo. Este catálogo documenta a origem de
cada derivado usado.

> Convenção de status: **USADO** (entrou no bundle, tratado), **CANDIDATO** (qualidade boa,
> não usado nesta fatia vertical — motivo indicado), **DESCARTADO** (não serve à direção de
> arte ou está fora de escopo).

---

## Pack #1 — Nyteon "Fantasy Character Portraits RPG" (bust pack)

- **Origem:** itch.io (nyteon.itch.io), gratuito.
- **Autor:** Nyteon (Matheus Ganancio).
- **Formato:** PNG, 1792×1792, fundo transparente, busto (waist-up).
- **Conteúdo:** 5 personagens — Dark Elf, Dark Princess, Druid, Oracle, Vampire.
- **Licença:** uso pessoal e comercial permitido; proibida revenda/redistribuição do arquivo
  standalone; crédito apreciado, não obrigatório.
- **Uso proposto:**
  - `DarkElf.png` → candidato a rosto de NPC/Origin ligado à Fronteira Partida (Fissuras) —
    **CANDIDATO**, reservado para uma expansão futura de Origem, fora do escopo desta fatia.
  - `Oracle.png` → **USADO** como retrato de uma figura de conhecimento em Varreth (guardiã de
    saber arcano, papel de apoio narrativo, sem alterar cânone de Origem).
  - `Vampire.png`, `Druid.png`, `DarkPrincess.png` → **CANDIDATO**, guardados para conteúdo
    futuro (não há gancho narrativo canônico nesta fatia vertical para introduzi-los sem
    forçar lore).

## Pack #2 — Nyteon "Fantasy Character Portraits RPG Pack 2"

- **Origem/autor/licença:** iguais ao Pack #1 (mesmo criador, mesmos termos).
- **Formato:** PNG, 1792×1792 transparente (bustos); 1 ilustração full-body em resolução maior.
- **Conteúdo:** Druid, Elf, Princess, Pyromancer, Sorceress (bust-up) + Dark Princess (full body,
  bônus).
- **Uso proposto:**
  - `Pyromancer.png` → **USADO** como retrato de um NPC de Varreth associado a calor/brasas —
    reforça a identidade visual do Portador de Cinza sem criar novo personagem canônico de
    Origem (é um NPC comum, não altera lore).
  - `Elf.png`, `Sorceress.png`, `Princess.png`, `Druid.png`, `DarkPrincess.png` (full body) →
    **CANDIDATO** — qualidade alta, mas sem gancho narrativo nesta fatia; reservados.

## Pack #3 — Cogabushi "25 Fantasy Character Asset Pack"

- **Origem:** compra do usuário (site do autor/Cogabushi), enviado localmente em 7 ZIPs.
- **Formato:** PNG, fundo transparente. Cada um dos 25 personagens (IDs 101–125) tem:
  - `25_full/f_{id}_{1-3}.png` — 3 variações de expressão, corpo inteiro, parado.
  - `25_full_with_shadow/fs_{id}_{1-3}.png` — mesmas 3, com sombra de contato.
  - `25_pose/p_{id}.png` — 1 pose de ação dinâmica.
  - `25_upper/{id}_{1-6}.png` — 6 recortes de busto com expressões distintas (neutro/sério,
    sorriso largo, cenho franzido, irritação, dor/raiva com dentes cerrados, olhos fechados
    contente).
  - `background_char_ready/background_{1-5}.png` — 5 fundos genéricos (não usados; ver Pack
    #7/#8/#9 para os fundos reais de Ethurel).
- **Estilo:** anime/fantasia de alta qualidade, cavaleiros/guerreiros com armadura.
- **Licença:** termos do pack original (Cogabushi) — uso em projeto de jogo permitido; ver
  `ASSET-LICENSES.md`.
- **Uso proposto:** este é o pack com **maior cobertura de expressões por personagem**, então
  é a base do sistema de expressões (§9). Nesta fatia vertical:
  - Personagem 101 → **USADO** como base visual para um NPC recorrente de Varreth (Tolven, já
    existente no chapter 1) — perfil `npc-tolven` recebe portrait/expressões deste ID.
  - Personagens 102–106 → **CANDIDATO** para próximas expansões de elenco (companheiros,
    antagonistas menores); catalogados, não wireados nesta fatia.
  - `background_char_ready/*` → **DESCARTADO** para cenário (fundos genéricos demais, sem
    identidade de local); mantido apenas como referência.

## Pack #4 — Pixel Material Studio "FR16 — 50 Free Anime Fantasy" (amostra)

- **Origem:** compra/amostra do usuário.
- **Formato:** PNG. 10 personagens (IDs FR16_151–160), 5 expressões cada (Angry/Normal/Sad/
  Smile/Special) = 50 arquivos. Sem README/licença embutido no ZIP da amostra.
- **Conteúdo:** CheatHero(151), ChuniHero(152), BrawlerPrincess(153), SilentKnifeMaid(154),
  BlackWitch(155), TimidMage(156), GuildReceptionist(157), ShyElf(158), DragonGirl(159),
  FloatingMystic(160).
- **Licença:** **não confirmada por documento incluído nesta amostra** — tratado como material
  de amostra promocional; usado apenas internamente no jogo (não redistribuído como arquivo
  standalone). Ver `ASSET-LICENSES.md` para a ressalva completa.
- **Uso proposto:** segunda fonte de expressões por personagem (5 estados nomeados mapeiam bem
  para neutral/happy/sad/angry/surprised do sistema de expressões).
  - `BlackWitch` → **USADO** como um NPC de Borda dos Musgos ligado a saber arcano/floresta.
  - `TimidMage`, `ShyElf` → **CANDIDATO**, reservados.
  - Os demais 7 → **CANDIDATO**, catalogados para expansão futura de elenco.

## Pack #5 — OpenGameArt "Simple Map Tiles"

- **Origem:** OpenGameArt.org (bloqueado neste ambiente; recebido via upload manual do usuário).
- **Formato:** PNG RGBA. 3 arquivos:
  1. Folha de elementos de terreno em sépia/aquarela (montanhas, colinas, lagos, cavernas,
     fissura, aglomerados de árvores, pinheiros, pontes, ícones de vilarejo) — 1920×1080.
  2. Moldura de pergaminho vazia (rolo de mapa, cantos rasgados) — 1261×851.
  3. Exemplo de mapa já composto, com faixas/fitas para rótulos — 1335×931.
- **Licença:** OpenGameArt, termos permissivos (ver `ASSET-LICENSES.md`).
- **Uso proposto:** **USADO** — base direta do novo `MapScreen` (§13). A moldura de pergaminho
  vira o fundo do mapa; os elementos de terreno são recortados/recompostos (não colados
  inteiros) para desenhar a geografia própria de Ethurel; o exemplo composto serve apenas de
  referência de composição, não é usado diretamente (a geografia é a de Ethurel, não a do
  exemplo).

## Pack #6 — OpenGameArt "Fantasy Parchment Set"

- **Origem:** OpenGameArt.org, recebido via upload manual.
- **Formato:** PNG RGBA. Rolo de pergaminho lacrado com fita vermelha, pergaminho dobrado,
  "mapa" dobrado, envelope lacrado, envelope aberto com carta, e uma folha de contato reunindo
  os 5 itens.
- **Licença:** OpenGameArt, termos permissivos.
- **Uso proposto:** **USADO** — texturas de pergaminho para o Diário (categorias
  quests/pessoas/lugares/facções/lore) e para cartas/documentos narrativos pontuais. **Não**
  usado como fundo geral de UI (o prompt explicitamente proíbe empacotar tudo em pergaminho).

## Pack #7 — Divinet "Forests and Valleys BG Pack"

- **Origem:** compra do usuário, recebido via upload manual (16 imagens).
- **Formato:** PNG RGBA, 1920×1080.
- **Conteúdo:** ~5 composições base (borda de floresta com arco de pedra, campo de flores,
  trilha de montanha, lago ao luar, campo/rio) × variações de luz/clima (dia, noite, "lua de
  sangue" avermelhada/com grão).
- **Licença:** termos de compra do usuário (Divinet) — uso em projeto próprio permitido.
- **Uso proposto:** **USADO** — base visual principal de **Borda dos Musgos** (identidade de
  floresta/vegetação/névoa/umidade exigida pelo §2). A variante dia é o estado padrão; a
  variante "lua de sangue" é reservada para tratamento de Saturação/Ruptura na floresta
  (reaproveitando o mesmo fundo com tratamento diferente, conforme §12).

## Pack #8 — Assetsmithy "Fantasy Backgrounds"

- **Origem:** compra do usuário, recebido via upload manual (16 imagens).
- **Formato:** PNG, 1920×1080 ("full") e 1000×740 ("small") por cena, + 6 sobreposições
  pequenas transparentes (cogumelos, samambaias, caixotes/barris, folhagem).
- **Conteúdo:** portal/arco na floresta, campo de flores, floresta noturna bioluminescente,
  castelo ao entardecer, salão do trono.
- **Licença:** termos de compra do usuário (Assetsmithy).
- **Uso proposto:**
  - Floresta noturna bioluminescente → **USADO** como tratamento noturno/Arcano de Borda dos
    Musgos (esporos/bioluminescência reforçam a identidade do Arauto do Musgo, §10).
  - Salão do trono → **CANDIDATO**, reservado para uma cena futura de poder político em
    Varreth (fora do escopo desta fatia vertical — Varreth aqui é vila/posto de fronteira, não
    corte real).
  - Castelo ao entardecer, campo de flores, portal na floresta → **CANDIDATO**.
  - As 6 sobreposições (cogumelos, samambaias, caixotes) → **USADO** parcialmente como camada
    de primeiro plano (foreground) sobre os fundos de Borda dos Musgos, dando profundidade em
    parallax simples.

## Pack #9 — Assetsmithy "5 Free Medieval 2D Game Backgrounds"

- **Origem:** compra do usuário.
- **Formato:** PNG. `Backgrounds/` (alta resolução) + `Battlebacks/Backgrounds/` (resolução
  reduzida, pensada para tela de combate) + `Foregrounds/`.
- **Conteúdo:** castle_exterior, market_square_at_daylight, tavern_interior,
  throne_room_interior, winter_forest.
- **Licença:** termos de compra do usuário (Assetsmithy).
- **Uso proposto:** **USADO** — base visual principal de **Varreth** (§2 pede vila/cidade
  medieval habitada, com luz quente própria):
  - `market_square_at_daylight.png` → cena principal de Varreth (mercado, sensação habitada).
  - `tavern_interior.png` → interior de taverna (cena social/NPC).
  - `castle_exterior.png` → **CANDIDATO** (Varreth nesta fatia não tem castelo próprio — reservado).
  - `throne_room_interior.png` → **CANDIDATO** (mesmo motivo do Pack #8).
  - `winter_forest.png` → **CANDIDATO**, fora da estação/identidade atual de Borda dos Musgos
    (que usa o pack #7, floresta temperada/úmida, não nevada).
  - Versões `Battlebacks/` → **USADO** como fundo de tela de combate quando o combate ocorre em
    Varreth/mercado.

## Pack #10 — OpenGameArt "RPG Icons Set"

- **Origem:** OpenGameArt.org, recebido como `rpg_icons_set.7z` (extraído nesta sessão via
  `py7zr`, instalado no ambiente — o pack estava íntegro desde o início, o bloqueio era apenas
  de ferramenta local).
- **Formato:** atlas único 1024×1024 RGBA contendo 245 ícones de 64×64.
- **Autor:** "System G6" / "Qoma" — mistura elementos próprios com bases de Pixabay/Unsplash e
  assets CC0 de OGA.
- **Licença:** não exige crédito (apreciado, não obrigatório).
- **Uso proposto:** **USADO** — fonte do `ItemVisualRegistry` (§21) para ícones de inventário.
  Recortado do atlas item a item (grade 16×16 células de 64×64), somente os ícones
  efetivamente referenciados por itens existentes no jogo.

---

## Resumo — tabela de checagem final

| # | Pack | Recebido | Extraído/Validado | Utilizável |
|---|------|----------|--------------------|------------|
| 1 | Nyteon Fantasy Character Portraits RPG | Sim | Sim (unrar + PIL) | Sim |
| 2 | Nyteon Fantasy Character Portraits RPG Pack 2 | Sim | Sim (unrar + PIL) | Sim |
| 3 | Cogabushi 25 Fantasy Character Asset Pack | Sim (7 ZIPs) | Sim (unzip + PIL, 330 arquivos, 0 corrompidos) | Sim |
| 4 | Pixel Material Studio FR16 (amostra) | Sim | Sim (unzip + PIL, 50 arquivos) | Sim (licença de amostra — ver ressalva) |
| 5 | OpenGameArt Simple Map Tiles | Sim (3 imagens manuais) | Sim (PIL) | Sim |
| 6 | OpenGameArt Fantasy Parchment Set | Sim (6 imagens manuais) | Sim (PIL) | Sim |
| 7 | Divinet Forests and Valleys BG Pack | Sim (16 imagens manuais) | Sim (PIL) | Sim |
| 8 | Assetsmithy Fantasy Backgrounds | Sim (16 imagens manuais) | Sim (PIL) | Sim |
| 9 | Assetsmithy 5 Free Medieval 2D Game Backgrounds | Sim | Sim (unzip + PIL, 15 arquivos) | Sim |
| 10 | OpenGameArt RPG Icons Set | Sim | Sim (py7zr + PIL, 245 ícones em atlas) | Sim |

Todos os 10 packs previstos para a Phase 3 estavam disponíveis, íntegros e utilizáveis no
início da implementação.

## Nota de honestidade sobre a origem exata dos arquivos dos packs #5–#8

Os packs #5, #6, #7 e #8 foram recebidos como imagens soltas (extraídas manualmente pelo
usuário no celular, sem nomes de arquivo originais — o sistema de upload as recebeu como
`image.png` genérico). A associação de cada imagem ao seu pack de origem foi reconstruída
nesta sessão por **inspeção visual de conteúdo e correspondência de dimensões** com a descrição
que o usuário deu de cada pack no momento do envio (ex.: "moldura de pergaminho 1261×851",
"16 imagens 1920×1080 do Pack #7"), não por metadado de arquivo. A classificação por pack
tem alta confiança para os itens estruturalmente únicos (moldura de pergaminho, mapa composto,
folha de contato do parchment set) e confiança razoável — por estilo de arte e assunto — para
os fundos de floresta/castelo dos packs #7/#8, que têm dimensões e temas parecidos entre si.
Isso não afeta o uso no jogo (o conteúdo visual foi inspecionado e validado diretamente), mas
fica registrado para transparência.
