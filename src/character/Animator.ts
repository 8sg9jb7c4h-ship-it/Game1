import * as THREE from 'three';
import type { CharacterConfig, EmoteType } from '../types/character';
export class Animator {
  private elapsed = Math.random() * 5;
  private emote: EmoteType = 'none';
  private emoteUntil = 0;
  constructor(private character: THREE.Group, private config: CharacterConfig) {}
  setEmote(emote: EmoteType): void { this.emote = emote; this.emoteUntil = this.elapsed + 1.8; }
  update(delta: number): void {
    this.elapsed += delta;
    const body = this.character.userData.body as THREE.Group | undefined;
    const head = this.character.userData.head as THREE.Group | undefined;
    if (!body) return;
    const active = this.elapsed < this.emoteUntil ? this.emote : 'none';
    const energy = this.config.vibe === 'energetic' ? 0.13 : this.config.vibe === 'chill' ? 0.035 : 0.07;
    body.position.y = 1.05 * this.config.proportions.height + Math.sin(this.elapsed * 3.2) * energy;
    body.scale.y = active === 'dance' ? 0.94 + Math.sin(this.elapsed * 13) * 0.12 : 1;
    body.rotation.z = active === 'hero_pose' ? -0.1 : Math.sin(this.elapsed * 1.6) * 0.025;
    if (head) head.rotation.z = active === 'shocked' ? Math.sin(this.elapsed * 18) * 0.08 : Math.sin(this.elapsed * 1.8) * 0.035;
    if (active === 'backflip') body.rotation.x = Math.sin((this.elapsed - (this.emoteUntil - 1.8)) * Math.PI / 1.8) * Math.PI * 2;
  }
}
