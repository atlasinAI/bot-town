let ctx: AudioContext | null = null;

function ac(): AudioContext | null {
  try {
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function beep(freq: number, dur: number, type: OscillatorType, gain = 0.06, at = 0): void {
  const c = ac();
  if (!c) return;
  const t = c.currentTime + at;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(c.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

export function unlockAudio(): void {
  ac();
}

export function sfxStep(): void {
  beep(180 + Math.random() * 40, 0.04, 'square', 0.015);
}

export function sfxUi(): void {
  beep(520, 0.07, 'triangle', 0.05);
}

export function sfxDoor(): void {
  beep(240, 0.1, 'square', 0.05);
  beep(360, 0.12, 'square', 0.04, 0.07);
}

export function sfxStar(): void {
  beep(660, 0.08, 'triangle', 0.05);
  beep(880, 0.1, 'triangle', 0.04, 0.06);
}

export function sfxCelebrate(): void {
  const notes = [523, 659, 784, 1046];
  notes.forEach((n, i) => beep(n, 0.18, 'triangle', 0.06, i * 0.08));
}

export function sfxClose(): void {
  beep(300, 0.06, 'triangle', 0.04);
}
