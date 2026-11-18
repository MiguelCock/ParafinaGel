<script lang="ts">
  import type { GameState } from "@lib/game/game-state.svelte";
  import Jar2D from "./Jar2D.svelte";
  import Pitcher2D from "./Pitcher2D.svelte";

  interface Props {
    game: GameState;
  }

  let { game }: Props = $props();
</script>

<div class="pour-scene" data-testid="pour-scene">
  <div class="pour-scene__jar">
    <div class="pour-scene__target" aria-hidden="true">
      <span>Meta</span>
    </div>
    <Jar2D
      fill={game.craft.fill}
      color={game.waxHex}
      glass={game.glassHex}
      showWick
    />
  </div>

  <div class="pour-scene__pitcher">
    <Pitcher2D pouring={game.craft.pouring} color={game.waxHex} />
  </div>

  <div class="pour-scene__readout">
    <span>Vertido</span>
    <strong>{Math.round(game.craft.fill)}%</strong>
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
    position: relative;
    width: min(100%, 11rem);
  }

  .pour-scene__target {
    position: absolute;
    top: 38%;
    right: -1rem;
    left: -1rem;
    z-index: 1;
    border-top: 2px dashed #b4552f;
    opacity: 0.55;
    pointer-events: none;
  }

  .pour-scene__target span {
    position: absolute;
    top: -0.75rem;
    right: 0;
    padding: 0.1rem 0.35rem;
    border-radius: 999px;
    background: var(--color-accent-soft);
    color: var(--color-accent-strong);
    font-size: 0.58rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
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
    letter-spacing: 0.08em;
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
      width: 7.5rem;
    }
  }
</style>
