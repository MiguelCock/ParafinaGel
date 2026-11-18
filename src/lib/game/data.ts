import type {
  Brief,
  Customer,
  Inclusion,
  Label,
  Mold,
  OrderType,
  Scent,
  Size,
  StationId,
  SupplyItem,
  Vessel,
  Wax,
  WaxColor,
  WickType,
} from "./types";

export const stationOrder: StationId[] = [
  "counter",
  "design",
  "melt",
  "pour",
  "wick",
  "cool",
  "finish",
];

export const stationLabels: Record<StationId, string> = {
  counter: "Mostrador",
  design: "Diseño",
  melt: "Cera",
  pour: "Vertido",
  wick: "Mecha",
  cool: "Curado",
  finish: "Acabado",
};

export const orderTypeLabels: Record<OrderType, string> = {
  clasico: "Clásica",
  capas: "Capas",
  figura: "Figura",
  gel: "Gel",
};

export const orderTypeDescriptions: Record<OrderType, string> = {
  clasico: "Una capa, un color y un aroma. Lo esencial, bien hecho.",
  capas: "Varias capas de color apiladas con cuidado.",
  figura: "Un molde con partes que se llenan de colores distintos.",
  gel: "Parafina gel transparente con montajes suspendidos.",
};

export const supplyCategoryLabels: Record<string, string> = {
  cera: "Ceras",
  mecha: "Mechas",
  aroma: "Aromas",
  color: "Colorantes",
  recipiente: "Recipientes",
  molde: "Moldes",
  etiqueta: "Etiquetas",
  montaje: "Montajes",
  empaque: "Empaques",
  herramienta: "Herramientas",
};

export const waxes: Wax[] = [
  {
    id: "soya",
    nombre: "Soya",
    descripcion: "Cera vegetal de acabado cremoso, ideal para capas.",
    hex: "#f3e3cd",
    meltMin: 62,
    meltMax: 76,
    heatRate: 9,
    coolTime: 8,
    transparent: false,
  },
  {
    id: "parafina",
    nombre: "Parafina",
    descripcion: "Cera clásica de vela en vaso, con buen brillo.",
    hex: "#f7ead8",
    meltMin: 60,
    meltMax: 74,
    heatRate: 10,
    coolTime: 7,
    transparent: false,
  },
  {
    id: "gel",
    nombre: "Parafina gel",
    descripcion: "Cera transparente para montajes y diseños de gel.",
    hex: "#eaf3ee",
    meltMin: 65,
    meltMax: 80,
    heatRate: 8,
    coolTime: 9,
    transparent: true,
  },
];

export const waxColors: WaxColor[] = [
  { id: "natural", nombre: "Natural", hex: "#efe2cf" },
  { id: "crema", nombre: "Crema", hex: "#f7e8cf" },
  { id: "terracota", nombre: "Terracota", hex: "#b4552f" },
  { id: "ambar", nombre: "Ámbar", hex: "#c98a4b" },
  { id: "salvia", nombre: "Salvia", hex: "#7c8b72" },
  { id: "lavanda", nombre: "Lavanda", hex: "#9b8bb4" },
  { id: "rosa", nombre: "Rosa", hex: "#d99a92" },
  { id: "azul", nombre: "Azul", hex: "#7f95ab" },
  { id: "grafito", nombre: "Grafito", hex: "#5b5d63" },
];

export const scents: Scent[] = [
  {
    id: "lavanda",
    nombre: "Lavanda",
    familia: "Floral",
    notas: "Lavanda y hierba",
  },
  {
    id: "vainilla",
    nombre: "Vainilla",
    familia: "Dulce",
    notas: "Vainilla y madera",
  },
  { id: "cafe", nombre: "Café", familia: "Cálido", notas: "Café y cacao" },
  {
    id: "citricos",
    nombre: "Cítricos",
    familia: "Fresco",
    notas: "Naranja y limón",
  },
  { id: "rosas", nombre: "Rosas", familia: "Floral", notas: "Rosa y pétalos" },
  {
    id: "madera",
    nombre: "Madera",
    familia: "Amaderado",
    notas: "Cedro y resina",
  },
];

export const vessels: Vessel[] = [
  {
    id: "ambar",
    nombre: "Frasco ámbar",
    glass: "#d8a45f",
    transparent: false,
    capacityG: 250,
    diameterMm: 70,
  },
  {
    id: "claro",
    nombre: "Frasco claro",
    glass: "#f4ead9",
    transparent: true,
    capacityG: 220,
    diameterMm: 65,
  },
  {
    id: "cristal",
    nombre: "Vaso de cristal",
    glass: "#e8f2f0",
    transparent: true,
    capacityG: 260,
    diameterMm: 75,
  },
];

