import { Assets, Container, Graphics, Sprite, Text } from "pixi.js";
import { MAX_CUTS, TEMP_START } from "../../craft";
import { scentsById, waxesById } from "../../data";
import {
  FLUID_EMPTY,
  FLUID_WALL,
  FLUID_WAX,
  clearFluid,
  countMaterial,
  createFluidState,
  materialAt,
  setFluidCell,
  stepFluid,
} from "../../fluid";
import type { GameState } from "../../game-state.svelte";
import { CUTTING_BOARD, MELT_POT, MELT_STOVE, STEARIC_JAR } from "../../layout";
import { FluidRig } from "../fluid-rig";
import { motion, motionBudget } from "../motion";
import { clamp, hexColor, stageColors } from "../palette";
import type { StageScene } from "../scene";

const POT_X = MELT_POT.center.x;
const POT_Y = MELT_POT.center.y;
const BOARD = CUTTING_BOARD;
const STEARIC = STEARIC_JAR.center;
const MAX_PIECES = MAX_CUTS + 1;

/**
 * Fluid window inside the pot. The grid is rendered at stage resolution and
 * clipped by `mask`; `bedRow` is a hidden floor so the wax builds a visible
 * level instead of falling out of the bottom of the mask.
 */
const FLUID = {
  width: 48,
  height: 26,
  scale: 6.4,
  x: 242,
  y: 322,
  mask: { x: 240, y: 322, width: 324, height: 160, radius: 28 },
  bedRow: 25,
  coldRow: 22,
  hotRow: 8,
  step: 1 / 30,
  flow: 0.42,
  addPerUpdate: 4,
} as const;

interface BoardPiece {
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
  /** 0 on the board, 1 inside the pot. */
  drop: number;
}

export class MeltScene implements StageScene {
  view = new Container();
  private background = new Graphics();
  private pot = new Graphics();
  private bottles = new Graphics();
  private cuttingBoard = new Graphics();
  private stearicJar = new Graphics();
  private spoon = new Graphics();
  private steam = new Graphics();
  private stove = new Graphics();
  private stoveSprite: Sprite;
  private knob = new Graphics();
  private chunks = new Graphics();
  private surface = new Graphics();
  private bubbles = new Graphics();
  private fluidMask = new Graphics();
  private fluidState = createFluidState(FLUID.width, FLUID.height, 17);
  private fluidRig: FluidRig;
  private fluidAccumulator = 0;
  private knobLabel = new Text({
    text: "Calor",
    style: {
      fontFamily: "Manrope Variable, sans-serif",
      fontSize: 11,
      fontWeight: "800",
      fill: stageColors.muted,
    },
  });
  private knobPercent = new Text({
    text: "0 %",
    style: {
      fontFamily: "Manrope Variable, sans-serif",
      fontSize: 12,
      fontWeight: "800",
      fill: stageColors.ink,
    },
  });
  private temperature = new Text({
    text: "",
    style: {
      fontFamily: "Fraunces Variable, Georgia, serif",
      fontSize: 34,
      fontWeight: "600",
      fill: stageColors.ink,
    },
  });
  private status = new Text({
    text: "",
    style: {
      fontFamily: "Manrope Variable, sans-serif",
      fontSize: 16,
      fontWeight: "700",
      fill: stageColors.muted,
    },
  });
  private aroma = new Text({
    text: "",
    style: {
      fontFamily: "Manrope Variable, sans-serif",
      fontSize: 12,
      fontWeight: "700",
      fill: stageColors.ink,
      wordWrap: true,
      wordWrapWidth: 82,
    },
  });
  private stearicLabel = new Text({
    text: "Esteárico",
    style: {
      fontFamily: "Manrope Variable, sans-serif",
      fontSize: 11,
      fontWeight: "700",
      fill: stageColors.muted,
    },
  });
  private stearicCheck = new Text({
    text: "✓",
    style: {
      fontFamily: "Manrope Variable, sans-serif",
      fontSize: 20,
      fontWeight: "800",
      fill: stageColors.sage,
    },
  });
  private help = new Text({
    text: "",
    style: {
      fontFamily: "Manrope Variable, sans-serif",
      fontSize: 14,
      fill: stageColors.muted,
    },
  });

  private draggingSpoon = false;
  private draggingKnob = false;
  private knobStartY = 0;
  private knobStartLevel = 0;
  private cutting = false;
  private cutStartX = 0;
  private cutStrokeDone = false;
  private lastAngle = 0;
  private accumulated = 0;
  private spoonAngle = -0.8;
  private time = 0;

