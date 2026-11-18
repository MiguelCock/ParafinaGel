<script lang="ts">
  import type { Order, Phase } from "@lib/game3d/types";

  interface Props {
    order: Order;
    phase: Phase;
  }

  let { order, phase }: Props = $props();
</script>

<article class="ticket" data-testid="order-ticket">
  <header class="ticket__header">
    <div
      class="ticket__avatar"
      style={`--avatar: ${order.customer.shirt}`}
      aria-hidden="true"
    >
      {order.customer.nombre.slice(0, 1)}
    </div>
    <div>
      <p class="ticket__eyebrow">Pedido de ejemplo</p>
      <h3>{order.customer.nombre}</h3>
      <p class="ticket__greeting">“{order.customer.saludo}”</p>
    </div>
  </header>

  <dl class="ticket__specs">
    <div>
      <dt>Aroma</dt>
      <dd data-testid="order-scent">{order.scent.nombre}</dd>
    </div>
    <div>
      <dt>Color</dt>
      <dd data-testid="order-color">
        <span class="ticket__swatch" style={`--swatch: ${order.color.hex}`}
        ></span>
        {order.color.nombre}
      </dd>
    </div>
    <div>
      <dt>Frasco</dt>
      <dd data-testid="order-vessel">{order.vessel.nombre}</dd>
    </div>
    <div>
      <dt>Tamaño</dt>
      <dd data-testid="order-size">{order.size.nombre}</dd>
    </div>
    <div>
      <dt>Etiqueta</dt>
      <dd data-testid="order-label">{order.label.nombre}</dd>
    </div>
  </dl>

  {#if phase === "score"}
    <p class="ticket__status">Pedido entregado</p>
  {/if}
</article>

<style>
  .ticket {
    display: grid;
    gap: 0.75rem;
    padding: 0.9rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background:
      linear-gradient(180deg, transparent 0 96%, var(--color-surface) 96%),
      var(--color-bg-elevated);
  }

  .ticket__header {
    display: flex;
    align-items: flex-start;
    gap: 0.7rem;
  }

  .ticket__avatar {
    display: grid;
    place-items: center;
    flex: none;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    background: var(--avatar);
    color: #fff9f2;
    font-family: var(--font-display);
    font-size: 1.1rem;
    font-weight: 600;
  }

  .ticket__eyebrow {
    color: var(--color-accent);
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  h3 {
    font-family: var(--font-display);
    font-size: var(--text-xl);
    line-height: 1.1;
  }

  .ticket__greeting {
    margin-top: 0.15rem;
    color: var(--color-text-muted);
    font-size: var(--text-xs);
    line-height: 1.4;
  }

  .ticket__specs {
    display: grid;
    gap: 0.35rem;
    padding-top: 0.6rem;
    border-top: 1px dashed var(--color-border-strong);
    font-size: var(--text-xs);
  }

  .ticket__specs > div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
  }

  dt {
    color: var(--color-text-muted);
  }

  dd {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-weight: 800;
    text-align: right;
  }

  .ticket__swatch {
    width: 0.8rem;
    height: 0.8rem;
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 50%;
    background: var(--swatch);
  }

  .ticket__status {
    padding: 0.35rem 0.6rem;
    border-radius: var(--radius-full);
    background: var(--color-sage-soft);
    color: var(--color-sage);
    font-size: var(--text-xs);
    font-weight: 800;
    text-align: center;
  }
</style>
