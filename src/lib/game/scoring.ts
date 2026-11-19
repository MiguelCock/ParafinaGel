import { labelAccuracy, trimAccuracy, wickAccuracy } from "./craft";
import { waxesById } from "./data";
import type {
  BriefTarget,
  CandleDesign,
  Craft,
  DesignScore,
  ExecutionScore,
  ScoreBreakdown,
} from "./types";

function matchRatio(matched: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(1, matched / total);
}

export function scoreDesign(
  design: CandleDesign,
  target: BriefTarget | null,
): DesignScore {
  if (!target) {
    return {
      type: 10,
      wax: 8,
      vessel: 8,
      scent: 10,
      colors: 14,
      wick: 5,
      label: 5,
      total: 60,
    };
  }

  const type = design.mode === target.type ? 10 : 0;
  const wax = design.waxId === target.waxId ? 8 : 0;

  const vessel =
    target.type === "figura"
      ? design.moldId === target.moldId
        ? 8
        : 0
      : design.vesselId === target.vesselId
        ? 8
        : 0;

  const scent = design.scentIds.includes(target.scentId) ? 10 : 0;

  let colorRatio = 0;
  if (target.type === "figura") {
    const entries = Object.entries(target.figureColors ?? {});
    const matches = entries.filter(
      ([partId, colorId]) => design.figureColors[partId] === colorId,
    ).length;
    colorRatio = matchRatio(matches, entries.length);
  } else if (target.type === "gel") {
    const wanted = target.inclusions ?? [];
    const matches = wanted.filter((id) =>
      design.inclusions.includes(id),
    ).length;
    colorRatio = matchRatio(matches, wanted.length);
  } else {
    const wanted = target.layerColors ?? [];
    const matches = wanted.filter(
      (colorId, index) => design.layers[index]?.colorId === colorId,
    ).length;
    colorRatio = matchRatio(matches, wanted.length);
  }
  const colors = colorRatio * 14;

  const wick = design.wickId === target.wickId ? 5 : 0;
  const label = design.labelId === target.labelId ? 5 : 0;

  return {
    type,
    wax,
    vessel,
    scent,
    colors,
    wick,
    label,
    total: type + wax + vessel + scent + colors + wick + label,
  };
}

export function scoreExecution(
  design: CandleDesign,
  craft: Craft,
): ExecutionScore {
  const wax = design.waxId ? waxesById[design.waxId] : null;
  let temperature = 0;

  if (!craft.overheated && wax) {
    if (
      craft.meltTemperature >= wax.meltMin &&
      craft.meltTemperature <= wax.meltMax
    ) {
      temperature = 8;
    } else if (
      craft.meltTemperature >= wax.meltMin - 8 &&
      craft.meltTemperature <= wax.meltMax + 8
    ) {
      temperature = 4;
    }
  }

  const doneUnits = craft.units.filter((unit) => unit.done);
  const pour =
    doneUnits.length > 0
      ? (doneUnits.reduce((sum, unit) => sum + (unit.accuracy ?? 0), 0) /
          doneUnits.length) *
        10
      : 0;

  const mix = (1 - Math.min(1, Math.max(0, craft.mix))) * 4;
  const spill = (1 - Math.min(1, Math.max(0, craft.spill))) * 3;
  const wick = craft.wick.placed ? wickAccuracy(craft) * 6 : 0;
  const label = craft.label.placed ? labelAccuracy(craft) * 3 : 0;
  const trim = craft.wick.trimmed ? trimAccuracy(craft) * 2 : 0;
  const gel =
    design.mode === "gel" && craft.gelBubbles > 0
      ? (craft.gelPopped / craft.gelBubbles) * 4
      : 4;

  return {
    temperature,
    pour,
    mix,
    spill,
    wick,
    label,
    trim,
    gel,
    total: temperature + pour + mix + spill + wick + label + trim + gel,
  };
}

export function starsFor(total: number): number {
  if (total >= 90) return 5;
  if (total >= 75) return 4;
  if (total >= 55) return 3;
  if (total >= 35) return 2;
  return 1;
}

export function scoreCandle(
  design: CandleDesign,
  target: BriefTarget | null,
  craft: Craft,
): ScoreBreakdown {
  const designScore = scoreDesign(design, target);
  const execution = scoreExecution(design, craft);
  const total = designScore.total + execution.total;
  const stars = starsFor(total);

  return {
    design: designScore,
    execution,
    total,
    stars,
    points: Math.round(total) + stars * 10,
    sandbox: target === null,
  };
}
