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
    Lleva la {wax?.nombre.toLowerCase() ?? "cera"} a {game.meltMin}–{game.meltMax}
    °C y remueve tres veces. La temperatura queda registrada cuando entra en el rango;
    si te pasas, puedes retirarla y esperar.
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
    Aroma: <strong>{scent?.nombre ?? "—"}</strong>
  </p>

  <button
    class="game-action"
    type="button"
    onclick={() => game.toggleHeat()}
    data-testid="heat-toggle"
  >
    {game.craft.heating ? "Retirar del fuego" : "Poner al fuego"}
  </button>

  <div class="game-row">
    <span class="game-text">Removidos: {game.craft.stirs}/3</span>
    <button
      class="game-action game-action--secondary game-action--small"
      type="button"
      onclick={() => game.stir()}
      disabled={game.craft.stirs >= 3}
      data-testid="stir"
    >
      Remover
    </button>
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
