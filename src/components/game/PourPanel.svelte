<script lang="ts">
  import { FILM_SECONDS } from "@lib/game/craft";
  import type { GameState } from "@lib/game/game-state.svelte";

  interface Props {
    game: GameState;
  }

  let { game }: Props = $props();

  const unit = $derived(game.unit);
  const target = $derived(unit?.target ?? 88);
  const zoneMin = $derived(Math.max(0, target - 8));
  const zoneMax = $derived(Math.min(100, target + 7));
  const aligned = $derived(Math.abs(game.craft.pourOffset) <= 0.32);
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
  <p class="game-eyebrow">Vertido manual</p>
  <h3 class="game-title">
    {game.craft.waitingFilm ? "Deja que cuaje" : "Lleva la jarra a la vela"}
  </h3>
  <p class="game-text">
    {#if game.craft.waitingFilm}
      La capa necesita unos segundos antes de recibir la siguiente. No hay
      prisa.
    {:else if game.pourComplete}
      Todas las partes están llenas. La mecha ya está preparada; deja curar la
      vela.
    {:else}
      La mecha ya está sujeta en el envase. Arrastra la jarra sobre la boca del
      frasco. Cuando esté alineada, el líquido empezará a caer; suelta para
      cerrar la capa.
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
        class:game-success={aligned && unit.fill >= zoneMin}
        class:game-warning={!aligned || unit.fill > zoneMax}
        class="game-badge"
      >
        {!aligned
          ? "Jarra fuera de la boca"
          : unit.fill > zoneMax
            ? "Un poco de más"
            : unit.fill >= zoneMin
              ? "En la meta"
              : "Falta llenar"}
      </span>
    </div>

    <div class="gauge-label">
      <span>Jarra</span>
      <span class={aligned ? "gauge-label__ok" : "gauge-label__bad"}>
        {aligned ? "Alineada con el frasco" : "Muévela sobre el frasco"}
      </span>
    </div>

    <div class="manual-note">
      <span class="manual-note__icon" aria-hidden="true">↔</span>
      <span>
        Arrastra la jarra con el puntero. Con teclado: ← → para mover y
        <strong>Espacio</strong> para verter o soltar.
      </span>
    </div>
  {:else}
    <p class="game-note" data-testid="pour-complete">
      Vertido completo. La mecha ya está en el envase; deja curar la vela.
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
    onclick={() => game.goCool()}
    disabled={!game.canGoCool}
    data-testid="pour-continue"
  >
    Ir al curado
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

  .manual-note {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 0.5rem;
    padding: 0.55rem 0.65rem;
    border-left: 3px solid var(--color-accent);
    border-radius: 0.4rem;
    background: var(--color-accent-soft);
    color: var(--color-accent-strong);
    font-size: 0.65rem;
    line-height: 1.45;
  }

  .manual-note__icon {
    display: grid;
    place-items: center;
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 50%;
    background: var(--color-bg-elevated);
    font-size: 0.9rem;
    font-weight: 800;
  }

  .gauge-label {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
    color: var(--color-text-muted);
    font-size: 0.6rem;
    font-weight: 700;
  }

  .gauge-label__ok {
    color: var(--color-sage);
  }

  .gauge-label__bad {
    color: var(--color-accent-strong);
  }
</style>
