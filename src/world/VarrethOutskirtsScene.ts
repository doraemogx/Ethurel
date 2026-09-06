import Phaser from 'phaser';
import { PlayerController } from '@/player/PlayerController';
import { loadOrCreateSave, persistPlayerState } from '@/save/gameSave';
import { DEFAULT_SPAWN, VARRETH_OUTSKIRTS_MAP_ID, type SaveDataV2 } from '@/save/schema';
import { GAME_ZOOM, LOGICAL_HEIGHT, LOGICAL_WIDTH, TILE_SIZE } from '@/core/config';

const MAP_WIDTH_TILES = 30;
const MAP_HEIGHT_TILES = 20;
const GROUND_TILESET_KEY = 'ground-varreth';
const SAVE_THROTTLE_MS = 500;

const GRASS_A = 0;
const GRASS_B = 1;
const PATH_TILE = 2;

/**
 * Primeiro microambiente visual de Ethurel — arredores de Varreth (uma
 * clareira pequena, não a vila inteira). Ver docs/design/05-DIRECAO-DE-ARTE.md
 * e docs/design/06-WORLD-NARRATIVE-BIBLE.md §2 para o que isto representa (e
 * não representa ainda) narrativamente.
 *
 * Ainda é pixel art gerada por código (sem assets externos — motivo
 * documentado em 05-DIRECAO-DE-ARTE.md §1), mas com paleta, variação de tile,
 * borda natural (árvores/rochas em vez de parede de blocos), profundidade
 * (Y-sorting) e um aceno discreto a Arcane, em vez do mapa de teste da Fase 2.
 */

function ensureGroundTileset(scene: Phaser.Scene): void {
  if (scene.textures.exists(GROUND_TILESET_KEY)) return;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);

  // GRASS_A — verde-musgo base
  g.fillStyle(0x3a4a34, 1);
  g.fillRect(GRASS_A * TILE_SIZE, 0, TILE_SIZE, TILE_SIZE);
  g.fillStyle(0x445a3d, 1);
  g.fillRect(GRASS_A * TILE_SIZE + 2, 2, 3, 3);
  g.fillRect(GRASS_A * TILE_SIZE + 9, 6, 3, 3);
  g.fillRect(GRASS_A * TILE_SIZE + 5, 11, 3, 3);

  // GRASS_B — variante mais escura/quente, evita leitura de grade repetida
  g.fillStyle(0x354330, 1);
  g.fillRect(GRASS_B * TILE_SIZE, 0, TILE_SIZE, TILE_SIZE);
  g.fillStyle(0x4a5c3f, 1);
  g.fillRect(GRASS_B * TILE_SIZE + 6, 3, 2, 2);
  g.fillRect(GRASS_B * TILE_SIZE + 2, 9, 2, 2);
  g.fillRect(GRASS_B * TILE_SIZE + 11, 10, 2, 2);
  g.fillStyle(0x2e3a2a, 1);
  g.fillRect(GRASS_B * TILE_SIZE + 8, 8, 2, 2);

  // PATH_TILE — terra batida
  g.fillStyle(0x6b5a3f, 1);
  g.fillRect(PATH_TILE * TILE_SIZE, 0, TILE_SIZE, TILE_SIZE);
  g.fillStyle(0x5c4c35, 1);
  g.fillRect(PATH_TILE * TILE_SIZE + 3, 4, 2, 2);
  g.fillRect(PATH_TILE * TILE_SIZE + 10, 9, 2, 2);
  g.fillStyle(0x7d6a4a, 1);
  g.fillRect(PATH_TILE * TILE_SIZE + 7, 12, 2, 2);

  g.generateTexture(GROUND_TILESET_KEY, TILE_SIZE * 3, TILE_SIZE);
  g.destroy();
}

const DECO = {
  tree: { key: 'deco-tree', w: 22, h: 34 },
  rock: { key: 'deco-rock', w: 14, h: 10 },
  hut: { key: 'deco-hut', w: 42, h: 38 },
  arcaneStone: { key: 'deco-arcane-stone', w: 12, h: 14 },
} as const;

