import { describe, expect, it } from "vitest";
import {
  MAX_CUTS,
  MIN_CUTS,
  MIX_FULL_STIRS,
  createCraft,
  createPourUnits,
  cutReady,
  finishPourUnit,
  labelAccuracy,
  meltHeatMultiplier,
  mixAromaAccuracy,
  mixAromaRange,
  mixColorAccuracy,
  mixScore,
  mixTargetColorDrops,
  mixUnitReady,
  pourAccuracy,
  prepScore,
  stearicReady,
  totalWaxGrams,
  trimAccuracy,
  wickAccuracy,
  waxNeedsCutting,
} from "./craft";
import { briefs, recommendedWickTypes, stationOrder, waxesById } from "./data";
import {
  createDesign,
  resizeLayer,
  setLayerCount,
  validateDesign,
} from "./design";
import { createLiquidState, stepLiquid, surfaceAt } from "./liquid";
import { surfacePoints } from "./render/liquid-rig";
import { scoreCandle, scoreDesign, starsFor } from "./scoring";
import { buildRecipe } from "./supplies";
import type { Brief, CandleDesign, Craft } from "./types";

function designForBrief(brief: Brief): CandleDesign {
  const design = createDesign(brief.type);
  const target = brief.target;

  design.waxId = target.waxId;
  design.vesselId = target.vesselId ?? null;
  design.moldId = target.moldId ?? null;
  design.sizeId = target.sizeId;
  design.scentIds = [target.scentId];
  design.wickId = target.wickId;
  design.labelId = target.labelId;

  const colors = target.layerColors ?? [];
  design.layers = colors.map((colorId, index) => ({
    id: `layer-${index}`,
    colorId,
    height: 100 / colors.length,
  }));
  design.figureColors = { ...(target.figureColors ?? {}) };
  design.inclusions = [...(target.inclusions ?? [])];

  return design;
}

function perfectCraft(design: CandleDesign): Craft {
  const craft = createCraft(design);
  const wax = design.waxId ? waxesById[design.waxId] : null;

  craft.meltTemperature = wax ? (wax.meltMin + wax.meltMax) / 2 : 70;
  craft.cutCuts = MAX_CUTS;
  craft.stearicAdded = true;
  craft.units = craft.units.map((unit) => ({
    ...unit,
    fill: unit.target,
    done: true,
    accuracy: 1,
    colorDrops: mixTargetColorDrops(unit.grams),
    aromaMl: mixAromaRange(unit.grams, wax).min,
    stirs: MIX_FULL_STIRS,
    mix: 1,
  }));
  craft.mix = 1;
  craft.wick = { x: 0, y: 0, placed: true, trimmed: true, trimMm: 5 };
  craft.label = { x: 0, y: 0, rotation: 0, placed: true };
  craft.gelPopped = craft.gelBubbles;
  craft.lidOn = true;
  craft.wrapped = true;

  return craft;
}

describe("briefs", () => {
  it("prepares the wick before melting and pouring", () => {
    expect(stationOrder.indexOf("wick")).toBeGreaterThan(
      stationOrder.indexOf("design"),
    );
    expect(stationOrder.indexOf("wick")).toBeLessThan(
      stationOrder.indexOf("melt"),
    );
    expect(stationOrder.indexOf("melt")).toBeLessThan(
      stationOrder.indexOf("pour"),
    );
  });

  it("ships the four order types", () => {
    expect(briefs.map((brief) => brief.type)).toEqual([
      "clasico",
      "capas",
      "figura",
      "gel",
    ]);
  });

  it("every brief builds into a valid design", () => {
    for (const brief of briefs) {
      const design = designForBrief(brief);
      const errors = validateDesign(design).filter(
        (issue) => issue.severity === "error",
      );
      expect(errors, brief.id).toEqual([]);
    }
  });

  it("reveals requirements line by line", () => {
    for (const brief of briefs) {
      expect(brief.lines.length).toBeGreaterThanOrEqual(4);
      expect(brief.lines.some((line) => line.notes.length > 0)).toBe(true);
    }
  });
});

