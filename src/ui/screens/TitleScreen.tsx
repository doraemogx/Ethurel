import { SceneBackdrop } from '@/ui/components/SceneBackdrop';
import { MysticButton } from '@/ui/components/MysticButton';
import { sceneArtFor } from '@/ui/visual/sceneArt';
import { hasAnyContinuableSave } from '@/save/gameSave';

export interface TitleScreenProps {
  onContinue: () => void;
  onNewGame: () => void;
  onCampaigns: () => void;
  onSettings: () => void;
}

/**
 * Título (Phase 3 §5) — sequência fade do preto → fundo do mundo → partículas
 * discretas → logo ETHUREL (Cinzel, OFL, ver main.tsx) → frase curta → menu.
 * CSS puro com `animation-delay` escalonado (sem orquestração em JS); a
 * classe global `.reduce-motion` (aplicada em `<html>` no boot, ver
 * main.tsx) desliga toda a sequência de uma vez — tudo já visível.
 */
export function TitleScreen({ onContinue, onNewGame, onCampaigns, onSettings }: TitleScreenProps) {
  const canContinue = hasAnyContinuableSave();

  return (
    <div className="screen">
      <SceneBackdrop art={sceneArtFor('forest')} backgroundImage="/assets/img/backgrounds/borda-musgos-night.webp" />
      <div className="title-stage" />
      <div className="screen__content stack--center">
        <div className="title-block">
          <h1 className="title-logo title-anim title-anim--logo">ETHUREL</h1>
          <p className="title-tagline title-anim title-anim--tagline">Onde a Arcane ainda sussurra sob a pedra e o musgo.</p>
        </div>
        <div className="stack title-anim title-anim--menu" style={{ marginTop: 40, width: '100%', maxWidth: 320 }}>
          {canContinue && (
            <MysticButton variant="primary" onClick={onContinue}>
              Continuar
            </MysticButton>
          )}
          <MysticButton variant={canContinue ? 'default' : 'primary'} onClick={onNewGame}>
            Novo Jogo
          </MysticButton>
          <MysticButton variant="default" onClick={onCampaigns}>
            Campanhas
          </MysticButton>
          <MysticButton variant="ghost" onClick={onSettings}>
            Configurações
          </MysticButton>
        </div>
      </div>
    </div>
  );
}
