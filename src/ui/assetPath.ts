/**
 * Resolução única de caminho de asset estático (Fase 0 §Crítico-1,
 * `docs/production/REPO_AUDIT.md`). `vite.config.ts` usa `base: './'` porque
 * o deploy real vive num subcaminho do GitHub Pages
 * (`https://doraemogx.github.io/Ethurel/`), não na raiz do domínio. Isso já
 * funciona corretamente para tudo que passa pelo pipeline de import do Vite
 * (JS/CSS bundlados) — mas um caminho escrito à mão como string literal
 * começando com `/` (`/assets/img/x.webp`) é absoluto à RAIZ DO DOMÍNIO, não
 * ao subcaminho do app, e quebra em produção mesmo funcionando perfeitamente
 * em `localhost` (onde a raiz do domínio E a raiz do app são a mesma coisa).
 *
 * Toda referência a um arquivo de `public/assets/` no código React/TS deve
 * passar por `assetUrl()` — nunca escrever `/assets/...` à mão. Um teste
 * (`assetPath.test.ts`) varre `src/` e falha se essa regra for violada de
 * novo.
 *
 * `import.meta.env.BASE_URL` é o mecanismo nativo do Vite para isto — já
 * reflete o `base` configurado (aqui, `'./'`), e como o app é uma SPA de
 * tela única sem rotas aninhadas (`App.tsx` só troca estado, a URL do
 * documento nunca muda de profundidade), um caminho relativo ao documento
 * resolve certo em qualquer profundidade de deploy: raiz, subcaminho de
 * projeto do GitHub Pages, ou preview local.
 */
export function assetUrl(path: string): string {
  const base = import.meta.env.BASE_URL || './';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  const cleanPath = path.replace(/^\/+/, '');
  return `${cleanBase}${cleanPath}`;
}

/** Prefixo para tudo dentro de `public/assets/img/` — mesmo padrão usado em
 * `visualRegistry.ts`/`locationArt.ts`/`ItemIcon.tsx`: `${IMG}/subpasta/arquivo.webp`. */
export const IMG = assetUrl('assets/img');
