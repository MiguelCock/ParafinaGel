import { Container, Graphics, Text } from "pixi.js";
import {
  inclusionsById,
  labelsById,
  moldsById,
  vesselMaterialStroke,
  vesselsById,
  waxColorsById,
  waxesById,
} from "../data";
import type { GameState } from "../game-state.svelte";
import type { LiquidState } from "../liquid";
import type { Mold } from "../types";
import { drawLiquidSurface } from "./liquid-rig";
import { motion } from "./motion";
import { clamp, hexColor, mixHex, stageColors } from "./palette";

const JAR_W = 220;
const JAR_H = 320;
const INNER_X = -102;
const INNER_Y = -150;
const INNER_W = 204;
const INNER_H = 300;

export interface CandleRigOptions {
  fills?: Record<string, number>;
  showWick?: boolean;
  showLabel?: boolean;
  showFlame?: boolean;
  trimMm?: number;
  liquid?: LiquidState | null;
  showBubbles?: boolean;
  time?: number;
}

export class CandleRig extends Container {
  private jar = new Graphics();
  private layerGraphics = new Graphics();
  private maskGraphics = new Graphics();
  private surfaceGraphics = new Graphics();
  private overlay = new Graphics();
  private holderGraphics = new Graphics();
  private labelGroup = new Container();
  private labelGraphics = new Graphics();
  private labelText = new Text({
    text: "",
    style: {
      fontFamily: "Fraunces Variable, Georgia, serif",
      fontSize: 15,
      fontWeight: "600",
      fill: stageColors.ink,
    },
  });
  private wick = new Graphics();
  private flame = new Graphics();
  private mold = new Graphics();
  private inclusionsGraphics = new Graphics();
  private bubblesGraphics = new Graphics();

  constructor() {
    super();
    this.addChild(
      this.mold,
      this.jar,
      this.maskGraphics,
      this.layerGraphics,
      this.surfaceGraphics,
      this.inclusionsGraphics,
      this.overlay,
      this.holderGraphics,
      this.bubblesGraphics,
      this.wick,
      this.flame,
      this.labelGroup,
    );

    this.maskGraphics
      .roundRect(INNER_X, INNER_Y, INNER_W, INNER_H, 26)
      .fill(0xffffff);
    this.layerGraphics.mask = this.maskGraphics;
    this.inclusionsGraphics.mask = this.maskGraphics;
    this.bubblesGraphics.mask = this.maskGraphics;

    this.labelText.anchor.set(0.5);
    this.labelText.position.set(0, 2);
    this.labelGroup.addChild(this.labelGraphics, this.labelText);
  }

  update(game: GameState, options: CandleRigOptions = {}): void {
    const design = game.design;
    const fills = options.fills ?? {};
    const showLabel = options.showLabel ?? false;
    const showWick = options.showWick ?? true;
    const time = options.time ?? 0;
    const figure = design.mode === "figura";
    const mold = design.moldId ? moldsById[design.moldId] : null;

    this.mold.visible = figure;
    this.jar.visible = !figure;
    this.overlay.visible = !figure;
    this.layerGraphics.visible = !figure;
    this.inclusionsGraphics.visible = !figure;
    this.bubblesGraphics.visible = !figure;

    this.jar.clear();
    this.overlay.clear();
    this.surfaceGraphics.clear();
    this.holderGraphics.clear();
    this.wick.clear();
    this.flame.clear();
    this.bubblesGraphics.clear();
    this.inclusionsGraphics.clear();
    this.mold.clear();

    if (figure && mold) {
      this.drawMold(mold, design, fills);
    } else {
      this.drawJar(game, fills, options.liquid ?? null, time);
    }

    this.drawHolder(game.craft.holder, figure);

    const waxTop = figure ? -112 : this.waxTop(game, fills);
    const lift = figure ? 1 : -1;
    const wickX = figure ? 0 : (game.craft.wick.x / 30) * 55;
    this.drawWick(showWick, waxTop, lift, options.trimMm, design.wickId, wickX);
    this.drawFlame(
      showWick && Boolean(options.showFlame),
      waxTop,
      lift,
      time,
      wickX,
    );
    this.drawLabel(game, showLabel, figure);
    this.drawBubbles(game, options, figure);
  }

