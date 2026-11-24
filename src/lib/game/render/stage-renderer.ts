import { Application, Container } from "pixi.js";
import type { GameState } from "../game-state.svelte";
import type { StationId } from "../types";
import { motion, tweens } from "./motion";
import type { StageScene } from "./scene";
import { DesignScene } from "./scenes/design-scene";
import { MeltScene } from "./scenes/melt-scene";
import { MixScene } from "./scenes/mix-scene";
import { PourScene } from "./scenes/pour-scene";
import { WickScene } from "./scenes/wick-scene";
import { CoolScene } from "./scenes/cool-scene";
import { FinishScene } from "./scenes/finish-scene";

export const STAGE_WIDTH = 1000;
export const STAGE_HEIGHT = 640;

export function webglAvailable(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl"),
    );
  } catch {
    return false;
  }
}

export class StageRenderer {
  private app: Application | null = null;
  private root = new Container();
  private scene: StageScene | null = null;
  private sceneId: StationId | null = null;
  private game: GameState;
  private host: HTMLElement;
  private resizeObserver: ResizeObserver | null = null;
  private detachInput: (() => void) | null = null;
  private pointerActive = false;

  constructor(host: HTMLElement, game: GameState, scene: StationId) {
    this.host = host;
    this.game = game;
    this.sceneId = scene;
  }

  async init(): Promise<void> {
    const app = new Application();
    await app.init({
      backgroundAlpha: 0,
      antialias: true,
      autoDensity: true,
      resolution: Math.min(
        typeof window === "undefined" ? 1 : window.devicePixelRatio || 1,
        2,
      ),
      resizeTo: this.host,
      preference: "webgl",
    });

    this.app = app;
    this.host.appendChild(app.canvas);
    app.canvas.style.display = "block";
    app.canvas.style.width = "100%";
    app.canvas.style.height = "100%";
    app.canvas.style.touchAction = "none";
    app.canvas.style.outline = "none";

    app.stage.addChild(this.root);
    this.layout();
    this.attachInput();

    this.resizeObserver = new ResizeObserver(() => this.layout());
    this.resizeObserver.observe(this.host);

    app.ticker.add(this.tick);
    this.setScene(this.sceneId ?? "design");
  }

  setScene(sceneId: StationId): void {
    if (!this.app || (this.sceneId === sceneId && this.scene)) return;
    this.sceneId = sceneId;
    tweens.clear();
    this.scene?.destroy();
    this.scene = this.createScene(sceneId);
    this.root.removeChildren();
    this.root.addChild(this.scene.view);
  }

  get ariaLabel(): string {
    return this.scene?.ariaLabel(this.game) ?? "Taller ilustrado";
  }

  handleKeyDown(event: KeyboardEvent): boolean {
    if (!this.scene?.keyDown) return false;
    this.scene.keyDown(event.key, this.game, event.shiftKey);
    return true;
  }

  handleKeyUp(event: KeyboardEvent): boolean {
    if (!this.scene?.keyUp) return false;
    this.scene.keyUp(event.key, this.game);
    return true;
  }

  destroy(): void {
    this.detachInput?.();
    this.resizeObserver?.disconnect();
    tweens.clear();
    if (this.app) {
      this.app.ticker.remove(this.tick);
      this.app.destroy(true, { children: true });
      this.app = null;
    }
  }

  private createScene(sceneId: StationId): StageScene {
    switch (sceneId) {
      case "melt":
        return new MeltScene();
      case "mix":
        return new MixScene();
      case "pour":
        return new PourScene();
      case "wick":
        return new WickScene();
      case "cool":
        return new CoolScene();
      case "finish":
        return new FinishScene();
      case "design":
      default:
        return new DesignScene();
    }
  }

  private tick = (): void => {
    if (!this.app) return;
    const delta = Math.min(0.05, this.app.ticker.deltaMS / 1000);
    if (motion.reduced) {
      tweens.completeAll();
    } else if (!motion.paused) {
      tweens.update(delta);
    }
    this.scene?.update(this.game, delta);
  };

  private layout(): void {
    if (!this.app) return;
    const width = this.app.screen.width;
    const height = this.app.screen.height;
    const scale = Math.min(width / STAGE_WIDTH, height / STAGE_HEIGHT);
    this.root.scale.set(scale);
    this.root.position.set(
      (width - STAGE_WIDTH * scale) / 2,
      (height - STAGE_HEIGHT * scale) / 2,
    );
  }

  private attachInput(): void {
    if (!this.app) return;
    const canvas = this.app.canvas;

    const pointer = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x:
          (event.clientX - rect.left - this.root.position.x) /
          this.root.scale.x,
        y:
          (event.clientY - rect.top - this.root.position.y) / this.root.scale.y,
      };
    };

    const onDown = (event: PointerEvent) => {
      const { x, y } = pointer(event);
      this.pointerActive = true;
      this.scene?.pointerDown?.(x, y, this.game);
      canvas.setPointerCapture?.(event.pointerId);
      event.preventDefault();
    };
    const onMove = (event: PointerEvent) => {
      if (!this.pointerActive) return;
      const { x, y } = pointer(event);
      this.scene?.pointerMove?.(x, y, this.game);
    };
    const onUp = (event: PointerEvent) => {
      const { x, y } = pointer(event);
      this.pointerActive = false;
      this.scene?.pointerUp?.(x, y, this.game);
      canvas.releasePointerCapture?.(event.pointerId);
    };

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);

    this.detachInput = () => {
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
    };
  }
}
