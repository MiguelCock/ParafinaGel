import { describe, expect, it } from "vitest";
import {
  MotionController,
  clamp01,
  easings,
  motionBudget,
  motionDurations,
  motionStagger,
} from "./motion";

describe("motion tokens", () => {
  it("orders durations from quick to celebration", () => {
    expect(motionDurations.instant).toBeLessThan(motionDurations.fast);
    expect(motionDurations.fast).toBeLessThan(motionDurations.base);
    expect(motionDurations.base).toBeLessThan(motionDurations.slow);
    expect(motionDurations.slow).toBeLessThan(motionDurations.celebrate);
    expect(motionStagger).toBeGreaterThan(0);
  });

  it("keeps easings bounded and anchored", () => {
    for (const easing of Object.values(easings)) {
      expect(easing(0)).toBeCloseTo(0);
      expect(easing(1)).toBeCloseTo(1);
    }
    expect(clamp01(-1)).toBe(0);
    expect(clamp01(0.4)).toBe(0.4);
    expect(clamp01(2)).toBe(1);
  });

  it("defines a performance budget", () => {
    expect(motionBudget.maxParticles).toBeGreaterThan(0);
    expect(motionBudget.maxConcurrentTweens).toBeGreaterThan(0);
    expect(motionBudget.maxStaggerItems).toBeGreaterThan(0);
    expect(motionBudget.frameBudgetMs).toBeGreaterThan(0);
  });
});

describe("MotionController", () => {
  it("updates progress and completes", () => {
    const controller = new MotionController();
    const values: number[] = [];
    let completed = 0;

    controller.animate({
      duration: 1,
      easing: easings.linear,
      onUpdate: (value) => values.push(value),
      onComplete: () => {
        completed += 1;
      },
    });

    controller.update(0.5);
    controller.update(0.5);

    expect(values).toEqual([0.5, 1]);
    expect(completed).toBe(1);
    expect(controller.size).toBe(0);
  });

  it("cancels a tween", () => {
    const controller = new MotionController();
    const values: number[] = [];
    const cancel = controller.animate({
      duration: 1,
      onUpdate: (value) => values.push(value),
    });

    controller.update(0.2);
    cancel();
    controller.update(0.5);

    expect(values).toEqual([easings.outCubic(0.2)]);
    expect(controller.size).toBe(0);
  });

  it("completes all at once", () => {
    const controller = new MotionController();
    const values: number[] = [];
    controller.animate({ duration: 1, onUpdate: (v) => values.push(v) });
    controller.animate({ duration: 2, onUpdate: (v) => values.push(v) });

    controller.completeAll();

    expect(values).toEqual([1, 1]);
    expect(controller.size).toBe(0);
  });

  it("applies zero-duration tweens immediately", () => {
    const controller = new MotionController();
    let value = 0;
    controller.animate({
      duration: 0,
      onUpdate: (progress) => {
        value = progress;
      },
    });

    expect(value).toBe(1);
    expect(controller.size).toBe(0);
  });
});
