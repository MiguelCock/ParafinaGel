<script lang="ts">
  import type { GameState } from "@lib/game/game-state.svelte";

  interface Props {
    state: GameState;
  }

  let { state }: Props = $props();

  const progress = $derived(
    Math.min(100, Math.max(0, ((4 - state.craft.coolingRemaining) / 4) * 100)),
  );
</script>

<div class="game-station-panel" data-testid="cool-panel">
  <p class="game-eyebrow">Enfriado</p>
  <h3 class="game-title">Deja reposar la vela</h3>
  <p class="game-text">
    La cera necesita enfriarse antes del acabado. Abanica para acelerar el
    proceso.
  </p>

  <div class="game-meter" aria-hidden="true">
    <div class="game-meter__fill" style={`width: ${progress}%`}></div>
  </div>

  <div class="game-row">
    <span class="game-badge" data-testid="cool-timer">
      {state.craft.cooled
        ? "Vela lista"
        : `${state.craft.coolingRemaining.toFixed(1)} s`}
    </span>
    <span class:game-success={state.craft.cooled} class="game-badge">
      {state.craft.cooled ? "Lista para acabar" : "Enfriando"}
    </span>
  </div>

  <button
    class="game-action game-action--secondary"
    type="button"
    onclick={() => state.fan()}
    disabled={state.craft.cooled}
    data-testid="fan"
  >
    Abanicar
  </button>

  <button
    class="game-action game-primary"
    type="button"
    onclick={() => state.goFinish()}
    disabled={!state.craft.cooled}
    data-testid="cool-continue"
  >
    Ir al acabado
  </button>
</div>
