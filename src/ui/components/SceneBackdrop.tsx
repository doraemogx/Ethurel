import { ParticleField } from '@/ui/visual/ParticleField';
import type { SceneArtStyle } from '@/ui/visual/sceneArt';

export interface SceneBackdropProps {
  art: SceneArtStyle;
  reduceMotion?: boolean;
  arcaneOverlay?: { opacity: number; hueShift: number };
  /** Fundo real do local (Phase 3 §12/§50) — quando ausente, cai para o
   * gradiente atmosférico de sempre (nenhum local fica quebrado sem arte). */
  backgroundImage?: string;
  /** Camadas de primeiro plano opcionais — profundidade simples (§1: parallax). */
  foregroundImages?: string[];
}

/** Composição padrão de fundo — arte real (quando existe) + gradiente
 * atmosférico por cima como scrim/tinta de humor + partículas + vinheta.
 * Toda tela usa isto por baixo do conteúdo (spec §13: a UI é mística, a
 * arte da cena muda). */
export function SceneBackdrop({ art, reduceMotion, arcaneOverlay, backgroundImage, foregroundImages }: SceneBackdropProps) {
  return (
    <div className="screen__backdrop" style={{ background: art.gradient }}>
      {backgroundImage && (
        <div
          className="scene-backdrop__photo"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}
      {backgroundImage && <div className="scene-backdrop__scrim" style={{ background: art.gradient }} />}
      {foregroundImages?.map((src) => (
        <div key={src} className="scene-backdrop__foreground" style={{ backgroundImage: `url(${src})` }} />
      ))}
      <ParticleField color={art.particleColor} motif={art.particleMotif} reduceMotion={reduceMotion} />
      {arcaneOverlay && arcaneOverlay.opacity > 0.01 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(120% 100% at 50% 100%, rgba(159,127,224,${arcaneOverlay.opacity}), transparent 70%)`,
            filter: `hue-rotate(${arcaneOverlay.hueShift}deg)`,
            mixBlendMode: 'screen',
          }}
        />
      )}
      <div className="vignette" />
    </div>
  );
}
