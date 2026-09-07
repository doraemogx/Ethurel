# CREDITS

Registro de origem/licença de todo material de terceiros recebido para Ethurel.
Ver também `docs/design/05-DIRECAO-DE-ARTE.md`.

## Usado nesta build (identidade visual JRPG 16-bit)

### Mighty Pack — "The Mighty Palm" (RPG Maker VX Ace resource pack)

- **Arquivo enviado:** `Mighty_Pack.rar`
- **Arquivos efetivamente usados:** `Vx ace/Characters/Actors_1.png` (sprite do jogador/NPCs — grade padrão RPG Maker VX Ace, 8 personagens por folha, cada um com 3 frames × 4 direções de 32×42px) → `public/assets/mighty/characters/actors1.png`; `Vx ace/Characters/NPC_1.png` → `public/assets/mighty/characters/npc1.png`.
- **Autor:** "The Mighty Palm" (pseudônimo do autor; distribuído nos fóruns RPG Maker Web).
- **Licença:** confirmada pelo `Terms of Use.txt` incluído no próprio rar recebido — uso e edição livres ("You can edit it however you like"), crédito apreciado mas não obrigatório ("Credit the Mighty Palm. Or don't."), única restrição é não reivindicar autoria própria do material original.
- **Modificações:** nenhuma no arquivo. Em código, frames individuais são referenciados por índice (linha/coluna) para montar os ciclos de caminhada de 4 direções — ver `src/player/spriteReal.ts`.
- **Não usado:** os tilesets do mesmo pack (`Overworld-*`, `Ext-A*`) usam o formato de autotile do RPG Maker (blocos combinatórios de sub-tile), que não teríamos como decodificar corretamente sem o algoritmo original de composição — usar um sub-tile arbitrário desses blocos arriscava o mesmo tipo de erro de composição já corrigido no ciclo anterior (árvore/arbusto do Kenney). Preferimos o tileset plano (grade simples) do ansimuz abaixo para o terreno.

### Tiny RPG Town / Tiny RPG Music — Luis Zuno ("ansimuz")

- **Arquivos enviados:** `tinyrpgtownfiles.zip`, `TinyRPGMusic.zip`
- **Licença:** CC0 — confirmada explicitamente em `tiny-rpg-town-files/public-license.pdf` ("All assets included in this package are licensed under the Creative Commons Zero (CC0) license... no restrictions on use, modification, or redistribution") e em `TinyRPGMusic/public-license.txt` ("You may use these assets in personal or commercial projects... Credit no required but appreciated").
- **Arquivos efetivamente usados:**
  - `Assets/Environments/Town/tileset/tileset.png` → `public/assets/ansimuz/tileset.png` — recortes nomeados (casa, aglomerado de pinheiros, cruzamento de caminho) usados como pontos de referência da clareira, não como grade completa (ver `src/world/tilesetFrames.ts`).
  - `Assets/Environments/Town/tileset/grass-tile.png` → `public/assets/ansimuz/grass-tile.png` — textura de grama repetível (`TileSprite`) para o piso da clareira inteira.
  - `Assets/Environments/Vegetation props/{tree-1,tree-2,bush-1,bush-2,bush-3,plant-1,plant-2,plant-3}.png` → `public/assets/ansimuz/props/` — árvores/arbustos isolados para variar a silhueta sem repetir grid.
  - `Assets/Characters/Dark-Knight/spritesheet.png` (idle com capa, ataque com golpe de espada, recuo/hit, colapso/morte — confirmados também pelos previews `idle.gif`/`walk.gif`/`attack.gif` incluídos) → `public/assets/ansimuz/characters/dark-knight.png` — representação do jogador na tela de batalha (idle/attack/hurt/death reais).
  - `Assets/Battle Sprites/Living/slime.png` → `public/assets/ansimuz/battle/slime.png` — inimigo do primeiro encontro (criatura orgânica com olho único, coerente com uma anomalia arcana).
  - `Assets/Battle Backgrounds/Hazy Hills/battle-background-sunny-hillsx1.png` → `public/assets/ansimuz/battle/hazy-hills.png` — fundo de batalha (colinas ensolaradas — deliberadamente NÃO escuro, natureza pode ser bonita mesmo numa história madura).
  - `Assets/Environments/Town/spritesheets/npc.png` (facesets — 4 personagens × 3 variações de 16×16px) → `public/assets/ansimuz/portraits/npc-faces.png` — portrait do primeiro NPC em diálogo.
  - `TinyRPGMusic/tiny-rpg-town.ogg` → `public/assets/ansimuz/audio/town-ambient.ogg` — ambiente musical dos arredores de Varreth.
  - `TinyRPGMusic/Battle Encounter.ogg` → `public/assets/ansimuz/audio/battle-encounter.ogg` — música de batalha.
