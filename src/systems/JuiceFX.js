// JuiceFX — reusable "game feel" effects
// These make everything feel punchy without cluttering GameScene.js

export default class JuiceFX {
    constructor(scene) {
        this.scene = scene;
    }

    // ============================
    // HIT-STOP: Brief freeze of PHYSICS only
    // Uses REAL-TIME setTimeout so it never locks up
    // ============================
    hitStop(duration = 40) {
        if (this.scene._hitStopping) return;
        this.scene._hitStopping = true;

        const originalPhysicsTS = this.scene.physics.world.timeScale;
        this.scene.physics.world.timeScale = 100;

        window.setTimeout(() => {
            if (!this.scene || !this.scene.physics) return;
            this.scene.physics.world.timeScale = originalPhysicsTS;
            this.scene._hitStopping = false;
        }, duration);
    }

    // ============================
    // SLOW-MO: Temporary time dilation (REAL TIME restore)
    // ============================
    slowMotion(scale = 0.3, durationMs = 200) {
        const originalPhysicsTS = this.scene.physics.world.timeScale;
        const originalTweensTS = this.scene.tweens ? this.scene.tweens.timeScale : 1;

        this.scene.physics.world.timeScale = 1 / scale;
        if (this.scene.tweens) this.scene.tweens.timeScale = scale;

        window.setTimeout(() => {
            if (!this.scene) return;
            this.scene.physics.world.timeScale = originalPhysicsTS;
            if (this.scene.tweens) this.scene.tweens.timeScale = originalTweensTS;
        }, durationMs);
    }

    // ============================
    // RECOIL: Nudge a sprite away from a direction
    // (Note: do NOT use on physics-body sprites; use scale pop instead)
    // ============================
    recoil(sprite, angle, distance = 4, durationMs = 120) {
        if (!sprite || !sprite.active) return;

        const startX = sprite.x;
        const startY = sprite.y;
        const targetX = startX - Math.cos(angle) * distance;
        const targetY = startY - Math.sin(angle) * distance;

        this.scene.tweens.add({
            targets: sprite,
            x: targetX,
            y: targetY,
            duration: durationMs * 0.3,
            ease: 'Power2',
            onComplete: () => {
                if (!sprite.active) return;
                this.scene.tweens.add({
                    targets: sprite,
                    x: startX,
                    y: startY,
                    duration: durationMs * 0.7,
                    ease: 'Back.Out'
                });
            }
        });
    }

    // ============================
    // MUZZLE FLASH: Small particles at a point
    // ============================
    muzzleFlash(x, y, angle, color = 0xffffaa) {
        const count = 4;
        for (let i = 0; i < count; i++) {
            const spread = (Math.random() - 0.5) * 0.6;
            const speed = 80 + Math.random() * 100;
            const a = angle + spread;

            const particle = this.scene.add.circle(x, y, 3, color, 1).setDepth(20);

            this.scene.tweens.add({
                targets: particle,
                x: x + Math.cos(a) * speed * 0.4,
                y: y + Math.sin(a) * speed * 0.4,
                alpha: 0,
                scale: 0.2,
                duration: 150,
                ease: 'Power2',
                onComplete: () => particle.destroy()
            });
        }
    }

    // ============================
    // IMPACT POOF: Small burst on projectile hit
    // ============================
    impactPoof(x, y, color = 0xffffff) {
        const count = 5;
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 40 + Math.random() * 60;

            const particle = this.scene.add.circle(x, y, 2, color, 1).setDepth(20);

            this.scene.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * speed,
                y: y + Math.sin(angle) * speed,
                alpha: 0,
                scale: 0,
                duration: 250,
                ease: 'Power2',
                onComplete: () => particle.destroy()
            });
        }
    }

    // ============================
    // DEATH BURST: Bigger explosion
    // ============================
    deathBurst(x, y, color = 0xff5544, count = 10) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 80 + Math.random() * 180;
            const size = 3 + Math.random() * 4;

            const particle = this.scene.add.circle(x, y, size, color, 1).setDepth(15);

            this.scene.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * speed,
                y: y + Math.sin(angle) * speed,
                alpha: 0,
                scale: 0.3,
                duration: 350 + Math.random() * 150,
                ease: 'Power2',
                onComplete: () => particle.destroy()
            });
        }

        // Ring flash
        const ring = this.scene.add.circle(x, y, 5, 0xffffff, 0)
            .setDepth(14)
            .setStrokeStyle(3, 0xffffff, 0.8);

        this.scene.tweens.add({
            targets: ring,
            scale: 8,
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: () => ring.destroy()
        });
    }

    // ============================
    // DAMAGE POPUP: Floating number with physics arc
    // ============================
    damagePopup(x, y, amount, options = {}) {
        const {
            color = '#ffff00',
            fontSize = 18,
            prefix = ''
        } = options;

        const text = this.scene.add.text(x, y, `${prefix}${amount}`, {
            fontSize: `${fontSize}px`,
            color,
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(50);

        // Randomized horizontal drift
        const driftX = (Math.random() - 0.5) * 60;
        const peakY = y - 45 - Math.random() * 15;
        const rotation = (Math.random() - 0.5) * 0.5;

        // Phase 1: fly up + drift
        this.scene.tweens.add({
            targets: text,
            x: x + driftX * 0.5,
            y: peakY,
            rotation,
            duration: 350,
            ease: 'Power2',
            onComplete: () => {
                // Phase 2: gravity fall + fade
                this.scene.tweens.add({
                    targets: text,
                    y: peakY + 40,
                    alpha: 0,
                    duration: 400,
                    ease: 'Power2',
                    onComplete: () => text.destroy()
                });
            }
        });
    }

    // ============================
    // SQUASH & STRETCH
    // ============================
    squashAndStretch(sprite, axis = 'y', amount = 0.3, durationMs = 150) {
        if (!sprite || !sprite.active) return;

        const origScaleX = sprite.scaleX;
        const origScaleY = sprite.scaleY;

        if (axis === 'y') {
            sprite.scaleY = origScaleY * (1 - amount);
            sprite.scaleX = origScaleX * (1 + amount * 0.5);
        } else {
            sprite.scaleX = origScaleX * (1 - amount);
            sprite.scaleY = origScaleY * (1 + amount * 0.5);
        }

        this.scene.tweens.add({
            targets: sprite,
            scaleX: origScaleX,
            scaleY: origScaleY,
            duration: durationMs,
            ease: 'Back.Out'
        });
    }

    // ============================
    // FLASH TINT
    // ============================
    flashTint(sprite, color = 0xffffff, durationMs = 80) {
        if (!sprite || !sprite.active) return;
        sprite.setTintFill(color);
        this.scene.time.delayedCall(durationMs, () => {
            if (sprite.active) sprite.clearTint();
        });
    }

    // ============================
    // CAMERA RECOIL
    // ============================
    cameraRecoil(angle, distance = 6) {
        const cam = this.scene.cameras.main;
        const dx = -Math.cos(angle) * distance;
        const dy = -Math.sin(angle) * distance;

        cam.setFollowOffset(dx, dy);
        const proxy = { x: dx, y: dy };
        this.scene.tweens.add({
            targets: proxy,
            x: 0,
            y: 0,
            duration: 100,
            ease: 'Power2',
            onUpdate: () => {
                cam.setFollowOffset(proxy.x, proxy.y);
            }
        });
    }

    // ============================
    // VIGNETTE PULSE
    // ============================
    vignettePulse(color = 0xff0000) {
        const cam = this.scene.cameras.main;
        cam.flash(120, (color >> 16) & 0xff, (color >> 8) & 0xff, color & 0xff);
    }
}