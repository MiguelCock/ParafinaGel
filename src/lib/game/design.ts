import {
  inclusionsById,
  labelsById,
  moldsById,
  scentsById,
  sizesById,
  vesselsById,
  waxColorsById,
  waxesById,
  wickTypesById,
} from "./data";
import type {
  CandleDesign,
  DesignIssue,
  LayerDesign,
  OrderType,
} from "./types";

export const MAX_LAYERS = 4;
export const MIN_LAYERS = 2;
export const LAYER_HEIGHT_MIN = 8;

export function createLayers(count: number): LayerDesign[] {
  const height = 100 / count;
  return Array.from({ length: count }, (_, index) => ({
    id: `layer-${index}`,
    colorId: "natural",
    height,
  }));
}

export function createDesign(type: OrderType = "clasico"): CandleDesign {
  const mold = type === "figura" ? moldsById["corazon"] : null;
  const figureColors: Record<string, string> = {};
  if (mold) {
    for (const part of mold.parts) figureColors[part.id] = "natural";
  }

  return {
    mode: type,
    waxId: type === "gel" ? "gel" : "soya",
    vesselId: type === "figura" ? null : type === "gel" ? "cristal" : "ambar",
    moldId: mold?.id ?? null,
    sizeId: type === "figura" ? "180" : "250",
    scentIds: [],
    layers: createLayers(type === "capas" ? 3 : 1),
    figureColors,
    inclusions: [],
    wickId: null,
    labelId: null,
    lidOn: false,
    wrapped: false,
  };
}

export function reindexLayers(layers: LayerDesign[]): LayerDesign[] {
  return layers.map((layer, index) => ({ ...layer, id: `layer-${index}` }));
}

export function setLayerCount(
  design: CandleDesign,
  count: number,
): CandleDesign {
  const safeCount = Math.min(MAX_LAYERS, Math.max(1, count));
  const previous = design.layers;
  const layers = reindexLayers(
    Array.from({ length: safeCount }, (_, index) => ({
      id: `layer-${index}`,
      colorId:
        previous[index]?.colorId ??
        ["natural", "salvia", "ambar", "crema"][index] ??
        "natural",
      height: 100 / safeCount,
    })),
  );

  return { ...design, layers };
}

export function resizeLayer(
  layers: LayerDesign[],
  index: number,
  value: number,
): LayerDesign[] {
  const clamped = Math.min(
    100 - LAYER_HEIGHT_MIN * (layers.length - 1),
    Math.max(LAYER_HEIGHT_MIN, value),
  );
  const others = layers.filter((_, i) => i !== index);
  const othersTotal = others.reduce((sum, layer) => sum + layer.height, 0);
  const remaining = 100 - clamped;

  return layers.map((layer, i) => {
    if (i === index) return { ...layer, height: clamped };
    const share =
      othersTotal > 0 ? layer.height / othersTotal : 1 / others.length;
    return { ...layer, height: remaining * share };
  });
}

export function mirrorColors(design: CandleDesign): CandleDesign {
  const colors = design.layers.map((layer) => layer.colorId);
  return {
    ...design,
    layers: design.layers.map((layer, index) => ({
      ...layer,
      colorId: colors[colors.length - 1 - index] ?? layer.colorId,
    })),
  };
}

export function layerTotal(layers: LayerDesign[]): number {
  return layers.reduce((sum, layer) => sum + layer.height, 0);
}

export function colorName(colorId: string | null): string {
  if (!colorId) return "Por elegir";
  return waxColorsById[colorId]?.nombre ?? "Por elegir";
}

export function layerSummary(design: CandleDesign): string {
  if (design.mode === "figura") {
    const mold = design.moldId ? moldsById[design.moldId] : null;
    if (!mold) return "Sin molde";
    return mold.parts
      .map(
        (part) =>
          `${part.nombre} ${colorName(design.figureColors[part.id] ?? null)}`,
      )
      .join(" · ");
  }

  return design.layers
    .map((layer) => `${colorName(layer.colorId)} ${Math.round(layer.height)}%`)
    .join(" · ");
}

