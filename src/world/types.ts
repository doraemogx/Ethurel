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
}

export interface WorldMapData {
  locations: Location[];
}
