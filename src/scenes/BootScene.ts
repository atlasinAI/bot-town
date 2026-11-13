import Phaser from 'phaser';
import { createAnims, generateTextures } from '../graphics/generateTextures';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create(): void {
    generateTextures(this);
    createAnims(this);
    this.scene.start('Town', { intro: true });
  }
}
