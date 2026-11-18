<script lang="ts">
  import { orderTypeLabels } from "@lib/game/data";
  import type { Brief } from "@lib/game/types";
  import CustomerPortrait from "./CustomerPortrait.svelte";

  interface Props {
    brief: Brief;
    revealed: number;
    noted?: boolean;
  }

  let { brief, revealed, noted = false }: Props = $props();

  const line = $derived(
    brief.lines[Math.min(revealed, brief.lines.length) - 1] ?? brief.lines[0],
  );
</script>

<div class="counter-scene" data-testid="counter-scene">
  <div class="counter-scene__portrait">
    <CustomerPortrait customer={brief.customer} shape="arch" size="lg" />
  </div>

  <div class="counter-scene__speech">
    <p class="counter-scene__badge">{orderTypeLabels[brief.type]}</p>
    <p class="counter-scene__quote">“{line?.text ?? brief.customer.saludo}”</p>
    <p class="counter-scene__name">{brief.customer.nombre}</p>
  </div>

  <div class="counter-scene__desk" aria-hidden="true">
    <span class="counter-scene__bell">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.6"
      >
        <path d="M4 18h16M6 18v-4h12v4M9 14v-3h6v3M10 11h4l-1-3h-2l-1 3Z" />
      </svg>
    </span>
    <span class="counter-scene__note">
      {noted ? "Nota creada, ¡a diseñar!" : "Escuchando el pedido…"}
    </span>
  </div>
</div>

<style>
  .counter-scene {
    position: relative;
    display: grid;
    justify-items: center;
    gap: 0.6rem;
    padding-top: 0.25rem;
  }

  .counter-scene__portrait {
    width: clamp(7.5rem, 28vw, 11rem);
    filter: drop-shadow(0 10px 18px rgba(42, 36, 30, 0.14));
  }

  .counter-scene__speech {
    position: relative;
    max-width: 26rem;
    padding: 0.7rem 1rem;
    border: 1px solid var(--color-border);
    border-radius: 1rem 1rem 1rem 0.35rem;
    background: var(--color-bg-elevated);
    box-shadow: var(--shadow-sm);
    text-align: center;
  }

  .counter-scene__speech::before {
    content: "";
    position: absolute;
    bottom: -0.45rem;
    left: 1.5rem;
    width: 0.8rem;
    height: 0.8rem;
    border-right: 1px solid var(--color-border);
    border-bottom: 1px solid var(--color-border);
    background: var(--color-bg-elevated);
    transform: rotate(45deg);
  }

  .counter-scene__badge {
    color: var(--color-accent);
    font-size: 0.55rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .counter-scene__quote {
    margin-top: 0.15rem;
    color: var(--color-text);
    font-family: var(--font-display);
    font-size: var(--text-lg);
    line-height: 1.25;
  }

  .counter-scene__name {
    margin-top: 0.3rem;
    color: var(--color-text-muted);
    font-size: var(--text-xs);
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .counter-scene__desk {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: min(100%, 22rem);
    margin-top: 0.25rem;
    padding: 0.5rem 0.7rem;
    border-top: 3px solid #b98963;
    border-radius: 0.35rem;
    background: linear-gradient(180deg, #d2a77e, #b98963);
    color: #fff9f2;
    box-shadow: 0 8px 14px -10px rgba(42, 36, 30, 0.5);
  }

  .counter-scene__bell {
    display: grid;
    place-items: center;
    width: 1.7rem;
    height: 1.7rem;
    border-radius: 50%;
    background: #c9a227;
    color: #5d4712;
  }

  .counter-scene__bell svg {
    width: 1.1rem;
    height: 1.1rem;
  }

  .counter-scene__note {
    font-size: var(--text-xs);
    font-weight: 700;
  }

  @media (max-width: 520px) {
    .counter-scene__portrait {
      width: 6.5rem;
    }

    .counter-scene__speech {
      padding: 0.5rem 0.75rem;
    }

    .counter-scene__quote {
      font-size: var(--text-base);
    }

    .counter-scene__desk {
      display: none;
    }
  }

  @media (prefers-reduced-motion: no-preference) {
    .counter-scene__portrait {
      animation: counter-in 380ms ease-out both;
    }
  }

  @keyframes counter-in {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
