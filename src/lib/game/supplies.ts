import {
  orderTypeLabels,
  suppliesById,
  waxColorsById,
  waxesById,
  wickTypesById,
} from "./data";
import { designSummary } from "./design";
import type { CandleDesign, RecipeLine, SupplyCategory } from "./types";

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

export function buildRecipe(design: CandleDesign): RecipeLine[] {
  const lines: (RecipeLine | null)[] = [];
  const wax = design.waxId ? waxesById[design.waxId] : null;

  if (wax) {
    const grams =
      Math.ceil(((design.sizeId === "180" ? 180 : 250) * 0.9) / 5) * 5;
    lines.push(recipeLine(wax.supplyId, grams));

    if (design.scentIds.length > 0) {
      const milliliters = Math.ceil(grams * wax.fragranceMin);
      const perScent = milliliters / design.scentIds.length;
      for (const scentId of design.scentIds) {
        lines.push(recipeLine(`aroma-${scentId}`, Math.ceil(perScent)));
      }
    }

    const colors = new Set<string>();
    if (design.mode === "figura") {
      Object.values(design.figureColors).forEach((color) => colors.add(color));
    } else if (design.mode !== "gel") {
      design.layers.forEach((layer) => colors.add(layer.colorId));
    }
    if (colors.size > 0) {
      for (const colorId of colors) {
        lines.push(recipeLine(`color-${colorId}`, 4));
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
    .map((line) => `• ${line.nombre}: ${line.cantidad} ${line.unidad}`)
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
