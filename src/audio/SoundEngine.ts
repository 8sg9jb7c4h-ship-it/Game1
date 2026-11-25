import type { SettingsManager } from '../core/SettingsManager';
import type { GameSettings } from '../types/settings';
export type SoundName = 'pop' | 'select' | 'whoosh' | 'sparkle' | 'boing' | 'confetti' | 'shutter';
export class SoundEngine {
  private context?: AudioContext;
  private settings: GameSettings;
  private musicTimer?: number;
  private note = 0;
  constructor(settingsManager: SettingsManager) {
    this.settings = settingsManager.get();
    settingsManager.subscribe((settings) => { this.settings = settings; });
  }
  unlock(): void {
    if (!this.context) this.context = new AudioContext();
    if (this.context.state === 'suspended') void this.context.resume();
  }
  play(name: SoundName): void {
    if (this.settings.muted || !this.context) return;
    const context = this.context;
    const now = context.currentTime;
    const frequencies: Record<SoundName, number> = { pop: 430, select: 650, whoosh: 280, sparkle: 880, boing: 190, confetti: 520, shutter: 1200 };
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = name === 'boing' ? 'triangle' : 'sine';
    oscillator.frequency.setValueAtTime(frequencies[name], now);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(80, frequencies[name] * 0.62), now + 0.12);
    gain.gain.setValueAtTime(this.settings.masterVolume * this.settings.sfxVolume * 0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(now); oscillator.stop(now + 0.17);
  }
  speak(text: string, pitch = 1, onSyllable?: () => void): void {
    if (!this.context || this.settings.muted) return;
    const syllables = Math.max(2, Math.min(12, Math.ceil(text.length / 3)));
    for (let i = 0; i < syllables; i += 1) {
      const start = this.context.currentTime + i * 0.095;
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      oscillator.type = 'triangle';
      oscillator.frequency.value = (190 + (i % 4) * 55) * pitch;
      gain.gain.setValueAtTime(this.settings.masterVolume * this.settings.voiceVolume * 0.08, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.07);
      oscillator.connect(gain).connect(this.context.destination);
      oscillator.start(start); oscillator.stop(start + 0.075);
      window.setTimeout(() => onSyllable?.(), i * 95);
    }
  }
  toggleMusic(): void {
    if (this.musicTimer) { window.clearInterval(this.musicTimer); this.musicTimer = undefined; return; }
    this.unlock();
    const notes = [261.63, 329.63, 392, 523.25, 392, 329.63, 293.66, 349.23];
    this.musicTimer = window.setInterval(() => {
      if (!this.context || this.settings.muted || this.settings.bgmVolume === 0) return;
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      const now = this.context.currentTime;
      oscillator.type = 'sine'; oscillator.frequency.value = notes[this.note++ % notes.length]!;
      gain.gain.setValueAtTime(this.settings.masterVolume * this.settings.bgmVolume * 0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      oscillator.connect(gain).connect(this.context.destination); oscillator.start(now); oscillator.stop(now + 0.3);
    }, 330);
  }
  dispose(): void { if (this.musicTimer) window.clearInterval(this.musicTimer); void this.context?.close(); }
}
