import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../main.js';
import HUD from '../systems/HUD.js';
import JuiceFX from '../systems/JuiceFX.js';
import DecalSystem from '../systems/DecalSystem.js';
import AmbientParticles from '../systems/AmbientParticles.js';
import { WAVES, getEnemyConfig, pickRandomEnemyType } from '../systems/WaveSystem.js';
import { soundSystem } from '../systems/SoundSystem.js';

const RUN_DURATION_MS = 5 * 60 * 1000;
const WORLD_SIZE = 2400;

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        this.gameSceneRef = this;
        this._ended = false;

        // === JUICE ===
        this.fx = new JuiceFX(this);
        this._hitStopping = false;

        // === STATE ===
        this.timeRemaining = RUN_DURATION_MS;
        this.kills = 0;
        this.wavesTriggered = new Set();
        this.lastFired = 0;

        this.playerStats = {
            maxHp: 5,
            hp: 5,
            moveSpeed: 220,
            fireRate: 500,
            damage: 1,
            projectiles: 1,
            pickupRange: 80,
            pierce: 0,
            hasRant: false,
            xp: 0,
            level: 1,
            xpNeeded: 5
        };

        // === WORLD ===
        this.physics.world.setBounds(0, 0, WORLD_SIZE, WORLD_SIZE);
        this.cameras.main.setBounds(0, 0, WORLD_SIZE, WORLD_SIZE);
        this.cameras.main.setBackgroundColor('#3d2419');

        // Faux floor streaks
        for (let i = 0; i < 300; i++) {
            this.add.rectangle(
                Phaser.Math.Between(0, WORLD_SIZE),
                Phaser.Math.Between(0, WORLD_SIZE),
                Phaser.Math.Between(20, 80),
                3,
                0x241610
            ).setAlpha(0.4);
        }

        // === PLAYER ===
        this.player = this.physics.add.sprite(WORLD_SIZE / 2, WORLD_SIZE / 2, 'professor');
        this.player.setScale(1.6).setDepth(10).setCollideWorldBounds(true);
        this.player.body.setCircle(20, 12, 12);
        this.player.stats = this.playerStats;
        this.player.baseScale = 1.6;

        // === INPUT ===
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys({
            up: 'W', down: 'S', left: 'A', right: 'D'
        });

        // === GROUPS ===
        this.enemies = this.physics.add.group();
        this.projectiles = this.physics.add.group();
        this.enemyProjectiles = this.physics.add.group();
        this.xpGems = this.physics.add.group();

        // === HUD ===
        this.hud = new HUD(this);
        this.hud.updateHP(this.playerStats.hp, this.playerStats.maxHp);
        this.hud.updateXP(this.playerStats.xp, this.playerStats.xpNeeded, this.playerStats.level);

        // === SYSTEMS ===
        this.decals = new DecalSystem(this, 60);
        this.ambient = new AmbientParticles(this, 40);

        // === COLLISIONS ===
        this.physics.add.overlap(this.player, this.enemies, this.onPlayerHitEnemy, null, this);
        this.physics.add.overlap(this.projectiles, this.enemies, this.onProjectileHitEnemy, null, this);
        this.physics.add.overlap(this.player, this.enemyProjectiles, this.onPlayerHitEnemyProjectile, null, this);
        this.physics.add.overlap(this.player, this.xpGems, this.onCollectGem, null, this);

        // === TIMERS ===
        this.spawnTimer = this.time.addEvent({
            delay: 900, callback: this.dripSpawn, callbackScope: this, loop: true
        });
        this.rantTimer = this.time.addEvent({
            delay: 4000, callback: this.doRant, callbackScope: this, loop: true
        });
        this.waveChecker = this.time.addEvent({
            delay: 500, callback: this.checkWaves, callbackScope: this, loop: true
        });

        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.dripSpawn();
        this.dripSpawn();

        this.input.setDefaultCursor('crosshair');
    }

    update(time, delta) {
        if (!this.player.active) return;

        this.timeRemaining -= delta;
        this.hud.updateClock(Math.max(0, this.timeRemaining));

        // Tick atmosphere systems
        this.decals.update();
        this.ambient.update();

        // MOVEMENT
        const stats = this.playerStats;
        let vx = 0, vy = 0;
        if (this.cursors.left.isDown || this.keys.left.isDown) vx = -1;
        else if (this.cursors.right.isDown || this.keys.right.isDown) vx = 1;
        if (this.cursors.up.isDown || this.keys.up.isDown) vy = -1;
        else if (this.cursors.down.isDown || this.keys.down.isDown) vy = 1;

        if (vx !== 0 && vy !== 0) { vx *= 0.707; vy *= 0.707; }
        this.player.setVelocity(vx * stats.moveSpeed, vy * stats.moveSpeed);

        // MANUAL MOUSE AIMING
        const pointer = this.input.activePointer;
        const worldPoint = pointer.positionToCamera(this.cameras.main);
        const aimAngle = Phaser.Math.Angle.Between(
            this.player.x, this.player.y,
            worldPoint.x, worldPoint.y
        );
        this.player.setRotation(aimAngle + Math.PI / 2);

        // FIRE
        if (pointer.isDown && time > this.lastFired) {
            this.fireProjectileAtAngle(aimAngle);
            this.lastFired = time + stats.fireRate;
        }

        // XP GEM MAGNET
        this.xpGems.getChildren().forEach(gem => {
            if (!gem.active) return;
            const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, gem.x, gem.y);
            if (d < stats.pickupRange) {
                const angle = Phaser.Math.Angle.Between(gem.x, gem.y, this.player.x, this.player.y);
                this.physics.velocityFromRotation(angle, 350, gem.body.velocity);
            } else {
                gem.setVelocity(0, 0);
            }
            if (d > 2000) gem.destroy();
        });

        // ENEMY AI WITH WOBBLE
        const t = time * 0.001;
        this.enemies.getChildren().forEach(enemy => {
            if (!enemy.active || !enemy.body) return;
            const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
            const speed = enemy.enemyConfig.speed;
            enemy.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);

            // WOBBLE: rotate side-to-side based on a per-enemy phase
            if (!enemy.wobblePhase) enemy.wobblePhase = Math.random() * Math.PI * 2;
            const wobble = Math.sin(t * 8 + enemy.wobblePhase) * 0.25;
            enemy.setRotation(angle + Math.PI / 2 + wobble);

            if (enemy.enemyConfig.ranged) {
                const now = this.time.now;
                const cooldown = enemy.enemyConfig.fireCooldown || 2000;
                if (now - enemy.lastShot > cooldown) {
                    enemy.lastShot = now;
                    this.enemyShoot(enemy);
                }
            }

            const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
            if (d > 2500) enemy.destroy();
        });

        // CLEANUP
        this.projectiles.getChildren().forEach(p => {
            if (!p.active) return;
            const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, p.x, p.y);
            if (d > 1400) p.destroy();
        });
        this.enemyProjectiles.getChildren().forEach(p => {
            if (!p.active) return;
            const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, p.x, p.y);
            if (d > 1400) p.destroy();
        });

        if (this.timeRemaining <= 0) this.winGame();
    }

    fireProjectileAtAngle(angle) {
        const stats = this.playerStats;
        const proj = this.projectiles.create(this.player.x, this.player.y, 'grade');
        if (!proj) return;
        proj.setScale(0.8).setDepth(8);
        proj.damage = stats.damage;
        proj.pierceLeft = stats.pierce;

        this.physics.velocityFromRotation(angle, 550, proj.body.velocity);
        proj.setRotation(angle);

        // JUICE: Spawn pop-in
        proj.setScale(0.2);
        this.tweens.add({
            targets: proj, scale: 0.9, duration: 100, ease: 'Back.Out'
        });

        // TRAIL: fading ghost trails behind projectile
        for (let i = 1; i <= 2; i++) {
            const ghost = this.add.image(proj.x, proj.y, 'grade')
                .setScale(0.6 - i * 0.15)
                .setAlpha(0.4 - i * 0.15)
                .setDepth(6)
                .setRotation(angle);
            this.tweens.add({
                targets: ghost,
                alpha: 0,
                scale: 0.1,
                duration: 250,
                delay: i * 60,
                onComplete: () => ghost.destroy()
            });
        }

        // JUICE: muzzle flash
        const muzzleX = this.player.x + Math.cos(angle) * 20;
        const muzzleY = this.player.y + Math.sin(angle) * 20;
        this.fx.muzzleFlash(muzzleX, muzzleY, angle, 0xffffaa);

        // JUICE: camera recoil
        this.fx.cameraRecoil(angle, 4);

        // JUICE: player "punch" — scale pop instead of position recoil
        const baseScale = this.player.baseScale || 1.6;
        this.player.setScale(baseScale * 1.12, baseScale * 0.9);
        this.tweens.add({
            targets: this.player,
            scaleX: baseScale,
            scaleY: baseScale,
            duration: 120,
            ease: 'Back.Out'
        });

        soundSystem.play('shoot');
    }

    enemyShoot(enemy) {
        const proj = this.enemyProjectiles.create(enemy.x, enemy.y, 'email');
        if (!proj) return;
        proj.setScale(0.7).setDepth(7);
        const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
        this.physics.velocityFromRotation(angle, 250, proj.body.velocity);
        proj.setRotation(angle);

        this.fx.muzzleFlash(enemy.x, enemy.y, angle, 0xaaddff);
    }

    dripSpawn() {
        const elapsed = RUN_DURATION_MS - this.timeRemaining;
        const type = pickRandomEnemyType(elapsed);
        this.spawnEnemy(type);
    }

    spawnEnemy(type) {
        const cfg = getEnemyConfig(type);
        const angle = Math.random() * Math.PI * 2;
        const dist = 700 + Math.random() * 200;
        const x = Phaser.Math.Clamp(this.player.x + Math.cos(angle) * dist, 50, WORLD_SIZE - 50);
        const y = Phaser.Math.Clamp(this.player.y + Math.sin(angle) * dist, 50, WORLD_SIZE - 50);

        const enemy = this.enemies.create(x, y, cfg.texture);
        if (!enemy) return;
        enemy.setDepth(5);
        enemy.setTint(cfg.tint);
        enemy.hp = cfg.hp;
        enemy.maxHp = cfg.hp;
        enemy.enemyConfig = cfg;
        enemy.lastShot = 0;
        enemy.wobblePhase = Math.random() * Math.PI * 2;
        enemy.body.setCircle(15, 17, 17);

        const targetScale = cfg.isBoss ? 2.5 : 1.4;
        enemy.setScale(0);
        this.tweens.add({
            targets: enemy,
            scale: targetScale,
            duration: 250,
            ease: 'Back.Out'
        });
    }

    checkWaves() {
        const elapsed = RUN_DURATION_MS - this.timeRemaining;
        WAVES.forEach((wave, i) => {
            if (this.wavesTriggered.has(i)) return;
            if (elapsed >= wave.time) {
                this.wavesTriggered.add(i);
                this.triggerWave(wave);
            }
        });
    }

    triggerWave(wave) {
        this.hud.showWaveMessage(wave.message);
        this.cameras.main.flash(400, 255, 200, 0);

        // ZOOM OUT briefly for dramatic effect
        const cam = this.cameras.main;
        cam.setZoom(1.05);
        this.tweens.add({
            targets: cam,
            zoom: 1,
            duration: 600,
            ease: 'Power2'
        });

        if (wave.type === 'burst' || wave.type === 'boss') {
            for (let i = 0; i < wave.count; i++) {
                this.time.delayedCall(i * 120, () => {
                    if (this.player.active) this.spawnEnemy(wave.enemy);
                });
            }
        } else if (wave.type === 'mix') {
            for (let i = 0; i < wave.count; i++) {
                this.time.delayedCall(i * 100, () => {
                    if (!this.player.active) return;
                    const types = ['freshman', 'gunner', 'sleeper', 'emailDemon'];
                    this.spawnEnemy(Phaser.Utils.Array.GetRandom(types));
                });
            }
        }
    }

    onProjectileHitEnemy(proj, enemy) {
        if (!proj.active || !enemy.active) return;

        enemy.hp -= proj.damage;

        this.fx.impactPoof(proj.x, proj.y, 0xffddaa);
        this.decals.spawnPaperScrap(proj.x, proj.y);
        this.fx.flashTint(enemy, 0xffffff, 60);
        this.fx.damagePopup(enemy.x, enemy.y - 10, proj.damage, {
            color: '#ffff00', fontSize: 18
        });

        this.cameras.main.shake(40, 0.002);
        soundSystem.play('hit');

        if (enemy.hp <= 0) {
            this.killEnemy(enemy);
        }

        if (proj.pierceLeft > 0) {
            proj.pierceLeft--;
        } else {
            proj.destroy();
        }
    }

    killEnemy(enemy) {
        soundSystem.play('kill');

        this.fx.hitStop(40);
        this.fx.deathBurst(enemy.x, enemy.y, 0xff5544, enemy.enemyConfig.isBoss ? 20 : 10);

        // FLOOR DECAL: splatter where the enemy died
        const splatterColor = enemy.enemyConfig.isBoss ? 0x4a0000 : 0x8b0000;
        this.decals.spawnSplatter(enemy.x, enemy.y, splatterColor, enemy.enemyConfig.isBoss ? 1.5 : 1);
        for (let i = 0; i < 3; i++) {
            this.decals.spawnPaperScrap(
                enemy.x + (Math.random() - 0.5) * 30,
                enemy.y + (Math.random() - 0.5) * 30
            );
        }

        this.fx.squashAndStretch(enemy, 'y', 0.5, 100);
        this.cameras.main.shake(80, 0.004);

        // ZOOM PULSE on kill
        const cam = this.cameras.main;
        this.tweens.add({
            targets: cam,
            zoom: 1.015,
            duration: 60,
            yoyo: true,
            ease: 'Power2'
        });

        const count = enemy.enemyConfig.isBoss ? 5 : 1;
        for (let i = 0; i < count; i++) {
            this.time.delayedCall(i * 40, () => {
                if (!this.scene.isActive()) return;
                const gem = this.xpGems.create(enemy.x, enemy.y, 'xpGem');
                if (gem) {
                    gem.setScale(0.6).setDepth(3);
                    const a = Math.random() * Math.PI * 2;
                    gem.setVelocity(Math.cos(a) * 80, Math.sin(a) * 80);
                    gem.setScale(0);
                    this.tweens.add({
                        targets: gem, scale: 0.6, duration: 200, ease: 'Back.Out'
                    });
                }
            });
        }

        this.kills++;
        this.hud.updateKills(this.kills);

        enemy.destroy();
    }

    onPlayerHitEnemy(player, enemy) {
        if (!enemy.active) return;
        this.damagePlayer(enemy.enemyConfig.damage);
        const angle = Phaser.Math.Angle.Between(player.x, player.y, enemy.x, enemy.y);
        enemy.x += Math.cos(angle) * 40;
        enemy.y += Math.sin(angle) * 40;
    }

    onPlayerHitEnemyProjectile(player, proj) {
        if (!proj.active) return;
        proj.destroy();
        this.damagePlayer(1);
    }

    damagePlayer(amount) {
        const stats = this.playerStats;
        stats.hp -= amount;
        this.hud.updateHP(stats.hp, stats.maxHp);

        this.cameras.main.shake(250, 0.012);
        this.cameras.main.flash(150, 255, 0, 0);
        this.fx.vignettePulse(0xff0000);
        this.fx.flashTint(this.player, 0xff0000, 150);
        this.fx.squashAndStretch(this.player, 'y', 0.3, 200);

        // COFFEE STAIN decal
        this.decals.spawnCoffeeStain(this.player.x, this.player.y);

        soundSystem.play('hurt');

        if (stats.hp <= 0) {
            this.loseGame();
        }
    }

    onCollectGem(player, gem) {
        gem.destroy();
        const stats = this.playerStats;
        stats.xp += 1;
        this.hud.updateXP(stats.xp, stats.xpNeeded, stats.level);

        this.fx.impactPoof(gem.x, gem.y, 0x88ff88);

        if (stats.xp >= stats.xpNeeded) {
            this.levelUp();
        }
    }

    levelUp() {
        const stats = this.playerStats;
        stats.xp = 0;
        stats.level++;
        stats.xpNeeded = Math.floor(stats.xpNeeded * 1.35 + 2);

        this.fx.slowMotion(0.4, 300);
        this.cameras.main.flash(400, 255, 215, 0);
        this.fx.deathBurst(this.player.x, this.player.y, 0xffd700, 20);

        soundSystem.play('levelup');

        this.scene.pause();
        this.scene.launch('LevelUpScene', {
            gameScene: this,
            playerStats: stats
        });
    }

    doRant() {
        if (!this.playerStats.hasRant) return;
        this.enemies.getChildren().forEach(enemy => {
            if (!enemy.active) return;
            const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
            if (d < 250) {
                const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, enemy.x, enemy.y);
                enemy.x += Math.cos(angle) * 100;
                enemy.y += Math.sin(angle) * 100;
                this.fx.damagePopup(enemy.x, enemy.y - 10, 'PUSH!', {
                    color: '#ff8888', fontSize: 14
                });
            }
        });

        this.fx.deathBurst(this.player.x, this.player.y, 0xffffff, 8);
        this.cameras.main.shake(150, 0.008);
    }

    winGame() {
        if (this._ended) return;
        this._ended = true;
        this.physics.pause();
        this.input.setDefaultCursor('default');
        soundSystem.play('victory');
        this.time.delayedCall(100, () => {
            this.scene.start('GameOverScene', {
                victory: true, kills: this.kills, timeMs: RUN_DURATION_MS
            });
        });
    }

    loseGame() {
        if (this._ended) return;
        this._ended = true;

        this.fx.slowMotion(0.3, 800);
        this.cameras.main.flash(400, 255, 0, 0);
        this.cameras.main.shake(400, 0.02);
        this.fx.deathBurst(this.player.x, this.player.y, 0xff0000, 25);

        this.physics.pause();
        this.input.setDefaultCursor('default');

        const survived = RUN_DURATION_MS - Math.max(0, this.timeRemaining);
        this.time.delayedCall(1200, () => {
            this.scene.start('GameOverScene', {
                victory: false, kills: this.kills, timeMs: survived
            });
        });
    }
}