function ensureDecorTextures(scene: Phaser.Scene): void {
  // Árvore: copa irregular (não círculo perfeito) + tronco.
  if (!scene.textures.exists(DECO.tree.key)) {
    const g = scene.make.graphics({ x: 0, y: 0 }, false);
    const { w, h } = DECO.tree;
    g.fillStyle(0x241d14, 0.35);
    g.fillEllipse(w / 2, h - 2, 14, 4); // sombra de contato
    g.fillStyle(0x4a3826, 1);
    g.fillRect(w / 2 - 3, h - 14, 6, 12); // tronco
    g.fillStyle(0x2f4a2c, 1);
    g.fillEllipse(w / 2, h - 20, 20, 16);
    g.fillEllipse(w / 2 - 7, h - 16, 12, 10);
    g.fillEllipse(w / 2 + 8, h - 17, 13, 11);
    g.fillStyle(0x3d5c37, 1);
    g.fillEllipse(w / 2 - 3, h - 24, 12, 9);
    g.fillEllipse(w / 2 + 6, h - 23, 9, 8);
    g.generateTexture(DECO.tree.key, w, h);
    g.destroy();
  }

  // Rocha: aglomerado simples, tom de pedra da paleta.
  if (!scene.textures.exists(DECO.rock.key)) {
    const g = scene.make.graphics({ x: 0, y: 0 }, false);
    const { w, h } = DECO.rock;
    g.fillStyle(0x241d14, 0.3);
    g.fillEllipse(w / 2, h - 1, 10, 3);
    g.fillStyle(0x55534d, 1);
    g.fillEllipse(w / 2, h - 5, w - 2, h - 3);
    g.fillStyle(0x6a675e, 1);
    g.fillEllipse(w / 2 - 2, h - 7, 6, 5);
    g.generateTexture(DECO.rock.key, w, h);
    g.destroy();
  }

  // Cabana: silhueta rústica de madeira/palha — assentamento de fronteira.
  if (!scene.textures.exists(DECO.hut.key)) {
    const g = scene.make.graphics({ x: 0, y: 0 }, false);
    const { w, h } = DECO.hut;
    g.fillStyle(0x241d14, 0.3);
    g.fillEllipse(w / 2, h - 1, 34, 5);
    // corpo
    g.fillStyle(0x5a4530, 1);
    g.fillRect(4, h - 20, w - 8, 18);
    g.fillStyle(0x4a3826, 1);
    g.fillRect(4, h - 20, w - 8, 3);
    // porta
    g.fillStyle(0x241d14, 1);
    g.fillRect(w / 2 - 5, h - 12, 10, 12);
    // telhado (triângulo de palha)
    g.fillStyle(0x7a6a3f, 1);
    g.fillTriangle(0, h - 18, w, h - 18, w / 2, h - 36);
    g.fillStyle(0x6a5c35, 1);
    g.fillTriangle(0, h - 18, w / 2, h - 18, w / 2, h - 36);
    g.generateTexture(DECO.hut.key, w, h);
    g.destroy();
  }

  // Pedra com veio de Arcane — aceno discreto, orgânico (nunca elétrico/roxo).
  if (!scene.textures.exists(DECO.arcaneStone.key)) {
    const g = scene.make.graphics({ x: 0, y: 0 }, false);
    const { w, h } = DECO.arcaneStone;
    g.fillStyle(0x241d14, 0.3);
    g.fillEllipse(w / 2, h - 1, 10, 3);
    g.fillStyle(0x4a4a42, 1);
    g.fillEllipse(w / 2, h - 6, w - 2, h - 4);
    g.fillStyle(0x6fae7a, 0.85); // veio bioluminescente esverdeado
    g.fillRect(w / 2 - 1, 2, 2, h - 8);
    g.generateTexture(DECO.arcaneStone.key, w, h);
    g.destroy();
  }
}

function buildGroundData(pathTiles: Set<string>): number[][] {
  const data: number[][] = [];
  for (let y = 0; y < MAP_HEIGHT_TILES; y++) {
    const row: number[] = [];
    for (let x = 0; x < MAP_WIDTH_TILES; x++) {
      if (pathTiles.has(`${x},${y}`)) {
        row.push(PATH_TILE);
        continue;
      }
      // Alternância pseudo-aleatória determinística — evita leitura de grade.
      const hash = (x * 928371 + y * 123457) % 5;
      row.push(hash === 0 ? GRASS_B : GRASS_A);
    }
    data.push(row);
  }
  return data;
}

function buildPathTiles(): Set<string> {
  const tiles = new Set<string>();
  for (let x = 1; x <= 18; x++) {
    tiles.add(`${x},9`);
    tiles.add(`${x},10`);
  }
  for (let y = 9; y <= 15; y++) {
    tiles.add(`17,${y}`);
    tiles.add(`18,${y}`);
  }
  return tiles;
}

export class VarrethOutskirtsScene extends Phaser.Scene {
  private player!: PlayerController;
  private save!: SaveDataV2;
  private saveTimer = 0;
  private visibilityHandler = (): void => {
    if (document.visibilityState === 'hidden') this.forceSave();
  };

  constructor() {
    super('VarrethOutskirtsScene');
  }

