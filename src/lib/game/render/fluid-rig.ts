import { Sprite, Texture } from "pixi.js";
import {
  FLUID_AROMA,
  FLUID_COLOR,
  FLUID_EMPTY,
  FLUID_GEL,
  FLUID_WALL,
  FLUID_WAX,
  type FluidState,
} from "../fluid";

export interface FluidPalette {
  wax: string;
  gel: string;
  color: string;
  aroma: string;
  wall: string;
}

export interface FluidRigOptions {
  scale?: number;
  palette?: Partial<FluidPalette>;
}

const DEFAULT_PALETTE: FluidPalette = {
  wax: "#f3e3cd",
  gel: "#d8eee8",
  color: "#b4552f",
  aroma: "#d9b45f",
  wall: "#8f5f40",
};

function parseHex(hex: string): [number, number, number] {
  const value = Number.parseInt(hex.replace("#", ""), 16);
  return [(value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
}

/** Writes packed simulation cells into RGBA bytes. Pure and testable. */
export function writeFluidPixels(
  state: FluidState,
  pixels: Uint8ClampedArray,
  palette: FluidPalette = DEFAULT_PALETTE,
): void {
  const wax = parseHex(palette.wax);
  const gel = parseHex(palette.gel);
  const color = parseHex(palette.color);
  const aroma = parseHex(palette.aroma);
  const wall = parseHex(palette.wall);

  for (let index = 0; index < state.material.length; index += 1) {
    const offset = index * 4;
    const material = state.material[index]!;
    let rgb: [number, number, number] | null = null;
    let alpha = 255;

    if (material === FLUID_WAX) rgb = wax;
    else if (material === FLUID_GEL) {
      rgb = gel;
      alpha = 170;
    } else if (material === FLUID_COLOR) rgb = color;
    else if (material === FLUID_AROMA) rgb = aroma;
    else if (material === FLUID_WALL) rgb = wall;
    else if (material === FLUID_EMPTY) {
      pixels[offset + 3] = 0;
      continue;
    }

    if (!rgb) {
      pixels[offset + 3] = 0;
      continue;
    }

    const packed = state.color[index] ?? 0;
    if (packed !== 0 && (material === FLUID_WAX || material === FLUID_GEL)) {
      rgb = [(packed >> 16) & 0xff, (packed >> 8) & 0xff, packed & 0xff];
    }

    pixels[offset] = rgb[0];
    pixels[offset + 1] = rgb[1];
    pixels[offset + 2] = rgb[2];
    pixels[offset + 3] = alpha;
  }
}

/**
 * Pixi sprite backed by a small canvas. The grid stays at simulation
 * resolution and is scaled by the scene, avoiding thousands of Graphics.
 */
export class FluidRig {
  readonly sprite: Sprite;
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private image: ImageData;
  private texture: Texture;
  private stateWidth: number;
  private stateHeight: number;
  private palette: FluidPalette;

  constructor(state: FluidState, options: FluidRigOptions = {}) {
    this.stateWidth = state.width;
    this.stateHeight = state.height;
    this.palette = { ...DEFAULT_PALETTE, ...options.palette };

    this.canvas = document.createElement("canvas");
    this.canvas.width = state.width;
    this.canvas.height = state.height;
    const context = this.canvas.getContext("2d");
    if (!context) throw new Error("No 2D context for fluid rig");
    this.context = context;
    this.image = context.createImageData(state.width, state.height);
    this.texture = Texture.from(this.canvas);
    this.sprite = new Sprite(this.texture);
    this.sprite.scale.set(options.scale ?? 4);
    this.sprite.anchor.set(0);
  }

  resize(state: FluidState): void {
    if (state.width === this.stateWidth && state.height === this.stateHeight) {
      return;
    }
    this.stateWidth = state.width;
    this.stateHeight = state.height;
    this.canvas.width = state.width;
    this.canvas.height = state.height;
    this.image = this.context.createImageData(state.width, state.height);
    this.texture.destroy(true);
    this.texture = Texture.from(this.canvas);
    this.sprite.texture = this.texture;
  }

  update(state: FluidState): void {
    if (state.width !== this.stateWidth || state.height !== this.stateHeight) {
      this.resize(state);
    }
    writeFluidPixels(state, this.image.data, this.palette);
    this.context.putImageData(this.image, 0, 0);
    this.texture.source.update();
  }

  destroy(): void {
    this.texture.destroy(true);
    this.canvas.width = 1;
    this.canvas.height = 1;
  }
}

export const FLUID_DEFAULT_PALETTE = DEFAULT_PALETTE;
