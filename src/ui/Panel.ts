import Phaser from 'phaser';

/**
 * Painel de UI desenhado por código (Phaser.Graphics) — não colagem de
 * terceiros. Ver CREDITS.md: o UI kit recebido (Free RPG UI Kit) foi
 * inspecionado e rejeitado por incompatibilidade visual (renders com
 * antialiasing suave e texto decorativo incoerente embutido), não por
 * licença. Paleta reaproveitada do overlay de rotação já estabelecido
 * (index.html): fundo #141a17, borda #c9b98a, texto #e8dcc4.
 */
const PANEL_BG = 0x1c2420;
const PANEL_BORDER = 0xc9b98a;
const PANEL_BORDER_INNER = 0x6b5a3a;

export function drawPanel(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  width: number,
  height: number,
  alpha = 0.94
): void {
  g.fillStyle(PANEL_BG, alpha);
  g.fillRect(x, y, width, height);
  g.lineStyle(2, PANEL_BORDER, 1);
  g.strokeRect(x + 1, y + 1, width - 2, height - 2);
  g.lineStyle(1, PANEL_BORDER_INNER, 0.8);
  g.strokeRect(x + 3, y + 3, width - 6, height - 6);
}

export function drawButton(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  width: number,
  height: number,
  highlighted = false
): void {
  g.fillStyle(highlighted ? 0x3a4a34 : 0x262e28, 0.96);
  g.fillRoundedRect(x, y, width, height, 4);
  g.lineStyle(1.5, highlighted ? 0xa8c98a : PANEL_BORDER, 1);
  g.strokeRoundedRect(x, y, width, height, 4);
}
