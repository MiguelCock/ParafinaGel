<script lang="ts">
  import { T } from "@threlte/core";
  import { palette3d } from "@lib/game3d/palette";

  interface Props {
    position: [number, number];
    active?: boolean;
    selected?: boolean;
    onSelect: () => void;
  }

  let {
    position,
    active = false,
    selected = false,
    onSelect,
  }: Props = $props();

  let hovered = $state(false);

  const color = $derived(
    active || selected ? palette3d.accent : palette3d.cream,
  );
  const opacity = $derived(active || selected ? 0.22 : 0.1);
</script>

<T.Group position={[position[0], 0.02, position[1]]} scale={hovered ? 1.05 : 1}>
  <T.Mesh
    rotation.x={-Math.PI / 2}
    onclick={onSelect}
    onpointerenter={() => {
      hovered = true;
      if (typeof document !== "undefined")
        document.body.style.cursor = "pointer";
    }}
    onpointerleave={() => {
      hovered = false;
      if (typeof document !== "undefined") document.body.style.cursor = "";
    }}
  >
    <T.CircleGeometry args={[0.62, 24]} />
    <T.MeshBasicMaterial {color} transparent {opacity} depthWrite={false} />
  </T.Mesh>

  <T.Mesh rotation.x={-Math.PI / 2} onclick={onSelect}>
    <T.RingGeometry args={[0.5, 0.58, 32]} />
    <T.MeshBasicMaterial
      {color}
      transparent
      opacity={0.85}
      depthWrite={false}
    />
  </T.Mesh>
</T.Group>
