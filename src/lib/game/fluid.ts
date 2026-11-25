/**
 * Side-view cellular fluid for wax, gel, color and aroma.
 *
 * This module is intentionally pure: no DOM, no Pixi, no timers. Rendering and
 * input live in the render layer. The solver is a small falling-sand automaton
 * inspired by Noita and Sandspiel, not a Navier-Stokes simulation.
 */

export const FLUID_EMPTY = 0;
export const FLUID_WALL = 1;
export const FLUID_WAX = 2;
export const FLUID_GEL = 3;
export const FLUID_COLOR = 4;
export const FLUID_AROMA = 5;

export type FluidMaterial =
  | typeof FLUID_EMPTY
  | typeof FLUID_WALL
  | typeof FLUID_WAX
  | typeof FLUID_GEL
  | typeof FLUID_COLOR
  | typeof FLUID_AROMA;

export interface FluidState {
  width: number;
  height: number;
  material: Uint8Array;
  color: Uint32Array;
  temperature: Float32Array;
  aroma: Float32Array;
  clock: Uint8Array;
  frame: number;
  seed: number;
}

export interface FluidInput {
  /** Add heat to wax/gel cells. 0..1 per step. */
  heat?: number;
  /** Chance multiplier for lateral flow. */
  flow?: number;
  /** Skip lateral movement for viscous materials. */
  viscosity?: number;
}

const DENSITY: Record<number, number> = {
  [FLUID_EMPTY]: 0,
  [FLUID_WALL]: 99,
  [FLUID_WAX]: 1.05,
  [FLUID_GEL]: 1.35,
  [FLUID_COLOR]: 1.12,
  [FLUID_AROMA]: 0.88,
};

const VISCOSITY: Record<number, number> = {
  [FLUID_WAX]: 0.82,
  [FLUID_GEL]: 0.36,
  [FLUID_COLOR]: 0.94,
  [FLUID_AROMA]: 0.98,
};

export function createFluidState(
  width: number,
  height: number,
  seed = 7,
): FluidState {
  if (width <= 0 || height <= 0) {
    throw new Error("Fluid grid must be positive");
  }
  const size = width * height;
  return {
    width,
    height,
    material: new Uint8Array(size),
    color: new Uint32Array(size),
    temperature: new Float32Array(size),
    aroma: new Float32Array(size),
    clock: new Uint8Array(size),
    frame: 0,
    seed,
  };
}

export function indexOf(state: FluidState, x: number, y: number): number {
  return y * state.width + x;
}

export function inBounds(state: FluidState, x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < state.width && y < state.height;
}

export function materialAt(
  state: FluidState,
  x: number,
  y: number,
): FluidMaterial {
  if (!inBounds(state, x, y)) return FLUID_WALL;
  return state.material[indexOf(state, x, y)] as FluidMaterial;
}

export function colorAt(state: FluidState, x: number, y: number): number {
  if (!inBounds(state, x, y)) return 0;
  return state.color[indexOf(state, x, y)] ?? 0;
}

export function setFluidCell(
  state: FluidState,
  x: number,
  y: number,
  material: FluidMaterial,
  color = 0,
  temperature = 20,
  aroma = 0,
): void {
  if (!inBounds(state, x, y)) return;
  const index = indexOf(state, x, y);
  state.material[index] = material;
  state.color[index] = color;
  state.temperature[index] = temperature;
  state.aroma[index] = aroma;
}

export function fillFluidRect(
  state: FluidState,
  x: number,
  y: number,
  width: number,
  height: number,
  material: FluidMaterial,
  color = 0,
  temperature = 20,
  aroma = 0,
): void {
  for (let row = y; row < y + height; row += 1) {
    for (let column = x; column < x + width; column += 1) {
      setFluidCell(state, column, row, material, color, temperature, aroma);
    }
  }
}

export function clearFluid(state: FluidState): void {
  state.material.fill(FLUID_EMPTY);
  state.color.fill(0);
  state.temperature.fill(20);
  state.aroma.fill(0);
  state.clock.fill(0);
  state.frame = 0;
}

function nextRandom(state: FluidState): number {
  state.seed = (state.seed * 1664525 + 1013904223) >>> 0;
  return state.seed / 4294967296;
}

function isLiquid(material: number): boolean {
  return (
    material === FLUID_WAX ||
    material === FLUID_GEL ||
    material === FLUID_COLOR ||
    material === FLUID_AROMA
  );
}

function canDisplace(source: number, target: number): boolean {
  if (target === FLUID_EMPTY) return true;
  if (target === FLUID_WALL) return false;
  if (!isLiquid(target)) return false;
  return DENSITY[source]! > DENSITY[target]! + 0.01;
}

function mixChannel(a: number, b: number, amount: number): number {
  return Math.round(a + (b - a) * Math.min(1, Math.max(0, amount)));
}

