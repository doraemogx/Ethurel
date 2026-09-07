import { useState } from 'react';
import { LOCATIONS } from '@/data/locations';
import { useGame } from '@/app/GameContext';
import type { Location } from '@/world/types';
import type { LocationDiscoveryState } from '@/save/schema';
import { IMG } from '@/ui/assetPath';

const DANGER_LABEL: Record<Location['danger'], string> = {
  nenhum: 'Seguro',
  baixo: 'Perigo baixo',
  moderado: 'Perigo moderado',
  alto: 'Perigo alto',
};

/** Ícone de terreno por local — desenhado à mão em SVG (tinta sépia sobre
 * pergaminho), nunca um recorte colado do tile sheet do Pack #5 (spec §13:
 * "não é PNG pronto + nomes por cima"). A geografia é a de Ethurel — cada
 * ícone existe só porque aquele local específico pede aquele elemento, não
 * porque o pack tinha um mountain/tree/village genérico sobrando. */
function TerrainGlyph({ kind, cx, cy }: { kind: 'village' | 'forest' | 'road' | 'fissure'; cx: number; cy: number }) {
  const ink = '#5a4632';
  if (kind === 'village') {
    return (
      <g stroke={ink} strokeWidth={0.6} fill="none" opacity={0.75}>
        <path d={`M${cx - 10},${cy + 14} l4,-6 4,6 z`} />
        <path d={`M${cx - 2},${cy + 14} l4,-7 4,7 z`} />
        <path d={`M${cx + 7},${cy + 14} l4,-5 4,5 z`} />
      </g>
    );
  }
  if (kind === 'forest') {
    return (
      <g stroke={ink} strokeWidth={0.5} fill={ink} fillOpacity={0.18} opacity={0.8}>
        <circle cx={cx - 12} cy={cy + 10} r={5} />
        <circle cx={cx - 4} cy={cy + 13} r={6} />
        <circle cx={cx + 6} cy={cy + 9} r={4.5} />
        <circle cx={cx + 13} cy={cy + 13} r={5} />
      </g>
    );
  }
  if (kind === 'fissure') {
    return (
      <g stroke="#8a6fae" strokeWidth={0.7} fill="none" opacity={0.85}>
        <path d={`M${cx - 9},${cy + 15} L${cx - 2},${cy + 2} L${cx + 3},${cy + 12} L${cx + 9},${cy - 4}`} strokeDasharray="1.5 1.5" />
      </g>
    );
  }
  return null;
}

/**
 * Camada de terreno pintado (Rodada de Recuperação §15) — o mapa antigo era
 * só nós+linhas sobre um pergaminho vazio ("pseudo-mapa", rejeitado
 * explicitamente). Isto pinta cartografia de verdade por baixo dos nós,
 * baseada só no que os próprios locais já descrevem (`locations.ts`,
 * cânone Orren): floresta/névoa ao redor da Borda dos Musgos, uma estrada
 * de pedra rachada ligando Varreth→Estrada Velha→Fronteira, e um campo de
 * fendas ao redor da Fronteira Partida (fissura arcana permanente). Nada
 * aqui inventa geografia nova — só desenha o que a descrição de cada local
 * já afirma, na escala do próprio viewBox 300×190.
 */