  constructor() {
    this.seedBed();

    this.background
      .roundRect(120, 64, 760, 500, 30)
      .fill({ color: stageColors.paper, alpha: 0.88 })
      .stroke({ width: 2, color: stageColors.border });

    this.temperature.anchor.set(0.5);
    this.temperature.position.set(POT_X, 160);
    this.status.anchor.set(0.5);
    this.status.position.set(POT_X, 198);
    this.aroma.position.set(760, 250);
    this.stearicLabel.anchor.set(0.5);
    this.stearicLabel.position.set(STEARIC.x, STEARIC.y + 50);
    this.stearicCheck.anchor.set(0.5);
    this.stearicCheck.position.set(STEARIC.x + 22, STEARIC.y - 34);
    this.help.anchor.set(0.5);
    this.help.position.set(500, 596);
    this.help.visible = false;

    this.stoveSprite = new Sprite();
    this.stoveSprite.anchor.set(0.5, 1);
    this.stoveSprite.position.set(390, 556);
    this.stoveSprite.scale.set(0.9);
    this.stoveSprite.alpha = 0.95;
    this.stoveSprite.visible = false;
    void this.loadStove();

    this.fluidRig = new FluidRig(this.fluidState, { scale: FLUID.scale });
    this.fluidRig.sprite.position.set(FLUID.x, FLUID.y);
    this.fluidMask
      .roundRect(
        FLUID.mask.x,
        FLUID.mask.y,
        FLUID.mask.width,
        FLUID.mask.height,
        FLUID.mask.radius,
      )
      .fill(0xffffff);
    this.fluidRig.sprite.mask = this.fluidMask;

    this.knobLabel.anchor.set(0.5);
    this.knobLabel.position.set(MELT_STOVE.label.x, MELT_STOVE.label.y);
    this.knobPercent.anchor.set(0.5);
    this.knobPercent.position.set(MELT_STOVE.value.x, MELT_STOVE.value.y);

    this.view.addChild(
      this.background,
      this.cuttingBoard,
      this.stoveSprite,
      this.stove,
      this.pot,
      this.fluidRig.sprite,
      this.fluidMask,
      this.surface,
      this.chunks,
      this.bubbles,
      this.bottles,
      this.stearicJar,
      this.steam,
      this.spoon,
      this.knob,
      this.temperature,
      this.status,
      this.aroma,
      this.stearicLabel,
      this.stearicCheck,
      this.knobLabel,
      this.knobPercent,
      this.help,
    );
  }

  update(game: GameState, delta: number): void {
    if (!motion.paused) this.time += delta;

    const wax = game.design.waxId ? waxesById[game.design.waxId] : null;
    const waxColor = wax ? wax.hex : "#e9c9a8";
    const format = wax?.format ?? "flakes";
    const heating = game.craft.heating;
    const heatLevel = game.craft.heatLevel;
    const inRange =
      game.craft.temperature >= game.meltMin &&
      game.craft.temperature <= game.meltMax;

    // `meltTemperature` keeps the last in-range reading, so the visual melt
    // does not rewind while the pot cools after reaching the target.
    const visualTemperature = Math.max(
      game.craft.temperature,
      game.craft.meltTemperature,
    );
    const meltProgress = clamp(
      (visualTemperature - TEMP_START) / Math.max(1, game.meltMin - TEMP_START),
      0,
      1,
    );
    const targetRow = this.levelRow(meltProgress, format);

    this.syncWaxLevel(targetRow, waxColor);
    this.paintWax(waxColor);
    this.stepFluidVisual(delta, heating, heatLevel);
    this.fluidRig.update(this.fluidState);

    const surfaceY = this.waxSurfaceY();
    const boardPieces =
      format === "block"
        ? this.boardPieces(game.craft.cutCuts, meltProgress)
        : [];

    this.temperature.text = `${Math.round(game.craft.temperature)} °C`;
    this.temperature.style.fill = inRange
      ? stageColors.sage
      : game.craft.overheated
        ? stageColors.accent
        : stageColors.ink;

    const coolingWithMelt = meltProgress > 0.05 && !heating;

    this.status.text = !game.cutPrepared
      ? "Corta el bloque antes de calentar"
      : !game.stearicPrepared
        ? "Agrega el ácido esteárico"
        : game.craft.overheated
          ? "Se pasó de calor · retira la olla"
          : inRange
            ? "En rango · cera fundida"
            : heating
              ? meltProgress < 0.94
                ? game.needsCutting
                  ? "Los trozos caen en la olla"
                  : "La cera se funde y sube el nivel"
                : "Calentando despacio…"
              : coolingWithMelt
                ? game.craft.meltTemperature >= game.meltMin
                  ? "Cera fundida · puedes seguir"
                  : "Cera tibia · sigue calentando"
                : "Gira la perilla para calentar";

    const scent = game.design.scentIds[0]
      ? scentsById[game.design.scentIds[0]]
      : null;
    this.aroma.text = scent ? `Aroma · ${scent.nombre}` : "Aroma pendiente";

    this.background.clear();
    this.background
      .roundRect(120, 64, 760, 500, 30)
      .fill({ color: stageColors.paper, alpha: 0.88 })
      .stroke({ width: 2, color: stageColors.border });

    this.drawCuttingBoard(boardPieces, game.craft.cutCuts, waxColor);
    this.drawStove(game.canHeat);
    this.drawPot(game, heating, format, meltProgress, surfaceY);
    this.drawBottles(waxColor, scent?.nombre ?? "Sin aroma");
    this.drawStearicJar(game);
    this.drawSurface(waxColor, surfaceY);
    this.drawWaxChunks(boardPieces, waxColor, surfaceY);
    this.drawResidues(boardPieces, waxColor, surfaceY, inRange);
    this.drawBubbles(inRange, surfaceY);
    this.drawSteam(game, waxColor);
    this.drawSpoon(waxColor);
    this.drawKnob(game.canHeat, heatLevel);
  }

