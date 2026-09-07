import { SceneBackdrop } from '@/ui/components/SceneBackdrop';
import { MysticButton } from '@/ui/components/MysticButton';
import { sceneArtFor } from '@/ui/visual/sceneArt';

export interface NewGameChoiceScreenProps {
  onBack: () => void;
  onCustom: () => void;
  onOrigin: () => void;
}

export function NewGameChoiceScreen({ onBack, onCustom, onOrigin }: NewGameChoiceScreenProps) {
  return (
    <div className="screen">
      <SceneBackdrop art={sceneArtFor('village')} />
      <div className="screen__content stack--center">
        <div className="title-block">
          <h1 style={{ fontSize: 22 }}>Quem você é?</h1>
        </div>
        <div className="stack" style={{ marginTop: 28, width: '100%', maxWidth: 320 }}>
          <MysticButton variant="primary" onClick={onCustom}>
            Criar Personagem
          </MysticButton>
          <MysticButton onClick={onOrigin}>Personagens de Origem</MysticButton>
          <MysticButton variant="ghost" onClick={onBack}>
            Voltar
          </MysticButton>
        </div>
      </div>
    </div>
  );
}
