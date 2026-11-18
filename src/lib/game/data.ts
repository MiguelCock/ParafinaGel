import type {
  Customer,
  Label,
  Order,
  Scent,
  Size,
  StationId,
  Vessel,
  WaxColor,
} from "./types";

export const stationOrder: StationId[] = [
  "counter",
  "melt",
  "pour",
  "cool",
  "finish",
];

export const stationLabels: Record<StationId, string> = {
  counter: "Mostrador",
  melt: "Cera",
  pour: "Vertido",
  cool: "Enfriado",
  finish: "Acabado",
};

export const scents: Scent[] = [
  { id: "lavanda", nombre: "Lavanda" },
  { id: "vainilla", nombre: "Vainilla" },
  { id: "cafe", nombre: "Café" },
];

export const waxColors: WaxColor[] = [
  { id: "terracota", nombre: "Terracota", hex: "#b4552f" },
  { id: "ambar", nombre: "Ámbar", hex: "#c98a4b" },
  { id: "salvia", nombre: "Salvia", hex: "#7c8b72" },
];

export const vessels: Vessel[] = [
  { id: "ambar", nombre: "Frasco ámbar", glass: "#c98a4b" },
  { id: "claro", nombre: "Frasco claro", glass: "#f9f2e8" },
];

export const labels: Label[] = [
  { id: "clasica", nombre: "Etiqueta clásica", color: "#fbf3e9" },
  { id: "regalo", nombre: "Etiqueta regalo", color: "#f3ddd2" },
];

export const sizes: Size[] = [
  { id: "180", nombre: "180 g", scale: 0.88 },
  { id: "250", nombre: "250 g", scale: 1 },
];

export const customers: Customer[] = [
  {
    id: "marta",
    nombre: "Doña Marta",
    saludo: "Quiero una vela suave para la sala.",
    skin: "#d8a37a",
    hair: "#6b4a3a",
    shirt: "#7c8b72",
  },
  {
    id: "nico",
    nombre: "Nico",
    saludo: "Es un regalo para mi mamá.",
    skin: "#c98a5e",
    hair: "#2f2a26",
    shirt: "#b4552f",
  },
  {
    id: "sofia",
    nombre: "Sofía",
    saludo: "Algo que huela a café recién hecho.",
    skin: "#e0b08a",
    hair: "#a35c32",
    shirt: "#c98a4b",
  },
];

export const orders: Order[] = [
  {
    id: "pedido-1",
    customer: customers[0],
    scent: scents[0],
    color: waxColors[0],
    vessel: vessels[0],
    size: sizes[1],
    label: labels[0],
    basePrice: 42000,
    baseTip: 9000,
    productSlug: "vela-lavanda",
  },
  {
    id: "pedido-2",
    customer: customers[1],
    scent: scents[1],
    color: waxColors[1],
    vessel: vessels[1],
    size: sizes[0],
    label: labels[1],
    basePrice: 36000,
    baseTip: 8000,
    productSlug: "vela-vainilla-ambar",
  },
  {
    id: "pedido-3",
    customer: customers[2],
    scent: scents[2],
    color: waxColors[2],
    vessel: vessels[0],
    size: sizes[1],
    label: labels[0],
    basePrice: 42000,
    baseTip: 10000,
    productSlug: "vela-cafe",
  },
];

export const scentsById = Object.fromEntries(
  scents.map((scent) => [scent.id, scent]),
) as Record<string, Scent>;

export const waxColorsById = Object.fromEntries(
  waxColors.map((color) => [color.id, color]),
) as Record<string, WaxColor>;

export const vesselsById = Object.fromEntries(
  vessels.map((vessel) => [vessel.id, vessel]),
) as Record<string, Vessel>;

export const labelsById = Object.fromEntries(
  labels.map((label) => [label.id, label]),
) as Record<string, Label>;

export const sizesById = Object.fromEntries(
  sizes.map((size) => [size.id, size]),
) as Record<string, Size>;