describe("design validation", () => {
  it("starts incomplete", () => {
    const design = createDesign("clasico");
    const fields = validateDesign(design).map((issue) => issue.field);

    expect(fields).toContain("scent");
    expect(fields).toContain("wick");
    expect(fields).toContain("label");
  });

  it("keeps layer heights adding up to 100 when resized", () => {
    const layers = createDesign("capas").layers;
    const resized = resizeLayer(layers, 0, 60);
    const total = resized.reduce((sum, layer) => sum + layer.height, 0);

    expect(total).toBeCloseTo(100, 5);
    expect(resized[0]!.height).toBe(60);
  });

  it("requires a transparent vessel for gel", () => {
    const design = designForBrief(briefs[3]);
    design.vesselId = "ambar";

    const messages = validateDesign(design).map((issue) => issue.message);
    expect(messages).toContain("El gel necesita un recipiente transparente.");
  });

  it("requires every figure part to have a color", () => {
    const design = designForBrief(briefs[2]);
    delete design.figureColors["estrella"];

    const fields = validateDesign(design).map((issue) => issue.field);
    expect(fields).toContain("figure");
  });

  it("requires at least two layers for a layered candle", () => {
    const design = designForBrief(briefs[1]);
    const layered = setLayerCount(design, 1);

    const messages = validateDesign(layered).map((issue) => issue.message);
    expect(messages).toContain("Agrega al menos dos capas.");
  });

  it("rejects a wick that does not fit the vessel diameter", () => {
    const design = designForBrief(briefs[0]);
    design.wickId = "pabilo-3";

    const error = validateDesign(design).find(
      (issue) => issue.field === "wick" && issue.severity === "error",
    );
    expect(error).toBeDefined();
  });

  it("recommends wicks that fit the vessel diameter", () => {
    const recommended = recommendedWickTypes(70).map((wick) => wick.id);

    expect(recommended).toContain("pabilo-67");
    expect(recommended).not.toContain("pabilo-3");
    expect(recommended).not.toContain("pabilo-45");
  });
});

describe("recipe scoring", () => {
  it("awards 60 recipe points for each brief solution", () => {
    for (const brief of briefs) {
      expect(
        scoreDesign(designForBrief(brief), brief.target).total,
        brief.id,
      ).toBe(60);
    }
  });

  it("awards 60 points to a free sandbox design", () => {
    expect(scoreDesign(createDesign("clasico"), null).total).toBe(60);
  });

  it("penalizes a different scent and color", () => {
    const brief = briefs[0];
    const design = designForBrief(brief);
    design.scentIds = ["cafe"];
    design.layers[0]!.colorId = "terracota";

    const result = scoreDesign(design, brief.target);

    expect(result.scent).toBe(0);
    expect(result.colors).toBe(0);
    expect(result.total).toBe(36);
  });

  it("scores figure parts independently", () => {
    const brief = briefs[2];
    const design = designForBrief(brief);
    design.figureColors["estrella"] = "terracota";

    const result = scoreDesign(design, brief.target);

    expect(result.colors).toBe(7);
    expect(result.total).toBe(53);
  });
});

describe("wax preparation", () => {
  it("only asks to cut solid block wax", () => {
    expect(waxNeedsCutting(designForBrief(briefs[2]))).toBe(true);
    expect(waxNeedsCutting(designForBrief(briefs[0]))).toBe(false);
    expect(waxNeedsCutting(designForBrief(briefs[3]))).toBe(false);
  });

  it("requires enough cuts and stearic acid before melting", () => {
    const design = designForBrief(briefs[2]);
    const craft = createCraft(design);

    expect(cutReady(design, craft)).toBe(false);
    expect(stearicReady(design, craft)).toBe(false);

    craft.cutCuts = MIN_CUTS;
    expect(cutReady(design, craft)).toBe(true);

    craft.stearicAdded = true;
    expect(stearicReady(design, craft)).toBe(true);
  });

  it("melts faster when the block is cut into smaller pieces", () => {
    const design = designForBrief(briefs[2]);
    const craft = createCraft(design);

    craft.cutCuts = MIN_CUTS;
    expect(meltHeatMultiplier(design, craft)).toBeCloseTo(0.8);

    craft.cutCuts = MAX_CUTS;
    expect(meltHeatMultiplier(design, craft)).toBeCloseTo(1);
  });

  it("awards the preparation score only when the block is ready", () => {
    const block = designForBrief(briefs[2]);
    const flakes = designForBrief(briefs[0]);
    const craft = createCraft(block);

    expect(prepScore(block, craft)).toBe(0);

    craft.cutCuts = MAX_CUTS;
    craft.stearicAdded = true;
    expect(prepScore(block, craft)).toBe(3);
    expect(prepScore(flakes, craft)).toBe(3);
  });
});

