import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../main.js';
import HUD from '../systems/HUD.js';
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

        // === COLLISIONS ===
        this.physics.add.overlap(this.player, this.enemies, this.onPlayerHitEnemy, null, this);
        this.physics.add.overlap(this.projectiles, this.enemies, this.onProjectileHitEnemy, null, this);
        this.physics.add.overlap(this.player, this.enemyProjectiles, this.onPlayerHitEnemyProjectile, null, this);
        this.physics.add.overlap(this.player, this.xpGems, this.onCollectGem, null, this);

        // === TIMERS (no auto-fire — player shoots manually) ===
        this.spawnTimer = this.time.addEvent({
            delay: 900,
            callback: this.dripSpawn,
            callbackScope: this,
            loop: true
        });

        this.rantTimer = this.time.addEvent({
            delay: 4000,
            callback: this.doRant,
            callbackScope: this,
            loop: true
        });

        this.waveChecker = this.time.addEvent({
            delay: 500,
            callback: this.checkWaves,
            callbackScope: this,
            loop: true
        });

        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        this.dripSpawn();
        this.dripSpawn();

        // Cursor crosshair
        this.input.setDefaultCursor('crosshair');
    }

    update(time, delta) {
        if (!this.player.active) return;

        // Clock
        this.timeRemaining -= delta;
        this.hud.updateClock(Math.max(0, this.timeRemaining));

        // === MOVEMENT ===
        const stats = this.playerStats;
        let vx = 0, vy = 0;
        if (this.cursors.left.isDown || this.keys.left.isDown) vx = -1;
        else if (this.cursors.right.isDown || this.keys.right.isDown) vx = 1;
        if (this.cursors.up.isDown || this.keys.up.isDown) vy = -1;
        else if (this.cursors.down.isDown || this.keys.down.isDown) vy = 1;

        if (vx !== 0 && vy !== 0) { vx *= 0.707; vy *= 0.707; }
        this.player.setVelocity(vx * stats.moveSpeed, vy * stats.moveSpeed);

        // === MANUAL MOUSE AIMING ===
        const pointer = this.input.activePointer;
        const worldPoint = pointer.positionToCamera(this.cameras.main);
        const aimAngle = Phaser.Math.Angle.Between(
            this.player.x, this.player.y,
            worldPoint.x, worldPoint.y
        );

        // Rotate player to face cursor (+PI/2 because emoji faces up)
        this.player.setRotation(aimAngle + Math.PI / 2);

        // Fire on mouse hold, respecting fireRate cooldown
        if (pointer.isDown && time > this.lastFired) {
            this.fireProjectileAtAngle(aimAngle);
            this.lastFired = time + stats.fireRate;
        }

        // === XP GEM MAGNET ===
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

        // === ENEMY AI ===
        this.enemies.getChildren().forEach(enemy => {
            if (!enemy.active || !enemy.body) return;
            const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
            const speed = enemy.enemyConfig.speed;
            enemy.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);

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

        // Cleanup projectiles
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

        // === WIN ===
        if (this.timeRemaining <= 0) {
            this.winGame();
        }
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

        proj.setScale(0.2);
        this.tweens.add({
            targets: proj,
            scale: 0.9,
            duration: 100,
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
        enemy.setScale(cfg.isBoss ? 2.5 : 1.4);
        enemy.setDepth(5);
        enemy.setTint(cfg.tint);
        enemy.hp = cfg.hp;
        enemy.maxHp = cfg.hp;
        enemy.enemyConfig = cfg;
        enemy.lastShot = 0;
        enemy.body.setCircle(15, 17, 17);

        enemy.setAlpha(0);
        this.tweens.add({ targets: enemy, alpha: 1, duration: 200 });
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
        this.cameras.main.flash(300, 255, 200, 0);

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
        soundSystem.play('hit');

        enemy.setTintFill(0xffffff);
        this.time.delayedCall(60, () => {
            if (enemy.active) enemy.setTint(enemy.enemyConfig.tint);
        });

        this.spawnDamageNumber(enemy.x, enemy.y, proj.damage);
        this.cameras.main.shake(50, 0.003);

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

        for (let i = 0; i < 6; i++) {
            const p = this.add.rectangle(enemy.x, enemy.y, 5, 5, 0xff5544).setDepth(15);
            const angle = Math.random() * Math.PI * 2;
            const speed = 100 + Math.random() * 150;
            this.tweens.add({
                targets: p,
                x: enemy.x + Math.cos(angle) * speed,
                y: enemy.y + Math.sin(angle) * speed,
                alpha: 0,
                scale: 0,
                duration: 400,
                onComplete: () => p.destroy()
            });
        }

        const count = enemy.enemyConfig.isBoss ? 5 : 1;
        for (let i = 0; i < count; i++) {
            this.time.delayedCall(i * 40, () => {
                if (!this.scene.isActive()) return;
                const gem = this.xpGems.create(enemy.x, enemy.y, 'xpGem');
                if (gem) {
                    gem.setScale(0.6).setDepth(3);
                    const a = Math.random() * Math.PI * 2;
                    gem.setVelocity(Math.cos(a) * 80, Math.sin(a) * 80);
                }
            });
        }

        this.kills++;
        this.hud.updateKills(this.kills);

        enemy.destroy();
    }

    spawnDamageNumber(x, y, damage) {
        const txt = this.add.text(x, y, damage.toString(), {
            fontSize: '18px',
            color: '#ffff00',
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(50);

        this.tweens.add({
            targets: txt,
            y: y - 30,
            alpha: 0,
            duration: 600,
            ease: 'Power2',
            onComplete: () => txt.destroy()
        });
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
        this.cameras.main.shake(200, 0.01);
        this.cameras.main.flash(120, 255, 0, 0);
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

        if (stats.xp >= stats.xpNeeded) {
            this.levelUp();
        }
    }

    levelUp() {
        const stats = this.playerStats;
        stats.xp = 0;
        stats.level++;
        stats.xpNeeded = Math.floor(stats.xpNeeded * 1.35 + 2);

        this.cameras.main.flash(300, 255, 215, 0);
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
                this.spawnDamageNumber(enemy.x, enemy.y, 'PUSH!');
            }
        });
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
                victory: true,
                kills: this.kills,
                timeMs: RUN_DURATION_MS
            });
        });
    }

    loseGame() {
        if (this._ended) return;
        this._ended = true;
        this.physics.pause();
        this.input.setDefaultCursor('default');
        const survived = RUN_DURATION_MS - Math.max(0, this.timeRemaining);
        this.time.delayedCall(100, () => {
            this.scene.start('GameOverScene', {
                victory: false,
                kills: this.kills,
                timeMs: survived
            });
        });
    }
}