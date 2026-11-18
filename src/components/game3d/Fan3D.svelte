<script lang="ts">
  import { T, useTask } from "@threlte/core";
  import { prefersReducedMotion } from "@lib/game3d/motion";

  interface Props {
    position?: [number, number, number];
    spinning?: boolean;
  }

  let { position = [0, 0, 0], spinning = false }: Props = $props();

  let angle = $state(0);

  useTask((delta) => {
    if (prefersReducedMotion) return;
    if (spinning) angle += delta * 9;
  });
</script>

<T.Group {position} rotation.y={-Math.PI / 2}>
  <T.Mesh position.y={-0.25}>
    <T.CylinderGeometry args={[0.22, 0.22, 0.05, 16]} />
    <T.MeshStandardMaterial color="#8a8d8a" metalness={0.6} roughness={0.4} />
  </T.Mesh>

  <T.Mesh position.y={0.02}>
    <T.CylinderGeometry args={[0.08, 0.08, 0.3, 12]} />
    <T.MeshStandardMaterial color="#e4d8ca" roughness={0.6} />
  </T.Mesh>

  <T.Group position.y={0.2} rotation.z={angle}>
    {#each [0, 1, 2] as index}
      <T.Mesh position={[0.11, 0, 0]} rotation.z={(index * Math.PI * 2) / 3}>
        <T.BoxGeometry args={[0.22, 0.06, 0.02]} />
        <T.MeshStandardMaterial color="#b4552f" roughness={0.5} />
      </T.Mesh>
    {/each}
    <T.Mesh>
      <T.CylinderGeometry args={[0.05, 0.05, 0.04, 12]} />
      <T.MeshStandardMaterial color="#2a241e" roughness={0.6} />
    </T.Mesh>
  </T.Group>

  <T.Mesh position.y={0.2} rotation.x={Math.PI / 2}>
    <T.TorusGeometry args={[0.22, 0.012, 6, 24]} />
    <T.MeshStandardMaterial color="#8a8d8a" metalness={0.6} roughness={0.4} />
  </T.Mesh>
</T.Group>
