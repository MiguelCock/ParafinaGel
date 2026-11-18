<script lang="ts">
  import type { Customer } from "@lib/game/types";

  interface Props {
    customer: Customer;
    size?: "sm" | "md" | "lg";
    shape?: "circle" | "arch";
  }

  let { customer, size = "md", shape = "circle" }: Props = $props();

  let imageFailed = $state(false);
  const uid = $props.id();
  const bgId = `portrait-bg-${uid}`;
  const shirtId = `portrait-shirt-${uid}`;
</script>

<div
  class="portrait"
  class:portrait--sm={size === "sm"}
  class:portrait--md={size === "md"}
  class:portrait--lg={size === "lg"}
  class:portrait--circle={shape === "circle"}
  class:portrait--arch={shape === "arch"}
>
  {#if customer.portrait && !imageFailed}
    <img
      src={customer.portrait}
      alt={`Retrato de ${customer.nombre}`}
      onerror={() => (imageFailed = true)}
    />
  {:else}
    <svg
      viewBox="0 0 200 200"
      role="img"
      aria-label={`Retrato de ${customer.nombre}`}
    >
      <defs>
        <radialGradient id={bgId} cx="50%" cy="35%" r="75%">
          <stop offset="0%" stop-color="#fffaf1" />
          <stop offset="100%" stop-color="#f1ddc7" />
        </radialGradient>
        <linearGradient id={shirtId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color={customer.shirt} stop-opacity="0.95" />
          <stop offset="100%" stop-color={customer.shirt} stop-opacity="0.75" />
        </linearGradient>
      </defs>

      <rect width="200" height="200" fill={`url(#${bgId})`} />
      <circle
        cx="100"
        cy="96"
        r="78"
        fill="none"
        stroke="#e2cbb2"
        stroke-width="1.5"
        opacity=".55"
      />
      <circle cx="154" cy="48" r="4" fill="#b4552f" opacity=".25" />
      <circle cx="46" cy="62" r="2.5" fill="#7c8b72" opacity=".35" />

      <path
        d="M26 200c2-37 28-64 74-64s72 27 74 64Z"
        fill={`url(#${shirtId})`}
      />
      <path
        d="M82 129h36v23c0 10-8 18-18 18s-18-8-18-18Z"
        fill={customer.skin}
      />
      <path
        d="M78 139c8 7 16 10 22 10s14-3 22-10"
        fill="none"
        stroke="#000"
        stroke-opacity=".08"
        stroke-width="3"
      />

      <ellipse cx="100" cy="95" rx="43" ry="49" fill={customer.skin} />
      <ellipse cx="58" cy="99" rx="8" ry="12" fill={customer.skin} />
      <ellipse cx="142" cy="99" rx="8" ry="12" fill={customer.skin} />

      {#if customer.id === "marta"}
        <path
          d="M57 94c-4-35 18-55 44-55s47 18 44 52c-8-7-14-17-17-26-16 14-40 17-59 11-2 8-6 14-12 18Z"
          fill={customer.hair}
        />
        <circle cx="100" cy="38" r="17" fill={customer.hair} />
        <path
          d="M64 63c8-5 18-8 28-7M109 55c9 1 17 5 23 10"
          stroke="#d8d2ca"
          stroke-width="3"
          stroke-linecap="round"
          fill="none"
          opacity=".65"
        />
        <circle cx="58" cy="109" r="3" fill="#c9a227" />
        <circle cx="142" cy="109" r="3" fill="#c9a227" />
        <path
          d="M78 143c8 6 14 9 22 9s14-3 22-9"
          fill="none"
          stroke={customer.shirt}
          stroke-width="6"
          stroke-linecap="round"
          opacity=".55"
        />
      {:else if customer.id === "nico"}
        <path
          d="M58 87c-1-30 18-48 43-48 28 0 45 19 43 50-10-2-17-9-21-19-14 9-30 13-50 11-4 6-9 8-15 6Z"
          fill={customer.hair}
        />
        <path
          d="M60 89c-3 5-4 11-2 16M140 89c3 5 4 11 2 16"
          stroke={customer.hair}
          stroke-width="5"
          stroke-linecap="round"
        />
        <path
          d="M78 143c8 5 14 8 22 8s14-3 22-8"
          fill="none"
          stroke="#fff9f2"
          stroke-width="4"
          stroke-linecap="round"
          opacity=".55"
        />
      {:else}
        <path
          d="M55 102c-4-40 18-63 45-63s49 22 45 64c-3 23-12 45-22 58-8-17-10-34-8-49-13 8-28 10-44 6 2 18-2 32-10 44-13-19-19-39-6-60Z"
          fill={customer.hair}
        />
        <path
          d="M64 108c-2 24 0 44 7 60M136 108c2 24 0 44-7 60"
          fill="none"
          stroke={customer.hair}
          stroke-width="10"
          stroke-linecap="round"
          opacity=".95"
        />
        <path
          d="M76 143c9 6 16 9 24 9s15-3 24-9"
          fill="none"
          stroke="#fff9f2"
          stroke-width="4"
          stroke-linecap="round"
          opacity=".5"
        />
      {/if}

      <path
        d="M78 96c4-4 10-4 14 0M108 96c4-4 10-4 14 0"
        fill="none"
        stroke="#3b2d25"
        stroke-width="2.4"
        stroke-linecap="round"
      />
      <ellipse cx="85" cy="104" rx="3.2" ry="4" fill="#3b2d25" />
      <ellipse cx="115" cy="104" rx="3.2" ry="4" fill="#3b2d25" />
      <circle cx="85" cy="103" r="1" fill="#fff9f2" />
      <circle cx="115" cy="103" r="1" fill="#fff9f2" />
      <path
        d="M99 107c0 5-2 8-5 9"
        fill="none"
        stroke="#8f5f40"
        stroke-width="2"
        stroke-linecap="round"
        opacity=".6"
      />
      <path
        d="M88 124c7 5 17 5 24 0"
        fill="none"
        stroke="#7a3f2c"
        stroke-width="3"
        stroke-linecap="round"
      />
      <circle cx="72" cy="117" r="6" fill="#b4552f" opacity=".14" />
      <circle cx="128" cy="117" r="6" fill="#b4552f" opacity=".14" />
    </svg>
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
  .portrait svg {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
</style>
