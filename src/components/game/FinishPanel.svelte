<script lang="ts">
  import { labels } from "@lib/game/data";
  import {
    LABEL_MAX_ROTATION,
    LABEL_MAX_X,
    LABEL_MAX_Y,
    TRIM_MAX_MM,
    TRIM_MIN_MM,
    TRIM_TARGET_MM,
    labelAccuracy,
    trimAccuracy,
  } from "@lib/game/craft";
  import type { GameState } from "@lib/game/game-state.svelte";

  interface Props {
    game: GameState;
  }

  let { game }: Props = $props();

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

<div
  class="game-station-panel finish-panel"
  class:expert={game.expert}
  data-testid="finish-panel"
>
  <p class="game-eyebrow">Acabado</p>
  <h3 class="game-title">Los últimos detalles</h3>
  <p class="game-text">
    Alinea la etiqueta con la guía, corta la mecha a la medida y cierra la
    pieza. Si algo queda torcido, puedes ajustarlo antes de entregar.
  </p>

  <div class="finish-block">
    <div class="finish-block__head">
      <p class="finish-block__title">Etiqueta</p>
      <span class="game-badge">{labelQuality}</span>
    </div>

    <div class="game-grid-2">
      {#each labels as item}
        <button
          class="game-choice"
          class:game-choice--selected={game.design.labelId === item.id}
          type="button"
          onclick={() => game.selectLabel(item.id)}
          data-testid={`label-${item.id}`}
        >
          <span class="game-swatch" style={`--swatch: ${item.color}`}></span>
          {item.nombre}
        </button>
      {/each}
    </div>

    <label class="finish-slider">
      <span>Horizontal</span>
      <input
        type="range"
        min={-LABEL_MAX_X}
        max={LABEL_MAX_X}
        step="1"
        value={game.craft.label.x}
        oninput={(event) => game.setLabelX(Number(event.currentTarget.value))}
        data-testid="label-x"
      />
      <output>{game.craft.label.x}</output>
    </label>

    <label class="finish-slider">
      <span>Vertical</span>
      <input
        type="range"
        min={-LABEL_MAX_Y}
        max={LABEL_MAX_Y}
        step="1"
        value={game.craft.label.y}
        oninput={(event) => game.setLabelY(Number(event.currentTarget.value))}
        data-testid="label-y"
      />
      <output>{game.craft.label.y}</output>
    </label>

    <label class="finish-slider">
      <span>Giro</span>
      <input
        type="range"
        min={-LABEL_MAX_ROTATION}
        max={LABEL_MAX_ROTATION}
        step="1"
        value={game.craft.label.rotation}
        oninput={(event) =>
          game.setLabelRotation(Number(event.currentTarget.value))}
        data-testid="label-rotation"
      />
      <output>{game.craft.label.rotation}°</output>
    </label>

    <button
      class="game-action game-action--secondary"
      type="button"
      onclick={() => game.placeLabel()}
      data-testid="place-label"
    >
      {game.craft.label.placed ? "Volver a aplicar" : "Aplicar etiqueta"}
    </button>
    <p class="finish-hint">Guía: centrada a media altura y sin inclinación.</p>
  </div>

  <div class="finish-block">
    <div class="finish-block__head">
      <p class="finish-block__title">Mecha</p>
      <span class="game-badge">{trimQuality}</span>
    </div>

    <label class="finish-slider">
      <span>Largo</span>
      <input
        type="range"
        min={TRIM_MIN_MM}
        max={TRIM_MAX_MM}
        step="0.5"
        value={game.craft.wick.trimMm}
        oninput={(event) => game.setTrimMm(Number(event.currentTarget.value))}
        data-testid="trim-slider"
      />
      <output>{game.craft.wick.trimMm} mm</output>
    </label>

    <p class="finish-hint">
      Objetivo de ejemplo: {TRIM_TARGET_MM} mm. Si queda muy corta o muy larga, la
      llama pierde calidad.
    </p>

    <button
      class="game-action game-action--secondary"
      type="button"
      onclick={() => game.cutWick()}
      data-testid="cut-wick"
    >
      {game.craft.wick.trimmed ? "Volver a cortar" : "Cortar mecha"}
    </button>
  </div>

  <div class="finish-checks">
    <button
      class="game-choice"
      class:game-choice--selected={game.craft.lidOn}
      type="button"
      onclick={() => game.addLid()}
      disabled={game.craft.lidOn}
      data-testid="lid"
    >
      {game.craft.lidOn ? "Tapa puesta" : "Poner tapa"}
    </button>
    <button
      class="game-choice"
      class:game-choice--selected={game.craft.wrapped}
      type="button"
      onclick={() => game.wrap()}
      disabled={game.craft.wrapped}
      data-testid="wrap"
    >
      {game.craft.wrapped ? "Empaque listo" : "Empacar"}
    </button>
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
      Faltan detalles por completar: etiqueta aplicada, mecha cortada, tapa y
      empaque.
    </p>
  {/if}
</div>

<style>
  .finish-block {
    display: grid;
    gap: 0.45rem;
    padding-top: 0.6rem;
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

  .finish-slider {
    display: grid;
    grid-template-columns: 4.5rem minmax(0, 1fr) 3rem;
    align-items: center;
    gap: 0.5rem;
    color: var(--color-text-muted);
    font-size: 0.65rem;
    font-weight: 700;
  }

  .finish-slider input {
    width: 100%;
    accent-color: var(--color-accent);
  }

  .finish-slider output {
    color: var(--color-heading);
    font-weight: 800;
    text-align: right;
  }

  .finish-hint {
    color: var(--color-text-muted);
    font-size: 0.62rem;
    line-height: 1.4;
  }

  .finish-hint--center {
    text-align: center;
  }

  .finish-checks {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.45rem;
    padding-top: 0.6rem;
    border-top: 1px dashed var(--color-border);
  }

  .finish-panel.expert .finish-slider output,
  .finish-panel.expert .finish-hint {
    visibility: hidden;
  }
</style>
