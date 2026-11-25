import {
  briefs,
  moldsById,
  stationOrder,
  waxesById,
  wickTypesById,
} from "./data";
import {
  AROMA_POUR_RATE,
  GEL_BUBBLES,
  MAX_CUTS,
  MIX_FULL_STIRS,
  POUR_MIN_TO_FINISH,
  POUR_SPEED,
  TEMP_START,
  completeFilm,
  createCraft,
  currentUnit,
  cutReady as isCutReady,
  finishPourUnit,
  isPourComplete,
  meltHeatMultiplier,
  mixUnitReady,
  stearicReady as isStearicReady,
  waxNeedsCutting,
  waxNeedsStearic,
} from "./craft";
import {
  createDesign,
  isDesignReady,
  resizeLayer,
  setLayerCount,
  validateDesign,
} from "./design";
import { scoreCandle } from "./scoring";
import { buildRecipe } from "./supplies";
import type {
  Brief,
  CandleDesign,
  Craft,
  DesignIssue,
  GameMode,
  OrderType,
  Phase,
  PourUnit,
  RecipeLine,
  ScoreBreakdown,
  StationId,
  View,
  WickType,
  Wax,
} from "./types";

const initialDesign = createDesign("clasico");

export class GameState {
  mode = $state<GameMode>("guided");
  phase = $state<Phase>("intro");
  view = $state<View>("overview");
  briefIndex = $state(0);
  revealed = $state(1);
  noted = $state(false);
  design = $state<CandleDesign>(initialDesign);
  craft = $state<Craft>(createCraft(initialDesign));
  score = $state<ScoreBreakdown | null>(null);
  totalStars = $state(0);
  totalPoints = $state(0);
  served = $state(0);
  paused = $state(false);
  expert = $state(false);
  mixIndex = $state(0);

  get brief(): Brief {
    return briefs[this.briefIndex] ?? briefs[0];
  }

  get totalBriefs(): number {
    return briefs.length;
  }

  get currentOrderNumber(): number {
    return Math.min(this.briefIndex + 1, briefs.length);
  }

  get isLastBrief(): boolean {
    return this.briefIndex >= briefs.length - 1;
  }

  get activeStation(): StationId {
    switch (this.phase) {
      case "intro":
      case "brief":
        return "counter";
      case "score":
      case "dayEnd":
        return "finish";
      default:
        return this.phase;
    }
  }

  get stationIndex(): number {
    return stationOrder.indexOf(this.activeStation);
  }

  get wax(): Wax | null {
    return this.design.waxId ? (waxesById[this.design.waxId] ?? null) : null;
  }

  get meltMin(): number {
    return this.wax?.meltMin ?? 62;
  }

  get meltMax(): number {
    return this.wax?.meltMax ?? 76;
  }

  get isTemperatureReady(): boolean {
    return (
      this.craft.temperature >= this.meltMin &&
      this.craft.temperature <= this.meltMax
    );
  }

  get needsCutting(): boolean {
    return waxNeedsCutting(this.design);
  }

  get needsStearic(): boolean {
    return waxNeedsStearic(this.design);
  }

  get cutPrepared(): boolean {
    return isCutReady(this.design, this.craft);
  }

  get stearicPrepared(): boolean {
    return isStearicReady(this.design, this.craft);
  }

  get canHeat(): boolean {
    return this.cutPrepared;
  }

  get meltSpeed(): number {
    return meltHeatMultiplier(this.design, this.craft);
  }

  get canContinueMelt(): boolean {
    return (
      this.cutPrepared &&
      this.stearicPrepared &&
      this.craft.meltTemperature >= this.meltMin &&
      this.craft.meltTemperature <= this.meltMax &&
      !this.craft.overheated &&
      this.craft.stirs >= 3
    );
  }

  get mixUnit() {
    return this.craft.units[this.mixIndex] ?? null;
  }

  private mixTemperatureReady(unit: PourUnit): boolean {
    const wax = this.wax;
    return (
      Boolean(wax) &&
      unit.temperature >= (wax?.meltMin ?? 0) &&
      unit.temperature <= (wax?.meltMax ?? 100)
    );
  }

  get mixReadyCount(): number {
    return this.craft.units.filter((unit) => mixUnitReady(unit)).length;
  }

  get canContinueMix(): boolean {
    return (
      this.craft.units.length > 0 &&
      this.craft.units.every((unit) => mixUnitReady(unit))
    );
  }

  get unit() {
    return currentUnit(this.craft);
  }

