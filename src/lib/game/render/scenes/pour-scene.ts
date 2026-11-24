import { Container, Graphics, Text } from "pixi.js";
import { pourFills } from "../../craft";
import type { GameState } from "../../game-state.svelte";
import { createLiquidState, stepLiquid, type LiquidState } from "../../liquid";
import { CandleRig } from "../candle-rig";
import { drawLiquidParticles } from "../liquid-rig";
import { motion } from "../motion";
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
  private targetText = new Text({
    text: "",
    style: {
      fontFamily: "Manrope Variable, sans-serif",
      fontSize: 11,
      fontWeight: "800",
      fill: stageColors.muted,
      letterSpacing: 0.8,
    },
  });
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

    this.targetText.anchor.set(1, 1);
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
      this.targetText,
      this.label,
    );
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
    if (!motion.paused) this.time += delta;
    const unit = game.unit;
    const offset = game.craft.pourOffset;

    if (!motion.paused) {
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
        reducedMotion: motion.reduced,
      });
    }

    this.candle.update(game, {
      fills: pourFills(game.craft),
      showWick: game.craft.wick.placed,
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

    const color = unit?.colorHex ?? "#e9c9a8";
    const aligned = Math.abs(offset) <= 0.32;
    const impact = this.drawStream(game, pitcherX, color);
    this.drawTarget(unit?.target ?? 88, unit?.fill ?? 0, aligned);
    this.drawSplashes(impact.x, impact.y, color);
    this.drawSpill(game.craft.spill, color);
  }

  private drawTarget(target: number, fill: number, aligned: boolean): void {
    this.target.clear();

    const y = JAR_Y - 150 + 300 * (1 - target / 100);
    const inZone = aligned && fill >= target - 8 && fill <= target + 7;
    const pulse = motion.reduced ? 1 : 1 + Math.sin(this.time * 4.2) * 0.12;
    const color = inZone ? stageColors.sage : stageColors.accent;

    this.target
      .roundRect(414 - (pulse - 1) * 12, y - 2, 172 + (pulse - 1) * 24, 5)
      .fill({ color, alpha: inZone ? 0.12 : 0.06 });

    for (let x = 420; x < 580; x += 18) {
      this.target
        .moveTo(x, y)
        .lineTo(x + 9, y)
        .stroke({ width: 2, color, alpha: inZone ? 0.85 : 0.5 });
    }

    this.target
      .moveTo(414, y - 8)
      .lineTo(420, y)
      .lineTo(414, y + 8)
      .moveTo(586, y - 8)
      .lineTo(580, y)
      .lineTo(586, y + 8)
      .stroke({ width: 2, color, alpha: 0.7 });

    this.targetText.text = inZone ? "META" : `META ${Math.round(target)}%`;
    this.targetText.position.set(386, y - 7);
    this.targetText.style.fill = inZone ? stageColors.sage : stageColors.ink;
  }

  private drawStream(
    game: GameState,
    pitcherX: number,
    color: string,
  ): { x: number; y: number } {
    this.stream.clear();
    const aligned = Math.abs(game.craft.pourOffset) <= 0.32;
    const endX = aligned ? JAR_X + game.craft.pourOffset * 60 : pitcherX - 30;
    const endY = aligned ? JAR_MOUTH_Y + 18 : 560;
    if (!game.craft.pouring) return { x: endX, y: endY };

    const startX = pitcherX - 4;
    const startY = 122;
    const wobble = motion.reduced ? 0 : Math.sin(this.time * 10) * 7;
    const flow = motion.reduced ? 1 : 0.7 + Math.sin(this.time * 8.5) * 0.3;
    const width = aligned ? 9 + flow * 5 : 8;

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
        width: width + 3,
        color: hexColor("#6f5541"),
        alpha: 0.16,
        cap: "round",
      })
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
        width,
        color: hexColor(color),
        alpha: 0.95,
        cap: "round",
      })
      .moveTo(startX + 2, startY + 8)
      .bezierCurveTo(
        startX - 34,
        startY + 96,
        endX + wobble + 2,
        endY - 82,
        endX + 2,
        endY - 4,
      )
      .stroke({
        width: Math.max(2, width * 0.28),
        color: stageColors.white,
        alpha: 0.28,
        cap: "round",
      });

    if (aligned) {
      this.stream
        .ellipse(endX, endY, 24, 7)
        .fill({ color: hexColor(color), alpha: 0.35 })
        .ellipse(endX, endY - 1, 13, 3)
        .fill({ color: stageColors.white, alpha: 0.22 });

      if (!motion.reduced) {
        for (let index = 0; index < 4; index += 1) {
          const t = 0.2 + index * 0.2;
          const x = startX + (endX - startX) * t + Math.sin(t * 12) * 10;
          const y = startY + (endY - startY) * t;
          this.stream
            .circle(x, y, 2.4 + (index % 2))
            .fill({ color: hexColor(color), alpha: 0.55 });
        }
      }

      for (let index = 0; index < 3; index += 1) {
        const spread = (index - 1) * 13;
        this.stream
          .ellipse(endX + spread, endY - 4, 5, 2.2)
          .fill({ color: stageColors.white, alpha: 0.32 });
      }
    }

    return { x: endX, y: endY };
  }

  private drawSplashes(x: number, y: number, color: string): void {
    this.splashes.clear();
    if (this.liquid.particles.length === 0) return;
    drawLiquidParticles(
      this.splashes,
      this.liquid.particles,
      x - 30,
      y - 6,
      color,
      {
        scaleX: 60,
        scaleY: 52,
        reduced: motion.reduced,
      },
    );
  }

  private drawSpill(amount: number, color: string): void {
    this.spill.clear();
    if (amount <= 0.01) return;

    const base = 34 + amount * 120;
    const sheen = motion.reduced ? 0.5 : 0.5 + Math.sin(this.time * 2.5) * 0.15;
    this.spill
      .ellipse(700, 548, base, 11 + amount * 16)
      .fill({ color: hexColor(color), alpha: 0.3 + amount * 0.3 })
      .stroke({
        width: 2,
        color: hexColor("#6f5541"),
        alpha: 0.14 + amount * 0.12,
      })
      .ellipse(700 - base * 0.45, 544, base * 0.3, 7)
      .fill({ color: hexColor(color), alpha: 0.26 + amount * 0.2 })
      .ellipse(700 + base * 0.5, 552, base * 0.24, 5)
      .fill({ color: hexColor(color), alpha: 0.24 + amount * 0.2 })
      .ellipse(700, 548, base * 0.62, 4)
      .fill({ color: stageColors.white, alpha: 0.18 * sheen });

    for (let index = 0; index < 4; index += 1) {
      const angle = (index / 4) * Math.PI * 2;
      this.spill
        .circle(
          700 + Math.cos(angle) * (base * 0.75),
          548 + Math.sin(angle) * (8 + amount * 6),
          2.4,
        )
        .fill({ color: hexColor(color), alpha: 0.5 });
    }
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
