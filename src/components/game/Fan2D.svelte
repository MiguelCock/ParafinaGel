<script lang="ts">
  interface Props {
    spinning?: boolean;
  }

  let { spinning = false }: Props = $props();
</script>

<svg
  class="fan"
  class:spinning
  viewBox="0 0 180 230"
  fill="none"
  aria-hidden="true"
>
  <ellipse cx="90" cy="215" rx="52" ry="9" fill="#2a241e" opacity=".12" />
  <path d="M74 208h32l6-16H68l6 16Z" fill="#8a8d8a" />
  <path
    d="M90 192v-58"
    stroke="#8a8d8a"
    stroke-width="9"
    stroke-linecap="round"
  />
  <circle
    cx="90"
    cy="115"
    r="58"
    fill="#f9f2e8"
    stroke="#8a8d8a"
    stroke-width="4"
  />
  <circle
    cx="90"
    cy="115"
    r="54"
    stroke="#b8b8b0"
    stroke-width="2"
    opacity=".6"
  />
  {#each [0, 1, 2, 3, 4, 5, 6, 7] as bar}
    <path
      d={`M90 61v-8`}
      stroke="#b8b8b0"
      stroke-width="3"
      transform={`rotate(${bar * 45} 90 115)`}
      opacity=".65"
    />
  {/each}
  <g class="rotor">
    {#each [0, 1, 2] as index}
      <ellipse
        cx="90"
        cy="80"
        rx="18"
        ry="32"
        fill="#b4552f"
        opacity=".9"
        transform={`rotate(${index * 120} 90 115)`}
      />
    {/each}
    <circle cx="90" cy="115" r="10" fill="#7a3f2c" />
  </g>
  <circle cx="90" cy="115" r="58" stroke="#8a8d8a" stroke-width="4" />
</svg>

<style>
  .fan {
    display: block;
    width: 100%;
    height: auto;
    filter: drop-shadow(0 10px 14px rgba(42, 36, 30, 0.1));
  }

  .rotor {
    transform-origin: 90px 115px;
  }

  .fan.spinning .rotor {
    animation: fan-spin 0.55s linear infinite;
  }

  @keyframes fan-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .fan.spinning .rotor {
      animation: none;
    }
  }
</style>
