/**
 * Shared geometry for the 1000x640 virtual workshop.
 *
 * This module is pure on purpose: no DOM, no Pixi, no Svelte and no side
 * effects. Coordinates use stage space, with the origin at the top-left corner
 * and the stage scaled uniformly inside the canvas host.
 *
 * Scenes still keep local constants while the physical-workshop redesign
 * lands. Follow-up issues must replace those literals with imports from this
 * module. Do not add a coordinate to a scene when it already exists here: add
 * it here once and migrate the scene.
 *
 * Gameplay rules (temperatures, tolerances, timings, max wick offset) belong to
 * `craft.ts`, `scoring.ts` or `game-state.svelte.ts`. This file only describes
 * geometry, hit areas and coordinate mapping.
 */

export interface StagePoint {
  readonly x: number;
  readonly y: number;
}

export interface StageSize {
  readonly width: number;
  readonly height: number;
}

export interface StageRect extends StagePoint, StageSize {}

export interface StageCircle extends StagePoint {
  readonly radius: number;
}

export interface StagePlacement extends StagePoint {
  readonly scale: number;
}

export interface StageTransform {
  readonly scale: number;
  readonly offsetX: number;
  readonly offsetY: number;
}

export const STAGE = {
  width: 1000,
  height: 640,
} as const satisfies StageSize;

export const STAGE_CENTER: StagePoint = {
  x: STAGE.width / 2,
  y: STAGE.height / 2,
};

/**
 * Shared backdrop used by melt and mix. Scenes with a narrower composition can
 * inset their board inside this envelope.
 */
export const WORKBENCH = {
  x: 120,
  y: 64,
  width: 760,
  height: 500,
  radius: 30,
} as const satisfies StageRect & { readonly radius: number };

/**
 * Wall shelf reserved for the physical workshop. The current material shelf is
 * a DOM panel; this geometry is for the upcoming in-stage version.
 */
export const MATERIAL_SHELF = {
  x: 56,
  y: 128,
  width: 232,
  height: 300,
  levels: 3,
  boardHeight: 14,
} as const satisfies StageRect & {
  readonly levels: number;
  readonly boardHeight: number;
};

/** Foreground worktable reserved for the physical workshop. */
export const WORKTABLE = {
  x: 40,
  y: 468,
  width: 920,
  height: 112,
  thickness: 28,
} as const satisfies StageRect & { readonly thickness: number };

/** Long rack currently drawn by the cool scene. */
export const CURING_RACK = {
  shelf: { x: 250, y: 310, width: 380, height: 20 },
  lowerRail: { x: 270, y: 492, width: 340, height: 18 },
  posts: { x: [280, 600], top: 330, bottom: 520, width: 10 },
} as const;

/** Vessel body used by the shared candle rig. */
export const VESSEL_SIZE = {
  width: 220,
  height: 320,
} as const satisfies StageSize;

/** Vessel interior, relative to the vessel center. */
export const VESSEL_INNER = {
  x: -102,
  y: -150,
  width: 204,
  height: 300,
  radius: 26,
} as const satisfies StageRect & { readonly radius: number };

/** Wooden holder dimensions, relative to the vessel center. */
export const VESSEL_HOLDER = {
  width: 246,
  figureWidth: 170,
  offsetY: -174,
  figureOffsetY: -150,
} as const;

export type VesselScene = "design" | "pour" | "cool" | "finish";

/** Where each scene anchors the shared candle rig. */
export const VESSEL_SLOTS = {
  design: { x: 500, y: 315, scale: 0.9 },
  pour: { x: 500, y: 380, scale: 1 },
  cool: { x: 430, y: 370, scale: 0.95 },
  finish: { x: 360, y: 360, scale: 1 },
} as const satisfies Record<VesselScene, StagePlacement>;

/** Top-down view used to place the wick. */
export const WICK_VIEW = {
  board: { x: 180, y: 54, width: 640, height: 520, radius: 30 },
  center: { x: 500, y: 340 },
  radius: 170,
  guideRadius: 22,
  // Radius minus the +/-30 gameplay offset used to map the wick position.
  travelRadius: 140,
} as const;

/** Melt pot. The body is drawn from `center`; the rim sits at `rimOffsetY`. */
export const MELT_POT = {
  center: { x: 400, y: 360 },
  width: 340,
  height: 180,
  radius: 44,
  rimOffsetY: -40,
  stirRadius: 190,
} as const;

export const CUTTING_BOARD = {
  x: 170,
  y: 226,
  width: 180,
  height: 96,
} as const satisfies StageRect;

export const STEARIC_JAR = {
  center: { x: 650, y: 344 },
  width: 50,
  height: 68,
  hitRadius: 48,
} as const;

export const MELT_STOVE = {
  body: { x: 640, y: 470, width: 220, height: 86, radius: 20 },
  knob: { x: 742, y: 510, radius: 31, hitRadius: 48 },
  label: { x: 742, y: 548 },
  value: { x: 742, y: 564 },
} as const;

export type BurnerCount = 1 | 2 | 3 | 4;

export const BURNER_CARD = {
  width: 340,
  height: 190,
  radius: 24,
} as const satisfies StageSize & { readonly radius: number };

