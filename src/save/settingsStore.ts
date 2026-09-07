import { saveStore } from '@/save/SaveStore';
import { defaultSettings, type GameSettings } from '@/save/schema';

/** Configurações são globais (não por slot/campanha) — som, velocidade de
 * texto e redução de movimento são preferência da pessoa, não do save. */
const SETTINGS_KEY = 'settings';

export function loadSettings(): GameSettings {
  return saveStore.load<GameSettings>(SETTINGS_KEY) ?? defaultSettings();
}

export function saveSettings(settings: GameSettings): void {
  saveStore.save(SETTINGS_KEY, settings);
}
