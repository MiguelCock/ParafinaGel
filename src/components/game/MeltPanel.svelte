<script lang="ts">
  import { MAX_CUTS } from "@lib/game/craft";
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
  const cutCuts = $derived(game.craft.cutCuts);
  const chunkLabel = $derived(
    cutCuts >= 4
      ? "trozos pequeños · fusión rápida"
      : cutCuts >= 3
        ? "trozos medianos · fusión normal"
        : "trozos grandes · fusión lenta",
  );
  const title = $derived(
    game.needsCutting && !game.cutPrepared
      ? "Corta el bloque"
      : game.needsStearic && !game.stearicPrepared
        ? "Agrega el esteárico"
        : "Calienta con calma",
  );
  const hasMelted = $derived(game.craft.meltTemperature >= game.meltMin);
  const meltHint = $derived.by(() => {
    if (game.needsCutting && !game.cutPrepared) {
      return "Corta el bloque: los trozos caen en la olla al calentar.";
    }
    if (game.craft.overheated) {
      return "Fuera de rango: el nivel y los restos quedan visibles.";
    }
    if (game.isTemperatureReady || hasMelted) {
      return "Cera fundida: el nivel y los restos marcan la fusión.";
    }
    if (game.craft.heating) {
      return "La cera se funde y el nivel sube mientras calientas.";
    }
    return "Gira la perilla y observa cómo sube el nivel de cera.";
  });
</script>

<div class="game-station-panel" data-testid="melt-panel">
  <p class="game-eyebrow">Estación de cera</p>
  <h3 class="game-title">{title}</h3>
  <div class="stove-card">
    <img
      src="/art/fogon-lateral.svg"
      alt="Fogón lateral del taller con perilla de calor"
    />
    <div>
      <p class="stove-card__title">Fogón del taller</p>
      <p class="stove-card__text">
        Gira la perilla para regular la llama; no hay que mantener nada pulsado.
      </p>
    </div>
  </div>
  <p class="game-text">
    {#if game.needsCutting && !game.cutPrepared}
      La parafina llega en bloque. Córtala antes de calentar: los trozos
      pequeños se funden más rápido y el ácido esteárico le dará dureza.
    {:else if game.needsStearic && !game.stearicPrepared}
      El bloque ya está cortado. Agrega el ácido esteárico y remueve para
      integrarlo antes de seguir.
    {:else}
      La mecha ya está preparada en el envase. Gira la perilla del fogón para
      regular el calor y arrastra la cuchara en círculos para remover. La
      temperatura se registra al entrar en el rango; después pasas a mezclar
      color y aroma.
    {/if}
  </p>

  {#if game.needsCutting}
    <div
      class="prep-step"
      class:prep-step--done={game.cutPrepared}
      data-testid="cut-status"
    >
      <span class="prep-step__mark" aria-hidden="true">
        {game.cutPrepared ? "✓" : "1"}
      </span>
      <span class="prep-step__copy">
        <strong>
          {game.cutPrepared ? "Bloque cortado" : "Corta el bloque"}
        </strong>
        <small>{cutCuts}/{MAX_CUTS} cortes · {chunkLabel}</small>
      </span>
    </div>
  {/if}

  {#if game.needsStearic}
    <div
      class="prep-step"
      class:prep-step--done={game.craft.stearicAdded}
      data-testid="stearic-status"
    >
      <span class="prep-step__mark" aria-hidden="true">
        {game.craft.stearicAdded ? "✓" : "2"}
      </span>
      <span class="prep-step__copy">
        <strong>
          {game.craft.stearicAdded
            ? "Esteárico agregado"
            : "Agrega ácido esteárico"}
        </strong>
        <small>
          {game.craft.stearicAdded
            ? "Dosis de ejemplo: el porcentaje falta validarlo."
            : game.cutPrepared
              ? "Toca el frasco junto a la olla o pulsa E."
              : "Primero corta el bloque."}
        </small>
      </span>
    </div>
  {/if}

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
      {!game.cutPrepared
        ? "Falta cortar"
        : !game.stearicPrepared
          ? "Falta esteárico"
          : game.craft.overheated
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

  <p class="game-text" data-testid="melt-visual-state">{meltHint}</p>

  <p class="game-text">
    Aroma: <strong>{scent?.nombre ?? "—"}</strong> · Cera:
    <strong>{wax?.nombre ?? "—"}</strong>
  </p>

  <div class="manual-note">
    <span class="manual-note__icon" aria-hidden="true">
      {game.cutPrepared ? "↕" : "✂"}
    </span>
    <span>
      {#if !game.cutPrepared}
        <strong>Corte:</strong> arrastra el cuchillo de izquierda a derecha sobre
        el bloque o pulsa C. Con 2 cortes puedes seguir; 4 cortes funden más rápido.
      {:else}
        {#if game.needsStearic && !game.craft.stearicAdded}
          <strong>Esteárico:</strong> toca el frasco junto a la olla o pulsa E.
          <br />
        {/if}
        <strong>Perilla:</strong> arrástrala sobre el fogón o usa + y −.
        <br />
        <strong>Cuchara:</strong> gira sobre la cera con el puntero o con ← →.
      {/if}
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
    onclick={() => game.goMix()}
    disabled={!game.canContinueMelt}
    data-testid="melt-continue"
  >
    Ir a mezcla
  </button>
</div>

<style>
  .stove-card {
    display: grid;
    grid-template-columns: 4.2rem minmax(0, 1fr);
    gap: 0.55rem;
    align-items: center;
    padding: 0.45rem 0.55rem;
    border: 1px solid var(--color-border);
    border-radius: 0.6rem;
    background: var(--color-surface);
  }

  .stove-card img {
    display: block;
    width: 4.2rem;
    height: 4.2rem;
    object-fit: contain;
  }

  .stove-card__title {
    color: var(--color-heading);
    font-size: 0.68rem;
    font-weight: 800;
  }

  .stove-card__text {
    color: var(--color-text-muted);
    font-size: 0.58rem;
    line-height: 1.35;
  }

  .prep-step {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    padding: 0.45rem 0.6rem;
    border: 1px solid var(--color-border);
    border-radius: 0.55rem;
    background: var(--color-bg);
  }

  .prep-step--done {
    border-color: var(--color-sage);
    background: var(--color-sage-soft);
  }

  .prep-step__mark {
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    width: 1.4rem;
    height: 1.4rem;
    border-radius: 50%;
    background: var(--color-accent-soft);
    color: var(--color-accent-strong);
    font-size: 0.65rem;
    font-weight: 800;
  }

  .prep-step--done .prep-step__mark {
    background: var(--color-sage);
    color: var(--color-bg-elevated);
  }

  .prep-step__copy {
    display: grid;
    gap: 0.05rem;
    min-width: 0;
  }

  .prep-step__copy strong {
    color: var(--color-heading);
    font-size: 0.68rem;
    line-height: 1.3;
  }

  .prep-step__copy small {
    color: var(--color-text-muted);
    font-size: 0.58rem;
    line-height: 1.35;
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
</style>
