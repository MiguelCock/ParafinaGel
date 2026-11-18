<script lang="ts">
  import { scentsById, waxColorsById, waxesById } from "@lib/game/data";
  import { layerSummary } from "@lib/game/design";
  import type { GameState } from "@lib/game/game-state.svelte";
  import Pot2D from "./Pot2D.svelte";
  import Steam2D from "./Steam2D.svelte";

  interface Props {
    game: GameState;
  }

  let { game }: Props = $props();

  const wax = $derived(
    game.design.waxId ? (waxesById[game.design.waxId] ?? null) : null,
  );
  const scent = $derived(
    game.design.scentIds[0]
      ? (scentsById[game.design.scentIds[0]] ?? null)
      : null,
  );
  const colorText = $derived(
    game.design.mode === "gel"
      ? "Gel transparente"
      : game.design.mode === "figura"
        ? "Figura por partes"
        : layerSummary(game.design),
  );
  const steam = $derived(
    game.craft.heating || game.craft.temperature > game.meltMin,
  );
  const bottleColor = $derived(
    game.design.mode === "gel"
      ? (wax?.hex ?? "#eaf3ee")
      : game.design.mode === "figura"
        ? "#d9b45f"
        : (waxColorsById[game.design.layers[0]?.colorId ?? ""]?.hex ??
          "#e9c9a8"),
  );
</script>

<div class="melt-scene" data-testid="melt-scene">
  <div class="melt-scene__pot">
    <Pot2D
      wax={wax?.hex ?? "#e9c9a8"}
      heating={game.craft.heating}
      stirs={game.craft.stirs}
    />
    <div class="melt-scene__steam">
      <Steam2D active={steam} intensity={1.1} />
    </div>
  </div>

  <div class="melt-scene__side">
    <div class="bottle bottle--scent">
      <span class="bottle__cap"></span>
      <span class="bottle__body"></span>
      <span class="bottle__label">Aroma</span>
      <strong>{scent?.nombre ?? "—"}</strong>
    </div>
    <div class="bottle bottle--color">
      <span class="bottle__cap"></span>
      <span class="bottle__body" style={`background: ${bottleColor}`}></span>
      <span class="bottle__label">Diseño</span>
      <strong class="melt-scene__clamp">{colorText}</strong>
    </div>
    <div class="melt-scene__readout">
      <span>Baño maría</span>
      <strong>{Math.round(game.craft.temperature)} °C</strong>
    </div>
  </div>
</div>

<style>
  .melt-scene {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 0.5rem;
    align-items: end;
  }

  .melt-scene__pot {
    position: relative;
    width: min(100%, 20rem);
    margin-inline: auto;
  }

  .melt-scene__steam {
    position: absolute;
    top: 0.4rem;
    left: 50%;
    width: 90px;
    height: 120px;
    transform: translateX(-50%);
    pointer-events: none;
  }

  .melt-scene__side {
    display: grid;
    gap: 0.55rem;
    align-content: end;
    min-width: 6.5rem;
  }

  .bottle {
    display: grid;
    justify-items: center;
    gap: 0.1rem;
    padding: 0.4rem 0.4rem 0.45rem;
    border: 1px solid var(--color-border);
    border-radius: 0.7rem;
    background: var(--color-bg-elevated);
    box-shadow: var(--shadow-sm);
    font-size: 0.65rem;
    text-align: center;
  }

  .bottle__cap {
    width: 0.7rem;
    height: 0.35rem;
    border-radius: 0.15rem;
    background: #8f5f40;
  }

  .bottle__body {
    width: 1.25rem;
    height: 1.6rem;
    border: 1px solid #c9a27d;
    border-radius: 0.3rem;
    background: #e9c9a8;
  }

  .bottle--scent .bottle__body {
    background: #d8c3e3;
  }

  .bottle__label {
    color: var(--color-text-muted);
    font-size: 0.58rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .bottle strong {
    color: var(--color-heading);
    font-size: 0.68rem;
    line-height: 1.1;
  }

  .melt-scene__clamp {
    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
  }

  .melt-scene__readout {
    display: grid;
    gap: 0.1rem;
    padding: 0.45rem 0.6rem;
    border: 1px solid var(--color-border);
    border-radius: 0.7rem;
    background: var(--color-accent-soft);
    color: var(--color-accent-strong);
    font-size: 0.65rem;
    text-align: center;
  }

  .melt-scene__readout strong {
    color: var(--color-heading);
    font-family: var(--font-display);
    font-size: var(--text-lg);
    line-height: 1;
  }

  @media (max-width: 520px) {
    .melt-scene {
      grid-template-columns: 1fr;
    }

    .melt-scene__side {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      align-items: stretch;
    }
  }
</style>
