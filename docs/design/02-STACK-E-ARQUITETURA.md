# Stack técnica e arquitetura — Ethurel v2

> **Revisão 2:** save agora é infraestrutura desde o primeiro estado jogável (não mais uma entrega isolada da Fase 7); classes usam efeitos componíveis em vez de hooks por classe; IA/backend adiados para depois da slice provar que funciona offline; adicionadas especificações formais de direção artística, mobile UX e renderização pixel-perfect (seções 8-10).

## 1. Stack recomendada (aprovada pelo usuário)

| Camada | Escolha | Por quê |
|---|---|---|
| Engine de jogo | **Phaser 3** | Engine 2D em JavaScript/TypeScript feita para exatamente este tipo de jogo (RPG top-down em tiles): câmera, tilemaps, colisão (Arcade Physics), spritesheets/animação, input touch, tudo nativo. Roda em navegador (mobile-first) e é 100% código-fonte editável por texto — sem depender de uma UI de editor gráfico pesada (diferente de Godot/Unity), o que é essencial porque você desenvolve principalmente pelo celular e eu (Claude Code) edito por arquivos, não por interface visual. |
| Linguagem | **TypeScript** | Pega erros de tipo antes de rodar, e ajuda a impor a regra "classes/itens/inimigos/habilidades são dados tipados, não texto solto". |
| Build/dev server | **Vite** | Build rápido, hot-reload, e gera um `build` estático simples (HTML+JS+assets) que serve tanto para PWA quanto para o wrapper Capacitor. |
| Persistência local | `localStorage` (web) / **Capacitor Preferences + Filesystem** (quando empacotado como app) | Ver seção 4 — agora ativa desde a Fase 2, não só na Fase 7. |
| Empacotamento | **PWA instalável agora** → **Capacitor** para gerar APK quando quisermos | Ver seção 6. |
| Camada de IA | Abstração `NarrativeProvider` desde já; backend real **adiado** | Ver seção 5. |

**Alternativas consideradas e por que não:** Godot (fluxo centrado em editor gráfico, pior ajuste ao fluxo "Claude Code edita arquivos" e "você desenvolve pelo celular"), Unity (pesado demais para 2D mobile-first indie), React/Canvas puro sem engine (reinventaria câmera/colisão/tilemap/animação que o Phaser já resolve), React Native/Unity nativo direto (fricção de setup Android sem ganho real para um 2D tile-based).

## 2. Estrutura de pastas

```
ethurel/
├─ src/
│  ├─ core/        # bootstrap do jogo, config do Phaser, gerenciador de cenas, event bus
│  ├─ world/        # cenas de mapa, tilemaps, colisão, câmera, sistema de interação contextual
│  ├─ player/       # entidade do jogador, controlador de input/joystick, máquina de animação
│  ├─ effects/       # motor de efeitos componíveis (Damage, Heal, Shield, ApplyStatus, ModifyStat,
│  │                 #   ModifyTension, MarkTarget, ConditionalEffect, Trigger, RandomEffect)
│  ├─ classes/       # dados de classe (stats, habilidades como listas de efeitos, evoluções)
│  ├─ combat/        # cena/motor de combate por turnos, resolvedor de efeitos, iniciativa, IA de inimigo
│  ├─ items/        # inventário, equipamento, efeitos de item (reaproveita motor de efeitos)
│  ├─ quests/        # máquina de estados de quest, verificação de objetivos
│  ├─ npcs/        # registro de NPCs, árvore de diálogo, estado de relação
│  ├─ arcane/        # zona Controle/Saturação/Ruptura, mecanismos de gerenciamento de Tensão, Marca
│  ├─ social/        # Índole (12 dimensões) + Reputação + sistema de testemunhas/conhecimento de eventos
│  ├─ save/        # SaveStore, schemaVersion, serialização por sistema, migração, export/import
│  ├─ audio/        # AudioManager, registro de sfx/música
│  ├─ ui/        # HUD, caixa de diálogo, menus, ficha, pergaminho
│  ├─ ai/        # NarrativeProvider (interface) + implementação local determinística; provider real de IA vem depois
│  └─ data/        # classes.ts, origins.ts, enemies.ts, items.ts, quests.ts, map.ts, dialogues/*.ts
├─ assets/
│  ├─ sprites/, tiles/, audio/, fonts/
├─ public/         # manifest.json do PWA, ícones, service worker
├─ server/         # (criado só quando a Fase 9/IA opcional começar)
└─ docs/
```

