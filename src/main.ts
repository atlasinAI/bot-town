import Phaser from 'phaser';
import './style.css';
import type { BuildingId } from './data/bots';
import { countByBuilding } from './data/bots';
import { BUILDING_BY_ID } from './data/buildings';
import { hideCard, hideTitle, initHud, isTitleVisible, showBotCard } from './ui/hud';
import { BootScene } from './scenes/BootScene';
import { BuildingScene } from './scenes/BuildingScene';
import { TownScene } from './scenes/TownScene';

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game-container',
  backgroundColor: '#0e1a12',
  pixelArt: true,
  antialias: false,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: window.innerWidth,
    height: window.innerHeight,
    min: { width: 320, height: 480 },
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [BootScene, TownScene, BuildingScene],
  input: {
    keyboard: true,
    mouse: { preventDefaultWheel: false },
    touch: { capture: false },
  },
  callbacks: {
    postBoot: () => {
      hookApi();
    },
  },
});

function currentTown(): TownScene | null {
  const s = game.scene.getScene('Town');
  return game.scene.isActive('Town') ? (s as TownScene) : null;
}

function currentBuilding(): BuildingScene | null {
  const s = game.scene.getScene('Building');
  return game.scene.isActive('Building') ? (s as BuildingScene) : null;
}

function hookApi(): void {
  initHud({
    onStart: () => {
      const town = game.scene.getScene('Town') as TownScene;
      town.cameras?.main?.fadeIn(200, 14, 26, 18);
    },
    onEnterBuilding: (id: BuildingId) => {
      hideCard();
      currentTown()?.enter(id);
    },
    onExitBuilding: () => {
      hideCard();
      currentBuilding()?.leave();
    },
    onImport: (url: string) => {
      window.location.href = url;
    },
  });
}

export type BotTownApi = {
  ready: boolean;
  scene: () => string;
  start: () => void;
  enterBuilding: (id: BuildingId) => void;
  goToTown: () => void;
  openBot: (id: string) => void;
  counts: Record<BuildingId, number>;
};

function sceneName(): string {
  if (isTitleVisible()) return 'Title';
  if (game.scene.isActive('Building')) return 'Building';
  if (game.scene.isActive('Town')) return 'Town';
  return 'Boot';
}

window.__botTown = {
  ready: false,
  scene: sceneName,
  start: () => {
    if (isTitleVisible()) {
      hideTitle();
      document.getElementById('hud')?.removeAttribute('hidden');
    }
  },
  enterBuilding: (id: BuildingId) => {
    if (isTitleVisible()) window.__botTown?.start();
    hideCard();
    if (game.scene.isActive('Building')) {
      const cur = currentBuilding();
      if (cur) {
        game.scene.stop('Building');
      }
    }
    if (!BUILDING_BY_ID[id]) return;
    game.scene.start('Building', { building: id });
    game.scene.stop('Town');
  },
  goToTown: () => {
    if (isTitleVisible()) window.__botTown?.start();
    hideCard();
    game.scene.start('Town', {});
    game.scene.stop('Building');
  },
  openBot: (id: string) => {
    if (isTitleVisible()) window.__botTown?.start();
    showBotCard(id);
  },
  counts: countByBuilding(),
};

game.events.once(Phaser.Core.Events.READY, () => {
  window.setTimeout(() => {
    if (window.__botTown) window.__botTown.ready = true;
  }, 200);
});

declare global {
  interface Window {
    __botTown?: BotTownApi;
  }
}
