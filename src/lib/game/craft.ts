import { moldsById, waxColorsById, waxesById } from "./data";
import type { CandleDesign, Craft, PourUnit, Wax } from "./types";

export const TEMP_START = 20;
export const POUR_TARGET = 88;
export const POUR_SPEED = 26;
export const POUR_MIN_TO_FINISH = 8;
export const TRIM_TARGET_MM = 5;
export const TRIM_MIN_MM = 2;
export const TRIM_MAX_MM = 12;
export const WICK_MAX_OFFSET = 30;
export const WICK_START_X = 16;
export const WICK_START_Y = -12;
export const LABEL_MAX_X = 14;
export const LABEL_MAX_Y = 10;
export const LABEL_MAX_ROTATION = 20;
export const FILM_SECONDS = 1.6;
export const GEL_BUBBLES = 5;
export const MIN_CUTS = 2;
export const MAX_CUTS = 4;
/** Placeholder dose: the business still has to confirm the stearic ratio. */
export const STEARIC_RATIO = 0.1;
export const MIX_FULL_STIRS = 3;
export const AROMA_POUR_RATE = 6;
export const COLOR_DROPS_DIVISOR = 60;

export function waxNeedsCutting(design: CandleDesign): boolean {
  const wax = design.waxId ? waxesById[design.waxId] : null;
  return wax?.format === "block";
}

export function waxNeedsStearic(design: CandleDesign): boolean {
  return waxNeedsCutting(design);
}

export function cutReady(design: CandleDesign, craft: Craft): boolean {
  return !waxNeedsCutting(design) || craft.cutCuts >= MIN_CUTS;
}

export function stearicReady(design: CandleDesign, craft: Craft): boolean {
  return !waxNeedsStearic(design) || craft.stearicAdded;
}

export function meltHeatMultiplier(design: CandleDesign, craft: Craft): number {
  if (!waxNeedsCutting(design)) return 1;
  const cuts = Math.min(MAX_CUTS, Math.max(MIN_CUTS, craft.cutCuts));
  const extra = cuts - MIN_CUTS;
  return 0.8 + (extra / (MAX_CUTS - MIN_CUTS)) * 0.2;
}

export function cutScore(craft: Craft): number {
  if (craft.cutCuts < MIN_CUTS) return 0;
  return Math.min(2, (craft.cutCuts / MAX_CUTS) * 2);
}

export function prepScore(design: CandleDesign, craft: Craft): number {
  if (!waxNeedsStearic(design)) return 3;
  return cutScore(craft) + (craft.stearicAdded ? 1 : 0);
}

export function totalWaxGrams(design: CandleDesign): number {
  const base = design.sizeId === "180" ? 180 : 250;
  return Math.ceil((base * 0.9) / 5) * 5;
}

export function mixTargetColorDrops(grams: number): number {
  return Math.max(1, Math.round(grams / COLOR_DROPS_DIVISOR));
}

export function mixAromaRange(
  grams: number,
  wax: Wax | null,
): { min: number; max: number } {
  return {
    min: round1(grams * (wax?.fragranceMin ?? 0.08)),
    max: round1(grams * (wax?.fragranceMax ?? 0.1)),
  };
}

function createPourUnit(
  base: Pick<
    PourUnit,
    "id" | "label" | "colorId" | "colorHex" | "height" | "target"
  >,
  design: CandleDesign,
  index: number,
): PourUnit {
  const wax = design.waxId ? waxesById[design.waxId] : null;
  const grams = round1((totalWaxGrams(design) * base.height) / 100);
  const scents = design.scentIds;

  return {
    ...base,
    fill: 0,
    done: false,
    accuracy: null,
    grams,
    temperature: wax ? (wax.meltMin + wax.meltMax) / 2 : 65,
    heating: false,
    scentId: scents.length > 0 ? (scents[index % scents.length] ?? null) : null,
    colorDrops: 0,
    aromaMl: 0,
    aromaPouring: false,
    stirs: 0,
    mix: 0,
  };
}

export function createPourUnits(design: CandleDesign): PourUnit[] {
  if (design.mode === "figura") {
    const mold = design.moldId ? moldsById[design.moldId] : null;
    return (mold?.parts ?? []).map((part, index) =>
      createPourUnit(
        {
          id: part.id,
          label: part.nombre,
          colorId: design.figureColors[part.id] ?? "natural",
          colorHex:
            waxColorsById[design.figureColors[part.id] ?? "natural"]?.hex ??
            "#efe2cf",
          height: 100 / Math.max(1, mold?.parts.length ?? 1),
          target: POUR_TARGET,
        },
        design,
        index,
      ),
    );
  }

  if (design.mode === "gel") {
    const wax = design.waxId ? waxesById[design.waxId] : null;
    return [
      createPourUnit(
        {
          id: "gel",
          label: "Gel transparente",
          colorId: "gel",
          colorHex: wax?.hex ?? "#eaf3ee",
          height: 100,
          target: POUR_TARGET + 2,
        },
        design,
        0,
      ),
    ];
  }

  return design.layers.map((layer, index) =>
    createPourUnit(
      {
        id: layer.id,
        label: `Capa ${index + 1}`,
        colorId: layer.colorId,
        colorHex: waxColorsById[layer.colorId]?.hex ?? "#efe2cf",
        height: layer.height,
        target: POUR_TARGET,
      },
      design,
      index,
    ),
  );
}

