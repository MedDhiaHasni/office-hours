import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../main.js';

export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }

    init(data) {
        this.victory = data.victory;
        this.kills = data.kills;
        this.timeMs = data.timeMs;
    }

    create() {
        this.cameras.main.setBackgroundColor(this.victory ? '#1a3a1a' : '#3a1a1a');

        const title = this.victory ? '🎉 YOU SURVIVED! 🎉' : '💀 TENURE DENIED 💀';
        const color = this.victory ? '#2ecc71' : '#e74c3c';

        this.add.text(GAME_WIDTH / 2, 120, title, {
            fontSize: '56px',
            fontFamily: 'Arial',
            color,
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 6
        }).setOrigin(0.5);

        const sub = this.victory
            ? '4:00 PM. You made it to the weekend.'
            : 'The students have won. Rate My Professor will hear of this.';
        this.add.text(GAME_WIDTH / 2, 190, sub, {
            fontSize: '20px',
            color: '#ecf0f1',
            fontStyle: 'italic',
            align: 'center',
            wordWrap: { width: 600 }
        }).setOrigin(0.5);

        // Stats
        const mm = Math.floor(this.timeMs / 60000);
        const ss = Math.floor((this.timeMs % 60000) / 1000);
        const timeStr = `${mm}:${ss.toString().padStart(2, '0')}`;

        this.add.text(GAME_WIDTH / 2, 300, `⏱️  Survived: ${timeStr}`, {
            fontSize: '26px', color: '#f1c40f'
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, 345, `🎓 Students Defeated: ${this.kills}`, {
            fontSize: '26px', color: '#f1c40f'
        }).setOrigin(0.5);

        // Best score tracking
        const bestStr = localStorage.getItem('officeHoursBest') || '0:00';
        const [bMin, bSec] = bestStr.split(':').map(Number);
        const bestMs = bMin * 60000 + bSec * 1000;

        if (this.timeMs > bestMs) {
            localStorage.setItem('officeHoursBest', timeStr);
            this.add.text(GAME_WIDTH / 2, 400, '🏆 NEW BEST TIME!', {
                fontSize: '28px', color: '#e67e22', fontStyle: 'bold'
            }).setOrigin(0.5);
        } else {
            this.add.text(GAME_WIDTH / 2, 400, `Best: ${bestStr}`, {
                fontSize: '20px', color: '#95a5a6'
            }).setOrigin(0.5);
        }

        // Retry
        const retryBtn = this.add.text(GAME_WIDTH / 2, 490, '[ PLAY AGAIN ]', {
            fontSize: '28px',
            color: '#2ecc71',
            backgroundColor: '#000',
            padding: { x: 24, y: 12 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        retryBtn.on('pointerover', () => retryBtn.setColor('#fff'));
        retryBtn.on('pointerout', () => retryBtn.setColor('#2ecc71'));
        retryBtn.on('pointerdown', () => this.scene.start('GameScene'));

        // Menu
        const menuBtn = this.add.text(GAME_WIDTH / 2, 555, 'Menu', {
            fontSize: '18px', color: '#95a5a6'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        menuBtn.on('pointerdown', () => this.scene.start('MenuScene'));
    }
}