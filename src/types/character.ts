export type HeadShape = 'round' | 'oval' | 'square' | 'heart' | 'chibi' | 'alien';
export type EyeStyle = 'classic' | 'sparkle' | 'sleepy' | 'fierce' | 'cat' | 'cyber' | 'happy_arc' | 'heart' | 'starry' | 'glasses_round' | 'visor' | 'pirate_patch';
export type EyebrowStyle = 'natural' | 'thick' | 'arched' | 'angry' | 'worried' | 'unibrow' | 'none';
export type NoseStyle = 'button' | 'pointed' | 'triangle' | 'round' | 'cat_snout' | 'none';
export type MouthStyle = 'smile' | 'grin' | 'cat_w' | 'open_happy' | 'smirk' | 'pout' | 'frown' | 'fangs' | 'beard_full' | 'mustache' | 'bubblegum' | 'o_shock';
export type CheekStyle = 'none' | 'rosy' | 'freckles' | 'whiskers' | 'cyber_lines' | 'star_tattoo';
export type HairStyle = 'bald' | 'short_crop' | 'spiky' | 'bob_cut' | 'long_flowing' | 'twin_tails' | 'pompadour' | 'afro' | 'mohawk' | 'samurai_bun' | 'messy_shag' | 'pigtails_curly' | 'side_swept' | 'drill_curls';
export type HatStyle = 'none' | 'cap' | 'beanie' | 'crown' | 'wizard' | 'cat_ears' | 'bunny_ears' | 'halo' | 'devil_horns' | 'headphones' | 'pirate_hat' | 'chef_hat' | 'astronaut_visor';
export type OutfitStyle = 'casual_tee' | 'hoodie' | 'suit' | 'kimono' | 'cyber_armor' | 'magical_dress' | 'overalls' | 'pirate_coat' | 'chef_uniform' | 'tracksuit' | 'wizard_robe' | 'space_suit';
export type BackAccessory = 'none' | 'angel_wings' | 'bat_wings' | 'jetpack' | 'katana' | 'backpack' | 'orbit_bot';
export type MaterialFinish = 'matte' | 'glossy' | 'metallic' | 'velvet';
export type CharacterVibe = 'energetic' | 'chill' | 'dramatic' | 'mysterious' | 'goofy';
export type EmoteType = 'none' | 'wave' | 'dance' | 'backflip' | 'laugh' | 'shocked' | 'love' | 'hero_pose';
export type EnvironmentId = 'apartment' | 'toybox' | 'rooftop' | 'cyberpunk' | 'cafe' | 'space';
export interface BodyProportions { height: number; headScale: number; torsoWidth: number; armLength: number }
export interface CharacterConfig {
  id: string; name: string; tagline: string; vibe: CharacterVibe; voicePitch: number;
  headShape: HeadShape; skinColor: string; eyeStyle: EyeStyle; eyeColor: string; eyebrowStyle: EyebrowStyle;
  noseStyle: NoseStyle; mouthStyle: MouthStyle; cheekStyle: CheekStyle;
  hairStyle: HairStyle; hairColor: string; hairHighlightColor: string; hatStyle: HatStyle; hatColor: string;
  outfitStyle: OutfitStyle; outfitPrimaryColor: string; outfitSecondaryColor: string; shoeColor: string;
  backAccessory: BackAccessory; accessoryColor: string; materialFinish: MaterialFinish;
  proportions: BodyProportions;
}
export interface SavedCharacterSlot { slotIndex: number; updatedAt: number; config: CharacterConfig }
