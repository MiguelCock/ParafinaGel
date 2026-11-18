<script lang="ts">
  interface Props {
    color?: string;
    fill?: number;
    glass?: string;
    labelColor?: string;
    showLabel?: boolean;
    showLid?: boolean;
    showWick?: boolean;
    showFlame?: boolean;
  }

  let {
    color = "#f3ddd2",
    fill = 0,
    glass = "#f9f2e8",
    labelColor = "#fbf3e9",
    showLabel = false,
    showLid = false,
    showWick = true,
    showFlame = false,
  }: Props = $props();

  const clipId = "jar2d-clip";
  const fillPercent = $derived(Math.min(100, Math.max(0, fill)));
  const waxHeight = $derived((fillPercent / 100) * 122);
  const waxY = $derived(202 - waxHeight);
  const hasWax = $derived(fillPercent > 1);
  const hasWick = $derived(hasWax && showWick);
</script>

<svg class="jar" viewBox="0 0 200 260" fill="none" aria-hidden="true">
  <defs>
    <clipPath id={clipId}>
      <rect x="54" y="82" width="92" height="144" rx="19" />
    </clipPath>
    <linearGradient id="jar-glass" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color={glass} stop-opacity=".78" />
      <stop offset="45%" stop-color={glass} stop-opacity=".3" />
      <stop offset="100%" stop-color={glass} stop-opacity=".65" />
    </linearGradient>
    <linearGradient id="jar-wax" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color={color} stop-opacity=".95" />
      <stop offset="100%" stop-color={color} stop-opacity=".78" />
    </linearGradient>
  </defs>

  <ellipse cx="100" cy="238" rx="56" ry="10" fill="#2a241e" opacity=".12" />

  <rect
    x="54"
    y="82"
    width="92"
    height="144"
    rx="19"
    fill="url(#jar-glass)"
    stroke="#6f5541"
    stroke-width="3.5"
  />

  {#if hasWax}
    <g clip-path={`url(#${clipId})`}>
      <rect
        x="54"
        y={waxY}
        width="92"
        height={waxHeight + 10}
        fill="url(#jar-wax)"
      />
      <ellipse cx="100" cy={waxY} rx="46" ry="7" fill={color} opacity=".95" />
    </g>
  {/if}

  <rect
    x="60"
    y="92"
    width="10"
    height="118"
    rx="5"
    fill="#fffaf2"
    opacity=".42"
  />
  <rect
    x="56"
    y="210"
    width="88"
    height="14"
    rx="7"
    fill={glass}
    opacity=".55"
  />
  <rect
    x="54"
    y="82"
    width="92"
    height="144"
    rx="19"
    stroke="#6f5541"
    stroke-width="3.5"
  />

  <rect
    x="50"
    y="72"
    width="100"
    height="14"
    rx="7"
    fill={glass}
    stroke="#6f5541"
    stroke-width="2.5"
  />

  {#if hasWick}
    <path
      d={`M100 ${waxY - 2}v-15`}
      stroke="#3b2d25"
      stroke-width="3"
      stroke-linecap="round"
    />
    <path
      d={`M100 ${waxY - 17}v-5`}
      stroke="#b4552f"
      stroke-width="3"
      stroke-linecap="round"
    />
  {/if}

  {#if showFlame}
    <g transform={`translate(100 ${waxY - 34})`}>
      <g class="flame">
        <path
          d="M0 0c11 12 16 20 16 29a16 16 0 1 1-32 0C-16 20-11 12 0 0Z"
          fill="#e08a5f"
        />
        <path
          d="M0 8c6 7 9 12 9 17a9 9 0 1 1-18 0c0-5 3-10 9-17Z"
          fill="#f6d36f"
        />
      </g>
    </g>
  {/if}

  {#if showLabel}
    <rect
      x="69"
      y="152"
      width="62"
      height="37"
      rx="4"
      fill={labelColor}
      stroke="#d8c3ad"
    />
    <rect x="80" y="162" width="40" height="3" rx="1.5" fill="#b4552f" />
    <text
      x="100"
      y="178"
      text-anchor="middle"
      font-family="Fraunces Variable, Georgia, serif"
      font-size="9"
      font-weight="600"
      fill="#2a241e"
    >
      ParafinaGel
    </text>
  {/if}

  {#if showLid}
    <rect
      x="47"
      y="55"
      width="106"
      height="18"
      rx="8"
      fill="#fbf3e9"
      stroke="#a98769"
      stroke-width="2.5"
    />
    <rect
      x="88"
      y="45"
      width="24"
      height="12"
      rx="6"
      fill="#e4d8ca"
      stroke="#a98769"
      stroke-width="2"
    />
  {/if}
</svg>

<style>
  .jar {
    display: block;
    width: 100%;
    height: auto;
    filter: drop-shadow(0 12px 18px rgba(42, 36, 30, 0.12));
  }

  .flame {
    transform-origin: 0 0;
    animation: jar-flicker 2s ease-in-out infinite;
  }

  @keyframes jar-flicker {
    0%,
    100% {
      transform: scale(1) rotate(-1deg);
    }
    50% {
      transform: scale(1.05) rotate(1deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .flame {
      animation: none;
    }
  }
</style>
