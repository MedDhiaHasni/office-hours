import { Howl } from 'howler';

const SOUND_DEFS = {
    // Volumes drastically reduced
    shoot: {
        src: ['https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg'],
        volume: 0.04,
        pitchVariation: 0.1
    },
    hit: {
        src: ['https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg'],
        volume: 0.08,
        pitchVariation: 0.2
    },
    levelup: {
        src: ['https://actions.google.com/sounds/v1/alarms/beep_short.ogg'],
        volume: 0.4,
        pitchVariation: 0.05
    },
    hurt: {
        src: ['https://actions.google.com/sounds/v1/cartoon/concussive_hit_guitar_boing.ogg'],
        volume: 0.4,
        pitchVariation: 0.15
    },
    victory: {
        src: ['https://actions.google.com/sounds/v1/alarms/dinner_bell_chime.ogg'],
        volume: 0.6,
        pitchVariation: 0
    },
    uiClick: {
        src: ['https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg'],
        volume: 0.1,
        pitchVariation: 0.1
    }
};

class SoundSystem {
    constructor() {
        this.sounds = {};
        this.enabled = true;
        this._loadAll();
    }

    _loadAll() {
        for (const [key, cfg] of Object.entries(SOUND_DEFS)) {
            this.sounds[key] = [];
            for (let i = 0; i < 3; i++) {
                const howl = new Howl({
                    src: cfg.src,
                    volume: cfg.volume,
                    preload: true,
                    html5: false,
                    onloaderror: () => {},
                    onplayerror: () => {}
                });
                this.sounds[key].push(howl);
            }
        }
    }

    play(key) {
        if (!this.enabled) return;
        const pool = this.sounds[key];
        if (!pool || pool.length === 0) return;

        let howl = pool.find(h => !h.playing());
        if (!howl) howl = pool[0];

        const cfg = SOUND_DEFS[key];
        let pitch = 1.0;
        if (cfg && cfg.pitchVariation) {
            pitch = 1.0 + (Math.random() * 2 - 1) * cfg.pitchVariation;
        }

        const id = howl.play();
        if (id !== undefined) {
            howl.rate(pitch, id);
        }
    }

    setEnabled(v) { this.enabled = v; }
}

export const soundSystem = new SoundSystem();