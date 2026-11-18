<script lang="ts">
  import { pourFills } from "@lib/game/craft";
  import type { GameState } from "@lib/game/game-state.svelte";
  import CandlePreview from "./CandlePreview.svelte";
  import Pitcher2D from "./Pitcher2D.svelte";

  interface Props {
    game: GameState;
  }

  let { game }: Props = $props();

  const fills = $derived(pourFills(game.craft));
  const unit = $derived(game.unit);
</script>

<div class="pour-scene" data-testid="pour-scene">
  <div class="pour-scene__jar">
    <CandlePreview
      design={game.design}
      {fills}
      showWick={false}
      showLabel={false}
    />
  </div>

  <div class="pour-scene__pitcher">
    <Pitcher2D
      pouring={game.craft.pouring}
      color={unit?.colorHex ?? "#e9c9a8"}
    />
  </div>

  <div class="pour-scene__readout">
    <span>{unit?.label ?? "Vertido completo"}</span>
    <strong>{Math.round(unit?.fill ?? 100)}%</strong>
  </div>
</div>

<style>
  .pour-scene {
    position: relative;
    display: grid;
    place-items: center;
    min-height: 16rem;
    padding-right: 5.5rem;
  }

  .pour-scene__jar {
    width: min(100%, 11rem);
  }

  .pour-scene__jar :global(.candle-preview) {
    width: 100%;
  }

  .pour-scene__pitcher {
    position: absolute;
    top: -0.5rem;
    right: 0.25rem;
    width: min(40%, 9rem);
  }

  .pour-scene__readout {
    position: absolute;
    right: 0.25rem;
    bottom: 0.25rem;
    display: grid;
    gap: 0.1rem;
    max-width: 11rem;
    padding: 0.45rem 0.65rem;
    border: 1px solid var(--color-border);
    border-radius: 0.7rem;
    background: var(--color-bg-elevated);
    box-shadow: var(--shadow-sm);
    text-align: center;
  }

  .pour-scene__readout span {
    color: var(--color-text-muted);
    font-size: 0.6rem;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .pour-scene__readout strong {
    color: var(--color-heading);
    font-family: var(--font-display);
    font-size: var(--text-lg);
    line-height: 1;
  }

  @media (max-width: 520px) {
    .pour-scene {
      min-height: 12rem;
      padding-right: 3.5rem;
    }

    .pour-scene__pitcher {
      width: 7rem;
    }

    .pour-scene__readout {
      display: none;
    }
  }
</style>
