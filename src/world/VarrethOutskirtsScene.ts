import Phaser from 'phaser';
import { PlayerController } from '@/player/PlayerController';
import { PLAYER_TEXTURE_KEY, PLAYER_TEXTURE_URL } from '@/player/sprite';
import { loadOrCreateSave, persistPlayerState, flushSave, forceSave } from '@/save/gameSave';
import { DEFAULT_SPAWN, VARRETH_OUTSKIRTS_MAP_ID, type SaveDataV3 } from '@/save/schema';
import { TILE_SIZE } from '@/core/config';
import { TILESET_KEY, TILESET_URL, ensureTilesetFrames } from '@/world/tilesetFrames';
import { InteractionSystem } from '@/interaction/InteractionSystem';
import { InteractionPrompt } from '@/interaction/InteractionPrompt';
import type { Interactable } from '@/interaction/Interactable';
import { DialogueBox, PORTRAIT_TEXTURE_KEY, PORTRAIT_TEXTURE_URL } from '@/dialogue/DialogueBox';
import type { DialogueNode } from '@/dialogue/types';
import { getQuestState, setQuestState } from '@/quest/QuestState';
import {
  QUEST_ID,
  NPC_ID,
  NPC_NAME,
  WORLD_FLAG_REPORTED,
  WORLD_FLAG_KEPT,
  DIALOGUE_OFFER,
  DIALOGUE_REMINDER,
  DIALOGUE_OBJECTIVE_COMPLETE,
  DIALOGUE_COMPLETED_REPORT,
  DIALOGUE_COMPLETED_KEEP,
  QUEST_BONUS_XP,
} from '@/data/varrethQuest';
import { CLASSES } from '@/data/classes';
import { ENEMIES } from '@/data/enemies';
import type { BattleResult } from '@/combat/BattleScene';
import { resolveWorldEvent, type IndoleState, type ReputationState } from '@/social/indole';
import { audioManager } from '@/audio/AudioManager';
import { drawButton } from '@/ui/Panel';

const MAP_WIDTH_TILES = 30;
const MAP_HEIGHT_TILES = 20;

const NPC_TEXTURE_KEY = 'mighty-npc1';
const NPC_TEXTURE_URL = 'assets/mighty/characters/npc1.png';
/** Frame parado (bloco A, coluna do meio, linha "baixo") na mesma folha VX
 * Ace de src/player/sprite.ts. */
const NPC_STAND_FRAME = 1;

const GRASS_KEY = 'ansimuz-grass';
const GRASS_URL = 'assets/ansimuz/grass-tile.png';

/** Chave da textura por arquivo recebido (`public/assets/ansimuz/props/`). */
const PROP_FILES: Record<string, string> = {
  'tree-1': 'ansimuz-prop-tree1',
  'tree-2': 'ansimuz-prop-tree2',
  'bush-1': 'ansimuz-prop-bush1',
  'bush-2': 'ansimuz-prop-bush2',
  'bush-3': 'ansimuz-prop-bush3',
  'plant-1': 'ansimuz-prop-plant1',
  'plant-2': 'ansimuz-prop-plant2',
  'plant-3': 'ansimuz-prop-plant3',
};
const PROP_KEYS = {
  tree1: PROP_FILES['tree-1'],
  tree2: PROP_FILES['tree-2'],
  bush1: PROP_FILES['bush-1'],
  bush2: PROP_FILES['bush-2'],
  bush3: PROP_FILES['bush-3'],
  plant1: PROP_FILES['plant-1'],
  plant2: PROP_FILES['plant-2'],
  plant3: PROP_FILES['plant-3'],
} as const;

const ARCANE_STONE_KEY = 'deco-arcane-stone';

function ensureArcaneStoneTexture(scene: Phaser.Scene): void {
  // Único elemento ainda procedural — nenhum pack recebido tem algo
  // apropriado para Arcane (orgânico/bioluminescente); ver CREDITS.md.
  // Também serve como o marco local "Raiz Rompida" (origem deliberadamente
  // incerta — docs/design/06-WORLD-NARRATIVE-BIBLE.md).
  if (scene.textures.exists(ARCANE_STONE_KEY)) return;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  const w = 14;
  const h = 16;
  g.fillStyle(0x241d14, 0.3);
  g.fillEllipse(w / 2, h - 1, 12, 3);
  g.fillStyle(0x4a4a42, 1);
  g.fillEllipse(w / 2, h - 6, w - 2, h - 4);
  g.fillStyle(0x6fae7a, 0.85);
  g.fillRect(w / 2 - 1, 2, 2, h - 8);
  g.generateTexture(ARCANE_STONE_KEY, w, h);
  g.destroy();
}

