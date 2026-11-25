import { Assets, Container, Graphics, Sprite, Text } from "pixi.js";
import { MAX_CUTS } from "../../craft";
import { scentsById, waxesById } from "../../data";
import {
  FLUID_WAX,
  createFluidState,
  setFluidCell,
  stepFluid,
} from "../../fluid";
import type { GameState } from "../../game-state.svelte";
import { FluidRig } from "../fluid-rig";
import { motion } from "../motion";
import { clamp, hexColor, stageColors } from "../palette";
import type { StageScene } from "../scene";

const POT_X = 400;
const POT_Y = 360;
const BOARD = { x: 170, y: 226, width: 180, height: 96 };
const STEARIC = { x: 650, y: 344 };

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
  private fluidMask = new Graphics();
  private fluidState = createFluidState(48, 26, 17);
  private fluidRig: FluidRig;
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

    for (let y = 18; y < 26; y += 1) {
      for (let x = 3; x < 45; x += 1) {
        setFluidCell(this.fluidState, x, y, FLUID_WAX);
      }
    }
    this.fluidRig = new FluidRig(this.fluidState, { scale: 6.4 });
    this.fluidRig.sprite.position.set(242, 322);
    this.fluidMask.roundRect(240, 322, 324, 140, 28).fill(0xffffff);
    this.fluidRig.sprite.mask = this.fluidMask;

    this.knobLabel.anchor.set(0.5);
    this.knobLabel.position.set(742, 548);
    this.knobPercent.anchor.set(0.5);
    this.knobPercent.position.set(742, 564);

    this.view.addChild(
      this.background,
      this.cuttingBoard,
      this.stoveSprite,
      this.stove,
      this.pot,
      this.fluidRig.sprite,
      this.fluidMask,
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
    const packedColor = Number.parseInt(waxColor.replace("#", ""), 16);
    for (let index = 0; index < this.fluidState.material.length; index += 1) {
      if (this.fluidState.material[index] === FLUID_WAX) {
        this.fluidState.color[index] = packedColor;
      }
    }
    stepFluid(this.fluidState, { heat: heatLevel * 0.002 });
    this.fluidRig.update(this.fluidState);

    const inRange =
      game.craft.temperature >= game.meltMin &&
      game.craft.temperature <= game.meltMax;

    this.temperature.text = `${Math.round(game.craft.temperature)} °C`;
    this.temperature.style.fill = inRange
      ? stageColors.sage
      : game.craft.overheated
        ? stageColors.accent
        : stageColors.ink;

    this.status.text = !game.cutPrepared
      ? "Corta el bloque antes de calentar"
      : !game.stearicPrepared
        ? "Agrega el ácido esteárico"
        : game.craft.overheated
          ? "Se pasó de calor · retira la olla"
          : inRange
            ? "En rango · puedes seguir"
            : heating
              ? "Calentando despacio…"
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

    this.drawCuttingBoard(game, waxColor);
    this.drawStove(game.canHeat);
    this.drawPot(game, waxColor, heating, format);
    this.drawBottles(waxColor, scent?.nombre ?? "Sin aroma");
    this.drawStearicJar(game);
    this.drawSteam(game, waxColor);
    this.drawSpoon(waxColor);
    this.drawKnob(game.canHeat, heatLevel);
  }

  private drawCuttingBoard(game: GameState, waxColor: string): void {
    this.cuttingBoard.clear();
    this.cuttingBoard.visible =
      game.needsCutting && game.craft.cutCuts < MAX_CUTS;
    if (!this.cuttingBoard.visible) return;

    const cuts = game.craft.cutCuts;
    const pieces = Math.max(1, Math.min(5, cuts + 1));
    const pieceWidth = 126 / pieces;
    const pieceGap = pieces > 1 ? 3 : 0;

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

    for (let index = 0; index < pieces; index += 1) {
      const offset = index * 3;
      this.cuttingBoard
        .roundRect(
          BOARD.x + 27 + index * pieceWidth,
          BOARD.y + 22 + (index % 2) * 3,
          Math.max(8, pieceWidth - pieceGap),
          52 - offset * 0.4,
          6,
        )
        .fill(hexColor(waxColor))
        .stroke({ width: 1.5, color: stageColors.woodDark, alpha: 0.55 });
    }

    this.cuttingBoard
      .moveTo(BOARD.x + 118, BOARD.y - 12)
      .lineTo(BOARD.x + 166, BOARD.y + 12)
      .stroke({ width: 9, color: stageColors.woodDark, cap: "round" })
      .moveTo(BOARD.x + 118, BOARD.y - 12)
      .lineTo(BOARD.x + 154, BOARD.y + 10)
      .stroke({ width: 3, color: stageColors.white, alpha: 0.4 });

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
      .roundRect(STEARIC.x - 25, STEARIC.y - 34, 50, 68, 10)
      .fill({ color: 0xe5efe8, alpha: added ? 0.55 : 0.92 })
      .stroke({ width: 2, color: stageColors.woodDark, alpha: 0.7 })
      .roundRect(STEARIC.x - 28, STEARIC.y - 44, 56, 16, 6)
      .fill(stageColors.woodDark)
      .roundRect(STEARIC.x - 16, STEARIC.y - 14, 32, 26, 4)
      .fill({ color: stageColors.paper, alpha: 0.85 });
  }

  private drawPot(
    game: GameState,
    waxColor: string,
    heating: boolean,
    format: "block" | "flakes" | "gel",
  ): void {
    this.pot.clear();
    this.pot
      .ellipse(POT_X, 516, 190, 22)
      .fill({ color: stageColors.shadow, alpha: 0.14 })
      .roundRect(POT_X - 170, POT_Y - 40, 340, 180, 44)
      .fill(hexColor("#6f8165"))
      .stroke({ width: 6, color: hexColor("#4f5f47") })
      .roundRect(POT_X - 210, POT_Y - 20, 50, 26, 13)
      .stroke({ width: 9, color: hexColor("#4f5f47") })
      .roundRect(POT_X + 160, POT_Y - 20, 50, 26, 13)
      .stroke({ width: 9, color: hexColor("#4f5f47") })
      .ellipse(POT_X, POT_Y - 40, 170, 38)
      .fill(hexColor(waxColor))
      .stroke({ width: 5, color: hexColor("#4f5f47") })
      .ellipse(POT_X, POT_Y - 44, 168, 30)
      .fill({ color: stageColors.white, alpha: 0.16 });

    if (format === "block" && game.cutPrepared) {
      const pieces = Math.min(5, game.craft.cutCuts + 1);
      for (let index = 0; index < pieces; index += 1) {
        const x = POT_X - 90 + index * 40;
        const y = POT_Y - 46 + (index % 2) * 8;
        this.pot
          .roundRect(x, y, 30, 14, 4)
          .fill(hexColor(waxColor))
          .stroke({ width: 1, color: stageColors.woodDark, alpha: 0.35 });
      }
    } else if (format === "flakes") {
      for (let index = 0; index < 7; index += 1) {
        const x = POT_X - 94 + (index % 4) * 52;
        const y = POT_Y - 46 + Math.floor(index / 4) * 12;
        this.pot
          .ellipse(x, y, 14, 5)
          .fill({ color: stageColors.white, alpha: 0.32 });
      }
    } else if (format === "gel") {
      this.pot
        .ellipse(POT_X, POT_Y - 42, 148, 25)
        .fill({ color: stageColors.white, alpha: 0.22 });
    }

    if (game.craft.stearicAdded) {
      for (let index = 0; index < 5; index += 1) {
        this.pot
          .circle(POT_X - 60 + index * 30, POT_Y - 52 + (index % 2) * 8, 2.5)
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
    this.stove.clear();
    this.stove
      .roundRect(640, 470, 220, 86, 20)
      .fill({ color: stageColors.paper, alpha: enabled ? 0.94 : 0.6 })
      .stroke({ width: 2, color: stageColors.border })
      .roundRect(610, 500, 28, 10, 5)
      .fill({ color: stageColors.steel, alpha: 0.7 })
      .roundRect(862, 500, 28, 10, 5)
      .fill({ color: stageColors.steel, alpha: 0.7 });
  }

  private drawKnob(enabled: boolean, level: number): void {
    const x = 742;
    const y = 510;
    const angle = -2.3 + clamp(level, 0, 1) * 4.6;
    this.knob.clear();
    this.knob
      .circle(x, y, 31)
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
    if (game.needsStearic && Math.hypot(x - STEARIC.x, y - STEARIC.y) < 48) {
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

    if (game.canHeat && Math.hypot(x - 742, y - 510) < 48) {
      this.draggingKnob = true;
      this.knobStartY = y;
      this.knobStartLevel = game.craft.heatLevel;
      return;
    }

    if (game.canHeat && Math.hypot(x - POT_X, y - (POT_Y - 30)) < 190) {
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
    return "Estación de cera. Gira la perilla del fogón para regular el calor, o usa más y menos, y arrastra la cuchara en círculos para remover.";
  }

  destroy(): void {
    this.fluidRig.destroy();
    this.view.destroy({ children: true });
  }
}
