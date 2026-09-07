# Arquitetura — backend seguro para IA remota (Fase 2 §10)

> Auditoria + proposta. O que dava para implementar sem credencial real foi
> implementado (código do cliente e do proxy, ambos prontos, nenhum
> deployado). **Não criei nenhuma conta, chave ou credencial** — a seção
> final ("O que falta — e só você pode fazer") lista exatamente os passos.

## Auditoria do `RemoteNarrativeProvider` existente

O que já estava certo (nada mudou): nunca guarda chave de API nenhuma —
só uma URL de proxy (`VITE_NARRATIVE_PROXY_URL`); `isAvailable` é `false`
sem essa URL, e `NarrativeEngine` cai para `LocalNarrativeProvider` em
qualquer falha, sem travar o jogo nem mostrar erro técnico (spec §63).

3 lacunas reais encontradas e corrigidas nesta rodada:

1. **Sem timeout** — um `fetch` que nunca resolve travaria a UI
   indefinidamente (o composer já trata o estado `interpreting`, mas nada
   cortava a chamada). Corrigido: `AbortController` com 12s.
2. **Sem retry** — qualquer falha transitória (rede instável, 502 momentâneo)
   ia direto pro fallback local, mesmo quando um segundo pedido teria
   funcionado. Corrigido: 1 retry com backoff, só para timeout/rede/5xx —
   nunca para 4xx (payload inválido não vira válido tentando de novo).
3. **`interpretFreeText` não validava a resposta** — fazia
   `as InterpretedAction` sem checar nada; um proxy respondendo qualquer
   JSON malformado passaria direto para a UI. Corrigido:
   `validateInterpretedAction` (`src/ai/responseSchema.ts`), mesma
   filosofia de `validateNarrativeResponse` (já existia para o outro
   método) — fora do contrato, `null`, quem chama cai no fallback.

## 1. Fluxo

```
Cliente (RemoteNarrativeProvider)
  → HTTPS POST para o proxy (Cloudflare Worker)
    → Worker valida origem + rate limit
    → Worker monta prompt (system fixo + contexto canônico já filtrado
      pelo Canon Retrieval, spec §1 — nunca a Bíblia inteira)
    → Worker chama a API da Anthropic com a chave (Worker Secret)
      forçando saída estruturada via tool use
    → Worker devolve o JSON já no formato NarrativeResponse/InterpretedAction
  ← Cliente valida de novo (responseSchema.ts) antes de usar
  ← GameEngine resolve qualquer implicação mecânica (nunca aceita
    valor final vindo da IA — ver docs/canon/architecture/07-fronteira-gameengine-ia.md)
```

## 2. Endpoint

Um único endpoint POST (`https://ethurel-narrative-proxy.<subdomínio>.workers.dev/`),
corpo `{ type: 'narration', request } | { type: 'interpret', text, context }` —
já é exatamente o que `RemoteNarrativeProvider` envia hoje. `OPTIONS`
respondido para CORS preflight.

## 3. Autenticação / abuso

O jogo não tem contas de usuário — não há "usuário autenticado" para
autenticar contra o proxy. Defesas aplicadas (código em
`server/narrative-proxy/worker.ts`):

- **CORS restrito à origem exata do jogo** (`ALLOWED_ORIGIN`,
  `https://doraemogx.github.io`) — o Worker rejeita qualquer request cujo
  header `Origin` não seja esse, antes de gastar uma chamada à Anthropic.
- **Rate limit por IP** (20 req/min, Workers KV com TTL de 90s) — barato,
  suficiente para uso normal de um jogador, baixo o bastante para limitar o
  custo de abuso automatizado.
- **Limite de tamanho de texto** (500 caracteres) — rejeita payloads
  inflados antes de chamar a API paga.
- Não é à prova de abuso sofisticado (alguém pode falsificar `Origin` fora
  de um browser) — para esse nível, a defesa adicional seria um captcha
  (Cloudflare Turnstile) na primeira interação da sessão; não implementado
  agora por ser desproporcional ao risco de um protótipo de RPG solo.

## 4. Segredo

`ANTHROPIC_API_KEY` como **Worker Secret**
(`wrangler secret put ANTHROPIC_API_KEY`) — nunca no código, nunca no
`wrangler.toml`, nunca no repositório. Só existe no ambiente de execução do
Worker, injetada em `env.ANTHROPIC_API_KEY`. Nunca logada.

## 5. Payload

Cliente → proxy (já implementado, sem mudança de contrato):

```ts
{ type: 'narration', request: NarrativeRequest }
{ type: 'interpret', text: string, context: NarrativeContext }
```

`NarrativeContext.canonSummary` (Fase 2 §1) já garante que o `context`
enviado é um recorte pequeno, nunca o save inteiro nem a Bíblia.