export class VarrethOutskirtsScene extends Phaser.Scene {
  private player!: PlayerController;
  private save!: SaveDataV3;
  private interactionSystem = new InteractionSystem();
  private interactionPrompt!: InteractionPrompt;
  private dialogueBox!: DialogueBox;
  private encounterTrigger!: { x: number; y: number; radius: number };
  private encounterZoneUsed = false;
  private visibilityHandler = (): void => {
    if (document.visibilityState === 'hidden') this.forceSaveNow();
  };

  constructor() {
    super('VarrethOutskirtsScene');
  }

  preload(): void {
    this.load.image(TILESET_KEY, TILESET_URL);
    this.load.image(GRASS_KEY, GRASS_URL);
    this.load.spritesheet(PLAYER_TEXTURE_KEY, PLAYER_TEXTURE_URL, { frameWidth: 32, frameHeight: 42 });
    this.load.spritesheet(NPC_TEXTURE_KEY, NPC_TEXTURE_URL, { frameWidth: 32, frameHeight: 42 });
    this.load.spritesheet(PORTRAIT_TEXTURE_KEY, PORTRAIT_TEXTURE_URL, { frameWidth: 16, frameHeight: 16 });
    for (const [fileName, key] of Object.entries(PROP_FILES)) {
      this.load.image(key, `assets/ansimuz/props/${fileName}.png`);
    }
    this.load.audio('town-ambient', 'assets/ansimuz/audio/town-ambient.ogg');
    this.load.audio('battle-encounter', 'assets/ansimuz/audio/battle-encounter.ogg');
  }

