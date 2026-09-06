# Auditoria — Ethurel v1 (Artifact) → Ethurel v2 (RPG 2D)

> Base: `ETUREL_PROJECT_HANDOFF.md` (838 linhas) + pedido de reconstrução do usuário (2026-09-06) + revisão de design (rodada 2).
> Este documento responde ao item 2 da FASE 0/1: o que será **preservado**, **reconstruído**, **descartado** e **adicionado**.
>
> **Revisão 2:** direção geral aprovada. Esta versão incorpora os 15 ajustes de design pedidos antes de qualquer código (criação de personagem simplificada, Índole multidimensional, save desde o início, combate/Arcane redesenhados, efeitos componíveis, escopo do Guardião, IA como camada opcional pós-slice, direção artística formal, landmark de Varreth, quest piloto com duas resoluções, mobile UX/pixel rendering).

## 1. PRESERVADO (cânone de universo e design — não é para reinventar)

- **Nome do mundo/jogo: Ethurel** (grafia com H confirmada pelo usuário).
- **Arcane** como força viva, orgânica, ancestral — nunca "magia roxa" nem elétrica. Nunca totalmente explicável.
- Os três estados de risco — **Controle / Saturação / Ruptura** — e a **Marca Arcana** como cicatriz permanente. **Ajuste de design:** deixam de ser apenas três degraus crescentes de poder — cada zona tem uma identidade mecânica própria (estabilidade vs. potência vs. poder excepcional com consequência), ver `03-GAMEPLAY-E-COMBATE.md §4`.
- **Índole** (quem o personagem se torna) separada de **Reputação** (como o mundo o vê) como dois sistemas distintos. **Ajuste de design:** as 12 dimensões internas de Índole são a fonte de verdade — o rótulo (`indoleLabel`) é só uma síntese de apresentação, nunca a base de uma condição de jogo. Formalizamos também a regra: **Índole muda sempre que o personagem age, independente de testemunhas; Reputação só muda quando a ação é conhecida por um NPC/facção relevante.** Arquitetura simples de testemunhas/conhecimento em `03-GAMEPLAY-E-COMBATE.md §9`.
- As **8 classes** e seus conceitos-chave: Portador de Cinza, Tecelão do Véu, Caçador de Fissuras, Lâmina Silenciosa, Guardião do Bastião, Arauto do Musgo, Andarilho do Selo, Lançador de Ossos — nomes, taglines, arquétipos, forças/fraquezas, afinidade com Arcane, caminhos de evolução.
- As **5 origens** (Cinzas Longas, Arquivo Vertido, Culto do Selo, Fronteira Partida, Bastião Caído) e seus ganchos (`hook`/segredo).
- Princípios, Desejos, Medos, Limites (os textos exatos já fixados) — **permanecem como conceitos do modelo de personagem e do lore**, mas deixam de ser um formulário obrigatório na criação (ver seção 2).
- Filosofia narrativa: "mostrar, não explicar"; lore opcional e distribuída (Códice); NPCs definidos por um traço marcante; ritmo variado; "fail forward" em testes.
- A vertical slice inicial ser **Varreth + arredores** — não expandir o mundo cedo.
- O princípio de **até 3 personagens/jornadas em paralelo**.

## 2. RECONSTRUÍDO (o conceito fica, a implementação muda por completo)

