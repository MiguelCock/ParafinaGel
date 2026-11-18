<script lang="ts">
  import { stationLabels, stationOrder } from "@lib/game/data";
  import type { GameState } from "@lib/game/game-state.svelte";
  import type { StationId } from "@lib/game/types";
  import StationIcon from "./StationIcon.svelte";

  interface Props {
    state: GameState;
  }

  let { state }: Props = $props();

  const phaseIndex = $derived(stationOrder.indexOf(state.phase as StationId));

  function isDone(station: StationId): boolean {
    if (state.phase === "score" || state.phase === "dayEnd") return true;
    return stationOrder.indexOf(station) < phaseIndex;
  }
</script>

<nav class="station-tabs" aria-label="Estaciones del taller">
  <button
    class="tab tab--overview"
    class:active={state.view === "overview"}
    type="button"
    onclick={() => state.setView("overview")}
    data-testid="tab-overview"
  >
    Taller
  </button>

  {#each stationOrder as station}
    <button
      class="tab"
      class:active={state.view === station}
      class:current={state.phase === station}
      class:done={isDone(station)}
      type="button"
      onclick={() => state.setView(station)}
      aria-current={state.phase === station ? "step" : undefined}
      data-testid={`tab-${station}`}
    >
      <span class="tab__icon">
        <StationIcon {station} size={16} />
        {#if isDone(station)}
          <span class="tab__check" aria-hidden="true">✓</span>
        {/if}
      </span>
      <span>{stationLabels[station]}</span>
    </button>
  {/each}
</nav>

<style>
  .station-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
  }

  .tab {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    min-height: 2rem;
    padding: 0.3rem 0.55rem;
    border: 1px solid var(--color-border);
    border-radius: 999px;
    background: var(--color-bg);
    color: var(--color-text-muted);
    font-size: 0.65rem;
    font-weight: 700;
    white-space: nowrap;
    transition:
      background-color var(--transition),
      border-color var(--transition),
      color var(--transition);
  }

  .tab:hover {
    border-color: var(--color-accent);
    color: var(--color-accent);
  }

  .tab.active {
    border-color: var(--color-accent);
    background: var(--color-accent-soft);
    color: var(--color-accent-strong);
  }

  .tab.current:not(.active) {
    border-color: var(--color-sage);
    color: var(--color-sage);
  }

  .tab.done:not(.active) {
    background: var(--color-sage-soft);
    color: var(--color-sage);
  }

  .tab--overview {
    font-weight: 800;
  }

  .tab__icon {
    position: relative;
    display: inline-flex;
  }

  .tab__check {
    position: absolute;
    right: -0.45rem;
    bottom: -0.35rem;
    display: grid;
    place-items: center;
    width: 0.7rem;
    height: 0.7rem;
    border-radius: 50%;
    background: var(--color-sage);
    color: #fff9f2;
    font-size: 0.45rem;
    line-height: 1;
  }
</style>
