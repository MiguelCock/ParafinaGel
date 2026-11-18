<script lang="ts">
  import { T, useTask } from "@threlte/core";
  import { prefersReducedMotion } from "@lib/game3d/motion";

  interface Props {
    position?: [number, number, number];
    active?: boolean;
    intensity?: number;
  }

  let { position = [0, 0, 0], active = true, intensity = 1 }: Props = $props();

  let time = $state(0);

  useTask((delta) => {
    if (!active || prefersReducedMotion) return;
    time += delta;
  });

  const puffs = $derived(
    [0, 1, 2].map((index) => {
      const progress = (time * 0.35 + index / 3) % 1;
      return {
        y: progress * 0.5,
        x: Math.sin((time + index) * 1.7) * 0.05,
        opacity: (1 - progress) * 0.22 * intensity,
        scale: 0.05 + progress * 0.09,
      };
    }),
  );
</script>

{#if active}
  <T.Group {position}>
    {#each puffs as puff}
      <T.Mesh position={[puff.x, puff.y, 0]} scale={puff.scale}>
        <T.SphereGeometry args={[1, 8, 8]} />
        <T.MeshBasicMaterial
          color="#fff9f2"
          transparent
          opacity={puff.opacity}
          depthWrite={false}
        />
      </T.Mesh>
    {/each}
  </T.Group>
{/if}
