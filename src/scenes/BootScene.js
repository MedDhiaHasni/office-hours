import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Show a loading bar
        const { width, height } = this.scale;
        const barW = 400;
        const barH = 30;
        const barX = (width - barW) / 2;
        const barY = height / 2;

        this.add.text(width / 2, barY - 60, 'LOADING...', {
            fontSize: '32px', color: '#f1c40f', fontStyle: 'bold'
        }).setOrigin(0.5);

        const progressBg = this.add.rectangle(barX, barY, barW, barH, 0x000000)
            .setOrigin(0, 0.5).setStrokeStyle(2, 0xffffff);
        const progressBar = this.add.rectangle(barX, barY, 0, barH, 0x2ecc71)
            .setOrigin(0, 0.5);

        this.load.on('progress', (value) => {
            progressBar.width = barW * value;
        });

        // Generate emoji textures for everything
        const createEmojiTexture = (key, emoji, size = 64) => {
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            ctx.font = `${size * 0.75}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(emoji, size / 2, size / 2);
            this.textures.addCanvas(key, canvas);
        };

        // Player
        createEmojiTexture('professor', '👨‍🏫');

        // Enemies
        createEmojiTexture('freshman', '🧑‍🎓');
        createEmojiTexture('gunner', '🤓');
        createEmojiTexture('sleeper', '😴');
        createEmojiTexture('emailDemon', '📧');
        createEmojiTexture('admin', '👔');

        // Projectiles & pickups
        createEmojiTexture('grade', '📝', 48);
        createEmojiTexture('email', '✉️', 48);
        createEmojiTexture('xpGem', '📄', 40);
        createEmojiTexture('coffee', '☕', 48);
    }

    create() {
        this.scene.start('MenuScene');
    }
}