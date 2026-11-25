import type { Customer } from "./types";

export type PortraitExpression = "neutral" | "happy" | "doubt";

function hairLayers(customer: Customer): {
  back: string;
  front: string;
  extas: string;
} {
  if (customer.id === "marta") {
    return {
      back: `
        <path d="M52 108c-4-44 20-68 48-68s52 24 48 68c-1 18-6 32-13 45h-18c7-13 11-27 10-42-16 11-40 14-59 8-2 14-7 27-15 39H35c10-15 16-33 17-50Z" fill="${customer.hair}" />
        <circle cx="100" cy="28" r="17" fill="${customer.hair}" />
        <rect x="92" y="41" width="16" height="6" rx="3" fill="#c9a227" opacity=".55" />`,
      front: `
        <path d="M60 84c-2-26 16-43 40-43s43 16 42 43c-8-5-13-14-16-24-15 12-37 16-56 12-2 5-5 9-10 12Z" fill="${customer.hair}" />
        <path d="M64 63c8-5 18-8 28-7M109 55c9 1 17 5 23 10" stroke="#d8d2ca" stroke-width="3" stroke-linecap="round" fill="none" opacity=".65" />`,
      extas: `
        <circle cx="58" cy="109" r="3" fill="#c9a227" />
        <circle cx="142" cy="109" r="3" fill="#c9a227" />`,
    };
  }

  if (customer.id === "nico") {
    return {
      back: `<path d="M57 90c-2-34 18-54 43-54 27 0 47 20 45 54-8-3-14-9-18-18-16 8-34 11-54 8-4 5-9 8-16 10Z" fill="${customer.hair}" />`,
      front: `
        <path d="M60 82c-1-27 17-45 40-45s43 17 42 45c-9-1-16-7-20-17-13 9-30 13-50 11-3 4-7 6-12 6Z" fill="${customer.hair}" />
        <path d="M61 88c-3 5-4 11-2 16M139 88c3 5 4 11 2 16" stroke="${customer.hair}" stroke-width="5" stroke-linecap="round" />`,
      extas: "",
    };
  }

  return {
    back: `
      <path d="M50 110c-6-48 18-75 50-75s56 27 50 75c-2 24-10 46-22 62h-18c10-17 15-36 14-55-15 10-37 13-58 8-1 17-6 34-15 49H32c12-18 18-39 18-64Z" fill="${customer.hair}" />
      <path d="M52 132c-2 22 1 42 8 58M148 132c2 22-1 42-8 58" fill="none" stroke="${customer.hair}" stroke-width="13" stroke-linecap="round" opacity=".95" />`,
    front: `
      <path d="M58 86c-2-30 18-49 42-49s44 18 43 49c-8-4-14-13-17-24-14 11-35 15-57 11-2 6-6 10-11 13Z" fill="${customer.hair}" />
      <path d="M58 98c-1 16 0 30 4 42M142 98c1 16 0 30-4 42" fill="none" stroke="${customer.hair}" stroke-width="7" stroke-linecap="round" opacity=".9" />`,
    extas: "",
  };
}

