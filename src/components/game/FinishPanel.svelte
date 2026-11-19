<script lang="ts">
  import { labelsById } from "@lib/game/data";
  import { labelAccuracy, trimAccuracy } from "@lib/game/craft";
  import type { GameState } from "@lib/game/game-state.svelte";

  interface Props {
    game: GameState;
  }

  let { game }: Props = $props();

  const label = $derived(
    game.design.labelId ? (labelsById[game.design.labelId] ?? null) : null,
  );
  const labelQuality = $derived(
    !game.craft.label.placed
      ? "Sin aplicar"
      : labelAccuracy(game.craft) > 0.85
        ? "Muy bien alineada"
        : labelAccuracy(game.craft) > 0.6
          ? "Bien alineada"
          : "Se puede mejorar",
  );
  const trimQuality = $derived(
    !game.craft.wick.trimmed
      ? "Sin cortar"
      : trimAccuracy(game.craft) > 0.8
        ? "Corte parejo"
        : trimAccuracy(game.craft) > 0.5
          ? "Corte aceptable"
          : "Corte irregular",
  );
</script>

<div class="game-station-panel" data-testid="finish-panel">
  <p class="game-eyebrow">Acabado manual</p>
  <h3 class="game-title">Los últimos detalles</h3>
  <p class="game-text">
    Arrastra la etiqueta sobre la vela y gira el tirador. Corta la mecha
    arrastrando sobre ella. Toca la tapa y el empaque para cerrar la pieza.
  </p>

  <div class="finish-block">
    <div class="finish-block__head">
      <p class="finish-block__title">Etiqueta</p>
      <span class="game-badge">{labelQuality}</span>
    </div>
    <p class="finish-hint">
      {label
        ? `Etiqueta ${label.nombre.toLowerCase()} elegida en el diseño.`
        : "Sin etiqueta"}
      Guía: centrada a media altura y sin inclinación.
    </p>
    <p class="finish-hint">
      <strong>Puntero:</strong> arrastra la etiqueta y su tirador.
      <strong>Teclado:</strong> 1, flechas para mover y Mayús + ← → para girar.
    </p>
  </div>

  <div class="finish-block">
    <div class="finish-block__head">
      <p class="finish-block__title">Mecha</p>
      <span class="game-badge">{trimQuality}</span>
    </div>
    <p class="finish-hint">
      Objetivo de ejemplo: 5 mm. Arrastra el corte sobre la mecha o usa 2 y las
      flechas; Enter para cortar.
    </p>
  </div>

  <div class="finish-block">
    <div class="finish-block__head">
      <p class="finish-block__title">Cierre</p>
      <span class="game-badge">
        {game.canFinish ? "Completo" : "Pendiente"}
      </span>
    </div>
    <div class="checks">
      <span class:on={game.craft.label.placed}>Etiqueta</span>
      <span class:on={game.craft.wick.trimmed}>Mecha</span>
      <span class:on={game.craft.lidOn}>Tapa</span>
      <span class:on={game.craft.wrapped}>Empaque</span>
    </div>
    <p class="finish-hint">
      Toca la tapa y la caja de empaque en el escenario, o pulsa 3 y 4.
    </p>
  </div>

  <button
    class="game-action game-primary"
    type="button"
    onclick={() => game.serve()}
    disabled={!game.canFinish}
    data-testid="serve"
  >
    {game.mode === "sandbox" ? "Terminar la vela" : "Entregar el pedido"}
  </button>

  {#if !game.canFinish}
    <p class="finish-hint finish-hint--center">
      Faltan detalles: etiqueta, corte de mecha, tapa y empaque.
    </p>
  {/if}
</div>

<style>
  .finish-block {
    display: grid;
    gap: 0.35rem;
    padding-top: 0.55rem;
    border-top: 1px dashed var(--color-border);
  }

  .finish-block:first-of-type {
    border-top: 0;
    padding-top: 0;
  }

  .finish-block__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .finish-block__title {
    color: var(--color-heading);
    font-size: var(--text-xs);
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .finish-hint {
    color: var(--color-text-muted);
    font-size: 0.62rem;
    line-height: 1.45;
  }

  .finish-hint--center {
    text-align: center;
  }

  .checks {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
  }

  .checks span {
    padding: 0.2rem 0.45rem;
    border: 1px solid var(--color-border);
    border-radius: 999px;
    background: var(--color-bg);
    color: var(--color-text-muted);
    font-size: 0.6rem;
    font-weight: 700;
  }

  .checks span.on {
    border-color: var(--color-sage);
    background: var(--color-sage-soft);
    color: var(--color-sage);
  }
</style>
