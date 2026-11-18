<script lang="ts">
  import { T, useThrelte } from "@threlte/core";
  import { interactivity } from "@threlte/extras";
  import { Color, Fog } from "three";
  import { palette3d } from "@lib/game3d/palette";
  import type { Game3DState } from "@lib/game3d/game-state.svelte";
  import type { PerformanceStats } from "@lib/game3d/types";
  import CameraRig from "./CameraRig.svelte";
  import GameClock from "./GameClock.svelte";
  import FrameStats from "./FrameStats.svelte";
  import WorkshopRoom from "./WorkshopRoom.svelte";
  import CounterStation from "./CounterStation.svelte";
  import MeltStation from "./MeltStation.svelte";
  import PourStation from "./PourStation.svelte";
  import CoolStation from "./CoolStation.svelte";
  import FinishStation from "./FinishStation.svelte";

  interface Props {
    state: Game3DState;
    onTick: (delta: number) => void;
    onStats: (stats: PerformanceStats) => void;
  }

  let { state, onTick, onStats }: Props = $props();

  interactivity();

  const { scene } = useThrelte();
  scene.background = new Color(palette3d.background);
  scene.fog = new Fog(palette3d.background, 13, 26);
</script>

<T.PerspectiveCamera
  makeDefault
  fov={40}
  near={0.1}
  far={50}
  position={[0, 6.4, 12.2]}
  oncreate={(camera) => camera.lookAt(0, 1.2, 0.2)}
/>

<T.AmbientLight intensity={0.55} />
<T.HemisphereLight args={[palette3d.cream, palette3d.floor, 0.65]} />
<T.DirectionalLight
  position={[4, 8, 6]}
  intensity={1.9}
  castShadow={state.quality === "alta"}
  oncreate={(light) => {
    light.shadow.mapSize.set(1024, 1024);
    light.shadow.camera.left = -8;
    light.shadow.camera.right = 8;
    light.shadow.camera.top = 8;
    light.shadow.camera.bottom = -8;
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 30;
    light.shadow.bias = -0.0004;
    light.shadow.normalBias = 0.02;
  }}
/>
<T.PointLight
  position={[0, 2.9, 1.8]}
  intensity={10}
  distance={6}
  decay={2}
  color={palette3d.flame}
/>
<T.PointLight
  position={[2.0, 2.6, -2.6]}
  intensity={6}
  distance={8}
  decay={2}
  color={palette3d.sky}
/>

<WorkshopRoom quality={state.quality} />
<CounterStation
  order={state.order}
  phase={state.phase}
  showCustomer={state.view === "overview" || state.view === "counter"}
  onSelect={() => state.setView("counter")}
/>
<MeltStation
  craft={state.craft}
  phase={state.phase}
  onSelect={() => state.setView("melt")}
/>
<PourStation
  order={state.order}
  craft={state.craft}
  phase={state.phase}
  onSelect={() => state.setView("pour")}
/>
<CoolStation
  order={state.order}
  craft={state.craft}
  phase={state.phase}
  onSelect={() => state.setView("cool")}
/>
<FinishStation
  order={state.order}
  craft={state.craft}
  phase={state.phase}
  onSelect={() => state.setView("finish")}
/>

<CameraRig view={state.view} paused={state.paused} />
<GameClock paused={state.paused} {onTick} />

{#if import.meta.env.DEV}
  <FrameStats {onStats} />
{/if}
