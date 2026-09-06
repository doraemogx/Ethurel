/**
 * Semente do mapa-múndi abstrato, preservada do handoff (Parte 22) — usada para
 * a visão geral de mundo (overlay de mapa), não para o tilemap jogável de Varreth
 * (esse é conteúdo de tiles real, construído nas Fases 2-3). Não expandir estes
 * nós além do que já existia na v1 sem decisão explícita — a vertical slice cobre
 * só Varreth + Estrada Velha.
 */
import type { WorldMapData } from '@/world/types';

export const WORLD_MAP: WorldMapData = {
  nodes: [
    { id: 'varreth', name: 'Varreth', x: 150, y: 130 },
    { id: 'borda-musgos', name: 'Borda dos Musgos', x: 70, y: 75 },
    { id: 'estrada-velha', name: 'Estrada Velha', x: 225, y: 150 },
    { id: 'fronteira', name: 'Fronteira Partida', x: 255, y: 45 },
  ],
  edges: [
    ['varreth', 'borda-musgos'],
    ['varreth', 'estrada-velha'],
    ['estrada-velha', 'fronteira'],
  ],
  defaultKnown: {
    varreth: 'visitado',
    'borda-musgos': 'conhecido',
  },
};
