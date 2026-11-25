import * as THREE from 'three';
export class CameraRig {
  private target = new THREE.Vector3(0, 1.15, 0);
  private azimuth = 0.12;
  private elevation = 0.14;
  private distance = 7.3;
  private dragging = false;
  private lastX = 0;
  private lastY = 0;
  constructor(private camera: THREE.PerspectiveCamera, private element: HTMLElement) {
    element.addEventListener('pointerdown', this.onDown);
    window.addEventListener('pointermove', this.onMove);
    window.addEventListener('pointerup', this.onUp);
    element.addEventListener('wheel', this.onWheel, { passive: true });
    this.update(1);
  }
  private onDown = (event: PointerEvent): void => { if (event.button === 0) { this.dragging = true; this.lastX = event.clientX; this.lastY = event.clientY; } };
  private onMove = (event: PointerEvent): void => {
    if (!this.dragging) return;
    this.azimuth -= (event.clientX - this.lastX) * 0.006;
    this.elevation = THREE.MathUtils.clamp(this.elevation + (event.clientY - this.lastY) * 0.004, -0.4, 0.8);
    this.lastX = event.clientX; this.lastY = event.clientY;
  };
  private onUp = (): void => { this.dragging = false; };
  private onWheel = (event: WheelEvent): void => { this.distance = THREE.MathUtils.clamp(this.distance + event.deltaY * 0.006, 4.5, 11); };
  update(delta: number, autoRotate = false, sensitivity = 1, invertY = false): void {
    if (autoRotate && !this.dragging) this.azimuth += delta * 0.08;
    const elevation = this.elevation * sensitivity * (invertY ? -1 : 1);
    const desired = new THREE.Vector3(
      this.target.x + Math.sin(this.azimuth) * Math.cos(elevation) * this.distance,
      this.target.y + Math.sin(elevation) * this.distance,
      this.target.z + Math.cos(this.azimuth) * Math.cos(elevation) * this.distance
    );
    this.camera.position.lerp(desired, 1 - Math.exp(-delta * 5));
    this.camera.lookAt(this.target);
  }
  frame(zoom = 1): void { this.distance = 7.3 / zoom; }
  dispose(): void {
    this.element.removeEventListener('pointerdown', this.onDown);
    window.removeEventListener('pointermove', this.onMove);
    window.removeEventListener('pointerup', this.onUp);
    this.element.removeEventListener('wheel', this.onWheel);
  }
}
