# 11 — Legacy Recovery

> Auditoria obrigatória (Fase 2 §3) do Ethurel anterior — o Artifact HTML
> único, narrado por IA em tempo real, que precede toda a reconstrução em
> Claude Code. Fonte: `ETUREL_PROJECT_HANDOFF.md` (838 linhas), anexado pelo
> usuário nos arquivos desta sessão — **não é um arquivo do repositório**
> (não está e nunca esteve versionado em `docs/`), por isso não apareceu em
> buscas anteriores por "handoff" dentro do próprio git. `ETUREL_CURRENT_SOURCE.html`
> (o HTML de 1718 linhas em si) **não foi anexado** — só o documento de
> handoff. Tudo abaixo vem do handoff; nada foi inventado a partir de memória.

## RECUPERADO

Conteúdo que existia no Ethurel antigo, desapareceu na primeira
reconstrução (Fase 1 desta sessão) e volta agora:

- **Princípio / Desejo / Medo / Limite** — 4 passos da criação de
  personagem com listas fixas de texto (6 princípios, 9 desejos, 6 medos, 6
  limites), citadas literalmente no handoff (Parte 22). Reintroduzidos em
  `src/data/characterCreationOptions.ts` com o texto exato do handoff, como
  passos da criação (`CharacterCreationScreen`). Isso responde diretamente
  à queixa "criação de personagem simplificada demais".
- **Seed de Índole por Princípio/Desejo** — o handoff confirma que a
  escolha de Princípio e Desejo já somava valores iniciais a certos traços
  de Índole (tabelas `PRINCIPLE_SEED`/`DESIRE_SEED`, deltas "entre 4 e 16"),
  mas **não lista os deltas exatos por opção** — não foram anexados. Os
  deltas usados agora em `characterCreationOptions.ts` são **[PROPOSTA]**,
  seguindo o padrão descrito (mesma faixa 4-16, mesma lógica de mapear cada
  frase ao traço mais óbvio), não uma reprodução literal do código original.
- **Sigilos por classe, cor reage à zona Arcana** — o handoff descreve
  `SIGIL_SHAPE`: um sigilo SVG único por classe, puramente decorativo, cuja
  cor muda com a zona Arcana atual (verde/âmbar/vermelho no sistema antigo).
  Esse é exatamente o conceito por trás de `ArcaneIdentity` implementado
  agora (`src/arcane/identity.ts`) — símbolo próprio por classe, cor de
  ressonância que reage a Controle/Saturação/Ruptura. A paleta de cor muda
  (a antiga usava verde/âmbar/vermelho tradicional; a atual usa a paleta
  mística já estabelecida — violeta suave/dourado/vermelho profundo), mas o
  princípio é o mesmo.
- **Sistema de tags nas escolhas, com cor por categoria** — o handoff
  documenta categorias exatas: `Percepção`, `Classe: X`, `Origem: X`,
  `Arcane — Saturação/Ruptura`, `Reputação: X`, `Conhecimento`, tags morais,
  e atributos crus (`Vigor`, `Reflexo`, `Mente`, `Presença`) como categoria
  própria de ação. Isso é literalmente o que a Fase 2 pede em "AÇÕES
  CONTEXTUAIS"/"ORIGIN / CLASS / ATTRIBUTE TAGS" — reimplementado com os
  símbolos ✦ (classe) / ◈ (atributo) / ◇ (origem) que a própria Fase 2 já
  usa como exemplo, sobre a categorização recuperada do handoff.
- **Feedback de combate: shake + número de dano flutuante + flash** —
  descrito na Parte 9 do handoff como já implementado no Artifact antigo.
  Recuperado e estendido em `CombatScreen` (wind-up → impacto → shake →
  número → reação), agora determinístico em vez de decidido pela IA.
- **Typewriter com pausa maior em pontuação** — `typeInto()` no Artifact
  antigo. Reimplementado em `src/ui/components/Typewriter.tsx`, mas agora
  configurável (Instantâneo/Rápido/Cinematográfico) e sempre
  toque-para-revelar — o antigo bloqueava até o texto terminar.
- **Fase Cena → Decisão separada** — o Artifact antigo só mostrava as
  escolhas depois do texto inteiro terminar de "digitar", para as opções
  nunca competirem visualmente com a leitura. Princípio recuperado na nova
  `SceneScreen`: ações contextuais só aparecem depois que o typewriter
  termina (ou é pulado).
- **Coordenadas do mapa (`MAP_NODES`, viewBox 300×190)** — varreth
  (150,130), borda-musgos (70,75), estrada-velha (225,150), fronteira
  (255,45), com as mesmas conexões (varreth↔borda-musgos,
  varreth↔estrada-velha, estrada-velha↔fronteira — **sem** ligação direta
  borda-musgos↔fronteira nem borda-musgos↔estrada-velha). Usadas literalmente
  no novo `MapScreen` em SVG.
