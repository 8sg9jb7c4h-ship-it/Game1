import type { CharacterConfig } from '../types/character';
import { searchBar } from './SearchBar';
const choices: Record<string, string[]> = {
  headShape: ['round', 'oval', 'square', 'heart', 'chibi', 'alien'],
  eyeStyle: ['classic', 'sparkle', 'sleepy', 'fierce', 'cat', 'cyber', 'happy_arc', 'heart', 'starry', 'glasses_round', 'visor', 'pirate_patch'],
  eyebrowStyle: ['natural', 'thick', 'arched', 'angry', 'worried', 'unibrow', 'none'],
  noseStyle: ['button', 'pointed', 'triangle', 'round', 'cat_snout', 'none'],
  mouthStyle: ['smile', 'grin', 'cat_w', 'open_happy', 'smirk', 'pout', 'frown', 'fangs', 'beard_full', 'mustache', 'bubblegum', 'o_shock'],
  cheekStyle: ['none', 'rosy', 'freckles', 'whiskers', 'cyber_lines', 'star_tattoo'],
  hairStyle: ['bald', 'short_crop', 'spiky', 'bob_cut', 'long_flowing', 'twin_tails', 'pompadour', 'afro', 'mohawk', 'samurai_bun', 'messy_shag', 'pigtails_curly', 'side_swept', 'drill_curls'],
  hatStyle: ['none', 'cap', 'beanie', 'crown', 'wizard', 'cat_ears', 'bunny_ears', 'halo', 'devil_horns', 'headphones', 'pirate_hat', 'chef_hat', 'astronaut_visor'],
  outfitStyle: ['casual_tee', 'hoodie', 'suit', 'kimono', 'cyber_armor', 'magical_dress', 'overalls', 'pirate_coat', 'chef_uniform', 'tracksuit', 'wizard_robe', 'space_suit'],
  backAccessory: ['none', 'angel_wings', 'bat_wings', 'jetpack', 'katana', 'backpack', 'orbit_bot'],
  materialFinish: ['matte', 'glossy', 'metallic', 'velvet'],
  vibe: ['energetic', 'chill', 'dramatic', 'mysterious', 'goofy']
};
const labels: Record<string, string> = { headShape: 'Forma viso', eyeStyle: 'Occhi', eyebrowStyle: 'Sopracciglia', noseStyle: 'Naso', mouthStyle: 'Bocca', cheekStyle: 'Guance', hairStyle: 'Acconciatura', hatStyle: 'Copricapo', outfitStyle: 'Abito', backAccessory: 'Accessorio', materialFinish: 'Materiale', vibe: 'Personalità' };
const groups: Array<[string, string[]]> = [
  ['Viso', ['headShape', 'skinColor', 'eyeStyle', 'eyeColor', 'eyebrowStyle', 'noseStyle', 'mouthStyle', 'cheekStyle']],
  ['Capelli', ['hairStyle', 'hairColor', 'hairHighlightColor', 'hatStyle', 'hatColor']],
  ['Abiti e accessori', ['outfitStyle', 'outfitPrimaryColor', 'outfitSecondaryColor', 'shoeColor', 'backAccessory', 'accessoryColor', 'materialFinish']],
  ['Corpo e carattere', ['vibe', 'voicePitch', 'height', 'headScale', 'torsoWidth', 'armLength']]
];
function field(key: string, config: CharacterConfig): string {
  const value = key === 'height' || key === 'headScale' || key === 'torsoWidth' || key === 'armLength'
    ? config.proportions[key]
    : config[key as keyof CharacterConfig];
  if (typeof value === 'string' && value.startsWith('#')) return `<label class="field color-field"><span>${labels[key] ?? key}</span><input type="color" data-key="${key}" value="${value}" /></label>`;
  if (key in choices) return `<label class="field"><span>${labels[key] ?? key}</span><select data-key="${key}">${choices[key]!.map((choice) => `<option value="${choice}" ${value === choice ? 'selected' : ''}>${choice.replaceAll('_', ' ')}</option>`).join('')}</select></label>`;
  const range = key === 'voicePitch' ? [0.65, 1.55, 0.05] : key === 'height' ? [0.75, 1.3, 0.01] : key === 'headScale' ? [0.8, 1.35, 0.01] : [0.75, 1.35, 0.01];
  return `<label class="field range-field"><span>${key === 'voicePitch' ? 'Voce' : labels[key] ?? key}<output>${Number(value).toFixed(2)}</output></span><input type="range" min="${range[0]}" max="${range[1]}" step="${range[2]}" data-key="${key}" value="${value}" /></label>`;
}
export function hudManager(config: CharacterConfig): string {
  return `<section class="studio-panel"><header class="studio-header"><button class="text-button" data-action="menu">← Menu</button><div><span class="eyebrow">PERSONAGGIO IN CREAZIONE</span><h2>Fai conoscenza.</h2></div><div class="header-buttons"><button class="soft-button" data-action="photo">Foto</button><button class="soft-button" data-action="share">Condividi</button><button class="primary-button compact" data-action="save">Salva ♥</button></div></header>${searchBar()}<label class="name-field">Il suo nome<input data-key="name" maxlength="24" value="${escapeHtml(config.name)}" /></label><div class="editor-groups">${groups.map(([group, keys]) => `<details class="editor-group" ${group === 'Viso' ? 'open' : ''}><summary>${group}<span>⌄</span></summary><div class="fields">${keys.map((key) => field(key, config)).join('')}</div></details>`).join('')}</div><footer class="studio-footer"><label>🌈 <select data-key="environment"><option value="toybox">Isola giocattolo</option><option value="apartment">Casa dolce casa</option><option value="rooftop">Tetti al tramonto</option><option value="cyberpunk">Neon district</option><option value="cafe">Caffè del gatto</option><option value="space">Piccola galassia</option></select></label><span>Trascina lo sfondo per ruotare · clicca il personaggio per salutarlo</span></footer></section>`;
}
function escapeHtml(text: string): string { return text.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!); }
