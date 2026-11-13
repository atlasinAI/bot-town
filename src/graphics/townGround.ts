import { BUILDINGS, BLDG_H, BLDG_W, TOWN_H, TOWN_W, doorZone } from '../data/buildings';
import { addTexture, ctx2d, fill, makeCanvas } from './pixel';

export const PLAZA = { x: 520, y: 300, w: 240, h: 180 };

function inRect(x: number, y: number, r: { x: number; y: number; w: number; h: number }): boolean {
  return x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h;
}

function nearPath(px: number, py: number, ax: number, ay: number, bx: number, by: number, thick: number): boolean {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy || 1;
  let t = ((px - ax) * dx + (py - ay) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const qx = ax + t * dx;
  const qy = ay + t * dy;
  return Math.hypot(px - qx, py - qy) < thick;
}

function hash(x: number, y: number): number {
  let n = (x * 374761393 + y * 668265263) | 0;
  n = (n ^ (n >> 13)) * 1274126177;
  return ((n ^ (n >> 16)) >>> 0) / 4294967295;
}

export function buildTownGround(scene: Phaser.Scene): void {
  const c = makeCanvas(TOWN_W, TOWN_H);
  const ctx = ctx2d(c);

  const base = '#5b9a4a';
  fill(ctx, base, 0, 0, TOWN_W, TOWN_H);
  for (let y = 0; y < TOWN_H; y++) {
    for (let x = 0; x < TOWN_W; x++) {
      const h = hash(x, y);
      if (h < 0.04) fill(ctx, '#4e8c40', x, y, 1, 1);
      else if (h < 0.08) fill(ctx, '#6aac58', x, y, 1, 1);
      else if (h < 0.11) fill(ctx, '#4a833c', x, y, 1, 1);
    }
  }
  // soft large patches, not a hard 32px grid
  for (let i = 0; i < 120; i++) {
    const x = Math.floor(hash(i, 1) * TOWN_W);
    const y = Math.floor(hash(i, 2) * TOWN_H);
    const r = 8 + Math.floor(hash(i, 3) * 18);
    ctx.fillStyle = hash(i, 4) > 0.5 ? 'rgba(90, 160, 70, 0.28)' : 'rgba(60, 120, 50, 0.22)';
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  const doors = BUILDINGS.map((b) => {
    const d = doorZone(b);
    return { x: d.x + d.w / 2, y: d.y + d.h / 2 };
  });
  const pcx = PLAZA.x + PLAZA.w / 2;
  const pcy = PLAZA.y + PLAZA.h / 2;

  for (let y = 0; y < TOWN_H; y += 16) {
    for (let x = 0; x < TOWN_W; x += 16) {
      const cx = x + 8;
      const cy = y + 8;
      const onPlaza = inRect(cx, cy, { x: PLAZA.x - 6, y: PLAZA.y - 6, w: PLAZA.w + 12, h: PLAZA.h + 12 });
      let onPath = false;
      for (const d of doors) {
        if (nearPath(cx, cy, pcx, pcy, d.x, d.y, 28)) onPath = true;
      }
      if (onPlaza) {
        const light = ((x >> 4) + (y >> 4)) % 2 === 0;
        fill(ctx, light ? '#d8d0c2' : '#cfc6b6', x, y, 16, 16);
        fill(ctx, '#b9ae9a', x, y, 16, 1);
        fill(ctx, '#b9ae9a', x, y, 1, 16);
      } else if (onPath) {
        fill(ctx, '#d2b48a', x, y, 16, 16);
        if (hash(x, y) < 0.15) fill(ctx, '#c4a574', x + 3, y + 5, 3, 2);
        if (hash(x, y + 9) < 0.12) fill(ctx, '#b89568', x + 8, y + 9, 2, 2);
      }
    }
  }

  for (let i = 0; i < 90; i++) {
    const x = 12 + Math.floor(hash(i, 11) * (TOWN_W - 24));
    const y = 12 + Math.floor(hash(i, 19) * (TOWN_H - 24));
    const blocked =
      inRect(x, y, { x: PLAZA.x - 10, y: PLAZA.y - 10, w: PLAZA.w + 20, h: PLAZA.h + 20 }) ||
      BUILDINGS.some((b) => inRect(x, y, { x: b.x - 8, y: b.y - 8, w: BLDG_W + 16, h: BLDG_H + 20 })) ||
      doors.some((d) => Math.hypot(x - d.x, y - d.y) < 36);
    if (blocked) continue;
    const colors = i % 3 === 0 ? '#ff6b9d' : i % 3 === 1 ? '#fff8f0' : '#ffd166';
    fill(ctx, '#3d7a32', x + 1, y + 3, 1, 4);
    fill(ctx, colors, x, y, 3, 3);
    fill(ctx, '#fff8b0', x + 1, y + 1, 1, 1);
  }

  addTexture(scene, 'town-ground', c);
}