export const molds: Mold[] = [
  {
    id: "corazon",
    nombre: "Corazón",
    descripcion: "Molde de una pieza, tierno y sencillo.",
    parts: [
      {
        id: "corazon",
        nombre: "Corazón",
        d: "M50 88C30 72 12 56 12 36 12 20 24 10 38 10c5 0 9 2 12 6 3-4 7-6 12-6 14 0 26 10 26 26 0 20-18 36-38 52Z",
      },
    ],
  },
  {
    id: "luna",
    nombre: "Luna",
    descripcion: "Luna y estrella en dos partes para combinar colores.",
    parts: [
      {
        id: "luna",
        nombre: "Luna",
        d: "M64 8C42 12 26 32 26 52s16 40 38 40c8 0 16-2 22-6-18-5-30-21-30-40S46 14 64 8Z",
      },
      {
        id: "estrella",
        nombre: "Estrella",
        d: "M78 26l5 12 13 1-10 9 3 13-11-7-11 7 3-13-10-9 13-1Z",
      },
    ],
  },
  {
    id: "flor",
    nombre: "Flor",
    descripcion: "Tres partes: pétalos, centro y hoja.",
    parts: [
      {
        id: "petalos",
        nombre: "Pétalos",
        d: "M50 12c8 0 15 6 15 14 0 3-1 6-3 8 7-2 15 0 20 6 6 7 5 17-1 23-3 3-6 4-9 4 6 5 8 13 4 20-4 7-13 10-20 6-2-1-4-3-6-5-1 3-3 5-5 6-7 4-16 1-20-6-4-7-2-15 4-20-3 0-6-1-9-4-6-6-7-16-1-23 5-6 13-8 20-6-2-2-3-5-3-8 0-8 7-14 15-14Z",
      },
      {
        id: "centro",
        nombre: "Centro",
        d: "M50 40a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z",
      },
      {
        id: "hoja",
        nombre: "Hoja",
        d: "M20 84c-4-12 2-24 16-30 2 13-4 25-16 30Z",
      },
    ],
  },
  {
    id: "osito",
    nombre: "Osito",
    descripcion: "Cuerpo y hocico para un detalle de dos tonos.",
    parts: [
      {
        id: "cuerpo",
        nombre: "Cuerpo",
        d: "M50 20c-7 0-13 3-17 8-6-5-15-3-17 5-2 7 3 13 9 15-2 4-3 8-3 12 0 15 13 27 28 27s28-12 28-27c0-4-1-8-3-12 6-2 11-8 9-15-2-8-11-10-17-5-4-5-10-8-17-8Z",
      },
      {
        id: "hocico",
        nombre: "Hocico",
        d: "M50 48c-8 0-14 5-14 12s6 12 14 12 14-5 14-12-6-12-14-12Z",
      },
    ],
  },
];

export const wickTypes: WickType[] = [
  {
    id: "eco",
    nombre: "Eco",
    material: "Algodón tratado",
    diameterMin: 40,
    diameterMax: 62,
    note: "Para recipientes pequeños.",
  },
  {
    id: "algodon",
    nombre: "Algodón",
    material: "Algodón trenzado",
    diameterMin: 50,
    diameterMax: 80,
    note: "La opción más versátil.",
  },
  {
    id: "madera",
    nombre: "Madera",
    material: "Lámina de madera",
    diameterMin: 60,
    diameterMax: 95,
    note: "Llama amplia y crepitar suave.",
  },
  {
    id: "doble",
    nombre: "Doble",
    material: "Dos mechas de algodón",
    diameterMin: 70,
    diameterMax: 110,
    note: "Para recipientes anchos.",
  },
];

export const labels: Label[] = [
  { id: "clasica", nombre: "Clásica", color: "#fbf3e9", accent: "#b4552f" },
  { id: "regalo", nombre: "Regalo", color: "#f3ddd2", accent: "#8f5f40" },
  { id: "minimal", nombre: "Minimal", color: "#fffdf9", accent: "#2a241e" },
];

export const inclusions: Inclusion[] = [
  { id: "flores", nombre: "Flores secas", color: "#c98a4b", kind: "petal" },
  { id: "brillo", nombre: "Brillo dorado", color: "#d9b45f", kind: "flake" },
  { id: "cuentas", nombre: "Cuentas", color: "#9b8bb4", kind: "bead" },
  { id: "hierbas", nombre: "Hierbas", color: "#7c8b72", kind: "herb" },
];

export const sizes: Size[] = [
  { id: "180", nombre: "180 g", grams: 180, scale: 0.9 },
  { id: "250", nombre: "250 g", grams: 250, scale: 1 },
];

