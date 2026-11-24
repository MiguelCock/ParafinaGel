<script lang="ts">
  import type { GameState } from "@lib/game/game-state.svelte";
  import CoolPanel from "./CoolPanel.svelte";
  import CounterPanel from "./CounterPanel.svelte";
  import DayEndPanel from "./DayEndPanel.svelte";
  import DesignPanel from "./DesignPanel.svelte";
  import FinishPanel from "./FinishPanel.svelte";
  import LockedPanel from "./LockedPanel.svelte";
  import MeltPanel from "./MeltPanel.svelte";
  import MixPanel from "./MixPanel.svelte";
  import OverviewPanel from "./OverviewPanel.svelte";
  import PourPanel from "./PourPanel.svelte";
  import ScorePanel from "./ScorePanel.svelte";
  import WickPanel from "./WickPanel.svelte";

  interface Props {
    game: GameState;
  }

  let { game }: Props = $props();
</script>

{#if game.phase === "score"}
  <ScorePanel {game} />
{:else if game.phase === "dayEnd"}
  <DayEndPanel {game} />
{:else if game.view === "overview"}
  <OverviewPanel {game} />
{:else if game.view !== game.activeStation}
  <LockedPanel {game} />
{:else if game.phase === "brief"}
  <CounterPanel {game} />
{:else if game.phase === "design"}
  <DesignPanel {game} />
{:else if game.phase === "melt"}
  <MeltPanel {game} />
{:else if game.phase === "mix"}
  <MixPanel {game} />
{:else if game.phase === "pour"}
  <PourPanel {game} />
{:else if game.phase === "wick"}
  <WickPanel {game} />
{:else if game.phase === "cool"}
  <CoolPanel {game} />
{:else if game.phase === "finish"}
  <FinishPanel {game} />
{/if}
