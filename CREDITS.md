# CREDITS

Registro de origem/licença de todo material de terceiros recebido para Ethurel.
Ver também `docs/design/05-DIRECAO-DE-ARTE.md §1`.

## Usado nesta build

### Kenney "Tiny Town"

- **Arquivo enviado:** `kenney_tinytown.zip`
- **Arquivo efetivamente usado:** `Tilemap/tilemap_packed.png` (tileset 12×11 tiles de 16×16px, empacotado sem espaçamento) → copiado para `public/assets/kenney/tinytown_tilemap_packed.png`
- **Autor:** Kenney (Kenney Vleugels), www.kenney.nl
- **Licença:** CC0 1.0 Universal (Creative Commons Zero) — confirmado pelo `License.txt` dentro do próprio zip recebido: *"This content is free to use in personal, educational and commercial projects. Support us by crediting Kenney or www.kenney.nl (this is not mandatory)"*.
- **Atribuição exigida:** nenhuma (voluntária). Este documento credita mesmo assim.
- **Modificações feitas por nós:** nenhuma no arquivo em si. Em `src/world/VarrethOutskirtsScene.ts`, alguns tiles individuais do mesmo tileset são compostos em runtime (via `RenderTexture` do Phaser) para formar objetos maiores (ex.: árvore grande a partir de 9 tiles 3×3, cabana a partir de 9 tiles com telhado/parede/porta) — composição de tiles originais, sem alterar os pixels de nenhum tile.
- **Tiles usados (índice no grid 12×11, linha-major):** 0, 1, 2 (variações de grama), 39 (caminho de terra), 43 (grama com seixos), 3, 4 (arbustos pequenos), 6-8/18-20/30-32 (árvore grande, composta), 48, 63, 72, 73, 84 (telhado/gable/parede/porta da cabana, composta).

## Recebido, inventariado, **NÃO usado nesta build**

### Kenney "Tiny Dungeon"

- **Arquivo enviado:** `kenney_tinydungeon.zip`
- **Licença confirmada:** CC0 1.0 Universal (mesmo texto de `License.txt` dentro do zip).
- **Por que não foi usado agora:** é um tileset de masmorra/interior (pedra, tochas, portas de masmorra, baús) — não tem conteúdo de exterior (grama/árvores) e seus "personagens" são ícones estáticos de 16×16 de pose única (sem direções nem ciclo de caminhada), então não servem como sprite animado do jogador. Reservado para quando construirmos interiores/masmorras (fora do escopo deste ciclo).

### LPC "lpc_entry" (base + bow/thrust, por Johannes Sjölund / "wulax")

- **Arquivo enviado:** `lpc_entry.zip`
- **Conteúdo:** spritesheets completos em grade 64×64, 4 direções × N frames, para as animações `walkcycle` (9 frames), `hurt` (6 frames), `slash` (6 frames), `spellcast` (7 frames), `thrust` (8 frames), `bow` (13 frames) — corpo humano/esqueleto + camadas modulares de roupa/armadura/cabelo/arma. Estrutura em camadas (BODY/HEAD/TORSO/LEGS/BELT/FEET/HANDS/WEAPON/BEHIND) preservável para composição futura de `CharacterAppearance`.
- **Licença: NÃO CONFIRMADA a partir do material recebido.** O zip contém um `README` com instruções técnicas e contato do autor, mas **nenhum arquivo de licença**. Sei, por conhecimento geral sobre a "Liberated Pixel Cup" (o concurso de onde esse tipo de asset historicamente vem), que submissões costumam ser licenciadas sob CC-BY-SA 3.0 e/ou GPL 3.0 — mas **isso não está declarado nos arquivos que recebi**, e a regra que você mesmo definiu é clara: não usar enquanto a licença não puder ser determinada pelo material recebido.
- **Ação:** **não integrado nesta build.** Se você conseguir confirmar a licença (ex.: a página original no OpenGameArt.org de onde isso veio, que normalmente lista a licença ao lado do download), me envie o link/print e eu integro no próximo ciclo — a arquitetura de animação já está preparada para isso (`src/player/animation.ts`).

### LPC "expansion_pack-0.04" (mesmo autor, armas adicionais: espada longa, rapieira, lança longa, morte do boneco de treino)

- **Arquivo enviado:** `expansion_pack0.04.zip`
- **Licença:** mesma situação do `lpc_entry` acima — README/CHANGELOG sem declaração de licença. **Não usado nesta build**, pelo mesmo motivo.

## Autoral (sem questão de licença de terceiros)

- Pedra com veio de Arcane pulsante (`ensureDecorTextures` em `VarrethOutskirtsScene.ts`) — pixel art gerada por código, mantida temporariamente porque nenhum dos packs recebidos contém um elemento visual apropriado para Arcane (orgânico/bioluminescente).
- Sprite do jogador (`src/player/sprite.ts`) — mantido desta build por não haver, nos packs com licença confirmada (Kenney), nenhuma opção de personagem animado com múltiplas direções.
