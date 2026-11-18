<script lang="ts">
  import { T } from "@threlte/core";
  import { DoubleSide } from "three";
  import { palette3d } from "@lib/game3d/palette";
  import Jar3D from "./Jar3D.svelte";

  interface Props {
    quality: "alta" | "baja";
  }

  let { quality }: Props = $props();

  const shadows = $derived(quality === "alta");
</script>

<T.Group>
  <T.Mesh position={[0, -0.1, 0.2]} receiveShadow>
    <T.BoxGeometry args={[11.2, 0.2, 7.8]} />
    <T.MeshStandardMaterial color={palette3d.floor} roughness={0.9} />
  </T.Mesh>

  <T.Mesh position={[0, 2.0, -3.1]} receiveShadow>
    <T.BoxGeometry args={[11.2, 4.2, 0.2]} />
    <T.MeshStandardMaterial color={palette3d.wall} roughness={0.95} />
  </T.Mesh>

  <T.Mesh position={[-5.5, 2.0, 0.2]} receiveShadow>
    <T.BoxGeometry args={[0.2, 4.2, 7.6]} />
    <T.MeshStandardMaterial color={palette3d.wall} roughness={0.95} />
  </T.Mesh>

  <T.Mesh position={[5.5, 2.0, 0.2]} receiveShadow>
    <T.BoxGeometry args={[0.2, 4.2, 7.6]} />
    <T.MeshStandardMaterial color={palette3d.wall} roughness={0.95} />
  </T.Mesh>

  <T.Mesh position={[0, 0.16, -3.0]}>
    <T.BoxGeometry args={[11.2, 0.32, 0.16]} />
    <T.MeshStandardMaterial color={palette3d.wallLower} roughness={0.9} />
  </T.Mesh>

  <T.Mesh position={[0, 0.006, 0.8]}>
    <T.BoxGeometry args={[4.8, 0.012, 2.8]} />
    <T.MeshStandardMaterial color={palette3d.rugBorder} roughness={0.9} />
  </T.Mesh>
  <T.Mesh position={[0, 0.016, 0.8]}>
    <T.BoxGeometry args={[4.4, 0.012, 2.4]} />
    <T.MeshStandardMaterial color={palette3d.rug} roughness={0.95} />
  </T.Mesh>

  <T.Group position={[1.9, 2.55, -3.0]}>
    <T.Mesh>
      <T.BoxGeometry args={[2.5, 1.7, 0.08]} />
      <T.MeshStandardMaterial color={palette3d.wood} roughness={0.8} />
    </T.Mesh>
    <T.Mesh position={[0, 0, 0.05]}>
      <T.BoxGeometry args={[2.2, 1.4, 0.02]} />
      <T.MeshStandardMaterial
        color={palette3d.sky}
        emissive={palette3d.sky}
        emissiveIntensity={0.12}
        roughness={0.5}
      />
    </T.Mesh>
    <T.Mesh position={[0, 0, 0.09]}>
      <T.BoxGeometry args={[0.05, 1.4, 0.04]} />
      <T.MeshStandardMaterial color={palette3d.woodDark} roughness={0.8} />
    </T.Mesh>
    <T.Mesh position={[0, 0, 0.09]}>
      <T.BoxGeometry args={[2.2, 0.05, 0.04]} />
      <T.MeshStandardMaterial color={palette3d.woodDark} roughness={0.8} />
    </T.Mesh>
  </T.Group>

  <T.Group position={[-3.3, 2.15, -2.9]}>
    <T.Mesh castShadow={shadows}>
      <T.BoxGeometry args={[2.5, 0.1, 0.52]} />
      <T.MeshStandardMaterial color={palette3d.wood} roughness={0.8} />
    </T.Mesh>
    <T.Mesh position={[0, 0.75, 0]} castShadow={shadows}>
      <T.BoxGeometry args={[2.5, 0.1, 0.52]} />
      <T.MeshStandardMaterial color={palette3d.wood} roughness={0.8} />
    </T.Mesh>
    <T.Mesh position={[-1.05, 0.38, -0.14]}>
      <T.BoxGeometry args={[0.08, 0.75, 0.08]} />
      <T.MeshStandardMaterial color={palette3d.woodDark} roughness={0.8} />
    </T.Mesh>
    <T.Mesh position={[1.05, 0.38, -0.14]}>
      <T.BoxGeometry args={[0.08, 0.75, 0.08]} />
      <T.MeshStandardMaterial color={palette3d.woodDark} roughness={0.8} />
    </T.Mesh>

    <Jar3D
      position={[-0.8, 0.07, 0]}
      fill={72}
      color="#d8b384"
      sizeScale={0.52}
      showFlame
      showLabel={false}
      castShadow={shadows}
    />
    <Jar3D
      position={[0, 0.07, 0]}
      fill={64}
      color="#9b8bb4"
      sizeScale={0.46}
      showFlame
      showLabel={false}
      castShadow={shadows}
    />
    <Jar3D
      position={[0.78, 0.07, 0]}
      fill={78}
      color="#b4552f"
      sizeScale={0.5}
      showFlame
      showLabel={false}
      castShadow={shadows}
    />

    <Jar3D
      position={[-0.75, 0.82, 0]}
      fill={60}
      color="#c98a4b"
      sizeScale={0.42}
      showFlame
      showLabel={false}
      castShadow={shadows}
    />
    {#if quality === "alta"}
      <Jar3D
        position={[0.15, 0.82, 0]}
        fill={70}
        color="#7c8b72"
        sizeScale={0.48}
        showFlame
        showLabel={false}
        castShadow={shadows}
      />
    {/if}
  </T.Group>

  <T.Group position={[0, 3.6, 1.8]}>
    <T.Mesh>
      <T.CylinderGeometry args={[0.012, 0.012, 0.5, 6]} />
      <T.MeshStandardMaterial color={palette3d.charcoal} />
    </T.Mesh>
    <T.Mesh position.y={-0.3}>
      <T.CylinderGeometry args={[0.34, 0.18, 0.35, 20, 1, true]} />
      <T.MeshStandardMaterial
        color={palette3d.cream}
        side={DoubleSide}
        roughness={0.6}
      />
    </T.Mesh>
    <T.PointLight
      position={[0, -0.45, 0]}
      intensity={10}
      distance={5}
      decay={2}
      color={palette3d.flame}
    />
  </T.Group>

  <T.Group position={[4.35, 0, 1.6]}>
    <T.Mesh position.y={0.22}>
      <T.CylinderGeometry args={[0.28, 0.22, 0.44, 16]} />
      <T.MeshStandardMaterial color={palette3d.woodDark} roughness={0.9} />
    </T.Mesh>
    <T.Mesh position={[0, 0.58, 0]} scale={[0.7, 1.2, 0.7]}>
      <T.ConeGeometry args={[0.3, 0.8, 8]} />
      <T.MeshStandardMaterial color={palette3d.leaf} roughness={0.9} />
    </T.Mesh>
    <T.Mesh position={[-0.18, 0.48, 0.08]} rotation.z={0.35}>
      <T.ConeGeometry args={[0.18, 0.65, 8]} />
      <T.MeshStandardMaterial color={palette3d.leafDark} roughness={0.9} />
    </T.Mesh>
    <T.Mesh position={[0.18, 0.45, -0.08]} rotation.z={-0.35}>
      <T.ConeGeometry args={[0.16, 0.58, 8]} />
      <T.MeshStandardMaterial color={palette3d.leaf} roughness={0.9} />
    </T.Mesh>
  </T.Group>

  <T.Group position={[-1.2, 2.55, -3.0]}>
    <T.Mesh>
      <T.BoxGeometry args={[1.35, 0.95, 0.06]} />
      <T.MeshStandardMaterial color={palette3d.woodDark} roughness={0.8} />
    </T.Mesh>
    <T.Mesh position={[0, 0, 0.04]}>
      <T.BoxGeometry args={[1.15, 0.75, 0.02]} />
      <T.MeshStandardMaterial color={palette3d.cream} roughness={0.8} />
    </T.Mesh>
    <T.Mesh position={[0, -0.12, 0.06]}>
      <T.CylinderGeometry args={[0.1, 0.13, 0.28, 12]} />
      <T.MeshStandardMaterial color={palette3d.accent} roughness={0.7} />
    </T.Mesh>
    <T.Mesh position={[0, 0.06, 0.06]}>
      <T.ConeGeometry args={[0.06, 0.16, 8]} />
      <T.MeshStandardMaterial
        color={palette3d.flame}
        emissive={palette3d.flame}
        emissiveIntensity={0.6}
      />
    </T.Mesh>
  </T.Group>

  <T.Group position={[-4.5, 0.2, 1.9]}>
    <T.Mesh>
      <T.BoxGeometry args={[0.7, 0.4, 0.55]} />
      <T.MeshStandardMaterial color={palette3d.wood} roughness={0.9} />
    </T.Mesh>
    <T.Mesh position={[0, 0.35, 0]}>
      <T.BoxGeometry args={[0.62, 0.3, 0.48]} />
      <T.MeshStandardMaterial color={palette3d.woodLight} roughness={0.9} />
    </T.Mesh>
  </T.Group>
</T.Group>
