import * as THREE from 'three';
export class ParticleSystem {
  private particles: Array<{ mesh: THREE.Mesh; velocity: THREE.Vector3; life: number }> = [];
  constructor(private scene: THREE.Scene) {}
  burst(position: THREE.Vector3, color = '#ffcb69', count = 18): void {
    for (let i = 0; i < count; i += 1) {
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.035 + Math.random() * 0.045, 6, 6), new THREE.MeshBasicMaterial({ color }));
      mesh.position.copy(position);
      this.scene.add(mesh);
      this.particles.push({ mesh, velocity: new THREE.Vector3((Math.random() - 0.5) * 3, Math.random() * 3, (Math.random() - 0.5) * 3), life: 0.65 + Math.random() * 0.55 });
    }
  }
  update(delta: number): void {
    this.particles = this.particles.filter((particle) => {
      particle.life -= delta;
      particle.velocity.y -= delta * 2;
      particle.mesh.position.addScaledVector(particle.velocity, delta);
      particle.mesh.scale.multiplyScalar(Math.max(0, 1 - delta * 1.8));
      if (particle.life <= 0) { this.scene.remove(particle.mesh); particle.mesh.geometry.dispose(); (particle.mesh.material as THREE.Material).dispose(); return false; }
      return true;
    });
  }
}
