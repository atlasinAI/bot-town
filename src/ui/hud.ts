import type { BuildingId } from '../data/bots';
import { BOTS, botsIn, importUrl } from '../data/bots';
import { BUILDING_BY_ID, BUILDINGS } from '../data/buildings';
import { getRating, getSeen, setRating, seenCount, markSeen } from '../storage';
import { sfxCelebrate, sfxClose, sfxStar, sfxUi, unlockAudio } from '../audio/sfx';

export type InteractTarget =
  | { kind: 'door'; building: BuildingId; label: string }
  | { kind: 'exit'; label: string }
  | { kind: 'bot'; botId: string; label: string }
  | null;

type Handlers = {
  onStart: () => void;
  onEnterBuilding: (id: BuildingId) => void;
  onExitBuilding: () => void;
  onImport?: (url: string) => void;
};

let handlers: Handlers | null = null;
let target: InteractTarget = null;
let cardOpen = false;
let joy = { x: 0, y: 0, active: false };

export function isUiBlocking(): boolean {
  const title = document.getElementById('title-screen');
  const codex = document.getElementById('codex');
  return Boolean(
    cardOpen ||
      (title && !title.classList.contains('hidden') && title.style.display !== 'none') ||
      codex?.classList.contains('show'),
  );
}

export function isTitleVisible(): boolean {
  const title = document.getElementById('title-screen');
  return Boolean(title && !title.classList.contains('hidden'));
}

export function joystickAxis(): { x: number; y: number } {
  return { x: joy.x, y: joy.y };
}

export function initHud(h: Handlers): void {
  handlers = h;
  const start = document.getElementById('start-btn');
  start?.addEventListener('click', () => {
    unlockAudio();
    sfxUi();
    hideTitle();
    document.getElementById('hud')?.removeAttribute('hidden');
    h.onStart();
  });

  document.getElementById('codex-btn')?.addEventListener('click', () => {
    sfxUi();
    openCodex();
  });
  document.getElementById('codex-close')?.addEventListener('click', () => {
    sfxClose();
    closeCodex();
  });
  document.getElementById('codex')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('codex')) closeCodex();
  });

  document.getElementById('card-close')?.addEventListener('click', () => {
    sfxClose();
    hideCard();
  });
  document.getElementById('import-btn')?.addEventListener('click', () => {
    const id = document.getElementById('bot-card')?.getAttribute('data-bot-id');
    if (!id) return;
    const url = importUrl(id);
    sfxUi();
    if (h.onImport) h.onImport(url);
    else window.location.href = url;
  });

  document.getElementById('interact-btn')?.addEventListener('click', () => {
    tryInteract();
  });

  setupJoystick();
  setupTouchChrome();
  window.addEventListener('resize', setupTouchChrome);
}

export function hideTitle(): void {
  document.getElementById('title-screen')?.classList.add('hidden');
}

export function setPlace(name: string): void {
  const el = document.getElementById('place-chip');
  if (el) el.textContent = name;
}

export function setHint(text: string | null): void {
  const el = document.getElementById('hint');
  if (!el) return;
  if (text) {
    el.textContent = text;
    el.classList.add('show');
  } else {
    el.classList.remove('show');
    el.textContent = '';
  }
}

export function setInteractTarget(t: InteractTarget): void {
  target = t;
  const btn = document.getElementById('interact-btn') as HTMLButtonElement | null;
  if (btn) btn.disabled = !t;
  if (cardOpen) return;
  if (!t) setHint(null);
  else if (t.kind === 'door') setHint(`走近门口 · 按 E / 空格 或点击进入${t.label}`);
  else if (t.kind === 'exit') setHint('走近门口 · 按 E / 空格 或点击回到小镇');
  else setHint(`靠近 ${t.label} · 按 E / 空格 或点击查看`);
}

export function tryInteract(): boolean {
  if (isTitleVisible()) return false;
  if (document.getElementById('codex')?.classList.contains('show')) return false;
  if (cardOpen) return false;
  if (!target || !handlers) return false;
  if (target.kind === 'door') {
    handlers.onEnterBuilding(target.building);
    return true;
  }
  if (target.kind === 'exit') {
    handlers.onExitBuilding();
    return true;
  }
  if (target.kind === 'bot') {
    showBotCard(target.botId);
    return true;
  }
  return false;
}

export function showBotCard(botId: string, onFirstSeen?: (completed: BuildingId | null) => void): void {
  const bot = BOTS.find((b) => b.id === botId);
  if (!bot) return;
  const card = document.getElementById('bot-card');
  const name = document.getElementById('card-name');
  const desc = document.getElementById('card-desc');
  if (!card || !name || !desc) return;
  card.setAttribute('data-bot-id', bot.id);
  name.textContent = bot.name;
  desc.textContent = bot.description;
  renderStars(bot.id);
  card.hidden = false;
  card.classList.add('show');
  cardOpen = true;
  setHint(null);
  const { completedBuilding } = markSeen(bot.id);
  if (completedBuilding) window.setTimeout(() => celebrate(completedBuilding), 280);
  onFirstSeen?.(completedBuilding);
}

export function hideCard(): void {
  const card = document.getElementById('bot-card');
  if (card) {
    card.classList.remove('show');
    card.hidden = true;
  }
  cardOpen = false;
}

function renderStars(botId: string): void {
  const wrap = document.getElementById('card-stars');
  if (!wrap) return;
  const current = getRating(botId);
  wrap.innerHTML = '';
  for (let i = 1; i <= 5; i++) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = '★';
    b.className = i <= current ? 'on' : '';
    b.setAttribute('aria-label', `${i} 星`);
    b.addEventListener('click', () => {
      const already = getRating(botId);
      setRating(botId, already === i ? 0 : i);
      sfxStar();
      renderStars(botId);
    });
    wrap.appendChild(b);
  }
  const lab = document.createElement('span');
  lab.className = 'lab';
  lab.textContent = current ? `我的评分：${current} 星` : '点星星，给它打分';
  wrap.appendChild(lab);
}

