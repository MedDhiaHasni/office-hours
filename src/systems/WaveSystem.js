// Enemy definitions
export const ENEMY_TYPES = {
    freshman: {
        texture: 'freshman',
        hp: 2,
        speed: 55,
        damage: 1,
        xpValue: 1,
        tint: 0xffffff
    },
    gunner: {
        texture: 'gunner',
        hp: 1,
        speed: 100,
        damage: 1,
        xpValue: 1,
        tint: 0xffdddd
    },
    sleeper: {
        texture: 'sleeper',
        hp: 6,
        speed: 35,
        damage: 1,
        xpValue: 2,
        tint: 0xddddff
    },
    emailDemon: {
        texture: 'emailDemon',
        hp: 3,
        speed: 60,
        damage: 1,
        xpValue: 2,
        tint: 0xffffff,
        ranged: true,
        fireCooldown: 2000
    },
    admin: {
        texture: 'admin',
        hp: 40,
        speed: 40,
        damage: 2,
        xpValue: 10,
        tint: 0xffffff,
        isBoss: true
    }
};

// Wave events — trigger at specific times (in ms from start)
export const WAVES = [
    { time: 30000,  type: 'burst',  enemy: 'gunner',      count: 8,  message: '📢 Freshmen Arriving!' },
    { time: 60000,  type: 'boss',   enemy: 'sleeper',     count: 2,  message: '😴 Midterm Season!' },
    { time: 90000,  type: 'burst',  enemy: 'freshman',    count: 15, message: '📚 Class Dismissed!' },
    { time: 120000, type: 'mix',    count: 12,            message: '📧 Email Storm!' },
    { time: 150000, type: 'boss',   enemy: 'emailDemon',  count: 3,  message: '✉️ Guest Lecture!' },
    { time: 180000, type: 'burst',  enemy: 'gunner',      count: 20, message: '🤓 Study Group!' },
    { time: 210000, type: 'boss',   enemy: 'admin',       count: 1,  message: '👔 DEAN APPROACHES!' },
    { time: 240000, type: 'mix',    count: 20,            message: '🔥 Finals Week!' },
    { time: 270000, type: 'boss',   enemy: 'admin',       count: 2,  message: '👔 TENURE REVIEW!' }
];

export function getEnemyConfig(type) {
    return ENEMY_TYPES[type] || ENEMY_TYPES.freshman;
}

export function pickRandomEnemyType(elapsed) {
    // Earlier game = easier enemies
    const roll = Math.random();
    const t = elapsed / 1000; // seconds

    if (t < 30) return roll < 0.8 ? 'freshman' : 'gunner';
    if (t < 60) return roll < 0.5 ? 'freshman' : roll < 0.85 ? 'gunner' : 'sleeper';
    if (t < 120) return roll < 0.4 ? 'freshman' : roll < 0.7 ? 'gunner' : roll < 0.9 ? 'sleeper' : 'emailDemon';
    return roll < 0.3 ? 'gunner' : roll < 0.6 ? 'sleeper' : roll < 0.85 ? 'emailDemon' : 'freshman';
}