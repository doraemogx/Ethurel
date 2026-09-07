/**
 * Identidade visual por classe (spec §17) — cada uma domina a tela
 * temporariamente quando selecionada/relevante (cor de destaque, motivo de
 * partícula, um verbo curto que descreve a textura visual). Isto é a
 * arquitetura de tema; um pass de arte final pode enriquecer sem mudar a
 * estrutura (spec §64 — nada aqui está hardcoded num componente).
 */
export interface ClassTheme {
  accent: string;
  accentSoft: string;
  glow: string;
  particleMotif: 'ash' | 'thread' | 'trail' | 'shadow' | 'stone' | 'moss' | 'sigil' | 'bone';
  motifLabel: string;
}

export const CLASS_THEMES: Record<string, ClassTheme> = {
  'portador-de-cinza': {
    accent: '#d9714f',
    accentSoft: '#f0a688',
    glow: 'rgba(217,113,79,0.35)',
    particleMotif: 'ash',
    motifLabel: 'cinzas e brasa contida',
  },
  'tecelao-do-veu': {
    accent: '#7f9fd9',
    accentSoft: '#aec3ec',
    glow: 'rgba(127,159,217,0.35)',
    particleMotif: 'thread',
    motifLabel: 'fios que dobram o espaço',
  },
  'cacador-de-fissuras': {
    accent: '#8fae86',
    accentSoft: '#b7d1ae',
    glow: 'rgba(143,174,134,0.35)',
    particleMotif: 'trail',
    motifLabel: 'rastros e fragmentos',
  },
  'lamina-silenciosa': {
    accent: '#8a6fae',
    accentSoft: '#b6a0d6',
    glow: 'rgba(138,111,174,0.35)',
    particleMotif: 'shadow',
    motifLabel: 'silhuetas que somem',
  },
  'guardiao-do-bastiao': {
    accent: '#a89a72',
    accentSoft: '#cabf9c',
    glow: 'rgba(168,154,114,0.35)',
    particleMotif: 'stone',
    motifLabel: 'pedra e runa defensiva',
  },
  'arauto-do-musgo': {
    accent: '#6fae7a',
    accentSoft: '#9fd1a8',
    glow: 'rgba(111,174,122,0.35)',
    particleMotif: 'moss',
    motifLabel: 'esporos e bioluminescência',
  },
  'andarilho-do-selo': {
    accent: '#c9a24a',
    accentSoft: '#e6c777',
    glow: 'rgba(201,162,74,0.35)',
    particleMotif: 'sigil',
    motifLabel: 'círculos e inscrições',
  },
  'lancador-de-ossos': {
    accent: '#c7bfa8',
    accentSoft: '#e3ddcc',
    glow: 'rgba(199,191,168,0.35)',
    particleMotif: 'bone',
    motifLabel: 'ossos e imprevisibilidade',
  },
};

export const DEFAULT_THEME: ClassTheme = {
  accent: '#c9973f',
  accentSoft: '#e3bd7d',
  glow: 'rgba(201,151,63,0.35)',
  particleMotif: 'sigil',
  motifLabel: 'mistério',
};

export function getClassTheme(classId?: string): ClassTheme {
  if (!classId) return DEFAULT_THEME;
  return CLASS_THEMES[classId] ?? DEFAULT_THEME;
}