Regra geral: **dado nunca fica espalhado em condicional** — toda classe/inimigo/item/quest/habilidade é um objeto em `src/data/*`, e o código em `effects/`, `combat/`, `items/`, `quests/` apenas *interpreta* esses dados.

## 3. Classes e habilidades: efeitos componíveis, não hooks por classe

Em vez de uma função de código dedicada por classe (`if (classe === 'Guardião') ...`), habilidades e passivas são **listas de efeitos de dados**, interpretadas por um motor genérico. O vocabulário de efeitos (Damage, Heal, Shield, ApplyStatus, ModifyStat, ModifyTension, MarkTarget, ConditionalEffect, Trigger, RandomEffect) e os exemplos completos por classe estão em `03-GAMEPLAY-E-COMBATE.md §3`. Código especializado (bespoke) fica reservado para o caso raro em que o vocabulário de efeitos realmente não dá conta de uma mecânica — nenhuma das 8 classes precisa disso hoje.

## 4. Save system — infraestrutura desde o primeiro estado jogável (não mais só na Fase 7)

**Mudança de prioridade:** o `SaveStore` deixa de ser uma entrega isolada da Fase 7 e passa a existir **desde a Fase 2 (protótipo de movimento)** — mesmo quando só há um retângulo andando num mapa de teste, esse estado mínimo (posição, mapa atual) já é serializado e persistido. Cada fase seguinte **integra progressivamente** seus próprios campos ao mesmo schema:

| Fase | O que passa a ser salvo |
|---|---|
| 2 — Protótipo de movimento | posição do jogador, mapa/cena atual, `schemaVersion: 1` |
| 3 — Vertical slice Varreth | NPCs conhecidos, flags de diálogo, estado de interação |
| 4 — RPG core | atributos, inventário, equipamento, quests (status + objetivos) |
| 5 — Combate | HP, Foco Arcano, Tensão, Marca Arcana, resultado de encontros |
| 6 — Narrativa | entradas de Códice, estado do NarrativeProvider local |
| **7 — Save (fase dedicada)** | **integração final de tudo acima**, migração de schema entre versões, export/import com confirmação, recuperação de falha (nunca apagar save silenciosamente), teste obrigatório de fechar/reabrir |

- **`SaveStore`:** adaptador único (`get/set/delete`) sobre `localStorage` (web) ou `Capacitor Preferences/Filesystem` (app empacotado) — o resto do código nunca sabe qual back-end está ativo.
- **`schemaVersion`:** presente desde o commit inicial do save, mesmo valendo `1`. Toda mudança de shape de dado depois disso é uma migração nomeada (`migrations/001_to_002.ts`), não uma edição silenciosa do formato.
- **Autosave:** a cada mudança relevante de estado, desde a Fase 2 (mover de mapa) até combate/quest mais adiante.
- **Slots:** até 3 personagens, com índice leve para listagem sem carregar o save completo.
- **Permadeath:** **não assumido** — desligado por padrão; morte leva a uma tela de derrota sem apagar o save automaticamente.
- **Critério de saída da Fase 7 (não da Fase 2):** criar personagem → jogar até ganhar algo → fechar → reabrir → personagem exatamente onde estava, incluindo migração testada de pelo menos uma versão de schema anterior.

## 5. IA como camada opcional — adiada, não removida

**Mudança de prioridade:** a implementação de proxy/backend/API de IA **é adiada para depois de a vertical slice já ser divertida e coerente sem IA nenhuma**. O que existe desde já é só a abstração:

```ts
interface NarrativeProvider {
  enrichDialogue(npcId: string, context: DialogueContext): Promise<string | null>;
  interpretFreeText(text: string, context: ActionContext): Promise<InterpretedAction | null>;
  flavorForEvent(event: WorldEvent): Promise<string | null>;
}
```

