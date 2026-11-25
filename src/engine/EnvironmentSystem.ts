import * as THREE from 'three';
import type { EnvironmentId } from '../types/character';
const palettes: Record<EnvironmentId, { sky: string; floor: string; accent: string; label: string }> = {
  apartment: { sky: '#f7d9c4', floor: '#d8b8a2', accent: '#f29e8e', label: 'CASA DOLCE CASA' },
  toybox: { sky: '#c9e8ff', floor: '#9ed6c4', accent: '#ffb86b', label: 'ISOLA GIOCATTOLO' },
  rooftop: { sky: '#f5c2d7', floor: '#8d84ad', accent: '#ffcf70', label: 'TETTI AL TRAMONTO' },
  cyberpunk: { sky: '#28214f', floor: '#443a73', accent: '#ff79c6', label: 'NEON DISTRICT' },
  cafe: { sky: '#f3dbc0', floor: '#b9987b', accent: '#d87950', label: 'CAFFÈ DEL GATTO' },
  space: { sky: '#1e2755', floor: '#49528a', accent: '#8fe8ef', label: 'PICCOLA GALASSIA' }
};
export class EnvironmentSystem {
  private floor: THREE.Mesh;
  private decorations = new THREE.Group();
  constructor(private scene: THREE.Scene) {
    this.floor = new THREE.Mesh(new THREE.CircleGeometry(7, 64), new THREE.MeshStandardMaterial({ color: '#9ed6c4', roughness: 0.9 }));
    this.floor.rotation.x = -Math.PI / 2;
    this.floor.position.y = -0.06;
    this.floor.receiveShadow = true;
    scene.add(this.floor, this.decorations);
    this.set('toybox');
  }
  set(id: EnvironmentId): void {
    const palette = palettes[id];
    this.scene.background = new THREE.Color(palette.sky);
    (this.floor.material as THREE.MeshStandardMaterial).color.set(palette.floor);
    this.decorations.clear();
    const count = id === 'space' ? 45 : 18;
    for (let i = 0; i < count; i += 1) {
      const angle = i * 2.399;
      const radius = 4.2 + (i % 5) * 0.35;
      const geometry = id === 'space' ? new THREE.SphereGeometry(0.035 + (i % 3) * 0.015, 8, 8) : new THREE.SphereGeometry(0.16 + (i % 3) * 0.06, 10, 8);
      const material = new THREE.MeshStandardMaterial({ color: id === 'space' ? '#fff5c2' : i % 2 ? palette.accent : '#fff1cb', roughness: 0.7 });
      const object = new THREE.Mesh(geometry, material);
      object.position.set(Math.cos(angle) * radius, id === 'space' ? 2 + i % 4 : 0.05 + (i % 4) * 0.07, Math.sin(angle) * radius);
      object.scale.y = id === 'space' ? 1 : 0.55;
      this.decorations.add(object);
    }
    const sign = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.55, 0.12), new THREE.MeshStandardMaterial({ color: palette.accent, roughness: 0.65 }));
    sign.position.set(0, 2.5, -3.2);
    this.decorations.add(sign);
  }
  dispose(): void { this.scene.remove(this.floor, this.decorations); }
}
