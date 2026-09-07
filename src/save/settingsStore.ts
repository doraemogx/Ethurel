import { saveStore } from '@/save/SaveStore';
import { defaultSettings, type GameSettings } from '@/save/schema';

/** Configurações são globais (não por slot/campanha) — som, velocidade de
 * texto e redução de movimento são preferência da pessoa, não do save. */
const SETTINGS_KEY = 'settings';

export function loadSettings(): GameSettings {
  // Mescla com defaults (não substitui) — configurações salvas antes da
  // Phase 3 não têm `masterVolume`/`ambienceOn` ainda; sem isto, esses campos
  // ficariam `undefined` e quebrariam o AudioDirector silenciosamente.
  return { ...defaultSettings(), ...(saveStore.load<Partial<GameSettings>>(SETTINGS_KEY) ?? {}) };
}

export function saveSettings(settings: GameSettings): void {
  saveStore.save(SETTINGS_KEY, settings);
}
