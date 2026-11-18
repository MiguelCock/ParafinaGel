<script lang="ts">
  import { T, useTask } from "@threlte/core";
  import type { Customer } from "@lib/game3d/types";
  import { prefersReducedMotion } from "@lib/game3d/motion";

  interface Props {
    customer: Customer;
    position?: [number, number, number];
    mood?: "idle" | "happy";
  }

  let { customer, position = [0, 0, 0], mood = "idle" }: Props = $props();

  let time = 0;
  let bob = $state(0);

  useTask((delta) => {
    if (prefersReducedMotion) return;
    time += delta;
    const speed = mood === "happy" ? 4.5 : 1.8;
    const amplitude = mood === "happy" ? 0.025 : 0.012;
    bob = Math.sin(time * speed) * amplitude;
  });
</script>

<T.Group {position}>
  <T.Group position.y={bob}>
    <T.Mesh position={[-0.1, 0.38, 0]} castShadow>
      <T.CapsuleGeometry args={[0.075, 0.34, 4, 8]} />
      <T.MeshStandardMaterial color="#4a4038" roughness={0.8} />
    </T.Mesh>
    <T.Mesh position={[0.1, 0.38, 0]} castShadow>
      <T.CapsuleGeometry args={[0.075, 0.34, 4, 8]} />
      <T.MeshStandardMaterial color="#4a4038" roughness={0.8} />
    </T.Mesh>

    <T.Mesh position={[-0.1, 0.06, 0.06]} castShadow>
      <T.BoxGeometry args={[0.17, 0.1, 0.28]} />
      <T.MeshStandardMaterial color="#2a241e" roughness={0.7} />
    </T.Mesh>
    <T.Mesh position={[0.1, 0.06, 0.06]} castShadow>
      <T.BoxGeometry args={[0.17, 0.1, 0.28]} />
      <T.MeshStandardMaterial color="#2a241e" roughness={0.7} />
    </T.Mesh>

    <T.Mesh position.y={0.95} castShadow>
      <T.CapsuleGeometry args={[0.26, 0.52, 6, 12]} />
      <T.MeshStandardMaterial color={customer.shirt} roughness={0.75} />
    </T.Mesh>

    <T.Mesh position={[-0.34, 1.0, 0]} rotation.z={-0.12} castShadow>
      <T.CapsuleGeometry args={[0.075, 0.34, 4, 8]} />
      <T.MeshStandardMaterial color={customer.shirt} roughness={0.75} />
    </T.Mesh>
    <T.Mesh position={[0.34, 1.0, 0]} rotation.z={0.12} castShadow>
      <T.CapsuleGeometry args={[0.075, 0.34, 4, 8]} />
      <T.MeshStandardMaterial color={customer.shirt} roughness={0.75} />
    </T.Mesh>

    <T.Mesh position={[-0.34, 0.78, 0.02]}>
      <T.SphereGeometry args={[0.07, 12, 12]} />
      <T.MeshStandardMaterial color={customer.skin} roughness={0.7} />
    </T.Mesh>
    <T.Mesh position={[0.34, 0.78, 0.02]}>
      <T.SphereGeometry args={[0.07, 12, 12]} />
      <T.MeshStandardMaterial color={customer.skin} roughness={0.7} />
    </T.Mesh>

    <T.Mesh position.y={1.5} castShadow>
      <T.SphereGeometry args={[0.23, 20, 20]} />
      <T.MeshStandardMaterial color={customer.skin} roughness={0.65} />
    </T.Mesh>

    <T.Mesh position={[0, 1.64, -0.01]} scale={[1.05, 0.55, 1.05]} castShadow>
      <T.SphereGeometry args={[0.24, 20, 20]} />
      <T.MeshStandardMaterial color={customer.hair} roughness={0.8} />
    </T.Mesh>

    {#if customer.id === "marta"}
      <T.Mesh position={[0, 1.58, -0.18]}>
        <T.SphereGeometry args={[0.12, 12, 12]} />
        <T.MeshStandardMaterial color={customer.hair} roughness={0.8} />
      </T.Mesh>
    {/if}

    {#if customer.id === "sofia"}
      <T.Mesh position={[-0.2, 1.38, -0.02]} scale={[0.55, 1.15, 0.55]}>
        <T.SphereGeometry args={[0.15, 12, 12]} />
        <T.MeshStandardMaterial color={customer.hair} roughness={0.8} />
      </T.Mesh>
      <T.Mesh position={[0.2, 1.38, -0.02]} scale={[0.55, 1.15, 0.55]}>
        <T.SphereGeometry args={[0.15, 12, 12]} />
        <T.MeshStandardMaterial color={customer.hair} roughness={0.8} />
      </T.Mesh>
    {/if}

    <T.Mesh position={[-0.08, 1.53, 0.215]}>
      <T.SphereGeometry args={[0.022, 10, 10]} />
      <T.MeshStandardMaterial color="#2a241e" roughness={0.5} />
    </T.Mesh>
    <T.Mesh position={[0.08, 1.53, 0.215]}>
      <T.SphereGeometry args={[0.022, 10, 10]} />
      <T.MeshStandardMaterial color="#2a241e" roughness={0.5} />
    </T.Mesh>

    <T.Mesh position={[0, 1.43, 0.22]}>
      <T.BoxGeometry args={[0.09, 0.012, 0.012]} />
      <T.MeshStandardMaterial color="#7a3f2c" roughness={0.6} />
    </T.Mesh>
  </T.Group>
</T.Group>