  get pourComplete(): boolean {
    return isPourComplete(this.craft);
  }

  get canGoWick(): boolean {
    return this.canDesign;
  }

  get canGoCool(): boolean {
    return this.pourComplete && this.craft.wick.placed;
  }

  get canFinish(): boolean {
    return (
      this.craft.wick.placed &&
      this.craft.holderRemoved &&
      this.craft.wick.trimmed &&
      this.craft.label.placed &&
      this.craft.lidOn &&
      this.craft.wrapped
    );
  }

  get canGoFinish(): boolean {
    return this.craft.cooled && this.craft.holderRemoved;
  }

  get designIssues(): DesignIssue[] {
    return validateDesign(this.design);
  }

  get canDesign(): boolean {
    return isDesignReady(this.design);
  }

  get recipe(): RecipeLine[] {
    const mixed = this.craft.units.some(
      (unit) => unit.colorDrops > 0 || unit.aromaMl > 0 || unit.mix > 0,
    );
    return buildRecipe(this.design, mixed ? this.craft : undefined);
  }

  get wickInfo(): WickType | null {
    if (!this.design.wickId) return null;
    return wickTypesById[this.design.wickId] ?? null;
  }

  get coolingProgress(): number {
    const total = this.wax?.coolTime ?? 8;
    if (this.craft.cooled) return 100;
    return Math.min(
      100,
      Math.max(0, ((total - this.craft.coolingRemaining) / total) * 100),
    );
  }

  startGuided(): void {
    this.mode = "guided";
    this.briefIndex = 0;
    this.revealed = 1;
    this.noted = false;
    this.design = createDesign(this.brief.type);
    this.craft = createCraft(this.design);
    this.mixIndex = 0;
    this.score = null;
    this.totalStars = 0;
    this.totalPoints = 0;
    this.served = 0;
    this.phase = "brief";
    this.view = "counter";
  }

  startSandbox(): void {
    this.mode = "sandbox";
    this.briefIndex = 0;
    this.revealed = 0;
    this.noted = false;
    this.design = createDesign("clasico");
    this.craft = createCraft(this.design);
    this.mixIndex = 0;
    this.score = null;
    this.phase = "design";
    this.view = "design";
  }

  exitSandbox(): void {
    this.mode = "guided";
    this.phase = "intro";
    this.view = "overview";
    this.score = null;
  }

  setView(view: View): void {
    this.view = view;
  }

  revealNext(): void {
    if (this.revealed < this.brief.lines.length) {
      this.revealed += 1;
    }
  }

  revealAll(): void {
    this.revealed = this.brief.lines.length;
  }

  createNote(): void {
    if (this.revealed < this.brief.lines.length) return;
    this.noted = true;
    this.design = createDesign(this.brief.type);
    this.craft = createCraft(this.design);
    this.mixIndex = 0;
    this.phase = "design";
    this.view = "design";
  }

  setMode(type: OrderType): void {
    if (this.mode !== "sandbox") return;
    this.design = createDesign(type);
    this.craft = createCraft(this.design);
    this.mixIndex = 0;
    this.score = null;
  }

  selectWax(id: CandleDesign["waxId"]): void {
    this.design.waxId = id;
  }

  selectVessel(id: string): void {
    this.design.vesselId = id;
  }

  selectMold(id: string): void {
    this.design.moldId = id;
    const mold = moldsById[id];
    if (!mold) return;

    const nextColors: Record<string, string> = {};
    for (const part of mold.parts) {
      nextColors[part.id] = this.design.figureColors[part.id] ?? "natural";
    }
    this.design.figureColors = nextColors;
  }

  selectSize(id: string): void {
    this.design.sizeId = id;
  }

  selectScent(id: string): void {
    if (this.design.scentIds.includes(id)) {
      this.design.scentIds = this.design.scentIds.filter(
        (scentId) => scentId !== id,
      );
      this.refreshMixScents();
      return;
    }
    if (this.design.scentIds.length >= 4) return;
    this.design.scentIds = [...this.design.scentIds, id];
    this.refreshMixScents();
  }

  private refreshMixScents(): void {
    if (this.phase !== "design") return;
    const scents = this.design.scentIds;
    this.craft.units.forEach((unit, index) => {
      if (unit.aromaMl > 0) return;
      unit.scentId =
        scents.length > 0 ? (scents[index % scents.length] ?? null) : null;
    });
  }

