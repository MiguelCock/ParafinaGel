export type StationId = "counter" | "melt" | "pour" | "cool" | "finish";
export type Phase = "intro" | StationId | "score" | "dayEnd";
export type View = "overview" | StationId;
export type Quality = "alta" | "baja";

export interface Scent {
  id: string;
  nombre: string;
}

export interface WaxColor {
  id: string;
  nombre: string;
  hex: string;
}

export interface Vessel {
  id: string;
  nombre: string;
  glass: string;
}

export interface Label {
  id: string;
  nombre: string;
  color: string;
}

export interface Size {
  id: string;
  nombre: string;
  scale: number;
}

export interface Customer {
  id: string;
  nombre: string;
  saludo: string;
  skin: string;
  hair: string;
  shirt: string;
}

export interface Order {
  id: string;
  customer: Customer;
  scent: Scent;
  color: WaxColor;
  vessel: Vessel;
  size: Size;
  label: Label;
  basePrice: number;
  baseTip: number;
  productSlug: string;
}

export interface Craft {
  temperature: number;
  meltTemperature: number;
  overheated: boolean;
  heating: boolean;
  scentId: string | null;
  colorId: string | null;
  vesselId: string | null;
  labelId: string | null;
  stirs: number;
  fill: number;
  pouring: boolean;
  coolingRemaining: number;
  cooled: boolean;
  wickTrimmed: boolean;
  lidOn: boolean;
  wrapped: boolean;
}

export interface ScoreBreakdown {
  scent: number;
  color: number;
  vessel: number;
  label: number;
  temperature: number;
  fill: number;
  finish: number;
  total: number;
  stars: number;
  price: number;
  tip: number;
}

export interface PerformanceStats {
  fps: number;
  calls: number;
  triangles: number;
}
