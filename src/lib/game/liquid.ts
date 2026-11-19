export interface LiquidParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

export interface LiquidBubble {
  x: number;
  phase: number;
  radius: number;
  speed: number;
}

export interface LiquidState {
  surface: number[];
  velocity: number[];
  particles: LiquidParticle[];
  bubbles: LiquidBubble[];
  seed: number;
  time: number;
}

export const LIQUID_POINTS = 28;
export const LIQUID_BUBBLES = 5;

function nextRandom(state: LiquidState): number {
  state.seed = (state.seed * 1664525 + 1013904223) % 4294967296;
  return state.seed / 4294967296;
}

export function createLiquidState(seed = 7): LiquidState {
  return {
    surface: Array.from({ length: LIQUID_POINTS }, () => 0),
    velocity: Array.from({ length: LIQUID_POINTS }, () => 0),
    particles: [],
    bubbles: Array.from({ length: LIQUID_BUBBLES }, (_, index) => ({
      x: 0.16 + index * 0.17,
      phase: (index * 0.23) % 1,
      radius: 4 + (index % 3) * 1.5,
      speed: 0.09 + (index % 4) * 0.015,
    })),
    seed,
    time: 0,
  };
}

export function stepLiquid(
  state: LiquidState,
  delta: number,
  input: {
    pouring: boolean;
    offset: number;
    heat: number;
    fill: number;
    gel: boolean;
    reducedMotion: boolean;
  },
): void {
  const dt = Math.min(0.05, Math.max(0, delta));
  if (dt === 0) return;

  state.time += dt;
  const damping = input.reducedMotion ? 16 : 7.5;
  const stiffness = input.reducedMotion ? 24 : 62;

  for (let i = 0; i < LIQUID_POINTS; i += 1) {
    const prev = state.surface[Math.max(0, i - 1)] ?? 0;
    const next = state.surface[Math.min(LIQUID_POINTS - 1, i + 1)] ?? 0;
    const current = state.surface[i] ?? 0;
    const acceleration =
      (prev + next - current * 2) * stiffness - state.velocity[i]! * damping;
    state.velocity[i] = state.velocity[i]! + acceleration * dt;
    state.surface[i] = clamp(current + state.velocity[i]! * dt, -1, 1);
  }

  if (input.pouring && !input.reducedMotion) {
    const center = Math.round(((input.offset + 1) / 2) * (LIQUID_POINTS - 1));
    const impulse = 2.4 + input.heat * 3.2;
    state.velocity[center] = state.velocity[center]! + impulse * dt * 18;

    if (state.particles.length < 40) {
      const count = 1 + Math.floor(nextRandom(state) * 2);
      for (let i = 0; i < count; i += 1) {
        state.particles.push({
          x: 0.5 + input.offset * 0.12 + (nextRandom(state) - 0.5) * 0.1,
          y: 0.02,
          vx: (nextRandom(state) - 0.5) * 0.5,
          vy: -0.2 - nextRandom(state) * 0.45,
          life: 0.5 + nextRandom(state) * 0.5,
          maxLife: 1,
          size: 1.4 + nextRandom(state) * 2.6,
        });
      }
    }
  }

  for (const particle of state.particles) {
    particle.life -= dt;
    particle.vy += 2.4 * dt;
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
  }
  state.particles = state.particles.filter(
    (particle) => particle.life > 0 && particle.y < 1.1,
  );

  if (input.gel) {
    for (const bubble of state.bubbles) {
      bubble.phase = (bubble.phase + bubble.speed * dt) % 1;
    }
  }
}

export function surfaceAt(state: LiquidState, t: number): number {
  const scaled = Math.min(
    LIQUID_POINTS - 1,
    Math.max(0, t * (LIQUID_POINTS - 1)),
  );
  const index = Math.floor(scaled);
  const fraction = scaled - index;
  const a = state.surface[index] ?? 0;
  const b = state.surface[Math.min(LIQUID_POINTS - 1, index + 1)] ?? 0;
  return a + (b - a) * fraction;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
