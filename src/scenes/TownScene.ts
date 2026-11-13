import Phaser from 'phaser';
import { sfxDoor, sfxStep } from '../audio/sfx';
import type { BuildingId } from '../data/bots';
import {
  BLDG_H,
  BLDG_W,
  BUILDINGS,
  TOWN_H,
  TOWN_W,
  doorZone,
} from '../data/buildings';
import { buildTownGround, PLAZA } from '../graphics/townGround';
import { Controls, playWalk } from '../input/controls';
import { setHint, setInteractTarget, setPlace } from '../ui/hud';

export type TownInit = { from?: BuildingId; intro?: boolean };

export class TownScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private controls!: Controls;
  private solids!: Phaser.Physics.Arcade.StaticGroup;
  private facing: 'down' | 'left' | 'right' | 'up' = 'down';
  private spawnFrom?: BuildingId;

  constructor() {
    super('Town');
  }

  init(data: TownInit): void {
    this.spawnFrom = data.from;
  }

  create(): void {
    if (!this.textures.exists('town-ground')) buildTownGround(this);
    setPlace('小镇广场');
    this.cameras.main.setBackgroundColor('#5b9a4a');
    setHint(null);
    setInteractTarget(null);

    this.add.image(0, 0, 'town-ground').setOrigin(0, 0).setDepth(0);

    this.solids = this.physics.add.staticGroup();

    for (const b of BUILDINGS) {
      const sprite = this.add.image(b.x, b.y, `bldg-${b.id}`).setOrigin(0, 0).setDepth(b.y + BLDG_H);
      // collision is the lower wall body, allowing the roof to be decorative
      const body = this.add.rectangle(b.x + BLDG_W / 2, b.y + 48 + (BLDG_H - 48) / 2, BLDG_W - 24, BLDG_H - 52);
      body.setVisible(false);
      this.physics.add.existing(body, true);
      this.solids.add(body);
      void sprite;

      this.add
        .text(b.x + BLDG_W / 2, b.y + 96, b.name, {
          fontFamily: '"PingFang SC","Microsoft YaHei","Noto Sans SC",sans-serif',
          fontSize: '14px',
          color: '#2b2118',
          fontStyle: 'bold',
        })
        .setOrigin(0.5)
        .setDepth(b.y + BLDG_H + 1);
    }

    // decorations
    const trees: Array<[number, number]> = [
      [90, 80],
      [300, 70],
      [980, 70],
      [1190, 90],
      [60, 390],
      [1220, 390],
      [100, 740],
      [360, 770],
      [920, 770],
      [1180, 740],
      [470, 280],
      [810, 280],
    ];
    for (const [x, y] of trees) {
      const t = this.add.image(x, y, 'tree').setOrigin(0.5, 1).setScale(1.6).setDepth(y);
      const body = this.add.rectangle(x, y - 8, 16, 10);
      body.setVisible(false);
      this.physics.add.existing(body, true);
      this.solids.add(body);
      void t;
    }
    const bushes: Array<[number, number]> = [
      [400, 230],
      [880, 230],
      [400, 600],
      [880, 600],
      [640, 230],
      [160, 400],
      [1120, 400],
    ];
    for (const [x, y] of bushes) {
      this.add.image(x, y, 'bush').setOrigin(0.5, 1).setDepth(y);
    }

    const fx = PLAZA.x + PLAZA.w / 2;
    const fy = PLAZA.y + PLAZA.h / 2 - 10;
    const fountain = this.add.sprite(fx, fy, 'fountain-0').setDepth(fy + 20);
    fountain.play('fountain');
    const fBody = this.add.rectangle(fx, fy + 8, 48, 28);
    fBody.setVisible(false);
    this.physics.add.existing(fBody, true);
    this.solids.add(fBody);

    this.add.image(fx - 80, fy + 60, 'bench').setScale(1.4).setDepth(fy + 70);
    this.add.image(fx + 80, fy + 60, 'bench').setScale(1.4).setDepth(fy + 70);
    this.add.image(fx - 100, fy - 30, 'lantern').setOrigin(0.5, 1).setScale(1.3).setDepth(fy);
    this.add.image(fx + 100, fy - 30, 'lantern').setOrigin(0.5, 1).setScale(1.3).setDepth(fy);

    this.add
      .text(fx, PLAZA.y + 18, 'Bot 小镇', {
        fontFamily: '"PingFang SC","Microsoft YaHei","Noto Sans SC",sans-serif',
        fontSize: '18px',
        color: '#2b2118',
        fontStyle: 'bold',
        stroke: '#fff8e8',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(PLAZA.y + 20);

    // world bounds walls
    const wallT = 20;
    const edges = [
      [TOWN_W / 2, wallT / 2, TOWN_W, wallT],
      [TOWN_W / 2, TOWN_H - wallT / 2, TOWN_W, wallT],
      [wallT / 2, TOWN_H / 2, wallT, TOWN_H],
      [TOWN_W - wallT / 2, TOWN_H / 2, wallT, TOWN_H],
    ];
    for (const [x, y, w, h] of edges) {
      const e = this.add.rectangle(x, y, w, h);
      e.setVisible(false);
      this.physics.add.existing(e, true);
      this.solids.add(e);
    }

    let sx = fx;
    let sy = fy + 80;
    if (this.spawnFrom) {
      const b = BUILDINGS.find((x) => x.id === this.spawnFrom);
      if (b) {
        const d = doorZone(b);
        sx = d.x + d.w / 2;
        sy = d.y + d.h + 16;
      }
    }

    this.player = this.physics.add.sprite(sx, sy, 'player', 0);
    this.player.setCollideWorldBounds(true);
    this.player.setSize(10, 8).setOffset(3, 16);
    this.player.setDepth(sy);
    this.player.setScale(2);
    this.physics.world.setBounds(0, 0, TOWN_W, TOWN_H);
    this.physics.add.collider(this.player, this.solids);

    this.cameras.main.setBounds(0, 0, TOWN_W, TOWN_H);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setRoundPixels(true);
    this.fitZoom();
    this.scale.on('resize', this.fitZoom, this);

    this.controls = new Controls(this);
    this.controls.onPointerWorld((x, y) => {
      for (const b of BUILDINGS) {
        const d = doorZone(b);
        if (x >= d.x && x <= d.x + d.w && y >= d.y && y <= d.y + d.h) {
          setInteractTarget({ kind: 'door', building: b.id, label: b.name });
          return { x: d.x + d.w / 2, y: d.y + d.h / 2, interact: true };
        }
        if (x >= b.x && x <= b.x + BLDG_W && y >= b.y && y <= b.y + BLDG_H) {
          setInteractTarget({ kind: 'door', building: b.id, label: b.name });
          return { x: d.x + d.w / 2, y: d.y + d.h / 2, interact: true };
        }
      }
      return { x, y };
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.fitZoom, this);
    });
  }

  private fitZoom = (): void => {
    const cam = this.cameras.main;
    const w = this.scale.width;
    const h = this.scale.height;
    const fit = Math.min(w / TOWN_W, h / TOWN_H);
    const zoom = Math.min(1.15, Math.max(fit, 0.42));
    cam.setZoom(zoom);
  };

  update(): void {
    if (!this.player) return;
    let foundB = BUILDINGS.find((b) => {
      const d = doorZone(b);
      return (
        this.player.x > d.x - 6 &&
        this.player.x < d.x + d.w + 6 &&
        this.player.y > d.y - 8 &&
        this.player.y < d.y + d.h + 14
      );
    });
    if (foundB) setInteractTarget({ kind: 'door', building: foundB.id, label: foundB.name });
    else setInteractTarget(null);

    const dir = this.controls.update(this.player, { onStep: sfxStep });
    if (dir !== 'idle') this.facing = dir;
    playWalk(this.player, 'player', dir === 'idle' ? 'idle' : this.facing);
    this.player.setDepth(this.player.y);
  }

  enter(building: BuildingId): void {
    sfxDoor();
    this.cameras.main.fadeOut(180, 14, 26, 18);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start('Building', { building });
    });
  }
}
