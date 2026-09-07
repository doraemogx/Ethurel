import { useState } from 'react';
import { LOCATIONS } from '@/data/locations';
import { useGame } from '@/app/GameContext';
import type { Location } from '@/world/types';
import type { LocationDiscoveryState } from '@/save/schema';

const DANGER_LABEL: Record<Location['danger'], string> = {
  nenhum: 'Seguro',
  baixo: 'Perigo baixo',
  moderado: 'Perigo moderado',
  alto: 'Perigo alto',
};

/**
 * Mapa místico real (Fase 2 §26-29) — cartografia em SVG, não lista de
 * cards. Coordenadas recuperadas do Artifact antigo (viewBox 300×190, ver
 * docs/design/11-LEGACY-RECOVERY.md). 3 estados de descoberta:
 * desconhecido (névoa) / conhecido (esmaecido) / visitado (pleno, pulsa se
 * for o local atual).
 */
export function MapScreen() {
  const { save } = useGame();
  const [selectedId, setSelectedId] = useState<string | null>(save.currentLocationId);
  const selected = LOCATIONS.find((l) => l.id === selectedId);

  const stateOf = (id: string): LocationDiscoveryState => save.locationStates[id] ?? 'desconhecido';

  return (
    <div className="screen">
      <div
        className="screen__backdrop"
        style={{ background: 'radial-gradient(140% 100% at 50% 10%, #1c1a28 0%, #100e18 55%, #08070f 100%)' }}
      />
      <div className="vignette" />
      <div className="screen__content">
        <h2 style={{ fontWeight: 400, textAlign: 'center', margin: '4px 0 10px' }}>Borda dos Musgos</h2>

        <div className="map-svg-wrap">
          <svg viewBox="0 0 300 190" width="100%" height="100%" style={{ display: 'block' }}>
            <defs>
              <radialGradient id="map-node-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#c9b6f0" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#c9b6f0" stopOpacity="0" />
              </radialGradient>
            </defs>

            {edgesFor(LOCATIONS).map(([a, b]) => {
              const dim = stateOf(a.id) === 'desconhecido' || stateOf(b.id) === 'desconhecido';
              return (
                <line
                  key={`${a.id}-${b.id}`}
                  x1={a.coordinates.x}
                  y1={a.coordinates.y}
                  x2={b.coordinates.x}
                  y2={b.coordinates.y}
                  stroke="#d8d3e6"
                  strokeOpacity={dim ? 0.08 : 0.3}
                  strokeWidth={1}
                  strokeDasharray={dim ? '2 4' : undefined}
                />
              );
            })}

            {LOCATIONS.map((loc) => {
              const state = stateOf(loc.id);
              const isCurrent = save.currentLocationId === loc.id;
              const cx = loc.coordinates.x;
              const cy = loc.coordinates.y;

              if (state === 'desconhecido') {
                return (
                  <g key={loc.id} opacity={0.4}>
                    <circle cx={cx} cy={cy} r={10} fill="url(#map-node-glow)" opacity={0.25} />
                    <circle cx={cx} cy={cy} r={3} fill="#5a5470" />
                  </g>
                );
              }

              return (
                <g
                  key={loc.id}
                  className={isCurrent ? 'map-node--current' : ''}
                  onClick={() => setSelectedId(loc.id)}
                  style={{ cursor: 'pointer' }}
                  opacity={state === 'conhecido' ? 0.55 : 1}
                >
                  {isCurrent && <circle cx={cx} cy={cy} r={9} fill="url(#map-node-glow)" />}
                  <circle
                    className="map-node-core"
                    cx={cx}
                    cy={cy}
                    r={selectedId === loc.id ? 6 : 5}
                    fill={isCurrent ? '#c9b6f0' : '#9f7fe0'}
                    stroke="#0b0a16"
                    strokeWidth={1}
                  />
                  <text x={cx} y={cy - 10} textAnchor="middle" className="map-node-label">
                    {loc.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {selected && (
          <div className="location-card" style={{ marginTop: 8 }}>
            <p className="slot-card__title">
              {stateOf(selected.id) === 'desconhecido' ? '???' : selected.name}
              {save.currentLocationId === selected.id && <span className="status-chip" style={{ marginLeft: 6 }}>Aqui</span>}
            </p>
            {stateOf(selected.id) !== 'desconhecido' ? (
              <>
                <p style={{ fontSize: 13, color: 'var(--text-dim)', margin: '4px 0' }}>{selected.description}</p>
                <p className="slot-card__meta">{DANGER_LABEL[selected.danger]}</p>
              </>
            ) : (
              <p className="slot-card__meta">Ainda não descoberto.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function edgesFor(locations: Location[]): [Location, Location][] {
  const byId = new Map(locations.map((l) => [l.id, l]));
  const seen = new Set<string>();
  const edges: [Location, Location][] = [];
  for (const loc of locations) {
    for (const connId of loc.connections) {
      const key = [loc.id, connId].sort().join('|');
      if (seen.has(key)) continue;
      seen.add(key);
      const other = byId.get(connId);
      if (other) edges.push([loc, other]);
    }
  }
  return edges;
}
