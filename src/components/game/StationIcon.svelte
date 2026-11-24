<script lang="ts">
  import type { StationId } from "@lib/game/types";

  interface Props {
    station: StationId;
    size?: number;
  }

  let { station, size = 18 }: Props = $props();
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.7"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
>
  {#if station === "counter"}
    <path d="M4 20h16M6 20v-6h12v6M8 14v-2h8v2" />
    <path d="M9 9h6l-1-3H10L9 9Z" />
    <path d="M12 9v2" />
  {:else if station === "design"}
    <path d="M4 20l4-1L19 8l-3-3L5 16l-1 4Z" />
    <path d="M14 7l3-3 3 3-3 3" />
    <path d="M6 16l2 2" />
  {:else if station === "melt"}
    <path d="M5 10h14v7a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-7Z" />
    <path
      d="M3 11h2M19 11h2M8 7c0-2 1-2 1-4M12 7c0-2 1-2 1-4M16 7c0-2 1-2 1-4"
    />
  {:else if station === "mix"}
    <path d="M4 11h6v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3Z" />
    <path d="M14 11h6v3a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-3Z" />
    <path d="M6 11V9h2v2M16 11V9h2v2" />
    <path d="M8 6c0-1.5 1-1.5 1-3M18 6c0-1.5 1-1.5 1-3" />
  {:else if station === "pour"}
    <path d="M7 4h8l-1 8H8L7 4Z" />
    <path d="M10 12v3M6 15h12v5H6z" />
    <path d="M14 8h3v3" />
  {:else if station === "wick"}
    <path d="M12 21V11" />
    <path d="M12 11c-4-3-5-6-3-8 2 3 4 4 6 2 2 4 1 7-3 8Z" />
    <path d="M6 21h12" />
  {:else if station === "cool"}
    <circle cx="12" cy="12" r="3" />
    <path
      d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1"
    />
  {:else}
    <path d="M4 5h16v14H4z" />
    <path d="M8 5V3h8v2M8 11h8M8 15h5" />
    <path d="M17 11l2 2-2 2" />
  {/if}
</svg>