  private seedBed(): void {
    for (let x = 0; x < FLUID.width; x += 1) {
      setFluidCell(this.fluidState, x, FLUID.bedRow, FLUID_WALL);
    }
  }

  private levelRow(
    meltProgress: number,
    format: "block" | "flakes" | "gel",
  ): number {
    const coldRow = format === "block" ? FLUID.bedRow : FLUID.coldRow;
    return Math.round(coldRow + (FLUID.hotRow - coldRow) * meltProgress);
  }

  private syncWaxLevel(targetRow: number, waxColor: string): void {
    const target =
      Math.max(0, FLUID.bedRow - targetRow) * this.fluidState.width;

    if (motion.reduced) {
      this.fillWaxLevel(targetRow, waxColor);
      return;
    }

    const current = countMaterial(this.fluidState, FLUID_WAX);
    if (current < target) {
      this.addWaxCells(
        Math.min(FLUID.addPerUpdate, target - current),
        targetRow,
        waxColor,
      );
    } else if (current > target) {
      this.removeWaxCells(Math.min(FLUID.addPerUpdate, current - target));
    }
  }

  /** Reduced motion: the level updates in discrete steps, without simulation. */
  private fillWaxLevel(targetRow: number, waxColor: string): void {
    clearFluid(this.fluidState);
    this.seedBed();
    const packed = hexColor(waxColor);
    for (let y = Math.max(0, targetRow); y < FLUID.bedRow; y += 1) {
      for (let x = 0; x < FLUID.width; x += 1) {
        setFluidCell(this.fluidState, x, y, FLUID_WAX, packed);
      }
    }
  }

  private addWaxCells(
    amount: number,
    surfaceRow: number,
    waxColor: string,
  ): void {
    const packed = hexColor(waxColor);
    let remaining = amount;
    const startRow = Math.max(0, Math.min(FLUID.bedRow - 1, surfaceRow));

    // Fill from the bottom up so the new wax raises a level instead of
    // building a tower in the middle of the pot. Inside each row the wax
    // starts at the center, which leaves a soft mound while it spreads.
    for (let y = FLUID.bedRow - 1; y >= startRow && remaining > 0; y -= 1) {
      for (let order = 0; order < FLUID.width && remaining > 0; order += 1) {
        const x = this.centerColumn(order);
        if (materialAt(this.fluidState, x, y) !== FLUID_EMPTY) continue;
        setFluidCell(this.fluidState, x, y, FLUID_WAX, packed);
        remaining -= 1;
      }
    }
  }

  private centerColumn(order: number): number {
    const center = Math.floor(FLUID.width / 2);
    const offset = Math.ceil(order / 2);
    const direction = order % 2 === 0 ? 1 : -1;
    return (center + direction * offset + FLUID.width) % FLUID.width;
  }

