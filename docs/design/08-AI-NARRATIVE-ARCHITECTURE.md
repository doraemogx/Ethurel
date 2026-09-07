# 08 — Arquitetura de Narrativa com IA

## Princípio inegociável

> IA é o narrador. IA não é o motor do jogo.

O código sempre resolve o resultado mecânico (dano, HP, XP, dinheiro, loot,
atributos, sucesso/falha de teste, Tensão, Marca, Reputação numérica, Índole
numérica, progressão, conclusão de quest, condição de combate). A IA recebe
esse resultado já decidido e só o dramatiza. Nenhuma implementação de
`NarrativeProvider` tem, ou deveria ter, autoridade sobre esses valores —
isso é reforçado no próprio comentário de topo de
`src/ai/NarrativeProvider.ts`.

## Segurança de API — regra permanente

Nenhuma chave de API de provedor de IA (Anthropic/OpenAI/qualquer outro) é
colocada no JavaScript publicado no cliente. Nunca em: repositório, bundle,
`localStorage`, GitHub Pages, query string. `RemoteNarrativeProvider`
(`src/ai/RemoteNarrativeProvider.ts`) só fala com um proxy próprio via
`VITE_NARRATIVE_PROXY_URL` — nunca chama a API de um provedor diretamente do
navegador. Construir/hospedar esse backend está fora do escopo desta sessão
(sem infraestrutura de servidor disponível neste ambiente); o que existe é o
contrato e o cliente, prontos para apontar a um proxy real quando ele
existir. Sem a env var configurada, `isAvailable` é `false` e o jogo roda
100% com `LocalNarrativeProvider` — determinístico, sem rede, sem nenhuma IA
configurada, e ainda assim completamente jogável.

## Peças

- **`NarrativeProvider`** (`src/ai/NarrativeProvider.ts`) — contrato:
  `NarrativeRequest` (cena/diálogo/flavor de evento/interpretação de ação
  livre) → `NarrativeResponse` (`narration`, `dialogue?`, `suggestedActions[]`,
  `mood`, `requestedChecks[]`). Também expõe `interpretFreeText`.
- **`LocalNarrativeProvider`** — sempre disponível. Não é um fallback pobre:
  diálogo e quest essenciais do primeiro capítulo são escritos à mão em
  `src/content/`, não gerados. Este provider cobre só o que é opcional por
  natureza — inferência de `mood` e interpretação simples por palavra-chave
  de "Outra ação...".
- **`RemoteNarrativeProvider`** — stub documentado, nunca ativo por padrão.
- **`NarrativeEngine`** (`src/narrative/NarrativeEngine.ts`) — ponto único de
  acesso; tenta o remoto se configurado, cai para o local em qualquer falha,
  silenciosamente (nunca trava o jogo, nunca mostra erro técnico —
  `connectionState` alimenta um futuro indicador "Conectado"/"Narrativa
  offline").
- **`NarrativeContextBuilder`** (`src/narrative/NarrativeContextBuilder.ts`) —
  nunca envia o save inteiro à IA. Só cena atual, personagem resumido
  (nome/classe/origem), NPC atual, eventos recentes relevantes ao local via
  `WorldEventLog.relevantTo()`, e o resultado mecânico já decidido.
- **`responseSchema.ts`** — validação manual (sem dependência extra) do
  contrato de resposta; resposta fora do formato nunca chega à UI, cai no
  fallback local.

## Ação livre ("Outra ação...")

Pipeline: input do jogador → sanitização (limite de tamanho, ver
`responseSchema`/`interpretFreeText`) → `NarrativeProvider.interpretFreeText`
→ classificação (`possible` / `impossible` / `requires_check` /
`requires_item` / `requires_condition` / `partial`) → se `requires_check`, o
próprio `GameEngine` (a tela, não o provider) decide o atributo e monta o
teste real via `checkD20`. A IA/provider só SUGERE; quem decide se a ação é
de fato possível e qual DC usar é sempre o código da tela
(`SceneScreen.submitFreeAction`), nunca o provider.
