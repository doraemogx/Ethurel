# Vertical slice de Varreth, assets e roadmap — Ethurel v2

> **Revisão 2:** criação de personagem simplificada; Varreth ganha um landmark específico ligado ao Arcane; a quest piloto é redesenhada com duas resoluções significativas que demonstram a diferença entre Índole e Reputação; roadmap reordenado para que o save exista desde cedo e a IA saia do caminho crítico.

## 1. Vertical slice: Varreth + arredores

### Criação de personagem (fluxo simplificado)

**Homem/Mulher → nome → aparência básica (cor de cabelo/pele/sigilo, opções simples e visuais) → classe → origem → jogar.**

Passado, Princípio, Desejo, Medo e Limite **não são mais perguntas obrigatórias nesta tela**. Continuam existindo como campos do modelo de personagem (podem ficar `null`/vazios no início, ou ser preenchidos futuramente por eventos de jogo, ou reaproveitados como uma opção "avançada"/opcional para quem quiser mais controle na criação — decisão de UI a tomar na Fase 1, não bloqueante agora). A personalidade do personagem passa a emergir primariamente da Índole, moldada pelas escolhas feitas durante o jogo — não de um formulário respondido antes de a primeira cena começar.

### O landmark de Varreth

Praça + taverna + poço + casas + ruína, sozinho, é genérico demais — não identifica Ethurel numa screenshot sem depender de texto/HUD. A vila ganha um elemento específico:

> **A Raiz Rompida.** No centro da praça de Varreth, uma antiga pedra fundacional foi partida ao meio séculos atrás por algo nunca totalmente explicado — e dessa fenda cresceu, atravessando a rocha, uma raiz grossa e escura que não pertence a nenhuma árvore visível nas redondezas. Ela pulsa muito lentamente com um brilho baço e esverdeado (mais perceptível ao anoitecer), e é ao redor dela que a vila foi reconstruída. Moradores deixam pequenas oferendas discretas na base da raiz (moedas, flores secas, fitas) sem necessariamente falar sobre isso abertamente.

Por que funciona: é visualmente único (uma pedra fendida com uma raiz bioluminescente atravessando a praça é reconhecível numa imagem estática, sem HUD), está sutilmente ligado ao Arcane (a linguagem visual orgânica/bioluminescente já definida em `02-STACK-E-ARQUITETURA.md §8`) sem explicar o mistério, e **serve de gancho mecânico**: é um dos lugares onde o personagem pode "assentar-se" para ajudar a reduzir Tensão Arcana (ver `03-GAMEPLAY-E-COMBATE.md §4`), amarrando lore + mecânica + identidade visual num único elemento, sem expandir o mundo.

### Área jogável

- **Varreth** (vila): praça central com a Raiz Rompida, 2-3 casas (1 delas a taverna/pousada), interior explorável na taverna e talvez em 1 casa-chave.
- **Estrada Velha** (caminho a leste): trecho curto ligando Varreth a uma pequena clareira/ruína, com 1 ponto de manifestação de Arcane visível (ligado tematicamente à Raiz Rompida) e 1 área de encontro (combate).
- Transição de mapa simples entre as duas cenas — sem exigir mundo aberto contínuo.

### A quest piloto — "O que a raiz sussurrou" (nome de trabalho)

Desenhada para provar o DNA do jogo (exploração + mistério Arcane + combate + decisão + consequência) com **duas resoluções significativas**, sem virar árvore narrativa grande:

1. **Gancho:** a taberneira (NPC quest giver em Varreth) está preocupada — animais da região andam agitados e um pastor não voltou da Estrada Velha. Pede para o jogador investigar.
2. **Exploração + mistério Arcane:** o jogador segue a Estrada Velha, encontra o ponto de manifestação de Arcane (reação ambiental visível, ecoando a Raiz Rompida da vila) e descobre a causa: **não é um monstro aleatório** — é uma pessoa (um refugiado/andarilho, ligado tematicamente às origens já existentes, ex.: alguém do Arquivo Vertido ou do Culto do Selo) que tentou usar um conhecimento arcano incompleto para tentar curar/salvar alguém próximo, e acabou provocando uma pequena corrupção local.
3. **Combate (obrigatório em ambas as resoluções):** a corrupção gerou uma criatura hostil (1-2 inimigos do bestiário) que ataca o jogador ao investigar — o combate acontece de qualquer forma, não é opcional nem pulável pela escolha moral.
4. **Decisão (pós-combate, só aparece depois de resolvido o perigo imediato):**
   - **Resolução A — Entregar a pessoa a Varreth:** o jogador leva a pessoa/prova de volta à taberneira. **Reputação com Varreth sobe** (a comunidade sabe, o jogador é visto como protetor confiável) — consequência pública e visível (ex.: preço melhor na taverna, NPCs cumprimentam o jogador). A pessoa responsável é punida/expulsa (mudança de estado visível daquele NPC). Dependendo de *como* a entrega é feita (ver diálogo), pode empurrar Índole para `honra`/`pragmatismo` ou para `crueldade`, se for feita sem misericórdia.
   - **Resolução B — Encobrir e ajudar em segredo:** o jogador ajuda a pessoa (dá um item, um conselho, deixa-a partir) e **não conta a verdade completa à taberneira** — só reporta que "o perigo foi resolvido". **Reputação com Varreth não muda** (a comunidade não sabe o que realmente aconteceu) — mas **Índole muda** (`compaixao`/`misericordia`, aplicado incondicionalmente, já que é a regra: Índole sempre muda, com ou sem testemunha) — e **Reputação com aquela pessoa específica sobe** (ela sabe o que o jogador fez por ela, `witnesses: [npcId]`), podendo render um gancho de retorno futuro (ela reaparece, lembra o favor).
