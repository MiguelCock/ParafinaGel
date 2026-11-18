<script lang="ts">
  import { formatCOP } from "@lib/format";
  import type { Game3DState } from "@lib/game3d/game-state.svelte";

  interface Props {
    state: Game3DState;
  }

  let { state }: Props = $props();

  const promedio = $derived(
    state.served > 0 ? (state.totalStars / state.served).toFixed(1) : "0.0",
  );
</script>

<div class="game-station-panel" data-testid="day-end-panel">
  <p class="game-eyebrow">Fin del día</p>
  <h3 class="game-title">El taller cerró por hoy</h3>
  <p class="game-text">
    Atendiste {state.served} pedidos. Mañana llegará gente nueva y el taller tendrá
    más aromas.
  </p>

  <div class="summary">
    <div>
      <span>Ventas</span>
      <strong>{formatCOP(state.totalPrice)}</strong>
    </div>
    <div>
      <span>Propinas</span>
      <strong>{formatCOP(state.totalTips)}</strong>
    </div>
    <div>
      <span>Estrellas</span>
      <strong>{state.totalStars} ★</strong>
    </div>
    <div>
      <span>Promedio</span>
      <strong>{promedio} / 5</strong>
    </div>
  </div>

  <button
    class="game-action"
    type="button"
    onclick={() => state.restart()}
    data-testid="restart"
  >
    Jugar otra vez
  </button>

  <a class="game-action game-action--secondary" href="/productos/">
    Volver al catálogo
  </a>
</div>

<style>
  .summary {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.5rem;
  }

  .summary > div {
    display: grid;
    gap: 0.1rem;
    padding: 0.65rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
  }

  .summary span {
    color: var(--color-text-muted);
    font-size: var(--text-xs);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .summary strong {
    color: var(--color-heading);
    font-size: var(--text-lg);
  }
</style>
