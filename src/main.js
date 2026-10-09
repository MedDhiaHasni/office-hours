import Phaser from 'phaser';
import './style.css';

import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import LevelUpScene from './scenes/LevelUpScene.js';
import GameOverScene from './scenes/GameOverScene.js';

export const GAME_WIDTH = 900;
export const GAME_HEIGHT = 600;

const config = {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent: 'app',
    backgroundColor: '#2c1810',
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [BootScene, MenuScene, GameScene, LevelUpScene, GameOverScene]
};

new Phaser.Game(config);