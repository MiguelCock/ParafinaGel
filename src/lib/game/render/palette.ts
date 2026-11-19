export const stageColors = {
  cream: 0xf8ecdd,
  creamDeep: 0xeed8c1,
  surface: 0xfff9f2,
  paper: 0xfbf3e9,
  wood: 0xb98963,
  woodLight: 0xd2a77e,
  woodDark: 0x8f5f40,
  accent: 0xb4552f,
  accentSoft: 0xf3ddd2,
  accentStrong: 0x8f3f20,
  sage: 0x4f6247,
  sageSoft: 0xe4eadf,
  amber: 0xc98a4b,
  ink: 0x2a241e,
  muted: 0x7a6450,
  border: 0xd8c3ad,
  glass: 0xf4ead9,
  steel: 0x8a8d8a,
  steelDark: 0x64675f,
  white: 0xffffff,
  shadow: 0x2a241e,
} as const;

export function hexColor(hex: string): number {
  return Number.parseInt(hex.replace("#", ""), 16);
}

export function mixHex(a: string, b: string, amount: number): string {
  const t = Math.min(1, Math.max(0, amount));
  const ar = Number.parseInt(a.slice(1, 3), 16);
  const ag = Number.parseInt(a.slice(3, 5), 16);
  const ab = Number.parseInt(a.slice(5, 7), 16);
  const br = Number.parseInt(b.slice(1, 3), 16);
  const bg = Number.parseInt(b.slice(3, 5), 16);
  const bb = Number.parseInt(b.slice(5, 7), 16);
  const toHex = (value: number) =>
    Math.round(value).toString(16).padStart(2, "0");
  return `#${toHex(ar + (br - ar) * t)}${toHex(ag + (bg - ag) * t)}${toHex(ab + (bb - ab) * t)}`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}