5. **Consequência perceptível:** ao voltar a Varreth, o mundo reage de forma diferente conforme a resolução — isso é o teste de aceite da quest, não apenas "a quest muda de status para concluída".

Isso cobre exatamente os 15 itens deste pedido de revisão relacionados à quest/consequência, sem exigir mais que 1 quest, 3-4 NPCs/estados e 2-3 telas de diálogo por caminho.

### Sistemas que precisam funcionar de ponta a ponta

1. Criação de personagem simplificada (Homem/Mulher, nome, aparência básica, classe, origem).
2. Tela de seleção de classe visual e dedicada (todas as 8, apresentação plena pelo menos para a classe escolhida).
3. Personagem em pixel art andando (4 direções) com colisão real.
4. Câmera seguindo o jogador, com renderização pixel-perfect (`02-STACK-E-ARQUITETURA.md §10`).
5. Save ativo desde este ponto (posição, mapa atual) — ver roadmap §3.
6. Pelo menos 2 NPCs persistentes em Varreth (a taberneira + 1 outro), diálogo em caixas curtas.
7. Botão de interação contextual funcionando com pelo menos 4 tipos de objeto/NPC (falar, examinar a Raiz Rompida, pegar item, entrar na taverna).
8. A quest "O que a raiz sussurrou" completa, com objetivos verificáveis e as duas resoluções descritas acima.
9. Saída de Varreth, exploração da Estrada Velha, o ponto de Arcane visível.
10. O encontro de combate obrigatório, usando pelo menos 1 habilidade de classe (via efeitos componíveis) e mudando a Tensão Arcana.
11. Loot real (item estruturado) ao vencer.
12. Volta a Varreth, resolução da quest, consequência perceptível e **diferenciada por caminho** (prova real de Índole ≠ Reputação).
13. Fechar e reabrir o jogo com o personagem exatamente onde estava (teste de aceite formal da Fase 7, mas testável de forma simples desde a Fase 2 em diante).

**Fora de escopo nesta fatia:** as outras regiões do handoff (Fronteira Partida, Arquivo Vertido, Cinzas Longas, Casas Bastião, Culto do Selo, A Vigília) continuam como sementes de lore, não mapas jogáveis.

## 2. Assets necessários para a vertical slice

A especificação de direção artística (`02-STACK-E-ARQUITETURA.md §8`) é definida **antes** de escolher qualquer pack temporário — nenhum asset (nem CC0) entra sem obedecer a tile size, paleta, perspectiva e linguagem visual do Arcane já fixadas ali.

| Categoria | Itens mínimos |
|---|---|
| Tileset exterior | grama, terra/caminho, pedra, água, árvore, parede/telhado de casa, cerca, porta — mais os elementos únicos da Raiz Rompida (pedra fendida + textura de raiz bioluminescente) |
| Tileset interior | piso de madeira/pedra, parede, mobília básica (mesa, barril, prateleira, cama) |
| Personagem jogável | spritesheet 4 direções × (idle 2, walk 4, attack 3, hit 1-2, death 4 frames) conforme `02-STACK-E-ARQUITETURA.md §8` |
| NPCs | 2-3 variações humanoides (taberneira, o andarilho/refugiado da quest, 1 NPC ambiente) |
| Inimigos | 2-3 sprites com idle/attack/hit/death (a criatura corrompida da quest + 1 variante) |
| UI | moldura de diálogo estilo pergaminho, moldura de botão, barras de HP/Foco/Tensão, ícones de interação |
| Pergaminho | textura de papel envelhecido pixel art |
| Sigilos de classe | versão pixel art dos 8 sigilos, cor variando por zona de Arcane (não por classe) |
| Partículas | brasa, símbolos/linhas, folha/esporo, pó de pedra, névoa/sombra — forma por classe, intensidade por zona |
| Fontes | 1 fonte estilo pixel/medieval para títulos/números de UI + 1 fonte serifada legível para diálogo/narrativa corrida |
| Áudio (mínimo) | passos (grama/madeira/pedra), clique de UI, golpe, ativação de Arcane, vitória/derrota, loop ambiente de vila, loop ambiente de exterior |