export function designSummary(
  design: CandleDesign,
): { label: string; value: string }[] {
  const wax = design.waxId ? waxesById[design.waxId] : null;
  const vessel = design.vesselId ? vesselsById[design.vesselId] : null;
  const mold = design.moldId ? moldsById[design.moldId] : null;
  const size = design.sizeId ? sizesById[design.sizeId] : null;
  const scents = design.scentIds
    .map((id) => scentsById[id]?.nombre)
    .filter(Boolean)
    .join(" + ");
  const wick = design.wickId ? wickTypesById[design.wickId] : null;
  const label = design.labelId ? labelsById[design.labelId] : null;
  const mounts = design.inclusions
    .map((id) => inclusionsById[id]?.nombre)
    .filter(Boolean)
    .join(" · ");

  return [
    { label: "Cera", value: wax?.nombre ?? "Por elegir" },
    {
      label: design.mode === "figura" ? "Molde" : "Recipiente",
      value:
        design.mode === "figura"
          ? (mold?.nombre ?? "Por elegir")
          : (vessel?.nombre ?? "Por elegir"),
    },
    { label: "Tamaño", value: size?.nombre ?? "Por elegir" },
    {
      label: design.mode === "gel" ? "Montajes" : "Color",
      value:
        design.mode === "gel" ? mounts || "Sin montajes" : layerSummary(design),
    },
    { label: "Aroma", value: scents || "Por elegir" },
    { label: "Mecha", value: wick?.nombre ?? "Por elegir" },
    { label: "Etiqueta", value: label?.nombre ?? "Por elegir" },
  ];
}

export function validateDesign(design: CandleDesign): DesignIssue[] {
  const issues: DesignIssue[] = [];

  if (!design.waxId) {
    issues.push({
      field: "wax",
      message: "Elige una cera.",
      severity: "error",
    });
  }

  if (!design.sizeId) {
    issues.push({
      field: "size",
      message: "Elige un tamaño.",
      severity: "error",
    });
  }

  if (design.scentIds.length === 0) {
    issues.push({
      field: "scent",
      message: "Elige al menos un aroma.",
      severity: "error",
    });
  }

  if (!design.wickId) {
    issues.push({
      field: "wick",
      message: "Elige un tipo de mecha.",
      severity: "error",
    });
  }

  if (!design.labelId) {
    issues.push({
      field: "label",
      message: "Elige una etiqueta para el acabado.",
      severity: "error",
    });
  }

  if (design.mode === "figura") {
    if (!design.moldId) {
      issues.push({
        field: "mold",
        message: "Elige un molde para la figura.",
        severity: "error",
      });
    } else {
      const mold = moldsById[design.moldId];
      const missing = mold?.parts.filter(
        (part) => !design.figureColors[part.id],
      );
      if (missing && missing.length > 0) {
        issues.push({
          field: "figure",
          message: `Completa el color de: ${missing.map((part) => part.nombre).join(", ")}.`,
          severity: "error",
        });
      }
    }
  } else {
    if (!design.vesselId) {
      issues.push({
        field: "vessel",
        message: "Elige un recipiente.",
        severity: "error",
      });
    }

    if (design.mode === "gel" && design.waxId !== "gel") {
      issues.push({
        field: "wax",
        message: "Para una vela de gel necesitas parafina gel.",
        severity: "error",
      });
    }

    if (design.mode === "gel" && design.vesselId) {
      const vessel = vesselsById[design.vesselId];
      if (vessel && !vessel.transparent) {
        issues.push({
          field: "vessel",
          message: "El gel necesita un recipiente transparente.",
          severity: "error",
        });
      }
    }

    if (design.mode === "gel" && design.inclusions.length === 0) {
      issues.push({
        field: "inclusions",
        message: "Agrega al menos un montaje para el diseño de gel.",
        severity: "warning",
      });
    }

    if (design.mode === "clasico" && design.layers.length !== 1) {
      issues.push({
        field: "layers",
        message: "La vela clásica lleva una sola capa.",
        severity: "error",
      });
    }

    if (design.mode === "capas" && design.layers.length < MIN_LAYERS) {
      issues.push({
        field: "layers",
        message: "Agrega al menos dos capas.",
        severity: "error",
      });
    }

    const total = layerTotal(design.layers);
    if (
      (design.mode === "clasico" || design.mode === "capas") &&
      Math.abs(total - 100) > 0.6
    ) {
      issues.push({
        field: "layers",
        message: "Las capas deben sumar 100%.",
        severity: "error",
      });
    }
  }

  if (design.wickId && design.vesselId) {
    const wick = wickTypesById[design.wickId];
    const vessel = vesselsById[design.vesselId];
    if (
      wick &&
      vessel &&
      (vessel.diameterMm < wick.diameterMin ||
        vessel.diameterMm > wick.diameterMax)
    ) {
      issues.push({
        field: "wick",
        message: `La mecha ${wick.nombre} recomienda ${wick.diameterMin}–${wick.diameterMax} mm y el recipiente mide ${vessel.diameterMm} mm.`,
        severity: "warning",
      });
    }
  }

  return issues;
}

export function isDesignReady(design: CandleDesign): boolean {
  return validateDesign(design).every((issue) => issue.severity !== "error");
}
