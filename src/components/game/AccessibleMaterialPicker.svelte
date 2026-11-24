<script lang="ts">
  import {
    inclusions,
    labels,
    molds,
    orderTypeLabels,
    recommendedWickTypes,
    scents,
    sizes,
    vessels,
    waxColors,
    waxes,
    wickTypes,
  } from "@lib/game/data";
  import type { GameState } from "@lib/game/game-state.svelte";
  import type { OrderType, WaxId } from "@lib/game/types";

  interface Props {
    game: GameState;
  }

  let { game }: Props = $props();

  const types: OrderType[] = ["clasico", "capas", "figura", "gel"];
  const requiredUse = $derived(
    game.design.mode === "figura"
      ? "mold"
      : game.design.mode === "gel"
        ? "gel"
        : "container",
  );
  const compatibleWaxes = $derived(
    waxes.filter((wax) => wax.use.includes(requiredUse)),
  );
  const vessel = $derived(
    game.design.vesselId
      ? vessels.find((item) => item.id === game.design.vesselId)
      : null,
  );
  const recommended = $derived(
    vessel ? recommendedWickTypes(vessel.diameterMm) : wickTypes,
  );
</script>

<details class="accessible-picker" data-testid="material-accessible">
  <summary data-testid="material-accessible-summary">
    Selector accesible de materiales
  </summary>

  <div class="accessible-picker__grid">
    {#if game.mode === "sandbox"}
      <label>
        <span>Tipo de vela</span>
        <select
          value={game.design.mode}
          onchange={(event) =>
            game.setMode(event.currentTarget.value as OrderType)}
          data-testid="accessible-type"
        >
          {#each types as type}
            <option value={type}>{orderTypeLabels[type]}</option>
          {/each}
        </select>
      </label>
    {/if}

    <label>
      <span>Tamaño</span>
      <select
        value={game.design.sizeId}
        onchange={(event) => game.selectSize(event.currentTarget.value)}
        data-testid="accessible-size"
      >
        {#each sizes as size}
          <option value={size.id}>{size.nombre}</option>
        {/each}
      </select>
    </label>

    <label>
      <span>Cera</span>
      <select
        value={game.design.waxId ?? ""}
        onchange={(event) =>
          event.currentTarget.value &&
          game.selectWax(event.currentTarget.value as WaxId)}
        data-testid="accessible-wax"
      >
        <option value="">Sin elegir</option>
        {#each compatibleWaxes as wax}
          <option value={wax.id}>{wax.nombre}</option>
        {/each}
      </select>
    </label>

    {#if game.design.mode === "figura"}
      <label>
        <span>Molde</span>
        <select
          value={game.design.moldId ?? ""}
          onchange={(event) =>
            event.currentTarget.value &&
            game.selectMold(event.currentTarget.value)}
          data-testid="accessible-mold"
        >
          <option value="">Sin elegir</option>
          {#each molds as mold}
            <option value={mold.id}>{mold.nombre}</option>
          {/each}
        </select>
      </label>
    {:else}
      <label>
        <span>Envase</span>
        <select
          value={game.design.vesselId ?? ""}
          onchange={(event) =>
            event.currentTarget.value &&
            game.selectVessel(event.currentTarget.value)}
          data-testid="accessible-vessel"
        >
          <option value="">Sin elegir</option>
          {#each vessels as item}
            <option
              value={item.id}
              disabled={game.design.mode === "gel" && !item.transparent}
            >
              {item.nombre} · {item.diameterMm} mm
            </option>
          {/each}
        </select>
      </label>
    {/if}

    <label>
      <span>Pabilo</span>
      <select
        value={game.design.wickId ?? ""}
        onchange={(event) =>
          event.currentTarget.value &&
          game.selectWick(event.currentTarget.value)}
        data-testid="accessible-wick"
      >
        <option value="">Sin elegir</option>
        {#each wickTypes as wick}
          <option
            value={wick.id}
            disabled={Boolean(vessel) &&
              !recommended.some((item) => item.id === wick.id)}
          >
            {wick.nombre}
          </option>
        {/each}
      </select>
    </label>

    <label>
      <span>Aroma</span>
      <select
        value={game.design.scentIds[0] ?? ""}
        onchange={(event) =>
          event.currentTarget.value &&
          game.selectScent(event.currentTarget.value)}
        data-testid="accessible-scent"
      >
        <option value="">Sin elegir</option>
        {#each scents as scent}
          <option value={scent.id}>{scent.nombre}</option>
        {/each}
      </select>
    </label>

    <label>
      <span>Etiqueta</span>
      <select
        value={game.design.labelId ?? ""}
        onchange={(event) =>
          event.currentTarget.value &&
          game.selectLabel(event.currentTarget.value)}
        data-testid="accessible-label"
      >
        <option value="">Sin elegir</option>
        {#each labels as label}
          <option value={label.id}>{label.nombre}</option>
        {/each}
      </select>
    </label>
  </div>

  {#if game.design.mode === "gel"}
    <div class="accessible-picker__block">
      <p>Montajes</p>
      <div class="accessible-picker__checks">
        {#each inclusions as inclusion}
          <label>
            <input
              type="checkbox"
              checked={game.design.inclusions.includes(inclusion.id)}
              onchange={() => game.toggleInclusion(inclusion.id)}
              data-testid={`accessible-inclusion-${inclusion.id}`}
            />
            <span>{inclusion.nombre}</span>
          </label>
        {/each}
      </div>
    </div>
  {:else if game.design.mode === "figura"}
    {#if game.design.moldId}
      <div class="accessible-picker__block">
        <p>Colores de la figura</p>
        {#each molds.find((mold) => mold.id === game.design.moldId)?.parts ?? [] as part}
          <label class="accessible-picker__color">
            <span>{part.nombre}</span>
            <select
              value={game.design.figureColors[part.id] ?? "natural"}
              onchange={(event) =>
                game.setFigureColor(part.id, event.currentTarget.value)}
              data-testid={`accessible-figure-color-${part.id}`}
            >
              {#each waxColors as color}
                <option value={color.id}>{color.nombre}</option>
              {/each}
            </select>
          </label>
        {/each}
      </div>
    {/if}
  {:else}
    <div class="accessible-picker__block">
      <p>Colores por capa</p>
      {#each game.design.layers as layer, index (layer.id)}
        <label class="accessible-picker__color">
          <span>Capa {index + 1}</span>
          <select
            value={layer.colorId}
            onchange={(event) =>
              game.setLayerColor(index, event.currentTarget.value)}
            data-testid={`accessible-layer-color-${index}`}
          >
            {#each waxColors as color}
              <option value={color.id}>{color.nombre}</option>
            {/each}
          </select>
        </label>
      {/each}
    </div>
  {/if}
</details>

<style>
  .accessible-picker {
    border: 1px dashed var(--color-border-strong);
    border-radius: var(--radius-md);
    background: var(--color-bg);
    font-size: var(--text-xs);
  }

  .accessible-picker summary {
    padding: 0.55rem 0.65rem;
    color: var(--color-heading);
    font-weight: 800;
    cursor: pointer;
  }

  .accessible-picker__grid,
  .accessible-picker__block {
    display: grid;
    gap: 0.45rem;
    padding: 0 0.65rem 0.65rem;
  }

  .accessible-picker label {
    display: grid;
    gap: 0.2rem;
    color: var(--color-text-muted);
    font-weight: 700;
  }

  .accessible-picker select {
    min-height: 2.2rem;
    padding: 0.25rem 0.4rem;
    border: 1px solid var(--color-border);
    border-radius: 0.45rem;
    background: var(--color-bg-elevated);
    color: var(--color-heading);
    font: inherit;
  }

  .accessible-picker__checks {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .accessible-picker__checks label {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }

  .accessible-picker__color {
    grid-template-columns: 1fr 1.2fr;
    align-items: center;
  }

  .accessible-picker__block > p {
    color: var(--color-heading);
    font-weight: 800;
  }
</style>
