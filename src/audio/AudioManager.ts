import Phaser from 'phaser';

/**
 * AudioManager central — música/ambiente/SFX/UI, com unlock em gesto do
 * usuário (WebAudio em mobile não toca sem interação) e crossfade simples ao
 * trocar de música. `init(game)` é chamado uma vez no boot (main.ts); as
 * cenas só chamam `playMusic`/`playSfx`/`setMuted`, nunca tocam áudio
 * diretamente, para nunca haver duas músicas simultâneas por acidente.
 */
type MusicOptions = { loop?: boolean; volume?: number };

const MUSIC_VOLUME = 0.55;
const SFX_VOLUME = 0.7;
const FADE_MS = 350;
const FADE_STEPS = 8;

export class AudioManager {
  private soundManager: Phaser.Sound.BaseSoundManager | null = null;
  private muted = false;
  private currentMusicKey: string | null = null;
  private currentMusic: Phaser.Sound.BaseSound | null = null;
  private pendingUnlockCalls: (() => void)[] = [];

  init(game: Phaser.Game): void {
    this.soundManager = game.sound;
    if (this.soundManager.locked) {
      this.soundManager.once(Phaser.Sound.Events.UNLOCKED, () => {
        for (const fn of this.pendingUnlockCalls) fn();
        this.pendingUnlockCalls = [];
      });
    }
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.soundManager) this.soundManager.mute = muted;
  }

  isMuted(): boolean {
    return this.muted;
  }

  private runWhenUnlocked(fn: () => void): void {
    if (!this.soundManager) return;
    if (this.soundManager.locked) this.pendingUnlockCalls.push(fn);
    else fn();
  }

  playMusic(key: string, opts: MusicOptions = {}): void {
    if (!this.soundManager) return;
    if (this.currentMusicKey === key) return; // já tocando, evita reiniciar/duplicar
    this.runWhenUnlocked(() => this.crossfadeTo(key, opts));
  }

  private crossfadeTo(key: string, opts: MusicOptions): void {
    if (!this.soundManager) return;
    const targetVolume = (opts.volume ?? MUSIC_VOLUME) * (this.muted ? 0 : 1);
    const outgoing = this.currentMusic;
    if (outgoing) this.fadeOutAndStop(outgoing);

    const sound = this.soundManager.add(key, { loop: opts.loop ?? true, volume: 0 });
    sound.play();
    this.currentMusic = sound;
    this.currentMusicKey = key;
    this.fadeVolume(sound, 0, targetVolume);
  }

  stopMusic(): void {
    if (this.currentMusic) this.fadeOutAndStop(this.currentMusic);
    this.currentMusic = null;
    this.currentMusicKey = null;
  }

  private fadeOutAndStop(sound: Phaser.Sound.BaseSound): void {
    this.fadeVolume(sound, (sound as unknown as { volume: number }).volume ?? MUSIC_VOLUME, 0, () => sound.stop());
  }

  private fadeVolume(sound: Phaser.Sound.BaseSound, from: number, to: number, onDone?: () => void): void {
    const withVolume = sound as unknown as { volume: number };
    let step = 0;
    const tick = () => {
      step += 1;
      const t = step / FADE_STEPS;
      withVolume.volume = from + (to - from) * t;
      if (step < FADE_STEPS) setTimeout(tick, FADE_MS / FADE_STEPS);
      else onDone?.();
    };
    tick();
  }

  playSfx(key: string, volume = SFX_VOLUME): void {
    if (!this.soundManager || this.muted) return;
    this.runWhenUnlocked(() => this.soundManager?.play(key, { volume }));
  }
}

export const audioManager = new AudioManager();
