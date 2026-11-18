<script lang="ts">
  import type { GameState } from "@lib/game/game-state.svelte";
  import CoolPanel from "./CoolPanel.svelte";
  import CounterPanel from "./CounterPanel.svelte";
  import DayEndPanel from "./DayEndPanel.svelte";
  import FinishPanel from "./FinishPanel.svelte";
  import LockedPanel from "./LockedPanel.svelte";
  import MeltPanel from "./MeltPanel.svelte";
  import OverviewPanel from "./OverviewPanel.svelte";
  import PourPanel from "./PourPanel.svelte";
  import ScorePanel from "./ScorePanel.svelte";

  interface Props {
    state: GameState;
  }

  let { state }: Props = $props();
</script>

{#if state.phase === "score"}
  <ScorePanel {state} />
{:else if state.phase === "dayEnd"}
  <DayEndPanel {state} />
{:else if state.view === "overview"}
  <OverviewPanel {state} />
{:else if state.view !== state.phase}
  <LockedPanel {state} />
{:else if state.phase === "counter"}
  <CounterPanel {state} />
{:else if state.phase === "melt"}
  <MeltPanel {state} />
{:else if state.phase === "pour"}
  <PourPanel {state} />
{:else if state.phase === "cool"}
  <CoolPanel {state} />
{:else if state.phase === "finish"}
  <FinishPanel {state} />
{/if}
