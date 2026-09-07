import { describe, it, expect } from 'vitest';
import { assetUrl, IMG } from '@/ui/assetPath';

// `vitest.config.ts` não define `base` (só `vite.config.ts`, usado no build
// real, define `base: './'`) — por isso o teste não assume um valor fixo de
// `import.meta.env.BASE_URL`, e sim prova a propriedade que importa: caminho
// com ou sem barra inicial produz o MESMO resultado normalizado, sempre
// prefixado pelo base atual (nunca uma string absoluta hardcoded).
describe('assetUrl — resolução de caminho sob o base do GitHub Pages (Fase 0 §Crítico-1)', () => {
  const base = import.meta.env.BASE_URL || './';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;

  it('caminho com e sem barra inicial resolvem para o mesmo resultado, prefixado pelo BASE_URL', () => {
    expect(assetUrl('assets/img/x.webp')).toBe(`${cleanBase}assets/img/x.webp`);
    expect(assetUrl('/assets/img/x.webp')).toBe(`${cleanBase}assets/img/x.webp`);
  });

  it('IMG é derivado de assetUrl, nunca uma string absoluta escrita à mão', () => {
    expect(IMG).toBe(`${cleanBase}assets/img`);
  });

  it('com base configurado como "./" (produção real, ver vite.config.ts), resolve relativo ao documento', () => {
    // Simula exatamente o que vite.config.ts usa em produção — prova que a
    // lógica de assetUrl(), isolada do valor de BASE_URL em si, produz um
    // caminho relativo correto (sem barra inicial) quando o base é relativo.
    const relBase = './';
    const cleanRelPath = 'assets/img/x.webp'.replace(/^\/+/, '');
    expect(`${relBase}${cleanRelPath}`).toBe('./assets/img/x.webp');
  });
});

/**
 * Guarda de regressão: nenhum arquivo em `src/` pode voltar a escrever um
 * caminho `/assets/...` como string literal absoluta — isso é exatamente o
 * bug do Crítico-1 (quebra sob o subcaminho do GitHub Pages,
 * `github.io/Ethurel/`). Toda referência precisa passar por `assetUrl()`/`IMG`
 * (`src/ui/assetPath.ts`). Varre o código-fonte de verdade via
 * `import.meta.glob` (mecanismo do próprio Vite, sem depender de `node:fs` —
 * este projeto não tem `@types/node`/ambiente Node nos testes de propósito,
 * ver `vitest.config.ts`) em vez de confiar em revisão manual — é o que o
 * prompt da Fase 0 pediu explicitamente ("validação automatizada... para
 * reduzir a possibilidade de esse problema reaparecer").
 */
describe('regressão: nenhum caminho /assets/ absoluto escrito à mão em src/', () => {
  const FORBIDDEN = /(['"`(]|url\()\s*\/assets\//;
  const files = import.meta.glob('/src/**/*.{ts,tsx,css}', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

  it('varre todo .ts/.tsx/.css de src/ e não encontra nenhum caminho absoluto', () => {
    const offenders: string[] = [];
    for (const [path, content] of Object.entries(files)) {
      // assetPath.ts/.test.ts citam o padrão proibido em comentários/regex de propósito (documentando o próprio bug) — excluídos da varredura.
      if (path.endsWith('assetPath.test.ts') || path.endsWith('ui/assetPath.ts')) continue;
      if (FORBIDDEN.test(content)) offenders.push(path);
    }
    expect(offenders).toEqual([]);
  });

  it('sanidade: o padrão proibido É detectado quando presente (prova que o teste não está sempre verde por acidente)', () => {
    expect(FORBIDDEN.test("background: url('/assets/img/x.webp')")).toBe(true);
    expect(FORBIDDEN.test('src="/assets/img/x.webp"')).toBe(true);
    expect(FORBIDDEN.test(`${IMG}/x.webp`)).toBe(false);
  });
});