export const customers: Customer[] = [
  {
    id: "marta",
    nombre: "Doña Marta",
    saludo: "Busco una vela suave para la sala.",
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
    saludo: "Quiero una figura para mi escritorio.",
    skin: "#e0b08a",
    hair: "#a35c32",
    shirt: "#c98a4b",
  },
  {
    id: "lucia",
    nombre: "Lucía",
    saludo: "Me encantan las velas transparentes.",
    skin: "#c98f6d",
    hair: "#3d2b2b",
    shirt: "#9b8bb4",
  },
];

export const briefs: Brief[] = [
  {
    id: "brief-clasico",
    type: "clasico",
    customer: customers[0],
    title: "Una vela de sala",
    summary: "Clásica de lavanda en frasco ámbar, 250 g, mecha de algodón.",
    lines: [
      {
        text: "Buenas tardes. Busco una vela suave para la sala.",
        notes: [{ label: "Ocasión", value: "Sala" }],
      },
      {
        text: "Que huela a lavanda, de esas que calman.",
        notes: [{ label: "Aroma", value: "Lavanda" }],
      },
      {
        text: "En un frasco ámbar de 250 g, por favor.",
        notes: [
          { label: "Recipiente", value: "Frasco ámbar" },
          { label: "Tamaño", value: "250 g" },
        ],
      },
      {
        text: "Y en color crema, con etiqueta clásica.",
        notes: [
          { label: "Color", value: "Crema" },
          { label: "Etiqueta", value: "Clásica" },
        ],
      },
      {
        text: "Con mecha de algodón, que es la que siempre uso.",
        notes: [{ label: "Mecha", value: "Algodón" }],
      },
    ],
    target: {
      type: "clasico",
      waxId: "soya",
      vesselId: "ambar",
      sizeId: "250",
      scentId: "lavanda",
      layerColors: ["crema"],
      wickId: "algodon",
      labelId: "clasica",
    },
  },
  {
    id: "brief-capas",
    type: "capas",
    customer: customers[1],
    title: "Atardecer en capas",
    summary: "Tres capas terracota, ámbar y crema, aroma a vainilla.",
    lines: [
      {
        text: "Hola, es un regalo para mi mamá.",
        notes: [{ label: "Ocasión", value: "Regalo" }],
      },
      {
        text: "Quiero una vela con capas de color, como un atardecer.",
        notes: [{ label: "Tipo", value: "Capas" }],
      },
      {
        text: "Terracota abajo, ámbar en el medio y crema arriba.",
        notes: [{ label: "Capas", value: "Terracota · Ámbar · Crema" }],
      },
      {
        text: "Con aroma a vainilla y frasco claro.",
        notes: [
          { label: "Aroma", value: "Vainilla" },
          { label: "Recipiente", value: "Frasco claro" },
        ],
      },
      {
        text: "Mecha de algodón y etiqueta de regalo, por favor.",
        notes: [
          { label: "Mecha", value: "Algodón" },
          { label: "Etiqueta", value: "Regalo" },
        ],
      },
    ],
    target: {
      type: "capas",
      waxId: "soya",
      vesselId: "claro",
      sizeId: "250",
      scentId: "vainilla",
      layerColors: ["terracota", "ambar", "crema"],
      wickId: "algodon",
      labelId: "regalo",
    },
  },
  {
    id: "brief-figura",
    type: "figura",
    customer: customers[2],
    title: "Luna de escritorio",
    summary: "Molde de luna en ámbar y estrella crema, aroma a café.",
    lines: [
      {
        text: "Busco una figura pequeña para mi escritorio.",
        notes: [{ label: "Ocasión", value: "Escritorio" }],
      },
      {
        text: "Un molde de luna; la luna ámbar y la estrella crema.",
        notes: [
          { label: "Molde", value: "Luna" },
          { label: "Partes", value: "Luna ámbar · Estrella crema" },
        ],
      },
      {
        text: "Con aroma a café, que me despierte.",
        notes: [{ label: "Aroma", value: "Café" }],
      },
      {
        text: "Mecha de madera y etiqueta minimal.",
        notes: [
          { label: "Mecha", value: "Madera" },
          { label: "Etiqueta", value: "Minimal" },
        ],
      },
    ],
    target: {
      type: "figura",
      waxId: "soya",
      moldId: "luna",
      sizeId: "180",
      scentId: "cafe",
      figureColors: { luna: "ambar", estrella: "crema" },
      wickId: "madera",
      labelId: "minimal",
    },
  },
  {
    id: "brief-gel",
    type: "gel",
    customer: customers[3],
    title: "Jardín transparente",
    summary: "Vaso de cristal con flores y brillo, aroma a rosas.",
    lines: [
      {
        text: "Me encantan las velas transparentes.",
        notes: [{ label: "Tipo", value: "Gel" }],
      },
      {
        text: "Con flores secas atrapadas adentro.",
        notes: [{ label: "Montaje", value: "Flores secas" }],
      },
      {
        text: "En un vaso de cristal, con un poco de brillo dorado.",
        notes: [
          { label: "Recipiente", value: "Vaso de cristal" },
          { label: "Montaje", value: "Brillo dorado" },
        ],
      },
      {
        text: "Aroma a rosas y mecha de algodón.",
        notes: [
          { label: "Aroma", value: "Rosas" },
          { label: "Mecha", value: "Algodón" },
        ],
      },
      {
        text: "Etiqueta minimal, para que se vea limpio.",
        notes: [{ label: "Etiqueta", value: "Minimal" }],
      },
    ],
    target: {
      type: "gel",
      waxId: "gel",
      vesselId: "cristal",
      sizeId: "250",
      scentId: "rosas",
      inclusions: ["flores", "brillo"],
      wickId: "algodon",
      labelId: "minimal",
    },
  },
];

