import * as THREE from 'three';
import type { CharacterConfig } from '../types/character';
const material = (color: string, finish: CharacterConfig['materialFinish']): THREE.MeshStandardMaterial => new THREE.MeshStandardMaterial({
  color, roughness: finish === 'glossy' ? 0.24 : finish === 'velvet' ? 0.95 : 0.62,
  metalness: finish === 'metallic' ? 0.68 : 0.02
});
export function addWardrobe(body: THREE.Group, config: CharacterConfig): void {
  const width = 0.34 * config.proportions.torsoWidth;
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(width, 0.55 * config.proportions.height, 5, 12), material(config.outfitPrimaryColor, config.materialFinish));
  torso.position.y = 0.05;
  torso.castShadow = true;
  body.add(torso);
  const trim = new THREE.Mesh(new THREE.BoxGeometry(width * 1.35, 0.12, 0.38), material(config.outfitSecondaryColor, config.materialFinish));
  trim.position.set(0, -0.06, 0.06);
  body.add(trim);
  for (const side of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.105, 0.38 * config.proportions.armLength, 4, 8), material(config.outfitPrimaryColor, config.materialFinish));
    arm.position.set(side * (width + 0.16), 0.08, 0);
    arm.rotation.z = side * -0.16;
    arm.castShadow = true;
    body.add(arm);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 10), material(config.skinColor, 'matte'));
    hand.position.set(side * (width + 0.2), -0.23 * config.proportions.armLength, 0.02);
    body.add(hand);
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.28, 4, 8), material(config.outfitSecondaryColor, config.materialFinish));
    leg.position.set(side * 0.18, -0.57 * config.proportions.height, 0);
    leg.castShadow = true;
    body.add(leg);
    const shoe = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 8), material(config.shoeColor, config.materialFinish));
    shoe.scale.set(1.2, 0.65, 1.6);
    shoe.position.set(side * 0.18, -0.82 * config.proportions.height, 0.07);
    body.add(shoe);
  }
}