- **Implementação inicial (Fases 1-8): `LocalNarrativeProvider`** — não é "texto genérico pobre de fallback". É conteúdo essencial **autoral**: diálogos escritos à mão para os NPCs da slice, descrições de cena escritas à mão, texto de Códice escrito à mão. A IA nunca é pré-requisito para o jogo ser completo — ela é additive.
- **Implementação futura (Fase 9, opcional, pós-slice): `RemoteNarrativeProvider`** — aí sim entra um backend (função serverless guardando a chave da Anthropic) para variação dinâmica de diálogo e interpretação de ação livre mais rica. Só é construído depois que a Fase 8 (Polish) fechar e a slice já estiver comprovadamente divertida no modo 100% local/determinístico.
- **Regra permanente:** a IA nunca decide HP, dano, XP, loot, estado de quest ou vitória/derrota — isso é sempre código, com ou sem `RemoteNarrativeProvider` ativo.
- **Ação livre ("Outra resposta...")** no modo local: interpretação simples por palavras-chave contra as ações disponíveis na cena (não IA) — suficiente para não travar a experiência; fica mais rica quando o `RemoteNarrativeProvider` entrar.

## 6. Empacotamento: PWA → Capacitor

- **Agora:** o build do Vite já sai como PWA instalável (manifest + service worker) — no Android, "Adicionar à tela inicial" já dá ícone próprio, tela cheia, funciona offline para o núcleo do jogo (que é 100% do jogo, já que a IA é opcional).
- **Depois:** **Capacitor** empacota esse mesmo build web dentro de um app Android real (gera `.apk`/`.aab`), reaproveitando 100% do código.
- Instalar dependências (Android SDK/Studio) só será feito quando chegarmos nessa fase, com explicação e confirmação prévia.

## 7. Riscos técnicos identificados

1. **Fluxo "mobile-only" de autoria de mapas.** Mitigação: eu escrevo/edito os tilemaps diretamente como JSON de dados a partir da sua descrição em linguagem natural.
2. **Backend de IA.** Risco reduzido nesta revisão: como foi adiado para a Fase 9 (opcional, pós-slice), não bloqueia nada do núcleo do jogo. Quando chegar a hora, aviso do custo estimado antes de configurar qualquer conta externa.
3. **Determinismo vs. diversão.** Fórmulas de combate são hipótese até a especificação de balanceamento formal (gate da Fase 5, ver `03-GAMEPLAY-E-COMBATE.md §1-2`). Mitigação: números sempre em `src/data/*`, fáceis de tunar sem mexer em lógica.
4. **Performance mobile.** Mitigação: vertical slice pequena, medir cedo, não crescer o mundo antes de confirmar performance.
5. **Escopo das 8 classes.** Mitigação: todas as 8 recebem dados completos desde já (via efeitos componíveis, que reduzem custo de implementar cada uma); polimento visual pleno começa pela classe escolhida na slice.
6. **Migração de save entre versões.** Mitigada por já nascer com `schemaVersion` desde a Fase 2, em vez de ser adicionada depois de o schema já ter mudado várias vezes sem controle.

## 8. Direção artística — especificação antes de escolher qualquer asset

Antes de selecionar packs temporários (CC0 ou outros), fixamos a linguagem visual. Nenhum asset — nem temporário — entra sem obedecer a isto; recolorir um pack incompatível com estes parâmetros **não é suficiente**.

| Parâmetro | Definição |
|---|---|
| Resolução lógica de referência | 320×180 (proporção 16:9, escala inteira para telas maiores) — resolução de design interna, não a resolução real da tela |
| Tile size | 16×16 px como unidade base do tileset |
| Escala do personagem | Personagem jogável ocupa ~16×24 a 16×32 px (mais alto que um tile, padrão de RPG top-down clássico) |
| Perspectiva | Top-down com leve 3/4 (ângulo que mostra topo de objetos curtos e frente de objetos altos — paredes, árvores) |
| Proporção personagem/cenário | Personagem visivelmente menor que construções (uma casa deve ter várias vezes sua altura), preservando leitura de escala do mundo |
| Frames mínimos de animação | idle: 2 frames · walk: 4 frames · attack: 3 frames · hit: 1-2 frames · death: 4 frames (por direção, 4 direções) |
| Densidade visual | Cenário legível a distância de braço em tela de celular — evitar excesso de detalhe por tile que vire ruído em telas pequenas |
| Iluminação | Luz direcional suave, sombras curtas e discretas (não iluminação dinâmica complexa nesta fase) — clima "fim de tarde/crepúsculo" como padrão tonal |
| Paleta base | Pedra, pergaminho/marfim envelhecido, madeira, musgo, verde dessaturado, cinza, azul-noturno, âmbar, vermelho profundo — nunca preto puro dominante, nunca roxo neon |
| Linguagem visual do Arcane | Orgânico: veios de luz baça, esporos, bioluminescência, raízes — nunca eletricidade/raio, nunca "magia roxa genérica"; cor/intensidade da partícula muda por zona (Controle discreto → Saturação perceptível → Ruptura intenso), nunca por classe isoladamente (a classe define a *forma* da partícula — brasa, símbolo, folha, pedra, sombra — a zona define *intensidade*) |