  private drawJar(
    game: GameState,
    fills: Record<string, number>,
    liquid: LiquidState | null,
    time: number,
  ): void {
    const design = game.design;
    const vessel = design.vesselId ? vesselsById[design.vesselId] : null;
    const wax = design.waxId ? waxesById[design.waxId] : null;
    const bowl = { color: vessel ? hexColor(vessel.glass) : stageColors.glass };
    const stroke = vessel
      ? hexColor(vesselMaterialStroke[vessel.material])
      : hexColor("#6f5541");
    const gel = design.mode === "gel";

    this.jar
      .ellipse(0, JAR_H / 2 + 18, 88, 14)
      .fill({ color: stageColors.shadow, alpha: 0.13 })
      .roundRect(-JAR_W / 2, -JAR_H / 2, JAR_W, JAR_H, 34)
      .fill({ color: bowl.color, alpha: 0.28 })
      .stroke({ width: 5, color: stroke })
      .roundRect(-JAR_W / 2 - 6, -JAR_H / 2 - 16, JAR_W + 12, 20, 9)
      .fill({ color: bowl.color, alpha: 0.7 })
      .stroke({ width: 4, color: stroke });

    this.overlay
      .roundRect(INNER_X + 8, INNER_Y + 8, 12, INNER_H - 16, 6)
      .fill({ color: stageColors.white, alpha: 0.28 })
      .roundRect(INNER_X, INNER_Y, INNER_W, INNER_H, 26)
      .stroke({ width: 3, color: stroke });

    if (design.lidOn) {
      this.overlay
        .roundRect(-JAR_W / 2 - 8, -JAR_H / 2 - 30, JAR_W + 16, 22, 10)
        .fill(stageColors.paper)
        .stroke({ width: 3, color: stroke })
        .roundRect(-20, -JAR_H / 2 - 42, 40, 15, 7)
        .fill(stageColors.creamDeep)
        .stroke({ width: 2, color: stroke });
    }

    this.layerGraphics.clear();

    if (gel) {
      const fraction = clamp((fills["gel"] ?? 100) / 100, 0, 1);
      const height = Math.max(0, INNER_H * fraction);
      const top = INNER_Y + INNER_H - height;
      if (height > 0.5) {
        this.layerGraphics.rect(INNER_X, top, INNER_W, height).fill({
          color: wax ? hexColor(wax.hex) : 0xeaf3ee,
          alpha: 0.32,
        });
        this.drawGelTop(top, liquid, time);
        this.drawGelInclusions(game, top, INNER_H - height, time);
      }
    } else {
      let cursor = INNER_Y + INNER_H;
      let previousColor: string | null = null;

      for (const [index, layer] of design.layers.entries()) {
        const bandHeight = (layer.height / 100) * INNER_H;
        const fraction = clamp((fills[layer.id] ?? 100) / 100, 0, 1);
        const filled = bandHeight * fraction;
        const color = waxColorsById[layer.colorId]?.hex ?? "#efe2cf";
        const y = cursor - filled;
        const unitMix = game.craft.units[index]?.mix ?? game.craft.mix;

        if (filled > 0.5) {
          this.layerGraphics
            .rect(INNER_X, y, INNER_W, filled + 1)
            .fill(hexColor(color));

          if (previousColor && unitMix > 0.02) {
            const interfaceHeight = Math.min(filled, Math.max(4, 20 * unitMix));
            this.layerGraphics
              .rect(
                INNER_X,
                y + filled - interfaceHeight,
                INNER_W,
                interfaceHeight,
              )
              .fill(
                hexColor(mixHex(previousColor, color, 0.35 + unitMix * 0.5)),
              );
          }

          if (previousColor) {
            this.layerGraphics
              .moveTo(INNER_X + 10, y + filled - 1)
              .lineTo(INNER_X + INNER_W - 10, y + filled - 1)
              .stroke({
                width: 1.5,
                color: stageColors.white,
                alpha: 0.35,
                cap: "round",
              });
          }
        }

        previousColor = color;
        cursor -= bandHeight;
      }

      const top = this.waxTop(game, fills);
      const topLayer = design.layers[design.layers.length - 1];
      const topHex = topLayer
        ? (waxColorsById[topLayer.colorId]?.hex ?? "#efe2cf")
        : "#efe2cf";
      const previousLayer = design.layers[design.layers.length - 2];
      const surfaceHex = previousLayer
        ? mixHex(
            waxColorsById[previousLayer.colorId]?.hex ?? topHex,
            topHex,
            0.2 + (game.craft.mix ?? 0) * 0.6,
          )
        : topHex;
      drawLiquidSurface(
        this.surfaceGraphics,
        liquid,
        { x: INNER_X, y: top, width: INNER_W, amplitude: 5 },
        surfaceHex,
        {
          gel: false,
          reduced: motion.reduced,
          quality: "high",
          time,
        },
      );
    }
  }

