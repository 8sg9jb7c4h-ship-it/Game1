import type { CharacterConfig, EnvironmentId } from '../types/character';
export type GameScreen = 'title' | 'menu' | 'studio' | 'plaza' | 'gallery';
export interface GameSnapshot { screen: GameScreen; character: CharacterConfig; environment: EnvironmentId; sharedCharacter: boolean; roomCode: string }
export class GameStateManager {
  private state: GameSnapshot;
  private listeners = new Set<(state: GameSnapshot) => void>();
  constructor(character: CharacterConfig) {
    const params = new URLSearchParams(location.hash.slice(1));
    const code = params.get('room')?.toUpperCase() ?? '';
    this.state = { screen: code ? 'plaza' : 'title', character, environment: 'toybox', sharedCharacter: params.has('c'), roomCode: code };
    const shared = params.get('c');
    if (shared) {
      try {
        const base64 = shared.replace(/-/g, '+').replace(/_/g, '/');
        const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='));
        const decoded = new TextDecoder().decode(Uint8Array.from(binary, (char) => char.charCodeAt(0)));
        this.state.character = { ...character, ...JSON.parse(decoded) as Partial<CharacterConfig> };
      }
      catch { console.warn('The shared character link is invalid.'); }
    }
  }
  get(): GameSnapshot { return { ...this.state, character: structuredClone(this.state.character) }; }
  setScreen(screen: GameScreen): void { this.state.screen = screen; this.emit(); }
  setCharacter(character: CharacterConfig): void { this.state.character = character; this.emit(); }
  setEnvironment(environment: EnvironmentId): void { this.state.environment = environment; this.emit(); }
  setRoomCode(roomCode: string): void { this.state.roomCode = roomCode; this.state.screen = 'plaza'; this.emit(); }
  subscribe(listener: (state: GameSnapshot) => void): () => void { this.listeners.add(listener); listener(this.get()); return () => this.listeners.delete(listener); }
  private emit(): void { const snapshot = this.get(); this.listeners.forEach((listener) => listener(snapshot)); }
}
