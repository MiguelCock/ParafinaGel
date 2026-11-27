import { Container, Graphics, Text } from "pixi.js";
import {
  TRIM_MAX_MM,
  TRIM_MIN_MM,
  TRIM_TARGET_MM,
  WICK_MAX_OFFSET,
  wickLean,
} from "../../craft";
import { moldsById, vesselsById } from "../../data";
import type { GameState } from "../../game-state.svelte";
import { PREP_VIEW, clamp, pointInCircle, pointInRect } from "../../layout";
import { CandleRig } from "../candle-rig";
import { stageColors } from "../palette";
import type { StageScene } from "../scene";

/**
 * Side view of the vessel: place the wick, read how far it leans from the
 * centering guide and trim it against the ruler.
 */
export class WickScene implements StageScene {
  view = new Container();
  private board = new Graphics();
  private candle = new CandleRig();
  private guide = new Graphics();
  private wick = new Graphics();
  private tipRing = new Graphics();
  private ruler = new Graphics();
  private scissors = new Graphics();
  private trimLabel = new Text({
    text: "",
    style: {
      fontFamily: "Manrope Variable, sans-serif",
      fontSize: 12,
      fontWeight: "800",
      fill: stageColors.accent,
    },
  });
  private rulerLabels: Text[] = [];
  private mmLabel = new Text({
    text: "mm",
    style: {
      fontFamily: "Manrope Variable, sans-serif",
      fontSize: 10,
      fontWeight: "700",
      fill: stageColors.muted,
    },
  });
  private title = new Text({
    text: "",
    style: {
      fontFamily: "Fraunces Variable, Georgia, serif",
      fontSize: 22,
      fontWeight: "600",
      fill: stageColors.ink,
    },
  });
  private detail = new Text({
    text: "",
    style: {
      fontFamily: "Manrope Variable, sans-serif",
      fontSize: 13,
      fontWeight: "700",
      fill: stageColors.muted,
      wordWrap: true,
      wordWrapWidth: 760,
      align: "center",
    },
  });

  private dragging = false;
  private trimming = false;
  private trimPreview = 9;
  private tip: { x: number; y: number } = {
    x: PREP_VIEW.guide.x,
    y: PREP_VIEW.guide.y - 60,
  };

  constructor() {
    const board = PREP_VIEW.board;
    this.board
      .roundRect(board.x, board.y, board.width, board.height, board.radius)
      .fill({ color: stageColors.paper, alpha: 0.86 })
      .stroke({ width: 2, color: stageColors.border });

    this.candle.position.set(PREP_VIEW.vessel.x, PREP_VIEW.vessel.y);
    this.candle.scale.set(PREP_VIEW.vessel.scale);

    this.title.anchor.set(0.5);
    this.title.position.set(500, PREP_VIEW.titleY);
    this.detail.anchor.set(0.5, 0);
    this.detail.position.set(500, PREP_VIEW.detailY);

    this.trimLabel.anchor.set(1, 0.5);
    this.mmLabel.anchor.set(0, 1);
    this.mmLabel.position.set(PREP_VIEW.ruler.x + 32, PREP_VIEW.ruler.y - 3);

    for (let mm = TRIM_MIN_MM; mm <= TRIM_MAX_MM; mm += 2) {
      const label = new Text({
        text: String(mm),
        style: {
          fontFamily: "Manrope Variable, sans-serif",
          fontSize: 11,
          fontWeight: "700",
          fill: stageColors.muted,
        },
      });
      label.anchor.set(0, 0.5);
      label.position.set(PREP_VIEW.ruler.x + 32, this.yForTrim(mm));
      this.rulerLabels.push(label);
    }

    this.view.addChild(
      this.board,
      this.guide,
      this.candle,
      this.wick,
      this.tipRing,
      this.ruler,
      this.scissors,
      this.mmLabel,
      ...this.rulerLabels,
      this.trimLabel,
      this.title,
      this.detail,
    );
  }

