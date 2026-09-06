/**
 * AudioManager — existe desde o início (docs/design/02-STACK-E-ARQUITETURA.md),
 * mesmo sem assets reais ainda. Fase 1: só a interface/skeleton, sem nenhum som
 * carregado (não há assets de áudio na vertical slice antes da Fase 3+).
 */
export class AudioManager {
  private muted = false;

  playSfx(key: string): void {
    if (this.muted) return;
    console.debug(`[AudioManager] playSfx("${key}") — sem asset carregado ainda (stub da Fase 1).`);
  }

  playMusic(key: string): void {
    if (this.muted) return;
    console.debug(`[AudioManager] playMusic("${key}") — sem asset carregado ainda (stub da Fase 1).`);
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
  }
}

export const audioManager = new AudioManager();
