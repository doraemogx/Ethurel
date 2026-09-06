# Stack técnica e arquitetura — Ethurel v2

## 1. Stack recomendada (aprovada pelo usuário)

| Camada | Escolha | Por quê |
|---|---|---|
| Engine de jogo | **Phaser 3** | Engine 2D em JavaScript/TypeScript feita para exatamente este tipo de jogo (RPG top-down em tiles): câmera, tilemaps, colisão (Arcade Physics), spritesheets/animação, input touch, tudo nativo. Roda em navegador (mobile-first) e é 100% código-fonte editável por texto — sem depender de uma UI de editor gráfico pesada (diferente de Godot/Unity), o que é essencial porque você desenvolve principalmente pelo celular e eu (Claude Code) edito por arquivos, não por interface visual. |
| Linguagem | **TypeScript** | Pega erros de tipo antes de rodar (importante já que não há QA humano constante), e ajuda a impor a regra "classes/itens/inimigos são dados tipados, não texto solto". |
| Build/dev server | **Vite** | Build rápido, hot-reload, e gera um `build` estático simples (HTML+JS+assets) que serve tanto para PWA quanto para o wrapper Capacitor. Consigo rodar o servidor de dev e você testa abrindo o endereço no navegador do próprio Android na mesma rede, sem precisar instalar nada pesado. |
| Persistência local | `localStorage` (web) / **Capacitor Preferences + Filesystem** (quando empacotado como app) | Ver seção 4. |
| Empacotamento | **PWA instalável agora** → **Capacitor** para gerar APK quando quisermos | Ver seção 6. |
| Backend de IA | Função serverless mínima (proxy) | Ver seção 5 — nunca embutir a chave da Anthropic no cliente. |

**Alternativas consideradas e por que não:**
- *Godot*: ótimo motor 2D, mas o fluxo de trabalho é centrado no editor gráfico (cenas `.tscn`, inspector) — mais difícil de eu manter só editando arquivos de texto, e mais difícil de você operar a partir do celular sem o editor Godot instalado.
- *Unity*: pesado demais para mobile-first indie 2D, curva de build Android mais complexa, pior ajuste ao fluxo "Claude Code edita arquivos".
- *React + Canvas/DOM puro (sem engine)*: reinventaríamos câmera, colisão, tilemap, animação — trabalho que o Phaser já resolve testado e documentado.
- *React Native / Unity para app nativo direto*: mais fricção de setup Android, sem ganho real para um jogo 2D web-based; o caminho PWA→Capacitor é mais simples e reversível.

## 2. Estrutura de pastas

```
ethurel/
├─ src/
│  ├─ core/        # bootstrap do jogo, config do Phaser, gerenciador de cenas, event bus
│  ├─ world/        # cenas de mapa, tilemaps, colisão, câmera, sistema de interação contextual
│  ├─ player/       # entidade do jogador, controlador de input/joystick, máquina de animação
│  ├─ classes/       # implementação de habilidades/efeitos por classe (código), lendo dados de /data
│  ├─ combat/        # cena/motor de combate por turnos, fórmulas de dano, status, IA de inimigo
│  ├─ items/        # inventário, equipamento, efeitos de item
│  ├─ quests/        # máquina de estados de quest, verificação de objetivos
│  ├─ npcs/        # registro de NPCs, árvore de diálogo, estado de relação
│  ├─ arcane/        # tensão/marca, cálculo de zona, hooks de reação ambiental
│  ├─ save/        # save manager, versionamento de schema, migração, export/import
│  ├─ audio/        # AudioManager, registro de sfx/música
│  ├─ ui/        # HUD, caixa de diálogo, menus, ficha, pergaminho
│  ├─ ai/        # cliente do serviço de IA (fala com o backend, nunca com a chave direto), fallback offline
│  └─ data/        # classes.ts, origins.ts, enemies.ts, items.ts, quests.ts, map.ts, dialogues/*.ts
├─ assets/
│  ├─ sprites/, tiles/, audio/, fonts/
├─ public/         # manifest.json do PWA, ícones, service worker
├─ server/         # função serverless do proxy de IA (repositório/pasta separada de deploy)
└─ docs/
```

