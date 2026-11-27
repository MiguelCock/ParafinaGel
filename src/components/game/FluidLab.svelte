<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import type { Application, Container, Graphics } from "pixi.js";
  import type { FluidState } from "@lib/game/fluid";
  import type { FluidRig } from "@lib/game/render/fluid-rig";
  import { clamp, viewportToStage } from "@lib/game/layout";
  import { motionDurations } from "@lib/game/motion";
  import { motion } from "@lib/game/motion.svelte";
  import { stageColors } from "@lib/game/render/palette";

  type BaseMaterial = "wax" | "gel";
  type LabMode = "idle" | "heating" | "pouring" | "calm" | "full" | "aroma";

  interface ColorOption {
    id: string;
    name: string;
    hex: string;
  }

  interface ScentOption {
    id: string;
    name: string;
    hex: string;
  }

  interface LabTelemetry {
    fps: number;
    simRate: number;
    temperature: number;
    aroma: number;
    status: string;
    mode: LabMode;
  }

  interface SceneOptions {
    base: BaseMaterial;
    accentHex: string;
    aromaHex: string;
    heat: number;
    paused: boolean;
    reduced: boolean;
    onTelemetry: (telemetry: LabTelemetry) => void;
  }

  interface Droplet {
    x: number;
    fromY: number;
    toY: number;
    elapsed: number;
    duration: number;
    color: number;
  }

  interface Ripple {
    x: number;
    y: number;
    life: number;
    maxLife: number;
  }

  const COLOR_OPTIONS: ColorOption[] = [
    { id: "terracota", name: "Terracota", hex: "#b4552f" },
    { id: "ambar", name: "Ámbar", hex: "#c98a4b" },
    { id: "salvia", name: "Salvia", hex: "#7c8b72" },
    { id: "lavanda", name: "Lavanda", hex: "#9b8bb4" },
    { id: "azul", name: "Azul", hex: "#7f95ab" },
    { id: "grafito", name: "Grafito", hex: "#5b5d63" },
  ];

  const SCENT_OPTIONS: ScentOption[] = [
    { id: "lavanda", name: "Lavanda", hex: "#9b8bb4" },
    { id: "vainilla", name: "Vainilla", hex: "#c98a4b" },
    { id: "cafe", name: "Café", hex: "#8a5a3c" },
    { id: "citricos", name: "Cítricos", hex: "#d9b45f" },
  ];

  // Lab-only 760x500 stage; production scenes use the shared 1000x640 STAGE.
  const GRID_WIDTH = 64;
  const GRID_HEIGHT = 32;
  const CELL_SIZE = 10;
  const SCENE_WIDTH = 760;
  const SCENE_HEIGHT = 500;
  const FLUID_LEFT = 60;
  const FLUID_TOP = 100;
  const FLUID_WIDTH = GRID_WIDTH * CELL_SIZE;
  const FLUID_HEIGHT = GRID_HEIGHT * CELL_SIZE;
  const FLUID_RIGHT = FLUID_LEFT + FLUID_WIDTH;
  const FLUID_BOTTOM = FLUID_TOP + FLUID_HEIGHT;
  const FLUID_CENTER = FLUID_LEFT + FLUID_WIDTH / 2;
  const FLUID_RADIUS = 24;
  const JAR_HOME_X = 620;
  const JAR_POUR_X = 482;
  const JAR_MIN_X = 430;
  const JAR_MAX_X = 664;
  const JAR_BASE_Y = 112;
  const JAR_TILT_START = 0.14;
  const JAR_TILT_MAX = 0.6;
  const JAR_SPOUT_X = -66;
  const JAR_SPOUT_Y = -84;
  const START_ROWS = 9;
  const MAX_FILL_RATIO = 0.55;
  const NORMAL_STEP = 1 / 60;
  const REDUCED_STEP = 1 / 12;
  const INITIAL_TEMPERATURE = 0.08;
  const WAX_HEX = 0xeed4ae;
  const GEL_HEX = 0xcfe8df;
  const WAX_CSS = "#eed4ae";
  const GEL_CSS = "#cfe8df";

  function hexToNumber(hex: string): number {
    const value = Number.parseInt(hex.replace("#", ""), 16);
    return Number.isFinite(value) ? value : 0;
  }

  function hasWebGL(): boolean {
    if (typeof document === "undefined") return false;
    try {
      const canvas = document.createElement("canvas");
      const context = (canvas.getContext("webgl2") ||
        canvas.getContext("webgl")) as
        WebGL2RenderingContext | WebGLRenderingContext | null;
      context?.getExtension("WEBGL_lose_context")?.loseContext();
      return Boolean(context);
    } catch {
      return false;
    }
  }

  class FluidLabScene {
    private host: HTMLElement;
    private onTelemetry: (telemetry: LabTelemetry) => void;
    private app: Application | null = null;
    private root: Container | null = null;
    private fluidLayer: Container | null = null;
    private fluidMask: Graphics | null = null;
    private jar: Container | null = null;
    private jarLiquid: Graphics | null = null;
    private stream: Graphics | null = null;
    private effects: Graphics | null = null;
    private steam: Graphics | null = null;
    private heatGlow: Graphics | null = null;
    private thermometerFill: Graphics | null = null;
    private rig: FluidRig | null = null;
    private fluid!: typeof import("@lib/game/fluid");
    private rigModule!: typeof import("@lib/game/render/fluid-rig");
    private fluidState!: FluidState;
    private resizeObserver: ResizeObserver | null = null;

    private base: BaseMaterial;
    private accentHex: string;
    private aromaHex: string;
    private heat: number;
    private paused: boolean;
    private reduced: boolean;

    private initialized = false;
    private disposed = false;
    private fluidDirty = false;
    private jarX = JAR_HOME_X;
    private jarTargetX = JAR_HOME_X;
    private jarScreenY = JAR_BASE_Y;
    private dragOffset = 0;
    private dragging = false;
    private pourRate = 0;
    private aimX = FLUID_CENTER;
    private clock = 0;
    private stepAccumulator = 0;
    private frameCount = 0;
    private displayTemperature = INITIAL_TEMPERATURE;
    private fillRatio = 0;
    private full = false;
    private flashLabel = "";
    private flashTimer = 0;
    private aromaTimer = 0;
    private fpsFrames = 0;
    private fpsWindowStart = 0;
    private lastFps = 0;
    private labSeed = 0x2f6e2b1;
    private droplets: Droplet[] = [];
    private ripples: Ripple[] = [];

    private tick = (): void => {
      const delta = Math.min(0.05, (this.app?.ticker.deltaMS ?? 16.7) / 1000);
      const suspended = this.paused || motion.hidden;
      this.frameCount += 1;

      if (!suspended) {
        this.clock += delta;
      }

      this.updateJar(delta);
      if (!suspended) {
        this.updateDroplets(delta);
        this.updateTimers(delta);
      }

      if (!suspended && this.initialized) {
        const interval = this.reduced ? REDUCED_STEP : NORMAL_STEP;
        this.stepAccumulator += delta;
        let steps = 0;
        while (this.stepAccumulator >= interval && steps < 2) {
          this.simulateStep();
          this.stepAccumulator -= interval;
          steps += 1;
        }
        if (this.stepAccumulator > interval * 3) {
          this.stepAccumulator = 0;
        }
      }

      if (this.fluidDirty) {
        this.rig?.update(this.fluidState);
        this.fluidDirty = false;
      }

      this.drawEffects();
      this.drawThermometer();
      this.trackFps();
    };

    constructor(host: HTMLElement, options: SceneOptions) {
      this.host = host;
      this.onTelemetry = options.onTelemetry;
      this.base = options.base;
      this.accentHex = options.accentHex;
      this.aromaHex = options.aromaHex;
      this.heat = options.heat;
      this.paused = options.paused;
      this.reduced = options.reduced;
    }

    async init(): Promise<void> {
      const [pixi, fluid, rigModule] = await Promise.all([
        import("@lib/game/render/lab-pixi"),
        import("@lib/game/fluid"),
        import("@lib/game/render/fluid-rig"),
      ]);
      if (this.disposed) return;

      this.fluid = fluid;
      this.rigModule = rigModule;
      this.fluidState = fluid.createFluidState(GRID_WIDTH, GRID_HEIGHT, 144);

      const app = new pixi.Application();
      await app.init({
        backgroundAlpha: 0,
        antialias: true,
        autoDensity: true,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
        resizeTo: this.host,
        preference: "webgl",
      });
      if (this.disposed) {
        app.destroy(true, { children: true });
        return;
      }

      this.app = app;
      app.canvas.style.display = "block";
      app.canvas.style.width = "100%";
      app.canvas.style.height = "100%";
      app.canvas.style.touchAction = "none";
      app.canvas.style.outline = "none";
      app.canvas.setAttribute("aria-hidden", "true");
      this.host.appendChild(app.canvas);

      const root = new pixi.Container();
      this.root = root;
      app.stage.addChild(root);
      this.buildScene(pixi);

      this.resetFluid(this.base);
      this.mountRig();
      this.layout();

      this.resizeObserver = new ResizeObserver(() => this.layout());
      this.resizeObserver.observe(this.host);
      app.ticker.add(this.tick);
      this.initialized = true;
      this.pushTelemetry();
    }

    destroy(): void {
      if (this.disposed) return;
      this.disposed = true;
      this.resizeObserver?.disconnect();
      this.resizeObserver = null;

      if (this.app) {
        this.app.ticker.remove(this.tick);
        this.rig?.destroy();
        this.rig = null;
        this.app.destroy(true, { children: true });
        this.app = null;
      }

      this.root = null;
      this.fluidLayer = null;
      this.fluidMask = null;
      this.jar = null;
      this.jarLiquid = null;
      this.stream = null;
      this.effects = null;
      this.steam = null;
      this.heatGlow = null;
      this.thermometerFill = null;
      this.host.replaceChildren();
      this.droplets = [];
      this.ripples = [];
    }

    setBase(next: BaseMaterial): void {
      if (next === this.base) return;
      this.base = next;
      if (!this.initialized) {
        this.drawJarLiquid();
        return;
      }

      const wax = this.fluid.FLUID_WAX;
      const gel = this.fluid.FLUID_GEL;
      for (let index = 0; index < this.fluidState.material.length; index += 1) {
        if (next === "wax" && this.fluidState.material[index] === gel) {
          this.fluidState.material[index] = wax;
        } else if (next === "gel" && this.fluidState.material[index] === wax) {
          this.fluidState.material[index] = gel;
        }
      }

      this.drawJarLiquid();
      this.fluidDirty = true;
      this.updateFillRatio();
    }

    setAccentColor(hex: string): void {
      if (hex === this.accentHex) return;
      this.accentHex = hex;
      this.drawJarLiquid();
      if (this.initialized) this.rebuildRig();
    }

    setAromaColor(hex: string): void {
      if (hex === this.aromaHex) return;
      this.aromaHex = hex;
      if (this.initialized) this.rebuildRig();
    }

    setHeat(value: number): void {
      this.heat = clamp(value, 0, 1);
    }

    setPaused(value: boolean): void {
      this.paused = value;
      if (value) this.pourRate = 0;
    }

    setReduced(value: boolean): void {
      this.reduced = value;
      if (value) {
        this.steam?.clear();
      }
    }

    reset(base: BaseMaterial = this.base): void {
      if (!this.initialized) return;
      this.base = base;
      this.resetFluid(base);
      this.jarX = JAR_HOME_X;
      this.jarTargetX = JAR_HOME_X;
      this.jarScreenY = JAR_BASE_Y;
      this.dragging = false;
      this.dragOffset = 0;
      this.pourRate = 0;
      this.aimX = FLUID_CENTER;
      this.clock = 0;
      this.stepAccumulator = 0;
      this.displayTemperature = INITIAL_TEMPERATURE;
      this.flashLabel = "";
      this.flashTimer = 0;
      this.aromaTimer = 0;
      this.droplets = [];
      this.ripples = [];
      this.drawJarLiquid();
      this.fluidDirty = true;
      this.pushTelemetry();
    }

    dropColor(): void {
      if (!this.initialized || this.paused) return;
      this.dropColorAt(this.aimX);
    }

    startAroma(): void {
      if (!this.initialized || this.paused) return;
      this.aimX = clamp(this.aimX, FLUID_LEFT + 40, FLUID_RIGHT - 40);
      this.flashLabel = "Chorrito de aroma";
      this.flashTimer = motionDurations.slow * 2.4;

      if (this.reduced) {
        this.spawnAromaBurst(12);
      } else {
        this.aromaTimer = motionDurations.slow * 2.2;
      }
    }

    pointerDown(clientX: number, clientY: number): void {
      if (!this.initialized || this.paused) return;
      const point = this.toScene(clientX, clientY);
      if (
        !point ||
        point.x < 0 ||
        point.x > SCENE_WIDTH ||
        point.y < 0 ||
        point.y > SCENE_HEIGHT
      ) {
        return;
      }

      if (point.y < 200 && point.x > 330) {
        const nearJar = Math.abs(point.x - this.jarX) < 90;
        this.dragOffset = nearJar ? point.x - this.jarX : 0;
        this.jarTargetX = clamp(
          point.x - this.dragOffset,
          JAR_MIN_X,
          JAR_MAX_X,
        );
        this.dragging = true;
        return;
      }

      if (point.y > 110 && point.y < FLUID_BOTTOM + 30) {
        this.aimX = clamp(point.x, FLUID_LEFT + 20, FLUID_RIGHT - 20);
        this.dropColorAt(this.aimX);
      }
    }

    pointerMove(clientX: number, clientY: number): void {
      if (!this.dragging || this.paused) return;
      const point = this.toScene(clientX, clientY);
      if (!point) return;
      this.jarTargetX = clamp(point.x - this.dragOffset, JAR_MIN_X, JAR_MAX_X);
    }

    pointerUp(): void {
      this.dragging = false;
      this.jarTargetX = JAR_HOME_X;
    }

    nudgeJar(direction: number): void {
      this.jarTargetX = clamp(
        this.jarTargetX + direction,
        JAR_MIN_X,
        JAR_MAX_X,
      );
    }

    togglePourPosition(): void {
      this.jarTargetX =
        this.jarTargetX < JAR_POUR_X + 50 ? JAR_HOME_X : JAR_POUR_X;
    }

    restoreJar(): void {
      this.jarTargetX = JAR_HOME_X;
      this.dragging = false;
    }

    private buildScene(pixi: typeof import("@lib/game/render/lab-pixi")): void {
      const root = this.root;
      if (!root) return;

      const background = new pixi.Graphics();
      background.rect(0, 0, SCENE_WIDTH, SCENE_HEIGHT).fill(stageColors.cream);
      background
        .circle(650, 90, 220)
        .fill({ color: stageColors.creamDeep, alpha: 0.55 });
      background
        .circle(80, 380, 250)
        .fill({ color: stageColors.accentSoft, alpha: 0.42 });
      background
        .roundRect(20, 20, SCENE_WIDTH - 40, SCENE_HEIGHT - 40, 38)
        .fill({ color: stageColors.surface, alpha: 0.55 });
      background
        .roundRect(0, 428, SCENE_WIDTH, 72, 26)
        .fill({ color: stageColors.woodLight, alpha: 0.9 });
      background
        .rect(0, 466, SCENE_WIDTH, 34)
        .fill({ color: stageColors.wood, alpha: 0.58 });

      for (let index = 0; index < 7; index += 1) {
        const y = 436 + index * 8;
        background
          .roundRect(42 + (index % 3) * 47, y, 250 + (index % 4) * 70, 2, 1)
          .fill({ color: stageColors.woodDark, alpha: 0.08 });
      }

      background
        .ellipse(FLUID_CENTER, FLUID_BOTTOM + 34, 300, 24)
        .fill({ color: stageColors.shadow, alpha: 0.1 });
      background
        .roundRect(FLUID_LEFT + 54, FLUID_BOTTOM + 20, FLUID_WIDTH - 108, 14, 7)
        .fill({ color: stageColors.steel, alpha: 0.75 });
      background
        .roundRect(FLUID_LEFT + 42, FLUID_BOTTOM + 33, FLUID_WIDTH - 84, 6, 3)
        .fill({ color: stageColors.steelDark, alpha: 0.5 });

      root.addChild(background);

      this.heatGlow = new pixi.Graphics();
      this.heatGlow
        .ellipse(FLUID_CENTER, FLUID_BOTTOM + 4, 270, 54)
        .fill({ color: stageColors.amber, alpha: 1 });
      this.heatGlow.alpha = 0;
      root.addChild(this.heatGlow);

      const glass = new pixi.Graphics();
      glass
        .roundRect(
          FLUID_LEFT - 12,
          FLUID_TOP - 18,
          FLUID_WIDTH + 24,
          FLUID_HEIGHT + 30,
          32,
        )
        .fill({ color: stageColors.sageSoft, alpha: 0.58 });
      glass
        .roundRect(
          FLUID_LEFT,
          FLUID_TOP,
          FLUID_WIDTH,
          FLUID_HEIGHT,
          FLUID_RADIUS,
        )
        .fill({ color: stageColors.sage, alpha: 0.05 });
      glass
        .roundRect(
          FLUID_LEFT - 4,
          FLUID_TOP - 6,
          FLUID_WIDTH + 8,
          FLUID_HEIGHT + 16,
          26,
        )
        .stroke({ width: 2, color: stageColors.border, alpha: 0.85 });

      for (let index = 1; index <= 5; index += 1) {
        const y = FLUID_TOP + (FLUID_HEIGHT / 6) * index;
        glass
          .roundRect(FLUID_LEFT + FLUID_WIDTH - 34, y, 16, 2, 1)
          .fill({ color: stageColors.muted, alpha: 0.26 });
      }
      root.addChild(glass);

      this.fluidLayer = new pixi.Container();
      root.addChild(this.fluidLayer);

      this.fluidMask = new pixi.Graphics();
      this.fluidMask
        .roundRect(
          FLUID_LEFT,
          FLUID_TOP,
          FLUID_WIDTH,
          FLUID_HEIGHT,
          FLUID_RADIUS,
        )
        .fill(0xffffff);
      root.addChild(this.fluidMask);

      const front = new pixi.Graphics();
      front
        .roundRect(FLUID_LEFT - 18, FLUID_TOP - 26, FLUID_WIDTH + 36, 26, 13)
        .fill({ color: stageColors.surface, alpha: 0.94 })
        .stroke({ width: 2, color: stageColors.border, alpha: 0.9 });
      front
        .roundRect(FLUID_LEFT - 10, FLUID_TOP - 22, FLUID_WIDTH + 20, 7, 3)
        .fill({ color: stageColors.white, alpha: 0.5 });
      front
        .roundRect(FLUID_LEFT + 18, FLUID_TOP + 30, 14, FLUID_HEIGHT - 84, 7)
        .fill({ color: stageColors.white, alpha: 0.2 });
      front
        .roundRect(FLUID_LEFT - 6, FLUID_BOTTOM + 2, FLUID_WIDTH + 12, 14, 7)
        .fill({ color: stageColors.creamDeep, alpha: 0.62 })
        .stroke({ width: 1.5, color: stageColors.border, alpha: 0.8 });
      root.addChild(front);

      const thermometer = new pixi.Graphics();
      thermometer
        .roundRect(722, 150, 16, 200, 8)
        .fill({ color: stageColors.surface, alpha: 0.94 })
        .stroke({ width: 2, color: stageColors.border, alpha: 0.9 });
      thermometer
        .circle(730, 358, 18)
        .fill({ color: stageColors.surface, alpha: 0.96 })
        .stroke({ width: 2, color: stageColors.border, alpha: 0.9 });
      thermometer
        .roundRect(727, 160, 6, 180, 3)
        .fill({ color: stageColors.creamDeep, alpha: 0.8 });
      for (let index = 0; index < 6; index += 1) {
        const y = 176 + index * 30;
        thermometer
          .roundRect(710, y, 8, 2, 1)
          .fill({ color: stageColors.muted, alpha: 0.4 });
        thermometer
          .roundRect(745, y, 5, 2, 1)
          .fill({ color: stageColors.muted, alpha: 0.25 });
      }
      root.addChild(thermometer);

      this.thermometerFill = new pixi.Graphics();
      root.addChild(this.thermometerFill);

      this.stream = new pixi.Graphics();
      root.addChild(this.stream);

      this.effects = new pixi.Graphics();
      root.addChild(this.effects);

      this.steam = new pixi.Graphics();
      root.addChild(this.steam);

      const jar = new pixi.Container();
      jar.position.set(this.jarX, this.jarScreenY);

      const body = new pixi.Graphics();
      body
        .roundRect(-56, -92, 112, 92, 20)
        .fill({ color: stageColors.surface, alpha: 0.96 })
        .stroke({ width: 3, color: stageColors.woodDark, alpha: 0.92 });
      body
        .moveTo(-56, -92)
        .lineTo(-88, -80)
        .lineTo(-56, -66)
        .closePath()
        .fill({ color: stageColors.surface, alpha: 0.96 })
        .stroke({ width: 3, color: stageColors.woodDark, alpha: 0.92 });
      body
        .moveTo(54, -78)
        .quadraticCurveTo(94, -66, 58, -26)
        .stroke({ width: 10, color: stageColors.wood, alpha: 0.95 });
      body
        .moveTo(54, -78)
        .quadraticCurveTo(88, -66, 60, -30)
        .stroke({ width: 3, color: stageColors.creamDeep, alpha: 0.85 });
      body
        .roundRect(-58, -99, 116, 12, 6)
        .fill({ color: stageColors.creamDeep, alpha: 0.96 })
        .stroke({ width: 2, color: stageColors.woodDark, alpha: 0.7 });
      jar.addChild(body);

      this.jarLiquid = new pixi.Graphics();
      jar.addChild(this.jarLiquid);

      const shine = new pixi.Graphics();
      shine
        .roundRect(-44, -82, 10, 38, 5)
        .fill({ color: stageColors.white, alpha: 0.32 });
      jar.addChild(shine);

      this.jar = jar;
      root.addChild(jar);
      this.drawJarLiquid();
    }

    private mountRig(): void {
      if (!this.fluidLayer || !this.fluidMask) return;
      const rig = new this.rigModule.FluidRig(this.fluidState, {
        scale: CELL_SIZE,
        palette: {
          wax: WAX_CSS,
          gel: GEL_CSS,
          color: this.accentHex,
          aroma: this.aromaHex,
        },
      });
      rig.sprite.texture.source.scaleMode = "linear";
      rig.sprite.position.set(FLUID_LEFT, FLUID_TOP);
      rig.sprite.mask = this.fluidMask;
      this.fluidLayer.addChild(rig.sprite);
      this.rig = rig;
      this.fluidDirty = true;
    }

    private rebuildRig(): void {
      this.rig?.sprite.removeFromParent();
      this.rig?.destroy();
      this.rig = null;
      this.mountRig();
    }

    private resetFluid(base: BaseMaterial): void {
      if (!this.fluid || !this.fluidState) return;
      this.fluid.clearFluid(this.fluidState);
      const material =
        base === "wax" ? this.fluid.FLUID_WAX : this.fluid.FLUID_GEL;

      const top = GRID_HEIGHT - START_ROWS;
      for (let x = 0; x < GRID_WIDTH; x += 1) {
        for (let y = top; y < GRID_HEIGHT; y += 1) {
          this.fluid.setFluidCell(
            this.fluidState,
            x,
            y,
            material,
            0,
            INITIAL_TEMPERATURE,
            0,
          );
        }
      }

      this.updateFillRatio();
      this.fluidDirty = true;
    }

    private updateFillRatio(): void {
      if (!this.fluid) return;
      let count = 0;
      for (const value of this.fluidState.material) {
        if (
          value !== this.fluid.FLUID_EMPTY &&
          value !== this.fluid.FLUID_WALL
        ) {
          count += 1;
        }
      }
      this.fillRatio = count / (GRID_WIDTH * GRID_HEIGHT);
      this.full = this.fillRatio >= MAX_FILL_RATIO;
    }

    private simulateStep(): void {
      if (!this.fluid) return;
      const targetTemperature = this.heat * 0.92;
      const warmth = this.reduced ? 0.05 : 0.012;
      for (let index = 0; index < this.fluidState.material.length; index += 1) {
        const material = this.fluidState.material[index]!;
        if (
          material !== this.fluid.FLUID_WAX &&
          material !== this.fluid.FLUID_GEL
        ) {
          continue;
        }
        const current =
          this.fluidState.temperature[index] ?? INITIAL_TEMPERATURE;
        this.fluidState.temperature[index] =
          current + (targetTemperature - current) * warmth;
      }
      this.displayTemperature +=
        (targetTemperature - this.displayTemperature) *
        (this.reduced ? 0.08 : 0.02);

      if (this.pourRate > 0.02 && !this.full) this.emitPour();
      if (this.aromaTimer > 0 && this.frameCount % 5 === 0) {
        this.emitAroma();
      }

      // Heat only feeds the solver temperature; flow stays material-defined.
      this.fluid.stepFluid(this.fluidState);

      if (this.frameCount % 15 === 0) this.updateFillRatio();
      this.fluidDirty = true;
    }

    private emitPour(): void {
      if (!this.fluid) return;
      const spout = this.spoutPoint();
      const column = clamp(
        Math.round((spout.x - FLUID_LEFT) / CELL_SIZE),
        1,
        GRID_WIDTH - 2,
      );
      const material =
        this.base === "wax" ? this.fluid.FLUID_WAX : this.fluid.FLUID_GEL;
      const amount = this.pourRate > 0.7 ? 3 : this.pourRate > 0.4 ? 2 : 1;

      for (let index = 0; index < amount; index += 1) {
        const x = clamp(
          column + Math.floor(this.random() * 3) - 1,
          1,
          GRID_WIDTH - 2,
        );
        this.fluid.setFluidCell(this.fluidState, x, 0, material, 0, 0.18, 0);
        if (this.random() < 0.35) {
          this.fluid.setFluidCell(this.fluidState, x, 1, material, 0, 0.18, 0);
        }
      }
    }

    private emitAroma(): void {
      if (!this.fluid) return;
      const column = clamp(
        Math.round((this.aimX - FLUID_LEFT) / CELL_SIZE),
        2,
        GRID_WIDTH - 3,
      );
      const surface = this.surfaceCellY(column);
      const y = Math.max(0, surface - 1);
      const x = clamp(
        column + Math.floor(this.random() * 3) - 1,
        1,
        GRID_WIDTH - 2,
      );
      this.fluid.setFluidCell(
        this.fluidState,
        x,
        y,
        this.fluid.FLUID_AROMA,
        0,
        0.4,
        1,
      );
      this.fluidDirty = true;
    }

    private random(): number {
      this.labSeed = (this.labSeed * 1664525 + 1013904223) >>> 0;
      return this.labSeed / 4294967296;
    }

    private spawnAromaBurst(count: number): void {
      if (!this.fluid) return;
      const column = clamp(
        Math.round((this.aimX - FLUID_LEFT) / CELL_SIZE),
        2,
        GRID_WIDTH - 3,
      );
      const surface = this.surfaceCellY(column);
      for (let index = 0; index < count; index += 1) {
        const offset = Math.round(Math.sin(index * 1.7) * 6);
        const x = clamp(column + offset, 1, GRID_WIDTH - 2);
        const y = Math.max(0, surface - 1 - (index % 2));
        this.fluid.setFluidCell(
          this.fluidState,
          x,
          y,
          this.fluid.FLUID_AROMA,
          0,
          0.4,
          1,
        );
      }
      this.fluidDirty = true;
    }

    private dropColorAt(sceneX: number): void {
      if (!this.fluid) return;
      const x = clamp(sceneX, FLUID_LEFT + 20, FLUID_RIGHT - 20);
      this.aimX = x;
      this.flashLabel = "Gota de color";
      this.flashTimer = motionDurations.slow * 2.4;

      if (this.reduced) {
        this.spawnColorAt(x);
        return;
      }

      this.droplets.push({
        x,
        fromY: FLUID_TOP - 24,
        toY: Math.max(FLUID_TOP + 18, this.surfaceSceneY(x) - 6),
        elapsed: 0,
        duration: motionDurations.slow,
        color: hexToNumber(this.accentHex),
      });
    }

    private spawnColorAt(sceneX: number): void {
      if (!this.fluid) return;
      const column = clamp(
        Math.round((sceneX - FLUID_LEFT) / CELL_SIZE),
        1,
        GRID_WIDTH - 2,
      );
      const surface = this.surfaceCellY(column);
      const packed = hexToNumber(this.accentHex);
      for (let dx = -1; dx <= 1; dx += 1) {
        for (let dy = -1; dy <= 0; dy += 1) {
          const x = clamp(column + dx, 1, GRID_WIDTH - 2);
          const y = clamp(surface + dy, 0, GRID_HEIGHT - 1);
          this.fluid.setFluidCell(
            this.fluidState,
            x,
            y,
            this.fluid.FLUID_COLOR,
            packed,
            0.4,
            0,
          );
        }
      }
      if (!this.reduced) {
        this.ripples.push({
          x: sceneX,
          y: this.surfaceSceneY(sceneX),
          life: motionDurations.slow,
          maxLife: motionDurations.slow,
        });
      }
      this.fluidDirty = true;
    }

    private updateDroplets(delta: number): void {
      if (this.droplets.length === 0) return;
      const remaining: Droplet[] = [];
      for (const drop of this.droplets) {
        drop.elapsed += delta;
        if (drop.elapsed >= drop.duration) {
          this.spawnColorAt(drop.x);
        } else {
          remaining.push(drop);
        }
      }
      this.droplets = remaining;
    }

    private updateTimers(delta: number): void {
      if (this.paused) return;
      if (this.flashTimer > 0)
        this.flashTimer = Math.max(0, this.flashTimer - delta);
      if (this.aromaTimer > 0)
        this.aromaTimer = Math.max(0, this.aromaTimer - delta);

      const ripples: Ripple[] = [];
      for (const ripple of this.ripples) {
        ripple.life -= delta;
        if (ripple.life > 0) ripples.push(ripple);
      }
      this.ripples = ripples;
    }

    private updateJar(delta: number): void {
      if (!this.jar) return;
      const response = this.reduced
        ? 1
        : 1 - Math.exp(-delta / motionDurations.fast);
      this.jarX += (this.jarTargetX - this.jarX) * response;

      const bob =
        this.reduced || this.dragging || this.paused
          ? 0
          : Math.sin(this.clock * 1.6) * 2.2;
      this.jarScreenY = JAR_BASE_Y + bob;
      this.jar.position.set(this.jarX, this.jarScreenY);
      this.jar.rotation = -this.tilt;

      const spout = this.spoutPoint();
      const ramp =
        this.tilt <= JAR_TILT_START
          ? 0
          : clamp(
              (this.tilt - JAR_TILT_START) / (JAR_TILT_MAX - JAR_TILT_START),
              0,
              1,
            );
      const clampedX = clamp(spout.x, FLUID_LEFT + 12, FLUID_RIGHT - 12);
      const centerFactor = clamp(
        1 - Math.abs(clampedX - FLUID_CENTER) / (FLUID_WIDTH / 2),
        0.22,
        1,
      );
      this.pourRate =
        this.paused || motion.hidden || this.full ? 0 : ramp * centerFactor;
    }

    private drawEffects(): void {
      if (!this.stream || !this.effects || !this.steam) return;
      this.stream.clear();
      this.effects.clear();
      this.steam.clear();

      if (this.heatGlow) {
        this.heatGlow.alpha = this.heat > 0.02 ? 0.06 + this.heat * 0.32 : 0;
      }

      if (this.pourRate > 0.02 && !this.paused) {
        const spout = this.spoutPoint();
        const impactY = this.surfaceSceneY(spout.x) - 2;
        const color = this.base === "wax" ? WAX_HEX : GEL_HEX;
        this.stream
          .moveTo(spout.x, spout.y + 4)
          .lineTo(spout.x, impactY)
          .stroke({
            width: 2 + this.pourRate * 5,
            color,
            alpha: 0.76,
          });
        this.stream
          .moveTo(spout.x + 1, spout.y + 8)
          .lineTo(spout.x + 1, impactY)
          .stroke({ width: 1, color: stageColors.white, alpha: 0.36 });
      }

      if (this.aromaTimer > 0 && !this.paused) {
        const topY = FLUID_TOP - 24;
        const bottomY = this.surfaceSceneY(this.aimX) - 4;
        const aromaColor = hexToNumber(this.aromaHex);
        this.stream
          .roundRect(this.aimX - 6, topY - 18, 12, 18, 4)
          .fill({ color: aromaColor, alpha: 0.7 });
        this.stream.circle(this.aimX, topY - 2, 3).fill({
          color: aromaColor,
          alpha: 0.75,
        });
        this.stream.moveTo(this.aimX, topY);
        for (let index = 1; index <= 6; index += 1) {
          const progress = index / 6;
          const x =
            this.aimX +
            Math.sin(this.clock * 5 + index * 0.9) * 6 * (1 - progress * 0.5);
          const y = topY + (bottomY - topY) * progress;
          this.stream.lineTo(x, y);
        }
        this.stream.stroke({
          width: 3,
          color: aromaColor,
          alpha: 0.62,
        });
      }

      for (const drop of this.droplets) {
        const progress = clamp(drop.elapsed / drop.duration, 0, 1);
        const y = drop.fromY + (drop.toY - drop.fromY) * progress * progress;
        this.effects.circle(drop.x, y, 5).fill({
          color: drop.color,
          alpha: 0.9,
        });
        this.effects.circle(drop.x - 1.6, y - 1.6, 1.5).fill({
          color: stageColors.white,
          alpha: 0.55,
        });
      }

      for (const ripple of this.ripples) {
        const progress = 1 - ripple.life / ripple.maxLife;
        this.effects
          .ellipse(ripple.x, ripple.y, 6 + progress * 30, 2 + progress * 10)
          .stroke({
            width: 1.5,
            color: stageColors.white,
            alpha: (1 - progress) * 0.55,
          });
      }

      if (!this.reduced && this.heat > 0.12) {
        const surfaceY = this.surfaceSceneY(FLUID_CENTER);
        for (let index = 0; index < 4; index += 1) {
          const phase = (this.clock * 0.28 + index / 4) % 1;
          const x =
            FLUID_CENTER +
            (index - 1.5) * 42 +
            Math.sin(this.clock * 1.3 + index) * 12;
          const y = surfaceY - 10 - phase * 150;
          const alpha = (1 - phase) * 0.12 * this.heat;
          this.steam.circle(x, y, 5 + phase * 12).fill({
            color: stageColors.white,
            alpha,
          });
        }
      }
    }

    private drawThermometer(): void {
      if (!this.thermometerFill) return;
      const normalized = clamp(this.displayTemperature, 0, 1);
      const height = 8 + normalized * 172;
      const top = 340 - height;
      this.thermometerFill.clear();
      this.thermometerFill
        .roundRect(727, top, 6, height, 3)
        .fill({ color: stageColors.accent, alpha: 0.85 });
      this.thermometerFill
        .roundRect(727, 334, 6, 25, 3)
        .fill({ color: stageColors.accent, alpha: 0.85 });
      this.thermometerFill
        .circle(730, 358, 14)
        .fill({ color: stageColors.accent, alpha: 0.88 });
    }

    private drawJarLiquid(): void {
      if (!this.jarLiquid) return;
      const liquid = this.base === "wax" ? WAX_HEX : GEL_HEX;
      this.jarLiquid.clear();
      this.jarLiquid.roundRect(-46, -58, 92, 48, 12).fill({
        color: liquid,
        alpha: this.base === "gel" ? 0.72 : 0.92,
      });
      this.jarLiquid
        .roundRect(-52, -38, 104, 6, 3)
        .fill({ color: hexToNumber(this.accentHex), alpha: 0.55 });
      this.jarLiquid
        .roundRect(-46, -58, 92, 5, 2.5)
        .fill({ color: stageColors.white, alpha: 0.24 });
    }

    private get tilt(): number {
      const ratio = (JAR_HOME_X - this.jarX) / (JAR_HOME_X - JAR_POUR_X);
      return clamp(ratio * JAR_TILT_MAX, 0, JAR_TILT_MAX);
    }

    private spoutPoint(): { x: number; y: number } {
      const angle = -this.tilt;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return {
        x: this.jarX + JAR_SPOUT_X * cos - JAR_SPOUT_Y * sin,
        y: this.jarScreenY + JAR_SPOUT_X * sin + JAR_SPOUT_Y * cos,
      };
    }

    private surfaceCellY(column: number): number {
      if (!this.fluid) return GRID_HEIGHT - 1;
      const clamped = clamp(column, 0, GRID_WIDTH - 1);
      for (let y = 0; y < GRID_HEIGHT; y += 1) {
        const material = this.fluidState.material[y * GRID_WIDTH + clamped]!;
        if (
          material !== this.fluid.FLUID_EMPTY &&
          material !== this.fluid.FLUID_WALL
        ) {
          return y;
        }
      }
      return GRID_HEIGHT - 1;
    }

    private surfaceSceneY(sceneX: number): number {
      const column = clamp(
        Math.round((sceneX - FLUID_LEFT) / CELL_SIZE),
        0,
        GRID_WIDTH - 1,
      );
      return FLUID_TOP + this.surfaceCellY(column) * CELL_SIZE;
    }

    private toScene(
      clientX: number,
      clientY: number,
    ): { x: number; y: number } | null {
      if (!this.app || !this.root) return null;
      const rect = this.app.canvas.getBoundingClientRect();
      const scale = this.root.scale.x;
      if (rect.width <= 0 || rect.height <= 0 || scale <= 0) return null;
      return viewportToStage(
        { x: clientX - rect.left, y: clientY - rect.top },
        { scale, offsetX: this.root.x, offsetY: this.root.y },
      );
    }

    private layout(): void {
      if (!this.app || !this.root) return;
      const width = this.app.screen.width;
      const height = this.app.screen.height;
      if (width <= 0 || height <= 0) return;
      const scale = Math.min(width / SCENE_WIDTH, height / SCENE_HEIGHT);
      this.root.scale.set(scale);
      this.root.position.set(
        (width - SCENE_WIDTH * scale) / 2,
        (height - SCENE_HEIGHT * scale) / 2,
      );
    }

    private trackFps(): void {
      this.fpsFrames += 1;
      const now = performance.now();
      if (this.fpsWindowStart === 0) {
        this.fpsWindowStart = now;
        return;
      }
      const elapsed = (now - this.fpsWindowStart) / 1000;
      if (elapsed < 0.5) return;
      this.lastFps = Math.round(this.fpsFrames / elapsed);
      this.fpsFrames = 0;
      this.fpsWindowStart = now;
      this.pushTelemetry();
    }

    private pushTelemetry(): void {
      if (!this.initialized) return;
      const status = this.statusInfo();
      let aroma = 0;
      if (this.fluid) {
        for (
          let index = 0;
          index < this.fluidState.material.length;
          index += 1
        ) {
          const material = this.fluidState.material[index]!;
          if (
            material === this.fluid.FLUID_WAX ||
            material === this.fluid.FLUID_GEL
          ) {
            aroma = Math.max(aroma, this.fluidState.aroma[index] ?? 0);
          }
        }
      }

      this.onTelemetry({
        fps: this.lastFps,
        simRate: this.paused || motion.hidden ? 0 : this.reduced ? 12 : 60,
        temperature: Math.round(20 + this.displayTemperature * 100),
        aroma: Math.round(aroma * 100),
        status: status.text,
        mode: status.mode,
      });
    }

    private statusInfo(): { text: string; mode: LabMode } {
      if (this.paused) return { text: "En calma", mode: "calm" };
      if (this.full) return { text: "Frasco lleno · reinicia", mode: "full" };
      if (this.pourRate > 0.02) {
        const label =
          this.pourRate > 0.7
            ? "caudal alto"
            : this.pourRate > 0.4
              ? "caudal medio"
              : "caudal bajo";
        return { text: `Vertiendo · ${label}`, mode: "pouring" };
      }
      if (this.aromaTimer > 0) {
        return { text: "Chorrito de aroma", mode: "aroma" };
      }
      if (this.flashTimer > 0 && this.flashLabel) {
        return { text: this.flashLabel, mode: "idle" };
      }
      if (this.heat > 0.65) {
        return { text: "Calor alto · cuidado", mode: "heating" };
      }
      if (this.heat > 0.05) {
        return { text: "Calentando suave", mode: "heating" };
      }
      return {
        text: this.base === "wax" ? "Cera en reposo" : "Gel en reposo",
        mode: "idle",
      };
    }
  }

  let host: HTMLDivElement;

  let base = $state<BaseMaterial>("wax");
  let colorId = $state(COLOR_OPTIONS[0]!.id);
  let scentId = $state(SCENT_OPTIONS[0]!.id);
  let heat = $state(0);
  let paused = $state(false);
  let loading = $state(true);
  let failed = $state(false);
  let interacting = $state(false);
  let draggingKnob = $state(false);
  let feedback = $state("Preparando el laboratorio…");
  let lab = $state.raw<FluidLabScene | null>(null);
  let telemetry = $state<LabTelemetry>({
    fps: 0,
    simRate: 60,
    temperature: 28,
    aroma: 0,
    status: "Iniciando el fluido",
    mode: "idle",
  });

  let feedbackTimer: ReturnType<typeof setTimeout> | null = null;
  let knobStartY = 0;
  let knobStartValue = 0;

  const selectedColor = $derived(
    COLOR_OPTIONS.find((option) => option.id === colorId) ?? COLOR_OPTIONS[0]!,
  );
  const selectedScent = $derived(
    SCENT_OPTIONS.find((option) => option.id === scentId) ?? SCENT_OPTIONS[0]!,
  );
  const heatPercent = $derived(Math.round(heat * 100));
  const heatTarget = $derived(Math.round(20 + heat * 92));
  const temperaturePercent = $derived(
    clamp(telemetry.temperature - 20, 0, 100),
  );
  const aromaPercent = $derived(clamp(telemetry.aroma, 0, 100));
  const ready = $derived(lab !== null && !failed);
  const canInteract = $derived(ready && !paused);

  $effect(() => {
    const scene = lab;
    if (!scene) return;
    scene.setBase(base);
    scene.setAccentColor(selectedColor.hex);
    scene.setAromaColor(selectedScent.hex);
    scene.setHeat(heat);
    scene.setPaused(paused);
    scene.setReduced(motion.reduced);
  });

  onMount(() => {
    let disposed = false;
    motion.start();

    (async () => {
      if (!hasWebGL()) {
        failed = true;
        loading = false;
        feedback = "Este laboratorio necesita WebGL para dibujar el fluido.";
        return;
      }

      try {
        const scene = new FluidLabScene(host, {
          base,
          accentHex: selectedColor.hex,
          aromaHex: selectedScent.hex,
          heat,
          paused,
          reduced: motion.reduced,
          onTelemetry: (next) => {
            telemetry = next;
          },
        });
        try {
          await scene.init();
        } catch (error) {
          scene.destroy();
          throw error;
        }
        if (disposed) {
          scene.destroy();
          return;
        }

        scene.setBase(base);
        scene.setAccentColor(selectedColor.hex);
        scene.setAromaColor(selectedScent.hex);
        scene.setHeat(heat);
        scene.setPaused(paused);
        scene.setReduced(motion.reduced);
        lab = scene;
        loading = false;
        feedback = "Listo. Arrastra la jarra hacia el centro para verter.";
      } catch (error) {
        console.error("No se pudo iniciar el laboratorio de fluido", error);
        if (!disposed) {
          failed = true;
          loading = false;
          feedback = "El laboratorio no pudo iniciar la escena WebGL.";
        }
      }
    })();

    return () => {
      disposed = true;
      lab?.destroy();
      lab = null;
      motion.stop();
    };
  });

  onDestroy(() => {
    if (feedbackTimer) clearTimeout(feedbackTimer);
  });

  function say(message: string): void {
    feedback = message;
    if (feedbackTimer) clearTimeout(feedbackTimer);
    feedbackTimer = setTimeout(() => {
      feedback = "Listo para seguir probando.";
    }, 2600);
  }

  function updateHeat(next: number): void {
    heat = Math.round(clamp(next, 0, 1) * 100) / 100;
  }

  function chooseBase(next: BaseMaterial): void {
    if (base === next) return;
    base = next;
    heat = 0;
    say(next === "wax" ? "Base de cera." : "Base de gel.");
  }

  function chooseColor(next: ColorOption): void {
    colorId = next.id;
    say(`Color ${next.name.toLowerCase()}.`);
  }

  function chooseScent(next: ScentOption): void {
    scentId = next.id;
    say(`Aroma de ${next.name.toLowerCase()}.`);
  }

  function dropColor(): void {
    if (!canInteract) return;
    lab?.dropColor();
    say(`Gota de color ${selectedColor.name.toLowerCase()}.`);
  }

  function addAroma(): void {
    if (!canInteract) return;
    lab?.startAroma();
    say(`Chorrito de aroma de ${selectedScent.name.toLowerCase()}.`);
  }

  function toggleCalm(): void {
    paused = !paused;
    lab?.setPaused(paused);
    say(paused ? "Fluido en calma." : "Fluido activo.");
  }

  function resetLab(): void {
    heat = 0;
    paused = false;
    lab?.setHeat(0);
    lab?.setPaused(false);
    lab?.reset(base);
    say("Fluido reiniciado. La jarra vuelve a su sitio.");
  }

  function handleCanvasKey(event: KeyboardEvent): void {
    if (!lab || failed) return;
    const step = event.shiftKey ? 46 : 24;

    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault();
        lab.nudgeJar(-step);
        break;
      case "ArrowRight":
        event.preventDefault();
        lab.nudgeJar(step);
        break;
      case "Home":
      case "Escape":
        event.preventDefault();
        lab.restoreJar();
        break;
      case " ":
      case "Enter":
        event.preventDefault();
        lab.togglePourPosition();
        break;
      case "+":
      case "=":
        event.preventDefault();
        updateHeat(heat + (event.shiftKey ? 0.1 : 0.05));
        break;
      case "-":
      case "_":
        event.preventDefault();
        updateHeat(heat - (event.shiftKey ? 0.1 : 0.05));
        break;
      case "c":
      case "C":
        event.preventDefault();
        dropColor();
        break;
      case "a":
      case "A":
        event.preventDefault();
        addAroma();
        break;
      case "r":
      case "R":
        event.preventDefault();
        resetLab();
        break;
    }
  }

  function handlePointerDown(event: PointerEvent): void {
    const target = event.currentTarget as HTMLElement;
    target.focus({ preventScroll: true });
    if (!canInteract || !lab) return;

    event.preventDefault();
    if (target.setPointerCapture) {
      try {
        target.setPointerCapture(event.pointerId);
      } catch {
        // Pointer capture is a best effort on older browsers.
      }
    }
    interacting = true;
    lab.pointerDown(event.clientX, event.clientY);
  }

  function handlePointerMove(event: PointerEvent): void {
    if (!interacting) return;
    lab?.pointerMove(event.clientX, event.clientY);
  }

  function handlePointerUp(event: PointerEvent): void {
    if (!interacting) return;
    interacting = false;
    lab?.pointerUp();
    const target = event.currentTarget as HTMLElement;
    if (target.hasPointerCapture?.(event.pointerId)) {
      target.releasePointerCapture(event.pointerId);
    }
  }

  function handleWindowPointerUp(): void {
    draggingKnob = false;
    if (!interacting) return;
    interacting = false;
    lab?.pointerUp();
  }

  function handleLostPointerCapture(): void {
    if (!interacting) return;
    interacting = false;
    lab?.pointerUp();
  }

  function handleKnobPointerDown(event: PointerEvent): void {
    if (!ready) return;
    event.preventDefault();
    draggingKnob = true;
    knobStartY = event.clientY;
    knobStartValue = heat;
    const target = event.currentTarget as HTMLElement;
    target.focus({ preventScroll: true });
    if (target.setPointerCapture) {
      try {
        target.setPointerCapture(event.pointerId);
      } catch {
        // Pointer capture is a best effort on older browsers.
      }
    }
  }

  function handleKnobPointerMove(event: PointerEvent): void {
    if (!draggingKnob) return;
    updateHeat(knobStartValue + (knobStartY - event.clientY) / 130);
  }

  function handleKnobPointerUp(event: PointerEvent): void {
    if (!draggingKnob) return;
    draggingKnob = false;
    const target = event.currentTarget as HTMLElement;
    if (target.hasPointerCapture?.(event.pointerId)) {
      target.releasePointerCapture(event.pointerId);
    }
  }

  function handleKnobLostCapture(): void {
    draggingKnob = false;
  }

  function handleKnobKey(event: KeyboardEvent): void {
    const step = event.shiftKey ? 0.1 : 0.05;
    switch (event.key) {
      case "ArrowUp":
      case "ArrowRight":
      case "+":
      case "=":
        event.preventDefault();
        updateHeat(heat + step);
        break;
      case "ArrowDown":
      case "ArrowLeft":
      case "-":
      case "_":
        event.preventDefault();
        updateHeat(heat - step);
        break;
      case "PageUp":
        event.preventDefault();
        updateHeat(heat + 0.2);
        break;
      case "PageDown":
        event.preventDefault();
        updateHeat(heat - 0.2);
        break;
      case "Home":
        event.preventDefault();
        updateHeat(0);
        break;
      case "End":
        event.preventDefault();
        updateHeat(1);
        break;
    }
  }
