import { Howl } from 'howler';

const SOUNDS = {
    shoot: {
        src: ['https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg'],
        volume: 0.15
    },
    hit: {
        src: ['https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg'],
        volume: 0.25
    },
    kill: {
        src: ['https://actions.google.com/sounds/v1/cartoon/pop.ogg'],
        volume: 0.35
    },
    levelup: {
        src: ['https://actions.google.com/sounds/v1/alarms/beep_short.ogg'],
        volume: 0.5
    },
    hurt: {
        src: ['https://actions.google.com/sounds/v1/cartoon/concussive_hit_guitar_boing.ogg'],
        volume: 0.5
    },
    victory: {
        src: ['https://actions.google.com/sounds/v1/alarms/dinner_bell_chime.ogg'],
        volume: 0.6
    }
};

class SoundSystem {
    constructor() {
        this.sounds = {};
        this.enabled = true;
        this._loadAll();
    }

    _loadAll() {
        for (const [key, cfg] of Object.entries(SOUNDS)) {
            this.sounds[key] = new Howl({
                src: cfg.src,
                volume: cfg.volume,
                preload: true,
                html5: false,
                onloaderror: () => { /* silent fail */ },
                onplayerror: () => { /* silent fail */ }
            });
        }
    }

    play(key) {
        if (!this.enabled) return;
        const s = this.sounds[key];
        if (s) {
            try { s.play(); } catch (e) { /* ignore */ }
        }
    }

    setEnabled(v) { this.enabled = v; }
}

export const soundSystem = new SoundSystem();