import { SceneBackdrop } from '@/ui/components/SceneBackdrop';
import { MysticButton } from '@/ui/components/MysticButton';
import { sceneArtFor } from '@/ui/visual/sceneArt';
import { listSlotSummaries, type SaveSlotId } from '@/save/gameSave';

export interface SlotPickerScreenProps {
  mode: 'continue' | 'new';
  onBack: () => void;
  onPickContinue: (slot: SaveSlotId) => void;
  onPickNew: (slot: SaveSlotId) => void;
}

/** Múltiplos slots de save (spec §49) — cada card mostra personagem/classe/
 * local/última atualização. */
export function SlotPickerScreen({ mode, onBack, onPickContinue, onPickNew }: SlotPickerScreenProps) {
  const summaries = listSlotSummaries();

  return (
    <div className="screen">
      <SceneBackdrop art={sceneArtFor('archive')} />
      <div className="screen__content">
        <div className="title-block">
          <h1 style={{ fontSize: 20 }}>{mode === 'continue' ? 'Continuar' : 'Nova Campanha'}</h1>
        </div>
        <div className="stack" style={{ marginTop: 20 }}>
          {summaries.map((s) => {
            const disabled = mode === 'continue' && !s.occupied;
            return (
              <button
                key={s.slot}
                className="slot-card"
                disabled={disabled}
                style={{ opacity: disabled ? 0.35 : 1 }}
                onClick={() => (mode === 'continue' ? onPickContinue(s.slot) : onPickNew(s.slot))}
              >
                {s.occupied ? (
                  <>
                    <p className="slot-card__title">{s.characterName}</p>
                    <p className="slot-card__meta">
                      {s.className} · {s.locationId} · {s.updatedAt ? new Date(s.updatedAt).toLocaleDateString() : ''}
                    </p>
                  </>
                ) : (
                  <p className="slot-card__meta">{mode === 'new' ? 'Slot vazio — iniciar aqui' : 'Vazio'}</p>
                )}
              </button>
            );
          })}
        </div>
        <div style={{ marginTop: 'auto', paddingTop: 16 }}>
          <MysticButton variant="ghost" onClick={onBack}>
            Voltar
          </MysticButton>
        </div>
      </div>
    </div>
  );
}
