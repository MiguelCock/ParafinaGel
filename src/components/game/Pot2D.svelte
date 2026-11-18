<script lang="ts">
  interface Props {
    wax?: string;
    heating?: boolean;
    stirs?: number;
  }

  let { wax = "#e9c9a8", heating = false, stirs = 0 }: Props = $props();
</script>

<svg
  class="pot"
  class:heating
  viewBox="0 0 260 230"
  fill="none"
  aria-hidden="true"
>
  <ellipse cx="130" cy="207" rx="86" ry="13" fill="#2a241e" opacity=".12" />
  <ellipse class="heat" cx="130" cy="196" rx="78" ry="16" fill="#e08a5f" />

  <path d="M74 178h112l-9 15H83Z" fill="#3b2d25" opacity=".18" />
  <path
    d="M63 95h134v60a30 30 0 0 1-30 30H93a30 30 0 0 1-30-30V95Z"
    fill="#6f8165"
    stroke="#4f5f47"
    stroke-width="4"
  />
  <path d="M63 115h134" stroke="#4f5f47" stroke-width="3" opacity=".45" />
  <path
    d="M63 105H39a15 15 0 0 0 0 30h24M197 105h24a15 15 0 0 1 0 30h-24"
    stroke="#4f5f47"
    stroke-width="7"
    stroke-linecap="round"
  />
  <rect x="76" y="103" width="108" height="34" rx="12" fill={wax} />
  <ellipse cx="130" cy="103" rx="54" ry="8" fill={wax} opacity=".95" />

  <g
    class="spoon"
    style={`transform: rotate(${stirs * 16}deg); transform-origin: 178px 55px;`}
  >
    <path
      d="M178 55 128 106"
      stroke="#b98963"
      stroke-width="7"
      stroke-linecap="round"
    />
    <ellipse
      cx="124"
      cy="111"
      rx="13"
      ry="8"
      fill="#b98963"
      transform="rotate(-42 124 111)"
    />
  </g>

  <path
    d="M72 66c-7 8-9 14-9 19a9 9 0 1 0 18 0c0-5-2-11-9-19ZM126 54c-6 7-8 12-8 16a8 8 0 1 0 16 0c0-4-2-9-8-16ZM180 66c-7 8-9 14-9 19a9 9 0 1 0 18 0c0-5-2-11-9-19Z"
    stroke="#c9a27d"
    stroke-width="2.5"
    stroke-linecap="round"
    opacity=".55"
  />
</svg>

<style>
  .pot {
    display: block;
    width: 100%;
    height: auto;
    filter: drop-shadow(0 14px 18px rgba(42, 36, 30, 0.12));
  }

  .heat {
    opacity: 0.12;
    transition: opacity 220ms ease;
  }

  .pot.heating .heat {
    opacity: 0.75;
  }

  .spoon {
    transition: transform 220ms ease;
  }

  @media (prefers-reduced-motion: reduce) {
    .heat,
    .spoon {
      transition: none;
    }
  }
</style>
