import Phaser from 'phaser';

/**
 * Sprite do jogador — pixel art desenhada por código (ver
 * docs/design/05-DIRECAO-DE-ARTE.md §1: nenhum asset externo pôde ser obtido
 * nesta sessão por bloqueio de rede do ambiente; isto é placeholder autoral,
 * não um pack de terceiros). Ponto único de geração — trocar por
 * `scene.load.spritesheet(...)` aqui dentro é a única mudança necessária
 * quando houver um arquivo de asset real (ex.: Kenney Tiny Dungeon/Tiny Town,
 * CC0, se você puder enviar os arquivos).
 *
 * 8 frames num único atlas: idle (0-1), walk-down (2-3), walk-up (4-5),
 * walk-side (6-7, usado com flip horizontal para o lado oposto).
 */
export const PLAYER_TEXTURE_KEY = 'player-varreth';
export const PLAYER_FRAME_WIDTH = 18;
export const PLAYER_FRAME_HEIGHT = 28;

export const PLAYER_FRAMES = {
  idleA: 0,
  idleB: 1,
  walkDownA: 2,
  walkDownB: 3,
  walkUpA: 4,
  walkUpB: 5,
  walkSideA: 6,
  walkSideB: 7,
} as const;

type Facing = 'down' | 'up' | 'side';

function drawCharacterFrame(
  g: Phaser.GameObjects.Graphics,
  frameIndex: number,
  facing: Facing,
  legPhase: 0 | 1,
  bob: 0 | 1
): void {
  const ox = frameIndex * PLAYER_FRAME_WIDTH;
  const h = PLAYER_FRAME_HEIGHT;

  // sombra de contato
  g.fillStyle(0x0a0d09, 0.35);
  g.fillEllipse(ox + PLAYER_FRAME_WIDTH / 2, h - 2, 12, 4);

  // pernas (alternam para o ciclo de passo)
  const legLift = legPhase === 0 ? 0 : 2;
  g.fillStyle(0x2e2a22, 1);
  g.fillRect(ox + 6, h - 9 + legLift, 3, 7 - legLift);
  g.fillRect(ox + 10, h - 9 + (legPhase === 0 ? 2 : 0), 3, 7 - (legPhase === 0 ? 2 : 0));

  // manto/corpo (tom terroso âmbar da paleta — não cinza neutro)
  g.fillStyle(0x6b5230, 1);
  g.fillRect(ox + 4, h - 18 + bob, 11, 11);
  g.fillStyle(0x5a4326, 1); // dobra central do manto
  g.fillRect(ox + 9, h - 18 + bob, 1, 11);
  g.fillStyle(0x2e2a22, 1); // cinto
  g.fillRect(ox + 4, h - 10 + bob, 11, 1);

  // capuz (mais escuro que o manto)
  g.fillStyle(0x50432f, 1);
  g.fillRect(ox + 5, h - 25 + bob, 9, 7);
  g.fillStyle(0x3d3320, 1);
  g.fillRect(ox + 5, h - 25 + bob, 9, 2);

  if (facing === 'down') {
    g.fillStyle(0xd8c39a, 1);
    g.fillRect(ox + 7, h - 21 + bob, 5, 3);
  } else if (facing === 'side') {
    g.fillStyle(0xd8c39a, 1);
    g.fillRect(ox + 11, h - 20 + bob, 2, 2);
  }
  // facing 'up': só o capuz de costas, sem rosto — de propósito.

  // sigilo/destaque — âncora visual para futuramente refletir
  // CharacterAppearance.sigilAccent (src/player/types.ts), não implementado agora.
  g.fillStyle(0x8fae86, 1);
  g.fillRect(ox + 9, h - 15 + bob, 1, 1);
}

export function ensurePlayerTexture(scene: Phaser.Scene): void {
  if (scene.textures.exists(PLAYER_TEXTURE_KEY)) return;

  const g = scene.make.graphics({ x: 0, y: 0 }, false);

  drawCharacterFrame(g, PLAYER_FRAMES.idleA, 'down', 0, 0);
  drawCharacterFrame(g, PLAYER_FRAMES.idleB, 'down', 0, 1);
  drawCharacterFrame(g, PLAYER_FRAMES.walkDownA, 'down', 0, 0);
  drawCharacterFrame(g, PLAYER_FRAMES.walkDownB, 'down', 1, 0);
  drawCharacterFrame(g, PLAYER_FRAMES.walkUpA, 'up', 0, 0);
  drawCharacterFrame(g, PLAYER_FRAMES.walkUpB, 'up', 1, 0);
  drawCharacterFrame(g, PLAYER_FRAMES.walkSideA, 'side', 0, 0);
  drawCharacterFrame(g, PLAYER_FRAMES.walkSideB, 'side', 1, 0);

  const frameCount = Object.keys(PLAYER_FRAMES).length;
  g.generateTexture(PLAYER_TEXTURE_KEY, PLAYER_FRAME_WIDTH * frameCount, PLAYER_FRAME_HEIGHT);
  g.destroy();

  const tex = scene.textures.get(PLAYER_TEXTURE_KEY);
  for (let i = 0; i < frameCount; i++) {
    tex.add(i, 0, i * PLAYER_FRAME_WIDTH, 0, PLAYER_FRAME_WIDTH, PLAYER_FRAME_HEIGHT);
  }
}