Equipamento/itens: apenas os 6-10 itens definidos em `03-GAMEPLAY-E-COMBATE.md §5` precisam de sprite — nada além disso nesta fase.

## 3. Roadmap por fases (reordenado: save cedo, IA fora do caminho crítico)

| Fase | Entregável | Critério de saída |
|---|---|---|
| **0 — Auditoria** | Documentos de design (`docs/design/*`) | Aprovação do usuário |
| **1 — Game/Tech design** | Arquitetura de dados (classes/itens/inimigos/quests/mapa/efeitos), especificação de direção artística fechada, setup do projeto (Phaser+TS+Vite), **esqueleto do `SaveStore` + `schemaVersion:1`** já criado (vazio) | Projeto builda e roda no navegador do celular; save grava/lê um objeto vazio versionado |
| **2 — Protótipo de movimento** | Mapa mínimo + personagem + câmera pixel-perfect + colisão + joystick virtual/touch + **save já integrado** (posição, mapa atual) | Anda, colide, fecha e reabre sem perder posição |
| **3 — Vertical slice de Varreth** | Ambiente completo (com a Raiz Rompida) + NPCs + interação contextual + diálogo; **save integra** NPCs conhecidos/flags | Anda, conversa, entra em 1 interior; estado de diálogo sobrevive a fechar/reabrir |
| **4 — RPG core** | Stats, inventário, equipamento mínimo, sistema de quest estruturado (a quest piloto); **save integra** inventário/quests | Recebe e progride a quest com objetivos verificáveis, persistente |
| **5 — Combate** | **Gate: especificação de balanceamento formal** (§1 de `03-GAMEPLAY-E-COMBATE.md`) antes de codar; motor de efeitos componíveis; bestiário inicial; Arcane com zonas redesenhadas e gerenciamento de Tensão; **save integra** HP/Foco/Tensão/Marca | Vence o combate da quest, ganha loot real, Tensão sobe e pode ser gerenciada |
| **6 — Narrativa determinística local** | Diálogos finais da quest (as duas resoluções), Códice, cena de pergaminho — tudo **escrito localmente, sem depender de IA**; abstração `NarrativeProvider` implementada só com `LocalNarrativeProvider` | O jogo é completo e coerente jogado 100% offline/sem IA, incluindo as duas resoluções da quest |
| **7 — Save (fase dedicada)** | Integração final do schema completo, migração de versão, export/import com confirmação, recuperação de falha | Teste obrigatório: fechar/reabrir preserva tudo, inclusive após uma migração simulada |
| **8 — Polish** | Pixel art definitiva onde já der, partículas, áudio final, UX/feedback tátil, ajustes de Mobile UX (`02-STACK-E-ARQUITETURA.md §9`) | Vertical slice "parece um jogo de verdade" num celular Android |
| **9 — IA opcional (pós-slice)** | `RemoteNarrativeProvider` real + backend/proxy serverless, só depois de a Fase 8 fechar e a slice já ser comprovadamente divertida sem IA | IA liga/desliga sem quebrar nada; nunca decide regra, só enriquece texto |

## 4. O que NÃO faremos ainda

- Não criaremos as outras regiões do mundo antes da slice de Varreth estar divertida.
- Não escreveremos dezenas de itens/inimigos — só o suficiente para a quest piloto.
- Não investiremos polish visual pesado (fase 8) antes do gameplay core (fases 2-6) estar jogável.
- Não habilitaremos permadeath por padrão.
- Não construiremos proxy/backend de IA antes de a Fase 8 fechar — a Fase 6 prova que o jogo funciona sem isso.
- Não implementaremos sistemas de equipamento complexos (crafting, sets, encantamento) além dos 6-10 itens da demo.
- Não criaremos uma árvore de diálogo grande para a quest piloto — duas resoluções bem definidas, não múltiplos finais ramificados.

## 5. Próximo passo

Esta revisão incorpora as 15 mudanças pedidas na segunda rodada de design. **Nenhum código de jogo foi escrito ainda.** Aguardando nova aprovação para iniciar a Fase 1 (setup do projeto + arquitetura de dados + especificação de direção artística fechada + esqueleto de save).
