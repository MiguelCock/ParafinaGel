<script lang="ts">
  import { formatCOP } from "@lib/format";
  import type { Game3DState } from "@lib/game3d/game-state.svelte";

  interface Props {
    state: Game3DState;
  }

  let { state }: Props = $props();
</script>

{#if state.score}
  <div class="game-station-panel" data-testid="score-panel">
    <p class="game-eyebrow">Pedido entregado</p>
    <h3 class="game-title">¡Gracias, {state.order.customer.nombre}!</h3>

    <div class="score">
      <p class="score__number">
        {state.score.total}<span>/100</span>
      </p>
      <div
        class="game-stars"
        aria-label={`${state.score.stars} de 5 estrellas`}
      >
        {#each Array.from({ length: 5 }) as _, index}
          <span
            class:game-star--filled={index < state.score.stars}
            aria-hidden="true"
          >
            ★
          </span>
        {/each}
      </div>
    </div>

    <div class="game-breakdown">
      <div><span>Aroma</span><strong>{state.score.scent} pts</strong></div>
      <div><span>Color</span><strong>{state.score.color} pts</strong></div>
      <div><span>Frasco</span><strong>{state.score.vessel} pts</strong></div>
      <div><span>Etiqueta</span><strong>{state.score.label} pts</strong></div>
      <div>
        <span>Temperatura</span><strong>{state.score.temperature} pts</strong>
      </div>
      <div><span>Vertido</span><strong>{state.score.fill} pts</strong></div>
      <div><span>Acabado</span><strong>{state.score.finish} pts</strong></div>
    </div>

    <div class="score__money">
      <div>
        <span>Precio</span><strong>{formatCOP(state.score.price)}</strong>
      </div>
      <div>
        <span>Propina</span><strong>{formatCOP(state.score.tip)}</strong>
      </div>
    </div>

    <div class="score__actions">
      <button
        class="game-action"
        type="button"
        onclick={() => state.next()}
        data-testid="next-customer"
      >
        {state.isLastOrder ? "Terminar el día" : "Siguiente cliente"}
      </button>
      <a
        class="game-action game-action--secondary"
        href={`/productos/${state.order.productSlug}/`}
      >
        Ver producto
      </a>
    </div>
  </div>
{/if}

<style>
  .score {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .score__number {
    color: var(--color-heading);
    font-family: var(--font-display);
    font-size: 3rem;
    font-weight: 600;
    line-height: 0.9;
  }

  .score__number span {
    color: var(--color-text-muted);
    font-family: var(--font-body);
    font-size: var(--text-sm);
    font-weight: 700;
  }

  .score__money {
    display: grid;
    gap: 0.3rem;
    padding-top: 0.75rem;
    border-top: 1px dashed var(--color-border-strong);
    color: var(--color-text-muted);
    font-size: var(--text-sm);
  }

  .score__money > div {
    display: flex;
    justify-content: space-between;
  }

  .score__money strong {
    color: var(--color-heading);
  }

  .score__actions {
    display: grid;
    gap: 0.5rem;
  }
</style>
