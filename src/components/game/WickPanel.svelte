<script lang="ts">
  import { TRIM_TARGET_MM } from "@lib/game/craft";
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
  const status = $derived(
    !game.craft.wick.placed
      ? "Sin colocar"
      : game.craft.wick.trimmed
        ? `Cortada · ${quality}`
        : `Colocada · ${quality}`,
  );
  const trim = $derived(
    game.craft.wick.placed
      ? `${game.craft.wick.trimMm.toFixed(1)} mm · objetivo de ejemplo ${TRIM_TARGET_MM} mm`
      : `Objetivo de ejemplo ${TRIM_TARGET_MM} mm`,
  );
</script>

<div class="game-station-panel" data-testid="wick-panel">
  <p class="game-eyebrow">Preparación</p>
  <h3 class="game-title">Coloca y corta la mecha</h3>
  <p class="game-text">
    Vista lateral del envase o molde. Arrastra la mecha al centro y suéltala
    para fijarla con el sostenedor. Si queda desviada, se verá inclinada.
    Después ajusta el corte con la tijera o con las flechas y pulsa Enter.
  </p>

  {#if game.wickInfo}
    <div class="game-note">
      {game.wickInfo.nombre} · {game.wickInfo.diameterMin}–{game.wickInfo
        .diameterMax}
      mm. {game.wickInfo.note}
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
    retira después del curado. El corte de mecha se hace aquí; el acabado queda
    para etiqueta, tapa y empaque.
  </div>

  <div class="manual-note">
    <span class="manual-note__icon" aria-hidden="true">✂</span>
    <span>
      <strong>Puntero:</strong> arrastra la mecha y suelta para colocarla;
      después arrastra la tijera o la regla para elegir el corte.
      <br />
      <strong>Teclado:</strong> flechas y Enter para colocar; ↑/↓ para ajustar la
      longitud y Enter para cortar.
    </span>
  </div>

  <div class="game-row">
    <span class="game-badge" data-testid="wick-quality">{status}</span>
    <span class="game-badge" data-testid="wick-trim">{trim}</span>
    <span class="game-badge">
      {game.craft.wick.trimmed
        ? "Corte listo"
        : game.craft.wick.placed
          ? "Ajusta el corte"
          : "Suelta para fijar"}
    </span>
  </div>

  <button
    class="game-action game-primary"
    type="button"
    onclick={() => game.goMelt()}
    disabled={!game.craft.wick.placed || !game.craft.wick.trimmed}
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
