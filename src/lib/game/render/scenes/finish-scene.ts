import { Container, Graphics, Text } from "pixi.js";
import type { GameState } from "../../game-state.svelte";
import { CandleRig } from "../candle-rig";
import { motion } from "../motion";
import { clamp, stageColors } from "../palette";
import type { StageScene } from "../scene";

const JAR_X = 360;
const JAR_Y = 360;
const LABEL_BASE_Y = 66;
const LABEL_W = 100;
const LABEL_H = 48;

type Tool = "label" | "lid" | "wrap";

export class FinishScene implements StageScene {
  view = new Container();
  private board = new Graphics();
  private guides = new Graphics();
  private candle = new CandleRig();
  private tools = new Graphics();
  private labelHandle = new Graphics();
  private status = new Text({
    text: "",
    style: {
      fontFamily: "Manrope Variable, sans-serif",
      fontSize: 15,
      fontWeight: "700",
      fill: stageColors.muted,
    },
  });
  private help = new Text({
    text: "",
    style: {
      fontFamily: "Manrope Variable, sans-serif",
      fontSize: 14,
      fill: stageColors.muted,
      wordWrap: true,
      wordWrapWidth: 520,
      align: "center",
    },
  });
  private lidLabel = new Text({
    text: "Tapa",
    style: {
      fontFamily: "Manrope Variable, sans-serif",
      fontSize: 14,
      fontWeight: "800",
      fill: stageColors.muted,
    },
  });
  private packLabel = new Text({
    text: "Empaque",
    style: {
      fontFamily: "Manrope Variable, sans-serif",
      fontSize: 14,
      fontWeight: "800",
      fill: stageColors.muted,
    },
  });

  private activeTool: Tool = "label";
  private movingLabel = false;
  private rotatingLabel = false;
  private time = 0;

  constructor() {
    this.board
      .roundRect(110, 54, 780, 514, 30)
      .fill({ color: stageColors.paper, alpha: 0.85 })
      .stroke({ width: 2, color: stageColors.border });

    this.candle.position.set(JAR_X, JAR_Y);
    this.candle.scale.set(1);

    this.status.anchor.set(0.5);
    this.status.position.set(500, 590);
    this.help.anchor.set(0.5, 1);
    this.help.position.set(500, 560);
    this.help.visible = false;
    this.lidLabel.anchor.set(0.5);
    this.lidLabel.position.set(750, 276);
    this.packLabel.anchor.set(0.5);
    this.packLabel.position.set(750, 460);

    this.tools.position.set(0, 0);
    this.view.addChild(
      this.board,
      this.guides,
      this.candle,
      this.tools,
      this.labelHandle,
      this.lidLabel,
      this.packLabel,
      this.status,
      this.help,
    );
  }

  update(game: GameState, delta: number): void {
    if (!motion.paused) this.time += delta;
    const finished = game.phase === "score";

    this.candle.update(game, {
      showWick: true,
      showLabel: Boolean(game.design.labelId),
      showFlame: finished,
      time: this.time,
    });

    this.help.text = finished
      ? "La vela quedó terminada. Revisa la receta y pide tus insumos."
      : "Arrastra la etiqueta y usa el tirador para girarla · toca la tapa y el empaque";
    this.status.text = finished
      ? "Vela terminada"
      : game.canFinish
        ? "Lista para entregar"
        : "Completa etiqueta, tapa y empaque";

    this.drawGuide(game, finished);
    this.drawTools(game, finished);
    this.drawLabelHandle(game);
  }

  private drawGuide(game: GameState, finished: boolean): void {
    this.guides.clear();
    if (finished) return;

    const placed = game.craft.label.placed;
    if (!placed) {
      const baseY = this.labelBaseY(game);
      this.drawDashedRect(
        360 - LABEL_W / 2,
        360 + baseY - LABEL_H / 2,
        LABEL_W,
        LABEL_H,
      );
    }
  }

  private drawDashedRect(
    x: number,
    y: number,
    width: number,
    height: number,
  ): void {
    const dash = 8;
    for (let i = 0; i < width; i += dash * 2) {
      this.guides
        .moveTo(x + i, y)
        .lineTo(x + Math.min(width, i + dash), y)
        .moveTo(x + i, y + height)
        .lineTo(x + Math.min(width, i + dash), y + height);
    }
    for (let i = 0; i < height; i += dash * 2) {
      this.guides
        .moveTo(x, y + i)
        .lineTo(x, y + Math.min(height, i + dash))
        .moveTo(x + width, y + i)
        .lineTo(x + width, y + Math.min(height, i + dash));
    }
    this.guides.stroke({ width: 1.5, color: stageColors.accent, alpha: 0.5 });
  }