  private drawGelTop(
    top: number,
    liquid: LiquidState | null,
    time: number,
  ): void {
    drawLiquidSurface(
      this.surfaceGraphics,
      liquid,
      { x: INNER_X, y: top, width: INNER_W, amplitude: 5 },
      "#eaf3ee",
      {
        gel: true,
        reduced: motion.reduced,
        quality: "high",
        time,
      },
    );

    const shimmer = motion.reduced ? 0.5 : 0.42 + Math.sin(time * 1.6) * 0.12;
    for (let index = 0; index < 3; index += 1) {
      this.surfaceGraphics
        .moveTo(INNER_X + 25 + index * 54, top + 28 + index * 8)
        .lineTo(INNER_X + 48 + index * 54, top + 112 + index * 14)
        .stroke({
          width: 9,
          color: stageColors.white,
          alpha: 0.045 * shimmer,
          cap: "round",
        });
    }
  }

  private drawGelInclusions(
    game: GameState,
    top: number,
    emptyHeight: number,
    time: number,
  ): void {
    const positions = [
      { x: -76, y: 88 },
      { x: 66, y: 52 },
      { x: -58, y: 10 },
      { x: 72, y: -30 },
      { x: -42, y: -78 },
      { x: 48, y: -108 },
    ];
    let index = 0;

    for (const inclusionId of game.design.inclusions) {
      const inclusion = inclusionsById[inclusionId];
      if (!inclusion) continue;

      for (let i = 0; i < 3; i += 1) {
        const spot = positions[index % positions.length]!;
        const wobble = motion.reduced ? 0 : Math.sin(time * 0.55 + index) * 2.5;
        const x = spot.x + wobble;
        const y =
          Math.max(top + 8, spot.y + emptyHeight * 0.1) +
          (motion.reduced ? 0 : Math.cos(time * 0.45 + index) * 1.5);
        const color = hexColor(inclusion.color);
        index += 1;

        if (inclusion.kind === "petal") {
          this.inclusionsGraphics
            .ellipse(x, y, 7, 4)
            .fill({ color, alpha: 0.85 })
            .ellipse(x + 5, y + 4, 4, 2.4)
            .fill({ color, alpha: 0.6 });
        } else if (inclusion.kind === "flake") {
          this.inclusionsGraphics
            .rect(x - 5, y, 10, 3)
            .fill({ color, alpha: 0.9 });
        } else if (inclusion.kind === "bead") {
          this.inclusionsGraphics.circle(x, y, 4).fill({ color, alpha: 0.85 });
        } else {
          this.inclusionsGraphics
            .moveTo(x, y)
            .lineTo(x + 7, y - 10)
            .stroke({ width: 2.4, color, alpha: 0.85 });
        }
      }
    }
  }