describe("mix station", () => {
  it("creates one batch per layer and splits the wax", () => {
    const design = designForBrief(briefs[1]);
    const units = createPourUnits(design);

    expect(units).toHaveLength(design.layers.length);
    expect(units.reduce((sum, unit) => sum + unit.grams, 0)).toBeCloseTo(225);
  });

  it("creates one batch per mold part", () => {
    const design = designForBrief(briefs[2]);
    const units = createPourUnits(design);

    expect(units).toHaveLength(2);
    expect(units.reduce((sum, unit) => sum + unit.grams, 0)).toBeCloseTo(165);
  });

  it("assigns one aroma per batch and allows two scents", () => {
    const design = designForBrief(briefs[1]);
    design.scentIds = ["lavanda", "vainilla"];

    const units = createPourUnits(design);

    expect(units.map((unit) => unit.scentId)).toEqual([
      "lavanda",
      "vainilla",
      "lavanda",
    ]);
  });

  it("doses color by drops and aroma by weight", () => {
    const design = designForBrief(briefs[0]);
    const wax = waxesById[design.waxId!];
    const unit = createPourUnits(design)[0]!;
    const aroma = mixAromaRange(unit.grams, wax);

    expect(totalWaxGrams(design)).toBe(225);
    expect(mixTargetColorDrops(unit.grams)).toBe(4);
    expect(aroma.min).toBeCloseTo(18);
    expect(aroma.max).toBeCloseTo(22.5);
    expect(mixColorAccuracy({ ...unit, colorDrops: 4 })).toBe(1);
  });

  it("requires color, aroma and at least one stir", () => {
    const design = designForBrief(briefs[1]);
    const unit = createPourUnits(design)[0]!;

    expect(mixUnitReady(unit)).toBe(false);

    unit.colorDrops = 1;
    unit.aromaMl = 1;
    unit.stirs = 1;
    unit.mix = 1 / 3;

    expect(mixUnitReady(unit)).toBe(true);
  });

  it("splits the aroma recipe across the chosen scents", () => {
    const design = designForBrief(briefs[1]);
    design.scentIds = ["lavanda", "vainilla"];
    const recipe = buildRecipe(design);
    const aromas = recipe
      .filter((line) => line.supplyId.startsWith("aroma-"))
      .map((line) => line.supplyId)
      .sort();

    expect(aromas).toEqual(["aroma-lavanda", "aroma-vainilla"]);
  });

  it("accepts any aroma dose inside the range", () => {
    const design = designForBrief(briefs[0]);
    const wax = waxesById[design.waxId!];
    const unit = createPourUnits(design)[0]!;

    expect(mixAromaAccuracy({ ...unit, aromaMl: 18 }, wax)).toBe(1);
    expect(mixAromaAccuracy({ ...unit, aromaMl: 22.5 }, wax)).toBe(1);
    expect(mixAromaAccuracy({ ...unit, aromaMl: 12 }, wax)).toBeLessThan(1);
    expect(mixAromaAccuracy({ ...unit, aromaMl: 30 }, wax)).toBeLessThan(1);
  });

  it("scores the mix by drops, aroma and stirring", () => {
    const design = designForBrief(briefs[0]);
    const wax = waxesById[design.waxId!];
    const craft = createCraft(design);
    const unit = craft.units[0]!;

    expect(mixScore(design, craft)).toBe(0);

    unit.colorDrops = mixTargetColorDrops(unit.grams);
    unit.aromaMl = mixAromaRange(unit.grams, wax).min;
    unit.mix = 1;

    expect(mixScore(design, craft)).toBeCloseTo(4);
  });
});

