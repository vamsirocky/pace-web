// src/utils/audioManager.js
// Centralized audio loader / player with autoplay gating & mute state.

const LS_KEY_MUTED = "pace_sound_muted";
let userInteracted = false;

// one-time unlock after a user gesture
function attachUnlockOnce() {
  const unlock = () => {
    userInteracted = true;
    window.removeEventListener("pointerdown", unlock, { capture: true });
  };
  window.addEventListener("pointerdown", unlock, { capture: true, once: true });
}
attachUnlockOnce();

function file(path) {
  return new URL(path, import.meta.url).href;
}

// Map names to files (add/remove as you like)
const AUDIO_FILES = {
  // welcomes / system
  welcome_first_01: file("../assets/audio/welcome_first_01.mp3"),
  welcome_01:       file("../assets/audio/welcome_01.mp3"),
  qr_01:            file("../assets/audio/qr_01.mp3"),
  lock_01:          file("../assets/audio/lock_01.mp3"),
  completed_01:     file("../assets/audio/completed_01.mp3"),
  points_generic_01:file("../assets/audio/points_generic_01.mp3"),
  points_10_01:     file("../assets/audio/points_10_01.mp3"),

  // recommendations (12)
  reco_CAT01_A1: file("../assets/audio/reco_CAT01_A1.mp3"),
  reco_CAT01_A2: file("../assets/audio/reco_CAT01_A2.mp3"),
  reco_CAT02_A1: file("../assets/audio/reco_CAT02_A1.mp3"),
  reco_CAT02_A2: file("../assets/audio/reco_CAT02_A2.mp3"),
  reco_CAT03_A1: file("../assets/audio/reco_CAT03_A1.mp3"),
  reco_CAT03_A2: file("../assets/audio/reco_CAT03_A2.mp3"),
  reco_CAT04_A1: file("../assets/audio/reco_CAT04_A1.mp3"),
  reco_CAT04_A2: file("../assets/audio/reco_CAT04_A2.mp3"),
  reco_CAT05_A1: file("../assets/audio/reco_CAT05_A1.mp3"),
  reco_CAT05_A2: file("../assets/audio/reco_CAT05_A2.mp3"),
  reco_CAT06_A1: file("../assets/audio/reco_CAT06_A1.mp3"),
  reco_CAT06_A2: file("../assets/audio/reco_CAT06_A2.mp3"),
};

class AudioManager {
  constructor() {
    this.muted = (localStorage.getItem(LS_KEY_MUTED) ?? "") === "1";
    this.cache = new Map();       
    this.lastPlayAt = 0;          
  }

  setMuted(flag) {
    this.muted = !!flag;
    localStorage.setItem(LS_KEY_MUTED, this.muted ? "1" : "0");
    // stop any current sound if muting
    if (this.muted) this.stopAll();
  }

  isMuted() { return this.muted; }

  stopAll() {
    this.cache.forEach(a => { a.pause(); a.currentTime = 0; });
  }

  _get(name) {
    if (!AUDIO_FILES[name]) return null;
    if (!this.cache.has(name)) {
      const a = new Audio(AUDIO_FILES[name]);
      a.preload = "auto";
      a.crossOrigin = "anonymous";
      this.cache.set(name, a);
    }
    return this.cache.get(name);
  }

  // Gentle throttle so rapid re-renders don’t overlap audio
  _canPlayNow() {
    const now = performance.now();
    if (now - this.lastPlayAt < 600) return false;
    this.lastPlayAt = now;
    return true;
  }

  async play(name) {
    if (this.muted) return;
    if (!userInteracted) return; // waits for first tap/click
    if (!this._canPlayNow()) return;

    const a = this._get(name);
    if (!a) return;

    try {
      a.currentTime = 0;
      await a.play();
    } catch {
      // ignore autoplay errors; will play after user gesture
    }
  }

  
  async playReco(activityId) {
    return this.play(`reco_${activityId}`);
  }
}

export const audioManager = new AudioManager();
