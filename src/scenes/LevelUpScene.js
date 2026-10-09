import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../main.js';
import { pickRandomUpgrades } from '../systems/UpgradeSystem.js';
import { soundSystem } from '../systems/SoundSystem.js';

export default class LevelUpScene extends Phaser.Scene {
    constructor() {
        super('LevelUpScene');
    }

    init(data) {
        this.gameScene = data.gameScene;
        this.playerStats = data.playerStats;
        this._chosen = false;
    }

    create() {
        // CRITICAL: guarantee input is enabled
        this.input.enabled = true;

        // Dark overlay blocks stray clicks
        this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.78)
            .setOrigin(0, 0)
            .setInteractive();

        this.add.text(GAME_WIDTH / 2, 80, '⭐ LEVEL UP! ⭐', {
            fontSize: '52px',
            fontFamily: 'Arial',
            color: '#f1c40f',
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 6
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, 140, 'Pick an upgrade', {
            fontSize: '20px',
            color: '#ecf0f1',
            fontStyle: 'italic'
        }).setOrigin(0.5);

        const choices = pickRandomUpgrades(3, this.playerStats);
        const cardW = 220;
        const cardH = 300;
        const gap = 30;
        const totalW = choices.length * cardW + (choices.length - 1) * gap;
        const startX = (GAME_WIDTH - totalW) / 2;

        choices.forEach((up, i) => {
            const x = startX + i * (cardW + gap) + cardW / 2;
            const y = GAME_HEIGHT / 2 + 50;
            this.createCard(x, y, cardW, cardH, up);
        });
    }

    createCard(x, y, w, h, upgrade) {
        const container = this.add.container(x, y);

        const bg = this.add.rectangle(0, 0, w, h, 0x1a1a2e)
            .setStrokeStyle(3, upgrade.color)
            .setInteractive({ useHandCursor: true });

        container.add(bg);

        const icon = this.add.text(0, -80, upgrade.icon, {
            fontSize: '64px'
        }).setOrigin(0.5);
        container.add(icon);

        const name = this.add.text(0, 0, upgrade.name, {
            fontSize: '22px',
            color: '#ffffff',
            fontStyle: 'bold',
            align: 'center',
            wordWrap: { width: w - 20 }
        }).setOrigin(0.5);
        container.add(name);

        const desc = this.add.text(0, 60, upgrade.desc, {
            fontSize: '16px',
            color: '#bdc3c7',
            align: 'center',
            wordWrap: { width: w - 30 }
        }).setOrigin(0.5);
        container.add(desc);

        bg.on('pointerover', () => {
            this.tweens.add({ targets: container, scale: 1.08, duration: 150 });
            bg.setFillStyle(0x2c2c4e);
        });
        bg.on('pointerout', () => {
            this.tweens.add({ targets: container, scale: 1, duration: 150 });
            bg.setFillStyle(0x1a1a2e);
        });
        bg.on('pointerdown', (pointer, lx, ly, event) => {
            if (event) event.stopPropagation();
            this.selectUpgrade(upgrade, container);
        });
    }

    selectUpgrade(upgrade, container) {
        if (this._chosen) return;
        this._chosen = true;

        try {
            upgrade.apply(this.gameScene.player);
        } catch (err) {
            console.warn('Upgrade apply error:', err);
        }

        this.tweens.add({
            targets: container,
            scale: 1.3,
            alpha: 0,
            duration: 300,
            onComplete: () => {
                // Resume GameScene BEFORE stopping this scene
                if (this.gameScene && this.gameScene.scene) {
                    this.gameScene.scene.resume('GameScene');
                    try {
                        this.gameScene.hud.updateHP(this.playerStats.hp, this.playerStats.maxHp);
                        this.gameScene.hud.updateXP(0, this.playerStats.xpNeeded, this.playerStats.level);
                    } catch (e) { /* HUD might not be ready */ }
                }
                this.scene.stop();
            }
        });
    }
}