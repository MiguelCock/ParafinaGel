import { Container, Graphics, Text } from "pixi.js";
import { waxesById } from "../../data";
import type { GameState } from "../../game-state.svelte";
import { motion } from "../motion";
import { hexColor, mixHex, stageColors } from "../palette";
import type { StageScene } from "../scene";

const CARD_WIDTH = 340;
const CARD_HEIGHT = 190;

const POSITIONS: Record<number, { x: number; y: number }[]> = {
  1: [{ x: 500, y: 330 }],
  2: [
    { x: 300, y: 330 },
    { x: 700, y: 330 },
  ],
  3: [
    { x: 300, y: 270 },
    { x: 700, y: 270 },
    { x: 500, y: 480 },
  ],
  4: [
    { x: 300, y: 255 },
    { x: 700, y: 255 },
    { x: 300, y: 465 },
    { x: 700, y: 465 },
  ],
};

export class MixScene implements StageScene {
  view = new Container();
  private background = new Graphics();
  private burners = new Graphics();
  private spoon = new Graphics();
  private labels: Text[] = [];
  private temperatures: Text[] = [];
  private states: Text[] = [];

  private time = 0;
  private stirring = false;
  private stirIndex = 0;
  private lastAngle = 0;
  private accumulated = 0;
  private spoonAngle = -0.8;
  private heatingIndex: number | null = null;
  private aromaIndex: number | null = null;

  constructor() {
    this.background
      .roundRect(120, 64, 760, 500, 30)
      .fill({ color: stageColors.paper, alpha: 0.86 })
      .stroke({ width: 2, color: stageColors.border });

    for (let index = 0; index < 4; index += 1) {
      const label = new Text({
        text: "",
        style: {
          fontFamily: "Manrope Variable, sans-serif",
          fontSize: 14,
          fontWeight: "800",
          fill: stageColors.ink,
        },
      });
      label.anchor.set(0.5);
      this.labels.push(label);

      const temperature = new Text({
        text: "",
        style: {
          fontFamily: "Manrope Variable, sans-serif",
          fontSize: 12,
          fontWeight: "700",
          fill: stageColors.muted,
        },
      });
      temperature.anchor.set(0.5);
      this.temperatures.push(temperature);

      const state = new Text({
        text: "",
        style: {
          fontFamily: "Manrope Variable, sans-serif",
          fontSize: 11,
          fontWeight: "800",
          fill: stageColors.muted,
        },
      });
      state.anchor.set(0.5);
      this.states.push(state);
    }

    this.view.addChild(
      this.background,
      this.burners,
      this.spoon,
      ...this.labels,
      ...this.temperatures,
      ...this.states,
    );
  }

  update(game: GameState, delta: number): void {
    if (!motion.paused) this.time += delta;
    const wax = game.design.waxId ? waxesById[game.design.waxId] : null;
    const natural = wax?.hex ?? "#efe2cf";
    const layout = POSITIONS[game.craft.units.length] ?? POSITIONS[1];
    const waxMin = wax?.meltMin ?? 60;
    const waxMax = wax?.meltMax ?? 70;

    this.burners.clear();
    this.spoon.clear();

    game.craft.units.forEach((unit, index) => {
      const position = layout[index];
      if (!position) return;
      const active = index === game.mixIndex;
      const inRange = unit.temperature >= waxMin && unit.temperature <= waxMax;
      const ready = unit.colorDrops > 0 && unit.aromaMl > 0 && unit.mix > 0;
      const mixedColor =
        unit.colorDrops > 0 && unit.colorId !== "gel"
          ? mixHex(natural, unit.colorHex, 0.25 + unit.mix * 0.75)
          : natural;

      this.drawBurner(
        unit.colorHex,
        mixedColor,
        position.x,
        position.y,
        active,
        unit.heating,
        inRange,
        ready,
        unit.colorDrops,
        unit.aromaMl,
      );

      const label = this.labels[index];
      const temperature = this.temperatures[index];
      const state = this.states[index];
      if (!label || !temperature || !state) return;

      label.text = unit.label;
      label.position.set(position.x, position.y + 68);
      temperature.text = `${Math.round(unit.temperature)} °C`;
      temperature.position.set(position.x, position.y + 84);
      temperature.style.fill = inRange ? stageColors.sage : stageColors.accent;
      state.text = !inRange
        ? "CALIENTA"
        : unit.colorDrops <= 0
          ? "FALTA COLOR"
          : unit.aromaMl <= 0
            ? "FALTA AROMA"
            : unit.mix <= 0
              ? "REVUELVE"
              : "LISTO";
      state.position.set(position.x, position.y - 78);
      state.style.fill = ready ? stageColors.sage : stageColors.muted;
    });

    this.drawSpoon(game, layout);
  }

