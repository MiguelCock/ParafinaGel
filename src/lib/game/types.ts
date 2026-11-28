export type StationId =
  "counter" | "design" | "melt" | "pour" | "wick" | "cool" | "finish" | "mix";

export type Phase = "intro" | "brief" | StationId | "score" | "dayEnd";

export type View = "overview" | StationId;

export type GameMode = "guided" | "sandbox";

export type OrderType = "clasico" | "capas" | "figura" | "gel";

export type WaxId =
  | "vaso"
  | "soya-apf"
  | "soya-bpf"
  | "coco"
  | "palma"
  | "molde"
  | "desmoldable"
  | "china"
  | "ecopetrol"
  | "gel";

export type WaxFormat = "block" | "flakes" | "gel";

export type WaxUse = "container" | "mold" | "gel";

export type SupplyCategory =
  | "cera"
  | "mecha"
  | "aditivo"
  | "aceite"
  | "aroma"
  | "color"
  | "recipiente"
  | "molde"
  | "etiqueta"
  | "montaje"
  | "empaque"
  | "herramienta";

export interface Wax {
  id: WaxId;
  nombre: string;
  descripcion: string;
  hex: string;
  meltMin: number;
  meltMax: number;
  heatRate: number;
  coolTime: number;
  transparent: boolean;
  format: WaxFormat;
  use: WaxUse[];
  price: number;
  priceUnit: "kg" | "pote";
  supplyId: string;
  fragranceMin: number;
  fragranceMax: number;
}

export interface WaxColor {
  id: string;
  nombre: string;
  hex: string;
}

export interface Scent {
  id: string;
  nombre: string;
  familia: string;
  notas: string;
}

export type VesselMaterial = "vidrio" | "metal" | "ceramica";

export interface Vessel {
  id: string;
  nombre: string;
  glass: string;
  material: VesselMaterial;
  transparent: boolean;
  capacityG: number;
  diameterMm: number;
}

export interface MoldPart {
  id: string;
  nombre: string;
  d: string;
}

export interface Mold {
  id: string;
  nombre: string;
  descripcion: string;
  parts: MoldPart[];
}

export interface WickType {
  id: string;
  nombre: string;
  material: string;
  diameterMin: number;
  diameterMax: number;
  note: string;
  price: number;
  supplyId: string;
}

export interface Label {
  id: string;
  nombre: string;
  color: string;
  accent: string;
}

export interface Inclusion {
  id: string;
  nombre: string;
  color: string;
  kind: "petal" | "flake" | "bead" | "herb";
}

export interface Size {
  id: string;
  nombre: string;
  grams: number;
  scale: number;
}

export interface Customer {
  id: string;
  nombre: string;
  saludo: string;
  skin: string;
  hair: string;
  shirt: string;
  portrait?: string;
}

export interface LayerDesign {
  id: string;
  colorId: string;
  height: number;
}

export interface CandleDesign {
  mode: OrderType;
  waxId: WaxId | null;
  vesselId: string | null;
  moldId: string | null;
  sizeId: string;
  scentIds: string[];
  layers: LayerDesign[];
  figureColors: Record<string, string>;
  inclusions: string[];
  wickId: string | null;
  labelId: string | null;
  lidOn: boolean;
  wrapped: boolean;
}

export interface BriefNote {
  label: string;
  value: string;
}

export interface BriefLine {
  text: string;
  notes: BriefNote[];
}

export interface BriefTarget {
  type: OrderType;
  waxId: WaxId;
  vesselId?: string;
  moldId?: string;
  sizeId: string;
  scentId: string;
  layerColors?: string[];
  figureColors?: Record<string, string>;
  inclusions?: string[];
  wickId: string;
  labelId: string;
}

export interface Brief {
  id: string;
  type: OrderType;
  customer: Customer;
  title: string;
  summary: string;
  lines: BriefLine[];
  target: BriefTarget;
}

export interface DesignIssue {
  field: string;
  message: string;
  severity: "error" | "warning";
}

export interface PourUnit {
  id: string;
  label: string;
  colorId: string;
  colorHex: string;
  height: number;
  target: number;
  fill: number;
  done: boolean;
  accuracy: number | null;
  grams: number;
  temperature: number;
  heating: boolean;
  /** Knob position for this burner, 0 (off) to 1 (full heat). */
  heatLevel: number;
  scentId: string | null;
  colorDrops: number;
  aromaMl: number;
  aromaPouring: boolean;
  stirs: number;
  mix: number;
}

export interface WickState {
  x: number;
  y: number;
  placed: boolean;
  trimmed: boolean;
  trimMm: number;
}

export interface LabelState {
  x: number;
  y: number;
  rotation: number;
  placed: boolean;
}

export interface Craft {
  temperature: number;
  meltTemperature: number;
  overheated: boolean;
  heating: boolean;
  heatLevel: number;
  cutCuts: number;
  stearicAdded: boolean;
  stirs: number;
  units: PourUnit[];
  unitIndex: number;
  pouring: boolean;
  pourOffset: number;
  mix: number;
  spill: number;
  waitingFilm: boolean;
  filmRemaining: number;
  coolingRemaining: number;
  cooled: boolean;
  gelBubbles: number;
  gelPopped: number;
  gelPopPulse: number;
  gelPopIndex: number;
  wick: WickState;
  holder: boolean;
  holderRemoved: boolean;
  label: LabelState;
  lidOn: boolean;
  wrapped: boolean;
}

export interface DesignScore {
  type: number;
  wax: number;
  vessel: number;
  scent: number;
  colors: number;
  wick: number;
  label: number;
  total: number;
}

export interface ExecutionScore {
  temperature: number;
  prep: number;
  pour: number;
  mix: number;
  spill: number;
  wick: number;
  label: number;
  trim: number;
  gel: number;
  total: number;
}

export interface ScoreBreakdown {
  design: DesignScore;
  execution: ExecutionScore;
  total: number;
  stars: number;
  points: number;
  sandbox: boolean;
}

export interface SupplyItem {
  id: string;
  nombre: string;
  categoria: SupplyCategory;
  unidad: string;
  detalle: string;
  precio?: number;
}

export interface RecipeLine {
  supplyId: string;
  nombre: string;
  categoria: SupplyCategory;
  cantidad: number;
  unidad: string;
  detalle: string;
  precioUnitario?: number;
  porConfirmar?: boolean;
}
