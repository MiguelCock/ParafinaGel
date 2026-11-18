<script lang="ts">
  import { T } from "@threlte/core";
  import { DoubleSide } from "three";
  import Flame from "./Flame.svelte";

  interface Props {
    position?: [number, number, number];
    color?: string;
    fill?: number;
    glass?: string;
    sizeScale?: number;
    showLabel?: boolean;
    labelColor?: string;
    showLid?: boolean;
    showWick?: boolean;
    showFlame?: boolean;
    castShadow?: boolean;
  }

  let {
    position = [0, 0, 0],
    color = "#f3ddd2",
    fill = 0,
    glass = "#f9f2e8",
    sizeScale = 1,
    showLabel = false,
    labelColor = "#fbf3e9",
    showLid = false,
    showWick = true,
    showFlame = false,
    castShadow = true,
  }: Props = $props();

  const waxHeight = $derived(0.5 * Math.min(100, Math.max(0, fill)) * 0.01);
  const waxTop = $derived(0.06 + waxHeight);
  const hasWax = $derived(fill > 0.5);
  const hasWick = $derived(hasWax && showWick);
</script>

<T.Group {position} scale={[sizeScale, sizeScale, sizeScale]}>
  <T.Mesh position.y={0.02}>
    <T.CylinderGeometry args={[0.28, 0.28, 0.04, 24]} />
    <T.MeshStandardMaterial
      color={glass}
      transparent
      opacity={0.55}
      roughness={0.25}
      side={DoubleSide}
    />
  </T.Mesh>

  <T.Mesh position.y={0.32}>
    <T.CylinderGeometry args={[0.28, 0.28, 0.6, 24, 1, true]} />
    <T.MeshStandardMaterial
      color={glass}
      transparent
      opacity={0.28}
      roughness={0.2}
      side={DoubleSide}
      depthWrite={false}
    />
  </T.Mesh>

  <T.Mesh position.y={0.62} rotation.x={Math.PI / 2}>
    <T.TorusGeometry args={[0.28, 0.018, 8, 32]} />
    <T.MeshStandardMaterial color={glass} transparent opacity={0.7} />
  </T.Mesh>

  {#if hasWax}
    <T.Mesh
      position.y={0.06 + waxHeight / 2}
      scale={[1, waxHeight, 1]}
      {castShadow}
    >
      <T.CylinderGeometry args={[0.245, 0.245, 1, 24]} />
      <T.MeshStandardMaterial {color} roughness={0.65} />
    </T.Mesh>

    <T.Mesh position.y={waxTop + 0.005}>
      <T.CylinderGeometry args={[0.245, 0.245, 0.012, 24]} />
      <T.MeshStandardMaterial {color} roughness={0.45} />
    </T.Mesh>
  {/if}

  {#if hasWick}
    <T.Mesh position.y={waxTop + 0.04} {castShadow}>
      <T.CylinderGeometry args={[0.01, 0.012, 0.08, 8]} />
      <T.MeshStandardMaterial color="#2a241e" roughness={0.8} />
    </T.Mesh>
  {/if}

  {#if showFlame}
    <Flame position={[0, waxTop + 0.04, 0]} scale={0.8} />
  {/if}

  {#if showLabel}
    <T.Mesh position={[0, 0.29, 0.285]}>
      <T.BoxGeometry args={[0.23, 0.14, 0.012]} />
      <T.MeshStandardMaterial color={labelColor} roughness={0.7} />
    </T.Mesh>
    <T.Mesh position={[0, 0.25, 0.293]}>
      <T.BoxGeometry args={[0.16, 0.012, 0.004]} />
      <T.MeshStandardMaterial color="#b4552f" roughness={0.7} />
    </T.Mesh>
  {/if}

  {#if showLid}
    <T.Mesh position.y={0.64} {castShadow}>
      <T.CylinderGeometry args={[0.29, 0.29, 0.035, 24]} />
      <T.MeshStandardMaterial color="#fbf3e9" roughness={0.5} />
    </T.Mesh>
    <T.Mesh position.y={0.68}>
      <T.CylinderGeometry args={[0.09, 0.09, 0.025, 16]} />
      <T.MeshStandardMaterial color="#e4d8ca" roughness={0.5} />
    </T.Mesh>
  {/if}
</T.Group>
