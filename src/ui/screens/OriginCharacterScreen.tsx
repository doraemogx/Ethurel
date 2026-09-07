import { useState } from 'react';
import { SceneBackdrop } from '@/ui/components/SceneBackdrop';
import { MysticButton } from '@/ui/components/MysticButton';
import { sceneArtFor } from '@/ui/visual/sceneArt';
import { getClassTheme } from '@/ui/visual/classThemes';
import { ORIGIN_CHARACTERS } from '@/content/originCharacters';
import { CLASSES } from '@/data/classes';
import { createCharacterFromOrigin } from '@/domain/characterFactory';
import { loadSlot, forceSave, type SaveSlotId } from '@/save/gameSave';

export interface OriginCharacterScreenProps {
  slot: SaveSlotId;
  onBack: () => void;
  onDone: () => void;
}

export function OriginCharacterScreen({ slot, onBack, onDone }: OriginCharacterScreenProps) {
  const [selectedId, setSelectedId] = useState(ORIGIN_CHARACTERS[0].id);
  const selected = ORIGIN_CHARACTERS.find((o) => o.id === selectedId)!;
  const theme = getClassTheme(selected.classId);
  const className = CLASSES.find((c) => c.id === selected.classId)?.name ?? '';

  const start = () => {
    const save = loadSlot(slot);
    save.character = createCharacterFromOrigin(selected);
    save.currentLocationId = 'varreth';
    forceSave(slot, save);
    onDone();
  };

  return (
    <div className="screen">
      <SceneBackdrop art={{ ...sceneArtFor('village'), particleColor: theme.accent }} />
      <div className="screen__content">
        <h2 style={{ fontWeight: 400, textAlign: 'center', margin: '4px 0 12px' }}>Personagens de Origem</h2>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, overflowX: 'auto' }}>
          {ORIGIN_CHARACTERS.map((o) => (
            <button
              key={o.id}
              onClick={() => setSelectedId(o.id)}
              className="mystic-btn"
              style={{ flex: '0 0 auto', borderColor: selectedId === o.id ? getClassTheme(o.classId).accent : undefined, padding: '8px 14px', fontSize: 13 }}
            >
              {o.name}
            </button>
          ))}
        </div>

        <div className="stack" style={{ flex: 1 }}>
          <p style={{ fontSize: 12, color: theme.accentSoft, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
            {className}
          </p>
          <p style={{ fontStyle: 'italic', color: 'var(--text-dim)', margin: '2px 0 8px' }}>{selected.shortHook}</p>
          <p style={{ fontSize: 14, lineHeight: 1.5 }}>{selected.background}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--text-dim)', marginTop: 8 }}>
            <span><strong style={{ color: 'var(--text)' }}>Objetivo:</strong> {selected.personalGoal}</span>
            <span><strong style={{ color: 'var(--text)' }}>Medo:</strong> {selected.fear}</span>
          </div>
        </div>

        <div className="stack" style={{ marginTop: 16 }}>
          <MysticButton variant="primary" onClick={start}>
            Jogar como {selected.name}
          </MysticButton>
          <MysticButton variant="ghost" onClick={onBack}>
            Voltar
          </MysticButton>
        </div>
      </div>
    </div>
  );
}
