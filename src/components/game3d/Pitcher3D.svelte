<script lang="ts">
  import { T, useTask } from "@threlte/core";
  import { prefersReducedMotion } from "@lib/game3d/motion";

  interface Props {
    position?: [number, number, number];
    pouring?: boolean;
  }

  let { position = [0, 0, 0], pouring = false }: Props = $props();

  let tilt = $state(0);

  useTask((delta) => {
    const target = pouring ? -0.62 : 0;

    if (prefersReducedMotion) {
      tilt = target;
      return;
    }

    tilt += (target - tilt) * Math.min(1, delta * 8);
  });
</script>

<T.Group {position} rotation.z={tilt}>
  <T.Mesh position.y={0.18} castShadow>
    <T.CylinderGeometry args={[0.16, 0.2, 0.36, 20]} />
    <T.MeshStandardMaterial color="#f3ddd2" roughness={0.4} />
  </T.Mesh>

  <T.Mesh position={[-0.17, 0.28, 0]} rotation.z={0.5}>
    <T.ConeGeometry args={[0.07, 0.18, 12]} />
    <T.MeshStandardMaterial color="#f3ddd2" roughness={0.4} />
  </T.Mesh>

  <T.Mesh position={[0.19, 0.2, 0]} rotation.z={Math.PI / 2}>
    <T.TorusGeometry args={[0.1, 0.025, 8, 16]} />
    <T.MeshStandardMaterial color="#f3ddd2" roughness={0.4} />
  </T.Mesh>

  <T.Mesh position.y={0.38}>
    <T.CylinderGeometry args={[0.05, 0.08, 0.05, 12]} />
    <T.MeshStandardMaterial color="#e4d8ca" roughness={0.5} />
  </T.Mesh>
</T.Group>
