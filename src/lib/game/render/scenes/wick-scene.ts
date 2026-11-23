import { Container, Graphics, Text } from "pixi.js";
import { vesselMaterialStroke, vesselsById } from "../../data";
import type { GameState } from "../../game-state.svelte";
import { clamp, hexColor, stageColors } from "../palette";
import type { StageScene } from "../scene";

const CENTER_X = 500;
const CENTER_Y = 340;
const RADIUS = 170;

export class WickScene implements StageScene {
  view = new Container();
  private board = new Graphics();
  private dish = new Graphics();
  private guide = new Graphics();
  private wick = new Graphics();
  private name = new Text({
    text: "",
    style: {
      fontFamily: "Fraunces Variable, Georgia, serif",
      fontSize: 26,
      fontWeight: "600",
      fill: stageColors.ink,
    },
  });
  private detail = new Text({
    text: "Arrastra la mecha al centro",
    style: {
      fontFamily: "Manrope Variable, sans-serif",
      fontSize: 15,
      fontWeight: "700",
      fill: stageColors.muted,
    },
  });
  private dragging = false;

  constructor() {
    this.board
      .roundRect(180, 54, 640, 520, 30)
      .fill({ color: stageColors.paper, alpha: 0.86 })
      .stroke({ width: 2, color: stageColors.border });

    this.name.anchor.set(0.5);
    this.name.position.set(CENTER_X, 572);
    this.detail.anchor.set(0.5);
    this.detail.position.set(CENTER_X, 600);

    this.view.addChild(
      this.board,
      this.dish,
      this.guide,
      this.wick,
      this.name,
      this.detail,
    );
  }

  update(game: GameState): void {
    const vessel = game.design.vesselId
      ? vesselsById[game.design.vesselId]
      : null;
    const glass = vessel ? vessel.glass : "#f4ead9";
    const stroke = vessel
      ? hexColor(vesselMaterialStroke[vessel.material])
      : hexColor("#6f5541");

    this.name.text = vessel
      ? vessel.nombre
      : game.design.moldId
        ? "Molde"
        : "Pieza";
    this.detail.text = game.craft.wick.placed
      ? "Mecha colocada · toca para ajustar y suelta para confirmar"
      : "Arrastra la mecha al centro y suelta";

    this.dish.clear();
    this.dish
      .ellipse(CENTER_X, CENTER_Y + 18, RADIUS + 26, 24)
      .fill({ color: stageColors.shadow, alpha: 0.1 })
      .circle(CENTER_X, CENTER_Y, RADIUS)
      .fill({ color: hexColor(glass), alpha: 0.42 })
      .stroke({ width: 4, color: stroke })
      .circle(CENTER_X, CENTER_Y, RADIUS - 12)
      .stroke({ width: 1.5, color: stageColors.white, alpha: 0.5 });

    this.guide.clear();
    if (game.craft.wick.placed) {
      this.guide
        .roundRect(CENTER_X - 150, CENTER_Y - RADIUS - 14, 300, 14, 7)
        .fill({ color: stageColors.woodLight, alpha: 0.95 })
        .stroke({ width: 2, color: stageColors.woodDark });
    }
    this.guide
      .circle(CENTER_X, CENTER_Y, 22)
      .stroke({ width: 2.5, color: stageColors.accent, alpha: 0.6 })
      .moveTo(CENTER_X - RADIUS + 30, CENTER_Y)
      .lineTo(CENTER_X + RADIUS - 30, CENTER_Y)
      .stroke({ width: 1, color: stageColors.accent, alpha: 0.3 })
      .moveTo(CENTER_X, CENTER_Y - RADIUS + 30)
      .lineTo(CENTER_X, CENTER_Y + RADIUS - 30)
      .stroke({ width: 1, color: stageColors.accent, alpha: 0.3 });

    const x = CENTER_X + (game.craft.wick.x / 30) * (RADIUS - 30);
    const y = CENTER_Y + (game.craft.wick.y / 30) * (RADIUS - 30);
    this.wick.clear();
    this.wick
      .circle(x, y, 18)
      .fill({ color: stageColors.steel, alpha: 0.95 })
      .stroke({ width: 2, color: stageColors.steelDark })
      .circle(x, y, game.craft.wick.placed ? 12 : 14)
      .fill(game.craft.wick.placed ? stageColors.sage : hexColor("#6f5541"))
      .stroke({
        width: 3,
        color: game.craft.wick.placed ? stageColors.sageSoft : stageColors.ink,
      })
      .circle(x, y, 5)
      .fill({ color: stageColors.ink, alpha: 0.65 });
  }

  pointerDown(x: number, y: number): void {
    if (Math.hypot(x - CENTER_X, y - CENTER_Y) <= RADIUS) {
      this.dragging = true;
    }
  }

  pointerMove(x: number, y: number, game: GameState): void {
    if (!this.dragging) return;
    const nx = clamp((x - CENTER_X) / (RADIUS - 30), -1, 1);
    const ny = clamp((y - CENTER_Y) / (RADIUS - 30), -1, 1);
    game.setWickPosition(nx * 30, ny * 30);
  }

  pointerUp(_x: number, _y: number, game: GameState): void {
    if (!this.dragging) return;
    this.dragging = false;
    game.placeWick();
  }

  keyDown(key: string, game: GameState): void {
    const step = 4;
    if (key === "ArrowLeft") game.moveWick(-step, 0);
    if (key === "ArrowRight") game.moveWick(step, 0);
    if (key === "ArrowUp") game.moveWick(0, -step);
    if (key === "ArrowDown") game.moveWick(0, step);
    if (key === "Enter" || key === " ") game.placeWick();
  }

  ariaLabel(): string {
    return "Vista superior de la vela. Arrastra la mecha al centro con el puntero o las flechas y pulsa Enter para colocarla.";
  }

  destroy(): void {
    this.view.destroy({ children: true });
  }
}
