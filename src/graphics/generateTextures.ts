import Phaser from 'phaser';
import { BUILDINGS, BLDG_W, BLDG_H } from '../data/buildings';
import { addTexture, addSheet, ctx2d, fill, makeCanvas, dither } from './pixel';

const SKIN = '#f0c9a0';
const SKIN_SH = '#d4a574';
const HAIR = '#3b2a1e';
const BOOT = '#3a2a18';

export const PALETTES = [
  { shirt: '#3d8bfd', pants: '#2c3d55', accent: '#ffd166' },
  { shirt: '#40916c', pants: '#1b4332', accent: '#f4e285' },
  { shirt: '#e85d4c', pants: '#6b2d2d', accent: '#ffe0a3' },
  { shirt: '#9b5de5', pants: '#3d2a55', accent: '#f7c948' },
  { shirt: '#00a8a8', pants: '#1b3d3d', accent: '#ff8fab' },
  { shirt: '#f4a259', pants: '#6b3f1d', accent: '#cce6ff' },
  { shirt: '#5c6bc0', pants: '#2a2f4a', accent: '#a8e6cf' },
  { shirt: '#d90429', pants: '#2b2d42', accent: '#edf2f4' },
];

function drawChar(
  ctx: CanvasRenderingContext2D,
  ox: number,
  oy: number,
  dir: 'down' | 'left' | 'right' | 'up',
  frame: number,
  pal: (typeof PALETTES)[number],
  opts?: { antenna?: boolean; hair?: string },
): void {
  const bob = frame % 2 === 1 ? 1 : 0;
  const leg = frame % 4;
  const hair = opts?.hair ?? HAIR;
  const y = oy + bob;

  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(ox + 3, oy + 22, 10, 3);

  const legL = ox + 4;
  const legR = ox + 9;
  let lOff = 0;
  let rOff = 0;
  if (dir !== 'up' && dir !== 'down') {
    lOff = leg === 1 || leg === 2 ? 1 : 0;
    rOff = leg === 3 || leg === 0 ? 1 : 0;
  } else {
    lOff = leg === 1 ? 1 : leg === 3 ? -1 : 0;
    rOff = -lOff;
  }

  // legs
  fill(ctx, pal.pants, legL, y + 16, 3, 5);
  fill(ctx, pal.pants, legR, y + 16, 3, 5);
  fill(ctx, BOOT, legL, y + 20 + (lOff > 0 ? 0 : 0), 3, 2);
  fill(ctx, BOOT, legR, y + 20, 3, 2);
  if (lOff) fill(ctx, BOOT, legL + (dir === 'left' ? -lOff : dir === 'right' ? lOff : 0), y + 21, 3, 2);
  if (rOff) fill(ctx, BOOT, legR + (dir === 'left' ? -rOff : dir === 'right' ? rOff : 0), y + 21, 3, 2);

  // body
  fill(ctx, pal.shirt, ox + 3, y + 10, 10, 7);
  fill(ctx, pal.accent, ox + 7, y + 11, 2, 4);

  // head
  const hx = ox + 4;
  const hy = y + 2;
  fill(ctx, SKIN, hx, hy, 8, 8);
  fill(ctx, SKIN_SH, hx, hy + 6, 8, 2);
  fill(ctx, hair, hx, hy, 8, 3);
  fill(ctx, hair, hx, hy, 1, 5);
  fill(ctx, hair, hx + 7, hy, 1, 5);

  // face
  if (dir === 'down') {
    fill(ctx, '#1a1a1a', hx + 2, hy + 4, 1, 1);
    fill(ctx, '#1a1a1a', hx + 5, hy + 4, 1, 1);
    fill(ctx, '#c45c4a', hx + 3, hy + 6, 2, 1);
  } else if (dir === 'up') {
    fill(ctx, hair, hx, hy, 8, 6);
  } else if (dir === 'left') {
    fill(ctx, '#1a1a1a', hx + 2, hy + 4, 1, 1);
    fill(ctx, '#c45c4a', hx + 2, hy + 6, 1, 1);
  } else {
    fill(ctx, '#1a1a1a', hx + 5, hy + 4, 1, 1);
    fill(ctx, '#c45c4a', hx + 5, hy + 6, 1, 1);
  }

  // arms
  if (dir === 'left') {
    fill(ctx, SKIN, ox + 2, y + 11, 2, 5);
  } else if (dir === 'right') {
    fill(ctx, SKIN, ox + 12, y + 11, 2, 5);
  } else {
    fill(ctx, SKIN, ox + 2, y + 11, 2, 4);
    fill(ctx, SKIN, ox + 12, y + 11, 2, 4);
  }

  if (opts?.antenna) {
    fill(ctx, '#555', ox + 7, y - 1, 2, 3);
    fill(ctx, pal.accent, ox + 6, y - 3, 4, 3);
    fill(ctx, '#fff', ox + 7, y - 2, 1, 1);
  }
}

