<script lang="ts">
  import { inclusions, moldsById, waxColorsById } from "@lib/game/data";
  import type { GameState } from "@lib/game/game-state.svelte";
  import {
    MAX_LAYERS,
    MIN_LAYERS,
    layerTotal,
    mirrorColors,
  } from "@lib/game/design";
  import ColorDots from "./ColorDots.svelte";

  interface Props {
    game: GameState;
  }

  let { game }: Props = $props();

  const mold = $derived(
    game.design.moldId ? (moldsById[game.design.moldId] ?? null) : null,
  );
  const total = $derived(Math.round(layerTotal(game.design.layers)));

  function colorName(colorId: string): string {
    return waxColorsById[colorId]?.nombre ?? "Natural";
  }
</script>

{#if game.design.mode === "figura"}
  <div class="game-stack colors" data-testid="figure-colors">
    <p class="colors__title">Colores de la figura</p>
    {#if mold}
      {#each mold.parts as part}
        <div class="color-row">
          <div class="color-row__head">
            <span>{part.nombre}</span>
            <span class="color-row__name">
              {colorName(game.design.figureColors[part.id] ?? "natural")}
            </span>
          </div>
          <ColorDots
            value={game.design.figureColors[part.id] ?? null}
            label={`Color de ${part.nombre}`}
            onSelect={(colorId) => game.setFigureColor(part.id, colorId)}
          />
        </div>
      {/each}
    {:else}
      <p class="design-hint">Elige un molde para pintar sus partes.</p>
    {/if}
  </div>
{:else if game.design.mode === "gel"}
  <div class="game-stack colors" data-testid="gel-inclusions">
    <p class="colors__title">Montajes suspendidos</p>
    <p class="design-hint">
      La parafina gel es transparente: los montajes quedan a la vista.
    </p>
    <div class="game-grid-2">
      {#each inclusions as inclusion}
        <button
          class="game-choice"
          class:game-choice--selected={game.design.inclusions.includes(
            inclusion.id,
          )}
          type="button"
          onclick={() => game.toggleInclusion(inclusion.id)}
          aria-pressed={game.design.inclusions.includes(inclusion.id)}
          data-testid={`inclusion-${inclusion.id}`}
        >
          <span class="game-swatch" style={`--swatch: ${inclusion.color}`}
          ></span>
          {inclusion.nombre}
        </button>
      {/each}
    </div>
  </div>
{:else}
  <div class="game-stack colors" data-testid="layer-colors">
    <div class="colors__head">
      <p class="colors__title">Capas de color</p>
      <span class="colors__total" class:bad={Math.abs(total - 100) > 0.6}>
        {total}%
      </span>
    </div>

    {#each game.design.layers as layer, index (layer.id)}
      <div class="color-row">
        <div class="color-row__head">
          <span>
            Capa {index + 1}
            {#if index === 0}<em>· base</em>{/if}
            {#if index === game.design.layers.length - 1 && game.design.layers.length > 1}
              <em>· tope</em>
            {/if}
          </span>
          <span class="color-row__name">{colorName(layer.colorId)}</span>
        </div>
        <ColorDots
          value={layer.colorId}
          label={`Color de la capa ${index + 1}`}
          onSelect={(colorId) => game.setLayerColor(index, colorId)}
        />
        {#if game.design.layers.length > 1}
          <label class="layer-height">
            <span>Altura {Math.round(layer.height)}%</span>
            <input
              type="range"
              min="8"
              max="80"
              step="1"
              value={Math.round(layer.height)}
              oninput={(event) =>
                game.setLayerHeight(index, Number(event.currentTarget.value))}
              aria-label={`Altura de la capa ${index + 1}`}
            />
          </label>
        {/if}
      </div>
    {/each}

    {#if game.design.mode === "capas"}
      <div class="colors__actions">
        <button
          class="game-action game-action--secondary game-action--small"
          type="button"
          onclick={() => game.addLayer()}
          disabled={game.design.layers.length >= MAX_LAYERS}
          data-testid="add-layer"
        >
          Agregar capa
        </button>
        <button
          class="game-action game-action--secondary game-action--small"
          type="button"
          onclick={() => game.removeLayer()}
          disabled={game.design.layers.length <= MIN_LAYERS}
          data-testid="remove-layer"
        >
          Quitar capa
        </button>
        <button
          class="game-action game-action--secondary game-action--small"
          type="button"
          onclick={() => (game.design = mirrorColors(game.design))}
          data-testid="mirror-layers"
        >
          Voltear colores
        </button>
      </div>
    {/if}
  </div>
{/if}

<style>
  .colors {
    padding-top: 0.6rem;
    border-top: 1px dashed var(--color-border);
  }

  .colors__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .colors__title {
    color: var(--color-heading);
    font-size: var(--text-xs);
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .colors__total {
    padding: 0.1rem 0.4rem;
    border-radius: 999px;
    background: var(--color-sage-soft);
    color: var(--color-sage);
    font-size: 0.6rem;
    font-weight: 800;
  }

  .colors__total.bad {
    background: var(--color-accent-soft);
    color: var(--color-accent-strong);
  }

  .color-row {
    display: grid;
    gap: 0.3rem;
    padding: 0.45rem;
    border: 1px solid var(--color-border);
    border-radius: 0.6rem;
    background: var(--color-bg);
  }

  .color-row__head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.5rem;
    color: var(--color-heading);
    font-size: var(--text-xs);
    font-weight: 800;
  }

  .color-row__head em {
    color: var(--color-text-muted);
    font-style: normal;
    font-weight: 600;
  }

  .color-row__name {
    color: var(--color-text-muted);
    font-size: 0.62rem;
    font-weight: 700;
  }

  .layer-height {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
    gap: 0.5rem;
    color: var(--color-text-muted);
    font-size: 0.6rem;
    font-weight: 700;
  }

  .layer-height input {
    width: 100%;
    accent-color: var(--color-accent);
  }

  .colors__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
  }

  .design-hint {
    color: var(--color-text-muted);
    font-size: 0.65rem;
    line-height: 1.4;
  }
</style>