  setLayerColor(index: number, colorId: string): void {
    const layer = this.design.layers[index];
    if (layer) layer.colorId = colorId;
  }

  setLayerHeight(index: number, value: number): void {
    this.design.layers = resizeLayer(this.design.layers, index, value);
  }

  addLayer(): void {
    this.design = setLayerCount(this.design, this.design.layers.length + 1);
  }

  removeLayer(): void {
    this.design = setLayerCount(this.design, this.design.layers.length - 1);
  }

  setFigureColor(partId: string, colorId: string): void {
    this.design.figureColors[partId] = colorId;
  }

  toggleInclusion(id: string): void {
    this.design.inclusions = this.design.inclusions.includes(id)
      ? this.design.inclusions.filter((item) => item !== id)
      : [...this.design.inclusions, id];
  }

  selectWick(id: string): void {
    this.design.wickId = id;
  }

  selectLabel(id: string): void {
    this.design.labelId = id;
  }

  goWick(): void {
    if (!this.canGoWick) return;
    this.craft = createCraft(this.design);
    this.mixIndex = 0;
    this.score = null;
    this.phase = "wick";
    this.view = "wick";
  }

  goMelt(): void {
    if (!this.craft.wick.placed) return;
    this.score = null;
    this.phase = "melt";
    this.view = "melt";
  }

  toggleHeat(): void {
    if (!this.craft.heating && !this.cutPrepared) return;
    this.craft.heating = !this.craft.heating;
  }

  startHeating(): void {
    if (!this.cutPrepared) return;
    this.craft.heating = true;
  }

  stopHeating(): void {
    this.craft.heating = false;
  }

  cutWax(): void {
    if (this.phase !== "melt" || !this.needsCutting) return;
    this.craft.cutCuts = Math.min(MAX_CUTS, this.craft.cutCuts + 1);
  }

  addStearic(): void {
    if (this.phase !== "melt" || !this.needsStearic || !this.cutPrepared)
      return;
    this.craft.stearicAdded = true;
  }

  stir(): void {
    if (!this.cutPrepared || !this.stearicPrepared) return;
    this.craft.stirs = Math.min(3, this.craft.stirs + 1);
  }

  goMix(): void {
    if (!this.canContinueMelt || !this.craft.wick.placed) return;
    this.craft.heating = false;
    this.stopAroma();
    const temperature = this.wax
      ? Math.max(TEMP_START, this.wax.meltMin - 6)
      : 54;
    for (const unit of this.craft.units) {
      unit.temperature = temperature;
      unit.heating = false;
    }
    this.craft.mix = 0;
    this.mixIndex = 0;
    this.phase = "mix";
    this.view = "mix";
  }

  selectMixBatch(index: number): void {
    if (this.phase !== "mix") return;
    this.stopAroma();
    for (const unit of this.craft.units) unit.heating = false;
    this.mixIndex = clamp(index, 0, Math.max(0, this.craft.units.length - 1));
  }

  startMixHeat(index: number): void {
    if (this.phase !== "mix") return;
    const unit = this.craft.units[index];
    if (!unit) return;
    this.selectMixBatch(index);
    for (const item of this.craft.units) item.heating = false;
    unit.heating = true;
  }

  stopMixHeat(index: number): void {
    const unit = this.craft.units[index];
    if (unit) unit.heating = false;
  }

  addColorDrop(index: number): void {
    if (this.phase !== "mix") return;
    const unit = this.craft.units[index];
    if (!unit || !this.mixTemperatureReady(unit)) return;
    unit.colorDrops = Math.min(30, unit.colorDrops + 1);
  }

  startAroma(index: number): void {
    if (this.phase !== "mix") return;
    const unit = this.craft.units[index];
    if (!unit || !this.mixTemperatureReady(unit)) return;
    this.selectMixBatch(index);
    this.stopAroma();
    unit.aromaPouring = true;
  }

  stopAroma(): void {
    for (const unit of this.craft.units) unit.aromaPouring = false;
  }

  stirMix(index: number): void {
    if (this.phase !== "mix") return;
    const unit = this.craft.units[index];
    if (
      !unit ||
      !this.mixTemperatureReady(unit) ||
      unit.colorDrops <= 0 ||
      unit.aromaMl <= 0
    ) {
      return;
    }
    unit.stirs = Math.min(MIX_FULL_STIRS, unit.stirs + 1);
    unit.mix = unit.stirs / MIX_FULL_STIRS;
    this.craft.mix =
      this.craft.units.reduce((sum, item) => sum + item.mix, 0) /
      this.craft.units.length;
  }