function TerrainPainting() {
  return (
    <g opacity={0.9}>
      {/* Massa de floresta/névoa — Borda dos Musgos (canto noroeste). */}
      <g fill="#5a4632" fillOpacity={0.14} stroke="#5a4632" strokeOpacity={0.35} strokeWidth={0.5}>
        <path d="M12,95 C8,72 24,50 48,44 C66,40 82,50 88,66 C94,80 86,96 70,100 C50,106 24,112 12,95 Z" />
      </g>
      <g fill="#5a4632" fillOpacity={0.22} stroke="#5a4632" strokeOpacity={0.4} strokeWidth={0.45}>
        <circle cx={40} cy={58} r={7} />
        <circle cx={56} cy={50} r={6} />
        <circle cx={30} cy={72} r={6.5} />
        <circle cx={50} cy={78} r={7.5} />
        <circle cx={66} cy={68} r={6} />
        <circle cx={22} cy={58} r={5} />
      </g>
      {/* Névoa baixa, típica da própria descrição do local. */}
      <path d="M10,88 Q40,98 70,88" stroke="#c9d3cf" strokeOpacity={0.22} strokeWidth={3} fill="none" strokeLinecap="round" />

      {/* Campo de fendas — Fronteira Partida, o ar "não se comporta direito". */}
      <g stroke="#8a6fae" strokeOpacity={0.4} fill="none" strokeWidth={0.6}>
        <path d="M238,30 L250,52 L242,66 L262,60 L270,38" strokeDasharray="1.2 1.6" />
        <path d="M248,20 L256,36" strokeDasharray="1 1.4" />
        <path d="M266,50 L278,58" strokeDasharray="1 1.4" />
      </g>
    </g>
  );
}

/** Rosa dos ventos — dispositivo cartográfico clássico, reforça "isto é um
 * mapa", não um grafo de dependência com nomes em cima. */
function CompassRose({ x, y, size = 16 }: { x: number; y: number; size?: number }) {
  return (
    <g transform={`translate(${x},${y})`} opacity={0.55}>
      <circle r={size} fill="none" stroke="#5a4632" strokeWidth={0.5} />
      <path d={`M0,${-size} L${size * 0.22},0 L0,${size} L${-size * 0.22},0 Z`} fill="#5a4632" fillOpacity={0.5} />
      <path d={`M${-size},0 L0,${-size * 0.22} L${size},0 L0,${size * 0.22} Z`} fill="none" stroke="#5a4632" strokeWidth={0.4} />
      <text y={-size - 3} textAnchor="middle" fontSize={6} fill="#5a4632" fontFamily="Georgia, serif">N</text>
    </g>
  );
}

/**
 * Mapa místico real (Phase 3 §13) — composição de pergaminho: moldura do
 * Pack #5 como fundo, terreno desenhado em SVG por cima (nunca um PNG pronto
 * colado), estradas como traços curvos de tinta, nomes integrados
 * tipograficamente (Cinzel + sombra, não texto HTML solto). 4 estados
 * persistidos (desconhecido/conhecido/descoberto/visitado) + "atual"
 * derivado de `currentLocationId` em tempo de render.
 */
