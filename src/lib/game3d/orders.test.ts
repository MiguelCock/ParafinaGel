import { describe, expect, it } from "vitest";
import { orders } from "./data";
import {
  createCraft,
  isFillInRange,
  isTemperatureInRange,
  scoreOrder,
} from "./orders";
import type { Craft } from "./types";

const order = orders[0];

function perfectCraft(): Craft {
  return {
    ...createCraft(),
    temperature: 70,
    meltTemperature: 70,
    overheated: false,
    heating: false,
    scentId: order.scent.id,
    colorId: order.color.id,
    vesselId: order.vessel.id,
    labelId: order.label.id,
    stirs: 3,
    fill: 85,
    pouring: false,
    coolingRemaining: 0,
    cooled: true,
    wickTrimmed: true,
    lidOn: true,
    wrapped: true,
  };
}

describe("candle craft scoring", () => {
  it("starts with an empty craft", () => {
    const craft = createCraft();

    expect(craft.temperature).toBe(20);
    expect(craft.meltTemperature).toBe(20);
    expect(craft.overheated).toBe(false);
    expect(craft.fill).toBe(0);
    expect(craft.stirs).toBe(0);
    expect(craft.cooled).toBe(false);
  });

  it("awards 100 points and five stars for a perfect order", () => {
    const result = scoreOrder(order, perfectCraft());

    expect(result.total).toBe(100);
    expect(result.stars).toBe(5);
    expect(result.tip).toBe(Math.round(order.baseTip * 1.1));
    expect(result.price).toBe(order.basePrice);
  });

  it("uses the recorded melt temperature, not the current temperature", () => {
    const craft = perfectCraft();
    craft.temperature = 20;
    craft.meltTemperature = 70;

    expect(scoreOrder(order, craft).temperature).toBe(10);
  });

  it("penalizes an overheated batch", () => {
    const craft = perfectCraft();
    craft.overheated = true;

    const result = scoreOrder(order, craft);

    expect(result.temperature).toBe(0);
    expect(result.total).toBe(90);
  });

  it("penalizes a pour outside the target range", () => {
    const craft = perfectCraft();
    craft.fill = 50;

    const result = scoreOrder(order, craft);

    expect(result.fill).toBe(0);
    expect(result.total).toBe(85);
    expect(result.stars).toBe(4);
  });

  it("scores every wrong recipe choice as zero", () => {
    const craft = perfectCraft();
    craft.scentId = "cafe";
    craft.colorId = "salvia";
    craft.vesselId = "claro";
    craft.labelId = "regalo";

    const result = scoreOrder(order, craft);

    expect(result.scent).toBe(0);
    expect(result.color).toBe(0);
    expect(result.vessel).toBe(0);
    expect(result.label).toBe(0);
  });

  it("validates the temperature and fill windows", () => {
    expect(isTemperatureInRange(62)).toBe(true);
    expect(isTemperatureInRange(76)).toBe(true);
    expect(isTemperatureInRange(61.9)).toBe(false);
    expect(isTemperatureInRange(76.1)).toBe(false);
    expect(isFillInRange(78)).toBe(true);
    expect(isFillInRange(92)).toBe(true);
    expect(isFillInRange(77.9)).toBe(false);
    expect(isFillInRange(92.1)).toBe(false);
  });
});
