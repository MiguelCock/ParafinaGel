<script lang="ts">
  import type { Order, Phase } from "@lib/game/types";
  import CustomerPortrait from "./CustomerPortrait.svelte";

  interface Props {
    order: Order;
    phase: Phase;
  }

  let { order, phase }: Props = $props();
</script>

<article class="ticket" data-testid="order-ticket">
  <span class="ticket__tape" aria-hidden="true"></span>
  <span class="ticket__stamp" aria-hidden="true">Ejemplo</span>

  <header class="ticket__header">
    <CustomerPortrait customer={order.customer} size="sm" />
    <div>
      <p class="ticket__eyebrow">Pedido</p>
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
    position: relative;
    display: grid;
    gap: 0.7rem;
    padding: 1rem 0.9rem 0.85rem;
    border: 1px solid var(--color-border);
    border-radius: 0.3rem;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.55), transparent 45%),
      var(--color-bg-elevated);
    box-shadow:
      0 1px 0 rgba(42, 36, 30, 0.05),
      0 12px 22px -20px rgba(42, 36, 30, 0.5);
  }

  .ticket::after {
    content: "";
    position: absolute;
    right: 0;
    bottom: -1px;
    left: 0;
    height: 6px;
    background-image: radial-gradient(
      circle at 4px 0,
      transparent 4px,
      var(--color-bg-elevated) 4.5px
    );
    background-size: 8px 8px;
    background-repeat: repeat-x;
    pointer-events: none;
  }

  .ticket__tape {
    position: absolute;
    top: -0.4rem;
    left: 50%;
    width: 3.5rem;
    height: 0.9rem;
    background: rgba(228, 216, 202, 0.75);
    transform: translateX(-50%) rotate(-2deg);
    box-shadow: 0 1px 2px rgba(42, 36, 30, 0.08);
  }

  .ticket__stamp {
    position: absolute;
    top: 0.55rem;
    right: 0.6rem;
    padding: 0.15rem 0.4rem;
    border: 1px solid #b4552f;
    border-radius: 0.2rem;
    color: #b4552f;
    font-size: 0.55rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    opacity: 0.7;
    transform: rotate(-6deg);
  }

  .ticket__header {
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
    padding-right: 3rem;
  }

  .ticket__eyebrow {
    color: var(--color-accent);
    font-size: 0.62rem;
    font-weight: 800;
    letter-spacing: 0.13em;
    text-transform: uppercase;
  }

  .ticket__header h3 {
    font-family: var(--font-display);
    font-size: var(--text-xl);
    line-height: 1.05;
  }

  .ticket__greeting {
    margin-top: 0.2rem;
    color: var(--color-text-muted);
    font-size: 0.68rem;
    line-height: 1.35;
  }

  .ticket__specs {
    display: grid;
    gap: 0.3rem;
    padding-top: 0.55rem;
    border-top: 1px dashed var(--color-border-strong);
    font-size: 0.7rem;
  }

  .ticket__specs > div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
  }

  .ticket__specs dt {
    color: var(--color-text-muted);
  }

  .ticket__specs dd {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    color: var(--color-heading);
    font-weight: 800;
    text-align: right;
  }

  .ticket__swatch {
    width: 0.75rem;
    height: 0.75rem;
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 50%;
    background: var(--swatch);
  }

  .ticket__status {
    padding: 0.3rem 0.55rem;
    border-radius: 999px;
    background: var(--color-sage-soft);
    color: var(--color-sage);
    font-size: 0.62rem;
    font-weight: 800;
    text-align: center;
  }
</style>
