<script lang="ts">
  import {
    inclusionsById,
    orderTypeLabels,
    scentsById,
    sizesById,
    waxColorsById,
    waxesById,
  } from "@lib/game/data";
  import { layerSummary } from "@lib/game/design";
  import type { GameState } from "@lib/game/game-state.svelte";
  import CandlePreview from "./CandlePreview.svelte";

  interface Props {
    game: GameState;
  }

  let { game }: Props = $props();

  const wax = $derived(
    game.design.waxId ? (waxesById[game.design.waxId] ?? null) : null,
  );
  const scent = $derived(
    game.design.scentIds[0]
      ? (scentsById[game.design.scentIds[0]] ?? null)
      : null,
  );
  const size = $derived(
    game.design.sizeId ? (sizesById[game.design.sizeId] ?? null) : null,
  );
  const colorText = $derived(
    game.design.mode === "gel"
      ? game.design.inclusions
          .map((id) => inclusionsById[id]?.nombre)
          .filter(Boolean)
          .join(" · ") || "Sin montajes"
      : layerSummary(game.design),
  );

  const palette = $derived.by(() => {
    if (game.design.mode === "gel") {
      return game.design.inclusions
        .map((id) => inclusionsById[id]?.color)
        .filter((color): color is string => Boolean(color));
    }
    if (game.design.mode === "figura") {
      return Object.values(game.design.figureColors)
        .map((colorId) => waxColorsById[colorId]?.hex)
        .filter((color): color is string => Boolean(color));
    }
    return game.design.layers
      .map((layer) => waxColorsById[layer.colorId]?.hex)
      .filter((color): color is string => Boolean(color));
  });
</script>

<div class="design-scene" data-testid="design-scene">
  <div class="design-scene__board">
    <span class="design-scene__stamp">
      {orderTypeLabels[game.design.mode]} · {size?.nombre ?? "—"}
    </span>

    <CandlePreview design={game.design} showWick showLabel showFlame={false} />

    {#if palette.length > 0}
      <div class="design-scene__palette" aria-hidden="true">
        {#each palette.slice(0, 5) as color}
          <span style={`--c: ${color}`}></span>
        {/each}
      </div>
    {/if}
  </div>

  <div class="design-scene__meta">
    <p class="design-scene__eyebrow">
      {orderTypeLabels[game.design.mode]}
      {#if game.mode === "sandbox"}
        · libre
      {:else}
        · {game.brief.customer.nombre}{/if}
    </p>
    <h3>{wax?.nombre ?? "Elige una cera"}</h3>
    <p class="design-scene__colors">{colorText}</p>
    <p class="design-scene__hint">
      {scent ? `Aroma ${scent.nombre.toLowerCase()}` : "Falta elegir el aroma"} ·
      {game.design.wickId ? "mecha elegida" : "falta la mecha"}
    </p>
  </div>
</div>

<style>
  .design-scene {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(8rem, 12rem);
    gap: 0.9rem;
    align-items: center;
    min-height: 100%;
  }

  .design-scene__board {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.55rem;
    min-height: 15rem;
    padding: 1.2rem 0.75rem 0.85rem;
    border-radius: 1rem;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.32), transparent 55%),
      var(--color-surface);
    box-shadow: inset 0 0 0 1px var(--color-border);
  }

  .design-scene__stamp {
    position: absolute;
    top: 0.55rem;
    left: 0.65rem;
    padding: 0.15rem 0.45rem;
    border: 1px solid var(--color-accent);
    border-radius: 0.2rem;
    color: var(--color-accent);
    font-size: 0.55rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    transform: rotate(-2deg);
  }

  .design-scene__board :global(.candle-preview) {
    width: min(100%, 12rem);
  }

  .design-scene__palette {
    display: flex;
    gap: 0.3rem;
    padding: 0.25rem 0.45rem;
    border-radius: 999px;
    background: var(--color-bg-elevated);
    box-shadow: var(--shadow-sm);
  }

  .design-scene__palette span {
    width: 0.8rem;
    height: 0.8rem;
    border: 1px solid rgba(42, 36, 30, 0.12);
    border-radius: 50%;
    background: var(--c);
  }

  .design-scene__meta {
    display: grid;
    gap: 0.25rem;
  }

  .design-scene__eyebrow {
    color: var(--color-accent);
    font-size: 0.6rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .design-scene__meta h3 {
    font-family: var(--font-display);
    font-size: var(--text-2xl);
    line-height: 1;
  }

  .design-scene__colors {
    color: var(--color-text-muted);
    font-size: var(--text-xs);
    line-height: 1.4;
  }

  .design-scene__hint {
    color: var(--color-text-muted);
    font-size: 0.62rem;
    font-weight: 700;
  }

  @media (max-width: 520px) {
    .design-scene {
      grid-template-columns: 1fr;
      gap: 0;
      text-align: center;
    }

    .design-scene__board {
      min-height: 0;
      padding: 1rem 0.6rem 0.6rem;
    }

    .design-scene__board :global(.candle-preview) {
      width: 6.2rem;
    }

    .design-scene__meta {
      display: none;
    }
  }
</style>
