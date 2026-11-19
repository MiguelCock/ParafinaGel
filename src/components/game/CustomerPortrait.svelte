<script lang="ts">
  import { portraitSvg } from "@lib/game/portrait";
  import type { Customer } from "@lib/game/types";

  interface Props {
    customer: Customer;
    size?: "sm" | "md" | "lg";
    shape?: "circle" | "arch";
  }

  let { customer, size = "md", shape = "circle" }: Props = $props();

  let imageFailed = $state(false);
  const uid = $props.id();
  const svg = $derived(portraitSvg(customer, uid));
</script>

<div
  class="portrait"
  class:portrait--sm={size === "sm"}
  class:portrait--md={size === "md"}
  class:portrait--lg={size === "lg"}
  class:portrait--circle={shape === "circle"}
  class:portrait--arch={shape === "arch"}
  role="img"
  aria-label={`Retrato de ${customer.nombre}`}
>
  {#if customer.portrait && !imageFailed}
    <img
      src={customer.portrait}
      alt={`Retrato de ${customer.nombre}`}
      onerror={() => (imageFailed = true)}
    />
  {:else}
    {@html svg}
  {/if}
</div>

<style>
  .portrait {
    position: relative;
    display: block;
    flex: none;
    overflow: hidden;
    aspect-ratio: 1;
    background: var(--color-surface);
    box-shadow: var(--shadow-sm);
  }

  .portrait--circle {
    border-radius: 50%;
  }

  .portrait--arch {
    border-radius: 999px 999px 1rem 1rem;
  }

  .portrait--sm {
    width: 2.75rem;
  }

  .portrait--md {
    width: 5rem;
  }

  .portrait--lg {
    width: min(100%, 15rem);
  }

  .portrait img,
  .portrait :global(svg) {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
</style>
