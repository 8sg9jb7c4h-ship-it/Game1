import type { CharacterConfig } from '../types/character';
import type { GameSettings } from '../types/settings';
import { ARCHETYPE_NAMES, createCharacter, createPreset } from './PresetLibrary';

const colors: Record<string, string> = {
  rosa: '#ff8fab', pink: '#ff8fab', rosso: '#e63946', red: '#e63946', blu: '#5e8bff', blue: '#5e8bff',
  verde: '#5bad75', green: '#5bad75', viola: '#9b72cf', purple: '#9b72cf', giallo: '#ffd166', yellow: '#ffd166',
  arancione: '#f4a261', orange: '#f4a261', nero: '#343044', black: '#343044', azzurro: '#6ec6e8'
};
const traits: Array<[RegExp, Partial<CharacterConfig>]> = [
  [/(gatto|cat|felin)/i, { eyeStyle: 'cat', cheekStyle: 'whiskers', hatStyle: 'cat_ears' }],
  [/(spazio|space|astronaut|cosmic|galatt)/i, { hatStyle: 'astronaut_visor', outfitStyle: 'space_suit', backAccessory: 'jetpack', vibe: 'mysterious' }],
  [/(mag|streg|witch|wizard|fat[ai])/i, { hatStyle: 'wizard', outfitStyle: 'wizard_robe', vibe: 'dramatic' }],
  [/(angelo|angel|ali|wings)/i, { backAccessory: 'angel_wings', cheekStyle: 'rosy' }],
  [/(robot|cyber|futur)/i, { eyeStyle: 'cyber', outfitStyle: 'cyber_armor', cheekStyle: 'cyber_lines' }],
  [/(pirat|pirate)/i, { hatStyle: 'pirate_hat', outfitStyle: 'pirate_coat', eyeStyle: 'pirate_patch' }],
  [/(felice|allegro|happy|energic)/i, { vibe: 'energetic', mouthStyle: 'grin' }],
  [/(sonno|sleep|calmo|chill)/i, { vibe: 'chill', eyeStyle: 'sleepy' }],
  [/(buffo|goofy|divertent)/i, { vibe: 'goofy', mouthStyle: 'cat_w' }]
];

export async function generateCharacter(prompt: string, settings: GameSettings): Promise<CharacterConfig> {
  const offline = buildOffline(prompt);
  if (!settings.geminiApiKey.trim()) return offline;
  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + encodeURIComponent(settings.geminiApiKey), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        generationConfig: { responseMimeType: 'application/json' },
        contents: [{ parts: [{ text: `Return a JSON object with optional character fields matching this example. Keep values from the example's enums. Prompt: ${prompt}\nExample: ${JSON.stringify(offline)}` }] }]
      })
    });
    if (!response.ok) throw new Error(`Gemini responded with ${response.status}`);
    const payload = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Gemini returned an empty character.');
    const parsed = JSON.parse(text) as Partial<CharacterConfig>;
    return { ...offline, ...parsed, id: crypto.randomUUID(), proportions: { ...offline.proportions, ...parsed.proportions } };
  } catch (error) {
    console.warn('AI generation failed; using the offline character creator.', error);
    return offline;
  }
}

function buildOffline(prompt: string): CharacterConfig {
  const normalized = prompt.trim();
  const archetypeIndex = Math.max(0, ARCHETYPE_NAMES.findIndex((name) => normalized.toLowerCase().includes(name.toLowerCase())));
  const result = createPreset(archetypeIndex, normalized ? titleCase(normalized.split(/\s+/).slice(0, 4).join(' ')) : undefined);
  const match = Object.entries(colors).find(([word]) => new RegExp(`\\b${word}\\b`, 'i').test(normalized));
  if (match) result.outfitPrimaryColor = match[1];
  for (const [pattern, updates] of traits) if (pattern.test(normalized)) Object.assign(result, updates);
  if (!normalized) return createCharacter();
  return result;
}
function titleCase(text: string): string { return text.replace(/\b\p{L}/gu, (letter) => letter.toUpperCase()); }