- **Limiares narrativos de Marca Arcana (25/50/75)** — "25+ percepções
  sutis, 50+ claras, 75+ intensas e perturbadoras" (instrução ao narrador no
  handoff, nunca imposta em código). Usado agora como os 3 níveis de
  descrição subjetiva de Marca na ficha do personagem (`CharacterScreen`).
- **Confiança por NPC (`npcRel: {name: {trust}}`)** — existia no Artifact
  antigo, mas nunca era mostrado ao jogador diretamente (só resumido na
  ficha). Recuperado como `npcTrust` no save v5, agora exposto como um
  **rótulo narrativo** (Desconfiado/Neutro/Receptivo/Próximo), nunca o
  número cru — indo além do antigo, que também escondia o número mas não
  tinha nem o rótulo.

## MANTIDO

Cânone já preservado corretamente na primeira reconstrução, confirmado
contra o handoff sem necessidade de mudança:

- Arcane como força viva orgânica, nunca "mágica roxa"/elétrica; nunca
  totalmente explicável — confirmado idêntico ao handoff (Parte 3).
- Controle (0-59) / Saturação (60-89) / Ruptura (90-100) — faixas exatas
  batem com `arcaneZone()` do handoff.
- `HP = 16 + Vigor*4` e `Foco = 10 + Mente*4` (o handoff chama de
  `arcaneMax`) — confirmado idêntico.
- Índole: as mesmas 12 dimensões, os mesmos 7 rótulos possíveis (Cruel,
  Implacável, Benevolente, Honrado, Oportunista, Pragmático, Ambíguo), e a
  fórmula de `warmth`/`order`/`selfInterest` batem **exatamente** com o
  pseudocódigo do handoff (Parte 7) — nenhuma divergência encontrada.
- Reputação como sistema separado, por entidade dinâmica, -100..100.
- Os 8 nomes/conceitos de classe e as 5 origens — texto de tagline,
  conceito, força/fraqueza, afinidade Arcane e `tensionMult`/`markMult` no
  handoff (Parte 5) batem, número por número, com `src/data/classes.ts`
  já existente — nenhuma correção necessária.
- Filosofia narrativa: "mostrar, não explicar", NPCs por um traço
  marcante (não parágrafos), fail forward, ritmo variado.

## DESCARTADO

Explicitamente rejeitado no próprio handoff (Parte 20) ou pela Fase 2 desta
reconstrução — não deve retornar:

- Pronomes "Ele/Ela/Elu" — o handoff já registrava a rejeição para
  "Homem/Mulher"; a Fase 2 desta sessão pede uma nova mudança para
  "Masculino/Feminino/Outro". Seguida a instrução mais recente.
- Arquitetura single-HTML-file, estado global em variáveis soltas, `fetch`
  direto do cliente para a API da Anthropic com a chave exposta no
  navegador — job desta reconstrução inteira é o oposto disso.
- Balanceamento de combate/economia decidido ao vivo pela IA sem regra de
  código (handoff Parte 9/21: "a IA decide quanto HP cada inimigo perde";
  "nenhuma validação de schema") — já substituído por
  `TurnManager`/`ActionResolver` determinístico.
- `C.quests` substituído inteiramente a cada turno (bug latente descrito na
  Parte 21) — `save.quests` agora é um `Record<id, status>` que só o código
  atualiza, nunca uma IA.
- 4-5 estados de fog of war — o handoff já tinha simplificado para 2
  (conhecido/visitado); o novo mapa usa 3 (desconhecido/conhecido/visitado)
  como meio-termo deliberado, não os 4-5 originalmente cogitados.
- Campo de ação livre sempre visível na tela — o handoff já registra isso
  como rejeitado; mantido como ação sob demanda ("Fazer outra coisa…").

## MELHORADO

Onde a reconstrução vai além do que o Artifact antigo conseguia:

- **Determinismo real**: dano, HP, XP, loot, sucesso/falha de teste,
  conclusão de quest — tudo decidido por código (`combat/`, `domain/dice.ts`,
  `quest/QuestState.ts`), nunca por uma IA sem regra por trás. O handoff
  chama isso explicitamente de "a decisão de arquitetura mais importante
  para a próxima versão" (Parte 24) — feita.
- **Save confiável e versionado**: o handoff documenta um bug crítico de
  save não persistindo (Parte 16, causa raiz: `window.storage` só existe
  dentro do runtime de Artifacts). O novo save usa `localStorage` puro,
  testado, versionado (v1→v5), com 3 slots independentes.
- **Bestiário e NPCs com id e ficha real**: o handoff confirma "nenhum
  inimigo/NPC hardcoded — tudo inventado pela IA a cada sessão" (Partes 9 e
  12). Agora `ENEMIES`/`NPCS` são catálogos reais com id estável.
- **Segurança de API**: chave de provedor de IA nunca no cliente (handoff
  não tinha nenhuma proteção — a chamada saía direto do navegador).