  create(): void {
    this.save = loadOrCreateSave();
    ensureGroundTileset(this);
    ensureDecorTextures(this);

    const pathTiles = buildPathTiles();
    const groundData = buildGroundData(pathTiles);
    const map = this.make.tilemap({ data: groundData, tileWidth: TILE_SIZE, tileHeight: TILE_SIZE });
    const tileset = map.addTilesetImage(GROUND_TILESET_KEY, GROUND_TILESET_KEY, TILE_SIZE, TILE_SIZE, 0, 0)!;
    map.createLayer(0, tileset, 0, 0);

    const worldWidth = MAP_WIDTH_TILES * TILE_SIZE;
    const worldHeight = MAP_HEIGHT_TILES * TILE_SIZE;
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

    const decorGroup = this.physics.add.staticGroup();
    this.placeDecor(decorGroup, pathTiles);

    const spawn =
      this.save.player.mapId === VARRETH_OUTSKIRTS_MAP_ID
        ? { x: this.save.player.x, y: this.save.player.y }
        : { x: DEFAULT_SPAWN.x, y: DEFAULT_SPAWN.y };

    this.player = new PlayerController(this, spawn.x, spawn.y, LOGICAL_WIDTH, LOGICAL_HEIGHT);
    this.physics.add.collider(this.player.sprite, decorGroup);

    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.startFollow(this.player.sprite, true, 0.12, 0.12);
    this.cameras.main.setDeadzone(24, 16);
    this.cameras.main.roundPixels = true;

    this.add
      .text(4, 4, `Ethurel — arredores de Varreth (protótipo visual)\nres ${LOGICAL_WIDTH}x${LOGICAL_HEIGHT} · tile ${TILE_SIZE}px · zoom ${GAME_ZOOM}x`, {
        fontFamily: 'sans-serif',
        fontSize: '6px',
        color: '#e8dcc4',
      })
      .setScrollFactor(0)
      .setDepth(2000)
      .setAlpha(0.85);

    document.addEventListener('visibilitychange', this.visibilityHandler);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
      this.player.destroy();
    });
  }

  private placeDecor(decorGroup: Phaser.Physics.Arcade.StaticGroup, pathTiles: Set<string>): void {
    const isPath = (tx: number, ty: number) => pathTiles.has(`${tx},${ty}`);
    const toWorld = (tx: number, ty: number) => ({ x: tx * TILE_SIZE + TILE_SIZE / 2, y: ty * TILE_SIZE + TILE_SIZE });

    const addCollidable = (key: string, tx: number, ty: number, bodyW: number, bodyH: number): void => {
      const { x, y } = toWorld(tx, ty);
      const obj = decorGroup.create(x, y, key) as Phaser.Physics.Arcade.Sprite;
      obj.setOrigin(0.5, 1);
      obj.setDepth(y);
      const body = obj.body as Phaser.Physics.Arcade.StaticBody;
      body.setSize(bodyW, bodyH);
      body.setOffset((obj.width - bodyW) / 2, obj.height - bodyH);
      body.updateFromGameObject();
    };

    // Borda natural (árvores/rochas), pulando a entrada do caminho e a área do rio de tiles do caminho.
    for (let tx = 0; tx < MAP_WIDTH_TILES; tx += 2) {
      if (!isPath(tx, 0)) addCollidable(DECO.tree.key, tx, 0, 8, 8);
      if (!isPath(tx, MAP_HEIGHT_TILES - 1)) addCollidable(DECO.tree.key, tx, MAP_HEIGHT_TILES - 1, 8, 8);
    }
    for (let ty = 1; ty < MAP_HEIGHT_TILES - 1; ty += 2) {
      if (!isPath(0, ty)) addCollidable(DECO.tree.key, 0, ty, 8, 8);
      if (!isPath(MAP_WIDTH_TILES - 1, ty)) addCollidable(DECO.tree.key, MAP_WIDTH_TILES - 1, ty, 8, 8);
    }

    // Aglomerados interiores (evitando o caminho), para variar a silhueta sem virar labirinto.
    const interiorTrees: [number, number][] = [
      [6, 4], [7, 5], [22, 5], [23, 6], [5, 15], [6, 16], [24, 13], [25, 14],
    ];
    for (const [tx, ty] of interiorTrees) addCollidable(DECO.tree.key, tx, ty, 8, 8);

    const rocks: [number, number][] = [
      [10, 4], [12, 16], [22, 16], [4, 12],
    ];
    for (const [tx, ty] of rocks) addCollidable(DECO.rock.key, tx, ty, 8, 5);

    // Cabana — ponto de referência de "assentamento", não interior jogável ainda.
    addCollidable(DECO.hut.key, 19, 16, 20, 10);

    // Aceno discreto de Arcane, perto da cabana mas fora do caminho direto.
    const arcaneTile = { x: 21, y: 14 };
    const arcaneWorld = toWorld(arcaneTile.x, arcaneTile.y);
    const stone = this.add.image(arcaneWorld.x, arcaneWorld.y, DECO.arcaneStone.key).setOrigin(0.5, 1);
    stone.setDepth(arcaneWorld.y);
    const glow = this.add.circle(arcaneWorld.x, arcaneWorld.y - 8, 6, 0x6fae7a, 0.35);
    glow.setDepth(arcaneWorld.y + 0.1);
    glow.setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: glow, alpha: 0.12, scale: 1.3, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  private forceSave(): void {
    persistPlayerState(this.save, {
      mapId: VARRETH_OUTSKIRTS_MAP_ID,
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
