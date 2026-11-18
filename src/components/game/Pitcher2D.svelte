<script lang="ts">
  interface Props {
    pouring?: boolean;
    color?: string;
  }

  let { pouring = false, color = "#e9c9a8" }: Props = $props();
</script>

<svg
  class="pitcher"
  class:pouring
  viewBox="0 0 220 260"
  fill="none"
  aria-hidden="true"
>
  {#if pouring}
    <path
      class="stream"
      d="M48 112c-4 34-10 72-14 110"
      stroke={color}
      stroke-width="9"
      stroke-linecap="round"
    />
  {/if}

  <g class="body">
    <path
      d="M72 74h82l-9 108a24 24 0 0 1-24 22h-16a24 24 0 0 1-24-22L72 74Z"
      fill="#fbf3e9"
      stroke="#a98769"
      stroke-width="4"
    />
    <path
      d="M72 74c-16-18-30-20-40-10-8 8-4 21 9 27l27 12"
      fill="#fbf3e9"
      stroke="#a98769"
      stroke-width="4"
      stroke-linejoin="round"
    />
    <path
      d="M154 92c20-4 30 8 28 24-2 18-17 26-31 22"
      stroke="#a98769"
      stroke-width="10"
      stroke-linecap="round"
    />
    <path d="M69 90h88" stroke="#d8c3ad" stroke-width="3" opacity=".8" />
    <path
      d="M84 58h58l-5 18H89l-5-18Z"
      fill="#f3ddd2"
      stroke="#a98769"
      stroke-width="3"
    />
    <path
      d="M99 50h28a8 8 0 0 1 8 8v3H91v-3a8 8 0 0 1 8-8Z"
      fill="#e4d8ca"
      stroke="#a98769"
      stroke-width="2.5"
    />
    <path d="M84 116h60" stroke="#b4552f" stroke-width="6" opacity=".65" />
    <path d="M92 128h44" stroke="#b4552f" stroke-width="3" opacity=".3" />
  </g>
</svg>

<style>
  .pitcher {
    display: block;
    width: 100%;
    height: auto;
    filter: drop-shadow(0 14px 18px rgba(42, 36, 30, 0.12));
  }

  .body {
    transform-origin: 75% 78%;
    transition: transform 260ms ease;
  }

  .pitcher.pouring .body {
    transform: rotate(-18deg);
  }

  .stream {
    opacity: 0.9;
  }

  @media (prefers-reduced-motion: reduce) {
    .body {
      transition: none;
    }
  }
</style>
