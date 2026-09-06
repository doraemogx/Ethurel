import Phaser from 'phaser';
import { PlayerController } from '@/player/PlayerController';
import { loadOrCreateSave, persistPlayerState } from '@/save/gameSave';
import { DEFAULT_SPAWN, VARRETH_OUTSKIRTS_MAP_ID, type SaveDataV2 } from '@/save/schema';
import { GAME_ZOOM, TILE_SIZE } from '@/core/config';

const MAP_WIDTH_TILES = 30;
const MAP_HEIGHT_TILES = 20;
const SAVE_THROTTLE_MS = 500;

/**
 * Kenney "Tiny Town" (CC0) — tileset 12×11, 16×16px, empacotado sem espaçamento.
 * Ver CREDITS.md para licença/proveniência completas. Índices conferidos por
 * inspeção visual direta do arquivo recebido (linha-major, 12 colunas).
 */
const TILESET_KEY = 'kenney-tinytown';
const TILESET_URL = 'assets/kenney/tinytown_tilemap_packed.png';

const TILE = {
  grass: 0,
  grassFlowerSmall: 1,
  grassFlowerBig: 2,
  grassPebbles: 43,
  pathPlain: 39,
  pathPlainAlt: 40,
  // 3/4 são só a metade superior (copa) de árvores de 2 tiles — sozinhos
  // ficam com aparência de "arco oco". 5 é um arbusto completo num único
  // tile; 29 é um par de cogumelos, também completo.
  bushRound: 5,
  mushrooms: 29,
} as const;

const DECO_TEXTURES = {
  /** Aglomerado de mata 3×3 (não é "uma árvore grande" — é um grupo de várias
   * árvores pequenas pré-composto pelo próprio pack). Bom para borda densa de
   * floresta; ruim isolado (fica com buracos entre as copas). Usado só na
   * borda da clareira. */
  bigPine: 'deco-kt-big-pine',
  bigAutumn: 'deco-kt-big-autumn',
  /** Árvore única de verdade: copa (topo) + tronco (base), 1 tile de largura
   * por 2 de altura — verificado isoladamente antes de usar (copa+base
   * corretas: 3+15 e 4+16; 3+27/4+28 ficam com a junção quebrada). Usada para
   * árvores isoladas dentro da clareira. */
  treeOrange: 'deco-kt-tree-orange',
  treeGreen: 'deco-kt-tree-green',
  hut: 'deco-kt-hut',
} as const;

/**
 * Primeiro microambiente visual de Ethurel — arredores de Varreth (uma
 * clareira pequena, não a vila inteira). Ver docs/design/05-DIRECAO-DE-ARTE.md
 * e docs/design/06-WORLD-NARRATIVE-BIBLE.md §2 para o que isto representa (e
 * não representa ainda) narrativamente.
 *
 * Terreno e decoração agora vêm do Kenney Tiny Town (CC0, ver CREDITS.md) em
 * vez de pixel art gerada por código — árvores grandes e a cabana são
 * composições de tiles originais do próprio pack (RenderTexture), não tiles
 * redesenhados. A pedra com veio de Arcane continua procedural, de propósito
 * (nenhum pack recebido tem um elemento apropriado para isso).
 */

