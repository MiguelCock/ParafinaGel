<script lang="ts">
  import { scents, waxColors } from "@lib/game/data";
  import { TEMP_MAX, TEMP_MIN } from "@lib/game/orders";
  import type { GameState } from "@lib/game/game-state.svelte";

  interface Props {
    state: GameState;
  }

  let { state }: Props = $props();
</script>

<div class="game-station-panel" data-testid="melt-panel">
  <p class="game-eyebrow">Estación de cera</p>
  <h3 class="game-title">Calienta y mezcla</h3>
  <p class="game-text">
    Calienta la cera a {TEMP_MIN}–{TEMP_MAX} °C, elige aroma y color, y remueve tres
    veces. La temperatura queda registrada al entrar en el rango.
  </p>

  <div class="game-gauge" aria-hidden="true">
    <div
      class="game-gauge__zone"
      style={`left: ${TEMP_MIN}%; width: ${TEMP_MAX - TEMP_MIN}%`}
    ></div>
    <div
      class="game-gauge__needle"
      style={`left: ${state.craft.temperature}%`}
    ></div>
  </div>

  <div class="game-row">
    <span class="game-badge" data-testid="temperature">
      Temperatura: {Math.round(state.craft.temperature)} °C
    </span>
    <span
      class:game-warning={state.craft.overheated ||
        state.craft.temperature > 85}
      class:game-success={state.canContinueMelt}
      class="game-badge"
    >
      {state.craft.overheated
        ? "Se quemó"
        : state.craft.temperature > 85
          ? "¡Demasiado caliente!"
          : state.canContinueMelt
            ? "Lista para seguir"
            : state.isTemperatureReady
              ? "En rango"
              : state.craft.temperature < TEMP_MIN
                ? "Falta calor"
                : "Un poco más"}
    </span>
  </div>

  {#if state.craft.meltTemperature >= TEMP_MIN && !state.craft.overheated}
    <p class="game-text" data-testid="melt-temperature">
      Temperatura registrada: {Math.round(state.craft.meltTemperature)} °C
    </p>
  {/if}

  <button
    class="game-action"
    type="button"
    onclick={() => state.toggleHeat()}
    data-testid="heat-toggle"
  >
    {state.craft.heating ? "Detener" : "Calentar"}
  </button>

  <div>
    <p class="game-text">Aroma</p>
    <div class="game-grid-3">
      {#each scents as scent}
        <button
          class="game-choice"
          class:game-choice--selected={state.craft.scentId === scent.id}
          type="button"
          onclick={() => state.selectScent(scent.id)}
          data-testid={`scent-${scent.id}`}
        >
          {scent.nombre}
        </button>
      {/each}
    </div>
  </div>

  <div>
    <p class="game-text">Color</p>
    <div class="game-grid-3">
      {#each waxColors as color}
        <button
          class="game-choice"
          class:game-choice--selected={state.craft.colorId === color.id}
          type="button"
          onclick={() => state.selectColor(color.id)}
          data-testid={`color-${color.id}`}
        >
          <span class="game-swatch" style={`--swatch: ${color.hex}`}></span>
          {color.nombre}
        </button>
      {/each}
    </div>
  </div>

  <div class="game-row">
    <span class="game-text">Removidos: {state.craft.stirs}/3</span>
    <button
      class="game-action game-action--secondary game-action--small"
      type="button"
      onclick={() => state.stir()}
      disabled={state.craft.stirs >= 3}
      data-testid="stir"
    >
      Remover
    </button>
  </div>

  <button
    class="game-action game-primary"
    type="button"
    onclick={() => state.goPour()}
    disabled={!state.canContinueMelt}
    data-testid="melt-continue"
  >
    Ir al vertido
  </button>
</div>