  update(game: GameState): void {
    if (!this.trimming) this.trimPreview = game.craft.wick.trimMm;

    const placed = game.craft.wick.placed;
    const trimmed = game.craft.wick.trimmed;
    const lean = wickLean(game.craft);
    const guideY = this.guideY(game);
    const baseY = this.wickBaseY(game);
    const length = Math.max(0, guideY - this.yForTrim(this.trimPreview));
    const tipX = PREP_VIEW.guide.x + Math.sin(lean) * length;
    const tipY = guideY - Math.cos(lean) * length;
    this.tip = { x: tipX, y: tipY };

    const vessel = game.design.vesselId
      ? vesselsById[game.design.vesselId]
      : null;
    this.title.text = vessel
      ? vessel.nombre
      : game.design.moldId
        ? "Molde"
        : "Pieza";

    if (!placed) {
      this.detail.text =
        "Arrastra la mecha al centro y suéltala · flechas + Enter";
    } else if (!trimmed) {
      this.detail.text =
        "Mecha fijada · arrastra la tijera o usa ↑/↓ y Enter para cortar";
    } else {
      this.detail.text = `Mecha cortada a ${formatMm(game.craft.wick.trimMm)} mm · lista para la cera`;
    }

    this.candle.update(game, {
      showWick: false,
      showLabel: false,
      showFlame: false,
      fills: this.emptyFills(game),
    });

    this.drawGuide(placed, trimmed, guideY, baseY);
    this.drawWick(placed, trimmed, lean, guideY, baseY);
    this.drawTipRing(placed, trimmed);
    this.drawRuler(game, placed);
    this.drawScissors(placed);

    const trimY = this.yForTrim(this.trimPreview);
    const trimColor =
      placed && trimmed && !this.trimming
        ? stageColors.sage
        : stageColors.accent;
    this.trimLabel.visible = placed;
    this.trimLabel.text = `${formatMm(this.trimPreview)} mm`;
    this.trimLabel.position.set(PREP_VIEW.guide.x - 12, trimY);
    this.trimLabel.style.fill = trimColor;

    for (const label of this.rulerLabels) label.alpha = placed ? 1 : 0.4;
    this.mmLabel.alpha = placed ? 1 : 0.4;
  }

  private guideY(game: GameState): number {
    return game.design.mode === "figura"
      ? PREP_VIEW.figureGuideY
      : PREP_VIEW.guide.y;
  }

  private wickBaseY(game: GameState): number {
    return game.design.mode === "figura"
      ? PREP_VIEW.figureWickBaseY
      : PREP_VIEW.wickBaseY;
  }

  private emptyFills(game: GameState): Record<string, number> {
    const fills: Record<string, number> = {};
    if (game.design.mode === "gel") {
      fills.gel = 0;
      return fills;
    }
    if (game.design.mode === "figura") {
      const mold = game.design.moldId ? moldsById[game.design.moldId] : null;
      for (const part of mold?.parts ?? []) fills[part.id] = 0;
      return fills;
    }
    for (const layer of game.design.layers) fills[layer.id] = 0;
    return fills;
  }

  private drawGuide(
    placed: boolean,
    trimmed: boolean,
    guideY: number,
    baseY: number,
  ): void {
    const color = placed
      ? trimmed
        ? stageColors.sage
        : stageColors.accent
      : stageColors.muted;

    this.guide.clear();
    for (let y = PREP_VIEW.ruler.y - 4; y < baseY; y += 18) {
      this.guide
        .moveTo(PREP_VIEW.guide.x, y)
        .lineTo(PREP_VIEW.guide.x, Math.min(y + 9, baseY));
    }
    this.guide.stroke({
      width: 1.4,
      color,
      alpha: placed ? 0.38 : 0.3,
    });

    this.guide
      .circle(PREP_VIEW.guide.x, guideY, PREP_VIEW.guide.radius)
      .stroke({ width: 2.5, color, alpha: placed ? 0.65 : 0.5 })
      .moveTo(PREP_VIEW.guide.x - 9, guideY)
      .lineTo(PREP_VIEW.guide.x + 9, guideY)
      .moveTo(PREP_VIEW.guide.x, guideY - 9)
      .lineTo(PREP_VIEW.guide.x, guideY + 9)
      .stroke({ width: 1.5, color, alpha: placed ? 0.7 : 0.55 });
  }

  private drawWick(
    placed: boolean,
    trimmed: boolean,
    lean: number,
    guideY: number,
    baseY: number,
  ): void {
    const baseX = PREP_VIEW.guide.x;
    const alpha = placed ? 0.95 : 0.55;

    this.wick.clear();
    this.wick
      .moveTo(baseX, guideY)
      .lineTo(baseX, baseY)
      .stroke({
        width: 2.5,
        color: stageColors.ink,
        alpha: 0.22,
        cap: "round",
      })
      .roundRect(baseX - 7, baseY - 6, 14, 6, 3)
      .fill({ color: stageColors.steel, alpha: placed ? 0.9 : 0.4 })
      .stroke({
        width: 1.5,
        color: stageColors.steelDark,
        alpha: placed ? 0.8 : 0.35,
      });

    this.wick
      .moveTo(baseX, guideY)
      .lineTo(this.tip.x, this.tip.y)
      .stroke({
        width: placed ? 4 : 3.4,
        color: stageColors.ink,
        alpha,
        cap: "round",
      })
      .moveTo(baseX + 1, guideY)
      .lineTo(this.tip.x + 1, this.tip.y)
      .stroke({
        width: 1.2,
        color: stageColors.white,
        alpha: placed ? 0.22 : 0.12,
        cap: "round",
      });

    if (trimmed) {
      const nx = Math.cos(lean);
      const ny = Math.sin(lean);
      this.wick
        .moveTo(this.tip.x - nx * 5, this.tip.y - ny * 5)
        .lineTo(this.tip.x + nx * 5, this.tip.y + ny * 5)
        .stroke({
          width: 2.5,
          color: stageColors.sage,
          alpha: 0.9,
          cap: "round",
        });
    } else {
      this.wick
        .circle(this.tip.x, this.tip.y, 3.5)
        .fill({ color: stageColors.accent, alpha: placed ? 0.85 : 0.5 });
    }
  }

