import * as THREE from 'three';
export function addStudioLighting(scene: THREE.Scene): void {
  scene.add(new THREE.HemisphereLight(0xfff4e3, 0x746293, 2.2));
  const key = new THREE.DirectionalLight(0xfff5dc, 3.2);
  key.position.set(-4, 8, 6);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  scene.add(key);
  const fill = new THREE.PointLight(0xffa4c7, 45, 16);
  fill.position.set(5, 3, 2);
  scene.add(fill);
}
