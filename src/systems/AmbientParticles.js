// AmbientParticles — floating dust motes that drift around the player
// Cheap to render (uses rectangles), constantly recycled

export default class AmbientParticles {
    constructor(scene, count = 40) {
        this.scene = scene;
        this.particles = [];

        for (let i = 0; i < count; i++) {
            this._spawn();
        }
    }

    _spawn() {
        const cam = this.scene.cameras.main;
        // Spawn somewhere within the current camera view + margin
        const x = cam.scrollX - 100 + Math.random() * (cam.width + 200);
        const y = cam.scrollY - 100 + Math.random() * (cam.height + 200);

        const size = 1 + Math.random() * 2;
        const alpha = 0.08 + Math.random() * 0.15;

        const p = this.scene.add.rectangle(x, y, size, size, 0xfffbe0)
            .setAlpha(alpha)
            .setDepth(2);

        this.particles.push({
            obj: p,
            vx: (Math.random() - 0.5) * 0.3,
            vy: -0.1 - Math.random() * 0.2,
            drift: Math.random() * 0.02,
            wobblePhase: Math.random() * Math.PI * 2
        });
    }

    update() {
        const cam = this.scene.cameras.main;
        const t = this.scene.time.now * 0.001;

        this.particles.forEach(p => {
            if (!p.obj || !p.obj.active) return;

            // Drift
            p.obj.x += p.vx + Math.sin(t + p.wobblePhase) * p.drift;
            p.obj.y += p.vy;

            // Recycle if off-screen or too far from camera
            const dx = p.obj.x - cam.scrollX;
            const dy = p.obj.y - cam.scrollY;
            if (dx < -150 || dx > cam.width + 150 ||
                dy < -150 || dy > cam.height + 150) {
                // Respawn at bottom of camera
                p.obj.x = cam.scrollX + Math.random() * cam.width;
                p.obj.y = cam.scrollY + cam.height + 20;
            }
        });
    }

    destroy() {
        this.particles.forEach(p => p.obj && p.obj.destroy());
        this.particles = [];
    }
}