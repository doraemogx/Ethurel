import { SceneBackdrop } from '@/ui/components/SceneBackdrop';
import { Portrait } from '@/ui/components/Portrait';
import { StatusBar } from '@/ui/components/StatusBar';
import { sceneArtFor, arcaneOverlayFor } from '@/ui/visual/sceneArt';
import { getClassTheme } from '@/ui/visual/classThemes';
import { arcaneZone } from '@/arcane/zone';
import { indoleLabel } from '@/social/indole';
import { CLASSES } from '@/data/classes';
import { ORIGINS } from '@/data/origins';
import { useGame } from '@/app/GameContext';

const ATTR_LABELS: Record<string, string> = { vigor: 'Vigor', reflexo: 'Reflexo', mente: 'Mente', presenca: 'Presença' };

/** Ficha do personagem — Índole nunca aparece como barra numérica (spec §31),
 * só a síntese de apresentação; Reputação aparece por entidade (spec §32). */
export function CharacterScreen() {
  const { save } = useGame();
  const character = save.character;
  if (!character) return null;

  const classDef = CLASSES.find((c) => c.id === character.classId);
  const origin = ORIGINS.find((o) => o.id === character.originId);
  const theme = getClassTheme(character.classId);
  const zone = arcaneZone(character.tension);
  const reputationEntries = Object.entries(character.reputation);

  return (
    <div className="screen">
      <SceneBackdrop art={{ ...sceneArtFor('village'), particleColor: theme.accent }} arcaneOverlay={arcaneOverlayFor(zone)} />
      <div className="screen__content">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <Portrait name={character.name} size={64} imageUrl={character.visualProfile.portraitDefault} />
          <div>
            <h2 style={{ fontWeight: 400, margin: 0 }}>{character.name}</h2>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: theme.accentSoft, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {classDef?.name} · {origin?.name}
            </p>
          </div>
        </div>

        <div className="stack">
          <StatusBar label="HP" value={character.hp} max={character.maxHp} color="var(--danger)" />
          <StatusBar label="Foco" value={character.arcaneFocus} max={character.arcaneMax} color={theme.accent} />
          <StatusBar label="Tensão" value={character.tension} max={100} color="var(--gold)" />
        </div>

        <p style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4 }}>
          Zona Arcana: <strong style={{ color: 'var(--text)' }}>{zone === 'controle' ? 'Controle' : zone === 'saturacao' ? 'Saturação' : 'Ruptura'}</strong>
          {character.marca > 0 && <> · Marca Arcana {character.marca}</>}
        </p>

        <div className="stack" style={{ marginTop: 16 }}>
          <h3 style={{ fontWeight: 400, fontSize: 14, margin: 0, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Atributos
          </h3>
          {Object.entries(character.attrs).map(([k, v]) => (
            <div key={k} className="bar-row">
              <span style={{ width: 70 }}>{ATTR_LABELS[k] ?? k}</span>
              <span>{v}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 16 }}>
          <h3 style={{ fontWeight: 400, fontSize: 14, margin: '0 0 6px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Quem você está se tornando
          </h3>
          <p style={{ fontSize: 14, fontStyle: 'italic', margin: 0 }}>{indoleLabel(character.indole)}</p>
        </div>

        {reputationEntries.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <h3 style={{ fontWeight: 400, fontSize: 14, margin: '0 0 6px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Reputação
            </h3>
            <div className="stack">
              {reputationEntries.map(([entity, value]) => (
                <div key={entity} className="bar-row">
                  <span style={{ width: 90, textTransform: 'capitalize' }}>{entity}</span>
                  <span>{value > 0 ? `+${value}` : value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: 16 }}>
          <h3 style={{ fontWeight: 400, fontSize: 14, margin: '0 0 6px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Inventário
          </h3>
          {character.inventory.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>Vazio, por enquanto.</p>
          ) : (
            <div className="stack">
              {character.inventory.map((item, i) => (
                <div key={i} className="slot-card" style={{ cursor: 'default' }}>
                  {item}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
