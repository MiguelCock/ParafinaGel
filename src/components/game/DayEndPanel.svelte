<script lang="ts">
  import type { GameState } from "@lib/game/game-state.svelte";

  interface Props {
    game: GameState;
  }

  let { game }: Props = $props();

  const average = $derived(
    game.served > 0 ? (game.totalStars / game.served).toFixed(1) : "0.0",
  );
</script>

<div class="game-station-panel ledger" data-testid="day-end-panel">
  <span class="ledger__stamp" aria-hidden="true">Cerrado</span>

  <p class="game-eyebrow">Fin del día</p>
  <h3 class="game-title">El taller cerró por hoy</h3>
  <p class="game-text">
    Atendiste {game.served} pedidos y armaste sus recetas. Mañana llegarán nuevos
    briefs y más combinaciones.
  </p>

  <div class="summary">
    <div>
      <span>Pedidos</span>
      <strong>{game.served}</strong>
    </div>
    <div>
      <span>Puntos</span>
      <strong>{game.totalPoints}</strong>
    </div>
    <div>
      <span>Estrellas</span>
      <strong>{game.totalStars} ★</strong>
    </div>
    <div>
      <span>Promedio</span>
      <strong>{average} / 5</strong>
    </div>
  </div>

  <p class="ledger__thanks">Gracias por ayudar en el taller familiar.</p>

  <button
    class="game-action game-primary"
    type="button"
    onclick={() => game.restart()}
    data-testid="restart"
  >
    Jugar otra vez
  </button>

  <button
    class="game-action game-action--secondary"
    type="button"
    onclick={() => game.startSandbox()}
    data-testid="day-sandbox"
  >
    Crear mi vela
  </button>

  <a class="game-action game-action--secondary" href="/productos/">
    Ver catálogo
  </a>
</div>

<style>
  .ledger {
    position: relative;
    padding: 1rem;
    border: 1px solid var(--color-border);
    border-radius: 0.35rem;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.45), transparent 35%),
      var(--color-bg-elevated);
    box-shadow:
      0 1px 0 rgba(42, 36, 30, 0.05),
      0 14px 26px -24px rgba(42, 36, 30, 0.6);
  }

  .ledger::after {
    content: "";
    position: absolute;
    right: 0;
    bottom: -1px;
    left: 0;
    height: 8px;
    background-image: radial-gradient(
      circle at 5px 0,
      transparent 5px,
      var(--color-bg-elevated) 5.5px
    );
    background-size: 10px 10px;
    background-repeat: repeat-x;
    pointer-events: none;
  }

  .ledger__stamp {
    position: absolute;
    top: 0.75rem;
    right: 0.8rem;
    padding: 0.18rem 0.45rem;
    border: 2px solid var(--color-accent);
    border-radius: 0.25rem;
    color: var(--color-accent);
    font-size: 0.55rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    opacity: 0.65;
    transform: rotate(-6deg);
  }

  .summary {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.5rem;
  }

  .summary > div {
    display: grid;
    gap: 0.1rem;
    padding: 0.6rem;
    border: 1px solid var(--color-border);
    border-radius: 0.6rem;
    background: var(--color-surface);
  }

  .summary span {
    color: var(--color-text-muted);
    font-size: var(--text-xs);
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .summary strong {
    color: var(--color-heading);
    font-family: var(--font-display);
    font-size: var(--text-xl);
  }

  .ledger__thanks {
    padding-top: 0.6rem;
    border-top: 1px dashed var(--color-border-strong);
    color: var(--color-text-muted);
    font-family: var(--font-display);
    font-size: var(--text-lg);
    text-align: center;
  }

  @media (max-width: 520px) {
    .ledger__stamp {
      display: none;
    }
  }
</style>
