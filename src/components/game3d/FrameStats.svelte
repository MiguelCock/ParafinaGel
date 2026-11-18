<script lang="ts">
  import { useTask, useThrelte } from "@threlte/core";
  import type { WebGLRenderer } from "three";
  import type { PerformanceStats } from "@lib/game3d/types";

  interface Props {
    onStats: (stats: PerformanceStats) => void;
  }

  let { onStats }: Props = $props();

  const { renderer } = useThrelte();
  let frames = 0;
  let elapsed = 0;

  useTask((delta) => {
    frames += 1;
    elapsed += delta;

    if (elapsed >= 0.5) {
      const gl = renderer as WebGLRenderer;
      onStats({
        fps: Math.round(frames / elapsed),
        calls: gl.info.render.calls,
        triangles: gl.info.render.triangles,
      });
      frames = 0;
      elapsed = 0;
    }
  });
</script>
