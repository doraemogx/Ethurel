import { useState } from 'react';
import { SceneBackdrop } from '@/ui/components/SceneBackdrop';
import { Portrait } from '@/ui/components/Portrait';
import { MysticButton } from '@/ui/components/MysticButton';
import { ArcaneSigil } from '@/ui/components/ArcaneSigil';
import { CreationStage } from '@/ui/components/CreationStage';
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
 *
 * Rodada de Recuperação §11: os 5 agora têm retrato próprio, catalogado em
 * `originCharacters.ts` (`visualProfile.portrait`) — 4 dos 5 vêm dos bustos
 * novos extraídos de `incoming-assets/` (Sera Doventh/Vampire, Ynara Voss/
 * DarkPrincess, Mireth Sable/Pyromancer), o 5º reaproveita um retrato já
 * catalogado (Doran Kessig/viajante-b, Corwin Thale/Oracle) — ver
 * CHARACTER_ASSET_REGISTRY.md para a justificativa de cada par. Antes
 * (Fase 3), nenhum tinha arte própria e a tela usava só a silhueta de
 * `Portrait.tsx`; esse fallback continua existindo abaixo só como rede de
 * segurança (nunca deve disparar na prática agora que os 5 têm imageUrl).
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
        <CreationStage
          eyebrow={`Personagem de Origem · ${index + 1} de ${ORIGIN_CHARACTERS.length}`}
          title={selected.name}
          subtitle={`${className} · ${originName} · ${selected.approxAge}`}
          mainAccent={theme.accent}
          main={
            <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <button
                aria-label="Personagem anterior"
                onClick={() => go(-1)}
                style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: 28, padding: 10, cursor: 'pointer' }}
              >
                ‹
              </button>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <Portrait name={selected.name} accent={theme.accent} size={168} imageUrl={selected.visualProfile.portrait} />
                <ArcaneSigil identity={identity} zone="controle" size={32} />
              </div>
              <button
                aria-label="Próximo personagem"
                onClick={() => go(1)}
                style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: 28, padding: 10, cursor: 'pointer' }}
              >
                ›
              </button>
            </div>
          }
          secondary={
            <div className="stack" style={{ gap: 8 }}>
              <p style={{ fontStyle: 'italic', color: 'var(--text-dim)', textAlign: 'center', margin: 0 }}>&ldquo;{selected.catchphrase}&rdquo;</p>
              <p style={{ fontSize: 14, lineHeight: 1.55, margin: 0 }}>{selected.background}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {selected.traits.map((t) => (
                  <span key={t} className="status-chip">{t}</span>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: 'var(--text-dim)' }}>
                <span><strong style={{ color: 'var(--text)' }}>Objetivo:</strong> {selected.personalGoal}</span>
                <span><strong style={{ color: 'var(--text)' }}>Medo:</strong> {selected.fear}</span>
                <span><strong style={{ color: 'var(--text)' }}>O que sabe:</strong> {selected.knownFact}</span>
                <span style={{ opacity: 0.7 }}><strong style={{ color: 'var(--text)' }}>Segredo:</strong> {selected.shortHook}</span>
              </div>
            </div>
          }
          controls={
            <>
              <div className="class-carousel-dots">
                {ORIGIN_CHARACTERS.map((o) => (
                  <span key={o.id} className={`class-carousel-dot ${o.id === selectedId ? 'class-carousel-dot--active' : ''}`} />
                ))}
              </div>
              <MysticButton variant="primary" onClick={start}>
                Jogar como {selected.name}
              </MysticButton>
              <MysticButton variant="ghost" onClick={onBack}>
                Voltar
              </MysticButton>
            </>
          }
        />
      </div>
    </div>
  );
}
