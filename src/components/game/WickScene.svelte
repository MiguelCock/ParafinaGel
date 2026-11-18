<script lang="ts">
  import { moldsById, vesselsById } from "@lib/game/data";
  import type { GameState } from "@lib/game/game-state.svelte";

  interface Props {
    game: GameState;
  }

  let { game }: Props = $props();

  const vessel = $derived(
    game.design.vesselId ? (vesselsById[game.design.vesselId] ?? null) : null,
  );
  const mold = $derived(
    game.design.moldId ? (moldsById[game.design.moldId] ?? null) : null,
  );
  const sizePx = $derived(
    vessel ? Math.min(190, 90 + vessel.diameterMm * 1.2) : 140,
  );
</script>

<div class="wick-scene" data-testid="wick-scene">
  <div class="wick-top" style={`--size: ${sizePx}px`}>
    <span class="wick-top__ring" aria-hidden="true"></span>
    <span class="wick-top__target" aria-hidden="true"></span>
    <span class="wick-top__cross" aria-hidden="true"></span>
    <span
      class="wick-top__dot"
      class:placed={game.craft.wick.placed}
      style={`left: ${50 + game.craft.wick.x}%; top: ${50 + game.craft.wick.y}%`}
      aria-hidden="true"
    ></span>
  </div>

  <div class="wick-scene__meta">
    <p class="game-eyebrow">Vista superior</p>
    <strong>
      {vessel?.nombre ??
        (mold ? `Molde ${mold.nombre.toLowerCase()}` : "Pieza")}
    </strong>
    <span>
      {vessel ? `${vessel.diameterMm} mm de diámetro` : "Figura sin recipiente"}
    </span>
    <span class="wick-scene__state" class:done={game.craft.wick.placed}>
      {game.craft.wick.placed ? "Mecha colocada" : "Mueve la mecha al centro"}
    </span>
  </div>
</div>

<style>
  .wick-scene {
    display: grid;
    gap: 0.75rem;
    justify-items: center;
  }

  .wick-top {
    position: relative;
    width: var(--size);
    max-width: 100%;
    aspect-ratio: 1;
    border: 2px solid rgba(111, 85, 65, 0.35);
    border-radius: 50%;
    background:
      radial-gradient(
        circle at 50% 42%,
        rgba(255, 255, 255, 0.55),
        transparent 55%
      ),
      var(--color-surface);
    box-shadow:
      inset 0 0 0 6px rgba(255, 255, 255, 0.35),
      0 12px 22px -16px rgba(42, 36, 30, 0.5);
  }

  .wick-top__ring {
    position: absolute;
    inset: 18%;
    border: 1px dashed rgba(111, 85, 65, 0.28);
    border-radius: 50%;
  }

  .wick-top__target {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 1.1rem;
    height: 1.1rem;
    border: 2px solid var(--color-accent);
    border-radius: 50%;
    opacity: 0.55;
    transform: translate(-50%, -50%);
  }

  .wick-top__cross::before,
  .wick-top__cross::after {
    content: "";
    position: absolute;
    background: rgba(180, 85, 47, 0.28);
  }

  .wick-top__cross::before {
    top: 50%;
    left: 12%;
    width: 76%;
    height: 1px;
  }

  .wick-top__cross::after {
    top: 12%;
    left: 50%;
    width: 1px;
    height: 76%;
  }

  .wick-top__dot {
    position: absolute;
    width: 0.8rem;
    height: 0.8rem;
    border: 2px solid #3b2d25;
    border-radius: 50%;
    background: #6f5541;
    box-shadow: 0 2px 6px rgba(42, 36, 30, 0.3);
    transform: translate(-50%, -50%);
    transition:
      left 80ms linear,
      top 80ms linear;
  }

  .wick-top__dot.placed {
    width: 1rem;
    height: 1rem;
    border-color: var(--color-sage);
    background: var(--color-sage);
    box-shadow: 0 0 0 4px var(--color-sage-soft);
  }

  .wick-scene__meta {
    display: grid;
    justify-items: center;
    gap: 0.1rem;
    text-align: center;
  }

  .wick-scene__meta strong {
    color: var(--color-heading);
    font-family: var(--font-display);
    font-size: var(--text-lg);
    line-height: 1;
  }

  .wick-scene__meta span {
    color: var(--color-text-muted);
    font-size: 0.65rem;
  }

  .wick-scene__state {
    margin-top: 0.2rem;
    padding: 0.15rem 0.5rem;
    border-radius: 999px;
    background: var(--color-accent-soft);
    color: var(--color-accent-strong) !important;
    font-weight: 800;
  }

  .wick-scene__state.done {
    background: var(--color-sage-soft);
    color: var(--color-sage) !important;
  }

  @media (max-width: 520px) {
    .wick-top {
      width: min(var(--size), 8.8rem);
    }

    .wick-scene__meta strong {
      font-size: var(--text-base);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .wick-top__dot {
      transition: none;
    }
  }
</style>