Regra geral (item 33/34 do pedido): **dado nunca fica espalhado em condicional** — toda classe/inimigo/item/quest é um objeto em `src/data/*`, e o código em `classes/`, `combat/`, `items/`, `quests/` apenas *interpreta* esses dados.

## 3. Classes como mecânica (não texto)

Cada classe em `src/data/classes.ts` declara, além do já existente (tagline, atributos, tensionMult, markMult, 3 habilidades, evoluções), um **conjunto de hooks mecânicos reais**, por exemplo:

```ts
interface ClassMechanics {
  onHit?: (ctx) => void;          // ex.: Portador de Cinza ganha stack de dano ao tomar risco
  damageMitigation?: (dmg, ctx) => number; // Guardião do Bastião reduz dano recebido de verdade
  onAbilityCast?: (ability, ctx) => void;
  passive?: StatModifier[];        // ex.: Guardião: +X defesa fixa; Arauto: cura passiva fora de combate
}
```

Exemplo concreto: **Guardião do Bastião** não é tanque "porque a IA acha" — ele tem `damageMitigation` de código que corta uma % real do dano recebido, uma habilidade *Voto de Bastião* que soma um valor fixo de escudo (HP temporário) ao ser usada, e um cooldown real medido em turnos. **Arauto do Musgo** tem uma função de cura com valor fixo + escala por Presença, chamável só fora de cooldown. Isso vale para as 8 classes — cada uma recebe pelo menos 1-2 hooks mecânicos verdadeiros, não apenas flavor.

## 4. Save system (prioridade P0)

- **Onde mora o dado:** `localStorage` (web/PWA) com adaptador único (`SaveStore`) que troca para `Capacitor Preferences`/`Filesystem` quando rodando dentro do wrapper Capacitor — abstraído atrás da mesma interface, então o resto do código nunca sabe qual back-end está ativo.
- **Autosave:** a cada mudança relevante de estado (fim de turno, fim de combate, quest atualizada, entrada em novo mapa) — nunca dependente de o jogador lembrar de salvar.
- **Slots:** até 3 personagens, cada um com seu próprio save completo + uma chave de índice leve (resumo) para listar sem carregar tudo — mesmo padrão que já funcionava bem na v1.
- **Versionamento de schema:** todo save carrega um campo `schemaVersion`. Ao carregar, se `schemaVersion` for menor que a atual, roda uma cadeia de funções de migração (`migrations/001_to_002.ts`, etc.) antes de usar o save. Nunca apagar um save por falha de migração — se a migração falhar, mantém o save bruto intacto e avisa o jogador em vez de descartar.
- **Export/Import:** gera `.json` para download manual; import pede confirmação explícita se for sobrescrever um slot ocupado (corrige o risco silencioso que existia na v1).
- **Permadeath:** **não assumido**. Fica desligado por padrão na v2 até decisão explícita futura; morte leva a uma tela de derrota (game over) sem apagar o save automaticamente — reversão de uma escolha que na v1 já causou perda de progresso sem intenção clara de manter isso como regra permanente.
- **Teste obrigatório de aceite:** criar personagem → jogar até ganhar algo → fechar a aba/app → reabrir → personagem exatamente onde estava. Isso é gate de saída da Fase 7, não opcional.

## 5. IA como camada — segurança da chave

**Problema:** a v1 chamava a API da Anthropic direto do HTML no navegador do jogador — isso expõe a chave a qualquer pessoa que inspecionar o código-fonte. Isso é aceitável dentro do runtime fechado de um Artifact, mas **não pode continuar assim** num app distribuído (PWA/APK).