  setMixScent(index: number, scentId: string): void {
    if (this.phase !== "mix" || !this.design.scentIds.includes(scentId)) return;
    const unit = this.craft.units[index];
    if (!unit || unit.aromaMl > 0) return;
    unit.scentId = scentId;
  }

  goPour(): void {
    if (!this.canContinueMix || !this.craft.wick.placed) return;
    for (const unit of this.craft.units) unit.heating = false;
    this.stopAroma();
    this.craft.pourOffset = 0.55;
    this.phase = "pour";
    this.view = "pour";
  }

  startPour(): void {
    if (this.craft.waitingFilm) return;
    const unit = currentUnit(this.craft);
    if (!unit || unit.done || unit.fill >= 100) return;
    this.craft.pouring = true;
  }

  stopPour(): void {
    this.craft.pouring = false;
  }

  releasePour(): void {
    this.craft.pouring = false;
    const unit = currentUnit(this.craft);
    if (!unit || unit.done || this.craft.waitingFilm) return;
    if (unit.fill >= POUR_MIN_TO_FINISH) {
      finishPourUnit(this.craft, this.design.mode === "capas");
    }
  }

  setPourOffset(value: number): void {
    this.craft.pourOffset = clamp(value, -1, 1);
  }

  togglePour(): void {
    if (this.craft.waitingFilm) return;
    if (this.craft.pouring) {
      this.releasePour();
      return;
    }
    this.startPour();
  }

  finishUnit(): void {
    const unit = currentUnit(this.craft);
    if (!unit || unit.done || unit.fill < POUR_MIN_TO_FINISH) return;
    this.craft.pouring = false;
    finishPourUnit(this.craft, this.design.mode === "capas");
  }

  moveWick(dx: number, dy: number): void {
    this.craft.wick.x = clamp(this.craft.wick.x + dx, -30, 30);
    this.craft.wick.y = clamp(this.craft.wick.y + dy, -30, 30);
  }

  setWickPosition(x: number, y: number): void {
    this.craft.wick.x = clamp(x, -30, 30);
    this.craft.wick.y = clamp(y, -30, 30);
  }

  centerWick(): void {
    this.craft.wick.x = 0;
    this.craft.wick.y = 0;
  }

  placeWick(): void {
    this.craft.wick.placed = true;
    this.craft.holder = true;
    this.craft.holderRemoved = false;
    this.craft.wick.x = round(this.craft.wick.x);
    this.craft.wick.y = round(this.craft.wick.y);
  }

  removeHolder(): void {
    if (
      this.phase !== "cool" ||
      !this.craft.cooled ||
      !this.craft.holder ||
      this.craft.holderRemoved
    ) {
      return;
    }
    this.craft.holder = false;
    this.craft.holderRemoved = true;
  }

  goCool(): void {
    if (!this.canGoCool) return;
    const coolTime = this.wax?.coolTime ?? 8;
    this.craft.coolingRemaining = coolTime;
    this.craft.cooled = false;
    this.craft.gelBubbles = this.design.mode === "gel" ? GEL_BUBBLES : 0;
    this.craft.gelPopped = 0;
    this.craft.gelPopPulse = 0;
    this.craft.gelPopIndex = 0;
    this.phase = "cool";
    this.view = "cool";
  }

  fan(): void {
    if (this.craft.cooled) return;
    this.craft.coolingRemaining = Math.max(
      0,
      this.craft.coolingRemaining - 1.2,
    );
    if (this.craft.coolingRemaining <= 0) {
      this.craft.cooled = true;
    }
  }

  popBubble(): void {
    if (this.craft.gelPopped >= this.craft.gelBubbles) return;
    this.craft.gelPopIndex = this.craft.gelPopped;
    this.craft.gelPopPulse = 1;
    this.craft.gelPopped += 1;
  }

  goFinish(): void {
    if (!this.canGoFinish) return;
    this.phase = "finish";
    this.view = "finish";
  }

  setLabelX(value: number): void {
    this.craft.label.x = value;
  }

  setLabelY(value: number): void {
    this.craft.label.y = value;
  }

  setLabelRotation(value: number): void {
    this.craft.label.rotation = value;
  }

  placeLabel(): void {
    this.craft.label.placed = true;
  }

  setTrimMm(value: number): void {
    this.craft.wick.trimMm = value;
    this.craft.wick.trimmed = false;
  }

  cutWick(): void {
    this.craft.wick.trimmed = true;
  }

