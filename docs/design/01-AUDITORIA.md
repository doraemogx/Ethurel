# Auditoria — Ethurel v1 (Artifact) → Ethurel v2 (RPG 2D)

> Base: `ETUREL_PROJECT_HANDOFF.md` (838 linhas) + pedido de reconstrução do usuário (2026-09-06).
> Este documento responde ao item 2 da FASE 0/1: o que será **preservado**, **reconstruído**, **descartado** e **adicionado**.

## 1. PRESERVADO (cânone de universo e design — não é para reinventar)

- **Nome do mundo/jogo: Ethurel** (grafia com H confirmada pelo usuário).
- **Arcane** como força viva, orgânica, ancestral — nunca "magia roxa" nem elétrica. Nunca totalmente explicável.
- Os três estados de risco — **Controle / Saturação / Ruptura** — e a **Marca Arcana** como cicatriz permanente.
- **Índole** (quem o personagem se torna) separada de **Reputação** (como o mundo o vê) como dois sistemas distintos.
- As 12 dimensões de Índole e a ideia de colapsá-las num rótulo único (a fórmula exata pode ser revisitada, o conceito não).
- As **8 classes** e seus conceitos-chave: Portador de Cinza, Tecelão do Véu, Caçador de Fissuras, Lâmina Silenciosa, Guardião do Bastião, Arauto do Musgo, Andarilho do Selo, Lançador de Ossos — nomes, taglines, arquétipos, forças/fraquezas, afinidade com Arcane, caminhos de evolução.
- As **5 origens** (Cinzas Longas, Arquivo Vertido, Culto do Selo, Fronteira Partida, Bastião Caído) e seus ganchos (`hook`/segredo).
- Princípios, Desejos, Medos, Limites (os textos exatos already fixados).
- Filosofia narrativa: "mostrar, não explicar"; lore opcional e distribuída (Códice); NPCs definidos por um traço marcante; ritmo variado; "fail forward" em testes.
- A vertical slice inicial ser **Varreth + arredores** — não expandir o mundo cedo.
- O princípio de **até 3 personagens/jornadas em paralelo**.

## 2. RECONSTRUÍDO (o conceito fica, a implementação muda por completo)

| Sistema | Por quê muda |
|---|---|
| **Toda a arquitetura técnica** | Single HTML file → projeto modular em TypeScript, com engine de jogo real (ver `02-STACK-E-ARQUITETURA.md`). |
| **Movimento/exploração** | De "menu de nós de mapa" para personagem andando de verdade num mapa em tiles, com colisão, câmera e interação contextual. |
| **Balanceamento de combate/economia** | Hoje 100% decidido pela IA em tempo real, sem regra determinística. Passa a ser **código puro**: HP, dano, defesa, custos, cura são calculados por fórmulas fixas. A IA deixa de arbitrar números. |
| **Classes** | Hoje a diferença mecânica real entre classes é quase nula (todas seguem o mesmo template; a "identidade" é a IA interpretando texto). Passam a ter comportamento de código genuinamente distinto (mitigação real do Guardião, cura real do Arauto do Musgo, etc. — ver `03-GAMEPLAY-E-COMBATE.md`). |
| **Inimigos** | Hoje não existe nenhum inimigo fixo — tudo é inventado pela IA a cada combate, sem tipo/comportamento/loot table. Passa a existir um bestiário de dados. |
| **Itens/inventário** | Hoje é um array de strings livres sem propriedades. Passa a ser itens estruturados com raridade, stats, slot, requisitos. |
| **Quests** | Hoje é uma lista de strings *substituída* inteiramente a cada turno pela IA (risco de "esquecer" uma quest ativa). Passa a ser uma máquina de estados com objetivos verificáveis pelo próprio jogo. |
| **NPCs** | Hoje nenhum é fixo; tudo é improviso da IA sem persistência real. Passam a existir NPCs de dados (papel, localização, diálogo estruturado, relação, flags), com a IA enriquecendo apenas a camada de texto. |
| **Mapa** | De 4 nós abstratos num SVG decorativo para um espaço jogável real (tilemap), com Varreth como primeira região completa. |
| **Save** | De `window.storage`/`localStorage` acoplado ao runtime de Artifacts para um save system versionado, próprio da nova aplicação, com export/import e proteção contra sobrescrita silenciosa. |
| **UI** | De "site com cards" para HUD e telas de jogo (RPG real): diálogo em caixas curtas, ficha, inventário, mapa, tudo pixel art. |
| **Papel da IA** | De "é o jogo inteiro" para uma camada de enriquecimento (diálogo dinâmico, flavor text, interpretação de ação livre) que nunca decide HP, dano, XP, loot ou vitória/derrota. |

## 3. DESCARTADO (não carregar para a v2)

- O arquivo `ethurel.html` como arquitetura — vira **referência histórica**, não base de código.
- Estado global solto em variáveis de módulo (`C`, `history`, `busy`, etc.) sem encapsulamento.
- Pronomes **Ele/Ela/Elu** → confirmado: apenas **Homem/Mulher** na criação de personagem.
- UI baseada em cards/accordion de classe, dashboard, aparência de site/SaaS.
- Fog of war com 2 estados apenas (era uma simplificação técnica aceita, não a visão final) — será redesenhado como parte do sistema de exploração real (ver vertical slice).
- Dependência de `window.storage` do runtime de Artifacts.
- A ideia de que o combate "acontece se a IA decidir" — combate passa a ter encontros definidos pelo jogo.
- Qualquer suposição de que "medieval clean / marfim-esmeralda" é a direção visual final — não há confirmação pós-teste de que resolveu o problema; a nova direção visual (pixel art dark fantasy com beleza, não site) está descrita no pedido do usuário e será a referência daqui em diante.

## 4. ADICIONADO (não existia antes, é novo nesta reconstrução)

- Personagem jogável em pixel art (idle/walk/attack/hit/death, 4 direções).
- Mapa em tiles, colisão, câmera seguindo o jogador.
- Botão contextual de interação (Conversar/Abrir/Examinar/Pegar/Ler/Ativar/Descansar/Entrar).
- Bestiário de inimigos com stats, comportamento, resistências, loot table.
- Sistema de equipamento real (slots, stats, raridade, requisitos de classe).
- Arquitetura data-driven para classes/habilidades/efeitos/evolução (arquivos de dados separados de lógica).
- Manifestação visual de Arcane no ambiente (partículas, reação de NPCs) por zona, por classe.
- Pergaminho pixel art para narrativa de destaque (prólogo, capítulos, profecias), com texto progressivo.
- Abstração de narrador por voz (TTS do dispositivo), opcional, nunca obrigatória.
- AudioManager desde o início (mesmo com poucos assets reais no começo).
- Backend mínimo para proteger a chave de API (a IA nunca fica embutida no cliente distribuído).
- PWA instalável e, depois, empacotamento via Capacitor para gerar APK.

## 5. Observações importantes herdadas do handoff (não ignorar)

- Não existe log de nenhuma campanha real jogada — nenhum NPC/evento específico ("a velha", "ruela norte") deve ser tratado como cânone sem confirmação do usuário. Se ele tiver um JSON exportado de uma sessão antiga, vale pedir antes de inventar lore que contradiga aquilo.
- O nome "Fronteira Partida" aparece tanto como origem quanto como nó de mapa — manter consistente na v2.
- Os números exatos de custo/tensão/dano de habilidades da v1 **nunca foram balanceados por playtest real** — servem de ponto de partida, não de verdade absoluta; serão revisados na Fase 5 (Combate).
