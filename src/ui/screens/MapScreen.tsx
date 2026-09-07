import { SceneBackdrop } from '@/ui/components/SceneBackdrop';
import { sceneArtFor } from '@/ui/visual/sceneArt';
import { LOCATIONS } from '@/data/locations';
import { useGame } from '@/app/GameContext';

const DANGER_LABEL: Record<string, string> = {
  nenhum: 'Seguro',
  baixo: 'Perigo baixo',
  moderado: 'Perigo moderado',
  alto: 'Perigo alto',
};

/**
 * Grafo de locais, não mapa top-down controlável (spec §35). Nesta fatia
 * vertical a viagem é guiada pela narrativa; o mapa serve para orientação e
 * lore de mundo — cada local descoberto aparece com sua descrição curta.
 */
export function MapScreen() {
  const { save } = useGame();

  return (
    <div className="screen">
      <SceneBackdrop art={sceneArtFor('road')} />
      <div className="screen__content">
        <h2 style={{ fontWeight: 400, textAlign: 'center', margin: '4px 0 16px' }}>Borda dos Musgos</h2>
        <div className="stack">
          {LOCATIONS.map((loc) => {
            const discovered = save.discoveredLocations.includes(loc.id);
            const isCurrent = save.currentLocationId === loc.id;
            if (!discovered) {
              return (
                <div key={loc.id} className="location-card location-card--locked">
                  <p className="slot-card__title">???</p>
                  <p className="slot-card__meta">Ainda não descoberto.</p>
                </div>
              );
            }
            return (
              <div
                key={loc.id}
                className="location-card"
                style={{ borderColor: isCurrent ? 'var(--accent-soft)' : undefined }}
              >
                <p className="slot-card__title">
                  {loc.name} {isCurrent && <span className="status-chip" style={{ marginLeft: 6 }}>Aqui</span>}
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-dim)', margin: '4px 0' }}>{loc.description}</p>
                <p className="slot-card__meta">{DANGER_LABEL[loc.danger] ?? loc.danger}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
