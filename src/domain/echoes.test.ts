import { describe, it, expect } from 'vitest';
import { instantiateEcho, ECHO_FIRST_ANOMALY } from '@/domain/echoes';

describe('Ecos', () => {
  it('instantiateEcho aplica o estado pedido e marca discoveredAt', () => {
    const before = Date.now();
    const echo = instantiateEcho(ECHO_FIRST_ANOMALY, 'awakening');
    expect(echo.id).toBe(ECHO_FIRST_ANOMALY.id);
    expect(echo.state).toBe('awakening');
    expect(echo.discoveredAt).toBeGreaterThanOrEqual(before);
  });

  it('estado padrão é latent quando não especificado', () => {
    const echo = instantiateEcho(ECHO_FIRST_ANOMALY);
    expect(echo.state).toBe('latent');
  });

  it('nunca é tratado como conquista: não tem campo de "unlocked"/pontuação', () => {
    const echo = instantiateEcho(ECHO_FIRST_ANOMALY);
    expect(echo).not.toHaveProperty('unlocked');
    expect(echo).not.toHaveProperty('score');
  });
});
