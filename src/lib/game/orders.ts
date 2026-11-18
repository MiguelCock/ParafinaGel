import type { Craft, Order, ScoreBreakdown } from "./types";

export const TEMP_MIN = 62;
export const TEMP_MAX = 76;
export const FILL_MIN = 78;
export const FILL_MAX = 92;

export function createCraft(): Craft {
  return {
    temperature: 20,
    meltTemperature: 20,
    overheated: false,
    heating: false,
    scentId: null,
    colorId: null,
    vesselId: null,
    labelId: null,
    stirs: 0,
    fill: 0,
    pouring: false,
    coolingRemaining: 4,
    cooled: false,
    wickTrimmed: false,
    lidOn: false,
    wrapped: false,
  };
}

export function isTemperatureInRange(temperature: number): boolean {
  return temperature >= TEMP_MIN && temperature <= TEMP_MAX;
}

export function isFillInRange(fill: number): boolean {
  return fill >= FILL_MIN && fill <= FILL_MAX;
}

export function scoreOrder(order: Order, craft: Craft): ScoreBreakdown {
  const scent = craft.scentId === order.scent.id ? 25 : 0;
  const color = craft.colorId === order.color.id ? 20 : 0;
  const vessel = craft.vesselId === order.vessel.id ? 10 : 0;
  const label = craft.labelId === order.label.id ? 10 : 0;

  const temperature = craft.overheated
    ? 0
    : isTemperatureInRange(craft.meltTemperature)
      ? 10
      : craft.meltTemperature >= 55 && craft.meltTemperature <= 84
        ? 5
        : 0;

  const fill = isFillInRange(craft.fill)
    ? 15
    : craft.fill >= 70 && craft.fill <= 97
      ? 8
      : 0;

  const finish =
    (craft.wickTrimmed ? 4 : 0) +
    (craft.lidOn ? 3 : 0) +
    (craft.wrapped ? 3 : 0);

  const total = scent + color + vessel + label + temperature + fill + finish;
  const stars =
    total >= 90 ? 5 : total >= 75 ? 4 : total >= 55 ? 3 : total >= 35 ? 2 : 1;

  const tip = Math.round(
    order.baseTip * (0.35 + (total / 100) * 0.65) * (stars === 5 ? 1.1 : 1),
  );

  return {
    scent,
    color,
    vessel,
    label,
    temperature,
    fill,
    finish,
    total,
    stars,
    price: order.basePrice,
    tip,
  };
}
