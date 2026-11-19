<script lang="ts">
  import { scentsById, waxesById } from "@lib/game/data";
  import type { GameState } from "@lib/game/game-state.svelte";

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
  const gaugeLeft = $derived(Math.min(100, game.craft.temperature));
</script>

<div class="game-station-panel" data-testid="melt-panel">
  <p class="game-eyebrow">Estación de cera</p>
  <h3 class="game-title">Calienta con calma</h3>
  <p class="game-text">
    Mantén la palanca de la olla para calentar y arrastra la cuchara en círculos
    para remover. La temperatura se registra al entrar en el rango.
  </p>

  <div class="game-gauge" aria-hidden="true">
    <div
      class="game-gauge__zone"
      style={`left: ${game.meltMin}%; width: ${game.meltMax - game.meltMin}%`}
    ></div>
    <div class="game-gauge__needle" style={`left: ${gaugeLeft}%`}></div>
  </div>

  <div class="game-row">
    <span class="game-badge" data-testid="temperature">
      {Math.round(game.craft.temperature)} °C
    </span>
    <span
      class:game-warning={game.craft.overheated ||
        game.craft.temperature > game.meltMax}
      class:game-success={game.canContinueMelt}
      class="game-badge"
    >
      {game.craft.overheated
        ? "Se quemó"
        : game.craft.temperature > game.meltMax
          ? "Demasiado caliente"
          : game.canContinueMelt
            ? "Lista para seguir"
            : game.isTemperatureReady
              ? "En rango"
              : "Falta calor"}
    </span>
  </div>

  <p class="game-text">
    Aroma: <strong>{scent?.nombre ?? "—"}</strong> · Cera:
    <strong>{wax?.nombre ?? "—"}</strong>
  </p>

  <div class="manual-note">
    <span class="manual-note__icon" aria-hidden="true">↕</span>
    <span>
      <strong>Palanca:</strong> mantén pulsado el control de la olla.
      <br />
      <strong>Cuchara:</strong> gira sobre la cera con el puntero o con ← →.
    </span>
  </div>

  <div class="game-row">
    <span class="game-text">Removidos: {game.craft.stirs}/3</span>
    <span class="game-badge">
      {game.craft.stirs >= 3 ? "Mezcla lista" : "Sigue removiendo"}
    </span>
  </div>

  <button
    class="game-action game-primary"
    type="button"
    onclick={() => game.goPour()}
    disabled={!game.canContinueMelt}
    data-testid="melt-continue"
  >
    Ir al vertido
  </button>
</div>

<style>
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
</style>
