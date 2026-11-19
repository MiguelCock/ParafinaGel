import { Container, Graphics, Text } from "pixi.js";
import {
  inclusionsById,
  orderTypeLabels,
  waxColorsById,
  waxesById,
} from "../../data";
import { layerSummary } from "../../design";
import type { GameState } from "../../game-state.svelte";
import { CandleRig } from "../candle-rig";
import { hexColor, stageColors } from "../palette";
import type { StageScene } from "../scene";

export class DesignScene implements StageScene {
  view = new Container();
  private board = new Graphics();
  private palette = new Graphics();
  private candle = new CandleRig();
  private stamp = new Text({
    text: "",
    style: {
      fontFamily: "Manrope Variable, sans-serif",
      fontSize: 16,
      fontWeight: "800",
      fill: stageColors.accent,
      letterSpacing: 1.6,
    },
  });
  private title = new Text({
    text: "",
    style: {
      fontFamily: "Fraunces Variable, Georgia, serif",
      fontSize: 30,
      fontWeight: "600",
      fill: stageColors.ink,
    },
  });
  private detail = new Text({
    text: "",
    style: {
      fontFamily: "Manrope Variable, sans-serif",
      fontSize: 17,
      fill: stageColors.muted,
      wordWrap: true,
      wordWrapWidth: 480,
      align: "center",
    },
  });

  constructor() {
    this.board
      .roundRect(170, 58, 660, 508, 30)
      .fill({ color: stageColors.paper, alpha: 0.86 })
      .stroke({ width: 2, color: stageColors.border, alpha: 0.9 });
    this.board
      .roundRect(190, 80, 620, 464, 22)
      .stroke({ width: 1.5, color: stageColors.border, alpha: 0.6 });

    this.stamp.anchor.set(0, 0);
    this.stamp.position.set(214, 88);
    this.title.anchor.set(0.5, 0);
    this.title.position.set(500, 92);
    this.detail.anchor.set(0.5, 0);
    this.detail.position.set(500, 520);

    this.candle.position.set(500, 315);
    this.candle.scale.set(0.9);

    this.view.addChild(
      this.board,
      this.palette,
      this.stamp,
      this.title,
      this.candle,
      this.detail,
    );
  }

  update(game: GameState): void {
    const wax = game.design.waxId ? waxesById[game.design.waxId] : null;
    const size = game.design.sizeId === "180" ? "180 g" : "250 g";
    const mode = orderTypeLabels[game.design.mode].toUpperCase();

    this.stamp.text = `${mode} · ${size}`;
    this.title.text = wax ? wax.nombre : "Elige una cera";

    const detail =
      game.design.mode === "gel"
        ? game.design.inclusions
            .map((id) => inclusionsById[id]?.nombre)
            .filter(Boolean)
            .join(" · ") || "Sin montajes"
        : layerSummary(game.design);
    this.detail.text = detail;

    this.palette.clear();
    const colors =
      game.design.mode === "gel"
        ? game.design.inclusions
            .map((id) => inclusionsById[id]?.color)
            .filter((color): color is string => Boolean(color))
        : game.design.mode === "figura"
          ? Object.values(game.design.figureColors)
              .map((id) => waxColorsById[id]?.hex)
              .filter((color): color is string => Boolean(color))
          : game.design.layers
              .map((layer) => waxColorsById[layer.colorId]?.hex)
              .filter((color): color is string => Boolean(color));

    const start = 500 - (Math.min(colors.length, 5) * 22) / 2 + 11;
    if (colors.length > 1) {
      colors.slice(0, 5).forEach((color, index) => {
        this.palette
          .circle(start + index * 22, 492, 7)
          .fill(hexColor(color))
          .stroke({ width: 1.5, color: stageColors.border });
      });
    }

    this.candle.update(game, {
      showWick: true,
      showLabel: true,
      showFlame: false,
    });
  }

  ariaLabel(game: GameState): string {
    return `Vista previa del diseño ${orderTypeLabels[game.design.mode]}. Arrastra los materiales en el panel.`;
  }

  destroy(): void {
    this.view.destroy({ children: true });
  }
}
