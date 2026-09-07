import { useState } from 'react';
import { SceneBackdrop } from '@/ui/components/SceneBackdrop';
import { Portrait } from '@/ui/components/Portrait';
import { StatusBar } from '@/ui/components/StatusBar';
import { ArcaneSigil } from '@/ui/components/ArcaneSigil';
import { ItemIcon } from '@/ui/components/ItemIcon';
import { sceneArtFor, arcaneOverlayFor } from '@/ui/visual/sceneArt';
import { getClassTheme } from '@/ui/visual/classThemes';
import { arcaneIdentityForClass } from '@/arcane/identity';
import { arcaneZone } from '@/arcane/zone';
import { indoleLabel } from '@/social/indole';
import { relationshipLabel } from '@/social/relationship';
import { CLASSES } from '@/data/classes';
import { ORIGINS } from '@/data/origins';
import { findItemByName } from '@/data/items';
import { findAncestry, findVariant } from '@/data/ancestries';
import { NPCS } from '@/data/npcs';
import { useGame } from '@/app/GameContext';

const ATTR_LABELS: Record<string, string> = { vigor: 'Vigor', reflexo: 'Reflexo', mente: 'Mente', presenca: 'Presença' };
const GENDER_LABEL: Record<string, string> = { masculino: 'Masculino', feminino: 'Feminino', outro: 'Outro' };

function marcaDescription(marca: number): string {
  if (marca >= 75) return 'Intensa e perturbadora — quem olha de perto percebe.';
  if (marca >= 50) return 'Clara — algumas pessoas já notaram algo diferente em você.';
  if (marca >= 25) return 'Sutil — só quem sabe o que procurar percebe.';
  if (marca > 0) return 'Quase imperceptível.';
  return 'Nenhuma marca ainda.';
}

/** Ficha do personagem (Fase 2 §30-31) — Índole nunca aparece como barra
 * numérica (spec §31), só a síntese de apresentação; Marca Arcana ganha
 * descrição subjetiva por faixa (25/50/75, recuperado do handoff). */
