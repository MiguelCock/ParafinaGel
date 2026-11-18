<script lang="ts">
  import { formatCOP } from "@lib/format";
  import type { GameState } from "@lib/game/game-state.svelte";

  interface Props {
    state: GameState;
  }

  let { state }: Props = $props();
</script>

{#if state.score}
  <div class="game-station-panel receipt" data-testid="score-panel">
    <span class="receipt__stamp" aria-hidden="true">Pagado</span>

    <p class="game-eyebrow">Pedido entregado</p>
    <h3 class="game-title">¡Gracias, {state.order.customer.nombre}!</h3>
    <p class="game-text">
      La vela quedó lista. Este es el detalle de la entrega.
    </p>

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

    <div class="game-breakdown receipt__lines">
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
        class="game-action game-primary"
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
  .receipt {
    position: relative;
    padding: 1rem;
    border: 1px solid var(--color-border);
    border-radius: 0.35rem;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.5), transparent 40%),
      var(--color-bg-elevated);
    box-shadow:
      0 1px 0 rgba(42, 36, 30, 0.05),
      0 14px 26px -24px rgba(42, 36, 30, 0.6);
  }

  .receipt::after {
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

  .receipt__stamp {
    position: absolute;
    top: 0.75rem;
    right: 0.8rem;
    padding: 0.18rem 0.45rem;
    border: 2px solid var(--color-sage);
    border-radius: 0.25rem;
    color: var(--color-sage);
    font-size: 0.55rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    opacity: 0.7;
    transform: rotate(-7deg);
  }

  .score {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding-top: 0.25rem;
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

  .receipt__lines > div {
    padding-bottom: 0.2rem;
    border-bottom: 1px dotted var(--color-border-strong);
  }

  .score__money {
    display: grid;
    gap: 0.3rem;
    padding-top: 0.7rem;
    border-top: 2px dashed var(--color-border-strong);
    color: var(--color-text-muted);
    font-size: var(--text-sm);
  }

  .score__money > div {
    display: flex;
    justify-content: space-between;
  }

  .score__money strong {
    color: var(--color-heading);
    font-size: var(--text-base);
  }

  .score__actions {
    display: grid;
    gap: 0.5rem;
  }

  @media (max-width: 520px) {
    .receipt__stamp {
      display: none;
    }
  }
</style>
