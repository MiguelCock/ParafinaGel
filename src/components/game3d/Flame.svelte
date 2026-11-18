<script lang="ts">
  import { T, useTask } from "@threlte/core";
  import { prefersReducedMotion } from "@lib/game3d/motion";

  interface Props {
    position?: [number, number, number];
    scale?: number;
  }

  let { position = [0, 0, 0], scale = 1 }: Props = $props();

  let flicker = $state(1);
  let time = 0;

  useTask((delta) => {
    if (prefersReducedMotion) return;
    time += delta;
    flicker = 1 + Math.sin(time * 8) * 0.05 + Math.sin(time * 13 + 1.2) * 0.025;
  });
</script>

<T.Group {position} scale={[scale, scale, scale]}>
  <T.Mesh position.y={0.08} scale={[1, flicker, 1]}>
    <T.ConeGeometry args={[0.055, 0.16, 8]} />
    <T.MeshStandardMaterial
      color="#f6d36f"
      emissive="#f6d36f"
      emissiveIntensity={1.8}
      roughness={0.4}
    />
  </T.Mesh>
  <T.Mesh position.y={0.065} scale={[1, flicker, 1]}>
    <T.ConeGeometry args={[0.028, 0.09, 8]} />
    <T.MeshStandardMaterial
      color="#fff0b3"
      emissive="#fff0b3"
      emissiveIntensity={2.4}
      roughness={0.3}
    />
  </T.Mesh>
</T.Group>
