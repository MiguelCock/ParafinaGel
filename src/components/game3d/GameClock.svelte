<script lang="ts">
  import { useTask } from "@threlte/core";

  interface Props {
    paused: boolean;
    onTick: (delta: number) => void;
  }

  let { paused, onTick }: Props = $props();

  useTask((delta) => {
    if (paused) return;
    onTick(Math.min(delta, 0.05));
  });
</script>
