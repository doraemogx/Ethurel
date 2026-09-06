# Vertical slice de Varreth, assets e roadmap — Ethurel v2

## 1. Vertical slice: Varreth + arredores

Escopo mínimo que precisa provar o loop completo (mapeia direto para o item 30 do pedido original):

**Área jogável:**
- **Varreth** (vila): praça central, 2-3 casas (1 delas a taverna/pousada), 1 pequeno santuário/altar, um poço — todos com interior explorável só onde fizer sentido (taverna e talvez a casa de um NPC-chave).
- **Estrada Velha** (caminho a leste): trecho curto ligando Varreth a uma pequena clareira/ruína, com 1 ponto de manifestação de Arcane visível e 1 área de encontro (combate).
- Uma transição de mapa simples (borda do mapa da vila → cena da estrada → cena da clareira), sem exigir um mundo aberto contínuo ainda.

**Sistemas que precisam funcionar de ponta a ponta:**
1. Criação de personagem completa (identidade Homem/Mulher, classe, origem, passado, princípio, desejo, medo, limite).
2. Tela de seleção de classe visual e dedicada (todas as 8, com apresentação plena pelo menos para a classe escolhida).
3. Personagem em pixel art andando (4 direções) com colisão real contra cenário.
4. Câmera seguindo o jogador.
5. Pelo menos 2 NPCs persistentes em Varreth, com diálogo em caixas curtas e 1 deles dando uma quest.
6. Botão de interação contextual (falar/examinar/pegar/entrar) funcionando com pelo menos 4 tipos de objeto/NPC.
7. 1 quest estruturada, com objetivo verificável pelo jogo (ex.: "investigar a Estrada Velha e voltar com uma prova").
8. Saída de Varreth, exploração da Estrada Velha, 1 ponto de Arcane visível (reação ambiental de Saturação, por exemplo).
9. 1 encontro de combate definido (não aleatório-IA) contra 1-2 inimigos do bestiário, usando pelo menos 1 habilidade de classe e mudando a tensão Arcana.
10. Loot real (item estruturado) ao vencer.
11. Volta a Varreth, entrega da quest, 1 consequência perceptível (reputação/diálogo muda).
12. Save automático + fechar e reabrir com o personagem exatamente onde estava (teste de aceite obrigatório).

**Fora de escopo nesta fatia (fica para depois):** as outras regiões do handoff (Fronteira Partida, Arquivo Vertido, Cinzas Longas, Casas Bastião, Culto do Selo, A Vigília) — existem como sementes de lore, não como mapas jogáveis ainda.

## 2. Assets necessários para a vertical slice

Seguindo sua decisão: **nada de placeholders geométricos**; usar pixel art temporária de qualidade (bases CC0 tipo Kenney/itch.io), recolorida/tratada para a paleta de Ethurel, e estruturada num manifesto central (`src/data/assets.ts`) para troca fácil por arte definitiva depois.

| Categoria | Itens mínimos |
|---|---|
| Tileset exterior | grama, terra/caminho, pedra, água, árvore, parede/telhado de casa, cerca, porta — paleta puxando para pedra/musgo dessaturado/marfim envelhecido |
| Tileset interior | piso de madeira/pedra, parede, mobília básica (mesa, barril, prateleira, cama) |
| Personagem jogável | spritesheet 4 direções × (idle 2-4 frames, walk 4 frames, attack 3-4 frames, hit 1-2 frames, death 3-4 frames) |
| NPCs | 2-3 variações humanoides (reuso de base com recolor/acessório) |
| Inimigos | 2-3 sprites com idle/attack/hit/death (ex.: criatura corrompida por Arcane, bandido) |
| UI | moldura de caixa de diálogo estilo pergaminho, moldura de botão, barras de HP/Foco Arcano/Tensão, ícones de interação (falar/examinar/pegar/entrar) |
| Pergaminho | textura de papel envelhecido pixel art para cenas narrativas de destaque |
| Sigilos de classe | versão pixel art dos sigilos SVG existentes (8), cor variando por zona de Arcane |
| Partículas | brasa (Portador de Cinza), símbolos/linhas (Tecelão do Véu), folha/esporo (Arauto do Musgo), pó de pedra (Guardião do Bastião), névoa/sombra (Lâmina Silenciosa) — texturas pequenas simples |
| Fontes | 1 fonte estilo pixel/medieval só para títulos/números de UI + 1 fonte serifada bem legível para texto corrido de diálogo/narrativa (pixel puro é ruim para parágrafos em tela de celular) |
| Áudio (mínimo) | passos (grama/madeira/pedra), clique de UI, golpe de espada, ativação de Arcane, vitória/derrota, 1 loop ambiente de vila, 1 loop ambiente de estrada/exterior |

## 3. Roadmap por fases

| Fase | Entregável | Critério de saída |
|---|---|---|
| **0 — Auditoria** | Este conjunto de documentos (`docs/design/*`) | Aprovação do usuário |
| **1 — Game/Tech design** | Arquitetura de dados (classes, itens, inimigos, quests, mapa) + setup do projeto (Phaser+TS+Vite) | Projeto builda vazio, roda no navegador do celular |
| **2 — Protótipo de movimento** | Mapa mínimo + personagem placeholder-de-qualidade + câmera + colisão + joystick virtual/touch | Andar por um mapinha de teste, colidir com paredes, sem travar |
| **3 — Vertical slice de Varreth** | Ambiente completo de Varreth + NPCs + interação contextual + diálogo | Consegue andar, conversar, entrar em 1 interior |
| **4 — RPG core** | Stats, inventário, equipamento, sistema de quest estruturado | Recebe e conclui a 1ª quest com objetivo verificável |
| **5 — Combate** | Encontro definido, bestiário inicial, habilidades de classe, Arcane no combate | Vence 1 combate, ganha loot real, tensão/marca reagem |
| **6 — Narrativa** | Diálogos finais da slice, pergaminho, IA opcional (com fallback offline) | Cena de pergaminho funciona; IA liga/desliga sem quebrar o jogo |
| **7 — Save** | Persistência versionada + export/import | Teste fechar/reabrir passa sem exceção |
| **8 — Polish** | Pixel art definitiva onde já der, partículas, áudio final, UX/feedback tátil | Vertical slice "parece um jogo de verdade" na tela de um celular Android |

Nenhuma fase pula para a 8 antes de fechar as anteriores, conforme pedido.

## 4. O que NÃO faremos ainda (para não repetir erro de escopo da v1)

- Não vamos criar as outras regiões do mundo antes da slice de Varreth estar divertida.
- Não vamos escrever dezenas de itens/inimigos — só o suficiente para a slice provar o loop.
- Não vamos investir polish visual pesado (fase 8) antes do gameplay core (fases 2-5) estar jogável.
- Não vamos habilitar permadeath por padrão nem decidir isso sozinhos — fica marcado como decisão futura.

## 5. Próximo passo

Este documento (e os três anteriores em `docs/design/`) é a entrega da FASE 0/1 pedida — auditoria, stack, modelo de combate, arquitetura de pastas, proposta de vertical slice, assets e riscos. **Nenhum código de jogo foi escrito ainda**, conforme instruído. Aguardando sua aprovação para iniciar a Fase 1 (setup do projeto Phaser+TS+Vite) e a Fase 2 (protótipo de movimento).