/** One card per layer, figure part or gel batch. */
export const BURNER_LAYOUTS = {
  1: [{ x: 500, y: 330 }],
  2: [
    { x: 300, y: 330 },
    { x: 700, y: 330 },
  ],
  3: [
    { x: 300, y: 270 },
    { x: 700, y: 270 },
    { x: 500, y: 480 },
  ],
  4: [
    { x: 300, y: 255 },
    { x: 700, y: 255 },
    { x: 300, y: 465 },
    { x: 700, y: 465 },
  ],
} as const satisfies Record<BurnerCount, readonly StagePoint[]>;

export function burnerLayout(count: number): readonly StagePoint[] {
  const safe = Number.isFinite(count) ? Math.trunc(count) : 1;
  const key = Math.min(4, Math.max(1, safe)) as BurnerCount;
  return BURNER_LAYOUTS[key];
}

/**
 * Pour lane, mouth and target guide. The alignment tolerance itself stays in
 * the gameplay layer; `mouthHalfWidth` is the visual drop zone it maps to.
 */
export const POUR = {
  vessel: VESSEL_SLOTS.pour,
  mouthOffsetY: -138,
  laneHalfWidth: 250,
  mouthHalfWidth: 80,
  mouthHalfHeight: 42,
  pitcherY: 92,
  targetTopY: VESSEL_SLOTS.pour.y - 150,
  targetBottomY: VESSEL_SLOTS.pour.y + 150,
  targetWidth: 172,
  spill: { x: 700, y: 548 },
} as const;

export const POUR_MOUTH = {
  x: POUR.vessel.x,
  y: POUR.vessel.y + POUR.mouthOffsetY,
} as const satisfies StagePoint;

export const POUR_ZONE = {
  x: POUR_MOUTH.x - POUR.mouthHalfWidth,
  y: POUR_MOUTH.y - POUR.mouthHalfHeight,
  width: POUR.mouthHalfWidth * 2,
  height: POUR.mouthHalfHeight * 2,
} as const satisfies StageRect;

export const FAN = {
  x: 760,
  y: 390,
  radius: 82,
  hitRadius: 95,
} as const satisfies StageCircle & { readonly hitRadius: number };

export const COOL_TIMER = {
  x: VESSEL_SLOTS.cool.x,
  y: 548,
  radius: 20,
  labelY: 592,
} as const satisfies StageCircle & { readonly labelY: number };

/** Label placement, relative to the vessel center. */
export const FINISH_LABEL = {
  width: 100,
  height: 48,
  offsetY: 66,
  figureOffsetY: 118,
  handleRadius: 10,
  handleDistance: 54,
  handleCrossOffset: -24,
  maxOffsetX: 14,
  maxOffsetY: 10,
  maxRotation: 20,
} as const;

export const FINISH_TOOLS = {
  trimZone: { x: 300, y: 120, width: 120, height: 120 },
  trimGuide: { x: 405, y: 132, width: 72, height: 106 },
  lidPanel: { x: 640, y: 140, width: 220, height: 150 },
  wrapPanel: { x: 640, y: 324, width: 220, height: 150 },
} as const satisfies Record<
  "trimZone" | "trimGuide" | "lidPanel" | "wrapPanel",
  StageRect
>;

/** Drop and alignment targets shared by pointer and keyboard flows. */
export const DROP_ZONES = {
  pour: POUR_ZONE,
  wick: {
    x: WICK_VIEW.center.x,
    y: WICK_VIEW.center.y,
    radius: WICK_VIEW.guideRadius,
  },
  label: {
    x: VESSEL_SLOTS.finish.x - FINISH_LABEL.width / 2,
    y: VESSEL_SLOTS.finish.y + FINISH_LABEL.offsetY - FINISH_LABEL.height / 2,
    width: FINISH_LABEL.width,
    height: FINISH_LABEL.height,
  },
} as const satisfies {
  readonly pour: StageRect;
  readonly wick: StageCircle;
  readonly label: StageRect;
};

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function rectFromCenter(center: StagePoint, size: StageSize): StageRect {
  return {
    x: center.x - size.width / 2,
    y: center.y - size.height / 2,
    width: size.width,
    height: size.height,
  };
}

/** Maps a value from one range to another without clamping. */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number {
  if (inMax === inMin) return outMin;
  const progress = (value - inMin) / (inMax - inMin);
  return outMin + (outMax - outMin) * progress;
}

/**
 * Uniformly fits the stage inside a host measured in CSS pixels and centers
 * it, mirroring the Pixi root transform.
 */
export function fitStage(viewport: StageSize): StageTransform {
  const width = Math.max(0, viewport.width);
  const height = Math.max(0, viewport.height);
  const scale = Math.min(width / STAGE.width, height / STAGE.height);
  return {
    scale,
    offsetX: (width - STAGE.width * scale) / 2,
    offsetY: (height - STAGE.height * scale) / 2,
  };
}

/** Converts a host-local point (CSS pixels) to stage coordinates. */
export function viewportToStage(
  point: StagePoint,
  transform: StageTransform,
): StagePoint {
  if (transform.scale <= 0) return { x: 0, y: 0 };
  return {
    x: (point.x - transform.offsetX) / transform.scale,
    y: (point.y - transform.offsetY) / transform.scale,
  };
}

export function stageToViewport(
  point: StagePoint,
  transform: StageTransform,
): StagePoint {
  return {
    x: transform.offsetX + point.x * transform.scale,
    y: transform.offsetY + point.y * transform.scale,
  };
}

export function pointInRect(point: StagePoint, rect: StageRect): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

export function pointInCircle(point: StagePoint, circle: StageCircle): boolean {
  return Math.hypot(point.x - circle.x, point.y - circle.y) <= circle.radius;
}