  private removeWaxCells(amount: number): void {
    let remaining = amount;
    for (let y = 0; y < FLUID.bedRow && remaining > 0; y += 1) {
      for (let x = 0; x < FLUID.width && remaining > 0; x += 1) {
        if (materialAt(this.fluidState, x, y) !== FLUID_WAX) continue;
        setFluidCell(this.fluidState, x, y, FLUID_EMPTY);
        remaining -= 1;
      }
    }
  }

  private paintWax(waxColor: string): void {
    const packed = hexColor(waxColor);
    for (let index = 0; index < this.fluidState.material.length; index += 1) {
      if (this.fluidState.material[index] === FLUID_WAX) {
        this.fluidState.color[index] = packed;
      }
    }
  }

  private stepFluidVisual(
    delta: number,
    heating: boolean,
    heatLevel: number,
  ): void {
    if (motion.reduced) {
      this.fluidAccumulator = 0;
      return;
    }
    if (motion.paused) return;

    const limit = FLUID.step * 2;
    this.fluidAccumulator = Math.min(limit, this.fluidAccumulator + delta);

    let steps = 0;
    while (this.fluidAccumulator >= FLUID.step && steps < 2) {
      stepFluid(this.fluidState, {
        heat: heating ? heatLevel * 0.002 : 0,
        flow: FLUID.flow,
      });
      this.fluidAccumulator -= FLUID.step;
      steps += 1;
    }
  }

  private waxSurfaceY(): number {
    for (let y = 0; y < FLUID.bedRow; y += 1) {
      for (let x = 0; x < FLUID.width; x += 1) {
        if (this.fluidState.material[y * FLUID.width + x] === FLUID_WAX) {
          return FLUID.y + y * FLUID.scale;
        }
      }
    }
    return FLUID.y + FLUID.bedRow * FLUID.scale;
  }

  private boardPieces(cutCuts: number, meltProgress: number): BoardPiece[] {
    const total = Math.min(MAX_PIECES, Math.max(1, cutCuts + 1));
    const pieceWidth = 126 / total;
    const pieceGap = total > 1 ? 3 : 0;

    return Array.from({ length: total }, (_, index) => {
      const rawDrop = this.pieceDrop(index, total, meltProgress);
      return {
        index,
        x: BOARD.x + 27 + index * pieceWidth,
        y: BOARD.y + 22 + (index % 2) * 3,
        width: Math.max(8, pieceWidth - pieceGap),
        height: 52 - index * 1.2,
        // With reduced motion the piece is either on the board or in the pot,
        // never halfway through the air.
        drop: motion.reduced ? (rawDrop < 0.5 ? 0 : 1) : rawDrop,
      };
    });
  }

  private pieceDrop(
    index: number,
    total: number,
    meltProgress: number,
  ): number {
    const start = 0.08 + (index / total) * 0.55;
    const span = Math.max(0.12, 0.6 / total + 0.04);
    return clamp((meltProgress - start) / span, 0, 1);
  }

  private drawCuttingBoard(
    pieces: BoardPiece[],
    cuts: number,
    waxColor: string,
  ): void {
    this.cuttingBoard.clear();
    const hasBoardPiece = pieces.some((piece) => piece.drop <= 0);
    this.cuttingBoard.visible =
      pieces.length > 0 && (hasBoardPiece || cuts < MAX_CUTS);
    if (!this.cuttingBoard.visible) return;

    this.cuttingBoard
      .ellipse(
        BOARD.x + BOARD.width / 2,
        BOARD.y + BOARD.height + 8,
        BOARD.width * 0.46,
        10,
      )
      .fill({ color: stageColors.shadow, alpha: 0.14 })
      .roundRect(BOARD.x, BOARD.y, BOARD.width, BOARD.height, 14)
      .fill(stageColors.woodLight)
      .stroke({ width: 3, color: stageColors.woodDark });

    for (const piece of pieces) {
      if (piece.drop > 0) continue;
      this.cuttingBoard
        .roundRect(piece.x, piece.y, piece.width, piece.height, 6)
        .fill(hexColor(waxColor))
        .stroke({ width: 1.5, color: stageColors.woodDark, alpha: 0.55 });
    }

    if (cuts < MAX_CUTS) {
      this.cuttingBoard
        .moveTo(BOARD.x + 118, BOARD.y - 12)
        .lineTo(BOARD.x + 166, BOARD.y + 12)
        .stroke({ width: 9, color: stageColors.woodDark, cap: "round" })
        .moveTo(BOARD.x + 118, BOARD.y - 12)
        .lineTo(BOARD.x + 154, BOARD.y + 10)
        .stroke({ width: 3, color: stageColors.white, alpha: 0.4 });
    }

    for (let index = 0; index < 4; index += 1) {
      this.cuttingBoard
        .circle(BOARD.x + 34 + index * 30, BOARD.y + 88, 5)
        .fill(
          index < cuts
            ? stageColors.sage
            : { color: stageColors.creamDeep, alpha: 0.9 },
        )
        .stroke({ width: 1, color: stageColors.border });
    }
  }