| Sistema | Por quê muda |
|---|---|
| **Toda a arquitetura técnica** | Single HTML file → projeto modular em TypeScript, com engine de jogo real (ver `02-STACK-E-ARQUITETURA.md`). |
| **Criação de personagem** | O wizard de 9 telas da v1 vira um fluxo curto e visual: **Homem/Mulher → nome → aparência básica → classe → origem → jogar**. Passado, Princípio, Desejo, Medo e Limite deixam de ser perguntas obrigatórias na criação — a personalidade emerge primariamente das ações em jogo, via Índole. Esses campos continuam existindo no modelo de dados do personagem (podem ser preenchidos depois, por eventos de jogo, ou usados como semente opcional/avançada no futuro), mas não bloqueiam a entrada no mundo. |
| **Movimento/exploração** | De "menu de nós de mapa" para personagem andando de verdade num mapa em tiles, com colisão, câmera e interação contextual. |
| **Balanceamento de combate/economia** | Hoje 100% decidido pela IA em tempo real, sem regra determinística. Passa a ser **código puro**: HP, dano, defesa, custos, cura são calculados por fórmulas fixas — tratadas como **hipótese de trabalho** até uma especificação de balanceamento formal (gate obrigatório antes da Fase 5, ver `03-GAMEPLAY-E-COMBATE.md §1-2`). |
| **Classes** | Hoje a diferença mecânica real entre classes é quase nula. Passam a ter comportamento de código genuinamente distinto, mas via um **sistema de efeitos componíveis e data-driven** (Damage, Heal, Shield, ApplyStatus, ModifyStat, ModifyTension, MarkTarget, ConditionalEffect, Trigger, RandomEffect) em vez de uma função de código dedicada por classe — código especializado fica reservado para a exceção real, não a regra. Ver `03-GAMEPLAY-E-COMBATE.md §3`. |
| **Inimigos** | Hoje não existe nenhum inimigo fixo — tudo é inventado pela IA a cada combate, sem tipo/comportamento/loot table. Passa a existir um bestiário de dados. |
| **Itens/inventário** | Hoje é um array de strings livres sem propriedades. Passa a ser itens estruturados (arquitetura extensível), mas a **implementação da vertical slice fica deliberadamente pequena** (6-10 itens reais, sem sistemas de crafting/encantamento antecipados). |
| **Quests** | Hoje é uma lista de strings *substituída* inteiramente a cada turno pela IA. Passa a ser uma máquina de estados com objetivos verificáveis pelo próprio jogo, e a quest piloto da slice é desenhada para provar exploração + mistério Arcane + combate + decisão + consequência com **pelo menos duas resoluções significativas**. |
| **NPCs** | Hoje nenhum é fixo. Passam a existir NPCs de dados (papel, localização, diálogo estruturado, relação, flags), com a IA enriquecendo apenas a camada de texto — e com um sistema simples de "quem sabe o quê" (testemunhas/conhecimento) para alimentar Reputação sem virar simulação social complexa. |
| **Mapa** | De 4 nós abstratos num SVG decorativo para um espaço jogável real (tilemap), com Varreth como primeira região completa — agora com **um landmark visual/ambiental específico de Ethurel**, ligado sutilmente ao Arcane (ver `04-VERTICAL-SLICE-E-ROADMAP.md §1`). |
| **Save** | De `window.storage`/`localStorage` acoplado ao runtime de Artifacts para um save system versionado, **presente desde o primeiro estado jogável** (não deixado para o fim) — cada sistema novo integra o schema progressivamente; a Fase 7 cuida só de integração final, migração, export/import, recuperação de falha e teste de fechar/reabrir. |
| **UI** | De "site com cards" para HUD e telas de jogo (RPG real), pensada primeiro para **landscape em Android**: diálogo em caixas curtas, ficha, inventário, mapa, tudo pixel art com renderização nítida (nearest-neighbor/integer scaling). |
| **Papel da IA** | De "é o jogo inteiro" para uma **camada de enriquecimento opcional, adiada para depois da vertical slice provar que é divertida offline**. Diálogo essencial, quests, história, escolhas e Códice existem **localmente e por completo**, sem depender de IA nem de fallback genérico pobre. Só a abstração `NarrativeProvider` é preparada agora; o backend/proxy real de IA é construído depois. |

## 3. DESCARTADO (não carregar para a v2)

