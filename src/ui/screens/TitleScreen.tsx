import { SceneBackdrop } from '@/ui/components/SceneBackdrop';
import { MysticButton } from '@/ui/components/MysticButton';
import { sceneArtFor } from '@/ui/visual/sceneArt';
import { hasAnyContinuableSave } from '@/save/gameSave';

export interface TitleScreenProps {
  onContinue: () => void;
  onNewGame: () => void;
  onSettings: () => void;
}

export function TitleScreen({ onContinue, onNewGame, onSettings }: TitleScreenProps) {
  const canContinue = hasAnyContinuableSave();
  return (
    <div className="screen">
      <SceneBackdrop art={sceneArtFor('fissure')} />
      <div className="screen__content stack--center">
        <div className="title-block">
          <h1>ETHUREL</h1>
          <p>um RPG narrativo</p>
        </div>
        <div className="stack" style={{ marginTop: 40, width: '100%', maxWidth: 320 }}>
          {canContinue && (
            <MysticButton variant="primary" onClick={onContinue}>
              Continuar
            </MysticButton>
          )}
          <MysticButton variant={canContinue ? 'default' : 'primary'} onClick={onNewGame}>
            Novo Jogo
          </MysticButton>
          <MysticButton variant="ghost" onClick={onSettings}>
            Configurações
          </MysticButton>
        </div>
      </div>
    </div>
  );
}
