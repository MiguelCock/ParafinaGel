<script lang="ts">
  import { useTask, useThrelte } from "@threlte/core";
  import { Vector3 } from "three";
  import type { View } from "@lib/game3d/types";

  interface Props {
    view: View;
    paused: boolean;
  }

  let { view, paused }: Props = $props();

  const { camera } = useThrelte();

  const cameras: Record<View, { position: Vector3; look: Vector3 }> = {
    overview: {
      position: new Vector3(0, 6.4, 12.2),
      look: new Vector3(0, 1.2, 0.2),
    },
    counter: {
      position: new Vector3(0, 2.7, 5.6),
      look: new Vector3(-0.3, 1.2, 1.4),
    },
    melt: {
      position: new Vector3(-2.8, 2.7, 3.5),
      look: new Vector3(-2.8, 1.0, 0.2),
    },
    pour: {
      position: new Vector3(0.6, 3.8, 2.6),
      look: new Vector3(0, 0.9, 0.2),
    },
    cool: {
      position: new Vector3(3.2, 3.2, 4.6),
      look: new Vector3(2.8, 1.0, 0.2),
    },
    finish: {
      position: new Vector3(0, 2.9, 1.6),
      look: new Vector3(0, 0.9, -1.5),
    },
  };

  const look = new Vector3(0, 1.2, 0.2);
  let reduced = false;

  if (typeof window !== "undefined") {
    reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  useTask((delta) => {
    if (paused) return;

    const currentCamera = camera.current;
    if (!currentCamera) return;

    const target = cameras[view] ?? cameras.overview;

    if (reduced) {
      currentCamera.position.copy(target.position);
      look.copy(target.look);
      currentCamera.lookAt(look);
      return;
    }

    const t = 1 - Math.exp(-6 * delta);
    currentCamera.position.lerp(target.position, t);
    look.lerp(target.look, t);
    currentCamera.lookAt(look);
  });
</script>
