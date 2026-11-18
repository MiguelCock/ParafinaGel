<script lang="ts">
  import { T } from "@threlte/core";
  import {
    labelsById,
    sizesById,
    vesselsById,
    waxColorsById,
  } from "@lib/game3d/data";
  import type { Craft, Order, Phase } from "@lib/game3d/types";
  import Hotspot from "./Hotspot.svelte";
  import Jar3D from "./Jar3D.svelte";

  interface Props {
    order: Order;
    craft: Craft;
    phase: Phase;
    onSelect: () => void;
  }

  let { order, craft, phase, onSelect }: Props = $props();

  const active = $derived(phase === "finish");
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
  const labelHex = $derived(
    craft.labelId ? (labelsById[craft.labelId]?.color ?? "#fbf3e9") : "#fbf3e9",
  );
  const sizeScale = $derived(
    sizesById[order.size.id]?.scale ?? order.size.scale,
  );
</script>

<T.Group position={[0, 0, -1.5]}>
  <T.Mesh position.y={0.85} castShadow>
    <T.BoxGeometry args={[2.0, 0.12, 0.9]} />
    <T.MeshStandardMaterial color="#b98963" roughness={0.7} />
  </T.Mesh>

  {#each [[-0.85, -0.32], [0.85, -0.32], [-0.85, 0.32], [0.85, 0.32]] as leg}
    <T.Mesh position={[leg[0], 0.4, leg[1]]}>
      <T.BoxGeometry args={[0.1, 0.8, 0.1]} />
      <T.MeshStandardMaterial color="#8f5f40" roughness={0.85} />
    </T.Mesh>
  {/each}

  {#if active}
    <Jar3D
      position={[0, 0.86, 0]}
      fill={craft.fill}
      color={waxHex}
      {glass}
      {sizeScale}
      showWick
      showLabel={craft.labelId !== null}
      labelColor={labelHex}
      showLid={craft.lidOn}
    />
  {/if}

  {#if active}
    <T.Mesh position={[0.6, 0.87, 0]} visible={!craft.wrapped}>
      <T.BoxGeometry args={[0.35, 0.02, 0.25]} />
      <T.MeshStandardMaterial color={labelHex} roughness={0.8} />
    </T.Mesh>
    <T.Mesh position={[0.6, 0.885, 0]}>
      <T.BoxGeometry args={[0.22, 0.006, 0.015]} />
      <T.MeshStandardMaterial color="#b4552f" roughness={0.7} />
    </T.Mesh>

    <T.Mesh position={[-0.55, 0.88, 0]} visible={!craft.lidOn}>
      <T.CylinderGeometry args={[0.16, 0.16, 0.03, 20]} />
      <T.MeshStandardMaterial color="#fbf3e9" roughness={0.5} />
    </T.Mesh>

    <T.Mesh
      position={[0.55, 0.9, 0.35]}
      rotation.z={0.4}
      visible={!craft.wickTrimmed}
    >
      <T.BoxGeometry args={[0.28, 0.02, 0.03]} />
      <T.MeshStandardMaterial color="#8a8d8a" metalness={0.6} roughness={0.4} />
    </T.Mesh>
    <T.Mesh
      position={[0.55, 0.9, 0.35]}
      rotation.z={-0.4}
      visible={!craft.wickTrimmed}
    >
      <T.BoxGeometry args={[0.28, 0.02, 0.03]} />
      <T.MeshStandardMaterial color="#8a8d8a" metalness={0.6} roughness={0.4} />
    </T.Mesh>

    <T.Mesh position={[-0.6, 0.93, 0.3]} visible={!craft.wrapped}>
      <T.BoxGeometry args={[0.3, 0.2, 0.25]} />
      <T.MeshStandardMaterial color="#b98963" roughness={0.85} />
    </T.Mesh>

    {#if craft.wrapped}
      <T.Mesh position={[-0.6, 0.93, 0.3]}>
        <T.BoxGeometry args={[0.3, 0.2, 0.25]} />
        <T.MeshStandardMaterial color="#f3ddd2" roughness={0.7} />
      </T.Mesh>
      <T.Mesh position={[-0.6, 0.93, 0.43]}>
        <T.BoxGeometry args={[0.04, 0.2, 0.01]} />
        <T.MeshStandardMaterial color="#b4552f" roughness={0.6} />
      </T.Mesh>
    {/if}
  {/if}
</T.Group>

<Hotspot position={[0, -0.5]} {active} {onSelect} />
