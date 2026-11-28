import { Container, Graphics, Text } from "pixi.js";
import { mixUnitReady } from "../../craft";
import { waxesById } from "../../data";
import type { GameState } from "../../game-state.svelte";
import { BURNER_CARD, MIX_VIEW, burnerLayout } from "../../layout";
import { motion } from "../motion";
import { clamp, hexColor, mixHex, stageColors } from "../palette";
import type { StageScene } from "../scene";
import type { PourUnit } from "../../types";

const DROP_SECONDS = 0.45;
const AROMA_STREAM_SECONDS = 1.6;

export class MixScene implements StageScene {
  view = new Container();
  private background = new Graphics();
  private burners = new Graphics();
  private drops = new Graphics();
  private spoons = new Graphics();
  private labels: Text[] = [];
  private temperatures: Text[] = [];
  private states: Text[] = [];
  private heatValues: Text[] = [];
  private help = new Text({
    text: "Perilla: arrastra o + / − · C color · A aroma · ← → revolver",
    style: {
      fontFamily: "Manrope Variable, sans-serif",
      fontSize: 13,
      fontWeight: "700",
      fill: stageColors.muted,
    },
  });

  private time = 0;
  private stirring = false;
  private stirIndex = 0;
  private lastAngle = 0;
  private accumulated = 0;
  private spoonAngle = -0.8;
  private heatIndex: number | null = null;
  private heatStartY = 0;
  private heatStartLevel = 0;
  private aromaIndex: number | null = null;
  private dropAges: number[] = [
    Number.POSITIVE_INFINITY,
    Number.POSITIVE_INFINITY,
    Number.POSITIVE_INFINITY,
    Number.POSITIVE_INFINITY,
  ];
  private lastDrops = [0, 0, 0, 0];

  constructor() {
    this.background
      .roundRect(
        MIX_VIEW.board.x,
        MIX_VIEW.board.y,
        MIX_VIEW.board.width,
        MIX_VIEW.board.height,
        MIX_VIEW.board.radius,
      )
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
      label.visible = false;
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
      temperature.visible = false;
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
      state.visible = false;
      this.states.push(state);

      const heat = new Text({
        text: "",
        style: {
          fontFamily: "Manrope Variable, sans-serif",
          fontSize: 10,
          fontWeight: "800",
          fill: stageColors.muted,
        },
      });
      heat.anchor.set(0.5);
      heat.visible = false;
      this.heatValues.push(heat);
    }

    this.help.anchor.set(0.5);
    this.help.position.set(500, 602);