export function mixFluidColor(a: number, b: number, amount = 0.5): number {
  const ar = (a >> 16) & 0xff;
  const ag = (a >> 8) & 0xff;
  const ab = a & 0xff;
  const br = (b >> 16) & 0xff;
  const bg = (b >> 8) & 0xff;
  const bb = b & 0xff;
  return (
    (mixChannel(ar, br, amount) << 16) |
    (mixChannel(ag, bg, amount) << 8) |
    mixChannel(ab, bb, amount)
  );
}

function swapCells(state: FluidState, from: number, to: number): void {
  const material = state.material[from]!;
  const color = state.color[from]!;
  const temperature = state.temperature[from]!;
  const aroma = state.aroma[from]!;

  state.material[from] = state.material[to]!;
  state.color[from] = state.color[to]!;
  state.temperature[from] = state.temperature[to]!;
  state.aroma[from] = state.aroma[to]!;

  state.material[to] = material;
  state.color[to] = color;
  state.temperature[to] = temperature;
  state.aroma[to] = aroma;
  state.clock[to] = state.frame & 0xff;
}

function dissolveColor(state: FluidState, index: number): boolean {
  const material = state.material[index]!;
  if (material !== FLUID_COLOR && material !== FLUID_AROMA) return false;

  const x = index % state.width;
  const y = Math.floor(index / state.width);
  const neighbours = [
    [x - 1, y],
    [x + 1, y],
    [x, y - 1],
    [x, y + 1],
  ];

  for (const [nx, ny] of neighbours) {
    if (!inBounds(state, nx!, ny!)) continue;
    const targetIndex = indexOf(state, nx!, ny!);
    const targetMaterial = state.material[targetIndex]!;
    if (targetMaterial !== FLUID_WAX && targetMaterial !== FLUID_GEL) continue;

    if (material === FLUID_COLOR) {
      state.color[targetIndex] = mixFluidColor(
        state.color[targetIndex]!,
        state.color[index]!,
        0.35,
      );
      state.temperature[targetIndex] = Math.max(
        state.temperature[targetIndex]!,
        state.temperature[index]!,
      );
    } else {
      state.aroma[targetIndex] = Math.min(1, state.aroma[targetIndex]! + 0.25);
    }

    state.material[index] = FLUID_EMPTY;
    state.color[index] = 0;
    state.aroma[index] = 0;
    return true;
  }

  return false;
}

/**
 * Advance one simulation step. Rows are scanned from bottom to top; the
 * horizontal order alternates every frame to avoid a permanent bias.
 */
export function stepFluid(
  state: FluidState,
  input: FluidInput = {},
): FluidState {
  state.frame += 1;
  const frame = state.frame;
  const reverse = (frame & 1) === 1;
  const viscosity = input.viscosity ?? 1;
  const flow = input.flow ?? 1;
  const heat = input.heat ?? 0;

  for (let y = state.height - 1; y >= 0; y -= 1) {
    const rowStart = y * state.width;
    for (let column = 0; column < state.width; column += 1) {
      const x = reverse ? state.width - 1 - column : column;
      const index = rowStart + x;
      const material = state.material[index]!;
      if (!isLiquid(material)) continue;
      if (state.clock[index] === (frame & 0xff)) continue;

      if (heat > 0) {
        state.temperature[index] = Math.min(
          1,
          state.temperature[index]! + heat,
        );
      }

      if (dissolveColor(state, index)) continue;

      const viscosityChance = VISCOSITY[material]! * viscosity;
      const direction = nextRandom(state) < 0.5 ? -1 : 1;
      const canFlowSide = nextRandom(state) < viscosityChance * flow;

      const candidates: Array<[number, number]> = [
        [x, y + 1],
        [x + direction, y + 1],
        [x - direction, y + 1],
        [x + direction, y],
        [x - direction, y],
      ];

      let moved = false;
      for (const [nx, ny] of candidates) {
        if (!inBounds(state, nx, ny)) continue;
        const targetIndex = indexOf(state, nx, ny);
        const targetMaterial = state.material[targetIndex]!;
        if (!canDisplace(material, targetMaterial)) continue;
        if (ny === y && !canFlowSide) continue;

        if (isLiquid(targetMaterial) && targetMaterial === material) {
          state.color[targetIndex] = mixFluidColor(
            state.color[targetIndex]!,
            state.color[index]!,
            0.25,
          );
          state.aroma[targetIndex] = Math.max(
            state.aroma[targetIndex]!,
            state.aroma[index]!,
          );
        }

        swapCells(state, index, targetIndex);
        state.clock[targetIndex] = frame & 0xff;
        moved = true;
        break;
      }

      if (!moved) {
        state.clock[index] = frame & 0xff;
      }
    }
  }

  return state;
}

export function countMaterial(
  state: FluidState,
  material: FluidMaterial,
): number {
  let count = 0;
  for (const value of state.material) {
    if (value === material) count += 1;
  }
  return count;
}
