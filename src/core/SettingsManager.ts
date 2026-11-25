import { DEFAULT_SETTINGS, type GameSettings } from '../types/settings';
type SettingsListener = (settings: GameSettings) => void;
const STORAGE_KEY = 'tomodachi_studio_settings_v1';
export class SettingsManager {
  private settings: GameSettings;
  private listeners = new Set<SettingsListener>();
  constructor() {
    let parsed: Partial<GameSettings> = {};
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) parsed = JSON.parse(raw) as Partial<GameSettings>;
    } catch (error) {
      console.warn('Could not read saved settings.', error);
    }
    this.settings = { ...DEFAULT_SETTINGS, ...parsed };
  }
  get(): GameSettings { return { ...this.settings }; }
  update(partial: Partial<GameSettings>): void {
    this.settings = { ...this.settings, ...partial };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings)); }
    catch (error) { console.warn('Could not persist settings.', error); }
    for (const listener of this.listeners) listener(this.get());
  }
  reset(): void { this.update(DEFAULT_SETTINGS); }
  subscribe(listener: SettingsListener): () => void {
    this.listeners.add(listener);
    listener(this.get());
    return () => this.listeners.delete(listener);
  }
}