  create(): void {
    this.save = loadOrCreateSave();
    if (!this.save.character) {
      // Não deveria acontecer no fluxo normal (Título → Criação → aqui);
      // guarda defensiva em vez de travar numa build de desenvolvimento.
      this.scene.start('TitleScene');
      return;
    }
    ensureTilesetFrames(this);
    ensureArcaneStoneTexture(this);

    const worldWidth = MAP_WIDTH_TILES * TILE_SIZE;
    const worldHeight = MAP_HEIGHT_TILES * TILE_SIZE;
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

    this.add.tileSprite(0, 0, worldWidth, worldHeight, GRASS_KEY).setOrigin(0, 0).setDepth(-1000);

    const decorGroup = this.physics.add.staticGroup();
    this.placeDecor(decorGroup);

    const spawn =
      this.save.player.mapId === VARRETH_OUTSKIRTS_MAP_ID
        ? { x: this.save.player.x, y: this.save.player.y }
        : { x: DEFAULT_SPAWN.x, y: DEFAULT_SPAWN.y };

    this.player = new PlayerController(this, spawn.x, spawn.y, this.scale.width, this.scale.height, this.save.character.gender);
    this.physics.add.collider(this.player.sprite, decorGroup);

    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.startFollow(this.player.sprite, true, 0.12, 0.12);
    this.cameras.main.setDeadzone(24, 16);
    this.cameras.main.roundPixels = true;

    this.spawnNpc();
    this.encounterTrigger = { x: 21 * TILE_SIZE + TILE_SIZE / 2, y: 14 * TILE_SIZE + TILE_SIZE, radius: 18 };

    this.interactionPrompt = new InteractionPrompt(this);
    this.dialogueBox = new DialogueBox(this);
    this.setupSoundToggle();

    this.add
      .text(4, 4, 'Ethurel — arredores de Varreth', { fontFamily: 'sans-serif', fontSize: '6px', color: '#e8dcc4' })
      .setScrollFactor(0)
      .setDepth(2000)
      .setAlpha(0.7);

    audioManager.playMusic('town-ambient', { loop: true });

    document.addEventListener('visibilitychange', this.visibilityHandler);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
      this.player.destroy();
      this.interactionPrompt.destroy();
      this.dialogueBox.destroy();
    });
  }

  private setupSoundToggle(): void {
    const { width } = this.scale;
    const g = this.add.graphics();
    const draw = () => {
      g.clear();
      drawButton(g, 0, 0, 34, 16, !this.save.audio.soundOn);
    };
    draw();
    const t = this.add.text(17, 8, this.save.audio.soundOn ? 'Som:ON' : 'Som:OFF', { fontFamily: 'sans-serif', fontSize: '6px', color: '#e8dcc4' }).setOrigin(0.5);
    const c = this.add.container(width - 40, 4, [g, t]);
    c.setScrollFactor(0).setDepth(3000).setSize(34, 16);
    // Ver nota em InteractionPrompt.ts: hitArea de Container precisa começar
    // em (w/2,h/2) para filhos desenhados a partir de (0,0).
    c.setInteractive(new Phaser.Geom.Rectangle(17, 8, 34, 16), Phaser.Geom.Rectangle.Contains);
    c.on('pointerdown', () => {
      this.save.audio.soundOn = !this.save.audio.soundOn;
      audioManager.setMuted(!this.save.audio.soundOn);
      t.setText(this.save.audio.soundOn ? 'Som:ON' : 'Som:OFF');
      draw();
      forceSave(this.save);
    });
    audioManager.setMuted(!this.save.audio.soundOn);
  }

  private spawnNpc(): void {
    const x = 18 * TILE_SIZE + TILE_SIZE / 2;
    const y = 8 * TILE_SIZE + TILE_SIZE;
    const sprite = this.add.sprite(x, y, NPC_TEXTURE_KEY, NPC_STAND_FRAME).setOrigin(0.5, 1);
    sprite.setDepth(y);

    const interactable: Interactable = {
      id: NPC_ID,
      x,
      y,
      radius: 26,
      label: NPC_NAME,
      enabled: () => true,
      onInteract: () => this.talkToNpc(),
    };
    this.interactionSystem.register(interactable);
  }

  private talkToNpc(): void {
    if (this.dialogueBox.isOpen) return;
    const state = getQuestState(this.save, QUEST_ID);
    this.player.setInputEnabled(false);

    const finish = (): void => {
      this.player.setInputEnabled(true);
    };

    if (state === 'not_started') {
      this.dialogueBox.open(DIALOGUE_OFFER, () => {
        setQuestState(this.save, QUEST_ID, 'active');
        forceSave(this.save);
        finish();
      });
      return;
    }
    if (state === 'active') {
      this.dialogueBox.open(DIALOGUE_REMINDER, finish);
      return;
    }
    if (state === 'objective_complete') {
      this.dialogueBox.open(DIALOGUE_OBJECTIVE_COMPLETE as DialogueNode, (choiceId) => {
        this.resolveQuestChoice(choiceId);
        finish();
      });
      return;
    }
    // completed
    const kept = !!this.save.worldFlags[WORLD_FLAG_KEPT];
    this.dialogueBox.open(kept ? DIALOGUE_COMPLETED_KEEP : DIALOGUE_COMPLETED_REPORT, finish);
  }

  private resolveQuestChoice(choiceId?: string): void {
    if (!this.save.character) return;
    setQuestState(this.save, QUEST_ID, 'completed');
    this.save.character.xp = (this.save.character.xp ?? 0) + QUEST_BONUS_XP;

    if (choiceId === 'report') {
      this.save.worldFlags[WORLD_FLAG_REPORTED] = true;
      const social = resolveWorldEvent(
        { indole: this.save.indole as IndoleState, reputation: this.save.reputation as ReputationState },
        {
          id: 'raiz-sussurrou:reportou',
          indoleDelta: [
            { trait: 'honra', delta: 3 },
            { trait: 'autocontrole', delta: 2 },
          ],
          reputationDelta: [{ entity: 'varreth', delta: 5 }],
          witnesses: 'public',
        }
      );
      this.save.indole = social.indole;
      this.save.reputation = social.reputation;
    } else if (choiceId === 'keep') {
      this.save.worldFlags[WORLD_FLAG_KEPT] = true;
      const social = resolveWorldEvent(
        { indole: this.save.indole as IndoleState, reputation: this.save.reputation as ReputationState },
        {
          id: 'raiz-sussurrou:guardou',
          indoleDelta: [
            { trait: 'pragmatismo', delta: 3 },
            { trait: 'ambicao', delta: 2 },
          ],
          witnesses: 'none',
        }
      );
      this.save.indole = social.indole;
      this.save.reputation = social.reputation;
    }
    forceSave(this.save);
  }

  private checkEncounterTrigger(): void {
    if (this.encounterZoneUsed) return;
    if (getQuestState(this.save, QUEST_ID) !== 'active') return;
    const dist = Math.hypot(this.player.sprite.x - this.encounterTrigger.x, this.player.sprite.y - this.encounterTrigger.y);
    if (dist <= this.encounterTrigger.radius) {
      this.encounterZoneUsed = true;
      this.startBattle();
    }
  }

  private startBattle(): void {
    if (!this.save.character) return;
    const character = this.save.character;
    const classDef = CLASSES.find((c) => c.id === character.classId) ?? CLASSES[0];
    const enemy = ENEMIES[0];

    this.player.setInputEnabled(false);
    this.scene.pause('VarrethOutskirtsScene');
    audioManager.stopMusic();
    this.scene.launch('BattleScene', {
      playerName: character.name,
      vigor: classDef.baseAttrs.vigor,
      hp: character.hp,
      maxHp: character.maxHp,
      arcaneFocus: character.arcaneFocus,
      arcaneMax: character.arcaneMax,
      tension: character.tension,
      classDef,
      enemy,
      onDone: (result: BattleResult) => this.onBattleDone(result),
    });
  }

  private onBattleDone(result: BattleResult): void {
    if (!this.save.character) return;
    this.scene.stop('BattleScene');
    this.scene.resume('VarrethOutskirtsScene');
    audioManager.playMusic('town-ambient', { loop: true });
    this.player.setInputEnabled(true);

    this.save.character.hp = result.playerHpAfter;
    this.save.character.tension = result.playerTensionAfter;
    if (result.victory) {
      this.save.character.xp = (this.save.character.xp ?? 0) + result.xpGained;
      setQuestState(this.save, QUEST_ID, 'objective_complete');
    } else {
      this.encounterZoneUsed = false; // permite tentar de novo (fuga/derrota não são permanentes)
    }
    forceSave(this.save);
  }

  private placeDecor(decorGroup: Phaser.Physics.Arcade.StaticGroup): void {
    const toWorld = (tx: number, ty: number) => ({ x: tx * TILE_SIZE + TILE_SIZE / 2, y: ty * TILE_SIZE + TILE_SIZE });

    const addSolid = (x: number, y: number, textureKey: string, frame: string | number | undefined, footprintW: number, footprintH: number): void => {
      const obj = decorGroup.create(x, y, textureKey, frame) as Phaser.Physics.Arcade.Sprite;
      obj.setOrigin(0.5, 1);
      obj.setDepth(y);
      const body = obj.body as Phaser.Physics.Arcade.StaticBody;
      // IMPORTANTE: nunca chamar body.updateFromGameObject() depois de
      // setSize/setOffset num StaticBody — ele resincroniza o corpo para o
      // tamanho TOTAL do sprite, descartando a pegada (footprint) menor que
      // acabamos de configurar. Bug real encontrado durante QA desta build:
      // toda a decoração (árvores/cabana/pinheiros) ficava sólida na
      // extensão visual inteira, não só na base, tornando a clareira quase
      // impossível de atravessar.
      //
      // Também evitamos `body.setOffset()` para posicionar a pegada: seu
      // cálculo interno (relativo a displayOrigin) não bateu com o esperado
      // para estes frames customizados (registrados via `texture.add`) — em
      // vez de depender disso, usamos `getBounds()` (API que já resolve
      // origin/escala corretamente) e posicionamos o corpo estático
      // diretamente pelas coordenadas de mundo da base visual do sprite.
      body.setSize(footprintW, footprintH);
      const bounds = obj.getBounds();
      body.x = bounds.centerX - footprintW / 2;
      body.y = bounds.bottom - footprintH;
    };

    const addDeco = (x: number, y: number, textureKey: string, scale = 1): void => {
      const img = this.add.image(x, y, textureKey).setOrigin(0.5, 1).setScale(scale);
      img.setDepth(y - 1);
    };

    // Borda da clareira — aglomerados de pinheiro (ansimuz), pulando a
    // entrada norte/sul do caminho.
    for (let tx = 1; tx < MAP_WIDTH_TILES - 1; tx += 3) {
      addSolid(tx * TILE_SIZE, 6, TILESET_KEY, 'pineCluster', 30, 16);
      addSolid(tx * TILE_SIZE, worldBottom(), TILESET_KEY, 'pineCluster', 30, 16);
    }
    for (let ty = 2; ty < MAP_HEIGHT_TILES - 2; ty += 3) {
      addSolid(10, ty * TILE_SIZE, TILESET_KEY, 'pineCluster', 30, 16);
      addSolid((MAP_WIDTH_TILES - 1) * TILE_SIZE, ty * TILE_SIZE, TILESET_KEY, 'pineCluster', 30, 16);
    }

    // Árvores/vegetação interior — variedade, sem repetir grid.
    const interior: [number, number, string][] = [
      [6, 4, PROP_KEYS.tree1],
      [24, 6, PROP_KEYS.tree2],
      [5, 15, PROP_KEYS.tree1],
      [26, 13, PROP_KEYS.tree2],
    ];
    for (const [tx, ty, key] of interior) {
      const { x, y } = toWorld(tx, ty);
      addSolid(x, y, key, undefined, 16, 10);
    }

    const bushesAndPlants: [number, number, string][] = [
      [9, 5, PROP_KEYS.bush1],
      [23, 9, PROP_KEYS.bush2],
      [7, 12, PROP_KEYS.bush3],
      [16, 5, PROP_KEYS.plant1],
      [12, 15, PROP_KEYS.plant2],
      [20, 12, PROP_KEYS.plant3],
    ];
    for (const [tx, ty, key] of bushesAndPlants) {
      const { x, y } = toWorld(tx, ty);
      addDeco(x, y, key, 1.2);
    }

    // Cruzamento de caminho — referência visual de "a trilha que vem de
    // Varreth encontra a clareira aqui", puramente decorativo (sem colisão).
    const pathPos = toWorld(15, 10);
    const pathImg = this.add.image(pathPos.x, pathPos.y, TILESET_KEY, 'pathCross').setOrigin(0.5, 0.9);
    pathImg.setDepth(pathPos.y - 2);

    // Cabana — ponto de referência de assentamento perto de Varreth.
    const hutPos = toWorld(18, 7);
    addSolid(hutPos.x, hutPos.y + TILE_SIZE, TILESET_KEY, 'cottage', 48, 20);

    // Raiz Rompida / anomalia Arcane — ponto de investigação da quest.
    const arcanePos = toWorld(21, 14);
    const stone = this.add.image(arcanePos.x, arcanePos.y, ARCANE_STONE_KEY).setOrigin(0.5, 1);
    stone.setDepth(arcanePos.y);
    const glow = this.add.circle(arcanePos.x, arcanePos.y - 8, 7, 0x6fae7a, 0.35);
    glow.setDepth(arcanePos.y + 0.1);
    glow.setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: glow, alpha: 0.12, scale: 1.35, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    function worldBottom(): number {
      return (MAP_HEIGHT_TILES - 1) * TILE_SIZE;
    }
  }

  private forceSaveNow(): void {
    if (!this.save) return;
    persistPlayerState(this.save, {
      mapId: VARRETH_OUTSKIRTS_MAP_ID,
      x: Math.round(this.player.sprite.x),
      y: Math.round(this.player.sprite.y),
    });
    flushSave(this.save);
  }

  update(_time: number, delta: number): void {
    this.player.update(delta);

    persistPlayerState(this.save, {
      mapId: VARRETH_OUTSKIRTS_MAP_ID,
      x: Math.round(this.player.sprite.x),
      y: Math.round(this.player.sprite.y),
    });

    if (!this.dialogueBox.isOpen) {
      const target = this.interactionSystem.nearestInRange(this.player.sprite.x, this.player.sprite.y);
      this.interactionPrompt.update(target);
      this.checkEncounterTrigger();
    } else {
      this.interactionPrompt.update(null);
    }
  }
}