function ensureDecorComposites(scene: Phaser.Scene): void {
  const drawFrameAt = (rt: Phaser.GameObjects.RenderTexture, frame: number, x: number, y: number): void => {
    const tmp = scene.add.image(0, 0, TILESET_KEY, frame).setOrigin(0, 0).setVisible(false);
    rt.draw(tmp, x, y);
    tmp.destroy();
  };

  const composite = (
    key: string,
    layout: { frame: number; x: number; y: number }[],
    width: number,
    height: number = width
  ): void => {
    if (scene.textures.exists(key)) return;
    const rt = scene.make.renderTexture({ width, height }, false);
    for (const { frame, x, y } of layout) drawFrameAt(rt, frame, x, y);
    rt.saveTexture(key);
    rt.destroy();
  };

  // Árvore grande — composta a partir do bloco de pinheiro 3×3 do próprio
  // tileset (índices 6,7,8 / 18,19,20 / 30,31,32), dando escala real de
  // "árvore mais alta que o personagem/cabana", não um tile solto de 16px.
  composite(
    DECO_TEXTURES.bigPine,
    [
      { frame: 6, x: 0, y: 0 }, { frame: 7, x: 16, y: 0 }, { frame: 8, x: 32, y: 0 },
      { frame: 18, x: 0, y: 16 }, { frame: 19, x: 16, y: 16 }, { frame: 20, x: 32, y: 16 },
      { frame: 30, x: 0, y: 32 }, { frame: 31, x: 16, y: 32 }, { frame: 32, x: 32, y: 32 },
    ],
    48
  );

  // Variante outonal (índices 9,10,11 / 21,22,23 / 33,34,35), para não repetir
  // sempre a mesma árvore na borda da clareira.
  composite(
    DECO_TEXTURES.bigAutumn,
    [
      { frame: 9, x: 0, y: 0 }, { frame: 10, x: 16, y: 0 }, { frame: 11, x: 32, y: 0 },
      { frame: 21, x: 0, y: 16 }, { frame: 22, x: 16, y: 16 }, { frame: 23, x: 32, y: 16 },
      { frame: 33, x: 0, y: 32 }, { frame: 34, x: 16, y: 32 }, { frame: 35, x: 32, y: 32 },
    ],
    48
  );

  // Árvore única (verificada isoladamente antes de usar — ver nota em DECO_TEXTURES).
  composite(DECO_TEXTURES.treeOrange, [{ frame: 3, x: 0, y: 0 }, { frame: 15, x: 0, y: 16 }], 16, 32);
  composite(DECO_TEXTURES.treeGreen, [{ frame: 4, x: 0, y: 0 }, { frame: 16, x: 0, y: 16 }], 16, 32);

  // Cabana — telhado (48 = telha, 63 = empena/gable centralizada) sobre
  // parede de madeira (72/73) com porta (84) centralizada na fileira térrea.
  // Composição direta a partir da adjacência observada em Sample.png do pack.
  composite(
    DECO_TEXTURES.hut,
    [
      { frame: 48, x: 0, y: 0 }, { frame: 63, x: 16, y: 0 }, { frame: 48, x: 32, y: 0 },
      { frame: 72, x: 0, y: 16 }, { frame: 73, x: 16, y: 16 }, { frame: 72, x: 32, y: 16 },
      { frame: 72, x: 0, y: 32 }, { frame: 84, x: 16, y: 32 }, { frame: 73, x: 32, y: 32 },
    ],
    48
  );
}

const ARCANE_STONE_KEY = 'deco-arcane-stone';

function ensureArcaneStoneTexture(scene: Phaser.Scene): void {
  // Único elemento ainda procedural — nenhum pack recebido tem algo
  // apropriado para Arcane (orgânico/bioluminescente); ver CREDITS.md.
  if (scene.textures.exists(ARCANE_STONE_KEY)) return;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  const w = 12;
  const h = 14;
  g.fillStyle(0x241d14, 0.3);
  g.fillEllipse(w / 2, h - 1, 10, 3);
  g.fillStyle(0x4a4a42, 1);
  g.fillEllipse(w / 2, h - 6, w - 2, h - 4);
  g.fillStyle(0x6fae7a, 0.85);
  g.fillRect(w / 2 - 1, 2, 2, h - 8);
  g.generateTexture(ARCANE_STONE_KEY, w, h);
  g.destroy();
}