  private drawWaxChunks(
    pieces: BoardPiece[],
    waxColor: string,
    surfaceY: number,
  ): void {
    this.chunks.clear();
    if (pieces.length === 0) return;

    const packed = hexColor(waxColor);
    for (const piece of pieces) {
      if (piece.drop <= 0 || piece.drop >= 1) continue;

      const progress = piece.drop;
      const startX = piece.x + piece.width / 2;
      const startY = piece.y + piece.height / 2;
      const endX = POT_X - 58 + ((piece.index + 0.5) / pieces.length) * 116;
      const endY = surfaceY - 4;
      const x = mix(startX, endX, progress);
      const y =
        mix(startY, endY, progress * progress) -
        Math.sin(Math.PI * progress) * 34;
      const rotation = (piece.index % 2 === 0 ? 1 : -1) * progress * 1.1;

      this.drawChunk(
        x,
        y,
        Math.max(14, piece.width * 0.9),
        Math.max(10, piece.height * 0.55),
        rotation,
        packed,
      );
    }
  }

  private drawResidues(
    pieces: BoardPiece[],
    waxColor: string,
    surfaceY: number,
    inRange: boolean,
  ): void {
    if (pieces.length === 0) return;

    const dropped = pieces.filter((piece) => piece.drop >= 1).length;
    if (!inRange && dropped === 0) return;

    const packed = hexColor(waxColor);
    const residues = Math.min(3, inRange ? 3 : dropped);
    for (let index = 0; index < residues; index += 1) {
      const x = POT_X - 58 + index * 58;
      const width = 24 - index * 4;
      const y = surfaceY + 1 + (index % 2) * 2;

      this.chunks
        .roundRect(x - width / 2, y - 4, width, 8, 3)
        .fill(packed)
        .stroke({ width: 1.2, color: stageColors.woodDark, alpha: 0.45 })
        .moveTo(x - width / 2 + 3, y - 3)
        .lineTo(x + width / 2 - 3, y - 3)
        .stroke({ width: 1, color: stageColors.white, alpha: 0.25 });
    }
  }

  private drawSurface(waxColor: string, surfaceY: number): void {
    this.surface.clear();
    if (surfaceY >= FLUID.y + FLUID.bedRow * FLUID.scale) return;

    this.surface
      .ellipse(POT_X, surfaceY + 2, 150, 6)
      .stroke({ width: 1.6, color: 0xfff8ec, alpha: 0.28 })
      .ellipse(POT_X - 18, surfaceY, 84, 2.5)
      .fill({ color: stageColors.white, alpha: 0.14 })
      .ellipse(POT_X + 48, surfaceY + 1, 34, 2)
      .fill({ color: hexColor(waxColor), alpha: 0.3 });
  }

  private drawChunk(
    x: number,
    y: number,
    width: number,
    height: number,
    rotation: number,
    color: number,
  ): void {
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    const corners = [
      [-width / 2, -height / 2],
      [width / 2, -height / 2],
      [width / 2, height / 2],
      [-width / 2, height / 2],
    ].map(([px, py]) => ({
      x: x + px! * cos - py! * sin,
      y: y + px! * sin + py! * cos,
    }));

    this.chunks
      .poly(corners)
      .fill(color)
      .stroke({ width: 1.2, color: stageColors.woodDark, alpha: 0.38 })
      .moveTo(corners[0]!.x, corners[0]!.y)
      .lineTo(corners[1]!.x, corners[1]!.y)
      .stroke({ width: 1, color: stageColors.white, alpha: 0.3 });
  }

  private drawBubbles(inRange: boolean, surfaceY: number): void {
    this.bubbles.clear();
    if (!inRange || motion.reduced) return;

    const count = Math.min(5, motionBudget.maxParticles);
    for (let index = 0; index < count; index += 1) {
      const phase = (this.time * 0.34 + index * 0.19) % 1;
      const x =
        POT_X - 86 + index * 43 + Math.sin(this.time * 1.1 + index * 1.7) * 5;
      const y = surfaceY - 6 - phase * 46;
      const radius = 2.6 + phase * 2.8;

      this.bubbles
        .circle(x, y, radius)
        .stroke({
          width: 1.4,
          color: 0xfff6e8,
          alpha: 0.65 * (1 - phase),
        })
        .circle(x - 0.8, y - 0.8, radius * 0.35)
        .fill({ color: stageColors.white, alpha: 0.3 * (1 - phase) });
    }
  }

