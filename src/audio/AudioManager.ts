/**
 * AudioDirector (Phase 3 §16, evolução do AudioManager da Fase 1) — HTML5
 * Audio puro (sem lib), 4 canais (music/ambience/sfx/ui) + volume mestre +
 * mute, tudo persistido via `settingsStore`. Nunca toca duas músicas ao
 * mesmo tempo; crossfade simples ao trocar. Requer gesto do usuário para
 * desbloquear (mobile) — `unlock()` é chamado no primeiro toque da UI.
 *
 * HONESTIDADE DE ESCOPO (spec §16/§27): nenhum dos 10 packs de assets da
 * Phase 3 continha áudio (todos são packs visuais — ver ASSET-CATALOG.md) e
 * nenhuma trilha real foi adicionada ao projeto. Este módulo é a
 * infraestrutura completa (canais, volume, fade, persistência) pronta para
 * receber trilhas reais — mas `playMusic`/`playAmbience` nunca são chamados
 * com nenhuma URL em lugar nenhum do jogo hoje. O jogo permanece
 * deliberadamente silencioso, não quebrado: "se não houver asset coerente,
 * não usar qualquer áudio só para preencher" (spec §16, texto literal).
 */
type Category = 'music' | 'ambience' | 'sfx' | 'ui';

const FADE_STEPS = 8;
const FADE_MS = 300;

class AudioManagerImpl {
  private unlocked = false;
  private masterVolume = 0.8;
  private musicOn = true;
  private ambienceOn = true;
  private sfxOn = true;
  private currentMusic: HTMLAudioElement | null = null;
  private currentMusicKey: string | null = null;
  private currentAmbience: HTMLAudioElement | null = null;
  private currentAmbienceKey: string | null = null;
  private cache = new Map<string, HTMLAudioElement>();

  setMasterVolume(v: number): void {
    this.masterVolume = Math.max(0, Math.min(1, v));
    if (this.currentMusic) this.currentMusic.volume = 0.55 * this.masterVolume;
    if (this.currentAmbience) this.currentAmbience.volume = 0.4 * this.masterVolume;
  }

  setMusicOn(on: boolean): void {
    this.musicOn = on;
    if (!on) this.stopMusic();
  }

  setAmbienceOn(on: boolean): void {
    this.ambienceOn = on;
    if (!on) this.stopAmbience();
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
    this.fade(audio, 0, 0.55 * this.masterVolume);
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

  playAmbience(url: string, loop = true): void {
    if (this.currentAmbienceKey === url) return;
    if (!this.ambienceOn) {
      this.currentAmbienceKey = url;
      return;
    }
    const outgoing = this.currentAmbience;
    if (outgoing) this.fade(outgoing, outgoing.volume, 0, () => outgoing.pause());

    const audio = this.getAudio(url);
    audio.loop = loop;
    audio.volume = 0;
    audio.currentTime = 0;
    void audio.play().catch(() => {});
    this.fade(audio, 0, 0.4 * this.masterVolume);
    this.currentAmbience = audio;
    this.currentAmbienceKey = url;
  }

  stopAmbience(): void {
    if (this.currentAmbience) {
      const audio = this.currentAmbience;
      this.fade(audio, audio.volume, 0, () => audio.pause());
    }
    this.currentAmbience = null;
    this.currentAmbienceKey = null;
  }

  playSfx(url: string, _category: Category = 'sfx'): void {
    if (!this.sfxOn) return;
    const audio = this.getAudio(url).cloneNode(true) as HTMLAudioElement;
    audio.volume = 0.7 * this.masterVolume;
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
