<script lang="ts">
  import type { GameState } from "@lib/game/game-state.svelte";

  interface Props {
    game: GameState;
  }

  let { game }: Props = $props();

  const gel = $derived(game.design.mode === "gel");
</script>

<div class="game-station-panel" data-testid="cool-panel">
  <p class="game-eyebrow">{gel ? "Curado del gel" : "Enfriado"}</p>
  <h3 class="game-title">
    {game.craft.cooled ? "La vela está lista" : "Deja reposar la vela"}
  </h3>
  <p class="game-text">
    {gel
      ? "El gel necesita cuajar despacio. Toca el ventilador para abanicar y las burbujas dentro de la vela para quitarlas."
      : "La cera necesita enfriarse antes del acabado. Toca el ventilador del taller para acelerar el proceso y retira el sostenedor cuando la vela esté firme."}
  </p>

  <div class="game-meter" aria-hidden="true">
    <div
      class="game-meter__fill"
      style={`width: ${game.coolingProgress}%`}
    ></div>
  </div>

  <div class="game-row">
    <span class="game-badge" data-testid="cool-timer">
      {game.craft.cooled
        ? "Vela lista"
        : `${game.craft.coolingRemaining.toFixed(1)} s`}
    </span>
    <span class:game-success={game.craft.cooled} class="game-badge">
      {game.craft.cooled ? "Lista para acabar" : "Cuajando"}
    </span>
  </div>

  <div class="manual-note">
    <span class="manual-note__icon" aria-hidden="true">❄</span>
    <span>
      <strong>Ventilador:</strong> tócalo en el escenario o pulsa Espacio.
      {#if gel}
        <br />
        <strong>Burbujas:</strong> tócalas dentro del gel o pulsa B. Quedan {Math.max(
          0,
          game.craft.gelBubbles - game.craft.gelPopped,
        )} de
        {game.craft.gelBubbles}.
      {/if}
    </span>
  </div>

  <button
    class="game-action game-primary"
    type="button"
    onclick={() => game.goFinish()}
    disabled={!game.craft.cooled}
    data-testid="cool-continue"
  >
    Ir al acabado
  </button>
</div>

<style>
  .manual-note {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 0.5rem;
    padding: 0.55rem 0.65rem;
    border-left: 3px solid var(--color-accent);
    border-radius: 0.4rem;
    background: var(--color-accent-soft);
    color: var(--color-accent-strong);
    font-size: 0.65rem;
    line-height: 1.45;
  }

  .manual-note__icon {
    display: grid;
    place-items: center;
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 50%;
    background: var(--color-bg-elevated);
    font-size: 0.9rem;
    font-weight: 800;
  }
</style>
