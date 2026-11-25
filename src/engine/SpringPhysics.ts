export class SpringValue {
  value: number;
  velocity = 0;
  constructor(value = 0, private stiffness = 150, private damping = 18) { this.value = value; }
  update(target: number, delta: number): number {
    const dt = Math.min(delta, 0.05);
    this.velocity += (target - this.value) * this.stiffness * dt;
    this.velocity *= Math.exp(-this.damping * dt);
    this.value += this.velocity * dt;
    return this.value;
  }
  impulse(amount: number): void { this.velocity += amount; }
}
