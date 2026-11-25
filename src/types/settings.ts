export type GraphicsQuality = 'low' | 'medium' | 'ultra';
export interface GameSettings {
  graphicsQuality: GraphicsQuality; masterVolume: number; sfxVolume: number; voiceVolume: number; bgmVolume: number;
  muted: boolean; cameraSensitivity: number; invertY: boolean; autoRotate: boolean; showNameplates: boolean; geminiApiKey: string;
}
export const DEFAULT_SETTINGS: GameSettings = {
  graphicsQuality: 'ultra', masterVolume: 0.85, sfxVolume: 0.85, voiceVolume: 0.9, bgmVolume: 0.45,
  muted: false, cameraSensitivity: 1, invertY: false, autoRotate: false, showNameplates: true, geminiApiKey: ''
};