  private drawMold(
    mold: Mold,
    design: GameState["design"],
    fills: Record<string, number>,
  ): void {
    this.mold.position.set(0, 0);
    this.mold.scale.set(1);

    const colorOf = (partId: string) =>
      waxColorsById[design.figureColors[partId] ?? "natural"]?.hex ?? "#efe2cf";
    const alphaOf = (partId: string) =>
      0.22 + 0.78 * clamp((fills[partId] ?? 100) / 100, 0, 1);

    this.mold
      .ellipse(0, 120, 90, 16)
      .fill({ color: stageColors.shadow, alpha: 0.12 });

    if (mold.id === "corazon") {
      const color = hexColor(colorOf("corazon"));
      this.mold
        .moveTo(0, 96)
        .bezierCurveTo(-88, 24, -98, -42, -50, -70)
        .bezierCurveTo(-16, -90, 0, -48, 0, -48)
        .bezierCurveTo(0, -48, 16, -90, 50, -70)
        .bezierCurveTo(98, -42, 88, 24, 0, 96)
        .fill({ color, alpha: alphaOf("corazon") })
        .stroke({ width: 3, color: hexColor("#8a6a50") });
    } else if (mold.id === "luna") {
      const moon = hexColor(colorOf("luna"));
      const star = hexColor(colorOf("estrella"));
      this.mold
        .circle(0, 0, 90)
        .fill({ color: moon, alpha: alphaOf("luna") })
        .stroke({ width: 3, color: hexColor("#8a6a50") })
        .circle(38, -18, 74)
        .fill({ color: stageColors.paper, alpha: 0.98 })
        .circle(38, -18, 74)
        .stroke({ width: 2, color: hexColor("#8a6a50"), alpha: 0.45 })
        .star(58, 52, 5, 30, 13)
        .fill({ color: star, alpha: alphaOf("estrella") })
        .stroke({ width: 2.5, color: hexColor("#8a6a50") });
    } else if (mold.id === "flor") {
      const petal = hexColor(colorOf("petalos"));
      const center = hexColor(colorOf("centro"));
      const leaf = hexColor(colorOf("hoja"));
      for (let i = 0; i < 5; i += 1) {
        const angle = -Math.PI / 2 + (i * Math.PI * 2) / 5;
        this.mold
          .circle(Math.cos(angle) * 48, -8 + Math.sin(angle) * 48, 44)
          .fill({ color: petal, alpha: alphaOf("petalos") })
          .stroke({ width: 2.5, color: hexColor("#8a6a50") });
      }
      this.mold
        .ellipse(-78, 78, 34, 18)
        .fill({ color: leaf, alpha: alphaOf("hoja") })
        .stroke({ width: 2.5, color: hexColor("#8a6a50") })
        .circle(0, -8, 30)
        .fill({ color: center, alpha: alphaOf("centro") })
        .stroke({ width: 2.5, color: hexColor("#8a6a50") });
    } else {
      const body = hexColor(colorOf("cuerpo"));
      const snout = hexColor(colorOf("hocico"));
      this.mold
        .circle(-62, -62, 30)
        .fill({ color: body, alpha: alphaOf("cuerpo") })
        .stroke({ width: 2.5, color: hexColor("#8a6a50") })
        .circle(62, -62, 30)
        .fill({ color: body, alpha: alphaOf("cuerpo") })
        .stroke({ width: 2.5, color: hexColor("#8a6a50") })
        .circle(0, 0, 86)
        .fill({ color: body, alpha: alphaOf("cuerpo") })
        .stroke({ width: 3, color: hexColor("#8a6a50") })
        .ellipse(0, 28, 48, 36)
        .fill({ color: snout, alpha: alphaOf("hocico") })
        .stroke({ width: 2.5, color: hexColor("#8a6a50") });
    }
  }

  private waxTop(game: GameState, fills: Record<string, number>): number {
    if (game.design.mode === "gel") {
      const fraction = clamp((fills["gel"] ?? 100) / 100, 0, 1);
      return INNER_Y + INNER_H - INNER_H * fraction;
    }

    let filled = 0;
    for (const layer of game.design.layers) {
      const band = (layer.height / 100) * INNER_H;
      filled += band * clamp((fills[layer.id] ?? 100) / 100, 0, 1);
    }
    return INNER_Y + INNER_H - filled;
  }

  private drawHolder(visible: boolean, figure: boolean): void {
    if (!visible) return;
    const width = figure ? 170 : 246;
    const y = figure ? -150 : -174;

    this.holderGraphics
      .roundRect(-width / 2, y, width, 12, 5)
      .fill(stageColors.woodLight)
      .stroke({ width: 2, color: stageColors.woodDark })
      .roundRect(-width / 2 + 8, y + 10, 12, 22, 5)
      .fill(stageColors.wood)
      .roundRect(width / 2 - 20, y + 10, 12, 22, 5)
      .fill(stageColors.wood)
      .circle(0, y + 6, 4)
      .fill(stageColors.creamDeep)
      .stroke({ width: 1.5, color: stageColors.woodDark });
  }

  private drawWick(
    visible: boolean,
    waxTop: number,
    lift: number,
    trimMm: number | undefined,
    wickId: string | null,
    offsetX: number,
  ): void {
    if (!visible) return;
    const length =
      trimMm === undefined ? 32 : Math.max(10, Math.min(38, trimMm * 2.4));
    const y = waxTop + (lift === -1 ? 2 : -2);
    const width = wickId ? 3.4 : 3;

    this.wick
      .moveTo(offsetX, y)
      .lineTo(offsetX, y - length)
      .stroke({ width, color: stageColors.ink, cap: "round" });
    this.wick
      .moveTo(offsetX, y - length)
      .lineTo(offsetX, y - length - 5)
      .stroke({ width: 3, color: stageColors.accent });
  }

