import { labelsById, orders, vesselsById, waxColorsById } from "./data";
import {
  createCraft,
  isFillInRange,
  isTemperatureInRange,
  scoreOrder,
} from "./orders";
import type {
  Craft,
  Order,
  Phase,
  Quality,
  ScoreBreakdown,
  View,
} from "./types";

export class Game3DState {
  phase = $state<Phase>("intro");
  view = $state<View>("overview");
  orderIndex = $state(0);
  craft = $state<Craft>(createCraft());
  score = $state<ScoreBreakdown | null>(null);
  totalTips = $state(0);
  totalPrice = $state(0);
  totalStars = $state(0);
  served = $state(0);
  quality = $state<Quality>("alta");
  paused = $state(false);

  get order(): Order {
    return orders[this.orderIndex] ?? orders[0];
  }

  get totalOrders(): number {
    return orders.length;
  }

  get isLastOrder(): boolean {
    return this.orderIndex >= orders.length - 1;
  }

  get currentOrderNumber(): number {
    return Math.min(this.orderIndex + 1, orders.length);
  }

  get isTemperatureReady(): boolean {
    return isTemperatureInRange(this.craft.temperature);
  }

  get isFillReady(): boolean {
    return isFillInRange(this.craft.fill);
  }

  get canContinueMelt(): boolean {
    return (
      isTemperatureInRange(this.craft.meltTemperature) &&
      !this.craft.overheated &&
      this.craft.scentId !== null &&
      this.craft.colorId !== null &&
      this.craft.stirs >= 3
    );
  }

  get canFinish(): boolean {
    return (
      this.craft.wickTrimmed &&
      this.craft.labelId !== null &&
      this.craft.lidOn &&
      this.craft.wrapped
    );
  }

  get waxHex(): string {
    return this.craft.colorId
      ? (waxColorsById[this.craft.colorId]?.hex ?? "#f3ddd2")
      : "#f3ddd2";
  }

  get glassHex(): string {
    return this.craft.vesselId
      ? (vesselsById[this.craft.vesselId]?.glass ?? "#f9f2e8")
      : "#f9f2e8";
  }

  get labelHex(): string {
    return this.craft.labelId
      ? (labelsById[this.craft.labelId]?.color ?? "#fbf3e9")
      : "#fbf3e9";
  }

  start(): void {
    this.phase = "counter";
    this.view = "counter";
  }

  setView(view: View): void {
    this.view = view;
  }

  takeOrder(): void {
    this.craft = createCraft();
    this.score = null;
    this.phase = "melt";
    this.view = "melt";
  }

  toggleHeat(): void {
    this.craft.heating = !this.craft.heating;
  }

  selectScent(id: string): void {
    this.craft.scentId = id;
  }

  selectColor(id: string): void {
    this.craft.colorId = id;
  }

  stir(): void {
    this.craft.stirs = Math.min(3, this.craft.stirs + 1);
  }

  goPour(): void {
    if (!this.canContinueMelt) return;
    this.craft.heating = false;
    this.phase = "pour";
    this.view = "pour";
  }

  togglePour(): void {
    this.craft.pouring = !this.craft.pouring;
  }

  selectVessel(id: string): void {
    this.craft.vesselId = id;
  }

  goCool(): void {
    if (this.craft.fill <= 0 || this.craft.vesselId === null) return;
    this.craft.pouring = false;
    this.craft.coolingRemaining = 4;
    this.craft.cooled = false;
    this.phase = "cool";
    this.view = "cool";
  }

  fan(): void {
    if (this.craft.cooled) return;
    this.craft.coolingRemaining = Math.max(
      0,
      this.craft.coolingRemaining - 0.9,
    );
    if (this.craft.coolingRemaining <= 0) {
      this.craft.cooled = true;
    }
  }

  goFinish(): void {
    if (!this.craft.cooled) return;
    this.phase = "finish";
    this.view = "finish";
  }

  trimWick(): void {
    this.craft.wickTrimmed = true;
  }

  selectLabel(id: string): void {
    this.craft.labelId = id;
  }

  addLid(): void {
    this.craft.lidOn = true;
  }

  wrap(): void {
    this.craft.wrapped = true;
  }

  serve(): void {
    if (!this.canFinish) return;
    const score = scoreOrder(this.order, this.craft);
    this.score = score;
    this.totalTips += score.tip;
    this.totalPrice += score.price;
    this.totalStars += score.stars;
    this.served += 1;
    this.phase = "score";
    this.view = "counter";
  }

  next(): void {
    if (this.isLastOrder) {
      this.phase = "dayEnd";
      this.view = "overview";
      return;
    }

    this.orderIndex += 1;
    this.craft = createCraft();
    this.score = null;
    this.phase = "counter";
    this.view = "counter";
  }

  restart(): void {
    this.phase = "intro";
    this.view = "overview";
    this.orderIndex = 0;
    this.craft = createCraft();
    this.score = null;
    this.totalTips = 0;
    this.totalPrice = 0;
    this.totalStars = 0;
    this.served = 0;
  }

  toggleQuality(): void {
    this.quality = this.quality === "alta" ? "baja" : "alta";
  }

  tick(delta: number): void {
    if (this.paused) return;

    if (this.phase === "melt") {
      if (this.craft.heating) {
        this.craft.temperature = Math.min(
          100,
          this.craft.temperature + 20 * delta,
        );
        if (this.craft.temperature > 85) {
          this.craft.overheated = true;
        }
      } else {
        this.craft.temperature = Math.max(
          20,
          this.craft.temperature - 4 * delta,
        );
      }

      if (
        this.craft.temperature >= 62 &&
        this.craft.temperature <= 76 &&
        !this.craft.overheated
      ) {
        this.craft.meltTemperature = this.craft.temperature;
      }
    }

    if (this.phase === "pour" && this.craft.pouring) {
      this.craft.fill = Math.min(100, this.craft.fill + 30 * delta);
    }

    if (this.phase === "cool" && !this.craft.cooled) {
      this.craft.coolingRemaining = Math.max(
        0,
        this.craft.coolingRemaining - delta,
      );
      if (this.craft.coolingRemaining <= 0) {
        this.craft.cooled = true;
      }
    }
  }
}
