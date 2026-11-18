<script lang="ts">
  import type { GameState } from "@lib/game/game-state.svelte";

  interface Props {
    game: GameState;
  }

  let { game }: Props = $props();

  const gel = $derived(game.design.mode === "gel");
  const bubbles = [0, 1, 2, 3, 4];
  const bubblePositions = [
    { left: "18%", top: "28%" },
    { left: "44%", top: "16%" },
    { left: "70%", top: "36%" },
    { left: "32%", top: "62%" },
    { left: "62%", top: "70%" },
  ];
</script>

<div class="game-station-panel" data-testid="cool-panel">
  <p class="game-eyebrow">{gel ? "Curado del gel" : "Enfriado"}</p>
  <h3 class="game-title">
    {game.craft.cooled ? "La vela está lista" : "Deja reposar la vela"}
  </h3>
  <p class="game-text">
    {gel
      ? "La parafina gel necesita cuajar despacio. Mientras tanto, quita las burbujas que aparezcan en la superficie."
      : "La cera necesita enfriarse antes del acabado. Abanica para acelerar el proceso; no pasa nada si tardas."}
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

  {#if gel}
    <div class="bubble-field" data-testid="bubble-field">
      {#each bubbles as bubble}
        {@const popped = bubble < game.craft.gelPopped}
        <button
          class="bubble"
          class:popped
          type="button"
          disabled={popped || game.craft.cooled}
          style={`left: ${bubblePositions[bubble]?.left}; top: ${bubblePositions[bubble]?.top}`}
          aria-label={popped
            ? `Burbuja ${bubble + 1} quitada`
            : `Quitar burbuja ${bubble + 1}`}
          onclick={() => game.popBubble()}
          data-testid={`bubble-${bubble}`}
        >
          {popped ? "✓" : ""}
        </button>
      {/each}
      <span class="bubble-field__label">
        Burbujas {game.craft.gelPopped}/{game.craft.gelBubbles}
      </span>
    </div>
  {/if}

  <button
    class="game-action game-action--secondary"
    type="button"
    onclick={() => game.fan()}
    disabled={game.craft.cooled}
    data-testid="fan"
  >
    Abanicar
  </button>

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
  .bubble-field {
    position: relative;
    min-height: 7.5rem;
    border: 1px solid var(--color-border);
    border-radius: 0.8rem;
    background:
      radial-gradient(
        circle at 30% 20%,
        rgba(255, 255, 255, 0.6),
        transparent 45%
      ),
      var(--color-surface);
  }

  .bubble {
    position: absolute;
    display: grid;
    place-items: center;
    width: 2.2rem;
    height: 2.2rem;
    border: 1.5px solid rgba(127, 149, 171, 0.65);
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
    box-shadow: inset -2px -3px 5px rgba(127, 149, 171, 0.25);
    color: var(--color-sage);
    font-size: 0.8rem;
    font-weight: 800;
    transition:
      opacity var(--transition),
      transform var(--transition);
  }

  .bubble:hover:not(:disabled) {
    transform: scale(1.08);
  }

  .bubble.popped {
    border-color: var(--color-sage);
    background: var(--color-sage-soft);
    opacity: 0.65;
  }

  .bubble-field__label {
    position: absolute;
    right: 0.5rem;
    bottom: 0.4rem;
    color: var(--color-text-muted);
    font-size: 0.6rem;
    font-weight: 700;
  }

  @media (prefers-reduced-motion: reduce) {
    .bubble {
      transition: none;
    }
  }
</style>
