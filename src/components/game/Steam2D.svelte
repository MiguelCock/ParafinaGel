<script lang="ts">
  interface Props {
    active?: boolean;
    intensity?: number;
  }

  let { active = true, intensity = 1 }: Props = $props();

  const puffs = [0, 1, 2];
</script>

{#if active}
  <div class="steam" style={`--steam-opacity: ${intensity}`} aria-hidden="true">
    {#each puffs as puff}
      <span style={`--i: ${puff}`}></span>
    {/each}
  </div>
{/if}

<style>
  .steam {
    position: absolute;
    width: 90px;
    height: 120px;
    pointer-events: none;
  }

  .steam span {
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #fff9f2;
    opacity: 0;
    filter: blur(2px);
    transform: translateX(-50%);
    animation: steam-rise 2.8s ease-out infinite;
    animation-delay: calc(var(--i) * 0.7s);
  }

  @keyframes steam-rise {
    0% {
      transform: translate(-50%, 0) scale(0.55);
      opacity: 0;
    }
    25% {
      opacity: calc(0.55 * var(--steam-opacity));
    }
    100% {
      transform: translate(calc(-50% + 12px), -95px) scale(1.35);
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .steam span {
      animation: none;
      opacity: calc(0.3 * var(--steam-opacity));
      transform: translate(-50%, -30px) scale(0.9);
    }
  }
</style>
