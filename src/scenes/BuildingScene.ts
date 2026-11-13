import Phaser from 'phaser';
import { sfxDoor, sfxStep } from '../audio/sfx';
import { botsIn, type BuildingId, type BotTemplate } from '../data/bots';
import { BUILDING_BY_ID } from '../data/buildings';
import { Controls, playWalk } from '../input/controls';
import { setHint, setInteractTarget, setPlace } from '../ui/hud';

export type BuildingInit = { building: BuildingId };

type NpcSpot = {
  bot: BotTemplate;
  x: number;
  y: number;
  sprite: Phaser.Physics.Arcade.Sprite;
};

export class BuildingScene extends Phaser.Scene {
  private buildingId!: BuildingId;
  private player!: Phaser.Physics.Arcade.Sprite;
  private controls!: Controls;
  private npcs: NpcSpot[] = [];
  private facing: 'down' | 'left' | 'right' | 'up' = 'up';
  private roomW = 880;
  private roomH = 620;
  private exitZone = { x: 0, y: 0, w: 64, h: 40 };

  constructor() {
    super('Building');
  }

  init(data: BuildingInit): void {
    this.buildingId = data.building;
  }

  create(): void {
    const def = BUILDING_BY_ID[this.buildingId];
    const bots = botsIn(this.buildingId);
    setPlace(def.name);
    setHint(null);
    setInteractTarget(null);
    this.npcs = [];

    this.roomW = Math.max(360, Math.floor(this.scale.width));
    this.roomH = Math.max(520, Math.floor(this.scale.height));

    this.cameras.main.setBackgroundColor(def.theme.trim);
    this.paintRoom(def.id);
    this.physics.world.setBounds(20, 64, this.roomW - 40, this.roomH - 84);

    const solids = this.physics.add.staticGroup();
    const walls: Array<[number, number, number, number]> = [
      [this.roomW / 2, 32, this.roomW, 64],
      [10, this.roomH / 2, 20, this.roomH],
      [this.roomW - 10, this.roomH / 2, 20, this.roomH],
      [this.roomW / 2, this.roomH - 10, this.roomW, 20],
    ];
    for (const [x, y, w, h] of walls) {
      const r = this.add.rectangle(x, y, w, h);
      r.setVisible(false);
      this.physics.add.existing(r, true);
      solids.add(r);
    }

    this.exitZone = { x: this.roomW / 2 - 32, y: this.roomH - 56, w: 64, h: 44 };
    this.add.image(this.roomW / 2, this.roomH - 44, 'mat').setScale(1.4).setDepth(2);
    this.add
      .text(this.roomW / 2, 28, def.name, {
        fontFamily: '"PingFang SC","Microsoft YaHei","Noto Sans SC",sans-serif',
        fontSize: '20px',
        color: '#fff8e8',
        fontStyle: 'bold',
        stroke: '#1a1410',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(2000);

    this.add
      .text(this.roomW / 2, this.roomH - 18, '出口', {
        fontFamily: '"PingFang SC","Microsoft YaHei","Noto Sans SC",sans-serif',
        fontSize: '13px',
        color: '#fff8e8',
        stroke: '#1a1410',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(2000);

    const spots = layoutCounters(bots.length, this.roomW, this.roomH);
    const nameW = Math.max(72, Math.floor((this.roomW - 80) / Math.max(3, Math.min(5, bots.length))) - 8);

    this.add
      .image(this.roomW / 2, this.roomH * 0.62, `rug-${def.id}`)
      .setScale(this.roomW < 500 ? 1.1 : 1.6)
      .setDepth(1);

    bots.forEach((bot, i) => {
      const s = spots[i];
      const counter = this.add.image(s.x, s.y, `counter-${def.id}`).setScale(1.15).setDepth(s.y + 8);
      const cbody = this.add.rectangle(s.x, s.y + 6, 44, 22);
      cbody.setVisible(false);
      this.physics.add.existing(cbody, true);
      solids.add(cbody);
      void counter;

      const npc = this.physics.add.sprite(s.x, s.y - 26, `npc-${bot.palette}`, 0);
      npc.setScale(2);
      npc.setImmovable(true);
      npc.body?.setAllowGravity(false);
      npc.setSize(10, 8).setOffset(3, 16);
      npc.setDepth(s.y - 10);
      npc.play(`npc-${bot.palette}-down`);
      npc.anims.stop();
      npc.setFrame(0);
      this.npcs.push({ bot, x: s.x, y: s.y - 26, sprite: npc });

      this.add
        .text(s.x, s.y + 24, bot.name, {
          fontFamily: '"PingFang SC","Microsoft YaHei","Noto Sans SC",sans-serif',
          fontSize: this.roomW < 500 ? '9px' : '11px',
          color: '#2b2118',
          backgroundColor: '#fff8e8ee',
          padding: { x: 3, y: 2 },
          align: 'center',
          wordWrap: { width: nameW },
        })
        .setOrigin(0.5, 0)
        .setDepth(s.y + 24);
    });

    const px = this.roomW / 2;
    const py = this.roomH - 86;
    this.player = this.physics.add.sprite(px, py, 'player', 12);
    this.player.setScale(2);
    this.player.setSize(10, 8).setOffset(3, 16);
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(py);
    this.physics.add.collider(this.player, solids);
    this.npcs.forEach((n) => this.physics.add.collider(this.player, n.sprite));

    this.cameras.main.setBounds(0, 0, this.roomW, this.roomH);
    this.cameras.main.setZoom(1);
    this.cameras.main.centerOn(this.roomW / 2, this.roomH / 2);
    this.cameras.main.setRoundPixels(true);
    this.cameras.main.fadeIn(180, 14, 26, 18);

    this.controls = new Controls(this);
    this.controls.onPointerWorld((x, y) => {
      if (
        x > this.exitZone.x &&
        x < this.exitZone.x + this.exitZone.w &&
        y > this.exitZone.y &&
        y < this.exitZone.y + this.exitZone.h
      ) {
        setInteractTarget({ kind: 'exit', label: '出口' });
        return { x: this.roomW / 2, y: this.roomH - 70, interact: true };
      }
      for (const n of this.npcs) {
        if (Math.hypot(x - n.x, y - n.y) < 40) {
          setInteractTarget({ kind: 'bot', botId: n.bot.id, label: n.bot.name });
          return { x: n.x, y: n.y + 50, interact: true };
        }
      }
      return { x, y };
    });

    const onResize = () => {
      this.scene.restart({ building: this.buildingId });
    };
    this.scale.on('resize', onResize);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', onResize);
    });
  }

  private paintRoom(id: BuildingId): void {
    for (let y = 0; y < this.roomH; y += 32) {
      for (let x = 0; x < this.roomW; x += 32) {
        const key = y < 64 ? `wall-${id}` : `floor-${id}`;
        this.add.image(x, y, key).setOrigin(0, 0).setDepth(0);
      }
    }
  }

  update(): void {
    if (!this.player) return;
    this.refreshTarget();
    const dir = this.controls.update(this.player, { onStep: sfxStep });
    if (dir !== 'idle') this.facing = dir;
    playWalk(this.player, 'player', dir === 'idle' ? 'idle' : this.facing);
    this.player.setDepth(this.player.y);
    this.npcs.forEach((n) => n.sprite.setDepth(n.sprite.y));
  }

  private refreshTarget(): void {
    const p = this.player;
    if (
      p.x > this.exitZone.x &&
      p.x < this.exitZone.x + this.exitZone.w &&
      p.y > this.exitZone.y - 10 &&
      p.y < this.exitZone.y + this.exitZone.h
    ) {
      setInteractTarget({ kind: 'exit', label: '出口' });
      return;
    }
    let nearest: NpcSpot | null = null;
    let best = 56;
    for (const n of this.npcs) {
      const d = Math.hypot(p.x - n.x, p.y - (n.y + 12));
      if (d < best) {
        best = d;
        nearest = n;
      }
    }
    if (nearest) setInteractTarget({ kind: 'bot', botId: nearest.bot.id, label: nearest.bot.name });
    else setInteractTarget(null);
  }

  leave(): void {
    sfxDoor();
    const id = this.buildingId;
    this.cameras.main.fadeOut(180, 14, 26, 18);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start('Town', { from: id });
    });
  }
}

function layoutCounters(
  count: number,
  roomW: number,
  roomH: number,
): Array<{ x: number; y: number }> {
  const spots: Array<{ x: number; y: number }> = [];
  if (count <= 0) return spots;

  const cols = count <= 4 ? count : count <= 8 ? Math.ceil(count / 2) : count <= 10 ? 5 : Math.min(6, Math.ceil(count / 2));
  const rows = Math.ceil(count / cols);
  const top = Math.max(120, Math.min(160, Math.floor(roomH * 0.2)));
  const bottomLimit = roomH - 160;
  const rowGap = rows === 1 ? 0 : Math.min(160, Math.max(110, (bottomLimit - top) / Math.max(1, rows - 1 + 0.4)));

  let i = 0;
  for (let r = 0; r < rows && i < count; r++) {
    const remain = count - i;
    const n = Math.min(cols, remain);
    const inset = roomW < 500 ? 36 : 70;
    const usable = roomW - inset * 2;
    const y = top + r * rowGap;
    for (let c = 0; c < n && i < count; c++) {
      const x = n === 1 ? roomW / 2 : inset + (usable * (c + 0.5)) / n;
      spots.push({ x, y });
      i += 1;
    }
  }
  return spots;
}
