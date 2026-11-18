<script lang="ts">
  import {
    labels,
    molds,
    orderTypeDescriptions,
    orderTypeLabels,
    scents,
    sizes,
    vessels,
    waxes,
    wickTypes,
  } from "@lib/game/data";
  import type { GameState } from "@lib/game/game-state.svelte";
  import type { OrderType } from "@lib/game/types";

  interface Props {
    game: GameState;
  }

  let { game }: Props = $props();

  const types: OrderType[] = ["clasico", "capas", "figura", "gel"];
  const selectedWax = $derived(game.wax);
  const selectedVessel = $derived(
    game.design.vesselId
      ? vessels.find((vessel) => vessel.id === game.design.vesselId)
      : null,
  );
  const selectedMold = $derived(
    game.design.moldId
      ? molds.find((mold) => mold.id === game.design.moldId)
      : null,
  );
  const selectedScent = $derived(
    game.design.scentIds[0]
      ? scents.find((scent) => scent.id === game.design.scentIds[0])
      : null,
  );
  const selectedWick = $derived(game.wickInfo);
</script>

<div class="design-section">
  <p class="design-section__label">Tipo de vela</p>
  {#if game.mode === "sandbox"}
    <div class="game-grid-2">
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
  {:else}
    <p class="design-badge">{orderTypeLabels[game.design.mode]}</p>
  {/if}
  <p class="design-hint">{orderTypeDescriptions[game.design.mode]}</p>
</div>

<div class="design-section">
  <p class="design-section__label">Cera</p>
  <div class="game-grid-3">
    {#each waxes as wax}
      <button
        class="game-choice"
        class:game-choice--selected={game.design.waxId === wax.id}
        type="button"
        onclick={() => game.selectWax(wax.id)}
        data-testid={`wax-${wax.id}`}
      >
        <span class="game-swatch" style={`--swatch: ${wax.hex}`}></span>
        {wax.nombre}
      </button>
    {/each}
  </div>
  {#if selectedWax}
    <p class="design-hint">
      {selectedWax.descripcion} Rango de ejemplo: {selectedWax.meltMin}–{selectedWax.meltMax}
      °C.
    </p>
  {/if}
</div>

<div class="design-section">
  <p class="design-section__label">Tamaño</p>
  <div class="game-grid-2">
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

{#if game.design.mode === "figura"}
  <div class="design-section">
    <p class="design-section__label">Molde</p>
    <div class="game-grid-2">
      {#each molds as mold}
        <button
          class="game-choice"
          class:game-choice--selected={game.design.moldId === mold.id}
          type="button"
          onclick={() => game.selectMold(mold.id)}
          data-testid={`mold-${mold.id}`}
        >
          {mold.nombre}
        </button>
      {/each}
    </div>
    {#if selectedMold}
      <p class="design-hint">{selectedMold.descripcion}</p>
    {/if}
  </div>
{:else}
  <div class="design-section">
    <p class="design-section__label">Recipiente</p>
    <div class="game-stack design-stack--tight">
      {#each vessels as vessel}
        <button
          class="game-choice"
          class:game-choice--selected={game.design.vesselId === vessel.id}
          type="button"
          onclick={() => game.selectVessel(vessel.id)}
          data-testid={`vessel-${vessel.id}`}
        >
          <span class="game-swatch" style={`--swatch: ${vessel.glass}`}></span>
          <span>{vessel.nombre}</span>
          <span class="design-choice__meta">
            {vessel.capacityG} g · {vessel.diameterMm} mm
          </span>
        </button>
      {/each}
    </div>
    {#if selectedVessel}
      <p class="design-hint">
        {selectedVessel.transparent ? "Vidrio transparente" : "Vidrio tintado"} ·
        {selectedVessel.diameterMm} mm de diámetro.
      </p>
    {/if}
  </div>
{/if}

<div class="design-section">
  <p class="design-section__label">Aroma</p>
  <div class="game-grid-3">
    {#each scents as scent}
      <button
        class="game-choice"
        class:game-choice--selected={game.design.scentIds.includes(scent.id)}
        type="button"
        onclick={() => game.selectScent(scent.id)}
        data-testid={`scent-${scent.id}`}
      >
        {scent.nombre}
      </button>
    {/each}
  </div>
  {#if selectedScent}
    <p class="design-hint">
      {selectedScent.familia} · {selectedScent.notas}
    </p>
  {/if}
</div>

<div class="design-section">
  <p class="design-section__label">Mecha</p>
  <div class="game-grid-2">
    {#each wickTypes as wick}
      <button
        class="game-choice"
        class:game-choice--selected={game.design.wickId === wick.id}
        type="button"
        onclick={() => game.selectWick(wick.id)}
        data-testid={`wick-type-${wick.id}`}
      >
        {wick.nombre}
      </button>
    {/each}
  </div>
  {#if selectedWick}
    <p class="design-hint">
      {selectedWick.material} · {selectedWick.diameterMin}–{selectedWick.diameterMax}
      mm.
      {selectedWick.note}
    </p>
  {/if}
</div>

<div class="design-section">
  <p class="design-section__label">Etiqueta</p>
  <div class="game-grid-3">
    {#each labels as label}
      <button
        class="game-choice"
        class:game-choice--selected={game.design.labelId === label.id}
        type="button"
        onclick={() => game.selectLabel(label.id)}
        data-testid={`label-${label.id}`}
      >
        <span class="game-swatch" style={`--swatch: ${label.color}`}></span>
        {label.nombre}
      </button>
    {/each}
  </div>
</div>

<style>
  .design-section {
    display: grid;
    gap: 0.35rem;
    padding-top: 0.6rem;
    border-top: 1px dashed var(--color-border);
  }

  .design-section:first-child {
    padding-top: 0;
    border-top: 0;
  }

  .design-section__label {
    color: var(--color-heading);
    font-size: var(--text-xs);
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .design-badge {
    display: inline-flex;
    justify-self: start;
    padding: 0.3rem 0.7rem;
    border-radius: 999px;
    background: var(--color-accent-soft);
    color: var(--color-accent-strong);
    font-size: var(--text-sm);
    font-weight: 800;
  }

  .design-hint {
    color: var(--color-text-muted);
    font-size: 0.65rem;
    line-height: 1.4;
  }

  .design-choice__meta {
    margin-left: auto;
    color: var(--color-text-muted);
    font-size: 0.6rem;
    font-weight: 600;
    white-space: nowrap;
  }

  .game-choice--selected .design-choice__meta {
    color: var(--color-accent-strong);
  }

  .design-stack--tight {
    gap: 0.35rem;
  }

  @media (max-width: 520px) {
    .design-choice__meta {
      display: none;
    }
  }
</style>
