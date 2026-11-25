import type { CharacterConfig, SavedCharacterSlot } from '../types/character';
const SLOTS_KEY = 'tomodachi_studio_slots_v1';
const DRAFT_KEY = 'tomodachi_studio_draft_v1';
export class StorageManager {
  list(): SavedCharacterSlot[] {
    try {
      const stored: unknown = JSON.parse(localStorage.getItem(SLOTS_KEY) ?? '[]');
      return Array.isArray(stored) ? (stored as SavedCharacterSlot[]).filter((slot) => Number.isInteger(slot.slotIndex) && slot.slotIndex >= 0 && slot.slotIndex < 12).slice(0, 12) : [];
    } catch (error) { console.warn('Could not load character gallery.', error); return []; }
  }
  save(config: CharacterConfig, slotIndex?: number): SavedCharacterSlot {
    const slots = this.list();
    const index = slotIndex ?? this.firstFree(slots);
    if (index < 0 || index > 11) throw new Error('La galleria contiene già 12 personaggi.');
    const slot = { slotIndex: index, updatedAt: Date.now(), config: structuredClone(config) };
    this.write([...slots.filter((entry) => entry.slotIndex !== index), slot].sort((a, b) => a.slotIndex - b.slotIndex));
    return slot;
  }
  load(index: number): CharacterConfig | undefined { return this.list().find((slot) => slot.slotIndex === index)?.config; }
  duplicate(index: number): SavedCharacterSlot {
    const config = this.load(index);
    if (!config) throw new Error('Personaggio non trovato.');
    return this.save({ ...structuredClone(config), id: crypto.randomUUID(), name: `${config.name} copia` });
  }
  delete(index: number): void { this.write(this.list().filter((slot) => slot.slotIndex !== index)); }
  saveDraft(config: CharacterConfig): void { localStorage.setItem(DRAFT_KEY, JSON.stringify(config)); }
  loadDraft(): CharacterConfig | undefined {
    try { const raw = localStorage.getItem(DRAFT_KEY); return raw ? JSON.parse(raw) as CharacterConfig : undefined; }
    catch (error) { console.warn('Could not load the draft character.', error); return undefined; }
  }
  exportJson(config: CharacterConfig): string { return JSON.stringify(config, null, 2); }
  importJson(json: string): CharacterConfig {
    const value: unknown = JSON.parse(json);
    if (!isCharacterConfig(value)) {
      throw new Error('Il file non contiene un personaggio valido.');
    }
    return value;
  }
  private firstFree(slots: SavedCharacterSlot[]): number { for (let i = 0; i < 12; i += 1) if (!slots.some((slot) => slot.slotIndex === i)) return i; return -1; }
  private write(slots: SavedCharacterSlot[]): void { localStorage.setItem(SLOTS_KEY, JSON.stringify(slots)); }
}
function isCharacterConfig(value: unknown): value is CharacterConfig {
  if (!value || typeof value !== 'object') return false;
  const config = value as Partial<CharacterConfig>;
  const strings: Array<keyof CharacterConfig> = [
    'id', 'name', 'tagline', 'vibe', 'headShape', 'skinColor', 'eyeStyle', 'eyeColor', 'eyebrowStyle',
    'noseStyle', 'mouthStyle', 'cheekStyle', 'hairStyle', 'hairColor', 'hairHighlightColor', 'hatStyle',
    'hatColor', 'outfitStyle', 'outfitPrimaryColor', 'outfitSecondaryColor', 'shoeColor', 'backAccessory',
    'accessoryColor', 'materialFinish'
  ];
  if (strings.some((key) => typeof config[key] !== 'string') || typeof config.voicePitch !== 'number') return false;
  const proportions = config.proportions;
  return Boolean(proportions && typeof proportions.height === 'number' && typeof proportions.headScale === 'number'
    && typeof proportions.torsoWidth === 'number' && typeof proportions.armLength === 'number');
}