## 6. Resposta estruturada

O Worker usa **tool use forçado** da API da Anthropic (`tool_choice: {type:
'tool', name: ...}`) em vez de pedir prosa e fazer parsing — a Anthropic
garante que o retorno bate com o schema do tool (`NARRATION_TOOL`/
`INTERPRET_TOOL` em `worker.ts`, espelhando `NarrativeResponse`/
`InterpretedAction`). Isso reduz drasticamente a chance de resposta
malformada chegar ao cliente — mas o cliente valida de novo mesmo assim
(`responseSchema.ts`), porque nunca se confia cegamente numa camada só.

## 7. Timeout

Cliente: 12s (`AbortController`, `src/ai/RemoteNarrativeProvider.ts`). Se
estourar, conta como falha retentável (1 tentativa extra) e depois cai no
fallback local.

## 8. Retry

1 retry, com backoff (500ms → 1s), só para timeout/erro de rede/5xx. 4xx
(payload inválido, origem não permitida, rate limit) nunca é retentado —
testado explicitamente (`RemoteNarrativeProvider.test.ts`).

## 9. Fallback

Já existia e continua correto: `NarrativeEngine.requestNarration`/
`interpretFreeText` tentam o remoto se `isAvailable`, capturam qualquer
exceção (rede, timeout, validação, retry esgotado) e caem silenciosamente
para `LocalNarrativeProvider` — o jogo nunca trava, nunca mostra um erro
técnico ao jogador (spec §63). A UI mostra "narrativa local"/"narrativa
conectada" (`SceneScreen.tsx`, `narrativeEngine.connectionState`) — nunca
finge que o modo local é IA remota operacional.

## 10. Custo

- Modelo: uma classe rápida/barata (Haiku), suficiente para classificação/
  interpretação estruturada — não é geração de prosa longa.
- `max_tokens: 500` — a resposta é um JSON estruturado curto, não narrativa
  extensa; limite de custo por chamada.
- Rate limit (item 3) limita o custo máximo por IP por minuto.
- Sem esses dois limites, um script abusivo poderia gerar custo
  proporcional ao tráfego — com eles, o pior caso por IP é limitado e
  previsível.

## 11. Contexto enviado

Exatamente o que `NarrativeContextBuilder.buildNarrativeContext` monta
(Fase 2 §1): cena atual, personagem resumido, NPC presente, até 6 eventos
recentes relevantes ao local, e `canonSummary` (recorte do Canon Retrieval
+ Knowledge Model, nunca a Bíblia/registro inteiros). Nunca o save
completo, nunca histórico de outras campanhas.

## 12. Validação pelo GameEngine

Cobrto em `docs/canon/architecture/07-fronteira-gameengine-ia.md` — a
resposta da IA (local ou remota) só alimenta narração/mood/ações
sugeridas/checks sugeridos; nenhum valor mecânico final é aceito sem passar
pelo GameEngine determinístico (`resolveNarrativeAction`, `checkD20`,
`resolveWorldEvent`, etc). Isso vale igual para o provider local e para o
remoto — a fronteira está no contrato de tipos (`InterpretedAction`,
`NarrativeResponse`), não em cada provider individualmente.

---

## O que falta — e só você pode fazer

Eu não tenho, e não deveria ter, nem posso criar por conta própria:

1. **Uma conta Cloudflare** (gratuita cobre esse uso) para deployar o
   Worker.
2. **Uma API key da Anthropic** (console.anthropic.com) — a que autentica
   as chamadas de `worker.ts` à API da Anthropic. Custo por uso, ver
   preços da Anthropic no momento em que for ativar.
3. Rodar localmente (com `wrangler` instalado, `npm i -g wrangler` ou via
   `npx`):
   - `wrangler kv:namespace create RATE_LIMIT_KV` → copiar o `id` para
     `wrangler.toml` (copiar de `wrangler.toml.example`).
   - `wrangler secret put ANTHROPIC_API_KEY` → cola a chave quando pedido
     (nunca vai para um arquivo).
   - `wrangler deploy` (dentro de `server/narrative-proxy/`).
4. Depois do deploy, o Worker terá uma URL (`https://ethurel-narrative-proxy.<subdomínio>.workers.dev`).
   Configurar essa URL como `VITE_NARRATIVE_PROXY_URL` no ambiente de build
   do GitHub Pages (GitHub Actions secret/variable,
   `.github/workflows/deploy-pages.yml` precisaria passar essa env var para
   o `npm run build`).

Sem isso, `RemoteNarrativeProvider.isAvailable` continua `false` e o jogo
roda 100% em `LocalNarrativeProvider` — que é o comportamento correto e
honesto até a decisão acima ser tomada.
