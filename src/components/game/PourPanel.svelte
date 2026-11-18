<script lang="ts">
  import { FILM_SECONDS, POUR_MIN_TO_FINISH } from "@lib/game/craft";
  import type { GameState } from "@lib/game/game-state.svelte";

  interface Props {
    game: GameState;
  }

  let { game }: Props = $props();

  const unit = $derived(game.unit);
  const target = $derived(unit?.target ?? 88);
  const zoneMin = $derived(Math.max(0, target - 8));
  const zoneMax = $derived(Math.min(100, target + 7));
  const filmProgress = $derived(
    Math.min(
      100,
      Math.max(
        0,
        ((FILM_SECONDS - game.craft.filmRemaining) / FILM_SECONDS) * 100,
      ),
    ),
  );
</script>

<div class="game-station-panel" data-testid="pour-panel">
  <p class="game-eyebrow">Vertido</p>
  <h3 class="game-title">
    {game.craft.waitingFilm ? "Deja que cuaje" : "Vierte por partes"}
  </h3>
  <p class="game-text">
    {#if game.craft.waitingFilm}
      La capa necesita unos segundos antes de recibir la siguiente. Mientras
      tanto puedes respirar: no hay prisa.
    {:else if game.pourComplete}
      Todas las partes están llenas. Ahora coloca la mecha.
    {:else}
      Llena cada parte hasta la zona verde y pulsa “Terminar” cuando estés
      dentro. El vertido es lento para que puedas reaccionar.
    {/if}
  </p>

  {#if game.craft.waitingFilm}
    <div class="game-meter" aria-hidden="true">
      <div class="game-meter__fill" style={`width: ${filmProgress}%`}></div>
    </div>
    <p class="game-badge">
      Cuajando · {game.craft.filmRemaining.toFixed(1)} s
    </p>
  {:else if unit && !game.pourComplete}
    <div class="game-gauge" aria-hidden="true">
      <div
        class="game-gauge__zone"
        style={`left: ${zoneMin}%; width: ${zoneMax - zoneMin}%`}
      ></div>
      <div class="game-gauge__needle" style={`left: ${unit.fill}%`}></div>
    </div>

    <div class="game-row">
      <span class="game-badge" data-testid="fill">
        {unit.label}: {Math.round(unit.fill)}%
      </span>
      <span
        class:game-success={unit.fill >= zoneMin && unit.fill <= zoneMax}
        class:game-warning={unit.fill > zoneMax}
        class="game-badge"
      >
        {unit.fill > zoneMax
          ? "Un poco de más"
          : unit.fill >= zoneMin
            ? "En la meta"
            : "Falta llenar"}
      </span>
    </div>

    <button
      class="game-action"
      type="button"
      onclick={() => game.togglePour()}
      data-testid="pour-toggle"
    >
      {game.craft.pouring ? "Parar" : "Verter"}
    </button>

    <button
      class="game-action game-action--secondary"
      type="button"
      onclick={() => game.finishUnit()}
      disabled={unit.fill < POUR_MIN_TO_FINISH}
      data-testid="finish-unit"
    >
      Terminar {game.design.mode === "figura" ? "parte" : "capa"}
    </button>
  {:else}
    <p class="game-note" data-testid="pour-complete">
      Vertido completo. La mecha es el siguiente paso.
    </p>
  {/if}

  <div class="pour-units" aria-label="Partes del vertido">
    {#each game.craft.units as item, index}
      <span
        class="pour-unit"
        class:done={item.done}
        class:current={index === game.craft.unitIndex && !game.pourComplete}
      >
        <span class="game-swatch" style={`--swatch: ${item.colorHex}`}></span>
        {item.label}
        {#if item.done && item.accuracy !== null}
          <strong>{Math.round(item.accuracy * 100)}%</strong>
        {/if}
      </span>
    {/each}
  </div>

  <button
    class="game-action game-primary"
    type="button"
    onclick={() => game.goWick()}
    disabled={!game.canGoWick}
    data-testid="pour-continue"
  >
    Ir a la mecha
  </button>
</div>

<style>
  .pour-units {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
  }

  .pour-unit {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.45rem;
    border: 1px solid var(--color-border);
    border-radius: 999px;
    background: var(--color-bg);
    color: var(--color-text-muted);
    font-size: 0.6rem;
    font-weight: 700;
  }

  .pour-unit.current {
    border-color: var(--color-accent);
    color: var(--color-accent-strong);
  }

  .pour-unit.done {
    border-color: var(--color-sage);
    background: var(--color-sage-soft);
    color: var(--color-sage);
  }

  .pour-unit strong {
    font-size: 0.58rem;
  }
</style>