  private drawBurner(
    colorHex: string,
    mixedColor: string,
    x: number,
    y: number,
    active: boolean,
    heating: boolean,
    inRange: boolean,
    ready: boolean,
    colorDrops: number,
    aromaMl: number,
  ): void {
    const g = this.burners;
    g.roundRect(
      x - CARD_WIDTH / 2,
      y - CARD_HEIGHT / 2,
      CARD_WIDTH,
      CARD_HEIGHT,
      24,
    )
      .fill({ color: stageColors.paper, alpha: 0.92 })
      .stroke({
        width: active ? 3 : 1.5,
        color: active
          ? stageColors.accent
          : ready
            ? stageColors.sage
            : stageColors.border,
      });

    if (active) {
      g.roundRect(
        x - CARD_WIDTH / 2 - 5,
        y - CARD_HEIGHT / 2 - 5,
        CARD_WIDTH + 10,
        CARD_HEIGHT + 10,
        28,
      ).stroke({ width: 2, color: stageColors.accent, alpha: 0.35 });
    }

    // Flame or ember under the pot.
    const flame = heating
      ? 8 + Math.sin(this.time * 9 + x) * (motion.reduced ? 0 : 3)
      : 3;
    g.ellipse(x, y + 43, 80, 18).fill({
      color: stageColors.shadow,
      alpha: 0.13,
    });
    g.ellipse(x, y + 39, 48, 8).fill({
      color: heating ? stageColors.accent : stageColors.creamDeep,
      alpha: heating ? 0.5 : 0.65,
    });
    if (heating) {
      g.ellipse(x - 22, y + 35 - flame, 10, flame)
        .fill({ color: 0xf6d36f, alpha: 0.75 })
        .ellipse(x + 22, y + 35 - flame * 0.8, 9, flame * 0.85)
        .fill({ color: stageColors.accent, alpha: 0.55 });
    }

    // Pot.
    g.roundRect(x - 76, y - 22, 152, 66, 24)
      .fill(hexColor("#6f8165"))
      .stroke({ width: 5, color: hexColor("#4f5f47") })
      .roundRect(x - 92, y - 1, 22, 16, 8)
      .stroke({ width: 6, color: hexColor("#4f5f47") })
      .roundRect(x + 70, y - 1, 22, 16, 8)
      .stroke({ width: 6, color: hexColor("#4f5f47") })
      .ellipse(x, y - 22, 76, 17)
      .fill(hexColor(mixedColor))
      .stroke({ width: 4, color: hexColor("#4f5f47") })
      .ellipse(x, y - 25, 72, 12)
      .fill({ color: stageColors.white, alpha: 0.18 });

    // Heat lever.
    const leverX = x + 112;
    const knobY = heating ? y + 18 : y - 12;
    g.roundRect(leverX - 15, y - 42, 30, 78, 15)
      .fill({ color: stageColors.creamDeep, alpha: 0.9 })
      .stroke({ width: 2, color: stageColors.border })
      .roundRect(leverX - 18, knobY, 36, 32, 12)
      .fill(heating ? stageColors.accent : stageColors.woodLight)
      .stroke({ width: 2, color: stageColors.woodDark })
      .circle(leverX, knobY + 16, 5)
      .fill({ color: stageColors.white, alpha: 0.7 });

    // Color bottle.
    g.roundRect(x - 137, y + 8, 28, 42, 7)
      .fill(hexColor(colorHex))
      .stroke({ width: 2, color: stageColors.woodDark })
      .roundRect(x - 142, y - 1, 38, 12, 5)
      .fill(stageColors.woodDark);

    // Aroma bottle with a liquid level.
    const aromaLevel = Math.min(1, Math.max(0, aromaMl / 12));
    g.roundRect(x - 99, y + 8, 28, 42, 7)
      .fill({ color: 0xe5efe8, alpha: 0.92 })
      .stroke({ width: 2, color: stageColors.woodDark })
      .roundRect(x - 104, y - 1, 38, 12, 5)
      .fill(stageColors.woodDark)
      .roundRect(x - 94, y + 44 - 32 * aromaLevel, 18, 32 * aromaLevel, 4)
      .fill({ color: stageColors.sage, alpha: 0.55 });

    // Tiny pips for the color drops.
    const pips = Math.min(8, colorDrops);
    for (let index = 0; index < 8; index += 1) {
      g.circle(
        x - 126 + (index % 4) * 9,
        y + 54 + Math.floor(index / 4) * 7,
        2.4,
      ).fill(
        index < pips
          ? stageColors.accent
          : { color: stageColors.creamDeep, alpha: 0.8 },
      );
    }

    // Steam when the pot is in the working range.
    if (inRange) {
      for (let index = 0; index < 2; index += 1) {
        const phase = motion.reduced
          ? 0.45
          : (this.time * 0.4 + index * 0.33) % 1;
        g.circle(
          x - 18 + index * 36 + Math.sin(this.time + index) * 5,
          y - 42 - phase * 28,
          4 + phase * 7,
        ).fill({ color: stageColors.white, alpha: 0.22 * (1 - phase) });
      }
    }
  }