  private drawFlame(
    visible: boolean,
    waxTop: number,
    lift: number,
    time: number,
    offsetX: number,
  ): void {
    if (!visible) return;
    const length = 24;
    const y = waxTop + (lift === -1 ? 2 : -2) - length - 7;
    const pulse = motion.reduced ? 1 : 1 + Math.sin(time * 4.2) * 0.04;
    this.flame.position.set(offsetX, y);
    this.flame.scale.set(pulse, 1 / pulse);
    this.flame
      .moveTo(0, 0)
      .bezierCurveTo(12, 12, 18, 22, 18, 30)
      .bezierCurveTo(18, 43, 9, 48, 0, 48)
      .bezierCurveTo(-9, 48, -18, 43, -18, 30)
      .bezierCurveTo(-18, 22, -12, 12, 0, 0)
      .fill(hexColor("#e08a5f"))
      .moveTo(0, 14)
      .bezierCurveTo(6, 21, 9, 28, 9, 33)
      .bezierCurveTo(9, 41, 5, 44, 0, 44)
      .bezierCurveTo(-5, 44, -9, 41, -9, 33)
      .bezierCurveTo(-9, 28, -6, 21, 0, 14)
      .fill(hexColor("#f6d36f"));
  }

  private drawLabel(game: GameState, visible: boolean, figure: boolean): void {
    this.labelGroup.visible = visible && Boolean(game.design.labelId);
    if (!this.labelGroup.visible) return;

    const label = game.design.labelId ? labelsById[game.design.labelId] : null;
    if (!label) return;

    const placement = game.craft.label;
    const x = clamp(placement.x, -14, 14) * 3;
    const y = (figure ? 118 : 66) + clamp(placement.y, -10, 10) * 3;
    this.labelGroup.position.set(x, y);
    this.labelGroup.rotation = (placement.rotation * Math.PI) / 180;

    this.labelText.text = label.nombre;
    this.labelText.style.fill = hexColor("#2a241e");
    this.labelGraphics.clear();
    this.labelGraphics
      .roundRect(-48, -22, 96, 44, 5)
      .fill(hexColor(label.color))
      .stroke({ width: 2, color: stageColors.border })
      .rect(-30, -12, 60, 4)
      .fill(hexColor(label.accent))
      .rect(-30, 10, 34, 3)
      .fill({ color: hexColor(label.accent), alpha: 0.45 });
    this.labelText.position.set(0, 1);
  }

  private drawBubbles(
    game: GameState,
    options: CandleRigOptions,
    figure: boolean,
  ): void {
    if (figure || game.design.mode !== "gel" || !options.showBubbles) return;
    const liquid = options.liquid;
    if (!liquid) return;

    const time = options.time ?? 0;
    const remaining = Math.max(0, game.craft.gelBubbles - game.craft.gelPopped);
    const bubblePosition = (index: number) => {
      const bubble = liquid.bubbles[index];
      if (!bubble) return null;
      const wobble = motion.reduced ? 0 : Math.sin(time * 1.8 + index) * 2.2;
      return {
        x: -80 + bubble.x * 160 + wobble,
        y:
          INNER_Y +
          INNER_H -
          30 -
          (1 - ((bubble.phase + index * 0.11) % 1)) * (INNER_H - 70),
        radius: bubble.radius,
      };
    };

    for (let i = 0; i < remaining; i += 1) {
      const bubble = bubblePosition(i);
      if (!bubble) continue;
      this.bubblesGraphics
        .circle(bubble.x, bubble.y, bubble.radius)
        .fill({ color: stageColors.white, alpha: 0.5 })
        .stroke({ width: 1.5, color: hexColor("#7f95ab"), alpha: 0.55 })
        .circle(
          bubble.x - bubble.radius * 0.3,
          bubble.y - bubble.radius * 0.35,
          bubble.radius * 0.28,
        )
        .fill({ color: stageColors.white, alpha: 0.75 });
    }

    const pulse = game.craft.gelPopPulse;
    if (pulse > 0) {
      const popped = bubblePosition(game.craft.gelPopIndex);
      if (popped) {
        this.bubblesGraphics
          .circle(popped.x, popped.y, popped.radius + (1 - pulse) * 14)
          .stroke({
            width: 2,
            color: stageColors.white,
            alpha: pulse * 0.8,
          });
        if (!motion.reduced) {
          for (let index = 0; index < 4; index += 1) {
            const angle = (index / 4) * Math.PI * 2;
            const distance = 8 + (1 - pulse) * 12;
            this.bubblesGraphics
              .circle(
                popped.x + Math.cos(angle) * distance,
                popped.y + Math.sin(angle) * distance,
                1.8,
              )
              .fill({ color: stageColors.white, alpha: pulse * 0.6 });
          }
        }
      }
    }
  }
}
