// Solmar Coast: Neon Syndicate — Procedural WebAudio Engine, Police Sirens, Weapon SFX & Synth Radio

export const RADIO_STATIONS = [
  {
    id: 'solmar_fm',
    name: 'SOLMAR FM 98.4',
    track: 'Ocean Drive Mirage',
    bpm: 118,
    notes: [220, 277.18, 329.63, 440, 329.63, 277.18, 246.94, 329.63],
  },
  {
    id: 'glassline_synth',
    name: 'GLASSLINE 104.2',
    track: 'Skybridge Cyber Pulse',
    bpm: 126,
    notes: [196, 246.94, 293.66, 392, 349.23, 293.66, 246.94, 196],
  },
  {
    id: 'saltworks_bass',
    name: 'SALTWORKS 89.9',
    track: 'Harbor Sub-Bass',
    bpm: 108,
    notes: [110, 130.81, 146.83, 164.81, 146.83, 130.81, 98, 110],
  },
  {
    id: 'radio_off',
    name: 'RADIO OFF',
    track: 'Police Scanner Only',
    bpm: 0,
    notes: [],
  },
];

export class SolmarAudioSynthesizer {
  constructor() {
    this.ctx = null;
    this.stationIndex = 0;
    this.stepTimer = 0;
    this.stepIndex = 0;
    this.muted = false;
  }

  get currentStation() {
    return RADIO_STATIONS[this.stationIndex % RADIO_STATIONS.length];
  }

  ensureContext() {
    if (this.muted) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtor = window.AudioContext || window.webkitAudioContext;
      if (AudioCtor) {
        try {
          this.ctx = new AudioCtor();
        } catch {
          this.ctx = null;
        }
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  playWeaponFireSfx(weaponId = 'carbine') {
    const ctx = this.ensureContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = weaponId === 'shotgun' ? 'sawtooth' : 'triangle';
      const startFreq = weaponId === 'shotgun' ? 140 : weaponId === 'smg' ? 280 : 210;
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(42, now + 0.09);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.095);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch {
      // Ignore audio errors on locked autoplay contexts
    }
  }

  playExplosionSfx() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(95, now);
      osc.frequency.exponentialRampToValueAtTime(24, now + 0.38);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.42);
    } catch {}
  }

  playDoorLatchSfx() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.07);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.085);
    } catch {}
  }

  playMissionChimeSfx() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const freqs = [440, 554.37, 659.25];
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + idx * 0.07);
        gain.gain.setValueAtTime(0.08, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.24);
      });
    } catch {}
  }
}

export function cycleRadioStation(audio) {
  audio.stationIndex = (audio.stationIndex + 1) % RADIO_STATIONS.length;
  audio.stepIndex = 0;
  return audio.currentStation;
}

export function updateEngineAndSirenSynth(audio, player, police, dt) {
  const station = audio.currentStation;
  if (!station || station.notes.length === 0 || !audio.ctx || audio.ctx.state !== 'running') {
    return;
  }

  const beatInterval = 60 / station.bpm / 2;
  audio.stepTimer += dt;
  if (audio.stepTimer >= beatInterval) {
    audio.stepTimer -= beatInterval;
    const freq = station.notes[audio.stepIndex % station.notes.length];
    audio.stepIndex++;
    try {
      const now = audio.ctx.currentTime;
      const osc = audio.ctx.createOscillator();
      const gain = audio.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.025, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + beatInterval * 0.85);
      osc.connect(gain);
      gain.connect(audio.ctx.destination);
      osc.start(now);
      osc.stop(now + beatInterval * 0.9);
    } catch {}
  }
}