export function openCodex(tab?: BuildingId): void {
  const root = document.getElementById('codex');
  if (!root) return;
  root.classList.add('show');
  renderCodex(tab ?? currentCodexTab);
}

export function closeCodex(): void {
  document.getElementById('codex')?.classList.remove('show');
}

let currentCodexTab: BuildingId | 'all' = 'all';

function renderCodex(tab: BuildingId | 'all'): void {
  currentCodexTab = tab;
  const tabs = document.getElementById('codex-tabs');
  const grid = document.getElementById('codex-grid');
  const prog = document.getElementById('codex-progress');
  if (!tabs || !grid || !prog) return;
  const seen = getSeen();
  tabs.innerHTML = '';
  const allBtn = document.createElement('button');
  allBtn.textContent = '全部';
  allBtn.className = tab === 'all' ? 'on' : '';
  allBtn.addEventListener('click', () => renderCodex('all'));
  tabs.appendChild(allBtn);
  for (const b of BUILDINGS) {
    const btn = document.createElement('button');
    const n = seenCount(b.id, seen);
    const t = botsIn(b.id).length;
    btn.textContent = `${b.name} ${n}/${t}`;
    btn.className = tab === b.id ? 'on' : '';
    btn.addEventListener('click', () => renderCodex(b.id));
    tabs.appendChild(btn);
  }
  const totalSeen = BOTS.filter((b) => seen.has(b.id)).length;
  prog.textContent = `已结识 ${totalSeen} / ${BOTS.length} 位 Bot`;

  const list = tab === 'all' ? BOTS : botsIn(tab);
  grid.innerHTML = '';
  for (const bot of list) {
    const known = seen.has(bot.id);
    const el = document.createElement('div');
    el.className = `codex-item${known ? '' : ' unseen'}`;
    const nm = document.createElement('div');
    nm.className = 'nm';
    nm.textContent = known ? bot.name : '？？？';
    const tag = document.createElement('div');
    tag.className = 'tag';
    tag.textContent = BUILDING_BY_ID[bot.building].name;
    el.appendChild(nm);
    el.appendChild(tag);
    if (known) {
      const st = document.createElement('div');
      st.className = 'st';
      const r = getRating(bot.id);
      st.textContent = r ? '★'.repeat(r) + '☆'.repeat(5 - r) : '还没有评分';
      el.appendChild(st);
    }
    grid.appendChild(el);
  }
}

export function celebrate(building: BuildingId): void {
  sfxCelebrate();
  const root = document.getElementById('celebrate');
  const text = document.getElementById('celebrate-text');
  if (!root || !text) return;
  const name = BUILDING_BY_ID[building].name;
  text.textContent = `${name}图鉴集齐！`;
  root.classList.add('show');
  spawnConfetti();
  window.setTimeout(() => root.classList.remove('show'), 2200);
}

function spawnConfetti(): void {
  const root = document.getElementById('celebrate');
  if (!root) return;
  const colors = ['#e9c46a', '#e76f51', '#2d6a4f', '#3d5a80', '#db2777', '#fff'];
  for (let i = 0; i < 36; i++) {
    const p = document.createElement('div');
    p.className = 'confetti';
    p.style.left = `${Math.random() * 100}%`;
    p.style.background = colors[i % colors.length];
    p.style.animationDelay = `${Math.random() * 0.3}s`;
    p.style.animationDuration = `${1 + Math.random() * 0.8}s`;
    root.appendChild(p);
    window.setTimeout(() => p.remove(), 2000);
  }
}

function setupTouchChrome(): void {
  const touch =
    window.matchMedia('(pointer: coarse)').matches ||
    'ontouchstart' in window ||
    window.innerWidth < 800;
  document.getElementById('joystick')?.classList.toggle('touch', touch);
  document.getElementById('interact-btn')?.classList.toggle('touch', touch);
}

function setupJoystick(): void {
  const root = document.getElementById('joystick');
  const knob = document.getElementById('joy-knob');
  if (!root || !knob) return;
  const radius = 40;
  const center = { x: 60, y: 60 };
  let pointerId: number | null = null;

  const setKnob = (x: number, y: number) => {
    knob.style.left = `${x - 25}px`;
    knob.style.top = `${y - 25}px`;
  };

  const onMove = (clientX: number, clientY: number) => {
    const rect = root.getBoundingClientRect();
    let x = clientX - rect.left;
    let y = clientY - rect.top;
    let dx = x - center.x;
    let dy = y - center.y;
    const mag = Math.hypot(dx, dy) || 1;
    if (mag > radius) {
      dx = (dx / mag) * radius;
      dy = (dy / mag) * radius;
    }
    setKnob(center.x + dx, center.y + dy);
    joy.x = dx / radius;
    joy.y = dy / radius;
    joy.active = true;
  };

  const end = () => {
    pointerId = null;
    joy.x = 0;
    joy.y = 0;
    joy.active = false;
    setKnob(center.x, center.y);
  };

  root.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    pointerId = e.pointerId;
    root.setPointerCapture(e.pointerId);
    onMove(e.clientX, e.clientY);
  });
  root.addEventListener('pointermove', (e) => {
    if (pointerId !== e.pointerId) return;
    onMove(e.clientX, e.clientY);
  });
  root.addEventListener('pointerup', end);
  root.addEventListener('pointercancel', end);
}
