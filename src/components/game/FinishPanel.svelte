<script lang="ts">
  import { labels } from "@lib/game/data";
  import type { GameState } from "@lib/game/game-state.svelte";

  interface Props {
    state: GameState;
  }

  let { state }: Props = $props();
</script>

<div class="game-station-panel" data-testid="finish-panel">
  <p class="game-eyebrow">Acabado</p>
  <h3 class="game-title">Los últimos detalles</h3>
  <p class="game-text">
    Recorta la mecha, elige la etiqueta del pedido, pon la tapa y empaca la
    vela.
  </p>

  <div class="game-stack">
    <button
      class="game-action game-action--secondary"
      type="button"
      onclick={() => state.trimWick()}
      disabled={state.craft.wickTrimmed}
      data-testid="trim-wick"
    >
      {state.craft.wickTrimmed ? "Mecha recortada" : "Recortar mecha"}
    </button>

    <div>
      <p class="game-text">Etiqueta</p>
      <div class="game-grid-2">
        {#each labels as label}
          <button
            class="game-choice"
            class:game-choice--selected={state.craft.labelId === label.id}
            type="button"
            onclick={() => state.selectLabel(label.id)}
            data-testid={`label-${label.id}`}
          >
            <span class="game-swatch" style={`--swatch: ${label.color}`}></span>
            {label.nombre}
          </button>
        {/each}
      </div>
    </div>

    <button
      class="game-action game-action--secondary"
      type="button"
      onclick={() => state.addLid()}
      disabled={state.craft.lidOn}
      data-testid="lid"
    >
      {state.craft.lidOn ? "Tapa puesta" : "Poner tapa"}
    </button>

    <button
      class="game-action game-action--secondary"
      type="button"
      onclick={() => state.wrap()}
      disabled={state.craft.wrapped}
      data-testid="wrap"
    >
      {state.craft.wrapped ? "Vela empacada" : "Empacar"}
    </button>
  </div>

  <button
    class="game-action game-primary"
    type="button"
    onclick={() => state.serve()}
    disabled={!state.canFinish}
    data-testid="serve"
  >
    Entregar pedido
  </button>
</div>
