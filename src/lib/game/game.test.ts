import { describe, expect, it } from "vitest";
import {
  createCraft,
  finishPourUnit,
  labelAccuracy,
  pourAccuracy,
  trimAccuracy,
  wickAccuracy,
} from "./craft";
import { briefs, waxesById } from "./data";
import {
  createDesign,
  resizeLayer,
  setLayerCount,
  validateDesign,
} from "./design";
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
  craft.units = craft.units.map((unit) => ({
    ...unit,
    fill: unit.target,
    done: true,
    accuracy: 1,
  }));
  craft.wick = { x: 0, y: 0, placed: true, trimmed: true, trimMm: 5 };
  craft.label = { x: 0, y: 0, rotation: 0, placed: true };
  craft.gelPopped = craft.gelBubbles;
  craft.lidOn = true;
  craft.wrapped = true;

  return craft;
}

describe("briefs", () => {
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

  it("warns when the wick is too small for the vessel", () => {
    const design = designForBrief(briefs[0]);
    design.wickId = "eco";

    const warning = validateDesign(design).find(
      (issue) => issue.field === "wick" && issue.severity === "warning",
    );
    expect(warning).toBeDefined();
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
});

describe("supply list", () => {
  it("builds a recipe with the exact supplies of a brief", () => {
    const design = designForBrief(briefs[0]);
    const recipe = buildRecipe(design);
    const ids = recipe.map((line) => line.supplyId);

    expect(ids).toContain("cera-soya");
    expect(ids).toContain("aroma-lavanda");
    expect(ids).toContain("color-crema");
    expect(ids).toContain("recipiente-ambar");
    expect(ids).toContain("mecha-algodon");
    expect(ids).toContain("etiqueta-clasica");
    expect(ids).toContain("herramienta-termometro");

    const wax = recipe.find((line) => line.supplyId === "cera-soya");
    expect(wax?.cantidad).toBe(225);
    expect(wax?.unidad).toBe("g");
  });

  it("uses the mold for figure candles", () => {
    const recipe = buildRecipe(designForBrief(briefs[2]));
    const ids = recipe.map((line) => line.supplyId);

    expect(ids).toContain("molde-luna");
    expect(ids).not.toContain("recipiente-ambar");
  });

  it("adds inclusions for gel designs", () => {
    const recipe = buildRecipe(designForBrief(briefs[3]));
    const ids = recipe.map((line) => line.supplyId);

    expect(ids).toContain("montaje-flores");
    expect(ids).toContain("montaje-brillo");
  });

  it("asks for two units of double wick", () => {
    const design = designForBrief(briefs[0]);
    design.wickId = "doble";
    const line = buildRecipe(design).find(
      (item) => item.supplyId === "mecha-doble",
    );

    expect(line?.cantidad).toBe(2);
  });
});
