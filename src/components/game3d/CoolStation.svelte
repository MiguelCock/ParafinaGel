<script lang="ts">
  import { T } from "@threlte/core";
  import { vesselsById, waxColorsById } from "@lib/game3d/data";
  import type { Craft, Order, Phase } from "@lib/game3d/types";
  import Fan3D from "./Fan3D.svelte";
  import Hotspot from "./Hotspot.svelte";
  import Jar3D from "./Jar3D.svelte";
  import Steam from "./Steam.svelte";

  interface Props {
    order: Order;
    craft: Craft;
    phase: Phase;
    onSelect: () => void;
  }

  let { order, craft, phase, onSelect }: Props = $props();

  const active = $derived(phase === "cool");
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
  const steamIntensity = $derived(
    0.4 + (Math.max(0, craft.coolingRemaining) / 4) * 0.8,
  );
</script>

<T.Group position={[2.8, 0, 0.2]}>
  {#each [[-0.5, 0], [0.5, 0]] as side}
    <T.Mesh position={[side[0], 0.8, side[1]]} castShadow>
      <T.BoxGeometry args={[0.1, 1.6, 0.8]} />
      <T.MeshStandardMaterial color="#8f5f40" roughness={0.85} />
    </T.Mesh>
  {/each}

  <T.Mesh position={[0, 0.5, 0]} castShadow>
    <T.BoxGeometry args={[1.0, 0.08, 0.8]} />
    <T.MeshStandardMaterial color="#b98963" roughness={0.7} />
  </T.Mesh>
  <T.Mesh position={[0, 1.25, 0]} castShadow>
    <T.BoxGeometry args={[1.0, 0.08, 0.8]} />
    <T.MeshStandardMaterial color="#b98963" roughness={0.7} />
  </T.Mesh>

  <T.Mesh position={[0, 0.8, -0.36]}>
    <T.BoxGeometry args={[1.0, 1.5, 0.05]} />
    <T.MeshStandardMaterial color="#e5d0ba" roughness={0.9} />
  </T.Mesh>

  {#if active}
    <Jar3D
      position={[0, 1.29, 0]}
      fill={craft.fill}
      color={waxHex}
      {glass}
      sizeScale={order.size.scale}
      showWick
      showLabel={false}
    />
    <Steam
      position={[0, 1.95, 0]}
      active={!craft.cooled}
      intensity={steamIntensity}
    />
  {/if}
</T.Group>

<Fan3D position={[3.55, 1.55, 0.2]} spinning={active && !craft.cooled} />

<Hotspot position={[2.8, 1.15]} {active} {onSelect} />