    this.view.addChild(
      this.background,
      this.burners,
      this.drops,
      this.spoons,
      ...this.labels,
      ...this.temperatures,
      ...this.states,
      ...this.heatValues,
      this.help,
    );
  }

  update(game: GameState, delta: number): void {
    if (!motion.paused) this.time += delta;

    const wax = game.design.waxId ? waxesById[game.design.waxId] : null;
    const natural = wax?.hex ?? "#efe2cf";
    const layout = burnerLayout(game.craft.units.length);
    const waxMin = wax?.meltMin ?? 60;
    const waxMax = wax?.meltMax ?? 70;

    this.burners.clear();
    this.drops.clear();
    this.spoons.clear();

    game.craft.units.forEach((unit, index) => {
      if (unit.colorDrops > this.lastDrops[index]!) {
        this.dropAges[index] = 0;
      } else if (unit.colorDrops < this.lastDrops[index]!) {
        this.dropAges[index] = Number.POSITIVE_INFINITY;
      }
      this.lastDrops[index] = unit.colorDrops;
    });
    for (let index = 0; index < this.dropAges.length; index += 1) {
      if (Number.isFinite(this.dropAges[index]!)) {
        this.dropAges[index]! += delta;
      }
    }

    game.craft.units.forEach((unit, index) => {
      const position = layout[index];
      if (!position) return;

      const active = index === game.mixIndex;
      const inRange = unit.temperature >= waxMin && unit.temperature <= waxMax;
      const ready = mixUnitReady(unit);
      const mixedColor =
        unit.colorDrops > 0 && unit.colorId !== "gel"
          ? mixHex(natural, unit.colorHex, 0.25 + unit.mix * 0.75)
          : natural;

      this.drawBurner(
        unit,
        index,
        position,
        active,
        inRange,
        ready,
        mixedColor,
      );
      this.drawBottles(unit, position.x, position.y);
      this.drawKnob(unit, position.x, position.y, active);
      this.drawSpoon(position, active, mixedColor);
      this.drawAromaStream(unit, position.x, position.y);
      this.drawColorDrop(unit, index, position.x, position.y);

      const label = this.labels[index];
      const temperature = this.temperatures[index];
      const state = this.states[index];
      const heat = this.heatValues[index];
      if (!label || !temperature || !state || !heat) return;

      label.visible = true;
      label.text = unit.label;
      label.position.set(position.x, position.y + MIX_VIEW.labelOffsetY);

      temperature.visible = true;
      temperature.text = `${Math.round(unit.temperature)} °C`;
      temperature.position.set(
        position.x,
        position.y + MIX_VIEW.temperatureOffsetY,
      );
      temperature.style.fill = inRange ? stageColors.sage : stageColors.accent;

      state.visible = true;
      state.text = !inRange
        ? unit.heating
          ? "CALENTANDO"
          : "CALIENTA"
        : unit.colorDrops <= 0
          ? "FALTA COLOR"
          : unit.aromaMl <= 0
            ? "FALTA AROMA"
            : unit.mix <= 0
              ? "REVUELVE"
              : "LISTO";
      state.position.set(position.x, position.y + MIX_VIEW.statusOffsetY);
      state.style.fill = ready
        ? stageColors.sage
        : !inRange
          ? stageColors.accent
          : stageColors.muted;

      heat.visible = true;
      heat.text = `${Math.round(unit.heatLevel * 100)} %`;
      heat.position.set(
        position.x + MIX_VIEW.knob.offsetX,
        position.y + MIX_VIEW.heatOffsetY,
      );
      heat.style.fill =
        unit.heatLevel > 0 ? stageColors.accentStrong : stageColors.muted;
    });

    for (let index = game.craft.units.length; index < 4; index += 1) {
      const label = this.labels[index];
      const temperature = this.temperatures[index];
      const state = this.states[index];
      const heat = this.heatValues[index];
      if (label) label.visible = false;
      if (temperature) temperature.visible = false;
      if (state) state.visible = false;
      if (heat) heat.visible = false;
    }
  }

  private drawBurner(
    unit: PourUnit,
    index: number,
    position: { x: number; y: number },
    active: boolean,
    inRange: boolean,
    ready: boolean,
    mixedColor: string,
  ): void {
    const g = this.burners;
    const { x, y } = position;
    const level = clamp(unit.heatLevel, 0, 1);

    g.roundRect(
      x - BURNER_CARD.width / 2,
      y - BURNER_CARD.height / 2,
      BURNER_CARD.width,
      BURNER_CARD.height,
      BURNER_CARD.radius,
    )
      .fill({ color: stageColors.paper, alpha: active ? 0.96 : 0.5 })
      .stroke({
        width: active ? 3 : 1.5,
        color: active
          ? stageColors.accent
          : ready
            ? stageColors.sage
            : stageColors.border,
        alpha: active ? 1 : 0.8,
      });

    if (active) {
      g.roundRect(
        x - BURNER_CARD.width / 2 - 5,
        y - BURNER_CARD.height / 2 - 5,
        BURNER_CARD.width + 10,
        BURNER_CARD.height + 10,
        BURNER_CARD.radius + 4,
      ).stroke({ width: 2, color: stageColors.accent, alpha: 0.32 });
    }

    // Stove body, front legs and knob plate.
    g.roundRect(
      x - MIX_VIEW.stove.width / 2,
      y + 44,
      MIX_VIEW.stove.width,
      MIX_VIEW.stove.height,
      MIX_VIEW.stove.radius,
    )
      .fill({ color: stageColors.creamDeep, alpha: active ? 0.95 : 0.7 })
      .stroke({ width: 2, color: stageColors.border })
      .roundRect(x - MIX_VIEW.stove.width / 2 + 12, y + 88, 18, 8, 4)
      .fill({ color: stageColors.steel, alpha: 0.7 })
      .roundRect(x + MIX_VIEW.stove.width / 2 - 30, y + 88, 18, 8, 4)
      .fill({ color: stageColors.steel, alpha: 0.7 });

    // Flame under the pot. Reduced motion freezes its size.
    if (unit.heating) {
      const pulse = motion.reduced
        ? 0
        : Math.sin(this.time * 9 + index * 1.7) * 2.5;
      const flame = 6 + level * 12;
      g.ellipse(x, y + 42, 34 + level * 12, 7).fill({
        color: stageColors.accent,
        alpha: 0.24,
      });
      g.ellipse(x, y + 42, 18 + level * 8, 4).fill({
        color: 0xf6d36f,
        alpha: 0.8,
      });
      g.ellipse(x - 8, y + 45 - flame * 0.5, 5, flame * 0.5).fill({
        color: 0xf6d36f,
        alpha: 0.62,
      });
      g.ellipse(x + 8, y + 45 - flame * 0.42 + pulse, 4.5, flame * 0.42).fill({
        color: stageColors.accent,
        alpha: 0.5,
      });
    }

    // Pot and handles.
    g.roundRect(
      x - MIX_VIEW.pot.width / 2,
      y - 24,
      MIX_VIEW.pot.width,
      MIX_VIEW.pot.height,
      MIX_VIEW.pot.radius,
    )
      .fill(hexColor("#6f8165"))
      .stroke({ width: 4, color: hexColor("#4f5f47") })
      .roundRect(x - MIX_VIEW.pot.width / 2 - 12, y - 8, 15, 13, 6)
      .stroke({ width: 4, color: hexColor("#4f5f47") })
      .roundRect(x + MIX_VIEW.pot.width / 2 - 3, y - 8, 15, 13, 6)
      .stroke({ width: 4, color: hexColor("#4f5f47") });

    // Wax surface: the mixed color is visible even before stirring.
    g.ellipse(x, y - 24, MIX_VIEW.pot.width / 2, 14)
      .fill(hexColor(mixedColor))
      .stroke({ width: 3, color: hexColor("#4f5f47") })
      .ellipse(x, y - 27, MIX_VIEW.pot.width / 2 - 7, 9)
      .fill({ color: stageColors.white, alpha: 0.18 });

    if (unit.mix > 0) {
      g.ellipse(x + 12, y - 25, 26, 3).stroke({
        width: 1.5,
        color: stageColors.white,
        alpha: 0.28,
      });
    }

    // Steam only when the batch is in the working range.
    if (inRange && !motion.reduced) {
      for (let puff = 0; puff < 2; puff += 1) {
        const phase = (this.time * 0.4 + puff * 0.33) % 1;
        g.circle(
          x - 12 + puff * 24 + Math.sin(this.time + puff) * 4,
          y - 54 - phase * 26,
          3 + phase * 6,
        ).fill({ color: stageColors.white, alpha: 0.18 * (1 - phase) });
      }
    }
  }

  private drawBottles(unit: PourUnit, x: number, y: number): void {
    const g = this.burners;
    const color = MIX_VIEW.colorBottle;
    const aroma = MIX_VIEW.aromaBottle;

    g.roundRect(x + color.offsetX - 11, y + color.offsetY - 16, 22, 40, 6)
      .fill(hexColor(unit.colorHex))
      .stroke({ width: 2, color: stageColors.woodDark })
      .roundRect(x + color.offsetX - 14, y + color.offsetY - 25, 28, 11, 4)
      .fill(stageColors.woodDark)
      .roundRect(x + color.offsetX - 5, y + color.offsetY - 8, 5, 24, 2)
      .fill({ color: stageColors.white, alpha: 0.28 });

    const aromaLevel = clamp(unit.aromaMl / 12, 0, 1);
    g.roundRect(x + aroma.offsetX - 11, y + aroma.offsetY - 16, 22, 40, 6)
      .fill({ color: 0xe5efe8, alpha: 0.94 })
      .stroke({ width: 2, color: stageColors.woodDark })
      .roundRect(x + aroma.offsetX - 14, y + aroma.offsetY - 25, 28, 11, 4)
      .fill(stageColors.woodDark)
      .roundRect(
        x + aroma.offsetX - 7,
        y + aroma.offsetY + 21 - 29 * aromaLevel,
        14,
        29 * aromaLevel,
        3,
      )
      .fill({ color: stageColors.sage, alpha: 0.55 });

    // Drop pips next to the color bottle.
    const pips = Math.min(8, unit.colorDrops);
    for (let pip = 0; pip < 8; pip += 1) {
      g.circle(
        x + color.offsetX - 18 + (pip % 4) * 9,
        y + color.offsetY + 32 + Math.floor(pip / 4) * 7,
        2.2,
      ).fill(
        pip < pips
          ? stageColors.accent
          : { color: stageColors.creamDeep, alpha: 0.85 },
      );
    }
  }

  private drawKnob(
    unit: PourUnit,
    x: number,
    y: number,
    active: boolean,
  ): void {
    const g = this.burners;
    const knob = MIX_VIEW.knob;
    const knobX = x + knob.offsetX;
    const knobY = y + knob.offsetY;
    const level = clamp(unit.heatLevel, 0, 1);
    const angle = -2.3 + level * 4.6;

    g.circle(knobX, knobY, knob.radius)
      .fill({ color: stageColors.creamDeep, alpha: active ? 1 : 0.8 })
      .stroke({
        width: 3,
        color: stageColors.woodDark,
        alpha: active ? 1 : 0.55,
      })
      .circle(knobX, knobY, knob.radius - 7)
      .fill({ color: active ? stageColors.woodLight : stageColors.border })
      .stroke({ width: 2, color: stageColors.woodDark })
      .moveTo(knobX, knobY)
      .lineTo(
        knobX + Math.cos(angle) * (knob.radius - 8),
        knobY + Math.sin(angle) * (knob.radius - 8),
      )
      .stroke({ width: 4, color: stageColors.ink, cap: "round" })
      .circle(knobX, knobY, 4)
      .fill({ color: stageColors.ink });

    const ticks = [0, 0.5, 1];
    for (const tick of ticks) {
      const tickAngle = -2.3 + tick * 4.6;
      g.circle(
        knobX + Math.cos(tickAngle) * (knob.radius + 4),
        knobY + Math.sin(tickAngle) * (knob.radius + 4),
        1.6,
      ).fill({ color: stageColors.muted, alpha: 0.6 });
    }
  }

  private drawSpoon(
    position: { x: number; y: number },
    active: boolean,
    mixedColor: string,
  ): void {
    const g = this.spoons;
    const angle = active ? this.spoonAngle : -0.9;
    const bowlX = position.x + Math.cos(angle) * MIX_VIEW.spoon.reach;
    const bowlY = position.y - 24 + Math.sin(angle) * 10;
    const pivotX = position.x + MIX_VIEW.spoon.pivotOffsetX;
    const pivotY = position.y + MIX_VIEW.spoon.pivotOffsetY;

    g.moveTo(bowlX, bowlY)
      .lineTo(pivotX, pivotY)
      .stroke({ width: 7, color: hexColor("#b98963"), cap: "round" })
      .moveTo(bowlX, bowlY)
      .lineTo(pivotX, pivotY)
      .stroke({ width: 2.5, color: stageColors.white, alpha: 0.22 })
      .circle(pivotX, pivotY, 5)
      .fill(hexColor("#8f5f40"))
      .ellipse(bowlX, bowlY, 15, 8)
      .fill(hexColor("#b98963"))
      .stroke({ width: 2, color: hexColor("#8f5f40") })
      .ellipse(bowlX, bowlY - 1, 10, 4)
      .fill({ color: hexColor(mixedColor), alpha: 0.72 });
  }

  private drawAromaStream(unit: PourUnit, x: number, y: number): void {
    if (!unit.aromaPouring || motion.reduced) return;

    const fromX = x + MIX_VIEW.aromaBottle.offsetX;
    const fromY = y + MIX_VIEW.aromaBottle.offsetY - 25;
    const toX = x + 8;
    const toY = y - 26;
    const controlX = x + 58;
    const controlY = y - 48;

    this.drops
      .moveTo(fromX, fromY)
      .quadraticCurveTo(controlX, controlY, toX, toY)
      .stroke({ width: 2, color: stageColors.sage, alpha: 0.48 });

    for (let index = 0; index < 3; index += 1) {
      const phase = (this.time * AROMA_STREAM_SECONDS + index / 3) % 1;
      const inverse = 1 - phase;
      const dropX =
        inverse * inverse * fromX +
        2 * inverse * phase * controlX +
        phase * phase * toX;
      const dropY =
        inverse * inverse * fromY +
        2 * inverse * phase * controlY +
        phase * phase * toY;
      this.drops.circle(dropX, dropY, 2.2).fill({
        color: stageColors.sage,
        alpha: 0.8 * (1 - phase * 0.4),
      });
    }
  }

  private drawColorDrop(
    unit: PourUnit,
    index: number,
    x: number,
    y: number,
  ): void {
    if (motion.reduced) return;
    const age = this.dropAges[index] ?? Number.POSITIVE_INFINITY;
    if (!Number.isFinite(age) || age > DROP_SECONDS) return;

    const progress = clamp(age / DROP_SECONDS, 0, 1);
    const startX = x + MIX_VIEW.colorBottle.offsetX;
    const startY = y + MIX_VIEW.colorBottle.offsetY - 25;
    const endX = x - 16;
    const endY = y - 28;
    const dropX = startX + (endX - startX) * progress;
    const dropY =
      startY +
      (endY - startY) * progress * progress -
      Math.sin(Math.PI * progress) * 16;
    const radius = 4 - progress * 1.4;

    this.drops
      .circle(dropX, dropY, radius)
      .fill(hexColor(unit.colorHex))
      .stroke({ width: 1, color: stageColors.woodDark, alpha: 0.4 });
  }

  pointerDown(x: number, y: number, game: GameState): void {
    const layout = burnerLayout(game.craft.units.length);
    const index = layout.findIndex(
      (position) =>
        Math.abs(x - position.x) <= BURNER_CARD.width / 2 &&
        Math.abs(y - position.y) <= BURNER_CARD.height / 2,
    );
    if (index < 0) return;
    const position = layout[index];
    const unit = game.craft.units[index];
    if (!position || !unit) return;

    game.selectMixBatch(index);

    const color = MIX_VIEW.colorBottle;
    if (
      Math.hypot(
        x - (position.x + color.offsetX),
        y - (position.y + color.offsetY),
      ) <= color.hitRadius
    ) {
      game.addColorDrop(index);
      return;
    }

    const aroma = MIX_VIEW.aromaBottle;
    if (
      Math.hypot(
        x - (position.x + aroma.offsetX),
        y - (position.y + aroma.offsetY),
      ) <= aroma.hitRadius
    ) {
      this.aromaIndex = index;
      game.startAroma(index);
      return;
    }

    const knob = MIX_VIEW.knob;
    if (
      Math.hypot(
        x - (position.x + knob.offsetX),
        y - (position.y + knob.offsetY),
      ) <= knob.hitRadius
    ) {
      this.heatIndex = index;
      this.heatStartY = y;
      this.heatStartLevel = unit.heatLevel;
      return;
    }

    if (
      Math.hypot(x - position.x, y - (position.y - 24)) <=
      MIX_VIEW.pot.width / 2 + 10
    ) {
      this.stirring = true;
      this.stirIndex = index;
      this.lastAngle = Math.atan2(y - (position.y - 24), x - position.x);
      this.accumulated = 0;
    }
  }

  pointerMove(x: number, y: number, game: GameState): void {
    if (this.heatIndex !== null) {
      const unit = game.craft.units[this.heatIndex];
      if (!unit) return;
      const level = clamp(
        this.heatStartLevel + (this.heatStartY - y) / MIX_VIEW.knob.drag,
        0,
        1,
      );
      game.setMixHeat(this.heatIndex, level);
      return;
    }

    if (!this.stirring) return;
    const position = burnerLayout(game.craft.units.length)[this.stirIndex];
    if (!position) return;

    const centerY = position.y - 24;
    const angle = Math.atan2(y - centerY, x - position.x);
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
    // Releasing the knob keeps its level; it is not a lever that must be held.
    this.heatIndex = null;
    if (this.aromaIndex !== null) {
      game.stopAroma();
      this.aromaIndex = null;
    }
    this.stirring = false;
  }

  keyDown(key: string, game: GameState, _shift = false, repeat = false): void {
    if (game.phase !== "mix") return;
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
      if (repeat) return;
      this.aromaIndex = game.mixIndex;
      game.startAroma(game.mixIndex);
      return;
    }

    const unit = game.craft.units[game.mixIndex];
    if (!unit) return;
    if (key === "+" || key === "=") {
      game.setMixHeat(game.mixIndex, unit.heatLevel + 0.1);
      return;
    }
    if (key === "-" || key === "_") {
      game.setMixHeat(game.mixIndex, unit.heatLevel - 0.1);
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
    if (key.toLowerCase() === "a") {
      game.stopAroma();
      this.aromaIndex = null;
    }
  }

  ariaLabel(game: GameState): string {
    const count = game.craft.units.length;
    const unit = game.craft.units[game.mixIndex];
    const level = unit ? Math.round(unit.heatLevel * 100) : 0;
    return `Estación de mezcla con ${count} ${count === 1 ? "fogón" : "fogones"} en fila. El fogón ${game.mixIndex + 1} tiene la perilla al ${level} %. Arrastra la perilla hacia arriba o abajo, o usa más y menos; al soltar conserva el nivel. Pulsa 1–${count} para cambiar de fogón, C para una gota de color, A para el aroma y las flechas para revolver.`;
  }

  destroy(): void {
    this.view.destroy({ children: true });
  }
}
