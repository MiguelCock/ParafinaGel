<script lang="ts">
  import { T } from "@threlte/core";
  import { vesselsById, waxColorsById } from "@lib/game3d/data";
  import type { Craft, Order, Phase } from "@lib/game3d/types";
  import Hotspot from "./Hotspot.svelte";
  import Jar3D from "./Jar3D.svelte";
  import Pitcher3D from "./Pitcher3D.svelte";

  interface Props {
    order: Order;
    craft: Craft;
    phase: Phase;
    onSelect: () => void;
  }

  let { order, craft, phase, onSelect }: Props = $props();

  const active = $derived(phase === "pour");
  const waxHex = $derived(
    craft.colorId
      ? (waxColorsById[craft.colorId]?.hex ?? "#e9c9a8")
      : "#e9c9a8",
  );
  const glass = $derived(
    craft.vesselId
      ? (vesselsById[craft.vesselId]?.glass ?? "#f9f2e8")
      : "#f9f2e8",
  );
</script>

<T.Group position={[0, 0, 0.2]}>
  <T.Mesh position.y={0.85} castShadow>
    <T.BoxGeometry args={[2.2, 0.12, 1.1]} />
    <T.MeshStandardMaterial color="#b98963" roughness={0.7} />
  </T.Mesh>

  {#each [[-0.95, -0.42], [0.95, -0.42], [-0.95, 0.42], [0.95, 0.42]] as leg}
    <T.Mesh position={[leg[0], 0.4, leg[1]]}>
      <T.BoxGeometry args={[0.1, 0.8, 0.1]} />
      <T.MeshStandardMaterial color="#8f5f40" roughness={0.85} />
    </T.Mesh>
  {/each}

  <Jar3D
    position={[0, 0.86, 0]}
    fill={craft.fill}
    color={waxHex}
    {glass}
    sizeScale={order.size.scale}
    showWick
    showLabel={false}
  />

  <T.Mesh position={[0, 1.345, 0]} rotation.x={Math.PI / 2}>
    <T.TorusGeometry args={[0.3, 0.006, 6, 32]} />
    <T.MeshBasicMaterial color="#b4552f" transparent opacity={0.45} />
  </T.Mesh>

  <Pitcher3D position={[0.55, 1.22, 0]} pouring={craft.pouring} />
  {#if craft.pouring}
    <T.Mesh position={[0.32, 1.18, 0]}>
      <T.CylinderGeometry args={[0.012, 0.022, 0.42, 8]} />
      <T.MeshStandardMaterial color={waxHex} roughness={0.4} />
    </T.Mesh>
  {/if}

  <T.Mesh position={[-0.55, 0.93, 0.28]}>
    <T.CylinderGeometry args={[0.05, 0.05, 0.14, 10]} />
    <T.MeshStandardMaterial color="#c98a4b" roughness={0.4} />
  </T.Mesh>
</T.Group>

<Hotspot position={[0, 1.15]} {active} {onSelect} />
