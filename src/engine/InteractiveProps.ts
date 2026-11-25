import * as THREE from 'three';
export type PropAction = (id: string) => void;
export class InteractiveProps {
  readonly group = new THREE.Group();
  private targets: THREE.Object3D[] = [];
  constructor(onAction: PropAction) {
    const make = (id: string, geometry: THREE.BufferGeometry, color: string, position: THREE.Vector3): void => {
      const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color, roughness: 0.45, metalness: id === 'boombox' ? 0.2 : 0 }));
      mesh.position.copy(position);
      mesh.castShadow = true;
      mesh.userData.propId = id;
      mesh.userData.onAction = onAction;
      this.group.add(mesh);
      this.targets.push(mesh);
    };
    make('beach-ball', new THREE.SphereGeometry(0.35, 18, 14), '#ff8fab', new THREE.Vector3(-2.2, 0.34, 0.2));
    make('boombox', new THREE.BoxGeometry(0.95, 0.55, 0.35), '#9074c7', new THREE.Vector3(2.15, 0.42, -0.5));
    make('confetti', new THREE.ConeGeometry(0.22, 0.58, 12), '#ffd166', new THREE.Vector3(-1.7, 0.29, -1.35));
    make('plushie', new THREE.SphereGeometry(0.28, 14, 12), '#9bd7c3', new THREE.Vector3(1.7, 0.3, 1));
  }
  hit(raycaster: THREE.Raycaster): boolean {
    const hit = raycaster.intersectObjects(this.targets, false)[0];
    if (!hit) return false;
    const id = hit.object.userData.propId as string;
    const action = hit.object.userData.onAction as PropAction;
    action(id);
    return true;
  }
}
