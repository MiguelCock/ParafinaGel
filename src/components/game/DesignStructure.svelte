<script lang="ts">
  import {
    MAX_LAYERS,
    MIN_LAYERS,
    layerTotal,
    mirrorColors,
  } from "@lib/game/design";
  import { orderTypeLabels, sizes } from "@lib/game/data";
  import type { GameState } from "@lib/game/game-state.svelte";
  import type { OrderType } from "@lib/game/types";

  interface Props {
    game: GameState;
  }

  let { game }: Props = $props();

  const types: OrderType[] = ["clasico", "capas", "figura", "gel"];
  const total = $derived(Math.round(layerTotal(game.design.layers)));
</script>

<div class="structure" data-testid="design-structure">
  {#if game.mode === "sandbox"}
    <div class="structure__block">
      <p class="structure__label">Tipo de vela</p>
      <div class="structure__row">
        {#each types as type}
          <button
            class="game-choice"
            class:game-choice--selected={game.design.mode === type}
            type="button"
            onclick={() => game.setMode(type)}
            data-testid={`type-${type}`}
          >
            {orderTypeLabels[type]}
          </button>
        {/each}
      </div>
    </div>
  {:else}
    <p class="structure__mode">
      Tipo: <strong>{orderTypeLabels[game.design.mode]}</strong>
    </p>
  {/if}

  <div class="structure__block">
    <p class="structure__label">Tamaño</p>
    <div class="structure__row">
      {#each sizes as size}
        <button
          class="game-choice"
          class:game-choice--selected={game.design.sizeId === size.id}
          type="button"
          onclick={() => game.selectSize(size.id)}
          data-testid={`size-${size.id}`}
        >
          {size.nombre}
        </button>
      {/each}
    </div>
  </div>

  {#if game.design.mode === "capas"}
    <div class="structure__block">
      <div class="structure__head">
        <p class="structure__label">Capas</p>
        <span class="structure__total" class:bad={Math.abs(total - 100) > 0.6}>
          {total}%
        </span>
      </div>

      {#each game.design.layers as layer, index (layer.id)}
        <label class="structure__layer">
          <span>
            Capa {index + 1}
            {#if index === 0}<em>· base</em>{/if}
            {#if index === game.design.layers.length - 1}
              <em>· tope</em>
            {/if}
          </span>
          <span>{Math.round(layer.height)}%</span>
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
      {/each}

      <div class="structure__row">
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
    </div>
  {/if}
</div>

<style>
  .structure {
    display: grid;
    gap: 0.55rem;
    padding-top: 0.6rem;
    border-top: 1px dashed var(--color-border);
  }

  .structure__block {
    display: grid;
    gap: 0.35rem;
  }

  .structure__row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
  }

  .structure__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .structure__label {
    color: var(--color-heading);
    font-size: var(--text-xs);
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .structure__mode {
    color: var(--color-text-muted);
    font-size: var(--text-xs);
  }

  .structure__total {
    padding: 0.1rem 0.4rem;
    border-radius: 999px;
    background: var(--color-sage-soft);
    color: var(--color-sage);
    font-size: 0.6rem;
    font-weight: 800;
  }

  .structure__total.bad {
    background: var(--color-accent-soft);
    color: var(--color-accent-strong);
  }

  .structure__layer {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 0.2rem 0.5rem;
    align-items: center;
    color: var(--color-heading);
    font-size: var(--text-xs);
    font-weight: 700;
  }

  .structure__layer em {
    color: var(--color-text-muted);
    font-style: normal;
    font-weight: 600;
  }

  .structure__layer input {
    grid-column: 1 / -1;
    accent-color: var(--color-accent);
  }
</style>
