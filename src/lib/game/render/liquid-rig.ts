import type { Graphics } from "pixi.js";
import { surfaceAt, type LiquidParticle, type LiquidState } from "../liquid";
import { hexColor, mixHex, stageColors } from "./palette";

export interface LiquidSurfaceLayout {
  x: number;
  y: number;
  width: number;
  amplitude?: number;
}

export interface LiquidSurfaceOptions {
  gel?: boolean;
  reduced?: boolean;
  quality?: "high" | "low";
  time?: number;
}

export interface LiquidSurfacePoint {
  x: number;
  y: number;
}

export function surfacePoints(
  liquid: LiquidState | null,
  layout: LiquidSurfaceLayout,
  quality: "high" | "low" = "high",
): LiquidSurfacePoint[] {
  const count = quality === "low" ? 14 : 28;
  const amplitude = layout.amplitude ?? 5;
  return Array.from({ length: count + 1 }, (_, index) => {
    const t = index / count;
    return {
      x: layout.x + layout.width * t,
      y: layout.y + (liquid ? surfaceAt(liquid, t) * amplitude : 0),
    };
  });
}

export function drawLiquidSurface(
  graphics: Graphics,
  liquid: LiquidState | null,
  layout: LiquidSurfaceLayout,
  colorHex: string,
  options: LiquidSurfaceOptions = {},
): void {
  const gel = options.gel ?? false;
  const reduced = options.reduced ?? false;
  const quality = options.quality ?? "high";
  const time = options.time ?? liquid?.time ?? 0;
  const points = surfacePoints(liquid, layout, quality);

  graphics.moveTo(points[0]!.x, points[0]!.y);
  for (let index = 1; index < points.length; index += 1) {
    graphics.lineTo(points[index]!.x, points[index]!.y);
  }
  graphics.stroke({
    width: gel ? 3.5 : 5,
    color: hexColor(
      gel
        ? mixHex(colorHex, "#7f95ab", 0.35)
        : mixHex(colorHex, "#6f5541", 0.68),
    ),
    alpha: gel ? 0.65 : 0.9,
  });

  // A light meniscus keeps the liquid readable against the wax.
  const first = points[0]!;
  const last = points[points.length - 1]!;
  graphics
    .moveTo(first.x + 4, first.y - 3)
    .lineTo(first.x + 12, first.y - 1)
    .moveTo(last.x - 12, last.y - 1)
    .lineTo(last.x - 4, last.y - 3)
    .stroke({ width: 2, color: stageColors.white, alpha: gel ? 0.62 : 0.5 });

  graphics
    .moveTo(first.x, first.y - 7)
    .lineTo(first.x + layout.width * 0.35, first.y - 7)
    .lineTo(first.x + layout.width * 0.7, first.y - 7)
    .lineTo(last.x, last.y - 7)
    .stroke({ width: 2, color: stageColors.white, alpha: 0.22 });

  if (reduced || quality === "low") return;

  const shimmerCount = gel ? 2 : 3;
  for (let index = 0; index < shimmerCount; index += 1) {
    const t = 0.2 + index * 0.28;
    const pointIndex = Math.min(
      points.length - 1,
      Math.round(t * (points.length - 1)),
    );
    const point = points[pointIndex]!;
    const alpha = 0.16 + Math.sin(time * 3 + index * 1.7) * 0.08;
    graphics
      .moveTo(point.x - 9, point.y - 4)
      .lineTo(point.x + 9, point.y - 4)
      .stroke({
        width: gel ? 2 : 3,
        color: stageColors.white,
        alpha: Math.max(0.06, alpha),
      });
  }
}

export function drawLiquidParticles(
  graphics: Graphics,
  particles: LiquidParticle[],
  originX: number,
  originY: number,
  colorHex: string,
  options: {
    scaleX?: number;
    scaleY?: number;
    reduced?: boolean;
  } = {},
): void {
  const scaleX = options.scaleX ?? 60;
  const scaleY = options.scaleY ?? 60;
  const reduced = options.reduced ?? false;
  const list = reduced ? particles.slice(0, 6) : particles.slice(0, 40);
  const color = hexColor(colorHex);

  for (const particle of list) {
    const x = originX + particle.x * scaleX;
    const y = originY + particle.y * scaleY;
    const life = Math.max(0, Math.min(1, particle.life));
    graphics
      .moveTo(x - particle.vx * scaleX * 0.25, y - particle.vy * scaleY * 0.12)
      .lineTo(x, y)
      .stroke({
        width: Math.max(1, particle.size * 0.55),
        color,
        alpha: life * 0.55,
        cap: "round",
      })
      .ellipse(x, y, particle.size, particle.size * 1.25)
      .fill({ color, alpha: life * 0.85 })
      .circle(
        x - particle.size * 0.3,
        y - particle.size * 0.35,
        particle.size * 0.3,
      )
      .fill({ color: stageColors.white, alpha: life * 0.6 });
  }
}