  private drawTipRing(placed: boolean, trimmed: boolean): void {
    this.tipRing.clear();
    if (trimmed && !this.trimming) return;

    this.tipRing.circle(this.tip.x, this.tip.y, placed ? 20 : 24).stroke({
      width: 2,
      color: placed ? stageColors.accent : stageColors.sage,
      alpha: placed ? 0.55 : 0.7,
    });
  }

  private drawRuler(game: GameState, placed: boolean): void {
    const ruler = PREP_VIEW.ruler;
    const cutY = this.yForTrim(this.trimPreview);
    const cutColor = game.craft.wick.trimmed
      ? stageColors.sage
      : stageColors.accent;

    this.ruler.clear();
    this.ruler
      .roundRect(ruler.x, ruler.y, ruler.width, ruler.height, ruler.radius)
      .fill({
        color: stageColors.paper,
        alpha: placed ? 0.94 : 0.6,
      })
      .stroke({
        width: 2,
        color: stageColors.border,
        alpha: placed ? 1 : 0.5,
      });

    for (let mm = TRIM_MIN_MM; mm <= TRIM_MAX_MM; mm += 1) {
      const y = this.yForTrim(mm);
      const long = mm % 2 === 0;
      this.ruler
        .moveTo(ruler.x + 7, y)
        .lineTo(ruler.x + (long ? 24 : 16), y)
        .stroke({
          width: long ? 1.4 : 1,
          color: stageColors.muted,
          alpha: placed ? 0.65 : 0.3,
        });
    }

    const targetY = this.yForTrim(TRIM_TARGET_MM);
    this.ruler
      .moveTo(ruler.x + 2, targetY)
      .lineTo(ruler.x + ruler.width - 4, targetY)
      .stroke({
        width: 1.5,
        color: stageColors.sage,
        alpha: placed ? 0.8 : 0.3,
      });

    if (!placed) return;

    const cutLineEnd = Math.max(PREP_VIEW.guide.x + 18, this.tip.x + 10);
    this.ruler
      .moveTo(ruler.x - 10, cutY)
      .lineTo(cutLineEnd, cutY)
      .stroke({ width: 2, color: cutColor, alpha: 0.75 })
      .moveTo(ruler.x - 10, cutY - 5)
      .lineTo(ruler.x - 10, cutY + 5)
      .stroke({ width: 2, color: cutColor, alpha: 0.9 });
  }

  private drawScissors(placed: boolean): void {
    const x = PREP_VIEW.scissors.x;
    const y = placed
      ? Math.max(PREP_VIEW.scissors.y, this.yForTrim(this.trimPreview))
      : PREP_VIEW.scissors.y;
    const color = placed ? stageColors.steel : stageColors.muted;
    const handle = placed ? stageColors.accent : stageColors.muted;
    const alpha = placed ? 1 : 0.4;

    this.scissors.clear();
    this.scissors
      .circle(x, y, PREP_VIEW.scissors.radius)
      .fill({
        color: stageColors.paper,
        alpha: placed ? 0.92 : 0.55,
      })
      .stroke({
        width: 2,
        color: stageColors.border,
        alpha: placed ? 0.9 : 0.4,
      });

    this.scissors
      .moveTo(x - 2, y - 2)
      .lineTo(x - 36, y - 18)
      .moveTo(x - 2, y + 2)
      .lineTo(x - 36, y + 18)
      .stroke({ width: 4, color, alpha, cap: "round" });

    this.scissors
      .circle(x - 4, y, 3.5)
      .fill({ color: stageColors.steelDark, alpha });

    this.scissors
      .moveTo(x - 2, y - 2)
      .lineTo(x + 9, y - 13)
      .moveTo(x - 2, y + 2)
      .lineTo(x + 9, y + 13)
      .stroke({ width: 3, color: handle, alpha, cap: "round" })
      .ellipse(x + 13, y - 15, 7, 9)
      .stroke({ width: 3, color: handle, alpha })
      .ellipse(x + 13, y + 15, 7, 9)
      .stroke({ width: 3, color: handle, alpha });
  }