function indexById<T extends { id: string }>(items: T[]): Record<string, T> {
  return Object.fromEntries(items.map((item) => [item.id, item]));
}

export const waxesById = indexById(waxes);
export const waxColorsById = indexById(waxColors);
export const scentsById = indexById(scents);
export const vesselsById = indexById(vessels);
export const moldsById = indexById(molds);
export const wickTypesById = indexById(wickTypes);
export const labelsById = indexById(labels);
export const inclusionsById = indexById(inclusions);
export const sizesById = indexById(sizes);
export const customersById = indexById(customers);
export const briefsById = indexById(briefs);

export const supplyCatalog: SupplyItem[] = [
  ...waxes.map((wax) => ({
    id: `cera-${wax.id}`,
    nombre:
      wax.id === "gel"
        ? "Parafina gel"
        : wax.id === "soya"
          ? "Cera de soya"
          : "Parafina",
    categoria: "cera" as const,
    unidad: "g",
    detalle: wax.descripcion,
  })),
  ...wickTypes.map((wick) => ({
    id: `mecha-${wick.id}`,
    nombre: `Mecha ${wick.nombre.toLowerCase()}`,
    categoria: "mecha" as const,
    unidad: "unidad",
    detalle: `${wick.material} · ${wick.note}`,
  })),
  ...scents.map((scent) => ({
    id: `aroma-${scent.id}`,
    nombre: `Aroma ${scent.nombre.toLowerCase()}`,
    categoria: "aroma" as const,
    unidad: "ml",
    detalle: `${scent.familia} · ${scent.notas}`,
  })),
  ...waxColors.map((color) => ({
    id: `color-${color.id}`,
    nombre: `Colorante ${color.nombre.toLowerCase()}`,
    categoria: "color" as const,
    unidad: "gotas",
    detalle: "Colorante concentrado para cera.",
  })),
  ...vessels.map((vessel) => ({
    id: `recipiente-${vessel.id}`,
    nombre: vessel.nombre,
    categoria: "recipiente" as const,
    unidad: "unidad",
    detalle: `${vessel.capacityG} g · ${vessel.diameterMm} mm de diámetro`,
  })),
  ...molds.map((mold) => ({
    id: `molde-${mold.id}`,
    nombre: `Molde ${mold.nombre.toLowerCase()}`,
    categoria: "molde" as const,
    unidad: "unidad",
    detalle: mold.descripcion,
  })),
  ...labels.map((label) => ({
    id: `etiqueta-${label.id}`,
    nombre: `Etiqueta ${label.nombre.toLowerCase()}`,
    categoria: "etiqueta" as const,
    unidad: "unidad",
    detalle: "Etiqueta adhesiva para el acabado.",
  })),
  ...inclusions.map((inclusion) => ({
    id: `montaje-${inclusion.id}`,
    nombre: inclusion.nombre,
    categoria: "montaje" as const,
    unidad: "porción",
    detalle: "Montaje decorativo para parafina gel.",
  })),
  {
    id: "tapa-generica",
    nombre: "Tapa para recipiente",
    categoria: "empaque",
    unidad: "unidad",
    detalle: "Tapa de ajuste para el recipiente elegido.",
  },
  {
    id: "empaque-lazo",
    nombre: "Empaque y lazo",
    categoria: "empaque",
    unidad: "unidad",
    detalle: "Papel de regalo y lazo de algodón.",
  },
  {
    id: "herramienta-termometro",
    nombre: "Termómetro de cera",
    categoria: "herramienta",
    unidad: "unidad",
    detalle: "Termómetro para baño maría.",
  },
  {
    id: "herramienta-jarra",
    nombre: "Jarra de vertido",
    categoria: "herramienta",
    unidad: "unidad",
    detalle: "Jarra con pico para verter por capas.",
  },
];

export const suppliesById = indexById(supplyCatalog);
