/**
 * AudioManager — HTML5 Audio puro (sem Phaser Sound). Categorias: music,
 * ambient, sfx, ui (spec §46). Nunca toca duas músicas ao mesmo tempo;
 * crossfade simples ao trocar. Requer gesto do usuário para desbloquear
 * (mobile) — `unlock()` é chamado no primeiro toque da UI.
 */
type Category = 'music' | 'ambient' | 'sfx' | 'ui';

const FADE_STEPS = 8;
const FADE_MS = 300;

class AudioManagerImpl {
  private unlocked = false;
  private musicOn = true;
  private sfxOn = true;
  private currentMusic: HTMLAudioElement | null = null;
  private currentMusicKey: string | null = null;
  private cache = new Map<string, HTMLAudioElement>();

  setMusicOn(on: boolean): void {
    this.musicOn = on;
    if (!on) this.stopMusic();
  }

  setSfxOn(on: boolean): void {
    this.sfxOn = on;
  }

  unlock(): void {
    if (this.unlocked) return;
    this.unlocked = true;
  }

  private getAudio(url: string): HTMLAudioElement {
    let audio = this.cache.get(url);
    if (!audio) {
      audio = new Audio(url);
      this.cache.set(url, audio);
    }
    return audio;
  }

  playMusic(url: string, loop = true): void {
    if (this.currentMusicKey === url) return;
    if (!this.musicOn) {
      this.currentMusicKey = url;
      return;
    }
    const outgoing = this.currentMusic;
    if (outgoing) this.fade(outgoing, outgoing.volume, 0, () => outgoing.pause());

    const audio = this.getAudio(url);
    audio.loop = loop;
    audio.volume = 0;
    audio.currentTime = 0;
    void audio.play().catch(() => {
      /* autoplay bloqueado antes do gesto — silencioso, spec §63 */
    });
    this.fade(audio, 0, 0.55);
    this.currentMusic = audio;
    this.currentMusicKey = url;
  }

  stopMusic(): void {
    if (this.currentMusic) {
      const audio = this.currentMusic;
      this.fade(audio, audio.volume, 0, () => audio.pause());
    }
    this.currentMusic = null;
    this.currentMusicKey = null;
  }

  playSfx(url: string, _category: Category = 'sfx'): void {
    if (!this.sfxOn) return;
    const audio = this.getAudio(url).cloneNode(true) as HTMLAudioElement;
    audio.volume = 0.7;
    void audio.play().catch(() => {});
  }

  private fade(audio: HTMLAudioElement, from: number, to: number, onDone?: () => void): void {
    let step = 0;
    const tick = () => {
      step += 1;
      audio.volume = Math.max(0, Math.min(1, from + ((to - from) * step) / FADE_STEPS));
      if (step < FADE_STEPS) setTimeout(tick, FADE_MS / FADE_STEPS);
      else onDone?.();
    };
    tick();
  }
}

export const audioManager = new AudioManagerImpl();
