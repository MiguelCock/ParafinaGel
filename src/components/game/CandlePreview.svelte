<script lang="ts">
  import {
    inclusionsById,
    labelsById,
    moldsById,
    vesselMaterialStroke,
    vesselsById,
    waxColorsById,
    waxesById,
  } from "@lib/game/data";
  import type { CandleDesign } from "@lib/game/types";
  import MoldPreview from "./MoldPreview.svelte";

  interface Props {
    design: CandleDesign;
    fills?: Record<string, number>;
    showWick?: boolean;
    showLabel?: boolean;
    placement?: { x: number; y: number; rotation: number } | null;
    showFlame?: boolean;
    trimMm?: number;
    compact?: boolean;
  }

  let {
    design,
    fills = {},
    showWick = true,
    showLabel = false,
    placement = null,
    showFlame = false,
    trimMm,
    compact = false,
  }: Props = $props();

  const mold = $derived(
    design.mode === "figura" && design.moldId
      ? (moldsById[design.moldId] ?? null)
      : null,
  );
  const vessel = $derived(
    design.vesselId ? (vesselsById[design.vesselId] ?? null) : null,
  );
  const vesselStroke = $derived(
    vessel ? vesselMaterialStroke[vessel.material] : "#6f5541",
  );
  const label = $derived(
    design.labelId ? (labelsById[design.labelId] ?? null) : null,
  );
  const wax = $derived(design.waxId ? (waxesById[design.waxId] ?? null) : null);
  const gel = $derived(design.mode === "gel");

  const jarTop = 86;
  const jarBottom = 222;
  const jarHeight = jarBottom - jarTop;
  const jarX = 62;
  const jarWidth = 76;

  function colorHex(colorId: string | null): string {
    if (!colorId) return "#efe2cf";
    return waxColorsById[colorId]?.hex ?? "#efe2cf";
  }

  function ratio(unitId: string): number {
    const fill = fills[unitId];
    if (fill === undefined) return 1;
    return Math.min(1, Math.max(0, fill / 100));
  }

  const layerBands = $derived.by(() => {
    if (design.mode === "figura" || gel) return [];
    let cursor = jarBottom;
    return design.layers.map((layer) => {
      const bandHeight = (layer.height / 100) * jarHeight;
      const filled = bandHeight * ratio(layer.id);
      const y = cursor - filled;
      cursor -= bandHeight;
      return {
        id: layer.id,
        x: jarX + 2,
        y,
        width: jarWidth - 4,
        height: Math.max(0, filled),
        color: colorHex(layer.colorId),
      };
    });
  });

  const gelFill = $derived(ratio("gel"));

  const waxTop = $derived.by(() => {
    if (gel) return jarBottom - jarHeight * gelFill;
    if (design.mode === "figura") return 18;
    const filled = layerBands.reduce((sum, band) => sum + band.height, 0);
    return jarBottom - filled;
  });

  const wickLength = $derived(
    trimMm === undefined ? 16 : Math.max(5, Math.min(19, trimMm * 1.7)),
  );

  const labelX = $derived(100 + (placement?.x ?? 0) * 0.55);
  const labelY = $derived(178 + (placement?.y ?? 0) * 0.55);
  const labelRotation = $derived(placement?.rotation ?? 0);

  const inclusionItems = $derived.by(() => {
    const items: {
      id: string;
      kind: string;
      color: string;
      x: number;
      y: number;
      rotation: number;
    }[] = [];
    const positions = [
      { x: 78, y: 120 },
      { x: 122, y: 138 },
      { x: 88, y: 160 },
      { x: 116, y: 184 },
      { x: 84, y: 198 },
      { x: 124, y: 208 },
    ];
    design.inclusions.forEach((inclusionId, inclusionIndex) => {
      const inclusion = inclusionsById[inclusionId];
      if (!inclusion) return;
      for (let i = 0; i < 3; i += 1) {
        const spot =
          positions[(inclusionIndex * 3 + i) % positions.length] ??
          positions[0]!;
        items.push({
          id: `${inclusionId}-${i}`,
          kind: inclusion.kind,
          color: inclusion.color,
          x: spot.x,
          y: spot.y,
          rotation: (inclusionIndex * 24 + i * 17) % 50,
        });
      }
    });
    return items;
  });

  const labelText = $derived(label?.nombre ?? "ParafinaGel");
