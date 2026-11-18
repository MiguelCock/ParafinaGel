<script lang="ts">
  import { stationLabels } from "@lib/game/data";
  import type { GameState } from "@lib/game/game-state.svelte";
  import type { StationId } from "@lib/game/types";

  interface Props {
    state: GameState;
  }

  let { state }: Props = $props();

  const active = $derived(state.phase as StationId);
  const viewed = $derived(state.view as StationId);
</script>

<div class="game-station-panel" data-testid="locked-panel">
  <p class="game-eyebrow">Estación</p>
  <h3 class="game-title">{stationLabels[viewed]}</h3>
  <p class="game-text">
    Ahora mismo el pedido está en <strong>{stationLabels[active]}</strong>.
    Termina esa estación antes de volver a esta.
  </p>

  <button
    class="game-action"
    type="button"
    onclick={() => state.setView(active)}
  >
    Ir a {stationLabels[active]}
  </button>
</div>