Assets temporários (CC0/packs gratuitos) só entram se puderem ser ajustados a esta tabela (tile size, paleta, perspectiva) sem descaracterizar a leitura — caso um pack não sirva nem com ajuste de cor, buscamos outro em vez de forçar.

## 9. Mobile UX (formal)

**Orientação principal: landscape.** É a orientação assumida por padrão para exploração, combate e a maior parte da UI — mais compatível com câmera 16:9 top-down e com joystick+botões nas laterais.

| Aspecto | Especificação |
|---|---|
| Resolução lógica | 320×180 (ver §8), escalada para a tela real do dispositivo |
| Safe areas | HUD nunca ocupa os cantos extremos da tela (respeita notch/barra de gestos do Android); espaço reservado de ao menos 24px lógicos nas bordas para elementos essenciais |
| Fullscreen | PWA roda em modo `standalone`/fullscreen (sem barra de navegador) quando instalado; solicita fullscreen ao entrar em cena de jogo mesmo no navegador |
| Touch targets | Mínimo 44×44 px lógicos para qualquer botão essencial (interação, ataque, abrir menu) — nunca elemento crítico menor que isso |
| Joystick virtual | Zona inferior esquerda, joystick flutuante (aparece onde o polegar tocar dentro de uma área definida, não fixo num ponto exato) — evita exigir precisão |
| Botão contextual de interação | Zona inferior direita, botão único que muda de ícone/rótulo conforme o objeto/NPC mais próximo (Conversar/Abrir/Examinar/Pegar/etc.) |
| Interface de combate | Botões grandes em lista/roda inferior (Atacar/Habilidade/Item/Fugir), texto de status compacto no topo (HP/Foco/Tensão), sem exigir gestos multitoque |
| Diálogo | Caixa inferior de largura quase total, texto grande e curto, respostas como botões empilhados (nunca menores que o touch target mínimo) |
| Menus/inventário | Grade/lista com scroll vertical, itens grandes o bastante para toque com o polegar, sem exigir tooltip por hover (não existe hover em touch) |
| Botão Voltar do Android | Intercepta o botão físico/gestual de voltar: fecha overlay/menu atual em vez de sair do app; numa tela de jogo sem overlay aberto, mostra confirmação antes de sair (nunca sai direto sem aviso) |
| Escalonamento por proporção de tela | Layout em safe-area central fixa (a resolução lógica) + faixas extras nas bordas para telas mais largas (ultrawide/tablet) preenchidas com cenário/ambiente, nunca esticando a UI nem cortando elementos essenciais |

## 10. Pixel rendering e câmera

- **Nearest-neighbor obrigatório:** todo sprite/tile renderizado sem suavização (`pixelArt: true` no config do Phaser, `image-rendering: pixelated` em qualquer elemento HTML sobreposto).
- **Pixel snapping:** posição de câmera e sprites arredondada para o pixel lógico mais próximo antes de renderizar, evitando tremulação (shimmer) em movimento.
- **Integer scaling quando possível:** a resolução lógica (320×180) escala para a tela real em múltiplos inteiros (×2, ×3, ×4...) sempre que a tela permitir; quando não for múltiplo exato, prioriza a escala inteira mais alta que caiba e usa letterbox/preenchimento de cenário nas bordas, em vez de escala fracionária borrada.
- Câmera segue o jogador com *deadzone* pequena (não centraliza pixel a pixel a cada frame), reduzindo tremulação e leitura mais estável do cenário.
