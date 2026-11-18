<script lang="ts">
  import { stationLabels, stationOrder } from "@lib/game3d/data";
  import type { Game3DState } from "@lib/game3d/game-state.svelte";
  import type { StationId } from "@lib/game3d/types";

  interface Props {
    state: Game3DState;
  }

  let { state }: Props = $props();

  const activeStation = $derived<StationId>(
    state.phase === "intro" ||
      state.phase === "score" ||
      state.phase === "dayEnd"
      ? "counter"
      : state.phase,
  );
</script>

<div class="game-station-panel" data-testid="overview-panel">
  <p class="game-eyebrow">Vista del taller</p>
  <h3 class="game-title">Elige una estación</h3>
  <p class="game-text">
    Toca los círculos del piso o usa los botones para acercarte. La estación
    activa está resaltada.
  </p>

  <div class="overview-grid">
    {#each stationOrder as station}
      <button
        class="game-choice"
        type="button"
        onclick={() => state.setView(station)}
        data-testid={`overview-${station}`}
      >
        {stationLabels[station]}
      </button>
    {/each}
  </div>

  <div class="game-note">
    Estación activa:
    {stationLabels[activeStation]}
  </div>
</div>

<style>
  .overview-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.5rem;
  }
</style>
