<script lang="ts">
  import { waxColorsById } from "@lib/game/data";
  import type { Mold } from "@lib/game/types";

  interface Props {
    mold: Mold;
    colors: Record<string, string>;
    fills?: Record<string, number>;
    showWick?: boolean;
  }

  let { mold, colors, fills = {}, showWick = true }: Props = $props();

  function colorHex(partId: string): string {
    const colorId = colors[partId];
    return colorId ? (waxColorsById[colorId]?.hex ?? "#efe2cf") : "#efe2cf";
  }

  function fillRatio(partId: string): number {
    const fill = fills[partId];
    if (fill === undefined) return 1;
    return Math.min(1, Math.max(0, fill / 100));
  }
</script>

<svg class="mold-preview" viewBox="0 0 100 100" fill="none" aria-hidden="true">
  <ellipse cx="50" cy="94" rx="30" ry="4.5" fill="#2a241e" opacity=".12" />

  {#each mold.parts as part}
    <path
      d={part.d}
      fill={colorHex(part.id)}
      fill-opacity={0.18 + 0.82 * fillRatio(part.id)}
      stroke="#8a6a50"
      stroke-width="1.2"
      stroke-linejoin="round"
    />
  {/each}

  {#if showWick}
    <path
      d="M50 14V4"
      stroke="#3b2d25"
      stroke-width="2.2"
      stroke-linecap="round"
    />
    <path
      d="M50 4V1"
      stroke="#b4552f"
      stroke-width="2.2"
      stroke-linecap="round"
    />
  {/if}
</svg>

<style>
  .mold-preview {
    display: block;
    width: 100%;
    height: auto;
    filter: drop-shadow(0 12px 16px rgba(42, 36, 30, 0.14));
  }
</style>
