/**
 * Locais preservados do cânone (docs/design/06-WORLD-NARRATIVE-BIBLE.md §2) —
 * não expandir além do que já existia sem decisão explícita. Descrições são
 * curtas de propósito (spec §25) — a IA/narrativa preenche atmosfera cena a
 * cena, isto é só o registro de mundo.
 *
 * `region` = macrotterritório canônico (Bíblia V7, Livro 0.03 — Veyra,
 * Orren, Liga de Sarn, Domínios de Elnor, Marchas Bastião, Fronteira
 * Partida, Cinzas Longas, Terras de Selka). Varreth é confirmada canônica em
 * "Orren" (Livro III.007-012: "Varreth, em Orren..."); "Borda dos Musgos" e
 * "Estrada Velha" NÃO são macrotérritórios na V7 (0 ocorrências), mas também
 * não são contraditas por ela — a Bíblia não descreve microgeografia dentro
 * de Orren, então sobrevivem como nome de microrregião/localidade dentro de
 * Orren (CANON MACRO > conteúdo legado; legado incorporado como detalhe
 * local quando não contradiz o cânone). Resolução completa e fontes citadas
 * em docs/canon/geography/orren-varreth-resolution.md e
 * docs/canon/CANON_CONFLICTS.md §1 (RESOLVIDO).
 */
import type { Location } from '@/world/types';

export const LOCATIONS: Location[] = [
  {
    id: 'varreth',
    name: 'Varreth',
    region: 'Orren',
    description: 'O povoado onde a campanha começa. Pedra, madeira, luzes quentes contra o frio da fronteira.',
    connections: ['borda-musgos', 'estrada-velha'],
    danger: 'nenhum',
    ambientProfile: 'village',
    coordinates: { x: 150, y: 130 },
  },
  {
    id: 'borda-musgos',
    name: 'Borda dos Musgos',
    region: 'Orren',
    description: 'A região de fronteira onde Varreth fica — floresta, névoa, musgo sobre pedra antiga.',
    connections: ['varreth'],
    danger: 'baixo',
    ambientProfile: 'forest',
    coordinates: { x: 70, y: 75 },
  },
  {
    id: 'estrada-velha',
    name: 'Estrada Velha',
    region: 'Orren',
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
