// DecalSystem — manages persistent floor splatters (blood, papers, coffee)
// Uses a circular buffer so we never exceed MAX_DECALS

export default class DecalSystem {
    constructor(scene, maxDecals = 60) {
        this.scene = scene;
        this.maxDecals = maxDecals;
        this.decals = []; // FIFO queue
        this.depthLayer = 1; // above floor (0), below enemies (5)
    }

    // ============================
    // BLOOD/INK SPLATTER
    // ============================
    spawnSplatter(x, y, color = 0x8b0000, size = 1) {
        // Draw a splatter cluster: 1 main blob + 3-5 small droplets
        const group = this.scene.add.container(x, y).setDepth(this.depthLayer);

        const blobCount = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < blobCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * 20 * size;
            const radius = (3 + Math.random() * 6) * size;

            const blob = this.scene.add.circle(
                Math.cos(angle) * dist,
                Math.sin(angle) * dist,
                radius,
                color,
                0.55
            );
            group.add(blob);
        }

        // Entrance animation: pop-in
        group.setScale(0.3);
        this.scene.tweens.add({
            targets: group,
            scale: 1,
            duration: 200,
            ease: 'Back.Out'
        });

        this._addDecal(group, 8000); // fade out after 8s
    }

    // ============================
    // PAPER SCRAP (from killed projectiles / students)
    // ============================
    spawnPaperScrap(x, y) {
        const scrap = this.scene.add.rectangle(x, y, 4 + Math.random() * 4, 3, 0xffffff, 0.85)
            .setDepth(this.depthLayer)
            .setRotation(Math.random() * Math.PI);

        this.scene.tweens.add({
            targets: scrap,
            x: x + (Math.random() - 0.5) * 30,
            y: y + (Math.random() - 0.5) * 30,
            rotation: scrap.rotation + (Math.random() - 0.5) * 4,
            duration: 400,
            ease: 'Power2'
        });

        this._addDecal(scrap, 6000);
    }

    // ============================
    // COFFEE STAIN
    // ============================
    spawnCoffeeStain(x, y) {
        const stain = this.scene.add.ellipse(x, y, 20 + Math.random() * 15, 14 + Math.random() * 10, 0x3d1a0f, 0.4)
            .setDepth(this.depthLayer);

        stain.setScale(0.2);
        this.scene.tweens.add({
            targets: stain,
            scale: 1,
            duration: 250,
            ease: 'Back.Out'
        });

        this._addDecal(stain, 12000);
    }

    // ============================
    // INTERNAL: queue a decal, fade it, remove oldest if over cap
    // ============================
    _addDecal(obj, lifetimeMs) {
        const decal = { obj, expiresAt: this.scene.time.now + lifetimeMs };
        this.decals.push(decal);

        // If over cap, immediately fade the oldest
        if (this.decals.length > this.maxDecals) {
            const oldest = this.decals.shift();
            if (oldest && oldest.obj && oldest.obj.active) {
                this.scene.tweens.add({
                    targets: oldest.obj,
                    alpha: 0,
                    duration: 300,
                    onComplete: () => oldest.obj.destroy()
                });
            }
        }
    }

    // ============================
    // UPDATE: check expirations
    // ============================
    update() {
        const now = this.scene.time.now;
        for (let i = this.decals.length - 1; i >= 0; i--) {
            const d = this.decals[i];
            if (now > d.expiresAt) {
                if (d.obj && d.obj.active) {
                    this.scene.tweens.add({
                        targets: d.obj,
                        alpha: 0,
                        duration: 400,
                        onComplete: () => d.obj.destroy()
                    });
                }
                this.decals.splice(i, 1);
            }
        }
    }

    // ============================
    // CLEANUP
    // ============================
    destroy() {
        this.decals.forEach(d => d.obj && d.obj.destroy());
        this.decals = [];
    }
}