- **Não usado:** `Battle Sprites` restantes (Ogre/Mummy/Frog/wizard/família "Mechanic"), demais ambientes (Techlab/Cave), `Boss Fight 2.ogg`/`BossBattle.ogg` — fora do escopo desta vertical slice (um só inimigo, uma música de exploração e uma de batalha).

## Recebido, inventariado, **NÃO usado nesta build**

### Open RPG Fantasy Tilesets (finalbossblues, CC0 confirmado via `ReadMe.txt`)

Tilesets completos (world/exterior/interior/dungeon/ship) em formato RPG2000/3 "chipset", também CC0. Não usado porque o tileset do ansimuz acima já cobriu a necessidade desta slice (clareira exterior) com melhor coesão de composição pronta (praça/casa/cerca já arranjadas); reservado para interiores/dungeons futuros.

### Kenney "Tiny Town" e "Tiny Dungeon" (ciclo anterior — CC0 confirmado)

Permanecem no repositório (`public/assets/kenney/`) mas **deixaram de ser a identidade visual ativa** por instrução explícita deste ciclo ("a direção anterior... não está aprovada como identidade visual principal"). `VarrethOutskirtsScene.ts` não referencia mais esses arquivos.

### Puny Characters / Puny Characters (Orcs included) / "Pack de Sprites Pixel Art – Héroes" / Top-Down Dungeon + Character

- **Arquivos enviados:** `punycharacters.zip`, `punycharactersorcs_included.zip`, `Pack_de_Sprites_Pixel_Art___H_roes.rar`, `top_down_dungeon_and_character.zip`
- **Licença: NÃO CONFIRMADA a partir do material recebido** — nenhum dos quatro contém arquivo de licença/termos/readme com informação de uso; são apenas os arquivos de imagem (+ `.aseprite` de origem em um caso). Por mais que sejam pacotes tipicamente distribuídos como gratuitos em itch.io, a regra definida por você é clara: não usar enquanto a licença não puder ser determinada pelo material recebido.
- **Ação:** não integrados. Se você puder confirmar a licença de qualquer um destes (ex.: link da página itch.io de origem, que normalmente declara a licença ao lado do download), aviso e integro no próximo ciclo.

### Free RPG UI Kit (freepixel.art)

- **Arquivo enviado:** `freerpguikitpixelart120spritesassets.zip`
- **Licença confirmada:** livre para uso, crédito apreciado mas não obrigatório (`README.txt` no próprio zip).
- **Ação: não usado, por incompatibilidade visual, não por licença.** Ao inspecionar os arquivos (200×200px cada), constatamos que são renders com gradientes suaves/antialiasing e, em vários casos, texto decorativo incoerente embutido na própria imagem (ex.: um frame de diálogo com o texto "Docile Gual" impresso nele) — não é pixel art nítida de estilo retrô, contrasta com a nitidez `pixelArt:true`/paleta do resto do jogo, e herdaria texto sem sentido se usado como moldura. A UI de diálogo/HUD desta build é desenhada via `Phaser.GameObjects.Graphics` (painel + borda simples, paleta already-established de Ethurel), não colagem de terceiros — ver `src/ui/`.

## Autoral (sem questão de licença de terceiros)

- Pedra com veio de Arcane pulsante — pixel art gerada por código, mantida porque nenhum pack recebido (nesta rodada ou na anterior) tem um elemento visual apropriado para Arcane (orgânico/bioluminescente). Reutilizada nesta build a partir do ciclo anterior.
- Painéis de diálogo/HUD/botões (`src/ui/`) — desenhados via `Phaser.Graphics`, não são arte de mundo/personagem (permitido pela especificação: "Procedural Graphics pode continuar sendo usado para... painéis").