  private drawSpoon(game: GameState, layout: { x: number; y: number }[]): void {
    const position = layout[game.mixIndex];
    if (!position) return;
    const bowlX = position.x + Math.cos(this.spoonAngle) * 42;
    const bowlY = position.y - 24 + Math.sin(this.spoonAngle) * 20;
    const pivotX = position.x + 65;
    const pivotY = position.y - 118;

    this.spoon
      .moveTo(bowlX, bowlY)
      .lineTo(pivotX, pivotY)
      .stroke({ width: 9, color: hexColor("#b98963"), cap: "round" })
      .moveTo(bowlX, bowlY)
      .lineTo(pivotX, pivotY)
      .stroke({ width: 3, color: stageColors.white, alpha: 0.22 })
      .circle(pivotX, pivotY, 6)
      .fill(hexColor("#8f5f40"))
      .ellipse(bowlX, bowlY, 18, 10)
      .fill(hexColor("#b98963"))
      .stroke({ width: 2, color: hexColor("#8f5f40") });
  }

  pointerDown(x: number, y: number, game: GameState): void {
    const layout = POSITIONS[game.craft.units.length] ?? POSITIONS[1];
    const index = layout.findIndex(
      (position) =>
        Math.abs(x - position.x) <= CARD_WIDTH / 2 &&
        Math.abs(y - position.y) <= CARD_HEIGHT / 2,
    );
    if (index < 0) return;
    const position = layout[index];
    if (!position) return;

    game.selectMixBatch(index);

    if (
      x > position.x + 94 &&
      x < position.x + 130 &&
      y > position.y - 48 &&
      y < position.y + 40
    ) {
      this.heatingIndex = index;
      game.startMixHeat(index);
      return;
    }

    if (
      x > position.x - 145 &&
      x < position.x - 105 &&
      y > position.y - 8 &&
      y < position.y + 58
    ) {
      game.addColorDrop(index);
      return;
    }

    if (
      x > position.x - 108 &&
      x < position.x - 68 &&
      y > position.y - 8 &&
      y < position.y + 58
    ) {
      this.aromaIndex = index;
      game.startAroma(index);
      return;
    }

    if (Math.abs(x - position.x) < 82 && Math.abs(y - (position.y - 22)) < 32) {
      this.stirring = true;
      this.stirIndex = index;
      this.lastAngle = Math.atan2(y - position.y, x - position.x);
      this.accumulated = 0;
    }
  }

  pointerMove(x: number, y: number, game: GameState): void {
    if (!this.stirring) return;
    const position = (POSITIONS[game.craft.units.length] ?? POSITIONS[1])[
      this.stirIndex
    ];
    if (!position) return;

    const angle = Math.atan2(y - position.y, x - position.x);
    let delta = angle - this.lastAngle;
    if (delta > Math.PI) delta -= Math.PI * 2;
    if (delta < -Math.PI) delta += Math.PI * 2;
    this.lastAngle = angle;
    this.accumulated += Math.abs(delta);
    this.spoonAngle = angle;

    if (this.accumulated >= Math.PI * 1.6) {
      this.accumulated -= Math.PI * 1.6;
      game.stirMix(this.stirIndex);
    }
  }

  pointerUp(_x: number, _y: number, game: GameState): void {
    if (this.heatingIndex !== null) {
      game.stopMixHeat(this.heatingIndex);
      this.heatingIndex = null;
    }
    if (this.aromaIndex !== null) {
      game.stopAroma();
      this.aromaIndex = null;
    }
    this.stirring = false;
  }

  keyDown(key: string, game: GameState): void {
    const normalized = key.toLowerCase();
    if (/^[1-4]$/.test(key)) {
      game.selectMixBatch(Number(key) - 1);
      return;
    }
    if (normalized === "c") {
      game.addColorDrop(game.mixIndex);
      return;
    }
    if (normalized === "a") {
      this.aromaIndex = game.mixIndex;
      game.startAroma(game.mixIndex);
      return;
    }
    if (key === " ") {
      this.heatingIndex = game.mixIndex;
      game.startMixHeat(game.mixIndex);
      return;
    }
    if (key === "ArrowLeft" || key === "ArrowRight") {
      const direction = key === "ArrowLeft" ? -1 : 1;
      this.spoonAngle += direction * 0.55;
      this.accumulated += 0.55;
      if (this.accumulated >= Math.PI * 1.6) {
        this.accumulated -= Math.PI * 1.6;
        game.stirMix(game.mixIndex);
      }
    }
  }

  keyUp(key: string, game: GameState): void {
    if (key === " " && this.heatingIndex !== null) {
      game.stopMixHeat(this.heatingIndex);
      this.heatingIndex = null;
    }
    if (key.toLowerCase() === "a") {
      game.stopAroma();
      this.aromaIndex = null;
    }
  }

  ariaLabel(game: GameState): string {
    return `Estación de mezcla con ${game.craft.units.length} fogones. Selecciona un fogón, calienta con la palanca, añade color con C, aroma con A y revuelve con las flechas.`;
  }

  destroy(): void {
    this.view.destroy({ children: true });
  }
}