function buildGroundData(pathTiles: Set<string>): number[][] {
  const data: number[][] = [];
  for (let y = 0; y < MAP_HEIGHT_TILES; y++) {
    const row: number[] = [];
    for (let x = 0; x < MAP_WIDTH_TILES; x++) {
      if (pathTiles.has(`${x},${y}`)) {
        const hp = (x * 928371 + y * 123457) % 7;
        row.push(hp === 0 ? TILE.pathPlainAlt : TILE.pathPlain);
        continue;
      }
      const h = (x * 928371 + y * 123457) % 20;
      if (h === 0) row.push(TILE.grassPebbles);
      else if (h < 4) row.push(TILE.grassFlowerSmall);
      else if (h < 6) row.push(TILE.grassFlowerBig);
      else row.push(TILE.grass);
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

  preload(): void {
    this.load.spritesheet(TILESET_KEY, TILESET_URL, { frameWidth: TILE_SIZE, frameHeight: TILE_SIZE });
  }

  create(): void {
    this.save = loadOrCreateSave();
    ensureDecorComposites(this);
    ensureArcaneStoneTexture(this);

    const pathTiles = buildPathTiles();
    const groundData = buildGroundData(pathTiles);
    const map = this.make.tilemap({ data: groundData, tileWidth: TILE_SIZE, tileHeight: TILE_SIZE });
    const tileset = map.addTilesetImage(TILESET_KEY, TILESET_KEY, TILE_SIZE, TILE_SIZE, 0, 0)!;
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

    this.player = new PlayerController(this, spawn.x, spawn.y, this.scale.width, this.scale.height);
    this.physics.add.collider(this.player.sprite, decorGroup);

    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.startFollow(this.player.sprite, true, 0.12, 0.12);
    this.cameras.main.setDeadzone(24, 16);
    this.cameras.main.roundPixels = true;

    this.add
      .text(4, 4, `Ethurel — arredores de Varreth\ntile ${TILE_SIZE}px · zoom ${GAME_ZOOM}x · Kenney Tiny Town (CC0)`, {
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

    // Aglomerado de mata (3×3) — só para a borda, onde a densidade cobre as
    // lacunas entre copas (ver nota em DECO_TEXTURES).
    const addForestClump = (tx: number, ty: number, variant: 'pine' | 'autumn'): void => {
      const { x, y } = toWorld(tx, ty);
      const key = variant === 'pine' ? DECO_TEXTURES.bigPine : DECO_TEXTURES.bigAutumn;
      const obj = decorGroup.create(x, y, key) as Phaser.Physics.Arcade.Sprite;
      obj.setOrigin(0.5, 1);
      obj.setDepth(y);
      const body = obj.body as Phaser.Physics.Arcade.StaticBody;
      body.setSize(14, 10);
      body.setOffset((obj.width - 14) / 2, obj.height - 10);
      body.updateFromGameObject();
    };

    // Árvore única — para dentro da clareira, onde um aglomerado isolado
    // ficaria com aparência de buraco/quebrado (ver DECO_TEXTURES).
    const addSingleTree = (tx: number, ty: number, variant: 'orange' | 'green'): void => {
      const { x, y } = toWorld(tx, ty);
      const key = variant === 'orange' ? DECO_TEXTURES.treeOrange : DECO_TEXTURES.treeGreen;
      const obj = decorGroup.create(x, y, key) as Phaser.Physics.Arcade.Sprite;
      obj.setOrigin(0.5, 1);
      obj.setDepth(y);
      const body = obj.body as Phaser.Physics.Arcade.StaticBody;
      body.setSize(8, 6);
      body.setOffset((obj.width - 8) / 2, obj.height - 6);
      body.updateFromGameObject();
    };

    const addHut = (tx: number, ty: number): void => {
      const { x, y } = toWorld(tx, ty);
      const obj = decorGroup.create(x, y, DECO_TEXTURES.hut) as Phaser.Physics.Arcade.Sprite;
      obj.setOrigin(0.5, 1);
      obj.setDepth(y);
      const body = obj.body as Phaser.Physics.Arcade.StaticBody;
      body.setSize(40, 14);
      body.setOffset((obj.width - 40) / 2, obj.height - 14);
      body.updateFromGameObject();
    };

    const addBush = (tx: number, ty: number, frame: number): void => {
      // Puramente decorativo (sem colisão) — variedade de vegetação rasteira.
      const { x, y } = toWorld(tx, ty);
      const img = this.add.image(x, y - TILE_SIZE / 2, TILESET_KEY, frame).setOrigin(0.5, 1).setScale(1.4);
      img.setDepth(y - 1);
    };

    // Borda natural da clareira — aglomerados de mata densos, pulando a
    // entrada do caminho (espaçados a cada 2 tiles: se sobrepõem um pouco,
    // e é isso que lê como "parede de floresta", não uma árvore quebrada).
    for (let tx = 0; tx < MAP_WIDTH_TILES; tx += 2) {
      if (!isPath(tx, 0)) addForestClump(tx, 0, tx % 4 === 0 ? 'autumn' : 'pine');
      if (!isPath(tx, MAP_HEIGHT_TILES - 1)) addForestClump(tx, MAP_HEIGHT_TILES - 1, tx % 4 === 0 ? 'autumn' : 'pine');
    }
    for (let ty = 1; ty < MAP_HEIGHT_TILES - 1; ty += 2) {
      if (!isPath(0, ty)) addForestClump(0, ty, 'pine');
      if (!isPath(MAP_WIDTH_TILES - 1, ty)) addForestClump(MAP_WIDTH_TILES - 1, ty, 'pine');
    }

    // Árvores isoladas dentro da clareira (evitando o caminho), para variar
    // a silhueta sem repetir a mesma espécie — cada uma é uma árvore única
    // de verdade (copa+tronco), não um aglomerado.
    const interiorTrees: [number, number, 'orange' | 'green'][] = [
      [6, 4, 'green'], [22, 5, 'orange'], [5, 15, 'green'], [24, 13, 'orange'],
    ];
    for (const [tx, ty, variant] of interiorTrees) addSingleTree(tx, ty, variant);

    // Arbustos/cogumelos — detalhe de vegetação rasteira, sem bloquear o caminho.
    const bushes: [number, number, number][] = [
      [10, 4, TILE.bushRound], [12, 16, TILE.mushrooms], [22, 16, TILE.bushRound], [4, 12, TILE.mushrooms],
    ];
    for (const [tx, ty, frame] of bushes) addBush(tx, ty, frame);

    // Cabana — ponto de referência de "assentamento", não interior jogável ainda.
    addHut(19, 16);

    // Aceno discreto de Arcane, perto da cabana mas fora do caminho direto.
    const arcaneTile = { x: 21, y: 14 };
    const arcaneWorld = toWorld(arcaneTile.x, arcaneTile.y);
    const stone = this.add.image(arcaneWorld.x, arcaneWorld.y, ARCANE_STONE_KEY).setOrigin(0.5, 1);
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
