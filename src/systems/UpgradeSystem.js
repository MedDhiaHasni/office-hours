// All possible upgrades the professor can pick from on level-up
export const UPGRADES = [
    {
        id: 'fasterGrading',
        name: 'Faster Grading',
        icon: '📝',
        desc: '+25% fire rate',
        color: 0x2ecc71,
        apply: (player) => { player.stats.fireRate *= 0.8; }
    },
    {
        id: 'extraCredit',
        name: 'Extra Credit',
        icon: '📚',
        desc: '+1 damage',
        color: 0x3498db,
        apply: (player) => { player.stats.damage += 1; }
    },
    {
        id: 'coffeeBreak',
        name: 'Coffee Break',
        icon: '☕',
        desc: '+15% move speed',
        color: 0xe67e22,
        apply: (player) => { player.stats.moveSpeed *= 1.15; }
    },
    {
        id: 'tenure',
        name: 'Tenure',
        icon: '🧠',
        desc: '+1 max HP and heal 1',
        color: 0x9b59b6,
        apply: (player) => {
            player.stats.maxHp += 1;
            player.stats.hp = Math.min(player.stats.hp + 1, player.stats.maxHp);
        }
    },
    {
        id: 'popQuiz',
        name: 'Pop Quiz',
        icon: '🎯',
        desc: '+1 projectile per shot',
        color: 0xe74c3c,
        apply: (player) => { player.stats.projectiles += 1; }
    },
    {
        id: 'donuts',
        name: 'Donuts in Lounge',
        icon: '🍩',
        desc: 'Heal 3 HP',
        color: 0xf39c12,
        apply: (player) => {
            player.stats.hp = Math.min(player.stats.hp + 3, player.stats.maxHp);
        }
    },
    {
        id: 'rant',
        name: 'Rant',
        icon: '😤',
        desc: 'Push enemies back periodically',
        color: 0xe74c3c,
        apply: (player) => { player.stats.hasRant = true; }
    },
    {
        id: 'coffeeMagnet',
        name: 'Caffeine Addict',
        icon: '⚡',
        desc: '+50% XP pickup range',
        color: 0x16a085,
        apply: (player) => { player.stats.pickupRange *= 1.5; }
    },
    {
        id: 'rubberBand',
        name: 'Papers Fly True',
        icon: '🔥',
        desc: 'Papers pierce 1 extra enemy',
        color: 0xe67e22,
        apply: (player) => { player.stats.pierce += 1; }
    },
    {
        id: 'officeHoursEnd',
        name: 'End Office Hours Early',
        icon: '⏰',
        desc: '-15 seconds from the clock',
        color: 0x8e44ad,
        apply: (player) => {
            if (player.scene.gameSceneRef) {
                player.scene.gameSceneRef.timeRemaining -= 15000;
            }
        }
    }
];

// Pick N random upgrades, filtering out ones that don't make sense
export function pickRandomUpgrades(count = 3, playerStats) {
    const pool = [...UPGRADES];

    // If already at max HP, remove donuts and tenure (they'd be useless)
    const filtered = pool.filter(u => {
        if (u.id === 'donuts' && playerStats.hp >= playerStats.maxHp) return false;
        return true;
    });

    // Shuffle manually to avoid Phaser dependency
    const shuffled = filtered
        .map(v => ({ v, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ v }) => v);
    return shuffled.slice(0, count);
}