  addLid(): void {
    this.craft.lidOn = true;
    this.design.lidOn = true;
  }

  wrap(): void {
    this.craft.wrapped = true;
    this.design.wrapped = true;
  }

  serve(): void {
    if (!this.canFinish) return;

    const target = this.mode === "guided" ? this.brief.target : null;
    const result = scoreCandle(this.design, target, this.craft);
    this.score = result;

    if (this.mode === "guided") {
      this.totalStars += result.stars;
      this.totalPoints += result.points;
      this.served += 1;
    }

    this.phase = "score";
    this.view = "finish";
  }

  viewSandboxRecipe(): void {
    if (this.mode !== "sandbox" || !this.canDesign) return;
    this.score = null;
    this.phase = "score";
    this.view = "design";
  }

  viewRecipe(): void {
    if (!this.canDesign) return;
    this.score = null;
    this.phase = "score";
    this.view = "design";
  }

  backToDesign(): void {
    this.score = null;
    this.phase = "design";
    this.view = "design";
  }

  next(): void {
    if (this.mode === "sandbox") {
      this.backToDesign();
      return;
    }

    if (this.isLastBrief) {
      this.phase = "dayEnd";
      this.view = "overview";
      return;
    }

    this.briefIndex += 1;
    this.revealed = 1;
    this.noted = false;
    this.design = createDesign(this.brief.type);
    this.craft = createCraft(this.design);
    this.mixIndex = 0;
    this.score = null;
    this.phase = "brief";
    this.view = "counter";
  }

  restart(): void {
    this.mode = "guided";
    this.phase = "intro";
    this.view = "overview";
    this.briefIndex = 0;
    this.revealed = 1;
    this.noted = false;
    this.design = createDesign("clasico");
    this.craft = createCraft(this.design);
    this.mixIndex = 0;
    this.score = null;
    this.totalStars = 0;
    this.totalPoints = 0;
    this.served = 0;
    this.expert = false;
  }

  toggleExpert(): void {
    this.expert = !this.expert;
  }

  tick(delta: number): void {
    if (this.paused) return;

    if (this.phase === "melt") {
      const wax = this.wax;
      if (!wax) return;

      if (this.craft.heating) {
        this.craft.temperature = Math.min(
          110,
          this.craft.temperature + wax.heatRate * this.meltSpeed * delta,
        );
        if (this.craft.temperature > wax.meltMax + 12) {
          this.craft.overheated = true;
        }
      } else {
        this.craft.temperature = Math.max(
          20,
          this.craft.temperature - 2.4 * delta,
        );
      }

      if (
        !this.craft.overheated &&
        this.craft.temperature >= wax.meltMin &&
        this.craft.temperature <= wax.meltMax
      ) {
        this.craft.meltTemperature = this.craft.temperature;
      }
    }

    if (this.phase === "mix") {
      const wax = this.wax;
      if (!wax) return;

      for (const unit of this.craft.units) {
        if (unit.heating) {
          unit.temperature = Math.min(
            wax.meltMax,
            unit.temperature + wax.heatRate * 0.9 * delta,
          );
        }

        if (unit.aromaPouring) {
          if (
            unit.temperature >= wax.meltMin &&
            unit.temperature <= wax.meltMax
          ) {
            unit.aromaMl = Math.min(
              999,
              Math.round((unit.aromaMl + AROMA_POUR_RATE * delta) * 10) / 10,
            );
          } else {
            unit.aromaPouring = false;
          }
        }
      }
    }

    if (this.phase === "pour") {
      if (this.craft.waitingFilm) {
        this.craft.filmRemaining = Math.max(
          0,
          this.craft.filmRemaining - delta,
        );
        if (this.craft.filmRemaining <= 0) {
          completeFilm(this.craft);
        }
      } else if (this.craft.pouring) {
        const unit = currentUnit(this.craft);
        if (unit) {
          const aligned = Math.abs(this.craft.pourOffset) <= 0.32;
          if (aligned && unit.fill < 100) {
            unit.fill = Math.min(100, unit.fill + POUR_SPEED * delta);
          }

          if (!aligned || unit.fill >= 100) {
            this.craft.spill = Math.min(1, this.craft.spill + 0.2 * delta);
          }
        }
      }
    }

    if (this.phase === "cool") {
      this.craft.gelPopPulse = Math.max(
        0,
        this.craft.gelPopPulse - delta * 2.4,
      );
      if (!this.craft.cooled) {
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
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}
