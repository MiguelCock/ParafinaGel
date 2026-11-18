<script lang="ts">
  import { stationLabels } from "@lib/game/data";
  import type { GameState } from "@lib/game/game-state.svelte";

  interface Props {
    game: GameState;
  }

  let { game }: Props = $props();

  const active = $derived(game.activeStation);
  const viewed = $derived(game.view === "overview" ? active : game.view);
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
    onclick={() => game.setView(active)}
    data-testid="go-active"
  >
    Ir a {stationLabels[active]}
  </button>
</div>
