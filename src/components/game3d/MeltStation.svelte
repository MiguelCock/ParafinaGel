<script lang="ts">
  import { T } from "@threlte/core";
  import { waxColorsById } from "@lib/game3d/data";
  import type { Craft, Phase } from "@lib/game3d/types";
  import Hotspot from "./Hotspot.svelte";
  import Steam from "./Steam.svelte";

  interface Props {
    craft: Craft;
    phase: Phase;
    onSelect: () => void;
  }

  let { craft, phase, onSelect }: Props = $props();

  const active = $derived(phase === "melt");
  const heating = $derived(craft.heating);
  const waxHex = $derived(
    craft.colorId
      ? (waxColorsById[craft.colorId]?.hex ?? "#e9c9a8")
      : "#e9c9a8",
  );
</script>

<T.Group position={[-2.8, 0, 0.2]}>
  <T.Mesh position.y={0.85} castShadow>
    <T.BoxGeometry args={[2.1, 0.12, 1.1]} />
    <T.MeshStandardMaterial color="#b98963" roughness={0.7} />
  </T.Mesh>

  {#each [[-0.9, -0.42], [0.9, -0.42], [-0.9, 0.42], [0.9, 0.42]] as leg}
    <T.Mesh position={[leg[0], 0.4, leg[1]]}>
      <T.BoxGeometry args={[0.1, 0.8, 0.1]} />
      <T.MeshStandardMaterial color="#8f5f40" roughness={0.85} />
    </T.Mesh>
  {/each}

  <T.Group position={[0, 0.91, 0]}>
    <T.Mesh position.y={0.03}>
      <T.CylinderGeometry args={[0.38, 0.38, 0.06, 24]} />
      <T.MeshStandardMaterial color="#2a241e" roughness={0.6} />
    </T.Mesh>
    <T.Mesh position.y={0.035} rotation.x={-Math.PI / 2}>
      <T.RingGeometry args={[0.24, 0.34, 24]} />
      <T.MeshBasicMaterial
        color="#b4552f"
        transparent
        opacity={heating ? 0.8 : 0.15}
      />
    </T.Mesh>

    <T.Mesh position.y={0.23} castShadow>
      <T.CylinderGeometry args={[0.34, 0.3, 0.34, 24]} />
      <T.MeshStandardMaterial color="#6f8165" roughness={0.55} />
    </T.Mesh>

    <T.Mesh position.y={0.24}>
      <T.CylinderGeometry args={[0.3, 0.3, 0.16, 24]} />
      <T.MeshStandardMaterial color={waxHex} roughness={0.5} />
    </T.Mesh>

    <T.Mesh position.y={0.405} rotation.x={Math.PI / 2}>
      <T.TorusGeometry args={[0.34, 0.018, 8, 32]} />
      <T.MeshStandardMaterial color="#2a241e" roughness={0.5} />
    </T.Mesh>

    <T.Mesh
      position={[0.14, 0.42, 0.04]}
      rotation.z={0.55 + craft.stirs * 0.28}
    >
      <T.BoxGeometry args={[0.035, 0.5, 0.035]} />
      <T.MeshStandardMaterial color="#b98963" roughness={0.8} />
    </T.Mesh>
    <T.Mesh
      position={[0.14, 0.42, 0.04]}
      rotation.z={0.55 + craft.stirs * 0.28}
    >
      <T.SphereGeometry args={[0.055, 10, 10]} />
      <T.MeshStandardMaterial color="#b98963" roughness={0.8} />
    </T.Mesh>
  </T.Group>

  <T.Mesh position={[-0.55, 0.93, 0.25]}>
    <T.CylinderGeometry args={[0.05, 0.05, 0.14, 10]} />
    <T.MeshStandardMaterial color="#c98a4b" roughness={0.4} />
  </T.Mesh>
  <T.Mesh position={[-0.55, 1.01, 0.25]}>
    <T.CylinderGeometry args={[0.02, 0.02, 0.04, 8]} />
    <T.MeshStandardMaterial color="#2a241e" />
  </T.Mesh>

  <T.Mesh position={[-0.25, 0.93, 0.28]}>
    <T.CylinderGeometry args={[0.04, 0.04, 0.12, 10]} />
    <T.MeshStandardMaterial color="#b4552f" roughness={0.4} />
  </T.Mesh>

  <Steam
    position={[0, 1.35, 0]}
    active={active && (heating || craft.temperature > 55)}
    intensity={heating ? 1.2 : 0.6}
  />
</T.Group>

<Hotspot position={[-2.8, 1.15]} {active} {onSelect} />
