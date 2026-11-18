<script lang="ts">
  import { vessels } from "@lib/game/data";
  import { FILL_MAX, FILL_MIN } from "@lib/game/orders";
  import type { GameState } from "@lib/game/game-state.svelte";

  interface Props {
    state: GameState;
  }

  let { state }: Props = $props();
</script>

<div class="game-station-panel" data-testid="pour-panel">
  <p class="game-eyebrow">Vertido</p>
  <h3 class="game-title">Elige el frasco y vierte</h3>
  <p class="game-text">
    Selecciona el frasco del pedido y vierte hasta la zona verde. Suelta el
    botón cuando estés dentro.
  </p>

  <div class="game-grid-2">
    {#each vessels as vessel}
      <button
        class="game-choice"
        class:game-choice--selected={state.craft.vesselId === vessel.id}
        type="button"
        onclick={() => state.selectVessel(vessel.id)}
        data-testid={`vessel-${vessel.id}`}
      >
        <span class="game-swatch" style={`--swatch: ${vessel.glass}`}></span>
        {vessel.nombre}
      </button>
    {/each}
  </div>

  <div class="game-gauge" aria-hidden="true">
    <div
      class="game-gauge__zone"
      style={`left: ${FILL_MIN}%; width: ${FILL_MAX - FILL_MIN}%`}
    ></div>
    <div class="game-gauge__needle" style={`left: ${state.craft.fill}%`}></div>
  </div>

  <div class="game-row">
    <span class="game-badge" data-testid="fill">
      Vertido: {Math.round(state.craft.fill)}%
    </span>
    <span
      class:game-warning={state.craft.fill > 97}
      class:game-success={state.isFillReady}
      class="game-badge"
    >
      {state.craft.fill > 97
        ? "Se derramó"
        : state.isFillReady
          ? "En rango"
          : state.craft.fill < FILL_MIN
            ? "Falta llenar"
            : "Un poco más"}
    </span>
  </div>

  <button
    class="game-action"
    type="button"
    onclick={() => state.togglePour()}
    disabled={!state.craft.vesselId}
    data-testid="pour-toggle"
  >
    {state.craft.pouring ? "Parar" : "Verter"}
  </button>

  <button
    class="game-action game-primary"
    type="button"
    onclick={() => state.goCool()}
    disabled={state.craft.fill <= 0 || !state.craft.vesselId}
    data-testid="pour-continue"
  >
    Dejar enfriar
  </button>
</div>
