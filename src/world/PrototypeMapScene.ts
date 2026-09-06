import Phaser from 'phaser';
import { PlayerController } from '@/player/PlayerController';
import { loadOrCreateSave, persistPlayerState } from '@/save/gameSave';
import { DEFAULT_SPAWN, PROTOTYPE_MAP_ID, type SaveDataV2 } from '@/save/schema';
import { GAME_ZOOM, LOGICAL_HEIGHT, LOGICAL_WIDTH, TILE_SIZE } from '@/core/config';

const MAP_WIDTH_TILES = 30;
const MAP_HEIGHT_TILES = 20;
const TILESET_KEY = 'tileset-proto';
const SAVE_THROTTLE_MS = 500;

const FLOOR_TILE = 0;
const WALL_TILE = 1;

/**
 * Tileset gerado por código — placeholder de PROTÓTIPO (movimento/colisão/câmera),
 * não arte final. Pixel art definitiva é trabalho da Fase 3/8
 * (docs/design/04-VERTICAL-SLICE-E-ROADMAP.md).
 */
function ensureTilesetTexture(scene: Phaser.Scene): void {
  if (scene.textures.exists(TILESET_KEY)) return;

  const g = scene.make.graphics({ x: 0, y: 0 }, false);

  // tile 0: piso (verde musgo dessaturado, com leve textura)
  g.fillStyle(0x3a4a34, 1);
  g.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
  g.fillStyle(0x445a3d, 1);
  g.fillRect(2, 2, 3, 3);
  g.fillRect(9, 6, 3, 3);
  g.fillRect(5, 11, 3, 3);

  // tile 1: parede (pedra)
  g.fillStyle(0x55534d, 1);
  g.fillRect(TILE_SIZE, 0, TILE_SIZE, TILE_SIZE);
  g.fillStyle(0x3f3d38, 1);
  g.fillRect(TILE_SIZE, TILE_SIZE - 2, TILE_SIZE, 2);
  g.fillRect(TILE_SIZE + TILE_SIZE / 2 - 1, 0, 2, TILE_SIZE);

  g.generateTexture(TILESET_KEY, TILE_SIZE * 2, TILE_SIZE);
  g.destroy();
}

function buildMapData(): number[][] {
  const data: number[][] = [];
  for (let y = 0; y < MAP_HEIGHT_TILES; y++) {
    const row: number[] = [];
    for (let x = 0; x < MAP_WIDTH_TILES; x++) {
      const isBorder = x === 0 || y === 0 || x === MAP_WIDTH_TILES - 1 || y === MAP_HEIGHT_TILES - 1;
      row.push(isBorder ? WALL_TILE : FLOOR_TILE);
    }
    data.push(row);
  }

  // Obstáculos interiores simples, só para exercitar colisão além das bordas.
  const obstacles: [number, number][] = [
    [6, 6], [7, 6], [6, 7],
    [15, 10], [16, 10], [15, 11], [16, 11],
    [22, 5], [22, 6], [22, 7],
    [10, 15], [11, 15], [12, 15],
  ];
  for (const [ox, oy] of obstacles) data[oy][ox] = WALL_TILE;

  return data;
}

/**
 * Cena única da Fase 2 — protótipo de movimento. Prova mapa em tiles + colisão
 * + câmera pixel-perfect + controles (teclado/touch) + save de posição/mapa
 * atual. NÃO é Varreth, não tem NPC, quest ou combate — isso é escopo das
 * Fases 3+ (docs/design/04-VERTICAL-SLICE-E-ROADMAP.md).
 */
export class PrototypeMapScene extends Phaser.Scene {
  private player!: PlayerController;
  private save!: SaveDataV2;
  private saveTimer = 0;
  private visibilityHandler = (): void => {
    if (document.visibilityState === 'hidden') this.forceSave();
  };

  constructor() {
    super('PrototypeMapScene');
  }

  create(): void {
    this.save = loadOrCreateSave();
    ensureTilesetTexture(this);

    const mapData = buildMapData();
    const map = this.make.tilemap({ data: mapData, tileWidth: TILE_SIZE, tileHeight: TILE_SIZE });
    const tileset = map.addTilesetImage(TILESET_KEY, TILESET_KEY, TILE_SIZE, TILE_SIZE, 0, 0)!;
    const layer = map.createLayer(0, tileset, 0, 0)!;
    layer.setCollision(WALL_TILE);

    const worldWidth = MAP_WIDTH_TILES * TILE_SIZE;
    const worldHeight = MAP_HEIGHT_TILES * TILE_SIZE;
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

    const spawn =
      this.save.player.mapId === PROTOTYPE_MAP_ID
        ? { x: this.save.player.x, y: this.save.player.y }
        : { x: DEFAULT_SPAWN.x, y: DEFAULT_SPAWN.y };

    this.player = new PlayerController(this, spawn.x, spawn.y, LOGICAL_WIDTH, LOGICAL_HEIGHT);
    this.physics.add.collider(this.player.sprite, layer);

    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.startFollow(this.player.sprite, true, 0.12, 0.12);
    this.cameras.main.setDeadzone(24, 16);
    this.cameras.main.roundPixels = true;

    this.add
      .text(
        4,
        4,
        `Fase 2 — protótipo (hipótese visual)\nres ${LOGICAL_WIDTH}x${LOGICAL_HEIGHT} · tile ${TILE_SIZE}px · zoom ${GAME_ZOOM}x`,
        { fontFamily: 'sans-serif', fontSize: '6px', color: '#e8dcc4' }
      )
      .setScrollFactor(0)
      .setDepth(2000)
      .setAlpha(0.85);

    document.addEventListener('visibilitychange', this.visibilityHandler);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
      this.player.destroy();
    });
  }

  private forceSave(): void {
    persistPlayerState(this.save, {
      mapId: PROTOTYPE_MAP_ID,
      x: Math.round(this.player.sprite.x),
      y: Math.round(this.player.sprite.y),
    });
  }

  update(_time: number, delta: number): void {
    this.player.update(delta);

    this.saveTimer += delta;
    if (this.saveTimer >= SAVE_THROTTLE_MS) {
      this.saveTimer = 0;
      this.forceSave();
    }
  }
}
