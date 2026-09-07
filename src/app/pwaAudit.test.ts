import { describe, it, expect } from 'vitest';

/**
 * PWA/update safety (Fase 2 §12, ver docs/architecture/pwa-update-safety.md)
 * — regressão estrutural: confirma que não há service worker registrado
 * silenciosamente em algum lugar do app. Se um SW for adicionado no futuro,
 * este teste vai falhar e forçar quem o adicionar a atualizar a
 * documentação/seguir a regra de versionamento de cache descrita no
 * documento acima, em vez de o registro passar despercebido.
 */
describe('PWA — nenhum service worker registrado (estado atual documentado)', () => {
  it('nenhum arquivo em src/ chama navigator.serviceWorker.register', () => {
    const files = import.meta.glob('/src/**/*.{ts,tsx}', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
    const offenders = Object.entries(files)
      .filter(([path]) => !path.endsWith('pwaAudit.test.ts'))
      .filter(([, content]) => content.includes('serviceWorker.register'))
      .map(([path]) => path);
    expect(offenders).toEqual([]);
  });
});
