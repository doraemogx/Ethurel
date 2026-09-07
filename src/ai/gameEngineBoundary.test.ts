import { describe, it, expect } from 'vitest';

/**
 * Fronteira GameEngine ↔ NarrativeEngine (Fase 2 §7, ver
 * docs/canon/architecture/07-fronteira-gameengine-ia.md) — prova
 * estrutural, não só documental: nenhum arquivo do motor de regras
 * (`src/domain/`) ou do combate (`src/combat/`) pode sequer referenciar um
 * tipo/valor de IA. Se algum código futuro tentar acoplar a IA ao motor
 * (ex.: aceitar um `suggestedDc` como resultado final, ou deixar
 * `InterpretedAction` decidir dano), este teste quebra antes de virar bug em
 * produção.
 */
const FORBIDDEN_TOKENS = ['narrativeEngine', 'NarrativeProvider', 'InterpretedAction', 'NarrativeResponse', 'NarrativeRequest'];

describe('GameEngine boundary — src/domain e src/combat nunca referenciam tipos de IA', () => {
  const domainFiles = import.meta.glob('/src/domain/**/*.{ts,tsx}', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
  const combatFiles = import.meta.glob('/src/combat/**/*.{ts,tsx}', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
  const allFiles = { ...domainFiles, ...combatFiles };

  it('varre todo src/domain/ e src/combat/ e não encontra nenhum token proibido', () => {
    const offenders: string[] = [];
    for (const [path, content] of Object.entries(allFiles)) {
      if (path.includes('.test.')) continue;
      for (const token of FORBIDDEN_TOKENS) {
        if (content.includes(token)) {
          offenders.push(`${path}: "${token}"`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it('sanidade: o teste realmente varreu arquivos (não está verde por não ter achado nada)', () => {
    expect(Object.keys(domainFiles).length).toBeGreaterThan(5);
    expect(Object.keys(combatFiles).length).toBeGreaterThan(0);
  });

  it('sanidade: o padrão proibido É detectado quando presente (prova que a checagem funciona)', () => {
    expect(FORBIDDEN_TOKENS.some((t) => 'import { narrativeEngine } from "@/narrative/NarrativeEngine"'.includes(t))).toBe(true);
  });
});