export function portraitSvg(
  customer: Customer,
  uid: string = customer.id,
  expression: PortraitExpression = "neutral",
): string {
  const bgId = `portrait-bg-${uid}`;
  const shirtId = `portrait-shirt-${uid}`;
  const hair = hairLayers(customer);
  const face =
    expression === "happy"
      ? `
  <path d="M78 94c4-4 10-4 14 0M108 94c4-4 10-4 14 0" fill="none" stroke="#3b2d25" stroke-width="2.4" stroke-linecap="round" />
  <path d="M78 103c4 4 8 4 12 0M110 103c4 4 8 4 12 0" fill="none" stroke="#3b2d25" stroke-width="2.4" stroke-linecap="round" />
  <path d="M99 107c0 5-2 8-5 9" fill="none" stroke="#8f5f40" stroke-width="2" stroke-linecap="round" opacity=".6" />
  <path d="M84 120c8 9 24 9 32 0" fill="none" stroke="#7a3f2c" stroke-width="3" stroke-linecap="round" />
  <circle cx="72" cy="117" r="6" fill="#b4552f" opacity=".18" />
  <circle cx="128" cy="117" r="6" fill="#b4552f" opacity=".18" />`
      : expression === "doubt"
        ? `
  <path d="M78 91c5-5 11-5 15-2M108 96c4-4 10-4 14 0" fill="none" stroke="#3b2d25" stroke-width="2.4" stroke-linecap="round" />
  <ellipse cx="85" cy="104" rx="3.2" ry="4" fill="#3b2d25" />
  <ellipse cx="115" cy="104" rx="3.2" ry="4" fill="#3b2d25" />
  <circle cx="85" cy="103" r="1" fill="#fff9f2" />
  <circle cx="115" cy="103" r="1" fill="#fff9f2" />
  <path d="M99 107c0 5-2 8-5 9" fill="none" stroke="#8f5f40" stroke-width="2" stroke-linecap="round" opacity=".6" />
  <path d="M88 124c7-3 17-3 24 0" fill="none" stroke="#7a3f2c" stroke-width="3" stroke-linecap="round" />
  <circle cx="72" cy="117" r="6" fill="#b4552f" opacity=".1" />
  <circle cx="128" cy="117" r="6" fill="#b4552f" opacity=".1" />`
        : `
  <path d="M78 96c4-4 10-4 14 0M108 96c4-4 10-4 14 0" fill="none" stroke="#3b2d25" stroke-width="2.4" stroke-linecap="round" />
  <ellipse cx="85" cy="104" rx="3.2" ry="4" fill="#3b2d25" />
  <ellipse cx="115" cy="104" rx="3.2" ry="4" fill="#3b2d25" />
  <circle cx="85" cy="103" r="1" fill="#fff9f2" />
  <circle cx="115" cy="103" r="1" fill="#fff9f2" />
  <path d="M99 107c0 5-2 8-5 9" fill="none" stroke="#8f5f40" stroke-width="2" stroke-linecap="round" opacity=".6" />
  <path d="M88 124c7 5 17 5 24 0" fill="none" stroke="#7a3f2c" stroke-width="3" stroke-linecap="round" />
  <circle cx="72" cy="117" r="6" fill="#b4552f" opacity=".14" />
  <circle cx="128" cy="117" r="6" fill="#b4552f" opacity=".14" />`;

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" role="img" aria-hidden="true">
  <defs>
    <radialGradient id="${bgId}" cx="50%" cy="35%" r="75%">
      <stop offset="0%" stop-color="#fffaf1" />
      <stop offset="100%" stop-color="#f1ddc7" />
    </radialGradient>
    <linearGradient id="${shirtId}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${customer.shirt}" stop-opacity=".95" />
      <stop offset="100%" stop-color="${customer.shirt}" stop-opacity=".75" />
    </linearGradient>
  </defs>

  <rect width="200" height="200" fill="url(#${bgId})" />
  <circle cx="100" cy="96" r="78" fill="none" stroke="#e2cbb2" stroke-width="1.5" opacity=".55" />
  <circle cx="154" cy="48" r="4" fill="#b4552f" opacity=".25" />
  <circle cx="46" cy="62" r="2.5" fill="#7c8b72" opacity=".35" />

  <g class="portrait__hair-back">${hair.back}</g>

  <path d="M26 200c2-37 28-64 74-64s72 27 74 64Z" fill="url(#${shirtId})" />
  <path d="M82 129h36v23c0 10-8 18-18 18s-18-8-18-18Z" fill="${customer.skin}" />
  <path d="M78 139c8 7 16 10 22 10s14-3 22-10" fill="none" stroke="#000" stroke-opacity=".08" stroke-width="3" />

  <ellipse cx="100" cy="95" rx="43" ry="49" fill="${customer.skin}" />
  <ellipse cx="58" cy="99" rx="8" ry="12" fill="${customer.skin}" />
  <ellipse cx="142" cy="99" rx="8" ry="12" fill="${customer.skin}" />

  <g class="portrait__hair-front">${hair.front}</g>
  ${hair.extas}
  ${face}
</svg>`;
}

export function portraitDataUrl(
  customer: Customer,
  uid: string = customer.id,
  expression: PortraitExpression = "neutral",
): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    portraitSvg(customer, uid, expression),
  )}`;
}
