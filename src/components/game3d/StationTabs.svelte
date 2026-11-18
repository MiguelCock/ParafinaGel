<script lang="ts">
  import { stationLabels, stationOrder } from "@lib/game3d/data";
  import type { Game3DState } from "@lib/game3d/game-state.svelte";

  interface Props {
    state: Game3DState;
  }

  let { state }: Props = $props();
</script>

<nav class="station-tabs" aria-label="Estaciones del taller">
  <button
    class:active={state.view === "overview"}
    type="button"
    onclick={() => state.setView("overview")}
    data-testid="tab-overview"
  >
    Taller
  </button>

  {#each stationOrder as station}
    <button
      class:active={state.view === station}
      class:current={state.phase === station}
      type="button"
      onclick={() => state.setView(station)}
      data-testid={`tab-${station}`}
    >
      {stationLabels[station]}
    </button>
  {/each}
</nav>

<style>
  .station-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    padding-bottom: 0.15rem;
  }

  button {
    flex: none;
    padding: 0.42rem 0.7rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-full);
    background: var(--color-bg);
    color: var(--color-text-muted);
    font-size: var(--text-xs);
    font-weight: 700;
    white-space: nowrap;
    transition:
      background-color var(--transition),
      border-color var(--transition),
      color var(--transition);
  }

  button:hover {
    border-color: var(--color-accent);
    color: var(--color-accent);
  }

  button.active {
    border-color: var(--color-accent);
    background: var(--color-accent-soft);
    color: var(--color-accent-strong);
  }

  button.current:not(.active) {
    border-color: var(--color-sage);
    color: var(--color-sage);
  }
</style>
