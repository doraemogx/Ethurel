import { ParticleField } from '@/ui/visual/ParticleField';
import type { SceneArtStyle } from '@/ui/visual/sceneArt';

export interface SceneBackdropProps {
  art: SceneArtStyle;
  reduceMotion?: boolean;
  arcaneOverlay?: { opacity: number; hueShift: number };
}

/** Composição padrão de fundo — gradiente atmosférico + partículas + vinheta.
 * Toda tela usa isto por baixo do conteúdo (spec §13: a UI é mística, a
 * arte da cena muda). */
export function SceneBackdrop({ art, reduceMotion, arcaneOverlay }: SceneBackdropProps) {
  return (
    <div className="screen__backdrop" style={{ background: art.gradient }}>
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
