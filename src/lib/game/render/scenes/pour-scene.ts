import { Container, Graphics, Text } from "pixi.js";
import { pourFills } from "../../craft";
import type { GameState } from "../../game-state.svelte";
import { createLiquidState, stepLiquid, type LiquidState } from "../../liquid";
import { CandleRig } from "../candle-rig";
import { clamp, hexColor, stageColors } from "../palette";
import type { StageScene } from "../scene";

const JAR_X = 500;
const JAR_Y = 380;
const JAR_MOUTH_Y = JAR_Y - 138;

export class PourScene implements StageScene {
  view = new Container();
  private background = new Graphics();
  private target = new Graphics();
  private candle = new CandleRig();
  private pitcher = new Container();
  private pitcherBody = new Graphics();
  private stream = new Graphics();
  private splashes = new Graphics();
  private spill = new Graphics();
  private label = new Text({
    text: "",
    style: {
      fontFamily: "Manrope Variable, sans-serif",
      fontSize: 15,
      fontWeight: "800",
      fill: stageColors.muted,
      letterSpacing: 1.2,
    },
  });
  private liquid: LiquidState = createLiquidState(23);
  private dragging = false;
  private time = 0;
  private reducedMotion = false;

  constructor() {
    this.background
      .roundRect(150, 54, 700, 510, 30)
      .fill({ color: stageColors.paper, alpha: 0.85 })
      .stroke({ width: 2, color: stageColors.border })
      .roundRect(190, 470, 620, 40, 18)
      .fill({ color: stageColors.wood, alpha: 0.26 });

    this.candle.position.set(JAR_X, JAR_Y);
    this.candle.scale.set(1);

    this.drawPitcher();

    this.label.anchor.set(0.5);
    this.label.position.set(JAR_X, 552);

    this.view.addChild(
      this.background,
      this.target,
      this.candle,
      this.pitcher,
      this.stream,
      this.splashes,
      this.spill,
      this.label,
    );

    this.reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  private drawPitcher(): void {
    this.pitcherBody
      .moveTo(0, 0)
      .lineTo(28, 14)
      .lineTo(24, 30)
      .lineTo(6, 22)
      .fill(hexColor("#fbf3e9"))
      .stroke({ width: 4, color: hexColor("#a98769") })
      .roundRect(4, 20, 124, 168, 28)
      .fill(hexColor("#fbf3e9"))
      .stroke({ width: 4, color: hexColor("#a98769") })
      .moveTo(128, 54)
      .bezierCurveTo(162, 48, 176, 68, 170, 94)
      .bezierCurveTo(164, 118, 142, 126, 124, 118)
      .stroke({ width: 10, color: hexColor("#a98769"), cap: "round" })
      .roundRect(30, 8, 84, 20, 8)
      .fill(hexColor("#f3ddd2"))
      .stroke({ width: 3, color: hexColor("#a98769") })
      .roundRect(44, 0, 56, 12, 6)
      .fill(hexColor("#e4d8ca"))
      .stroke({ width: 2, color: hexColor("#a98769") });
    this.pitcher.addChild(this.pitcherBody);
  }

  update(game: GameState, delta: number): void {
    this.time += delta;
    const unit = game.unit;
    const offset = game.craft.pourOffset;

    stepLiquid(this.liquid, delta, {
      pouring: game.craft.pouring,
      offset,
      heat: clamp(
        (game.craft.temperature - game.meltMin) /
          Math.max(1, game.meltMax - game.meltMin),
        0,
        1,
      ),
      fill: (unit?.fill ?? 0) / 100,
      gel: game.design.mode === "gel",
      reducedMotion: this.reducedMotion,
    });

    this.candle.update(game, {
      fills: pourFills(game.craft),
      showWick: false,
      showLabel: false,
      liquid: this.liquid,
      showBubbles: false,
      time: this.time,
    });

    const pitcherX = JAR_X + offset * 250;
    const tilt = game.craft.pouring ? -0.42 : -0.12;
    this.pitcher.position.set(pitcherX, 92);
    this.pitcher.rotation = tilt;

    this.label.text = game.craft.waitingFilm
      ? "Deja que cuaje la capa"
      : game.pourComplete
        ? "Vertido completo · sigue a la mecha"
        : `${unit?.label ?? "Vertido"} · ${Math.round(unit?.fill ?? 100)}%`;
    this.label.style.fill = game.pourComplete
      ? stageColors.sage
      : stageColors.muted;

    this.drawTarget(unit?.target ?? 88);
    this.drawStream(game, pitcherX, unit?.colorHex ?? "#e9c9a8");
    this.drawSplashes();
    this.drawSpill(game.craft.spill);
  }

  private drawTarget(target: number): void {
    this.target.clear();
    const y = JAR_Y - 150 + 300 * (1 - target / 100);
    for (let x = 420; x < 580; x += 18) {
      this.target
        .moveTo(x, y)
        .lineTo(x + 9, y)
        .stroke({ width: 2, color: stageColors.accent, alpha: 0.45 });
    }
  }

  private drawStream(game: GameState, pitcherX: number, color: string): void {
    this.stream.clear();
    if (!game.craft.pouring) return;

    const startX = pitcherX - 4;
    const startY = 122;
    const aligned = Math.abs(game.craft.pourOffset) <= 0.32;
    const endX = aligned ? JAR_X + game.craft.pourOffset * 60 : pitcherX - 30;
    const endY = aligned ? JAR_MOUTH_Y + 18 : 560;
    const wobble = this.reducedMotion ? 0 : Math.sin(this.time * 10) * 7;

    this.stream
      .moveTo(startX, startY)
      .bezierCurveTo(
        startX - 40,
        startY + 90,
        endX + wobble,
        endY - 90,
        endX,
        endY,
      )
      .stroke({
        width: aligned ? 10 : 8,
        color: hexColor(color),
        alpha: 0.9,
        cap: "round",
      });

    if (aligned) {
      this.stream
        .ellipse(endX, endY, 24, 7)
        .fill({ color: hexColor(color), alpha: 0.35 });
    }
  }

  private drawSplashes(): void {
    this.splashes.clear();
    for (const particle of this.liquid.particles) {
      this.splashes
        .circle(
          JAR_X + particle.x * 60 - 30,
          JAR_MOUTH_Y + particle.y * 60,
          particle.size,
        )
        .fill({
          color: stageColors.white,
          alpha: Math.min(0.8, particle.life),
        });
    }
  }

  private drawSpill(amount: number): void {
    this.spill.clear();
    if (amount <= 0.01) return;
    this.spill
      .ellipse(700, 566, 40 + amount * 70, 8 + amount * 12)
      .fill({ color: stageColors.amber, alpha: 0.22 + amount * 0.2 });
  }

  pointerDown(x: number, y: number, game: GameState): void {
    const pitcherX = JAR_X + game.craft.pourOffset * 250;
    if (x > pitcherX - 30 && x < pitcherX + 160 && y > 70 && y < 300) {
      this.dragging = true;
    }
  }

  pointerMove(x: number, _y: number, game: GameState): void {
    if (!this.dragging) return;
    const offset = clamp((x - JAR_X) / 250, -1, 1);
    game.setPourOffset(offset);
    const unit = game.unit;
    if (!game.craft.pouring && Math.abs(offset) <= 0.32 && unit && !unit.done) {
      game.startPour();
    }
  }

  pointerUp(_x: number, _y: number, game: GameState): void {
    if (!this.dragging) return;
    this.dragging = false;
    game.releasePour();
  }

  keyDown(key: string, game: GameState): void {
    if (key === "ArrowLeft") {
      game.setPourOffset(game.craft.pourOffset - 0.12);
    } else if (key === "ArrowRight") {
      game.setPourOffset(game.craft.pourOffset + 0.12);
    } else if (key === " ") {
      if (game.craft.pouring) {
        game.releasePour();
      } else if (Math.abs(game.craft.pourOffset) <= 0.32) {
        game.startPour();
      }
    }
  }

  ariaLabel(game: GameState): string {
    return `Vertido. ${game.unit?.label ?? "Capa"}. Arrastra la jarra sobre la boca del frasco con el puntero o las flechas; suelta para terminar la capa.`;
  }

  destroy(): void {
    this.view.destroy({ children: true });
  }
}
