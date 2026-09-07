import { useState } from 'react';
import { SceneBackdrop } from '@/ui/components/SceneBackdrop';
import { Portrait } from '@/ui/components/Portrait';
import { MysticButton } from '@/ui/components/MysticButton';
import { ArcaneSigil } from '@/ui/components/ArcaneSigil';
import { sceneArtFor } from '@/ui/visual/sceneArt';
import { getClassTheme } from '@/ui/visual/classThemes';
import { arcaneIdentityForClass } from '@/arcane/identity';
import { ORIGIN_CHARACTERS } from '@/content/originCharacters';
import { CLASSES } from '@/data/classes';
import { ORIGINS } from '@/data/origins';
import { createCharacterFromOrigin } from '@/domain/characterFactory';
import { loadSlot, forceSave, type SaveSlotId } from '@/save/gameSave';

export interface OriginCharacterScreenProps {
  slot: SaveSlotId;
  onBack: () => void;
  onDone: () => void;
}

/**
 * Cada Personagem de Origem precisa vender a experiência de jogá-lo (spec
 * Fase 2 §13): retrato, classe/origem, uma frase de voz, traços, algo que
 * ELE sabe (mostrado) vs. o segredo (nunca revelado, só um gancho).
 */
export function OriginCharacterScreen({ slot, onBack, onDone }: OriginCharacterScreenProps) {
  const [selectedId, setSelectedId] = useState(ORIGIN_CHARACTERS[0].id);
  const selected = ORIGIN_CHARACTERS.find((o) => o.id === selectedId)!;
  const index = ORIGIN_CHARACTERS.findIndex((o) => o.id === selectedId);
  const theme = getClassTheme(selected.classId);
  const identity = arcaneIdentityForClass(selected.classId);
  const className = CLASSES.find((c) => c.id === selected.classId)?.name ?? '';
  const originName = ORIGINS.find((o) => o.id === selected.originId)?.name ?? '';

  const go = (delta: number) => {
    const next = (index + delta + ORIGIN_CHARACTERS.length) % ORIGIN_CHARACTERS.length;
    setSelectedId(ORIGIN_CHARACTERS[next].id);
  };

  const start = () => {
    const save = loadSlot(slot);
    save.character = createCharacterFromOrigin(selected);
    save.currentLocationId = 'varreth';
    for (const rel of selected.startingRelationships) save.npcTrust[rel.npcId] = rel.affinity;
    forceSave(slot, save);
    onDone();
  };

  return (
    <div className="screen">
      <SceneBackdrop art={{ ...sceneArtFor('village'), particleColor: theme.accent }} arcaneOverlay={{ opacity: 0.1, hueShift: 0 }} />
      <div className="screen__content">
        <h2 style={{ fontWeight: 400, textAlign: 'center', margin: '4px 0 14px' }}>Personagens de Origem</h2>

        <div className="class-carousel-nav">
          <MysticButton variant="ghost" style={{ padding: '6px 14px' }} onClick={() => go(-1)}>
            ‹
          </MysticButton>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <Portrait name={selected.name} accent={theme.accent} size={84} imageUrl={selected.visualProfile.portrait} />
            <ArcaneSigil identity={identity} zone="controle" size={28} />
          </div>
          <MysticButton variant="ghost" style={{ padding: '6px 14px' }} onClick={() => go(1)}>
            ›
          </MysticButton>
        </div>
        <div className="class-carousel-dots">
          {ORIGIN_CHARACTERS.map((o) => (
            <span key={o.id} className={`class-carousel-dot ${o.id === selectedId ? 'class-carousel-dot--active' : ''}`} />
          ))}
        </div>

        <div className="stack" style={{ flex: 1, marginTop: 14 }}>
          <h3 style={{ margin: 0, fontWeight: 400, textAlign: 'center', fontSize: 20 }}>{selected.name}</h3>
          <p style={{ fontSize: 11, textAlign: 'center', color: theme.accentSoft, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
            {className} · {originName} · {selected.approxAge}
          </p>
          <p style={{ fontStyle: 'italic', color: 'var(--text-dim)', textAlign: 'center', margin: '6px 0 10px' }}>&ldquo;{selected.catchphrase}&rdquo;</p>
          <p style={{ fontSize: 14, lineHeight: 1.55, margin: 0 }}>{selected.background}</p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            {selected.traits.map((t) => (
              <span key={t} className="status-chip">{t}</span>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: 'var(--text-dim)', marginTop: 10 }}>
            <span><strong style={{ color: 'var(--text)' }}>Objetivo:</strong> {selected.personalGoal}</span>
            <span><strong style={{ color: 'var(--text)' }}>Medo:</strong> {selected.fear}</span>
            <span><strong style={{ color: 'var(--text)' }}>O que sabe:</strong> {selected.knownFact}</span>
            <span style={{ opacity: 0.7 }}><strong style={{ color: 'var(--text)' }}>Segredo:</strong> {selected.shortHook}</span>
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