  private drawTools(game: GameState, finished: boolean): void {
    this.tools.clear();
    this.lidLabel.visible = !finished;
    this.packLabel.visible = !finished;
    if (finished) return;

    const lidOn = game.craft.lidOn;
    const wrapped = game.craft.wrapped;

    this.tools
      .roundRect(640, 140, 220, 150, 18)
      .fill({ color: stageColors.paper, alpha: 0.88 })
      .stroke({
        width: 2,
        color: lidOn ? stageColors.sage : stageColors.border,
      });
    this.tools
      .roundRect(664, 190, 172, 26, 12)
      .fill(lidOn ? stageColors.sage : stageColors.woodLight)
      .stroke({ width: 2, color: stageColors.woodDark });
    this.tools
      .roundRect(712, 170, 76, 24, 10)
      .fill(lidOn ? stageColors.sageSoft : stageColors.paper)
      .stroke({ width: 2, color: stageColors.woodDark });

    this.tools
      .roundRect(640, 324, 220, 150, 18)
      .fill({ color: stageColors.paper, alpha: 0.88 })
      .stroke({
        width: 2,
        color: wrapped ? stageColors.sage : stageColors.border,
      });
    this.tools
      .roundRect(676, 360, 148, 86, 8)
      .fill(wrapped ? stageColors.sageSoft : stageColors.creamDeep)
      .stroke({ width: 2, color: stageColors.woodDark });
    this.tools
      .rect(742, 360, 16, 86)
      .fill(stageColors.accent)
      .rect(676, 396, 148, 14)
      .fill(stageColors.accent);
  }
  private drawLabelHandle(game: GameState): void {
    this.labelHandle.clear();
    if (game.phase === "score") return;
    const center = this.labelCenter(game);
    const angle = (game.craft.label.rotation * Math.PI) / 180;
    const hx = center.x + Math.cos(angle) * 54 - Math.sin(angle) * -24;
    const hy = center.y + Math.sin(angle) * 54 + Math.cos(angle) * -24;
    this.labelHandle
      .circle(hx, hy, 10)
      .fill(stageColors.paper)
      .stroke({ width: 2, color: stageColors.accent })
      .circle(hx, hy, 3)
      .fill(stageColors.accent);
  }

  private labelCenter(game: GameState): { x: number; y: number } {
    return {
      x: JAR_X + clamp(game.craft.label.x, -14, 14) * 3,
      y: JAR_Y + this.labelBaseY(game) + clamp(game.craft.label.y, -10, 10) * 3,
    };
  }

  private labelBaseY(game: GameState): number {
    return game.design.mode === "figura" ? 118 : LABEL_BASE_Y;
  }

  private handlePosition(game: GameState): { x: number; y: number } {
    const center = this.labelCenter(game);
    const angle = (game.craft.label.rotation * Math.PI) / 180;
    return {
      x: center.x + Math.cos(angle) * 54 - Math.sin(angle) * -24,
      y: center.y + Math.sin(angle) * 54 + Math.cos(angle) * -24,
    };
  }

  pointerDown(x: number, y: number, game: GameState): void {
    if (game.phase === "score") return;

    const handle = this.handlePosition(game);
    if (Math.hypot(x - handle.x, y - handle.y) < 22) {
      this.activeTool = "label";
      this.rotatingLabel = true;
      return;
    }

    if (this.insideLabel(x, y, game)) {
      this.activeTool = "label";
      this.movingLabel = true;
      return;
    }

    if (x > 630 && x < 870 && y > 130 && y < 300) {
      game.addLid();
    } else if (x > 630 && x < 870 && y > 315 && y < 490) {
      game.wrap();
    }
  }

  pointerMove(x: number, y: number, game: GameState): void {
    if (this.movingLabel) {
      game.setLabelX(clamp((x - JAR_X) / 3, -14, 14));
      game.setLabelY(clamp((y - JAR_Y - LABEL_BASE_Y) / 3, -10, 10));
    } else if (this.rotatingLabel) {
      const center = this.labelCenter(game);
      const angle = Math.atan2(y - center.y, x - center.x);
      const rotation = (angle * 180) / Math.PI + 24.6;
      game.setLabelRotation(clamp(rotation, -20, 20));
    }
  }

  pointerUp(_x: number, _y: number, game: GameState): void {
    if (this.movingLabel || this.rotatingLabel) {
      game.placeLabel();
    }
    this.movingLabel = false;
    this.rotatingLabel = false;
  }

  private insideLabel(x: number, y: number, game: GameState): boolean {
    const center = this.labelCenter(game);
    const angle = (-game.craft.label.rotation * Math.PI) / 180;
    const dx = x - center.x;
    const dy = y - center.y;
    const lx = dx * Math.cos(angle) - dy * Math.sin(angle);
    const ly = dx * Math.sin(angle) + dy * Math.cos(angle);
    return Math.abs(lx) < LABEL_W / 2 && Math.abs(ly) < LABEL_H / 2;
  }

  keyDown(key: string, game: GameState, shift: boolean): void {
    if (game.phase === "score") return;

    if (key === "1") {
      this.activeTool = "label";
      return;
    }
    if (key === "2") {
      this.activeTool = "lid";
      game.addLid();
      return;
    }
    if (key === "3") {
      this.activeTool = "wrap";
      game.wrap();
      return;
    }

    if (this.activeTool !== "label") return;
    if (key === "ArrowLeft") {
      if (shift) game.setLabelRotation(game.craft.label.rotation - 1);
      else game.setLabelX(game.craft.label.x - 1);
    }
    if (key === "ArrowRight") {
      if (shift) game.setLabelRotation(game.craft.label.rotation + 1);
      else game.setLabelX(game.craft.label.x + 1);
    }
    if (key === "ArrowUp") game.setLabelY(game.craft.label.y - 1);
    if (key === "ArrowDown") game.setLabelY(game.craft.label.y + 1);
    if (key === "Enter" || key === " ") game.placeLabel();
  }

  ariaLabel(): string {
    return "Acabado. Arrastra la etiqueta para moverla y usa el tirador para girarla. Toca la tapa y el empaque. Con teclado: 1 etiqueta, 2 tapa, 3 empaque.";
  }

  destroy(): void {
    this.view.destroy({ children: true });
  }
}
