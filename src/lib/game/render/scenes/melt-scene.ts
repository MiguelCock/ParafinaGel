import { Container, Graphics, Text } from "pixi.js";
import { scentsById, waxesById } from "../../data";
import type { GameState } from "../../game-state.svelte";
import { hexColor, stageColors } from "../palette";
import type { StageScene } from "../scene";

const POT_X = 400;
const POT_Y = 360;

export class MeltScene implements StageScene {
  view = new Container();
  private background = new Graphics();
  private pot = new Graphics();
  private bottles = new Graphics();
  private spoon = new Graphics();
  private steam = new Graphics();
  private lever = new Graphics();
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
  private help = new Text({
    text: "",
    style: {
      fontFamily: "Manrope Variable, sans-serif",
      fontSize: 14,
      fill: stageColors.muted,
    },
  });

  private draggingSpoon = false;
  private draggingLever = false;
  private lastAngle = 0;
  private accumulated = 0;
  private spoonAngle = -0.8;
  private time = 0;
  private reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
    this.help.anchor.set(0.5);
    this.help.position.set(500, 596);
    this.help.visible = false;

    this.view.addChild(
      this.background,
      this.pot,
      this.bottles,
      this.steam,
      this.spoon,
      this.lever,
      this.temperature,
      this.status,
      this.aroma,
      this.help,
    );
  }

  update(game: GameState, delta: number): void {
    this.time += delta;
    const wax = game.design.waxId ? waxesById[game.design.waxId] : null;
    const waxColor = wax ? wax.hex : "#e9c9a8";
    const heating = game.craft.heating;
    const inRange =
      game.craft.temperature >= game.meltMin &&
      game.craft.temperature <= game.meltMax;

    this.temperature.text = `${Math.round(game.craft.temperature)} °C`;
    this.temperature.style.fill = inRange
      ? stageColors.sage
      : game.craft.overheated
        ? stageColors.accent
        : stageColors.ink;

    this.status.text = game.craft.overheated
      ? "Se pasó de calor · retira la olla"
      : inRange
        ? "En rango · puedes seguir"
        : heating
          ? "Calentando despacio…"
          : "Toca la palanca y mantenla";

    const scent = game.design.scentIds[0]
      ? scentsById[game.design.scentIds[0]]
      : null;
    this.aroma.text = scent ? `Aroma · ${scent.nombre}` : "Aroma pendiente";

    this.background.clear();
    this.background
      .roundRect(120, 64, 760, 500, 30)
      .fill({ color: stageColors.paper, alpha: 0.88 })
      .stroke({ width: 2, color: stageColors.border });

    this.drawPot(waxColor, heating);
    this.drawBottles(waxColor, scent?.nombre ?? "Sin aroma");
    this.drawSteam(game, waxColor);
    this.drawSpoon(waxColor);
    this.drawLever(heating);
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

  private drawPot(waxColor: string, heating: boolean): void {
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
      const phase = this.reducedMotion
        ? 0.45
        : (this.time * 0.32 + i * 0.27) % 1;
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

  private drawLever(heating: boolean): void {
    const x = 745;
    const y = 440;
    this.lever.clear();
    this.lever
      .roundRect(x - 18, y, 36, 130, 18)
      .fill({ color: stageColors.creamDeep, alpha: 0.9 })
      .stroke({ width: 2, color: stageColors.border })
      .roundRect(x - 22, y + (heating ? 74 : 4), 44, 50, 18)
      .fill(heating ? stageColors.accent : stageColors.woodLight)
      .stroke({ width: 2, color: stageColors.woodDark })
      .circle(x, y + (heating ? 99 : 29), 7)
      .fill({ color: stageColors.white, alpha: 0.7 })
      .roundRect(x - 70, y + 146, 140, 28, 14)
      .fill({ color: stageColors.sageSoft, alpha: 0.9 });
  }

  pointerDown(x: number, y: number, game: GameState): void {
    if (x > 700 && x < 790 && y > 420 && y < 590) {
      this.draggingLever = true;
      game.startHeating();
      return;
    }

    if (Math.hypot(x - POT_X, y - (POT_Y - 30)) < 190) {
      this.draggingSpoon = true;
      this.lastAngle = Math.atan2(y - POT_Y, x - POT_X);
      this.accumulated = 0;
    }
  }

  pointerMove(x: number, y: number, game: GameState): void {
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

  pointerUp(_x: number, _y: number, game: GameState): void {
    this.draggingSpoon = false;
    if (this.draggingLever) {
      this.draggingLever = false;
      game.stopHeating();
    }
  }

  keyDown(key: string, game: GameState): void {
    if (key === " ") {
      game.startHeating();
    } else if (key === "ArrowLeft" || key === "ArrowRight") {
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

  ariaLabel(): string {
    return "Estación de cera. Mantén la palanca para calentar y arrastra la cuchara en círculos para remover.";
  }

  destroy(): void {
    this.view.destroy({ children: true });
  }
}