export function CharacterScreen() {
  const { save } = useGame();
  const character = save.character;
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  if (!character) return null;

  const classDef = CLASSES.find((c) => c.id === character.classId);
  const origin = ORIGINS.find((o) => o.id === character.originId);
  const ancestry = findAncestry(character.ancestryId);
  const variant = findVariant(ancestry, character.ancestryVariantId);
  const theme = getClassTheme(character.classId);
  const identity = arcaneIdentityForClass(character.classId);
  const zone = arcaneZone(character.tension);
  const reputationEntries = Object.entries(character.reputation);
  const trustEntries = Object.entries(save.npcTrust);

  return (
    <div className="screen">
      <SceneBackdrop art={{ ...sceneArtFor('village'), particleColor: theme.accent, particleMotif: theme.particleMotif }} arcaneOverlay={arcaneOverlayFor(zone)} />
      <div className="screen__content">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
          <Portrait name={character.name} size={68} accent={theme.accent} imageUrl={character.visualProfile.portrait} />
          <div style={{ flex: 1 }}>
            <h2 style={{ fontWeight: 400, margin: 0 }}>{character.name}</h2>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: theme.accentSoft, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {classDef?.name} · {origin?.name}
            </p>
            {ancestry && (
              <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-dim)' }}>
                {ancestry.name}{variant ? ` (${variant.name})` : ''}
              </p>
            )}
            <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-dim)' }}>
              {GENDER_LABEL[character.gender] ?? character.gender} · Nível {character.level} · {character.xp} XP
            </p>
          </div>
          <ArcaneSigil identity={identity} zone={zone} size={40} />
        </div>

        <div className="stack">
          <StatusBar label="HP" value={character.hp} max={character.maxHp} color="var(--danger)" />
          <StatusBar label="Foco" value={character.arcaneFocus} max={character.arcaneMax} color={theme.accent} />
          <StatusBar label="Tensão" value={character.tension} max={100} color="var(--gold)" />
        </div>

        <p style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 6 }}>
          Zona Arcana: <strong style={{ color: 'var(--text)' }}>{zone === 'controle' ? 'Controle' : zone === 'saturacao' ? 'Saturação' : 'Ruptura'}</strong>
        </p>
        <p style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>
          Marca Arcana ({identity.label}): <span style={{ color: 'var(--text)' }}>{marcaDescription(character.marca)}</span>
        </p>

        <Section title="Atributos">
          {Object.entries(character.attrs).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
              <span style={{ width: 66, color: 'var(--text-dim)' }}>{ATTR_LABELS[k] ?? k}</span>
              <div style={{ display: 'flex', gap: 3 }}>
                {Array.from({ length: 8 }, (_, i) => (
                  <span
                    key={i}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 2,
                      background: i < v ? theme.accent : 'rgba(216,211,230,0.12)',
                    }}
                  />
                ))}
              </div>
              <span style={{ color: 'var(--text)' }}>{v}</span>
            </div>
          ))}
        </Section>

        <Section title="Quem você está se tornando">
          <p style={{ fontSize: 14, fontStyle: 'italic', margin: 0 }}>{indoleLabel(character.indole)}</p>
        </Section>

        {character.principle && (
          <Section title="Princípio, Desejo, Medo">
            <p style={{ margin: 0, fontSize: 13 }}>{character.principle}</p>
            {character.desire && <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-dim)' }}>{character.desire}</p>}
            {character.fear && <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-dim)' }}>{character.fear}</p>}
          </Section>
        )}

        {save.echoes.length > 0 && (
          <Section title="Ecos">
            <div className="stack">
              {save.echoes.map((e) => (
                <div key={e.id} className="slot-card" style={{ cursor: 'default' }}>
                  <p className="slot-card__title" style={{ fontSize: 13 }}>{e.title}</p>
                  <p className="slot-card__meta" style={{ fontSize: 11 }}>{e.description}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {reputationEntries.length > 0 && (
          <Section title="Reputação">
            <div className="stack">
              {reputationEntries.map(([entity, value]) => (
                <div key={entity} className="bar-row">
                  <span style={{ width: 90, textTransform: 'capitalize' }}>{entity}</span>
                  <div className="bar"><div className="bar__fill" style={{ width: `${Math.min(100, Math.abs(value))}%`, background: value >= 0 ? '#9fd1a8' : 'var(--danger)', marginLeft: value < 0 ? 'auto' : 0 }} /></div>
                  <span>{value > 0 ? `+${value}` : value}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {trustEntries.length > 0 && (
          <Section title="Relações">
            <div className="stack">
              {trustEntries.map(([npcId, trust]) => {
                const npc = NPCS.find((n) => n.id === npcId);
                return (
                  <div key={npcId} className="bar-row">
                    <span style={{ width: 90 }}>{npc?.name ?? npcId}</span>
                    <span className="status-chip">{relationshipLabel(trust)}</span>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        <Section title="Inventário">
          {character.inventory.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>Vazio, por enquanto.</p>
          ) : (
            <div className="stack">
              {character.inventory.map((itemName, i) => {
                const item = findItemByName(itemName);
                const key = `${itemName}-${i}`;
                const isOpen = expandedItem === key;
                return (
                  <button
                    key={key}
                    className="slot-card"
                    style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}
                    onClick={() => setExpandedItem(isOpen ? null : key)}
                  >
                    <ItemIcon motif={item?.icon ?? 'sigil'} color={theme.accent} />
                    <div style={{ flex: 1 }}>
                      <p className="slot-card__title" style={{ fontSize: 13 }}>{itemName}</p>
                      <p className="slot-card__meta">{item?.type ?? 'objeto'}</p>
                      {isOpen && item && <p style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 6 }}>{item.description}</p>}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 16 }}>
      <h3 style={{ fontWeight: 400, fontSize: 13, margin: '0 0 6px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {title}
      </h3>
      {children}
    </div>
  );
}
