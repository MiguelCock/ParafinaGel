<script lang="ts">
  import { T } from "@threlte/core";
  import type { Order, Phase } from "@lib/game3d/types";
  import Customer3D from "./Customer3D.svelte";
  import Hotspot from "./Hotspot.svelte";
  import Jar3D from "./Jar3D.svelte";

  interface Props {
    order: Order;
    phase: Phase;
    onSelect: () => void;
    showCustomer?: boolean;
  }

  let { order, phase, onSelect, showCustomer = true }: Props = $props();

  const mood = $derived(phase === "score" ? "happy" : "idle");
</script>

{#if showCustomer}
  <Customer3D customer={order.customer} position={[-0.8, 0, 1.25]} {mood} />
{/if}

<T.Group position={[0, 0, 2.2]}>
  <T.Mesh position.y={0.48} castShadow>
    <T.BoxGeometry args={[2.9, 0.95, 0.75]} />
    <T.MeshStandardMaterial color="#8f5f40" roughness={0.85} />
  </T.Mesh>

  <T.Mesh position.y={1.0} castShadow>
    <T.BoxGeometry args={[3.2, 0.12, 0.95]} />
    <T.MeshStandardMaterial color="#b98963" roughness={0.65} />
  </T.Mesh>

  <T.Mesh position={[0, 0.55, 0.39]}>
    <T.BoxGeometry args={[2.55, 0.55, 0.03]} />
    <T.MeshStandardMaterial color="#e5d0ba" roughness={0.85} />
  </T.Mesh>

  <T.Mesh position={[0, 1.075, 0.18]} rotation.x={-Math.PI / 2}>
    <T.PlaneGeometry args={[2.95, 0.7]} />
    <T.MeshStandardMaterial color="#d2a77e" roughness={0.6} />
  </T.Mesh>

  <T.Mesh position={[1.0, 1.11, 0.1]}>
    <T.CylinderGeometry args={[0.08, 0.1, 0.08, 12]} />
    <T.MeshStandardMaterial color="#8a8d8a" metalness={0.6} roughness={0.4} />
  </T.Mesh>
  <T.Mesh position={[1.0, 1.17, 0.1]}>
    <T.SphereGeometry args={[0.08, 12, 12]} />
    <T.MeshStandardMaterial color="#c9a227" metalness={0.5} roughness={0.35} />
  </T.Mesh>

  <Jar3D
    position={[-1.35, 1.07, 0.05]}
    fill={70}
    color="#c98a4b"
    sizeScale={0.48}
    showFlame
    showLabel={false}
  />

  <T.Mesh position={[-0.1, 1.08, 0.28]}>
    <T.BoxGeometry args={[0.42, 0.02, 0.24]} />
    <T.MeshStandardMaterial color="#fbf3e9" roughness={0.8} />
  </T.Mesh>
</T.Group>

<Hotspot position={[0, 3.0]} active={phase === "counter"} {onSelect} />
