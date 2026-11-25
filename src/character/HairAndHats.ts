import * as THREE from 'three';
import type { CharacterConfig } from '../types/character';
const mat = (color: string): THREE.MeshStandardMaterial => new THREE.MeshStandardMaterial({ color, roughness: 0.75 });
export function addHairAndHat(head: THREE.Group, config: CharacterConfig): void {
  if (config.hairStyle !== 'bald') {
    const hair = new THREE.Group();
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.61, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.56), mat(config.hairColor));
    cap.position.y = 0.1;
    hair.add(cap);
    if (['spiky', 'mohawk', 'pompadour'].includes(config.hairStyle)) {
      for (let i = 0; i < (config.hairStyle === 'mohawk' ? 3 : 7); i += 1) {
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.42 + (i % 3) * 0.08, 10), mat(config.hairColor));
        spike.position.set((i - 3) * 0.15, 0.56 + (i % 2) * 0.05, 0);
        spike.rotation.z = (i - 3) * -0.12;
        hair.add(spike);
      }
    } else if (['afro', 'curly', 'pigtails_curly'].includes(config.hairStyle)) {
      for (let i = 0; i < 13; i += 1) {
        const curl = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), mat(config.hairColor));
        const angle = i * Math.PI * 2 / 13;
        curl.position.set(Math.cos(angle) * 0.42, 0.35 + (i % 3) * 0.12, Math.sin(angle) * 0.32);
        hair.add(curl);
      }
    } else if (['long_flowing', 'twin_tails', 'pigtails_curly', 'bob_cut'].includes(config.hairStyle)) {
      const sides = config.hairStyle === 'twin_tails' || config.hairStyle === 'pigtails_curly' ? [-0.62, 0.62] : [-0.48, 0.48];
      for (const x of sides) {
        const strand = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, config.hairStyle === 'bob_cut' ? 0.25 : 0.7, 4, 8), mat(config.hairColor));
        strand.position.set(x, -0.18, -0.02);
        hair.add(strand);
      }
    }
    head.add(hair);
  }
  if (config.hatStyle !== 'none') {
    const hat = new THREE.Group();
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.42, 0.28, 20), mat(config.hatColor));
    crown.position.y = 0.6;
    hat.add(crown);
    if (config.hatStyle === 'wizard' || config.hatStyle === 'chef_hat') {
      const point = new THREE.Mesh(new THREE.ConeGeometry(0.36, 0.65, 20), mat(config.hatColor));
      point.position.y = 1.02;
      hat.add(point);
    } else {
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.07, 24), mat(config.hatColor));
      brim.position.y = 0.48;
      hat.add(brim);
    }
    head.add(hat);
  }
}