  private drawPot(
    game: GameState,
    heating: boolean,
    format: "block" | "flakes" | "gel",
    meltProgress: number,
    surfaceY: number,
  ): void {
    this.pot.clear();
    this.pot
      .ellipse(POT_X, 516, 190, 22)
      .fill({ color: stageColors.shadow, alpha: 0.14 })
      .roundRect(
        POT_X - MELT_POT.width / 2,
        POT_Y + MELT_POT.rimOffsetY,
        MELT_POT.width,
        MELT_POT.height,
        MELT_POT.radius,
      )
      .fill(hexColor("#6f8165"))
      .stroke({ width: 6, color: hexColor("#4f5f47") })
      .roundRect(POT_X - 210, POT_Y - 20, 50, 26, 13)
      .stroke({ width: 9, color: hexColor("#4f5f47") })
      .roundRect(POT_X + 160, POT_Y - 20, 50, 26, 13)
      .stroke({ width: 9, color: hexColor("#4f5f47") })
      .ellipse(POT_X, POT_Y - 40, 170, 38)
      .fill(hexColor("#46553f"))
      .stroke({ width: 5, color: hexColor("#4f5f47") })
      .ellipse(POT_X, POT_Y - 34, 152, 30)
      .fill({ color: stageColors.shadow, alpha: 0.2 })
      .ellipse(POT_X, POT_Y - 42, 160, 30)
      .stroke({ width: 2, color: stageColors.white, alpha: 0.12 });

    if (format === "flakes" && meltProgress < 0.95) {
      const alpha = 0.68 * (1 - meltProgress * 0.72);
      for (let index = 0; index < 7; index += 1) {
        const x = POT_X - 94 + (index % 4) * 52;
        const y = surfaceY - 1 - Math.floor(index / 4) * 6;
        this.pot.ellipse(x, y, 14, 5).fill({ color: stageColors.white, alpha });
      }
    } else if (format === "gel") {
      this.pot
        .ellipse(POT_X, surfaceY + 3, 148, 12)
        .fill({ color: stageColors.white, alpha: 0.22 });
    }

    if (game.craft.stearicAdded && meltProgress > 0.04) {
      for (let index = 0; index < 5; index += 1) {
        const x = POT_X - 60 + index * 30;
        const y = surfaceY - 2 - (index % 2) * 5;
        this.pot
          .circle(x, y, 2.5)
          .fill({ color: stageColors.white, alpha: 0.55 });
      }
    }

    if (heating) {
      this.pot
        .ellipse(POT_X, POT_Y + 154, 130, 20)
        .fill({ color: stageColors.accent, alpha: 0.34 })
        .ellipse(POT_X, POT_Y + 154, 78, 11)
        .fill({ color: 0xf6d36f, alpha: 0.7 });
    }
  }

  private drawBottles(waxColor: string, scentName: string): void {
    this.bottles.clear();
    this.bottles
      .roundRect(682, 186, 168, 104, 16)
      .fill({ color: stageColors.paper, alpha: 0.94 })
      .stroke({ width: 2, color: stageColors.border })
      .roundRect(704, 214, 34, 58, 8)
      .fill(hexColor(waxColor))
      .stroke({ width: 2, color: stageColors.woodDark })
      .roundRect(710, 202, 22, 14, 5)
      .fill(stageColors.woodDark)
      .roundRect(748, 224, 90, 28, 8)
      .fill(stageColors.sageSoft);
    this.aroma.text = `Aroma · ${scentName}`;
    this.aroma.position.set(758, 238);
    this.aroma.style.fontSize = 12;
    this.aroma.style.fontWeight = "700";
  }

