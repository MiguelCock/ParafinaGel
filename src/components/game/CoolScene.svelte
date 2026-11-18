<script lang="ts">
  import type { GameState } from "@lib/game/game-state.svelte";
  import Fan2D from "./Fan2D.svelte";
  import Jar2D from "./Jar2D.svelte";
  import Steam2D from "./Steam2D.svelte";

  interface Props {
    game: GameState;
  }

  let { game }: Props = $props();

  const remaining = $derived(
    game.craft.cooled ? "Lista" : `${game.craft.coolingRemaining.toFixed(1)} s`,
  );
</script>

<div class="cool-scene" data-testid="cool-scene">
  <div class="rack">
    <div class="rack__post rack__post--left"></div>
    <div class="rack__post rack__post--right"></div>
    <div class="rack__shelf rack__shelf--top">
      <div class="rack__jar">
        <Jar2D
          fill={game.craft.fill}
          color={game.waxHex}
          glass={game.glassHex}
          showWick
        />
        <div class="rack__steam">
          <Steam2D active={!game.craft.cooled} />
        </div>
      </div>
    </div>
    <div class="rack__shelf rack__shelf--bottom"></div>
  </div>

  <div class="fan">
    <Fan2D spinning={!game.craft.cooled} />
  </div>

  <div class="cool-scene__status" class:ready={game.craft.cooled}>
    {#if game.craft.cooled}
      <span>Vela lista</span>
    {:else}
      <span>Enfriando</span>
      <strong>{remaining}</strong>
    {/if}
  </div>
</div>

<style>
  .cool-scene {
    position: relative;
    display: grid;
    place-items: center;
    min-height: 17rem;
    padding-right: 3.5rem;
  }

  .rack {
    position: relative;
    width: 13rem;
    height: 15rem;
  }

  .rack__post {
    position: absolute;
    top: 1rem;
    bottom: 0;
    width: 0.6rem;
    border-radius: 0.25rem;
    background: linear-gradient(90deg, #8f5f40, #b98963);
    box-shadow: 2px 0 0 rgba(42, 36, 30, 0.08);
  }

  .rack__post--left {
    left: 0;
  }

  .rack__post--right {
    right: 0;
  }

  .rack__shelf {
    position: absolute;
    left: 0.2rem;
    right: 0.2rem;
    height: 0.65rem;
    border-radius: 0.2rem;
    background: linear-gradient(180deg, #d2a77e, #a9744e);
    box-shadow: 0 5px 8px -5px rgba(42, 36, 30, 0.45);
  }

  .rack__shelf--top {
    top: 6.2rem;
  }

  .rack__shelf--bottom {
    top: 11.9rem;
  }

  .rack__jar {
    position: absolute;
    bottom: 0.55rem;
    left: 50%;
    width: 7.5rem;
    transform: translateX(-50%);
  }

  .rack__steam {
    position: absolute;
    left: 50%;
    bottom: 6.5rem;
    width: 90px;
    height: 120px;
    transform: translateX(-50%);
    pointer-events: none;
  }

  .fan {
    position: absolute;
    right: 0;
    bottom: 2.25rem;
    width: 6.5rem;
  }

  .cool-scene__status {
    position: absolute;
    top: 0;
    left: 0;
    display: grid;
    gap: 0.1rem;
    padding: 0.4rem 0.65rem;
    border: 1px solid var(--color-border);
    border-radius: 0.65rem;
    background: var(--color-bg-elevated);
    box-shadow: var(--shadow-sm);
    color: var(--color-text-muted);
    font-size: 0.6rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .cool-scene__status strong {
    color: var(--color-heading);
    font-family: var(--font-display);
    font-size: var(--text-lg);
    line-height: 1;
  }

  .cool-scene__status.ready {
    color: var(--color-sage);
  }

  @media (max-width: 520px) {
    .cool-scene {
      min-height: 13rem;
      padding-right: 0;
    }

    .rack {
      width: 10rem;
      height: 12rem;
    }

    .rack__shelf--top {
      top: 4.7rem;
    }

    .rack__shelf--bottom {
      top: 9.2rem;
    }

    .rack__jar {
      width: 6rem;
    }

    .fan {
      width: 4.5rem;
      bottom: 0.9rem;
      right: -0.25rem;
    }
  }
</style>
