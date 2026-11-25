import * as THREE from 'three';
import type { CharacterConfig } from '../types/character';
import { addFace } from './ParametricFace';
import { addHairAndHat } from './HairAndHats';
import { addWardrobe } from './WardrobeSystem';
export class CharacterBuilder {
  build(config: CharacterConfig): THREE.Group {
    const root = new THREE.Group();
    root.name = `character-${config.id}`;
    const body = new THREE.Group();
    body.position.y = 1.05 * config.proportions.height;
    root.add(body);
    const head = new THREE.Group();
    head.position.y = 0.73 * config.proportions.height;
    head.scale.setScalar(config.proportions.headScale);
    const headGeometry = config.headShape === 'square'
      ? new THREE.BoxGeometry(1.12, 1.12, 0.88, 3, 3, 2)
      : new THREE.SphereGeometry(config.headShape === 'chibi' ? 0.67 : 0.59, 32, 24);
    const headMaterial = new THREE.MeshStandardMaterial({ color: config.skinColor, roughness: 0.74 });
    const headMesh = new THREE.Mesh(headGeometry, headMaterial);
    if (config.headShape === 'oval') headMesh.scale.set(0.86, 1.12, 0.88);
    if (config.headShape === 'heart') headMesh.scale.set(1.06, 0.92, 0.9);
    if (config.headShape === 'alien') headMesh.scale.set(0.86, 1.2, 0.85);
    headMesh.castShadow = true;
    head.add(headMesh);
    addFace(head, config);
    addHairAndHat(head, config);
    body.add(head);
    addWardrobe(body, config);
    if (config.backAccessory !== 'none') {
      for (const side of [-1, 1]) {
        const wing = new THREE.Mesh(new THREE.SphereGeometry(0.27, 16, 12), new THREE.MeshStandardMaterial({ color: config.accessoryColor, roughness: 0.6 }));
        wing.scale.set(1.15, 0.62, 0.3);
        wing.position.set(side * 0.48, 0.12, -0.32);
        wing.rotation.z = side * -0.3;
        body.add(wing);
      }
    }
    root.userData.body = body;
    root.userData.head = head;
    root.userData.config = config;
    root.traverse((object) => { if (object instanceof THREE.Mesh) { object.castShadow = true; object.userData.characterPart = true; } });
    return root;
  }
}