describe("craft execution", () => {
  it("scores a perfect execution at 40", () => {
    for (const brief of briefs) {
      const design = designForBrief(brief);
      const result = scoreCandle(design, brief.target, perfectCraft(design));

      expect(result.design.total, brief.id).toBe(60);
      expect(result.execution.total, brief.id).toBe(40);
      expect(result.total, brief.id).toBe(100);
      expect(result.stars, brief.id).toBe(5);
    }
  });

  it("punishes an overheated batch", () => {
    const design = designForBrief(briefs[0]);
    const craft = perfectCraft(design);
    craft.overheated = true;

    expect(
      scoreCandle(design, briefs[0].target, craft).execution.temperature,
    ).toBe(0);
  });

  it("maps stars by score", () => {
    expect(starsFor(100)).toBe(5);
    expect(starsFor(90)).toBe(5);
    expect(starsFor(75)).toBe(4);
    expect(starsFor(55)).toBe(3);
    expect(starsFor(35)).toBe(2);
    expect(starsFor(10)).toBe(1);
  });

  it("computes pour accuracy around the target", () => {
    expect(pourAccuracy(88, 88)).toBe(1);
    expect(pourAccuracy(60, 88)).toBeCloseTo(0.2);
    expect(pourAccuracy(100, 88)).toBeCloseTo(0.657, 2);
  });

  it("records unit accuracy when finishing a pour", () => {
    const design = designForBrief(briefs[1]);
    const craft = createCraft(design);
    const unit = craft.units[0]!;
    unit.fill = unit.target;

    finishPourUnit(craft, true);

    expect(unit.done).toBe(true);
    expect(unit.accuracy).toBe(1);
    expect(craft.waitingFilm).toBe(true);
  });

  it("scores a centered wick and a 5 mm trim perfectly", () => {
    const design = designForBrief(briefs[0]);
    const craft = perfectCraft(design);

    expect(wickAccuracy(craft)).toBe(1);
    expect(labelAccuracy(craft)).toBe(1);
    expect(trimAccuracy(craft)).toBe(1);
  });

  it("gives gel candles five bubbles", () => {
    const design = designForBrief(briefs[3]);
    const craft = createCraft(design);

    expect(craft.gelBubbles).toBe(5);
  });

  it("scores a sandbox candle without a brief target", () => {
    const design = designForBrief(briefs[3]);
    const result = scoreCandle(design, null, perfectCraft(design));

    expect(result.sandbox).toBe(true);
    expect(result.design.total).toBe(60);
    expect(result.total).toBe(100);
  });

  it("penalizes an unprepared mix and spilled wax", () => {
    const design = designForBrief(briefs[1]);
    const craft = perfectCraft(design);
    for (const unit of craft.units) {
      unit.colorDrops = 0;
      unit.aromaMl = 0;
      unit.stirs = 0;
      unit.mix = 0;
    }
    craft.mix = 0;
    craft.spill = 1;

    const execution = scoreCandle(design, briefs[1].target, craft).execution;

    expect(execution.mix).toBe(0);
    expect(execution.spill).toBe(0);
    expect(execution.total).toBe(33);
  });
});

