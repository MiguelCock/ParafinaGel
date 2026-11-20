import { Container, Graphics, Text } from "pixi.js";
import type { GameState } from "../../game-state.svelte";
import { createLiquidState, stepLiquid } from "../../liquid";
import { CandleRig } from "../candle-rig";
import { motion } from "../motion";
import { stageColors } from "../palette";
import type { StageScene } from "../scene";

const JAR_X = 430;
const JAR_Y = 370;
const FAN_X = 760;
const FAN_Y = 390;

export class CoolScene implements StageScene {
  view = new Container();
  private board = new Graphics();
  private rack = new Graphics();
  private candle = new CandleRig();
  private fan = new Container();
  private fanBase = new Graphics();
  private fanBlades = new Graphics();
  private steam = new Graphics();
  private timer = new Text({
    text: "",
    style: {
      fontFamily: "Fraunces Variable, Georgia, serif",
      fontSize: 28,
      fontWeight: "600",
      fill: stageColors.ink,
    },
  });
  private help = new Text({
    text: "Toca el ventilador para abanicar",
    style: {
      fontFamily: "Manrope Variable, sans-serif",
      fontSize: 14,
      fill: stageColors.muted,
    },
  });
  private liquid = createLiquidState(41);
  private time = 0;

  constructor() {
    this.board
      .roundRect(140, 54, 720, 514, 30)
      .fill({ color: stageColors.paper, alpha: 0.86 })
      .stroke({ width: 2, color: stageColors.border });

    this.candle.position.set(JAR_X, JAR_Y);
    this.candle.scale.set(0.95);

    this.fanBase
      .circle(0, 0, 82)
      .fill(stageColors.paper)
      .stroke({ width: 5, color: stageColors.steel })
      .circle(0, 0, 74)
      .stroke({ width: 2, color: stageColors.steel, alpha: 0.5 })
      .roundRect(-14, 80, 28, 90, 12)
      .fill(stageColors.steel)
      .roundRect(-46, 166, 92, 16, 8)
      .fill(stageColors.steelDark);
    this.fanBlades
      .ellipse(0, -34, 20, 40)
      .fill({ color: stageColors.accent, alpha: 0.9 })
      .ellipse(29, 17, 20, 40)
      .fill({ color: stageColors.accent, alpha: 0.9 })
      .ellipse(-29, 17, 20, 40)
      .fill({ color: stageColors.accent, alpha: 0.9 })
      .circle(0, 0, 12)
      .fill(stageColors.woodDark);
    this.fan.addChild(this.fanBase, this.fanBlades);
    this.fan.position.set(FAN_X, FAN_Y);

    this.timer.anchor.set(0.5);
    this.timer.position.set(JAR_X, 580);
    this.help.anchor.set(0.5);
    this.help.position.set(500, 612);

    this.view.addChild(
      this.board,
      this.rack,
      this.candle,
      this.steam,
      this.fan,
      this.timer,
      this.help,
    );
  }

  update(game: GameState, delta: number): void {
    if (!motion.paused) this.time += delta;
    if (!motion.paused) {
      stepLiquid(this.liquid, delta, {
        pouring: false,
        offset: 0,
        heat: 0,
        fill: 1,
        gel: game.design.mode === "gel",
        reducedMotion: motion.reduced,
      });
    }

    this.candle.update(game, {
      showWick: true,
      showLabel: false,
      showBubbles: game.design.mode === "gel",
      liquid: this.liquid,
      time: this.time,
    });

    this.fanBlades.rotation +=
      motion.reduced || motion.paused
        ? 0
        : (game.craft.cooled ? 0.02 : 0.22) * delta * 6;

    this.timer.text = game.craft.cooled
      ? "Vela lista"
      : `${game.craft.coolingRemaining.toFixed(1)} s`;
    this.timer.style.fill = game.craft.cooled
      ? stageColors.sage
      : stageColors.ink;
    this.help.text =
      game.design.mode === "gel"
        ? "Toca el ventilador · pulsa B para quitar burbujas"
        : "Toca el ventilador para abanicar";

    this.rack.clear();
    this.rack
      .roundRect(250, 310, 380, 20, 8)
      .fill(stageColors.wood)
      .roundRect(270, 492, 340, 18, 8)
      .fill({ color: stageColors.wood, alpha: 0.55 });
    this.rack
      .moveTo(280, 330)
      .lineTo(280, 520)
      .moveTo(600, 330)
      .lineTo(600, 520)
      .stroke({ width: 10, color: stageColors.woodDark, alpha: 0.5 });

    this.steam.clear();
    if (!game.craft.cooled) {
      for (let i = 0; i < 3; i += 1) {
        const phase = motion.reduced ? 0.4 : (this.time * 0.4 + i * 0.3) % 1;
        this.steam
          .circle(
            JAR_X - 30 + i * 30 + Math.sin(this.time + i) * 6,
            JAR_Y - 170 - phase * 80,
            7 + phase * 10,
          )
          .fill({ color: stageColors.white, alpha: 0.2 * (1 - phase) });
      }
    }
  }

  pointerDown(x: number, y: number, game: GameState): void {
    if (Math.hypot(x - FAN_X, y - FAN_Y) < 95) {
      game.fan();
      return;
    }

    if (
      game.design.mode === "gel" &&
      game.craft.gelPopped < game.craft.gelBubbles &&
      x > JAR_X - 110 &&
      x < JAR_X + 110 &&
      y > JAR_Y - 160 &&
      y < JAR_Y + 160
    ) {
      game.popBubble();
    }
  }

  keyDown(key: string, game: GameState): void {
    if (key === " ") game.fan();
    if (key.toLowerCase() === "b") game.popBubble();
  }

  ariaLabel(): string {
    return "Curado. Toca el ventilador para abanicar. En gel, toca las burbujas dentro de la vela o pulsa B.";
  }

  destroy(): void {
    this.view.destroy({ children: true });
  }
}
