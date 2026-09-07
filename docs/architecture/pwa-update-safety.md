# PWA / update safety — auditoria (Fase 2 §12)

> Resultado da auditoria: **não há service worker no jogo hoje** — só um
> `public/manifest.webmanifest` estático (torna o jogo instalável/
> "Adicionar à tela inicial", `display: "standalone"`), sem nenhuma camada
> de cache de app. Confirmado por: `package.json` sem `vite-plugin-pwa`/
> `workbox` nas dependências; `vite.config.ts` sem plugin de PWA; nenhuma
> chamada a `navigator.serviceWorker.register` em `index.html` ou
> `src/main.tsx` (únicos pontos de entrada do app). Por isso, o risco
> específico descrito nesta seção do prompt ("atualização do PWA destrói
> campanhas silenciosamente") **não existe ainda** neste código — não há
> cache de app para invalidar de forma destrutiva. Documentado aqui para
> não ficar assumido implicitamente, e para deixar a regra clara para
> quando um service worker for de fato adicionado (fora do escopo desta
> rodada — "ainda NÃO faça redesign geral"/não é fundação, é feature nova).

## As 3 camadas já corretamente separadas

| Camada | Onde vive | Mecanismo |
|---|---|---|
| **App cache** | Não existe | Sem service worker — cada carregamento busca `index.html`/JS/CSS via HTTP normal (cache do navegador, não Cache API). |
| **Assets** | `public/assets/`, servidos como arquivos estáticos | Mesma via HTTP normal — `assetUrl()`/`IMG` (Fase 0 §Crítico-1) resolve o caminho certo sob `/Ethurel/`, sem relação com cache de app. |
| **Save data** | `window.localStorage`, chaves prefixadas `ethurel::` (`src/save/SaveStore.ts`) | Armazenamento de origem, completamente independente de HTTP cache/Cache API — uma atualização de JS/CSS nunca toca nele. |

Como as 3 já vivem em sistemas de armazenamento fisicamente distintos
(HTTP cache do navegador / arquivos estáticos / `localStorage`), não há
hoje nenhum código que possa "misturar" as camadas e apagar save ao
atualizar o app — o cenário descrito no prompt pressupõe um service worker
com uma estratégia de cache mal feita, que este projeto não tem.

## Regra para quando um service worker for adicionado (não implementado agora)

Registrada aqui para não ser esquecida/reinventada errado no futuro:

1. **Nomear o cache por versão** (ex.: `ethurel-assets-v${BUILD_ID}`) — nunca
   um nome fixo que se sobrescreve silenciosamente.
2. **No `activate`, limpar só caches com o prefixo do app que NÃO batem com
   a versão atual** (whitelist explícita) — nunca `caches.keys().then(all
   => all.forEach(caches.delete))` ampla, que apagaria qualquer coisa,
   incluindo caches de terceiros que não deveriam ser tocados.
3. **NUNCA** o service worker deve chamar `localStorage.clear()`,
   `indexedDB.deleteDatabase`, ou qualquer operação de storage de origem —
   sua responsabilidade é só Cache API (requisições de rede), nunca dados
   do jogador.
4. **Atualização por prompt, não por reload silencioso**: se o SW detectar
   uma versão nova, mostrar "Nova versão disponível — atualizar agora?" em
   vez de `skipWaiting()` + `clients.claim()` automático — evita trocar o
   app debaixo do jogador no meio de uma cena sem aviso.
5. Testar explicitamente (Playwright ou similar) que um ciclo completo de
   "instala SW v1 → grava save → atualiza para SW v2 → recarrega" preserva
   o save — esse é o teste que provaria a garantia pedida nesta seção, e
   só faz sentido depois que existir um SW real para testar.

## O que isso significa para o jogador hoje

Instalar o "app" (Adicionar à tela inicial) é só um atalho com ícone/tela
cheia — não há comportamento de cache/offline diferente de abrir a URL no
navegador. Atualizações do jogo (novo deploy) aparecem no próximo
carregamento normal da página, e o save em `localStorage` nunca é afetado
por isso, hoje.
