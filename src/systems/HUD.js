import { GAME_WIDTH } from '../main.js';

export default class HUD {
    constructor(scene) {
        this.scene = scene;

        // Top bar background
        scene.add.rectangle(0, 0, GAME_WIDTH, 50, 0x000000, 0.6)
            .setOrigin(0, 0).setScrollFactor(0).setDepth(100);

        // Clock (top center)
        this.clockText = scene.add.text(GAME_WIDTH / 2, 25, '3:00 PM', {
            fontSize: '26px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(101);

        // XP bar (top left)
        this.xpBarBg = scene.add.rectangle(15, 60, 250, 14, 0x000000)
            .setOrigin(0, 0).setScrollFactor(0).setDepth(101)
            .setStrokeStyle(2, 0xffffff);
        this.xpBarFill = scene.add.rectangle(15, 60, 0, 14, 0x2ecc71)
            .setOrigin(0, 0).setScrollFactor(0).setDepth(102);
        this.levelText = scene.add.text(270, 60, 'Lv.1', {
            fontSize: '16px', color: '#2ecc71', fontStyle: 'bold'
        }).setScrollFactor(0).setDepth(102);

        // HP (top right)
        this.hpText = scene.add.text(GAME_WIDTH - 15, 15, '❤️❤️❤️', {
            fontSize: '24px'
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(101);

        // Kill counter (top right below HP)
        this.killText = scene.add.text(GAME_WIDTH - 15, 60, '🎓 0', {
            fontSize: '16px', color: '#ffffff'
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(101);

        // Wave message (center)
        this.waveMessage = scene.add.text(GAME_WIDTH / 2, 120, '', {
            fontSize: '36px',
            fontFamily: 'Arial',
            color: '#f39c12',
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0).setDepth(103).setAlpha(0);
    }

    updateClock(msRemaining) {
        // Total run = 5 minutes. Start at 3:00 PM, end at 4:00 PM.
        const totalMs = 5 * 60 * 1000;
        const elapsed = totalMs - msRemaining;
        const minutesElapsed = Math.floor(elapsed / 60000);
        const startHour = 3;
        const hour = startHour + Math.floor(minutesElapsed / 60);
        const minute = minutesElapsed % 60;
        const suffix = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour;
        this.clockText.setText(`${displayHour}:${minute.toString().padStart(2, '0')} ${suffix}`);

        // Turn red in the last minute
        if (msRemaining < 60000) {
            this.clockText.setColor('#e74c3c');
        } else {
            this.clockText.setColor('#ffffff');
        }
    }

    updateXP(current, needed, level) {
        const pct = Math.min(1, current / needed);
        this.xpBarFill.width = 250 * pct;
        this.levelText.setText(`Lv.${level}`);
    }

    updateHP(hp, maxHp) {
        const hearts = '❤️'.repeat(Math.max(0, hp)) + '🖤'.repeat(Math.max(0, maxHp - hp));
        this.hpText.setText(hearts);
    }

    updateKills(count) {
        this.killText.setText(`🎓 ${count}`);
    }

    showWaveMessage(text) {
        this.waveMessage.setText(text);
        this.waveMessage.setAlpha(1);
        this.scene.tweens.add({
            targets: this.waveMessage,
            alpha: 0,
            duration: 2500,
            delay: 1000,
            ease: 'Power2'
        });
    }
}