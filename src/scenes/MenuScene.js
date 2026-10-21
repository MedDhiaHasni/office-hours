import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../main.js';
import { soundSystem } from '../systems/SoundSystem.js';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        this.cameras.main.setBackgroundColor('#2c1810');

        this.input.once('pointerdown', () => {
            if (this.sound.context && this.sound.context.state === 'suspended') {
                this.sound.context.resume();
            }
        });

        for (let i = 0; i < 40; i++) {
            this.add.rectangle(
                Phaser.Math.Between(0, GAME_WIDTH),
                Phaser.Math.Between(0, GAME_HEIGHT),
                Phaser.Math.Between(30, 100),
                4,
                0x3d2419
            ).setAlpha(0.3);
        }

        this.add.text(GAME_WIDTH / 2, 90, 'OFFICE HOURS', {
            fontSize: '68px',
            fontFamily: 'Arial',
            color: '#f1c40f',
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 6
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, 155, 'A Professor Survival Game', {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#ecf0f1',
            fontStyle: 'italic'
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, 235,
            "It's 3 PM on a Friday.\nYou just want to go home.\nBut the students keep coming.", {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#bdc3c7',
            align: 'center',
            lineSpacing: 6
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, 340, 'WASD / Arrows — MOVE', {
            fontSize: '18px', color: '#3498db', fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, 365, 'MOUSE — AIM  •  LEFT-CLICK — THROW PAPER', {
            fontSize: '16px', color: '#e67e22', fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, 400, 'Survive until 4:00 PM', {
            fontSize: '16px', color: '#e67e22', fontStyle: 'bold'
        }).setOrigin(0.5);

        const best = localStorage.getItem('officeHoursBest') || '0:00';
        this.add.text(GAME_WIDTH / 2, 440, `Best Survival: ${best}`, {
            fontSize: '16px', color: '#f39c12'
        }).setOrigin(0.5);

        const startBtn = this.add.text(GAME_WIDTH / 2, 510, '[ START OFFICE HOURS ]', {
            fontSize: '26px',
            fontFamily: 'Arial',
            color: '#2ecc71',
            backgroundColor: '#000',
            padding: { x: 24, y: 12 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        startBtn.on('pointerover', () => startBtn.setColor('#ffffff'));
        startBtn.on('pointerout', () => startBtn.setColor('#2ecc71'));
        startBtn.on('pointerdown', () => {
            soundSystem.play('uiClick');
            this.scene.start('GameScene');
        });

        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 25,
            "💡 Tip: Keep moving. The horde does not stop.", {
            fontSize: '13px', color: '#7f8c8d', fontStyle: 'italic'
        }).setOrigin(0.5);
    }
}