export function mixColorAccuracy(unit: PourUnit): number {
  if (unit.colorDrops <= 0) return 0;
  const target = mixTargetColorDrops(unit.grams);
  return Math.max(
    0,
    1 - Math.abs(unit.colorDrops - target) / Math.max(2, target * 0.5),
  );
}

export function mixAromaAccuracy(unit: PourUnit, wax: Wax | null): number {
  if (unit.aromaMl <= 0) return 0;
  const range = mixAromaRange(unit.grams, wax);
  if (unit.aromaMl < range.min) {
    return Math.max(
      0,
      1 - (range.min - unit.aromaMl) / Math.max(0.5, range.min * 0.35),
    );
  }
  if (unit.aromaMl > range.max) {
    return Math.max(
      0,
      1 - (unit.aromaMl - range.max) / Math.max(0.5, range.max * 0.35),
    );
  }
  return 1;
}

export function mixStirAccuracy(unit: PourUnit): number {
  return Math.min(1, Math.max(0, unit.mix));
}

export function mixUnitScore(unit: PourUnit, wax: Wax | null): number {
  return (
    mixColorAccuracy(unit) * 0.35 +
    mixAromaAccuracy(unit, wax) * 0.35 +
    mixStirAccuracy(unit) * 0.3
  );
}

export function mixScore(design: CandleDesign, craft: Craft): number {
  if (craft.units.length === 0) return 0;
  const wax = design.waxId ? waxesById[design.waxId] : null;
  const total = craft.units.reduce(
    (sum, unit) => sum + mixUnitScore(unit, wax),
    0,
  );
  return (total / craft.units.length) * 4;
}

export function mixUnitReady(unit: PourUnit): boolean {
  return unit.colorDrops > 0 && unit.aromaMl > 0 && unit.mix > 0;
}

export function createCraft(design: CandleDesign): Craft {
  const wax = design.waxId ? waxesById[design.waxId] : null;

  return {
    temperature: TEMP_START,
    meltTemperature: TEMP_START,
    overheated: false,
    heating: false,
    heatLevel: 0,
    cutCuts: 0,
    stearicAdded: false,
    stirs: 0,
    units: createPourUnits(design),
    unitIndex: 0,
    pouring: false,
    pourOffset: 0.55,
    mix: 0,
    spill: 0,
    waitingFilm: false,
    filmRemaining: 0,
    coolingRemaining: wax?.coolTime ?? 8,
    cooled: false,
    gelBubbles: design.mode === "gel" ? GEL_BUBBLES : 0,
    gelPopped: 0,
    gelPopPulse: 0,
    gelPopIndex: 0,
    wick: {
      x: WICK_START_X,
      y: WICK_START_Y,
      placed: false,
      trimmed: false,
      trimMm: 9,
    },
    holder: false,
    holderRemoved: false,
    label: { x: 8, y: -5, rotation: 9, placed: false },
    lidOn: false,
    wrapped: false,
  };
}

export function currentUnit(craft: Craft): PourUnit | null {
  return craft.units[craft.unitIndex] ?? null;
}

export function isPourComplete(craft: Craft): boolean {
  return craft.units.every((unit) => unit.done);
}

export function pourAccuracy(fill: number, target: number): number {
  return Math.max(0, 1 - Math.abs(fill - target) / 35);
}

export function finishPourUnit(craft: Craft, waitForFilm: boolean): void {
  const unit = craft.units[craft.unitIndex];
  if (!unit) return;

  unit.accuracy = pourAccuracy(unit.fill, unit.target);
  unit.done = true;
  craft.pouring = false;

  if (craft.unitIndex < craft.units.length - 1) {
    if (waitForFilm) {
      craft.waitingFilm = true;
      craft.filmRemaining = FILM_SECONDS;
    } else {
      craft.unitIndex += 1;
      craft.pourOffset = 0.55;
    }
  }
}

export function completeFilm(craft: Craft): void {
  craft.waitingFilm = false;
  craft.filmRemaining = 0;
  craft.unitIndex = Math.min(craft.units.length - 1, craft.unitIndex + 1);
  craft.pourOffset = 0.55;
}

export function wickDistance(craft: Craft): number {
  return Math.hypot(craft.wick.x, craft.wick.y);
}

export function wickAccuracy(craft: Craft): number {
  return Math.max(0, 1 - wickDistance(craft) / WICK_MAX_OFFSET);
}

export function labelAccuracy(craft: Craft): number {
  const offset =
    (Math.abs(craft.label.x) / LABEL_MAX_X) * 0.4 +
    (Math.abs(craft.label.y) / LABEL_MAX_Y) * 0.3 +
    (Math.abs(craft.label.rotation) / LABEL_MAX_ROTATION) * 0.3;
  return Math.max(0, 1 - offset);
}

export function trimAccuracy(craft: Craft): number {
  return Math.max(
    0,
    1 - Math.abs(craft.wick.trimMm - TRIM_TARGET_MM) / TRIM_TARGET_MM,
  );
}

export function coolingProgress(craft: Craft, coolTime: number): number {
  if (craft.cooled) return 100;
  return Math.min(
    100,
    Math.max(0, ((coolTime - craft.coolingRemaining) / coolTime) * 100),
  );
}

export function pourFills(craft: Craft): Record<string, number> {
  return Object.fromEntries(
    craft.units.map((unit) => [unit.id, unit.done ? 100 : unit.fill]),
  );
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}