- O arquivo `ethurel.html` como arquitetura — vira **referência histórica**, não base de código.
- Estado global solto em variáveis de módulo (`C`, `history`, `busy`, etc.) sem encapsulamento.
- Pronomes **Ele/Ela/Elu** → confirmado: apenas **Homem/Mulher** na criação de personagem.
- **Formulário obrigatório de Passado/Princípio/Desejo/Medo/Limite na criação** — vira conceito de lore/modelo de dados, não etapa de UI bloqueante.
- UI baseada em cards/accordion de classe, dashboard, aparência de site/SaaS.
- Fog of war com 2 estados apenas (era uma simplificação técnica aceita, não a visão final) — será redesenhado como parte do sistema de exploração real.
- Dependência de `window.storage` do runtime de Artifacts.
- A ideia de que o combate "acontece se a IA decidir" — combate passa a ter encontros definidos pelo jogo.
- Hooks de código específicos por classe (uma função por classe) como arquitetura principal — vira sistema de efeitos componíveis; código bespoke só para mecânica realmente única.
- **Redirecionamento de dano de aliado do Guardião do Bastião** — removido do escopo da vertical slice enquanto não houver decisão de design sobre grupo/companions (a habilidade pode voltar depois, com essa decisão tomada explicitamente).
- Backend/proxy de IA como pré-requisito da vertical slice — adiado para depois de o núcleo determinístico já ser divertido sozinho.
- Qualquer suposição de que "medieval clean / marfim-esmeralda" é a direção visual final — a nova direção visual (pixel art dark fantasy com beleza, não site) segue uma especificação formal própria (ver `02-STACK-E-ARQUITETURA.md §8`), documentada antes de escolher qualquer asset temporário.

## 4. ADICIONADO (não existia antes, é novo nesta reconstrução)

- Personagem jogável em pixel art (idle/walk/attack/hit/death, 4 direções).
- Mapa em tiles, colisão, câmera seguindo o jogador.
- Botão contextual de interação (Conversar/Abrir/Examinar/Pegar/Ler/Ativar/Descansar/Entrar).
- Bestiário de inimigos com stats, comportamento, resistências, loot table.
- Sistema de equipamento real (slots, stats, raridade, requisitos de classe) — arquitetura extensível, implementação mínima na slice.
- Sistema de efeitos componíveis e data-driven para habilidades/classes/status.
- Sistema simples de testemunhas/conhecimento de eventos, separando o que muda Índole (sempre) do que muda Reputação (só se testemunhado/conhecido).
- Manifestação visual de Arcane no ambiente (partículas, reação de NPCs) por zona, por classe — com identidade mecânica própria por zona (não só "mais poder").
- Mecanismos explícitos de gerenciamento/redução de Tensão Arcana (descanso, descarga ativa, ambiente).
- Pergaminho pixel art para narrativa de destaque (prólogo, capítulos, profecias), com texto progressivo.
- Um landmark visual/ambiental específico de Varreth, sutilmente ligado ao Arcane.
- Abstração `NarrativeProvider` desde o início — IA real conectada só depois da slice provar que funciona sem ela.
- AudioManager desde o início (mesmo com poucos assets reais no começo).
- `SaveStore` + `schemaVersion` desde o primeiro protótipo jogável (Fase 2), não só na Fase 7.
- Especificação formal de direção artística (resolução lógica, tile size, escala, perspectiva, frames mínimos, iluminação, paleta, linguagem visual do Arcane) antes de qualquer asset.
- Especificação formal de Mobile UX (landscape, safe areas, touch targets, botão Voltar do Android) e de renderização pixel-perfect (nearest-neighbor, integer scaling).
- PWA instalável e, depois, empacotamento via Capacitor para gerar APK.

## 5. Observações importantes herdadas do handoff (não ignorar)

- Não existe log de nenhuma campanha real jogada — nenhum NPC/evento específico ("a velha", "ruela norte") deve ser tratado como cânone sem confirmação do usuário.
- O nome "Fronteira Partida" aparece tanto como origem quanto como nó de mapa — manter consistente na v2.
- Os números exatos de custo/tensão/dano de habilidades da v1 **nunca foram balanceados por playtest real** — servem de ponto de partida, tratados explicitamente como hipótese até a especificação de balanceamento da Fase 5.