</script>

{#if mold}
  <div class="candle-preview candle-preview--mold" class:compact>
    <MoldPreview {mold} colors={design.figureColors} {fills} {showWick} />
    {#if showLabel && label}
      <span
        class="mold-tag"
        style={`--tag: ${label.color}; --tag-ink: ${label.accent}`}
      >
        {labelText}
      </span>
    {/if}
  </div>
{:else}
  <svg
    class="candle-preview"
    class:compact
    viewBox="0 0 200 260"
    fill="none"
    aria-hidden="true"
  >
    <ellipse cx="100" cy="242" rx="62" ry="9" fill="#2a241e" opacity=".12" />

    <rect
      x={jarX}
      y={jarTop}
      width={jarWidth}
      height={jarHeight}
      rx="18"
      fill={vessel?.glass ?? "#f4ead9"}
      fill-opacity={vessel?.transparent ? 0.2 : 0.5}
      stroke={vesselStroke}
      stroke-width="3.2"
    />

    {#if gel}
      {#if gelFill > 0}
        <rect
          x={jarX + 2}
          y={jarBottom - jarHeight * gelFill}
          width={jarWidth - 4}
          height={jarHeight * gelFill}
          rx="14"
          fill={wax?.hex ?? "#eaf3ee"}
          fill-opacity=".42"
        />
        {#each inclusionItems as item (item.id)}
          <g
            opacity={0.35 + gelFill * 0.6}
            transform={`translate(${item.x} ${item.y}) rotate(${item.rotation})`}
          >
            {#if item.kind === "petal"}
              <ellipse rx="4.5" ry="2.5" fill={item.color} opacity=".85" />
              <ellipse
                rx="2.8"
                ry="1.6"
                fill={item.color}
                opacity=".6"
                transform="translate(4 3) rotate(35)"
              />
            {:else if item.kind === "flake"}
              <rect
                x="-3"
                y="-1.4"
                width="6"
                height="2.8"
                rx="1"
                fill={item.color}
              />
            {:else if item.kind === "bead"}
              <circle r="2.6" fill={item.color} opacity=".8" />
            {:else}
              <path
                d="M0 0c6-5 9-9 8-13-4 0-7 4-8 13Z"
                fill={item.color}
                opacity=".8"
              />
            {/if}
          </g>
        {/each}
      {/if}
      <text
        x="100"
        y="104"
        text-anchor="middle"
        font-family="Fraunces Variable, Georgia, serif"
        font-size="7"
        fill="#6f5541"
        opacity=".65"
      >
        GEL
      </text>
    {:else}
      {#each layerBands as band (band.id)}
        {#if band.height > 0.5}
          <rect
            x={band.x}
            y={band.y}
            width={band.width}
            height={band.height + 1}
            rx="4"
            fill={band.color}
          />
        {/if}
      {/each}
      {#if layerBands.length > 0 && wax}
        <text
          x="100"
          y={Math.max(jarTop + 12, waxTop + 12)}
          text-anchor="middle"
          font-family="Fraunces Variable, Georgia, serif"
          font-size="7"
          fill="#5c4838"
          opacity=".55"
        >
          {wax.nombre.toUpperCase()}
        </text>
      {/if}
    {/if}

    <rect
      x={jarX + 7}
      y={jarTop + 10}
      width="7"
      height={jarHeight - 22}
      rx="3.5"
      fill="#fffaf2"
      opacity=".38"
    />

    <rect
      x={jarX}
      y={jarTop}
      width={jarWidth}
      height={jarHeight}
      rx="18"
      stroke={vesselStroke}
      stroke-width="3.2"
    />
    <rect
      x={jarX - 4}
      y={jarTop - 10}
      width={jarWidth + 8}
      height="13"
      rx="6"
      fill={vessel?.glass ?? "#f4ead9"}
      stroke="#6f5541"
      stroke-width="2.4"
    />

    {#if showLabel && label}
      <g transform={`translate(${labelX} ${labelY}) rotate(${labelRotation})`}>
        <rect
          x="-29"
          y="-16"
          width="58"
          height="32"
          rx="3"
          fill={label.color}
          stroke="#d8c3ad"
          stroke-width="1.2"
        />
        <rect
          x="-19"
          y="-7"
          width="38"
          height="2.6"
          rx="1.3"
          fill={label.accent}
        />
        <text
          x="0"
          y="7"
          text-anchor="middle"
          font-family="Fraunces Variable, Georgia, serif"
          font-size="8.5"
          font-weight="600"
          fill="#2a241e"
        >
          {labelText}
        </text>
      </g>
    {/if}

    {#if showWick}
      <path
        d={`M100 ${waxTop + 2}V${waxTop - wickLength}`}
        stroke="#3b2d25"
        stroke-width="2.6"
        stroke-linecap="round"
      />
      <path
        d={`M100 ${waxTop - wickLength}V${waxTop - wickLength - 5}`}
        stroke="#b4552f"
        stroke-width="2.4"
        stroke-linecap="round"
      />

      {#if showFlame}
        <g transform={`translate(100 ${waxTop - wickLength - 8})`}>
          <g class="flame">
            <path
              d="M0 0c9 10 13 17 13 24a13 13 0 1 1-26 0C-13 17-9 10 0 0Z"
              fill="#e08a5f"
            />
            <path
              d="M0 7c5 6 7 10 7 14a7 7 0 1 1-14 0c0-4 2-8 7-14Z"
              fill="#f6d36f"
            />
          </g>
        </g>
      {/if}
    {/if}

    {#if design.lidOn}
      <rect
        x={jarX - 7}
        y={jarTop - 26}
        width={jarWidth + 14}
        height="16"
        rx="7"
        fill="#fbf3e9"
        stroke="#8a6a50"
        stroke-width="2.2"
      />
      <rect
        x="90"
        y={jarTop - 34}
        width="20"
        height="10"
        rx="5"
        fill="#e4d8ca"
        stroke="#8a6a50"
        stroke-width="1.8"
      />
    {/if}
  </svg>
{/if}

<style>
  .candle-preview {
    display: block;
    width: min(100%, 12rem);
    height: auto;
    margin-inline: auto;
    filter: drop-shadow(0 14px 18px rgba(42, 36, 30, 0.12));
  }

  .candle-preview.compact {
    width: min(100%, 8rem);
  }

  .candle-preview--mold {
    position: relative;
    width: min(100%, 11rem);
  }

  .mold-tag {
    position: absolute;
    right: 0.1rem;
    bottom: 0.9rem;
    padding: 0.2rem 0.5rem;
    border: 1px solid rgba(42, 36, 30, 0.12);
    border-radius: 0.2rem;
    background: var(--tag);
    color: var(--tag-ink);
    font-family: var(--font-display);
    font-size: 0.58rem;
    transform: rotate(-4deg);
    box-shadow: 0 3px 8px -4px rgba(42, 36, 30, 0.45);
  }

  .flame {
    transform-origin: 0 0;
    animation: candle-flicker 2s ease-in-out infinite;
  }

  @keyframes candle-flicker {
    0%,
    100% {
      transform: scale(1) rotate(-1deg);
    }
    50% {
      transform: scale(1.05) rotate(1deg);
    }
  }

  @media (max-width: 520px) {
    .candle-preview {
      width: min(100%, 9.5rem);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .flame {
      animation: none;
    }
  }
</style>