**Solução:** um pequeno servidor "proxy" (uma função serverless — ex. Cloudflare Workers, tem plano gratuito generoso e é simples de configurar) que:
1. Recebe do jogo apenas `{contexto do turno}`.
2. Ele, no servidor, anexa a chave da Anthropic (guardada como variável de ambiente secreta, nunca no código) e chama a API.
3. Devolve para o jogo só o texto/efeitos narrativos permitidos — nunca dano, HP, XP ou loot (essas regras são só código do cliente).

Isso exige criar uma conta gratuita numa dessas plataformas (vou te explicar cada passo em linguagem simples quando chegarmos nessa fase; não vou criar contas ou fazer deploy sem te avisar antes).

**Offline/fallback:** se o proxy estiver indisponível (sem internet, ou backend não configurado ainda em desenvolvimento), o cliente usa um "narrador mock" local — textos genéricos de transição ("Você anda por um tempo. Nada de novo chama sua atenção.") — para que o jogo **nunca trave ou pareça quebrado** por falta de IA. Todo o núcleo (movimento, combate, inventário, quests, save) funciona 100% sem rede.

## 6. Empacotamento: PWA → Capacitor

- **Agora:** o build do Vite já sai como PWA instalável (manifest + service worker) — no Android, "Adicionar à tela inicial" já dá ícone próprio, tela cheia, funciona offline para o núcleo do jogo. Zero fricção, nenhuma loja de app envolvida.
- **Depois (quando o jogo estiver estável):** **Capacitor** empacota esse mesmo build web dentro de um app Android real (gera um `.apk`/`.aab`), reaproveitando 100% do código — não é reescrever o jogo, é "colocar uma casca nativa" ao redor do mesmo PWA. É o caminho de menor risco para eventualmente chegar a uma Play Store, se você quiser.
- Instalar dependências (Node, Android SDK/Studio para gerar o APK) só será feito quando chegarmos nessa fase, e eu explico e peço confirmação antes de instalar qualquer coisa nova no ambiente.

## 7. Riscos técnicos identificados

1. **Fluxo "mobile-only" de autoria de mapas.** Editores de tilemap como o Tiled são apps de desktop. Mitigação: eu (Claude Code) escrevo/edito os tilemaps diretamente como JSON de dados — você descreve o mapa em linguagem natural ("aqui uma taverna, ali um poço") e eu traduzo para o grid; não dependemos de você abrir um editor gráfico no celular.
2. **Custo/operação do backend de IA.** Precisa de uma conta externa (Cloudflare ou similar) e de uma chave de API válida seguindo o seu limite de uso. Mitigação: fallback offline sempre disponível; te aviso do custo estimado antes de configurar.
3. **Determinismo vs. diversão.** Fórmulas de combate precisam de ajuste por playtest real — nenhuma calibragem da v1 foi validada. Mitigação: manter todos os números em arquivos de dados (`src/data/*`) fáceis de tunar sem mexer em lógica.
4. **Performance mobile.** Phaser/WebGL roda bem em celulares médios, mas tilemaps grandes + muitas partículas podem pesar. Mitigação: manter a vertical slice pequena (Varreth), medir performance cedo, não crescer o mundo antes de confirmar que roda bem.
5. **Escopo das 8 classes.** Dar identidade mecânica real e uma tela de seleção visualmente única para 8 classes é bastante conteúdo. Mitigação: todas as 8 recebem dados completos (stats/habilidades/hooks) desde já, mas o polimento visual de tela de seleção pode ser sequenciado — plenamente detalhada primeiro para a classe que você for jogar na vertical slice, e com tratamento visual mais simples (porém coerente, nunca genérico) para as demais no primeiro momento, aprofundando depois.
6. **Migração de save entre versões.** Como o schema vai evoluir bastante nas primeiras fases, o versionamento (seção 4) precisa existir desde o primeiro commit funcional, não ser adicionado depois.