  private yForTrim(mm: number): number {
    const ratio = clamp((TRIM_MAX_MM - mm) / (TRIM_MAX_MM - TRIM_MIN_MM), 0, 1);
    return PREP_VIEW.ruler.y + ratio * PREP_VIEW.ruler.height;
  }

  private trimForY(y: number): number {
    const ratio = clamp((y - PREP_VIEW.ruler.y) / PREP_VIEW.ruler.height, 0, 1);
    return TRIM_MAX_MM - ratio * (TRIM_MAX_MM - TRIM_MIN_MM);
  }

  private hitsWick(x: number, y: number, game: GameState): boolean {
    const guideY = this.guideY(game);
    const nearTip = Math.hypot(x - this.tip.x, y - this.tip.y) <= 56;
    const alongWick =
      Math.abs(x - this.tip.x) <= 50 &&
      y >= this.tip.y - 24 &&
      y <= guideY + 24;
    const aroundGuide = pointInCircle(
      { x, y },
      {
        x: PREP_VIEW.guide.x,
        y: guideY,
        radius: PREP_VIEW.guide.radius + 46,
      },
    );
    return nearTip || alongWick || aroundGuide;
  }

  pointerDown(x: number, y: number, game: GameState): void {
    if (game.phase !== "wick") return;

    if (game.craft.wick.placed) {
      const cutY = this.yForTrim(this.trimPreview);
      const scissorsY = Math.max(PREP_VIEW.scissors.y, cutY);
      const onScissors =
        Math.hypot(x - PREP_VIEW.scissors.x, y - scissorsY) <=
        PREP_VIEW.scissors.hitRadius;
      if (onScissors) {
        this.trimming = true;
        return;
      }
      if (pointInRect({ x, y }, PREP_VIEW.cutZone)) {
        this.trimming = true;
        this.trimPreview = this.trimForY(y);
        return;
      }
      if (game.craft.wick.trimmed) return;
      if (this.hitsWick(x, y, game)) this.dragging = true;
      return;
    }

    if (this.hitsWick(x, y, game)) this.dragging = true;
  }

  pointerMove(x: number, y: number, game: GameState): void {
    if (this.trimming) {
      this.trimPreview = this.trimForY(y);
      return;
    }
    if (!this.dragging) return;

    const nx = clamp((x - PREP_VIEW.guide.x) / PREP_VIEW.guide.travel, -1, 1);
    const ny = clamp((y - this.guideY(game)) / PREP_VIEW.guide.travel, -1, 1);
    game.setWickPosition(nx * WICK_MAX_OFFSET, ny * WICK_MAX_OFFSET);
  }

  pointerUp(x: number, y: number, game: GameState): void {
    if (this.trimming) {
      this.trimming = false;
      game.setTrimMm(Math.round(this.trimPreview * 2) / 2);
      game.cutWick();
      return;
    }
    if (this.dragging) {
      this.dragging = false;
      // The depth axis is not visible in a side view. Snap a drop near the
      // guide so centering with the pointer matches centering with the keys.
      if (
        Math.hypot(x - PREP_VIEW.guide.x, y - this.guideY(game)) <=
        PREP_VIEW.guide.travel * 0.6
      ) {
        game.centerWick();
      }
      game.placeWick();
    }
  }

  keyDown(key: string, game: GameState): void {
    if (game.phase !== "wick") return;

    if (!game.craft.wick.placed) {
      const step = 4;
      if (key === "ArrowLeft") game.moveWick(-step, 0);
      if (key === "ArrowRight") game.moveWick(step, 0);
      if (key === "ArrowUp") game.moveWick(0, -step);
      if (key === "ArrowDown") game.moveWick(0, step);
      if (key === "Enter" || key === " ") game.placeWick();
      return;
    }

    if (key === "ArrowUp" || key === "ArrowRight") {
      game.setTrimMm(game.craft.wick.trimMm - 0.5);
    }
    if (key === "ArrowDown" || key === "ArrowLeft") {
      game.setTrimMm(game.craft.wick.trimMm + 0.5);
    }
    if (key === "Enter" || key === " ") game.cutWick();
  }

  ariaLabel(game: GameState): string {
    if (!game.craft.wick.placed) {
      return "Preparación en vista lateral. Arrastra la mecha al centro y suéltala, o muévela con las flechas y pulsa Enter para colocarla; después ajusta la longitud y pulsa Enter para cortar.";
    }
    if (!game.craft.wick.trimmed) {
      return "Preparación en vista lateral. La mecha está colocada. Arrastra la tijera o la regla, o usa las flechas arriba y abajo para ajustar la longitud, y pulsa Enter para cortar.";
    }
    return "Preparación en vista lateral. La mecha está colocada y cortada. Pasa a la cera.";
  }

  destroy(): void {
    this.view.destroy({ children: true });
  }
}

function formatMm(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
