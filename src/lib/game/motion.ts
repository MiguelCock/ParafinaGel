export const motionDurations = {
  instant: 0.08,
  fast: 0.14,
  base: 0.24,
  slow: 0.42,
  celebrate: 0.72,
} as const;

export const motionStagger = 0.05;

export const motionBudget = {
  maxParticles: 40,
  maxConcurrentTweens: 24,
  maxStaggerItems: 8,
  frameBudgetMs: 16.6,
} as const;

export const motionDistances = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
} as const;

export type Easing = (progress: number) => number;

export const easings: Record<string, Easing> = {
  linear: (t) => t,
  outCubic: (t) => 1 - Math.pow(1 - t, 3),
  inOutCubic: (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  outQuint: (t) => 1 - Math.pow(1 - t, 5),
  outBack: (t) => {
    const c1 = 1.1;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
};

export function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function lerp(from: number, to: number, progress: number): number {
  return from + (to - from) * clamp01(progress);
}

export interface TweenOptions {
  duration: number;
  easing?: Easing;
  onUpdate: (progress: number) => void;
  onComplete?: () => void;
}

interface Tween {
  elapsed: number;
  duration: number;
  easing: Easing;
  onUpdate: (progress: number) => void;
  onComplete?: () => void;
}

export class MotionController {
  private tweens: Tween[] = [];

  get size(): number {
    return this.tweens.length;
  }

  animate(options: TweenOptions): () => void {
    const duration = Math.max(0, options.duration);
    const easing = options.easing ?? easings.outCubic;

    if (duration === 0) {
      options.onUpdate(1);
      options.onComplete?.();
      return () => {};
    }

    const tween: Tween = {
      elapsed: 0,
      duration,
      easing,
      onUpdate: options.onUpdate,
      onComplete: options.onComplete,
    };
    this.tweens.push(tween);

    return () => {
      const index = this.tweens.indexOf(tween);
      if (index >= 0) this.tweens.splice(index, 1);
    };
  }

  update(delta: number): void {
    if (delta <= 0 || this.tweens.length === 0) return;

    const finished: Tween[] = [];
    for (const tween of this.tweens) {
      tween.elapsed += delta;
      const progress = clamp01(tween.elapsed / tween.duration);
      tween.onUpdate(tween.easing(progress));
      if (progress >= 1) finished.push(tween);
    }

    if (finished.length > 0) {
      this.tweens = this.tweens.filter((tween) => !finished.includes(tween));
      for (const tween of finished) tween.onComplete?.();
    }
  }

  completeAll(): void {
    if (this.tweens.length === 0) return;
    const tweens = this.tweens;
    this.tweens = [];
    for (const tween of tweens) {
      tween.onUpdate(1);
      tween.onComplete?.();
    }
  }

  clear(): void {
    this.tweens = [];
  }
}