describe("liquid simulation", () => {
  it("starts flat and finite", () => {
    const liquid = createLiquidState();
    expect(liquid.surface).toHaveLength(28);
    expect(liquid.surface.every((value) => Number.isFinite(value))).toBe(true);
    expect(liquid.bubbles).toHaveLength(5);
  });

  it("creates ripples and splashes while pouring", () => {
    const liquid = createLiquidState(3);
    for (let i = 0; i < 30; i += 1) {
      stepLiquid(liquid, 1 / 60, {
        pouring: true,
        offset: 0.1,
        heat: 0.6,
        fill: 0.4,
        gel: false,
        reducedMotion: false,
      });
    }

    expect(liquid.particles.length).toBeGreaterThan(0);
    expect(liquid.surface.some((value) => Math.abs(value) > 0.001)).toBe(true);
    expect(Math.abs(surfaceAt(liquid, 0.5))).toBeLessThanOrEqual(1);
  });

  it("is deterministic with the same seed and input", () => {
    const a = createLiquidState(9);
    const b = createLiquidState(9);
    const input = {
      pouring: true,
      offset: -0.2,
      heat: 0.4,
      fill: 0.5,
      gel: true,
      reducedMotion: false,
    };

    for (let i = 0; i < 20; i += 1) {
      stepLiquid(a, 1 / 60, input);
      stepLiquid(b, 1 / 60, input);
    }

    expect(a.particles.length).toBe(b.particles.length);
    expect(a.surface).toEqual(b.surface);
  });

  it("samples the whole jar at high and low quality", () => {
    const high = surfacePoints(
      null,
      { x: 10, y: 30, width: 100, amplitude: 5 },
      "high",
    );
    const low = surfacePoints(
      null,
      { x: 10, y: 30, width: 100, amplitude: 5 },
      "low",
    );

    expect(high).toHaveLength(29);
    expect(low).toHaveLength(15);
    expect(high[0]).toEqual({ x: 10, y: 30 });
    expect(high[high.length - 1]).toEqual({ x: 110, y: 30 });
  });

  it("clamps the visual surface to the wave amplitude", () => {
    const liquid = createLiquidState(11);
    for (let i = 0; i < 24; i += 1) {
      stepLiquid(liquid, 1 / 60, {
        pouring: true,
        offset: 0.2,
        heat: 1,
        fill: 0.4,
        gel: false,
        reducedMotion: false,
      });
    }

    const points = surfacePoints(
      liquid,
      { x: 0, y: 50, width: 200, amplitude: 5 },
      "high",
    );

    expect(points.every((point) => Number.isFinite(point.y))).toBe(true);
    expect(points.every((point) => Math.abs(point.y - 50) <= 5)).toBe(true);
  });
});

describe("supply list", () => {
  it("builds a recipe with the exact supplies of a brief", () => {
    const design = designForBrief(briefs[0]);
    const recipe = buildRecipe(design);
    const ids = recipe.map((line) => line.supplyId);

    expect(ids).toContain("cera-vaso");
    expect(ids).toContain("aroma-lavanda");
    expect(ids).toContain("color-crema");
    expect(ids).toContain("recipiente-ambar");
    expect(ids).toContain("mecha-pabilo-67");
    expect(ids).toContain("mecha-porta-pabilo");
    expect(ids).toContain("herramienta-sostenedor");
    expect(ids).toContain("etiqueta-clasica");
    expect(ids).toContain("herramienta-termometro");

    const wax = recipe.find((line) => line.supplyId === "cera-vaso");
    expect(wax?.cantidad).toBe(225);
    expect(wax?.unidad).toBe("g");
  });

  it("uses the mold for figure candles", () => {
    const recipe = buildRecipe(designForBrief(briefs[2]));
    const ids = recipe.map((line) => line.supplyId);

    expect(ids).toContain("molde-luna");
    expect(ids).not.toContain("recipiente-ambar");
  });

  it("adds marked stearic acid only for block wax", () => {
    const block = buildRecipe(designForBrief(briefs[2]));
    const flakes = buildRecipe(designForBrief(briefs[0]));
    const stearic = block.find(
      (line) => line.supplyId === "aditivo-acido-estearico",
    );

    expect(stearic?.porConfirmar).toBe(true);
    expect(stearic?.cantidad).toBeGreaterThan(0);
    expect(
      flakes.some((line) => line.supplyId === "aditivo-acido-estearico"),
    ).toBe(false);
  });

  it("adds inclusions for gel designs", () => {
    const recipe = buildRecipe(designForBrief(briefs[3]));
    const ids = recipe.map((line) => line.supplyId);

    expect(ids).toContain("montaje-flores");
    expect(ids).toContain("montaje-brillo");
  });

  it("asks for one pabilo and one porta pabilo", () => {
    const design = designForBrief(briefs[0]);
    const recipe = buildRecipe(design);
    const wick = recipe.find((item) => item.supplyId === "mecha-pabilo-67");
    const holder = recipe.find(
      (item) => item.supplyId === "mecha-porta-pabilo",
    );

    expect(wick?.cantidad).toBe(1);
    expect(holder?.cantidad).toBe(1);
  });
});
