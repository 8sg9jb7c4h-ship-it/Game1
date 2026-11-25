import * as THREE from 'three';
import type { CharacterConfig } from '../types/character';
const material = (color: string): THREE.MeshStandardMaterial => new THREE.MeshStandardMaterial({ color, roughness: 0.62 });
export function addFace(group: THREE.Group, config: CharacterConfig): THREE.Group {
  const face = new THREE.Group();
  const eyeGeo = new THREE.SphereGeometry(0.095, 16, 12);
  for (const x of [-0.24, 0.24]) {
    const eye = new THREE.Mesh(eyeGeo, material(config.eyeColor));
    eye.position.set(x, 0.08, 0.435);
    eye.scale.set(0.72, config.eyeStyle === 'sleepy' ? 0.42 : 1, 0.42);
    face.add(eye);
    const shine = new THREE.Mesh(new THREE.SphereGeometry(0.027, 8, 8), material('#ffffff'));
    shine.position.set(x - 0.025, 0.11, 0.471);
    face.add(shine);
    if (config.eyebrowStyle !== 'none') {
      const brow = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.035, 0.025), material(config.hairColor));
      brow.position.set(x, 0.245, 0.43);
      brow.rotation.z = config.eyebrowStyle === 'angry' ? (x < 0 ? 0.2 : -0.2) : 0;
      face.add(brow);
    }
  }
  if (config.noseStyle !== 'none') {
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 10), material('#e79c82'));
    nose.scale.set(0.9, 0.75, 0.55);
    nose.position.set(0, -0.055, 0.47);
    face.add(nose);
  }
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.022, 8, 20, Math.PI), material('#9c5261'));
  mouth.position.set(0, -0.2, 0.44);
  mouth.rotation.z = Math.PI;
  face.add(mouth);
  if (config.cheekStyle === 'rosy' || config.cheekStyle === 'freckles') {
    for (const x of [-0.38, 0.38]) {
      const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 8), new THREE.MeshBasicMaterial({ color: '#f48f9d', transparent: true, opacity: 0.55 }));
      cheek.scale.set(1.3, 0.55, 0.3);
      cheek.position.set(x, -0.12, 0.38);
      face.add(cheek);
    }
  }
  group.add(face);
  return face;
}