  private drawStearicJar(game: GameState): void {
    this.stearicJar.clear();
    this.stearicJar.visible = game.needsStearic;
    this.stearicLabel.visible = game.needsStearic;
    this.stearicCheck.visible = game.needsStearic && game.craft.stearicAdded;
    if (!game.needsStearic) return;

    const added = game.craft.stearicAdded;
    this.stearicJar
      .roundRect(
        STEARIC.x - STEARIC_JAR.width / 2,
        STEARIC.y - STEARIC_JAR.height / 2,
        STEARIC_JAR.width,
        STEARIC_JAR.height,
        10,
      )
      .fill({ color: 0xe5efe8, alpha: added ? 0.55 : 0.92 })
      .stroke({ width: 2, color: stageColors.woodDark, alpha: 0.7 })
      .roundRect(STEARIC.x - 28, STEARIC.y - 44, 56, 16, 6)
      .fill(stageColors.woodDark)
      .roundRect(STEARIC.x - 16, STEARIC.y - 14, 32, 26, 4)
      .fill({ color: stageColors.paper, alpha: 0.85 });
  }

  private drawSteam(game: GameState, waxColor: string): void {
    this.steam.clear();
    const active = game.craft.heating || game.craft.temperature > game.meltMin;
    if (!active) return;

    const amount = game.craft.heating ? 4 : 2;
    for (let i = 0; i < amount; i += 1) {
      const phase = motion.reduced ? 0.45 : (this.time * 0.32 + i * 0.27) % 1;
      const x = POT_X - 70 + i * 46 + Math.sin(this.time * 1.8 + i) * 8;
      const y = POT_Y - 70 - phase * 150;
      this.steam
        .circle(x, y, 8 + phase * 14)
        .fill({ color: stageColors.white, alpha: 0.18 * (1 - phase) })
        .circle(x + 10, y - 14, 5 + phase * 8)
        .fill({ color: waxColor, alpha: 0.08 * (1 - phase) });
    }
  }

  private drawSpoon(waxColor: string): void {
    this.spoon.clear();
    const bowlX = POT_X + Math.cos(this.spoonAngle) * 96;
    const bowlY = POT_Y - 20 + Math.sin(this.spoonAngle) * 28;
    const pivotX = POT_X + 196;
    const pivotY = POT_Y - 198;

    this.spoon
      .moveTo(bowlX, bowlY)
      .lineTo(pivotX, pivotY)
      .stroke({ width: 11, color: hexColor("#b98963"), cap: "round" })
      .moveTo(bowlX, bowlY)
      .lineTo(pivotX, pivotY)
      .stroke({ width: 4, color: stageColors.white, alpha: 0.22 })
      .circle(pivotX, pivotY, 8)
      .fill(hexColor("#8f5f40"))
      .ellipse(bowlX, bowlY, 27, 15)
      .fill(hexColor("#b98963"))
      .stroke({ width: 3, color: hexColor("#8f5f40") })
      .ellipse(bowlX, bowlY - 2, 19, 9)
      .fill({ color: hexColor(waxColor), alpha: 0.8 });
  }

  private async loadStove(): Promise<void> {
    try {
      const texture = await Assets.load("/art/fogon-lateral-off.svg");
      this.stoveSprite.texture = texture;
      this.stoveSprite.visible = true;
    } catch (error) {
      console.error("No se pudo cargar el fogón", error);
    }
  }

  private drawStove(enabled: boolean): void {
    const body = MELT_STOVE.body;
    this.stove.clear();
    this.stove
      .roundRect(body.x, body.y, body.width, body.height, body.radius)
      .fill({ color: stageColors.paper, alpha: enabled ? 0.94 : 0.6 })
      .stroke({ width: 2, color: stageColors.border })
      .roundRect(body.x - 30, body.y + 30, 28, 10, 5)
      .fill({ color: stageColors.steel, alpha: 0.7 })
      .roundRect(body.x + body.width + 2, body.y + 30, 28, 10, 5)
      .fill({ color: stageColors.steel, alpha: 0.7 });
  }

  private drawKnob(enabled: boolean, level: number): void {
    const { x, y, radius } = MELT_STOVE.knob;
    const angle = -2.3 + clamp(level, 0, 1) * 4.6;
    this.knob.clear();
    this.knob
      .circle(x, y, radius)
      .fill({ color: stageColors.creamDeep, alpha: enabled ? 1 : 0.45 })
      .stroke({
        width: 3,
        color: stageColors.woodDark,
        alpha: enabled ? 1 : 0.4,
      })
      .circle(x, y, 22)
      .fill({ color: enabled ? stageColors.woodLight : stageColors.border })
      .stroke({ width: 2, color: stageColors.woodDark })
      .moveTo(x, y)
      .lineTo(x + Math.cos(angle) * 15, y + Math.sin(angle) * 15)
      .stroke({ width: 4, color: stageColors.ink, cap: "round" })
      .circle(x, y, 5)
      .fill({ color: stageColors.ink });
    this.knobPercent.text = `${Math.round(level * 100)} %`;
    this.knobPercent.style.fill = enabled ? stageColors.ink : stageColors.muted;
  }

