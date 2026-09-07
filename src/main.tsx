import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/ui/theme.css';
import { App } from '@/app/App';
import { loadSettings } from '@/save/settingsStore';
import { audioManager } from '@/audio/AudioManager';

const settings = loadSettings();
document.documentElement.classList.toggle('reduce-motion', settings.reduceMotion);
audioManager.setMusicOn(settings.musicOn);
audioManager.setSfxOn(settings.sfxOn);
window.addEventListener('pointerdown', () => audioManager.unlock(), { once: true });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
