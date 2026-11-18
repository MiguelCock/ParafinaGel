<script lang="ts">
  import { stationLabels, stationOrder } from "@lib/game/data";
  import type { GameState } from "@lib/game/game-state.svelte";
  import type { StationId } from "@lib/game/types";
  import StationIcon from "./StationIcon.svelte";

  interface Props {
    state: GameState;
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
    Toca un punto del taller o usa los botones para acercarte. La estación
    activa está marcada en terracota.
  </p>

  <div class="overview-grid">
    {#each stationOrder as station}
      <button
        class="overview-card"
        class:active={activeStation === station}
        type="button"
        onclick={() => state.setView(station)}
        data-testid={`overview-${station}`}
      >
        <span class="overview-card__icon">
          <StationIcon {station} size={18} />
        </span>
        <span class="overview-card__name">{stationLabels[station]}</span>
        {#if activeStation === station}
          <span class="overview-card__now">Ahora</span>
        {/if}
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
    gap: 0.45rem;
  }

  .overview-card {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    min-height: 2.8rem;
    padding: 0.45rem 0.55rem;
    border: 1px solid var(--color-border);
    border-radius: 0.7rem;
    background: var(--color-bg);
    color: var(--color-text-muted);
    font-size: var(--text-xs);
    font-weight: 700;
    text-align: left;
    transition:
      background-color var(--transition),
      border-color var(--transition),
      color var(--transition);
  }

  .overview-card:hover {
    border-color: var(--color-accent);
    color: var(--color-accent);
  }

  .overview-card.active {
    border-color: var(--color-accent);
    background: var(--color-accent-soft);
    color: var(--color-accent-strong);
  }

  .overview-card__icon {
    display: grid;
    place-items: center;
    flex: none;
    width: 1.7rem;
    height: 1.7rem;
    border-radius: 50%;
    background: var(--color-surface);
    color: var(--color-accent);
  }

  .overview-card.active .overview-card__icon {
    background: var(--color-accent);
    color: #fff9f2;
  }

  .overview-card__name {
    line-height: 1.15;
  }

  .overview-card__now {
    margin-left: auto;
    padding: 0.1rem 0.3rem;
    border-radius: 999px;
    background: var(--color-accent);
    color: #fff9f2;
    font-size: 0.5rem;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
</style>
