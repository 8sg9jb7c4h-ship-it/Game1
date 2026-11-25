import * as THREE from 'three';
import type { CharacterConfig, EnvironmentId } from '../types/character';
import type { Vec3Tuple } from '../types/multiplayer';
import type { GameSettings } from '../types/settings';
import { CharacterBuilder } from '../character/CharacterBuilder';
import { Animator } from '../character/Animator';
import { CameraRig } from './CameraRig';
import { EnvironmentSystem } from './EnvironmentSystem';
import { InteractiveProps } from './InteractiveProps';
import { ParticleSystem } from './ParticleSystem';
import { addStudioLighting } from './StudioLighting';
import type { EmoteType } from '../types/character';

export class SceneManager {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  readonly renderer: THREE.WebGLRenderer;
  private rig: CameraRig;
  private environment: EnvironmentSystem;
  private particles: ParticleSystem;
  private props: InteractiveProps;
  private builder = new CharacterBuilder();
  private character: THREE.Group;
  private remotes = new Map<string, THREE.Group>();
  private remoteAnimators = new Map<string, Animator>();
  private animator: Animator;
  private clickRay = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private onCanvasClick: (prop: string) => void;
  private settings: GameSettings;
  constructor(canvas: HTMLCanvasElement, config: CharacterConfig, settings: GameSettings, onCanvasClick: (prop: string) => void) {
    this.settings = settings;
    this.onCanvasClick = onCanvasClick;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: settings.graphicsQuality !== 'low', alpha: false });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = settings.graphicsQuality !== 'low';
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, settings.graphicsQuality === 'low' ? 1 : 1.7));
    this.camera.aspect = 1;
    this.camera.position.set(0, 1.7, 7.3);
    addStudioLighting(this.scene);
    this.environment = new EnvironmentSystem(this.scene);
    this.particles = new ParticleSystem(this.scene);
    this.props = new InteractiveProps((id) => this.interact(id));
    this.scene.add(this.props.group);
    this.character = this.builder.build(config);
    this.scene.add(this.character);
    this.animator = new Animator(this.character, config);
    this.rig = new CameraRig(this.camera, canvas);
    canvas.addEventListener('click', this.onClick);
    this.resize();
  }
  private onClick = (event: MouseEvent): void => {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    this.clickRay.setFromCamera(this.pointer, this.camera);
    if (!this.props.hit(this.clickRay) && this.clickRay.intersectObject(this.character, true).length) this.interact('headpat');
  };
  private interact(id: string): void {
    if (id === 'confetti') this.particles.burst(new THREE.Vector3(0, 1.6, 0), '#ff8fab', 36);
    else this.particles.burst(new THREE.Vector3(0, 1.5, 0), id === 'boombox' ? '#ffd166' : '#9bd7c3', 14);
    this.onCanvasClick(id);
    if (id === 'headpat') this.animator.setEmote('love');
  }
  setCharacter(config: CharacterConfig): void {
    this.scene.remove(this.character);
    this.character.traverse((object) => { if (object instanceof THREE.Mesh) { object.geometry.dispose(); const materials = Array.isArray(object.material) ? object.material : [object.material]; materials.forEach((material) => material.dispose()); } });
    this.character = this.builder.build(config);
    this.scene.add(this.character);
    this.animator = new Animator(this.character, config);
  }
  setLocalPosition(position: Vec3Tuple, rotationY?: number): void {
    this.character.position.set(position.x, position.y, position.z);
    if (rotationY !== undefined) this.character.rotation.y = rotationY;
  }
  setRemotePlayer(peerId: string, config: CharacterConfig, position: Vec3Tuple, rotationY = 0): void {
    let remote = this.remotes.get(peerId);
    if (!remote || remote.userData.configRef !== config) {
      if (remote) this.removeCharacter(remote);
      remote = this.builder.build(config);
      remote.scale.setScalar(0.82);
      remote.userData.configRef = config;
      this.remotes.set(peerId, remote);
      this.remoteAnimators.set(peerId, new Animator(remote, config));
      this.scene.add(remote);
    }
    remote.position.set(position.x, position.y, position.z);
    remote.rotation.y = rotationY;
  }
  removeRemotePlayer(peerId: string): void {
    const remote = this.remotes.get(peerId);
    if (!remote) return;
    this.removeCharacter(remote);
    this.remotes.delete(peerId);
    this.remoteAnimators.delete(peerId);
  }
  private removeCharacter(character: THREE.Group): void {
    this.scene.remove(character);
    character.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => material.dispose());
      }
    });
  }
  setEnvironment(environment: EnvironmentId): void { this.environment.set(environment); }
  setSettings(settings: GameSettings): void {
    this.settings = settings;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, settings.graphicsQuality === 'low' ? 1 : settings.graphicsQuality === 'medium' ? 1.35 : 1.7));
    this.renderer.shadowMap.enabled = settings.graphicsQuality !== 'low';
  }
  setEmote(emote: EmoteType): void { this.animator.setEmote(emote); }
  setRemoteEmote(peerId: string, emote: EmoteType): void { this.remoteAnimators.get(peerId)?.setEmote(emote); }
  resize(): void {
    const width = this.renderer.domElement.clientWidth || window.innerWidth;
    const height = this.renderer.domElement.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }
  render(delta: number): void {
    this.rig.update(delta, this.settings.autoRotate, this.settings.cameraSensitivity, this.settings.invertY);
    this.animator.update(delta);
    this.remoteAnimators.forEach((animator) => animator.update(delta));
    this.particles.update(delta);
    this.renderer.render(this.scene, this.camera);
  }
  dispose(): void {
    this.renderer.domElement.removeEventListener('click', this.onClick);
    this.rig.dispose(); this.environment.dispose(); this.renderer.dispose();
  }
}
