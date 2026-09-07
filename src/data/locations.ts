/**
 * Locais preservados do cânone (docs/design/06-WORLD-NARRATIVE-BIBLE.md §2) —
 * não expandir além do que já existia sem decisão explícita. Descrições são
 * curtas de propósito (spec §25) — a IA/narrativa preenche atmosfera cena a
 * cena, isto é só o registro de mundo.
 */
import type { Location } from '@/world/types';

export const LOCATIONS: Location[] = [
  {
    id: 'varreth',
    name: 'Varreth',
    region: 'Borda dos Musgos',
    description: 'O povoado onde a campanha começa. Pedra, madeira, luzes quentes contra o frio da fronteira.',
    connections: ['borda-musgos', 'estrada-velha'],
    danger: 'nenhum',
    ambientProfile: 'village',
    coordinates: { x: 150, y: 130 },
  },
  {
    id: 'borda-musgos',
    name: 'Borda dos Musgos',
    region: 'Borda dos Musgos',
    description: 'A região de fronteira onde Varreth fica — floresta, névoa, musgo sobre pedra antiga.',
    connections: ['varreth'],
    danger: 'baixo',
    ambientProfile: 'forest',
    coordinates: { x: 70, y: 75 },
  },
  {
    id: 'estrada-velha',
    name: 'Estrada Velha',
    region: 'Borda dos Musgos',
    description: 'Rota a leste de Varreth — pedra rachada, marcos apagados, poucos viajantes.',
    connections: ['varreth', 'fronteira'],
    danger: 'moderado',
    ambientProfile: 'road',
    coordinates: { x: 225, y: 150 },
  },
  {
    id: 'fronteira',
    name: 'Fronteira Partida',
    region: 'Fronteira Partida',
    description: 'Região isolada por uma fissura arcana permanente — o ar aqui não se comporta direito.',
    connections: ['estrada-velha'],
    danger: 'alto',
    ambientProfile: 'fissure',
    coordinates: { x: 255, y: 45 },
  },
];