export function MapScreen() {
  const { save } = useGame();
  const [selectedId, setSelectedId] = useState<string | null>(save.currentLocationId);
  const selected = LOCATIONS.find((l) => l.id === selectedId);

  const stateOf = (id: string): LocationDiscoveryState => save.locationStates[id] ?? 'desconhecido';
  const TERRAIN: Record<string, 'village' | 'forest' | 'road' | 'fissure'> = {
    varreth: 'village',
    'borda-musgos': 'forest',
    'estrada-velha': 'road',
    fronteira: 'fissure',
  };

  return (
    <div className="screen">
      <div className="screen__backdrop" style={{ background: 'radial-gradient(140% 100% at 50% 10%, #1c1a28 0%, #100e18 55%, #08070f 100%)' }} />
      <div className="vignette" />
      <div className="screen__content">
        <h2 className="map-title">Cercanias de Varreth</h2>
        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-dim)', margin: '-6px 0 8px', fontStyle: 'italic' }}>Orren — a região que Ethurel já revelou até aqui.</p>

        <div className="map-parchment-wrap">
          <img className="map-parchment-frame" src={`${IMG}/map/parchment-frame.webp`} alt="" />
          <svg viewBox="0 0 300 190" width="100%" height="100%" className="map-svg" preserveAspectRatio="xMidYMid meet">
            <defs>
              <radialGradient id="map-node-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#c9973f" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#c9973f" stopOpacity="0" />
              </radialGradient>
              <filter id="map-label-shadow" x="-40%" y="-40%" width="180%" height="180%">
                <feDropShadow dx="0" dy="0.6" stdDeviation="0.5" floodColor="#f4e8c9" floodOpacity="0.9" />
              </filter>
            </defs>

            <TerrainPainting />

            {/* Estradas — traço duplo (linha cheia + traço central pontilhado),
                convenção cartográfica real, não uma linha de grafo genérica. */}
            {edgesFor(LOCATIONS).map(([a, b]) => {
              const dim = stateOf(a.id) === 'desconhecido' || stateOf(b.id) === 'desconhecido';
              const mx = (a.coordinates.x + b.coordinates.x) / 2;
              const my = (a.coordinates.y + b.coordinates.y) / 2 - 6;
              const d = `M${a.coordinates.x},${a.coordinates.y} Q${mx},${my} ${b.coordinates.x},${b.coordinates.y}`;
              return (
                <g key={`${a.id}-${b.id}`}>
                  <path d={d} fill="none" stroke="#6b5640" strokeOpacity={dim ? 0.15 : 0.5} strokeWidth={2.2} strokeLinecap="round" />
                  <path d={d} fill="none" stroke="#e8dcc0" strokeOpacity={dim ? 0.1 : 0.4} strokeWidth={0.6} strokeDasharray="2 2.4" />
                </g>
              );
            })}

            {LOCATIONS.map((loc) => {
              const state = stateOf(loc.id);
              const isCurrent = save.currentLocationId === loc.id;
              const cx = loc.coordinates.x;
              const cy = loc.coordinates.y;

              if (state === 'desconhecido') {
                return (
                  <g key={loc.id} opacity={0.35}>
                    <circle cx={cx} cy={cy} r={3} fill="none" stroke="#5a4632" strokeWidth={0.6} strokeDasharray="1 1.5" />
                    <text x={cx} y={cy - 8} textAnchor="middle" className="map-node-label map-node-label--unknown">?</text>
                  </g>
                );
              }

              const known = state === 'conhecido';
              return (
                <g
                  key={loc.id}
                  className={isCurrent ? 'map-node--current' : ''}
                  onClick={() => setSelectedId(loc.id)}
                  style={{ cursor: 'pointer' }}
                  opacity={known ? 0.55 : 1}
                >
                  {!known && <TerrainGlyph kind={TERRAIN[loc.id] ?? 'road'} cx={cx} cy={cy} />}
                  {isCurrent && <circle cx={cx} cy={cy} r={10} fill="url(#map-node-glow)" />}
                  <circle
                    className="map-node-core"
                    cx={cx}
                    cy={cy}
                    r={selectedId === loc.id ? 4.5 : 3.5}
                    fill={isCurrent ? '#c9973f' : '#7a5a3a'}
                    stroke="#2c2013"
                    strokeWidth={0.8}
                  />
                  <text x={cx} y={cy - 9} textAnchor="middle" filter="url(#map-label-shadow)" className="map-node-label" transform={`rotate(${labelTilt(loc.id)} ${cx} ${cy - 9})`}>
                    {loc.name}
                  </text>
                  {isCurrent && (
                    <text x={cx} y={cy + 22} textAnchor="middle" className="map-node-label map-node-label--here">você está aqui</text>
                  )}
                </g>
              );
            })}

            <CompassRose x={272} y={172} size={14} />
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
                <p className="slot-card__meta">{DANGER_LABEL[selected.danger]} · {stateLabel(stateOf(selected.id))}</p>
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

function stateLabel(state: LocationDiscoveryState): string {
  if (state === 'conhecido') return 'Conhecido de ouvir falar';
  if (state === 'descoberto') return 'Descoberto';
  if (state === 'visitado') return 'Visitado';
  return 'Desconhecido';
}

/** Pequena inclinação fixa por local (não randômica — precisa ser estável
 * entre renders) para o rótulo parecer desenhado à mão, não um <text> HTML
 * colado em cima do mapa. */
function labelTilt(locationId: string): number {
  let hash = 0;
  for (let i = 0; i < locationId.length; i++) hash = (hash * 31 + locationId.charCodeAt(i)) % 7;
  return hash - 3;
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
