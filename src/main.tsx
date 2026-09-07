import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Cinzel (OFL-1.1, self-hospedada via @fontsource — sem dependência de CDN em
// runtime, mantendo o jogo funcional offline/PWA) — identidade tipográfica do
// logo ETHUREL e títulos de destaque (spec Phase 3 §5), nunca desenhada
// proceduralmente nem a fonte genérica de dashboard usada no resto da UI.
import '@fontsource/cinzel/600.css';
import '@fontsource/cinzel/700.css';
import '@/ui/theme.css';
import { App } from '@/app/App';
import { loadSettings } from '@/save/settingsStore';
import { audioManager } from '@/audio/AudioManager';

const settings = loadSettings();
document.documentElement.classList.toggle('reduce-motion', settings.reduceMotion);
audioManager.setMasterVolume(settings.masterVolume);
audioManager.setMusicOn(settings.musicOn);
audioManager.setAmbienceOn(settings.ambienceOn);
audioManager.setSfxOn(settings.sfxOn);
window.addEventListener('pointerdown', () => audioManager.unlock(), { once: true });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
