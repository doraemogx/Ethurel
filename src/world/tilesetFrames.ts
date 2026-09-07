import Phaser from 'phaser';

/**
 * `tileset.png` (ansimuz, CC0 — ver CREDITS.md) é uma composição de amostra
 * pré-arranjada, não uma grade uniforme indexável por frameWidth/frameHeight
 * fixo — os elementos têm tamanhos diferentes (casa, árvores, caminho).
 * Por isso registramos frames NOMEADOS em retângulos de pixel exatos
 * (medidos por inspeção direta do arquivo — ver processo em CREDITS.md),
 * em vez de tentar forçar um grid. Mesma técnica de "não assumir o
 * grid", só que com retângulos arbitrários no lugar de índices de grade.
 */
export const TILESET_KEY = 'ansimuz-tileset';
export const TILESET_URL = 'assets/ansimuz/tileset.png';

export const TILESET_FRAMES = {
  cottage: { x: 272, y: 8, w: 72, h: 136 },
  pathCross: { x: 224, y: 128, w: 110, h: 80 },
  pineCluster: { x: 74, y: 18, w: 54, h: 101 },
  pinePair: { x: 74, y: 18, w: 28, h: 101 },
} as const;

export function ensureTilesetFrames(scene: Phaser.Scene): void {
  const texture = scene.textures.get(TILESET_KEY);
  for (const [name, rect] of Object.entries(TILESET_FRAMES)) {
    if (!texture.has(name)) texture.add(name, 0, rect.x, rect.y, rect.w, rect.h);
  }
}