function charSheet(antenna: boolean, pal: (typeof PALETTES)[number], hair?: string): HTMLCanvasElement {
  // 4 dirs x 4 frames, frame 16x24
  const fw = 16;
  const fh = 24;
  const c = makeCanvas(fw * 4, fh * 4);
  const ctx = ctx2d(c);
  const dirs: Array<'down' | 'left' | 'right' | 'up'> = ['down', 'left', 'right', 'up'];
  dirs.forEach((dir, row) => {
    for (let f = 0; f < 4; f++) {
      drawChar(ctx, f * fw, row * fh, dir, f, pal, { antenna, hair });
    }
  });
  return c;
}

function grassTile(seed: number): HTMLCanvasElement {
  const c = makeCanvas(32, 32);
  const ctx = ctx2d(c);
  fill(ctx, '#5d9c4a', 0, 0, 32, 32);
  fill(ctx, '#6aab55', 0, 0, 32, 2);
  const dots = [
    [4, 7, '#4e8a3e'],
    [18, 5, '#7bbf62'],
    [9, 16, '#4e8a3e'],
    [22, 20, '#7bbf62'],
    [3, 24, '#8bcf6e'],
    [14, 28, '#4e8a3e'],
    [27, 13, '#4e8a3e'],
    [11, 3, '#8bcf6e'],
  ];
  for (const [x, y, col] of dots) {
    const xx = (Number(x) + seed * 5) % 32;
    const yy = (Number(y) + seed * 3) % 32;
    fill(ctx, String(col), xx, yy, 2, 1);
  }
  return c;
}

function pathTile(): HTMLCanvasElement {
  const c = makeCanvas(32, 32);
  const ctx = ctx2d(c);
  fill(ctx, '#d2b48a', 0, 0, 32, 32);
  fill(ctx, '#c4a574', 0, 0, 32, 1);
  fill(ctx, '#c4a574', 0, 31, 32, 1);
  dither(ctx, '#c19a6b', 0, 0, 32, 32, 4);
  fill(ctx, '#e6d0a8', 6, 9, 3, 2);
  fill(ctx, '#b89568', 20, 18, 4, 2);
  fill(ctx, '#b89568', 10, 24, 2, 2);
  return c;
}

function plazaTile(): HTMLCanvasElement {
  const c = makeCanvas(32, 32);
  const ctx = ctx2d(c);
  fill(ctx, '#cfc4b0', 0, 0, 32, 32);
  fill(ctx, '#b9ae9a', 0, 0, 32, 1);
  fill(ctx, '#b9ae9a', 0, 0, 1, 32);
  fill(ctx, '#ddd4c4', 1, 1, 15, 15);
  fill(ctx, '#d4caba', 17, 1, 14, 15);
  fill(ctx, '#d4caba', 1, 17, 15, 14);
  fill(ctx, '#ddd4c4', 17, 17, 14, 14);
  return c;
}

function flowerTile(kind: number): HTMLCanvasElement {
  const c = makeCanvas(16, 16);
  const ctx = ctx2d(c);
  // transparent bg, just flowers
  const colors = kind === 0 ? ['#ff6b9d', '#ffd166'] : kind === 1 ? ['#fff', '#c77dff'] : ['#ff8fab', '#fff'];
  fill(ctx, '#3d7a32', 3, 10, 2, 5);
  fill(ctx, '#3d7a32', 10, 9, 2, 6);
  fill(ctx, colors[0], 2, 6, 4, 4);
  fill(ctx, '#fff8b0', 3, 7, 2, 2);
  fill(ctx, colors[1], 9, 5, 4, 4);
  fill(ctx, '#fff8b0', 10, 6, 2, 2);
  return c;
}

