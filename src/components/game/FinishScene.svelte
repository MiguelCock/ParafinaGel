<script lang="ts">
  import { labelsById } from "@lib/game/data";
  import type { GameState } from "@lib/game/game-state.svelte";
  import CandlePreview from "./CandlePreview.svelte";

  interface Props {
    game: GameState;
  }

  let { game }: Props = $props();

  const label = $derived(
    game.design.labelId ? (labelsById[game.design.labelId] ?? null) : null,
  );
  const finished = $derived(game.phase === "score");
</script>

<div class="finish-scene" data-testid="finish-scene">
  <div class="finish-scene__mat">
    <CandlePreview
      design={game.design}
      showWick
      showLabel={game.craft.label.placed}
      placement={game.craft.label}
      showFlame={finished}
      trimMm={game.craft.wick.trimmed ? game.craft.wick.trimMm : undefined}
    />
    <span class="finish-scene__label-tag" class:done={game.canFinish}>
      {finished
        ? "Vela terminada"
        : game.canFinish
          ? "Lista para entregar"
          : "En acabado"}
    </span>
  </div>

  <div class="finish-scene__tools">
    <div class="tool" class:done={game.craft.wick.trimmed}>
      <span class="tool__icon" aria-hidden="true">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
        >
          <path d="M6 18 18 6M8 4l12 12M4 16l4 4" />
        </svg>
      </span>
      <span class="tool__name">Mecha</span>
      <span class="tool__state">
        {game.craft.wick.trimmed ? `${game.craft.wick.trimMm} mm` : "Pendiente"}
      </span>
    </div>

    <div class="tool" class:done={game.craft.label.placed}>
      <span class="tool__icon" aria-hidden="true">
        <span
          class="tool__swatch"
          style={`--swatch: ${label?.color ?? "#fbf3e9"}`}
        ></span>
      </span>
      <span class="tool__name">Etiqueta</span>
      <span class="tool__state">
        {game.craft.label.placed ? (label?.nombre ?? "Puesta") : "Pendiente"}
      </span>
    </div>

    <div class="tool" class:done={game.craft.lidOn}>
      <span class="tool__icon" aria-hidden="true">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
        >
          <path d="M5 12h14v7H5zM8 12V9h8v3M10 9V7h4v2" />
        </svg>
      </span>
      <span class="tool__name">Tapa</span>
      <span class="tool__state">
        {game.craft.lidOn ? "Puesta" : "Pendiente"}
      </span>
    </div>

    <div class="tool" class:done={game.craft.wrapped}>
      <span class="tool__icon" aria-hidden="true">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
        >
          <path d="M4 8h16v12H4zM4 8l2-4h12l2 4M12 4v16M4 12h16" />
        </svg>
      </span>
      <span class="tool__name">Empaque</span>
      <span class="tool__state">
        {game.craft.wrapped ? "Listo" : "Pendiente"}
      </span>
    </div>
  </div>
</div>

<style>
  .finish-scene {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(9rem, 12rem);
    gap: 0.75rem;
    align-items: center;
  }

  .finish-scene__mat {
    position: relative;
    display: grid;
    place-items: center;
    min-height: 16rem;
    padding: 0.75rem;
    border-radius: 1rem;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.28), transparent 55%),
      var(--color-surface);
    box-shadow: inset 0 0 0 1px var(--color-border);
  }

  .finish-scene__mat::before {
    content: "";
    position: absolute;
    inset: 0.4rem;
    border: 1px dashed var(--color-border-strong);
    border-radius: 0.8rem;
  }

  .finish-scene__mat :global(.candle-preview) {
    width: min(100%, 9rem);
  }

  .finish-scene__label-tag {
    position: absolute;
    top: 0.4rem;
    left: 0.6rem;
    padding: 0.22rem 0.55rem;
    border-radius: 999px;
    background: var(--color-surface);
    color: var(--color-text-muted);
    font-size: 0.58rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .finish-scene__label-tag.done {
    background: var(--color-sage-soft);
    color: var(--color-sage);
  }

  .finish-scene__tools {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.45rem;
  }

  .tool {
    display: grid;
    gap: 0.15rem;
    padding: 0.5rem;
    border: 1px solid var(--color-border);
    border-radius: 0.7rem;
    background: var(--color-bg-elevated);
    box-shadow: var(--shadow-sm);
    color: var(--color-text-muted);
  }

  .tool.done {
    border-color: var(--color-sage);
    background: var(--color-sage-soft);
  }

  .tool__icon {
    display: grid;
    place-items: center;
    width: 1.6rem;
    height: 1.6rem;
    border-radius: 50%;
    background: var(--color-surface);
    color: var(--color-accent);
  }

  .tool.done .tool__icon {
    background: var(--color-sage);
    color: #fff9f2;
  }

  .tool__icon svg {
    width: 1rem;
    height: 1rem;
  }

  .tool__swatch {
    width: 0.9rem;
    height: 0.9rem;
    border-radius: 50%;
    background: var(--swatch);
  }

  .tool__name {
    color: var(--color-heading);
    font-size: 0.68rem;
    font-weight: 800;
  }

  .tool__state {
    font-size: 0.58rem;
    line-height: 1.15;
  }

  @media (max-width: 520px) {
    .finish-scene {
      grid-template-columns: 1fr;
    }

    .finish-scene__mat {
      min-height: 7rem;
    }

    .finish-scene__mat :global(.candle-preview) {
      width: 5.5rem;
    }

    .finish-scene__tools {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    .tool {
      padding: 0.35rem;
    }

    .tool__state {
      display: none;
    }
  }
</style>