  pointerDown(x: number, y: number, game: GameState): void {
    if (
      game.needsStearic &&
      Math.hypot(x - STEARIC.x, y - STEARIC.y) < STEARIC_JAR.hitRadius
    ) {
      game.addStearic();
      return;
    }

    if (
      game.needsCutting &&
      game.craft.cutCuts < MAX_CUTS &&
      x > BOARD.x - 10 &&
      x < BOARD.x + BOARD.width + 30 &&
      y > BOARD.y - 24 &&
      y < BOARD.y + BOARD.height + 24
    ) {
      this.cutting = true;
      this.cutStartX = x;
      this.cutStrokeDone = false;
      return;
    }

    const knob = MELT_STOVE.knob;
    if (game.canHeat && Math.hypot(x - knob.x, y - knob.y) < knob.hitRadius) {
      this.draggingKnob = true;
      this.knobStartY = y;
      this.knobStartLevel = game.craft.heatLevel;
      return;
    }

    if (
      game.canHeat &&
      Math.hypot(x - POT_X, y - (POT_Y - 30)) < MELT_POT.stirRadius
    ) {
      this.draggingSpoon = true;
      this.lastAngle = Math.atan2(y - POT_Y, x - POT_X);
      this.accumulated = 0;
    }
  }

  pointerMove(x: number, y: number, game: GameState): void {
    if (this.cutting) {
      if (!this.cutStrokeDone && x - this.cutStartX >= 70) {
        this.cutStrokeDone = true;
        game.cutWax();
      }
      return;
    }

    if (this.draggingKnob) {
      const level = clamp(
        this.knobStartLevel + (this.knobStartY - y) / 100,
        0,
        1,
      );
      game.setHeatLevel(level);
      return;
    }

    if (!this.draggingSpoon) return;
    const angle = Math.atan2(y - POT_Y, x - POT_X);
    let delta = angle - this.lastAngle;
    if (delta > Math.PI) delta -= Math.PI * 2;
    if (delta < -Math.PI) delta += Math.PI * 2;
    this.lastAngle = angle;
    this.accumulated += Math.abs(delta);
    this.spoonAngle = angle;
    if (this.accumulated >= Math.PI * 1.6) {
      this.accumulated -= Math.PI * 1.6;
      game.stir();
    }
  }

  pointerUp(_x: number, _y: number, _game: GameState): void {
    this.draggingSpoon = false;
    this.draggingKnob = false;
    this.cutting = false;
    this.cutStrokeDone = false;
  }

  keyDown(key: string, game: GameState): void {
    const normalized = key.toLowerCase();
    if (normalized === "c") {
      game.cutWax();
      return;
    }
    if (normalized === "e") {
      game.addStearic();
      return;
    }
    if (key === " ") {
      game.startHeating();
    } else if (key === "+" || key === "=") {
      game.setHeatLevel(game.craft.heatLevel + 0.1);
    } else if (key === "-" || key === "_") {
      game.setHeatLevel(game.craft.heatLevel - 0.1);
    } else if (key === "ArrowLeft" || key === "ArrowRight") {
      if (!game.stearicPrepared) return;
      const direction = key === "ArrowLeft" ? -1 : 1;
      this.spoonAngle += direction * 0.55;
      this.accumulated += 0.55;
      if (this.accumulated >= Math.PI * 1.6) {
        this.accumulated -= Math.PI * 1.6;
        game.stir();
      }
    }
  }

  keyUp(key: string, game: GameState): void {
    if (key === " ") game.stopHeating();
  }

  ariaLabel(game: GameState): string {
    if (!game.cutPrepared) {
      return "Estación de cera. La parafina está en bloque: arrastra el cuchillo de izquierda a derecha o pulsa C para cortarla.";
    }
    if (!game.stearicPrepared) {
      return "Estación de cera. Toca el frasco de ácido esteárico o pulsa E para agregarlo a la olla.";
    }
    return "Estación de cera. Los trozos cortados caen en la olla al calentar y el nivel de cera sube. Gira la perilla del fogón para regular el calor, o usa más y menos, y arrastra la cuchara en círculos para remover.";
  }

  destroy(): void {
    this.fluidRig.destroy();
    this.view.destroy({ children: true });
  }
}

function mix(from: number, to: number, amount: number): number {
  return from + (to - from) * clamp(amount, 0, 1);
}
