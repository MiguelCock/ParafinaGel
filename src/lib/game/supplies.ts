import {
  STEARIC_RATIO,
  createPourUnits,
  mixAromaRange,
  mixTargetColorDrops,
  totalWaxGrams,
  waxNeedsStearic,
} from "./craft";
import {
  orderTypeLabels,
  suppliesById,
  waxColorsById,
  waxesById,
  wickTypesById,
} from "./data";
import { designSummary } from "./design";
import type { CandleDesign, Craft, RecipeLine, SupplyCategory } from "./types";

const categoryOrder: SupplyCategory[] = [
  "cera",
  "aditivo",
  "aceite",
  "mecha",
  "aroma",
  "color",
  "recipiente",
  "molde",
  "montaje",
  "etiqueta",
  "empaque",
  "herramienta",
];

function recipeLine(supplyId: string, cantidad: number): RecipeLine | null {
  const supply = suppliesById[supplyId];
  if (!supply) return null;
  return {
    supplyId: supply.id,
    nombre: supply.nombre,
    categoria: supply.categoria,
    cantidad: Math.max(1, Math.round(cantidad)),
    unidad: supply.unidad,
    detalle: supply.detalle,
    precioUnitario: supply.precio,
  };
}

export function buildRecipe(design: CandleDesign, craft?: Craft): RecipeLine[] {
  const lines: (RecipeLine | null)[] = [];
  const wax = design.waxId ? waxesById[design.waxId] : null;

  if (wax) {
    const grams = totalWaxGrams(design);
    const units = craft?.units ?? createPourUnits(design);
    lines.push(recipeLine(wax.supplyId, grams));

    if (waxNeedsStearic(design)) {
      const stearic = recipeLine(
        "aditivo-acido-estearico",
        Math.max(5, Math.round((grams * STEARIC_RATIO) / 5) * 5),
      );
      if (stearic) {
        lines.push({
          ...stearic,
          detalle: "Dosis de ejemplo; el porcentaje está pendiente de validar.",
          porConfirmar: true,
        });
      }
    }

    const aromaByScent = new Map<string, number>();
    for (const unit of units) {
      if (!unit.scentId) continue;
      const range = mixAromaRange(unit.grams, wax);
      aromaByScent.set(
        unit.scentId,
        (aromaByScent.get(unit.scentId) ?? 0) + range.min,
      );
    }
    for (const [scentId, milliliters] of aromaByScent) {
      const aroma = recipeLine(`aroma-${scentId}`, Math.ceil(milliliters));
      if (aroma) {
        lines.push({
          ...aroma,
          detalle: `${Math.round(wax.fragranceMin * 100)}–${Math.round(wax.fragranceMax * 100)} % · falta confirmar peso/volumen.`,
          porConfirmar: true,
        });
      }
    }

    const dropsByColor = new Map<string, number>();
    if (design.mode !== "gel") {
      for (const unit of units) {
        dropsByColor.set(
          unit.colorId,
          (dropsByColor.get(unit.colorId) ?? 0) +
            mixTargetColorDrops(unit.grams),
        );
      }
    }
    for (const [colorId, drops] of dropsByColor) {
      const color = recipeLine(`color-${colorId}`, drops);
      if (color) {
        lines.push({
          ...color,
          detalle: "Gotas de ejemplo; el colorante es concentrado.",
          porConfirmar: true,
        });
      }
    }
  }

  if (design.mode === "figura" && design.moldId) {
    lines.push(recipeLine(`molde-${design.moldId}`, 1));
  } else if (design.vesselId) {
    lines.push(recipeLine(`recipiente-${design.vesselId}`, 1));
  }

  if (design.wickId) {
    const wick = wickTypesById[design.wickId];
    if (wick) {
      lines.push(recipeLine(wick.supplyId, 1));
      lines.push(recipeLine("mecha-porta-pabilo", 1));
    }
  }

  for (const inclusionId of design.inclusions) {
    lines.push(recipeLine(`montaje-${inclusionId}`, 1));
  }

  if (design.labelId) {
    lines.push(recipeLine(`etiqueta-${design.labelId}`, 1));
  }

  if (design.lidOn) {
    lines.push(recipeLine("tapa-generica", 1));
  }

  if (design.wrapped) {
    lines.push(recipeLine("empaque-lazo", 1));
  }

  lines.push(recipeLine("herramienta-termometro", 1));
  lines.push(recipeLine("herramienta-jarra", 1));
  lines.push(recipeLine("herramienta-sostenedor", 1));

  return lines
    .filter((line): line is RecipeLine => line !== null)
    .sort(
      (a, b) =>
        categoryOrder.indexOf(a.categoria) - categoryOrder.indexOf(b.categoria),
    );
}

export function buildSuppliesMessage(
  design: CandleDesign,
  recipe: RecipeLine[],
): string {
  const wax = design.waxId ? waxesById[design.waxId] : null;
  const summary = designSummary(design)
    .map((item) => `${item.label}: ${item.value}`)
    .join("\n");

  const supplies = recipe
    .map(
      (line) =>
        `• ${line.nombre}: ${line.cantidad} ${line.unidad}${line.porConfirmar ? " (dosis por confirmar)" : ""}`,
    )
    .join("\n");

  return [
    `Hola ParafinaGel, quiero preparar esta vela ${orderTypeLabels[design.mode].toLowerCase()}.`,
    "",
    summary,
    "",
    "Insumos que necesito:",
    supplies,
    "",
    wax
      ? "Vi el diseño en el juego del taller y me gustaría pedir los materiales."
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function colorLabel(colorId: string): string {
  return waxColorsById[colorId]?.nombre ?? colorId;
}
