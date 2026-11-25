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
  private holderCue = new Graphics();
  private fanGlow = new Graphics();
  private fan = new Container();
  private fanBase = new Graphics();
  private fanBlades = new Graphics();
  private wind = new Graphics();
  private timerRing = new Graphics();
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
  private fanBoost = 0;
  private lastCooling = 0;

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
    this.timer.position.set(JAR_X, 592);
    this.help.anchor.set(0.5);
    this.help.position.set(500, 622);

    this.view.addChild(
      this.board,
      this.rack,
      this.candle,
      this.holderCue,
      this.steam,
      this.fanGlow,
      this.fan,
      this.wind,
      this.timerRing,
      this.timer,
      this.help,
    );
  }

  update(game: GameState, delta: number): void {
    if (!motion.paused) this.time += delta;
    if (!motion.paused) {
      const drop = this.lastCooling - game.craft.coolingRemaining;
      if (drop > 0.05) this.fanBoost = 1;
      this.fanBoost = Math.max(0, this.fanBoost - delta * 2.2);
    }
    this.lastCooling = game.craft.coolingRemaining;

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
        : (game.craft.cooled ? 0.02 : 0.12 + this.fanBoost * 0.45) * delta * 6;

    this.drawFanCue(game);
    this.drawTimerRing(game);

    this.timer.text = game.craft.cooled
      ? "Vela lista"
      : `${game.craft.coolingRemaining.toFixed(1)} s`;
    this.timer.style.fill = game.craft.cooled
      ? stageColors.sage
      : stageColors.ink;
    this.help.text = game.craft.cooled
      ? game.craft.holder
        ? "Vela firme · retira el sostenedor con clic o H"
        : "Vela lista · pasa al acabado"
      : game.design.mode === "gel"
        ? "Toca el ventilador · pulsa B para quitar burbujas"
        : "Toca el ventilador para abanicar";

    this.holderCue.clear();
    if (game.craft.cooled && game.craft.holder) {
      const pulse = motion.reduced
        ? 0.5
        : 0.38 + Math.sin(this.time * 3) * 0.12;
      this.holderCue.roundRect(JAR_X - 138, JAR_Y - 225, 276, 92, 14).stroke({
        width: 2,
        color: stageColors.sage,
        alpha: pulse,
      });
    }

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

  private drawFanCue(game: GameState): void {
    this.fanGlow.clear();
    this.wind.clear();
    if (motion.reduced || this.fanBoost <= 0.01) return;

    const glow = 0.1 + this.fanBoost * 0.35;
    this.fanGlow
      .circle(FAN_X, FAN_Y, 92)
      .stroke({ width: 6, color: stageColors.sage, alpha: glow });

    for (let index = 0; index < 3; index += 1) {
      const y = 350 + index * 28 + Math.sin(this.time * 6 + index) * 4;
      this.wind
        .moveTo(686, y)
        .bezierCurveTo(620, y - 12, 540, y + 10, 470, y - 3)
        .stroke({
          width: 2,
          color: stageColors.white,
          alpha: this.fanBoost * 0.38,
          cap: "round",
        });
    }

    if (game.craft.cooled) {
      this.fanGlow.circle(FAN_X, FAN_Y, 102).stroke({
        width: 2,
        color: stageColors.sage,
        alpha: this.fanBoost * 0.25,
      });
    }
  }

  private drawTimerRing(game: GameState): void {
    const progress = Math.min(1, Math.max(0, game.coolingProgress / 100));
    const cx = JAR_X;
    const cy = 548;
    const radius = 20;

    this.timerRing.clear();
    this.timerRing
      .circle(cx, cy, radius)
      .stroke({ width: 4, color: stageColors.border, alpha: 0.65 });

    if (progress > 0) {
      this.timerRing
        .moveTo(cx, cy - radius)
        .arc(
          cx,
          cy,
          radius,
          -Math.PI / 2,
          -Math.PI / 2 + progress * Math.PI * 2,
        )
        .stroke({
          width: 4,
          color: game.craft.cooled ? stageColors.sage : stageColors.accent,
          alpha: 0.9,
          cap: "round",
        });
    }

    if (game.craft.cooled) {
      const pulse = motion.reduced ? 1 : 1 + Math.sin(this.time * 3) * 0.08;
      this.timerRing.circle(cx, cy, radius + 5 * pulse).stroke({
        width: 2,
        color: stageColors.sage,
        alpha: motion.reduced ? 0.4 : 0.35,
      });
    }
  }

  pointerDown(x: number, y: number, game: GameState): void {
    if (
      game.craft.cooled &&
      game.craft.holder &&
      x > JAR_X - 150 &&
      x < JAR_X + 150 &&
      y > JAR_Y - 235 &&
      y < JAR_Y - 130
    ) {
      game.removeHolder();
      return;
    }

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
    if (key.toLowerCase() === "h") game.removeHolder();
  }

  ariaLabel(game: GameState): string {
    if (game.craft.cooled && game.craft.holder) {
      return "Curado. La vela está firme. Retira el sostenedor tocándolo sobre el frasco o pulsando H.";
    }
    return "Curado. Toca el ventilador para abanicar. En gel, toca las burbujas dentro de la vela o pulsa B.";
  }

  destroy(): void {
    this.view.destroy({ children: true });
  }
}
