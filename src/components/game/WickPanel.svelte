<script lang="ts">
  import {
    recommendedWickTypes,
    vesselMaterialLabels,
    vesselsById,
  } from "@lib/game/data";
  import type { GameState } from "@lib/game/game-state.svelte";

  interface Props {
    game: GameState;
  }

  let { game }: Props = $props();

  const distance = $derived(Math.hypot(game.craft.wick.x, game.craft.wick.y));
  const quality = $derived(
    distance < 5
      ? "Muy centrada"
      : distance < 12
        ? "Bien centrada"
        : distance < 20
          ? "Algo desviada"
          : "Desviada",
  );
  const vessel = $derived(
    game.design.vesselId ? vesselsById[game.design.vesselId] : null,
  );
  const recommended = $derived(
    vessel ? recommendedWickTypes(vessel.diameterMm) : [],
  );
</script>

<div class="game-station-panel" data-testid="wick-panel">
  <p class="game-eyebrow">Preparación</p>
  <h3 class="game-title">Prepara el envase y la mecha</h3>
  <p class="game-text">
    Coloca el porta pabilo en el centro del envase, engancha la mecha y usa el
    sostenedor de madera para mantenerla recta. Ajusta la posición con el
    puntero o las flechas y suelta para confirmar.
  </p>

  {#if game.wickInfo}
    <div class="game-note">
      Mecha {game.wickInfo.nombre.toLowerCase()} ·
      {game.wickInfo.diameterMin}–{game.wickInfo.diameterMax} mm.
      {game.design.wickId === "doble"
        ? "La mecha doble se centra como una sola pieza."
        : game.wickInfo.note}
    </div>
  {/if}

  {#if vessel}
    <div class="game-note">
      {vessel.nombre} · {vesselMaterialLabels[vessel.material]} ·
      {vessel.diameterMm} mm.
      {recommended.length > 0
        ? `Recomendadas: ${recommended.map((wick) => wick.nombre).join(", ")}.`
        : "No hay una mecha del catálogo para este diámetro."}
    </div>
  {/if}

  <div class="game-note">
    El sostenedor de madera no es la mecha: solo la mantiene centrada y se
    retira después del curado.
  </div>

  <div class="manual-note">
    <span class="manual-note__icon" aria-hidden="true">✛</span>
    <span>
      <strong>Puntero:</strong> arrastra y suelta sobre el centro.
      <br />
      <strong>Teclado:</strong> flechas para mover y Enter para colocar.
    </span>
  </div>

  <div class="game-row">
    <span class="game-badge" data-testid="wick-quality">
      {game.craft.wick.placed ? `Colocada · ${quality}` : "Sin colocar"}
    </span>
    <span class="game-badge">
      {game.craft.wick.placed ? "Puedes ajustarla" : "Suelta para fijar"}
    </span>
  </div>

  <button
    class="game-action game-primary"
    type="button"
    onclick={() => game.goMelt()}
    disabled={!game.craft.wick.placed}
    data-testid="wick-continue"
  >
    Ir a la cera
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