</script>

<svelte:window
  onpointerup={handleWindowPointerUp}
  onpointercancel={handleWindowPointerUp}
/>

<div
  class="fluid-lab"
  class:is-reduced={motion.reduced}
  class:is-paused={paused}
  data-mode={telemetry.mode}
  data-testid="fluid-lab"
>
  <div class="fluid-lab__workspace">
    <div class="fluid-lab__stage">
      <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
      <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
      <div
        class="fluid-lab__canvas"
        class:is-interacting={interacting}
        bind:this={host}
        role="application"
        tabindex={ready ? 0 : -1}
        aria-label="Laboratorio de fluido. Arrastra la jarra hacia el centro para verter, o usa las flechas para moverla y Espacio para inclinarla o enderezarla. Toca el fluido para dejar una gota de color. Usa C para color, A para aroma, más y menos para el calor, y R para reiniciar."
        onpointerdown={handlePointerDown}
        onpointermove={handlePointerMove}
        onpointerup={handlePointerUp}
        onpointercancel={handlePointerUp}
        onlostpointercapture={handleLostPointerCapture}
        onkeydown={handleCanvasKey}
        data-testid="fluid-lab-canvas"
      ></div>

      <p class="fluid-lab__hud" aria-hidden="true">
        <span
          class="fluid-lab__dot"
          class:is-heating={telemetry.mode === "heating"}
          class:is-pouring={telemetry.mode === "pouring"}
          class:is-calm={telemetry.mode === "calm"}
          class:is-full={telemetry.mode === "full"}
          class:is-aroma={telemetry.mode === "aroma"}
        ></span>
        <span class="fluid-lab__hud-status">{telemetry.status}</span>
        <span class="fluid-lab__hud-sep" aria-hidden="true">·</span>
        <span class="fluid-lab__hud-fps">
          FPS {telemetry.fps > 0 ? telemetry.fps : "—"} · SIM
          {telemetry.simRate}/s
        </span>
      </p>

      {#if loading}
        <p class="fluid-lab__loading">Preparando el laboratorio…</p>
      {/if}

      {#if failed}
        <div class="fluid-lab__fallback" role="status">
          <p class="lab-eyebrow">Sin WebGL</p>
          <h2>La escena no pudo iniciar</h2>
          <p>
            Este banco de pruebas necesita WebGL para dibujar el fluido. Revisa
            que tu navegador lo tenga activo y recarga la página.
          </p>
        </div>
      {/if}
    </div>

    <p class="fluid-lab__caption">
      Arrastra la jarra hacia el centro: cuanto más centrada, más caudal cae.
      También puedes tocar el fluido para teñirlo.
    </p>

    <div
      class="fluid-lab__readout"
      role="group"
      aria-label="Lecturas del laboratorio"
    >
      <div class="fluid-lab__reading">
        <span class="fluid-lab__reading-label">Estado</span>
        <strong class="fluid-lab__reading-value">{telemetry.status}</strong>
      </div>
      <div class="fluid-lab__reading">
        <span class="fluid-lab__reading-label">Temperatura</span>
        <strong class="fluid-lab__reading-value">
          {telemetry.temperature} °C
        </strong>
        <span class="fluid-lab__meter" aria-hidden="true">
          <span
            class="fluid-lab__meter-fill is-temperature"
            style={`width: ${temperaturePercent}%`}
          ></span>
        </span>
      </div>
      <div class="fluid-lab__reading">
        <span class="fluid-lab__reading-label">Aroma</span>
        <strong class="fluid-lab__reading-value">{aromaPercent}%</strong>
        <span class="fluid-lab__meter" aria-hidden="true">
          <span
            class="fluid-lab__meter-fill is-aroma"
            style={`width: ${aromaPercent}%`}
          ></span>
        </span>
      </div>
    </div>
  </div>

  <aside class="fluid-lab__panel" aria-label="Controles del laboratorio">
    <section class="lab-section">
      <p class="lab-section__eyebrow">Base</p>
      <fieldset class="lab-fieldset">
        <legend class="visually-hidden">Material base</legend>
        <div class="lab-segment">
          <button
            class="lab-segment__button"
            class:is-selected={base === "wax"}
            type="button"
            aria-pressed={base === "wax"}
            onclick={() => chooseBase("wax")}
          >
            Cera
          </button>
          <button
            class="lab-segment__button"
            class:is-selected={base === "gel"}
            type="button"
            aria-pressed={base === "gel"}
            onclick={() => chooseBase("gel")}
          >
            Gel
          </button>
        </div>
      </fieldset>
    </section>

    <section class="lab-section">
      <p class="lab-section__eyebrow" id="lab-color-label">Color del tinte</p>
      <div class="lab-swatches" role="group" aria-labelledby="lab-color-label">
        {#each COLOR_OPTIONS as option (option.id)}
          <button
            class="lab-swatch"
            class:is-selected={colorId === option.id}
            type="button"
            aria-pressed={colorId === option.id}
            onclick={() => chooseColor(option)}
          >
            <span
              class="lab-swatch__dot"
              style={`--swatch: ${option.hex}`}
              aria-hidden="true"
            ></span>
            <span class="lab-swatch__name">{option.name}</span>
          </button>
        {/each}
      </div>
    </section>

    <section class="lab-section">
      <p class="lab-section__eyebrow" id="lab-scent-label">Aroma</p>
      <div class="lab-chips" role="group" aria-labelledby="lab-scent-label">
        {#each SCENT_OPTIONS as option (option.id)}
          <button
            class="lab-chip"
            class:is-selected={scentId === option.id}
            type="button"
            aria-pressed={scentId === option.id}
            onclick={() => chooseScent(option)}
          >
            {option.name}
          </button>
        {/each}
      </div>
    </section>

    <section class="lab-section lab-section--heat">
      <div class="lab-knob">
        <div
          class="lab-knob__dial"
          class:is-dragging={draggingKnob}
          role="slider"
          tabindex={ready ? 0 : -1}
          aria-labelledby="lab-heat-label"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={heatPercent}
          aria-orientation="vertical"
          aria-valuetext={`${heatPercent} por ciento, objetivo ${heatTarget} grados`}
          aria-disabled={!ready}
          style={`--turn: ${-120 + heat * 240}deg`}
          onpointerdown={handleKnobPointerDown}
          onpointermove={handleKnobPointerMove}
          onpointerup={handleKnobPointerUp}
          onpointercancel={handleKnobPointerUp}
          onlostpointercapture={handleKnobLostCapture}
          onkeydown={handleKnobKey}
          data-testid="fluid-lab-heat"
        >
          <span class="lab-knob__needle" aria-hidden="true"></span>
          <span class="lab-knob__cap" aria-hidden="true"></span>
        </div>
        <div class="lab-knob__copy">
          <p class="lab-section__eyebrow" id="lab-heat-label">
            Calor del fogón
          </p>
          <p class="lab-knob__value">{heatPercent}%</p>
          <p class="lab-knob__target">Objetivo ≈ {heatTarget} °C</p>
        </div>
      </div>
      <p class="lab-knob__hint">
        Arrastra la perilla o usa <kbd>+</kbd> / <kbd>−</kbd>. No hay que
        mantener ninguna palanca.
      </p>
    </section>

    <div class="lab-actions">
      <button
        class="lab-action lab-action--primary"
        type="button"
        disabled={!canInteract}
        onclick={dropColor}
      >
        <span
          class="lab-action__dot"
          style={`--swatch: ${selectedColor.hex}`}
          aria-hidden="true"
        ></span>
        Dejar una gota
      </button>
      <button
        class="lab-action lab-action--secondary"
        type="button"
        disabled={!canInteract}
        onclick={addAroma}
      >
        <span class="lab-action__wave" aria-hidden="true">≈</span>
        Chorrito de aroma
      </button>
    </div>

    <div class="lab-actions lab-actions--quiet">
      <button
        class="lab-action lab-action--quiet"
        type="button"
        disabled={!ready}
        onclick={resetLab}
      >
        Reiniciar
      </button>
      <button
        class="lab-action lab-action--quiet"
        type="button"
        aria-pressed={paused}
        disabled={!ready}
        onclick={toggleCalm}
      >
        {paused ? "Reanudar" : "Calma"}
      </button>
    </div>

    <p class="lab-feedback" role="status" aria-live="polite">{feedback}</p>

    <div class="lab-keys">
      <p class="lab-section__eyebrow">Teclado</p>
      <p>
        <kbd>←</kbd> <kbd>→</kbd> mueven la jarra · <kbd>Espacio</kbd> inclina o
        endereza · <kbd>Inicio</kbd> la endereza · <kbd>C</kbd> color ·
        <kbd>A</kbd> aroma · <kbd>R</kbd> reinicia.
      </p>
    </div>
  </aside>
</div>
