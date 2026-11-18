<script lang="ts">
  import type { GameState } from "@lib/game/game-state.svelte";
  import DesignBasics from "./DesignBasics.svelte";
  import DesignColors from "./DesignColors.svelte";

  interface Props {
    game: GameState;
  }

  let { game }: Props = $props();

  const errors = $derived(
    game.designIssues.filter((issue) => issue.severity === "error"),
  );
  const warnings = $derived(
    game.designIssues.filter((issue) => issue.severity === "warning"),
  );
</script>

<div
  class="game-station-panel design-panel"
  class:expert={game.expert}
  data-testid="design-panel"
>
  <div>
    <p class="game-eyebrow">
      {game.mode === "sandbox" ? "Modo libre" : "Estación de diseño"}
    </p>
    <h3 class="game-title">
      {game.mode === "sandbox" ? "Diseña a tu gusto" : "Traduce la nota"}
    </h3>
    <p class="game-text">
      {game.mode === "sandbox"
        ? "Todo está desbloqueado. Combina ceras, capas, figuras, gel y acabados; la receta se arma sola."
        : "Elige los materiales para cumplir el pedido. La nota queda visible arriba mientras diseñas."}
    </p>
  </div>

  {#if game.mode === "guided"}
    <p class="game-note">
      {game.brief.summary}
    </p>
  {/if}

  <DesignBasics {game} />
  <DesignColors {game} />

  {#if errors.length > 0}
    <ul class="design-issues" data-testid="design-issues" aria-live="polite">
      {#each errors as issue}
        <li class="design-issues__error">{issue.message}</li>
      {/each}
      {#each warnings as issue}
        <li class="design-issues__warning">{issue.message}</li>
      {/each}
    </ul>
  {:else}
    <p class="game-note" data-testid="design-ready">
      Diseño completo. Puedes ajustar lo que quieras antes de pasar al taller.
    </p>
    {#if warnings.length > 0}
      <ul class="design-issues" data-testid="design-warnings">
        {#each warnings as issue}
          <li class="design-issues__warning">{issue.message}</li>
        {/each}
      </ul>
    {/if}
  {/if}

  <div class="design-cta">
    {#if game.mode === "sandbox"}
      <button
        class="game-action game-primary"
        type="button"
        onclick={() => game.viewSandboxRecipe()}
        disabled={!game.canDesign}
        data-testid="sandbox-recipe"
      >
        Ver mi receta
      </button>
      <button
        class="game-action game-action--secondary"
        type="button"
        onclick={() => game.goMelt()}
        disabled={!game.canDesign}
        data-testid="sandbox-craft"
      >
        Probar el taller
      </button>
      <button
        class="game-action game-action--secondary game-action--small"
        type="button"
        onclick={() => game.exitSandbox()}
        data-testid="exit-sandbox"
      >
        Salir del modo libre
      </button>
    {:else}
      <button
        class="game-action game-primary"
        type="button"
        onclick={() => game.goMelt()}
        disabled={!game.canDesign}
        data-testid="design-continue"
      >
        Ir al taller
      </button>
      <p class="design-hint">
        El taller empieza por derretir la cera. Podrás volver a mirar la nota.
      </p>
    {/if}
  </div>
</div>

<style>
  .design-panel {
    gap: 0.6rem;
  }

  .design-issues {
    display: grid;
    gap: 0.3rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .design-issues__error,
  .design-issues__warning {
    padding: 0.4rem 0.55rem;
    border-left: 3px solid var(--color-accent);
    background: var(--color-accent-soft);
    color: var(--color-accent-strong);
    font-size: 0.65rem;
    font-weight: 700;
    line-height: 1.35;
  }

  .design-issues__warning {
    border-left-color: var(--color-sage);
    background: var(--color-sage-soft);
    color: var(--color-sage);
  }

  .design-cta {
    display: grid;
    gap: 0.45rem;
    padding-top: 0.6rem;
    border-top: 1px dashed var(--color-border);
  }

  .design-hint {
    color: var(--color-text-muted);
    font-size: 0.62rem;
    line-height: 1.4;
    text-align: center;
  }

  .design-panel.expert :global(.design-hint) {
    display: none;
  }
</style>
