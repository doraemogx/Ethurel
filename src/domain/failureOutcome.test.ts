import { describe, it, expect } from 'vitest';
import { COMBAT_DEFEAT_OUTCOME } from '@/domain/failureOutcome';

describe('FailureOutcome', () => {
  it('derrota em combate nunca é silenciosa: tem texto narrativo e uma flag rastreável', () => {
    expect(COMBAT_DEFEAT_OUTCOME.narrativeText.length).toBeGreaterThan(20);
    expect(COMBAT_DEFEAT_OUTCOME.flag).toBeTruthy();
  });

  it('hpFactor mantém o personagem vivo mas enfraquecido (não é ressurreição total nem morte)', () => {
    expect(COMBAT_DEFEAT_OUTCOME.hpFactor).toBeGreaterThan(0);
    expect(COMBAT_DEFEAT_OUTCOME.hpFactor).toBeLessThan(1);
  });
});
