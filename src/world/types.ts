export interface MapNode {
  id: string;
  name: string;
  /** Coordenadas de referência para o mapa-múndi abstrato (não o tilemap jogável). */
  x: number;
  y: number;
}

export type MapEdge = [string, string];

export type DiscoveryState = 'conhecido' | 'visitado';

export interface WorldMapData {
  nodes: MapNode[];
  edges: MapEdge[];
  defaultKnown: Record<string, DiscoveryState>;
}
