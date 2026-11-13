export type Ctx = CanvasRenderingContext2D;

export function makeCanvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  if (!ctx) throw new Error('2d context');
  ctx.imageSmoothingEnabled = false;
  return c;
}

export function ctx2d(c: HTMLCanvasElement): Ctx {
  const ctx = c.getContext('2d');
  if (!ctx) throw new Error('2d context');
  ctx.imageSmoothingEnabled = false;
  return ctx;
}

export function fill(ctx: Ctx, color: string, x: number, y: number, w: number, h: number): void {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

export function px(ctx: Ctx, color: string, x: number, y: number, s = 1): void {
  fill(ctx, color, x, y, s, s);
}

export function dither(ctx: Ctx, color: string, x: number, y: number, w: number, h: number, step = 2): void {
  ctx.fillStyle = color;
  for (let yy = y; yy < y + h; yy++) {
    for (let xx = x; xx < x + w; xx++) {
      if (((xx + yy) & (step * 2 - 1)) === 0) ctx.fillRect(xx, yy, 1, 1);
    }
  }
}

export function addTexture(scene: Phaser.Scene, key: string, canvas: HTMLCanvasElement): void {
  if (scene.textures.exists(key)) scene.textures.remove(key);
  scene.textures.addCanvas(key, canvas);
  const tex = scene.textures.get(key);
  tex.setFilter(Phaser.Textures.FilterMode.NEAREST);
}

export function addSheet(
  scene: Phaser.Scene,
  key: string,
  canvas: HTMLCanvasElement,
  frameWidth: number,
  frameHeight: number,
): void {
  if (scene.textures.exists(key)) scene.textures.remove(key);
  const tex = scene.textures.addCanvas(key, canvas);
  if (!tex) throw new Error(`texture ${key} failed`);
  tex.setFilter(Phaser.Textures.FilterMode.NEAREST);
  const cols = Math.floor(canvas.width / frameWidth);
  const rows = Math.floor(canvas.height / frameHeight);
  let i = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      tex.add(String(i), 0, col * frameWidth, row * frameHeight, frameWidth, frameHeight);
      i += 1;
    }
  }
}