function treeSprite(): HTMLCanvasElement {
  const c = makeCanvas(48, 64);
  const ctx = ctx2d(c);
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.beginPath();
  ctx.ellipse(24, 58, 12, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  fill(ctx, '#6b3f1d', 21, 40, 7, 18);
  fill(ctx, '#8b5a2b', 21, 40, 3, 18);
  const blobs: Array<[number, number, number, number, string]> = [
    [24, 22, 18, 16, '#2d6a4f'],
    [24, 26, 20, 14, '#40916c'],
    [24, 16, 14, 12, '#52b788'],
    [18, 24, 10, 10, '#2d6a4f'],
    [30, 24, 10, 10, '#40916c'],
  ];
  for (const [x, y, rx, ry, col] of blobs) {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  fill(ctx, '#95d5b2', 16, 10, 6, 5);
  fill(ctx, '#e76f51', 16, 22, 3, 3);
  fill(ctx, '#e76f51', 28, 18, 3, 3);
  fill(ctx, '#e9c46a', 22, 28, 3, 3);
  return c;
}

function bushSprite(): HTMLCanvasElement {
  const c = makeCanvas(24, 18);
  const ctx = ctx2d(c);
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fillRect(3, 14, 18, 4);
  fill(ctx, '#2d6a4f', 2, 6, 20, 10);
  fill(ctx, '#40916c', 4, 3, 16, 10);
  fill(ctx, '#52b788', 7, 2, 8, 5);
  fill(ctx, '#e76f51', 8, 8, 2, 2);
  fill(ctx, '#e9c46a', 15, 7, 2, 2);
  return c;
}

function lanternSprite(): HTMLCanvasElement {
  const c = makeCanvas(16, 32);
  const ctx = ctx2d(c);
  fill(ctx, '#4a3728', 7, 0, 2, 10);
  fill(ctx, '#7c2d12', 3, 10, 10, 2);
  fill(ctx, '#e85d04', 4, 12, 8, 10);
  fill(ctx, '#ffba08', 6, 14, 4, 6);
  fill(ctx, '#fff3bf', 7, 16, 2, 3);
  fill(ctx, '#7c2d12', 3, 22, 10, 2);
  fill(ctx, '#4a3728', 7, 24, 2, 4);
  return c;
}

function fountainFrames(): HTMLCanvasElement[] {
  const frames: HTMLCanvasElement[] = [];
  for (let f = 0; f < 3; f++) {
    const c = makeCanvas(64, 56);
    const ctx = ctx2d(c);
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.fillRect(8, 46, 48, 8);
    fill(ctx, '#8d8878', 8, 28, 48, 18);
    fill(ctx, '#b8b09c', 10, 30, 44, 14);
    fill(ctx, '#6e6a5c', 8, 28, 48, 3);
    fill(ctx, '#4a90c8', 14, 34, 36, 8);
    fill(ctx, '#7ec8e3', 16, 36, 32, 4);
    // pedestal
    fill(ctx, '#b8b09c', 28, 18, 8, 16);
    fill(ctx, '#d4cfc0', 24, 14, 16, 6);
    // water jet
    const h = 10 + f * 3;
    fill(ctx, '#a8e0f0', 30, 14 - h, 4, h);
    fill(ctx, '#ffffff', 31, 14 - h, 2, 3);
    // droplets
    const drops = [
      [22, 20 - f * 2],
      [40, 18 - f],
      [26, 12 + f],
      [36, 10 + (2 - f)],
    ];
    for (const [x, y] of drops) fill(ctx, '#d0f0ff', x, y, 2, 2);
    frames.push(c);
  }
  return frames;
}

function benchSprite(): HTMLCanvasElement {
  const c = makeCanvas(32, 16);
  const ctx = ctx2d(c);
  fill(ctx, '#6b3f1d', 2, 8, 28, 4);
  fill(ctx, '#8b5a2b', 2, 6, 28, 3);
  fill(ctx, '#4a3728', 4, 10, 3, 6);
  fill(ctx, '#4a3728', 25, 10, 3, 6);
  return c;
}

function buildingSprite(theme: BuildingDefTheme, labelWHint = 0): HTMLCanvasElement {
  void labelWHint;
  const w = BLDG_W;
  const h = BLDG_H;
  const c = makeCanvas(w, h);
  const ctx = ctx2d(c);
  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.fillRect(8, h - 8, w - 10, 8);

  const wallY = 48;
  const wallH = h - wallY - 4;
  // wall
  fill(ctx, theme.wall, 16, wallY, w - 32, wallH);
  fill(ctx, theme.wallDark, 16, wallY + wallH - 6, w - 32, 6);
  fill(ctx, theme.trim, 16, wallY, w - 32, 3);
  fill(ctx, theme.trim, 16, wallY, 3, wallH);
  fill(ctx, theme.trim, w - 19, wallY, 3, wallH);

  // windows 2x2
  const win = (x: number, y: number) => {
    fill(ctx, theme.trim, x, y, 18, 18);
    fill(ctx, '#7ec8e3', x + 2, y + 2, 14, 14);
    fill(ctx, '#d0f0ff', x + 3, y + 3, 5, 5);
    fill(ctx, theme.trim, x + 8, y, 2, 18);
    fill(ctx, theme.trim, x, y + 8, 18, 2);
  };
  win(32, wallY + 14);
  win(w - 50, wallY + 14);

  // door
  const dx = w / 2 - 14;
  const dy = h - 36;
  fill(ctx, theme.trim, dx, dy, 28, 32);
  fill(ctx, '#6b3f1d', dx + 2, dy + 2, 24, 30);
  fill(ctx, '#8b5a2b', dx + 3, dy + 3, 10, 28);
  fill(ctx, '#e9c46a', dx + 18, dy + 16, 3, 3);
  // transom
  fill(ctx, '#7ec8e3', dx + 8, dy + 6, 12, 6);

  // roof (tiled, slightly curved eaves)
  const roofY = 10;
  fill(ctx, theme.roofDark, 4, roofY + 28, w - 8, 14);
  // stacked trapezoid-ish layers
  for (let i = 0; i < 8; i++) {
    const t = i / 7;
    const inset = 8 + t * (w / 2 - 20);
    const yy = roofY + i * 4;
    const ww = w - inset * 2;
    fill(ctx, i % 2 === 0 ? theme.roof : theme.roofDark, inset, yy, ww, 5);
  }
  // ridge
  fill(ctx, theme.roofDark, w / 2 - 8, roofY - 2, 16, 8);
  fill(ctx, theme.accent, w / 2 - 4, roofY - 6, 8, 6);
  // eaves
  fill(ctx, theme.roofDark, 2, roofY + 36, w - 4, 6);
  fill(ctx, theme.roof, 6, roofY + 36, w - 12, 3);

  // hanging lanterns
  fill(ctx, '#e85d04', 28, wallY + 2, 6, 8);
  fill(ctx, '#ffba08', 29, wallY + 4, 4, 4);
  fill(ctx, '#e85d04', w - 34, wallY + 2, 6, 8);
  fill(ctx, '#ffba08', w - 33, wallY + 4, 4, 4);

  // sign board above door
  const sx = w / 2 - 28;
  const sy = wallY + 40;
  fill(ctx, '#4a3728', sx, sy, 56, 16);
  fill(ctx, '#f4e4c1', sx + 2, sy + 2, 52, 12);

  return c;
}

type BuildingDefTheme = {
  roof: string;
  roofDark: string;
  wall: string;
  wallDark: string;
  trim: string;
  floor: string;
  floorDark: string;
  accent: string;
};

function floorTile(theme: BuildingDefTheme): HTMLCanvasElement {
  const c = makeCanvas(32, 32);
  const ctx = ctx2d(c);
  fill(ctx, theme.floor, 0, 0, 32, 32);
  fill(ctx, theme.floorDark, 0, 15, 32, 2);
  fill(ctx, theme.floorDark, 0, 31, 32, 1);
  fill(ctx, theme.floorDark, 15, 0, 1, 32);
  return c;
}

function wallTile(theme: BuildingDefTheme): HTMLCanvasElement {
  const c = makeCanvas(32, 32);
  const ctx = ctx2d(c);
  fill(ctx, theme.wall, 0, 0, 32, 32);
  fill(ctx, theme.wallDark, 0, 0, 32, 3);
  fill(ctx, theme.trim, 0, 28, 32, 4);
  // panel
  fill(ctx, theme.wallDark, 4, 8, 24, 16);
  fill(ctx, theme.wall, 6, 10, 20, 12);
  return c;
}

function counterSprite(theme: BuildingDefTheme): HTMLCanvasElement {
  const c = makeCanvas(40, 28);
  const ctx = ctx2d(c);
  fill(ctx, theme.trim, 0, 8, 40, 20);
  fill(ctx, '#8b5a2b', 1, 9, 38, 18);
  fill(ctx, '#d4b483', 0, 4, 40, 8);
  fill(ctx, '#f0ddb6', 1, 5, 38, 3);
  fill(ctx, theme.accent, 14, 0, 12, 5);
  return c;
}

function matSprite(): HTMLCanvasElement {
  const c = makeCanvas(36, 16);
  const ctx = ctx2d(c);
  fill(ctx, '#6b3f1d', 0, 0, 36, 16);
  fill(ctx, '#8b5a2b', 2, 2, 32, 12);
  fill(ctx, '#f0ddb6', 8, 6, 20, 4);
  return c;
}

function rugSprite(accent: string): HTMLCanvasElement {
  const c = makeCanvas(64, 40);
  const ctx = ctx2d(c);
  fill(ctx, accent, 0, 0, 64, 40);
  fill(ctx, '#f4e4c1', 4, 4, 56, 32);
  fill(ctx, accent, 8, 8, 48, 24);
  fill(ctx, '#f4e4c1', 14, 12, 36, 16);
  return c;
}

function sparkSheet(): HTMLCanvasElement {
  const c = makeCanvas(32, 8);
  const ctx = ctx2d(c);
  const colors = ['#ffd166', '#fff', '#ff8fab', '#7ec8e3'];
  for (let i = 0; i < 4; i++) {
    fill(ctx, colors[i], i * 8 + 3, 3, 2, 2);
    fill(ctx, colors[i], i * 8 + 2, 2, 4, 1);
    fill(ctx, colors[i], i * 8 + 3, 1, 2, 6);
  }
  return c;
}

export function generateTextures(scene: Phaser.Scene): void {
  for (let i = 0; i < 4; i++) addTexture(scene, `grass-${i}`, grassTile(i));
  addTexture(scene, 'path', pathTile());
  addTexture(scene, 'plaza', plazaTile());
  addTexture(scene, 'flower-0', flowerTile(0));
  addTexture(scene, 'flower-1', flowerTile(1));
  addTexture(scene, 'flower-2', flowerTile(2));
  addTexture(scene, 'tree', treeSprite());
  addTexture(scene, 'bush', bushSprite());
  addTexture(scene, 'lantern', lanternSprite());
  addTexture(scene, 'bench', benchSprite());
  addTexture(scene, 'mat', matSprite());
  addTexture(scene, 'spark', sparkSheet());

  fountainFrames().forEach((c, i) => addTexture(scene, `fountain-${i}`, c));

  addSheet(scene, 'player', charSheet(false, { shirt: '#3d5a80', pants: '#2c3d55', accent: '#ffd166' }, '#2b2118'), 16, 24);

  PALETTES.forEach((p, i) => {
    addSheet(scene, `npc-${i}`, charSheet(true, p), 16, 24);
  });

  for (const b of BUILDINGS) {
    addTexture(scene, `bldg-${b.id}`, buildingSprite(b.theme));
    addTexture(scene, `floor-${b.id}`, floorTile(b.theme));
    addTexture(scene, `wall-${b.id}`, wallTile(b.theme));
    addTexture(scene, `counter-${b.id}`, counterSprite(b.theme));
    addTexture(scene, `rug-${b.id}`, rugSprite(b.theme.accent));
  }
}

export function createAnims(scene: Phaser.Scene): void {
  const mk = (key: string, texture: string, row: number, frameRate = 8) => {
    const start = row * 4;
    if (scene.anims.exists(key)) return;
    scene.anims.create({
      key,
      frames: scene.anims.generateFrameNumbers(texture, { start, end: start + 3 }),
      frameRate,
      repeat: -1,
    });
  };
  const dirs = ['down', 'left', 'right', 'up'];
  dirs.forEach((d, row) => mk(`player-${d}`, 'player', row));
  PALETTES.forEach((_, i) => {
    dirs.forEach((d, row) => mk(`npc-${i}-${d}`, `npc-${i}`, row, 6));
  });
  if (!scene.anims.exists('fountain')) {
    scene.anims.create({
      key: 'fountain',
      frames: [0, 1, 2].map((i) => ({ key: `fountain-${i}` })),
      frameRate: 4,
      repeat: -1,
    });
  }
}
