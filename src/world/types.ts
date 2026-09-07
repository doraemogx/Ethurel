/**
 * Location — mapa de regiões/locais narrativos (spec §35). NÃO é um
 * tilemap navegável em tempo real; é um grafo de locais que aparecem
 * conforme descobertos, navegado por escolha ("viajar para X"), podendo
 * consumir tempo/gerar evento/encontro.
 */
export type AmbientProfile = 'forest' | 'village' | 'road' | 'cave' | 'fissure' | 'ashlands' | 'archive';

export interface Location {
  id: string;
  name: string;
  region: string;
  description: string;
  /** Chave de artwork/gradiente atmosférico — ver src/ui/visual/sceneArt.ts.
   * Ausente = fallback atmosférico genérico da região. */
  artwork?: string;
  connections: string[];
  danger: 'nenhum' | 'baixo' | 'moderado' | 'alto';
  ambientProfile: AmbientProfile;
  /** Posição no mapa místico (viewBox 300×190) — coordenadas recuperadas do
   * `MAP_NODES` do Artifact antigo, ver docs/design/11-LEGACY-RECOVERY.md. */
  coordinates: { x: number; y: number };
}

export interface WorldMapData {
  locations: Location[];
}
