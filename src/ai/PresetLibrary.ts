import type { CharacterConfig, CharacterVibe } from '../types/character';

const archetypes = [
  'Moon Garden Witch', 'Sleepy Cloud Cat', 'Neon Skate Hero', 'Tiny Space Captain', 'Mushroom Explorer',
  'Bubble Tea Dragon', 'Retro Arcade Wizard', 'Sunshine Baker', 'Crystal Mermaid', 'Rooftop DJ',
  'Forest Sprite', 'Robot Gardener', 'Pirate Librarian', 'Comet Photographer', 'Cozy Vampire',
  'Candy Knight', 'Rainy Day Poet', 'Lucky Fox Spirit', 'Ocean Astronaut', 'Disco Dandelion',
  'Starry Pajama Kid', 'Clockwork Inventor', 'Cherry Blossom Samurai', 'Frosting Fairy', 'Deep Sea Detective',
  'Cosmic Ramen Chef', 'Pocket Dinosaur', 'Lavender Detective', 'Rainbow Cloud Racer', 'Gothic Gardener',
  'Tangerine Bard', 'Crystal Golem', 'Midnight Train Conductor', 'Marshmallow Knight', 'Solar System Singer',
  'Café Time Traveler', 'Comet Courier', 'Dreamy Astronomer', 'Jellyfish Dancer', 'Tiny Lighthouse Keeper'
] as const;
const palettes = ['#ffb4a2', '#ffd166', '#b8e0d2', '#cdb4db', '#a2d2ff', '#f4a261', '#caffbf', '#ffc8dd', '#a0c4ff', '#fdffb6'];
const hair = ['#493548', '#694f3d', '#422b69', '#e76f51', '#34675c', '#26283d', '#c76d3a', '#b23a48'];
const vibes: CharacterVibe[] = ['energetic', 'chill', 'dramatic', 'mysterious', 'goofy'];
export const ARCHETYPE_NAMES = archetypes;

export function createCharacter(name = 'Momo'): CharacterConfig {
  return {
    id: crypto.randomUUID(), name, tagline: 'Piccola persona, grandi avventure!', vibe: 'goofy', voicePitch: 1,
    headShape: 'round', skinColor: '#f4c7a1', eyeStyle: 'sparkle', eyeColor: '#382a4d',
    eyebrowStyle: 'natural', noseStyle: 'button', mouthStyle: 'smile', cheekStyle: 'rosy',
    hairStyle: 'short_crop', hairColor: '#493548', hairHighlightColor: '#f4a261', hatStyle: 'none', hatColor: '#ffd166',
    outfitStyle: 'casual_tee', outfitPrimaryColor: '#ff8fab', outfitSecondaryColor: '#fff0bd',
    shoeColor: '#594a4e', backAccessory: 'none', accessoryColor: '#8ecae6', materialFinish: 'matte',
    proportions: { height: 1, headScale: 1, torsoWidth: 1, armLength: 1 }
  };
}

export function createPreset(index: number, nameOverride?: string): CharacterConfig {
  const config = createCharacter(nameOverride ?? archetypes[((index % archetypes.length) + archetypes.length) % archetypes.length]);
  config.tagline = `${config.name} ha una sorpresa per te.`;
  config.vibe = vibes[index % vibes.length]!;
  config.outfitPrimaryColor = palettes[index % palettes.length]!;
  config.hairColor = hair[index % hair.length]!;
  config.hairStyle = (['spiky', 'bob_cut', 'long_flowing', 'afro', 'mohawk', 'messy_shag', 'twin_tails'] as const)[index % 7]!;
  config.hatStyle = (['none', 'cat_ears', 'beanie', 'crown', 'wizard'] as const)[index % 5]!;
  config.outfitStyle = (['casual_tee', 'hoodie', 'magical_dress', 'overalls', 'wizard_robe'] as const)[index % 5]!;
  config.eyeStyle = (['classic', 'sparkle', 'sleepy', 'cat', 'starry', 'heart'] as const)[index % 6]!;
  config.backAccessory = (['none', 'angel_wings', 'backpack', 'orbit_bot'] as const)[index % 4]!;
  return config;
}

export const FEATURED_CHARACTERS = [createPreset(0), createPreset(7), createPreset(18), createPreset(30)];
