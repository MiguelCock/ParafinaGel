<script lang="ts">
  import { onMount } from "svelte";
  import { formatCOP } from "@lib/format";
  import { stationLabels, stationOrder } from "@lib/game/data";
  import { GameState } from "@lib/game/game-state.svelte";
  import type { StationId } from "@lib/game/types";
  import OrderTicket from "./OrderTicket.svelte";
  import StationPanel from "./StationPanel.svelte";
  import StationTabs from "./StationTabs.svelte";
  import WorkshopStage from "./WorkshopStage.svelte";
  import "@styles/game.css";

  const game = new GameState();
  let showHelp = $state(false);

  const phaseIndex = $derived(
    game.phase === "intro"
      ? -1
      : game.phase === "score" || game.phase === "dayEnd"
        ? stationOrder.length
        : stationOrder.indexOf(game.phase as StationId),
  );

  const status = $derived(
    game.phase === "intro"
      ? "Taller ParafinaGel. Pulsa Empezar."
      : game.phase === "score"
        ? `Pedido entregado. Puntuación ${game.score?.total ?? 0} de 100.`
        : game.phase === "dayEnd"
          ? `Fin del día. Propinas ${game.totalTips} pesos.`
          : `Estación activa: ${stationLabels[game.phase]}.`,
  );

  function openHelp() {
    showHelp = true;
    game.paused = true;
  }

  function closeHelp() {
    showHelp = false;
    game.paused = document.hidden;
  }

  onMount(() => {
    let raf = 0;
    let last = performance.now();

    const loop = (now: number) => {
      const delta = Math.min(0.05, (now - last) / 1000);
      last = now;
      game.tick(delta);
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);

    const onVisibility = () => {
      game.paused = document.hidden || showHelp;
      last = performance.now();
    };

    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  });
</script>

<svelte:window
  onkeydown={(event) => {
    if (event.key === "Escape" && showHelp) closeHelp();
  }}
/>

<div class="game-shell" data-testid="game2d">
  <p class="visually-hidden" aria-live="polite">{status}</p>

  <header class="game-hud">
    <div class="game-brand">
      <span class="game-brand__flame" aria-hidden="true"></span>
      <span>Taller ParafinaGel</span>
    </div>

    <div class="game-hud__meta" aria-label="Progreso del día">
      <span class="hud-chip">Día 1</span>
      <span class="hud-chip">
        Pedido {game.currentOrderNumber}/{game.totalOrders}
      </span>
      <span class="hud-chip">Propinas {formatCOP(game.totalTips)}</span>
    </div>

    <div class="game-hud__actions">
      <button type="button" onclick={openHelp} data-testid="open-help">
        Cómo jugar
      </button>
    </div>
  </header>

  <div class="game-progress" aria-hidden="true">
    {#each stationOrder as station, index}
      <span class:done={index < phaseIndex} class:current={index === phaseIndex}
      ></span>
    {/each}
  </div>

  <div class="game-body">
    <WorkshopStage {game} />

    <aside
      class="game-panel"
      class:game-panel--intro={game.phase === "intro"}
      aria-label="Pedido y estación"
    >
      {#if game.phase === "intro"}
        <div class="game-panel__intro">
          <p class="game-eyebrow">Cómo jugar</p>
          <h3 class="game-title">Un pedido, cinco estaciones</h3>
          <ol>
            <li>Recibe el pedido en el mostrador.</li>
            <li>Calienta la cera, elige aroma y color.</li>
            <li>Elige el frasco y vierte hasta la meta.</li>
            <li>Deja enfriar y termina los detalles.</li>
            <li>Entrega la vela y recibe propina.</li>
          </ol>
          <p class="game-text">
            Esta es una versión de ejemplo. Los tiempos y temperaturas son
            aproximados y se validarán con el taller.
          </p>
        </div>
      {:else}
        {#if game.phase !== "dayEnd" && game.phase !== "score"}
          <OrderTicket order={game.order} phase={game.phase} />
        {/if}

        {#if game.phase !== "score" && game.phase !== "dayEnd"}
          <StationTabs state={game} />
        {/if}

        <StationPanel state={game} />
      {/if}
    </aside>
  </div>
</div>

{#if showHelp}
  <div
    class="game-help"
    role="dialog"
    aria-modal="true"
    aria-labelledby="help-title"
  >
    <div class="game-help__card">
      <p class="game-eyebrow">Cómo jugar</p>
      <h3 id="help-title" class="game-title">Un pedido, cinco estaciones</h3>
      <ol>
        <li><strong>Mostrador:</strong> revisa el ticket y toma el pedido.</li>
        <li><strong>Cera:</strong> calienta, elige aroma/color y remueve.</li>
        <li>
          <strong>Vertido:</strong> elige el frasco y vierte hasta la meta.
        </li>
        <li>
          <strong>Enfriado:</strong> abanica y espera a que la vela esté lista.
        </li>
        <li>
          <strong>Acabado:</strong> recorta, etiqueta, tapa, empaca y entrega.
        </li>
      </ol>
      <p class="game-text">
        Puedes volver al taller con “Ver taller” y mirar las estaciones
        completadas sin perder el pedido.
      </p>
      <button
        class="game-action game-primary"
        type="button"
        onclick={closeHelp}
        data-testid="close-help"
      >
        Entendido
      </button>
    </div>
  </div>
{/if}

<style>
  .game-shell {
    position: relative;
    overflow: hidden;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-bg-elevated);
    box-shadow: var(--shadow-md);
  }

  .game-hud {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.55rem 1rem;
    padding: 0.6rem 0.85rem;
    border-bottom: 1px solid var(--color-border);
    background: var(--color-bg-elevated);
  }

  .game-brand {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    color: var(--color-heading);
    font-family: var(--font-display);
    font-size: var(--text-lg);
    font-weight: 600;
    letter-spacing: -0.02em;
  }

  .game-brand__flame {
    width: 0.6rem;
    height: 0.85rem;
    border-radius: 60% 60% 50% 50%;
    background: linear-gradient(180deg, #f6d36f, var(--color-accent));
    box-shadow: 0 0 10px rgba(246, 211, 111, 0.65);
  }

  .game-hud__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
  }

  .hud-chip {
    padding: 0.25rem 0.5rem;
    border: 1px solid var(--color-border);
    border-radius: 999px;
    background: var(--color-bg);
    color: var(--color-text-muted);
    font-size: 0.65rem;
    font-weight: 700;
    white-space: nowrap;
  }

  .game-hud__actions {
    display: flex;
    gap: 0.3rem;
  }

  .game-hud__actions button {
    min-height: 32px;
    padding: 0.3rem 0.6rem;
    border: 1px solid var(--color-border);
    border-radius: 999px;
    background: var(--color-bg);
    color: var(--color-text-muted);
    font-size: 0.65rem;
    font-weight: 700;
  }

  .game-hud__actions button:hover {
    border-color: var(--color-accent);
    color: var(--color-accent);
  }

  .game-progress {
    display: flex;
    gap: 3px;
    padding: 0.3rem 0.85rem;
    border-bottom: 1px solid var(--color-border);
    background: var(--color-bg-elevated);
  }

  .game-progress span {
    flex: 1;
    height: 4px;
    border-radius: 999px;
    background: var(--color-surface-strong);
    transition: background-color var(--transition);
  }

  .game-progress span.done {
    background: var(--color-sage);
  }

  .game-progress span.current {
    background: var(--color-accent);
  }

  .game-body {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    min-width: 0;
  }

  .game-panel {
    display: grid;
    align-content: start;
    gap: 0.7rem;
    min-width: 0;
    padding: 0.85rem;
    border-top: 1px solid var(--color-border);
    background: var(--color-bg-elevated);
  }

  .game-panel__intro {
    display: grid;
    gap: 0.55rem;
  }

  .game-panel__intro ol,
  .game-help__card ol {
    display: grid;
    gap: 0.4rem;
    padding-left: 1.1rem;
    list-style: decimal;
    color: var(--color-text-muted);
    font-size: var(--text-sm);
    line-height: 1.45;
  }

  .game-help__card strong {
    color: var(--color-heading);
  }

  .game-help {
    position: fixed;
    inset: 0;
    z-index: 80;
    display: grid;
    place-items: center;
    padding: 1rem;
    background: rgba(30, 25, 20, 0.48);
    backdrop-filter: blur(4px);
  }

  .game-help__card {
    display: grid;
    gap: 0.6rem;
    width: min(100%, 28rem);
    max-height: 90vh;
    overflow-y: auto;
    padding: 1.2rem;
    border: 1px solid var(--color-border);
    border-radius: 1rem;
    background: var(--color-bg-elevated);
    box-shadow: var(--shadow-lg);
  }

  @media (min-width: 900px) {
    .game-body {
      grid-template-columns: minmax(0, 1fr) 380px;
      min-height: min(78vh, 760px);
    }

    .game-panel {
      max-height: min(78vh, 760px);
      overflow-y: auto;
      border-top: 0;
      border-left: 1px solid var(--color-border);
    }
  }

  @media (max-width: 899px) {
    :global(.game-panel--intro) {
      display: none !important;
    }
  }

  @media (max-width: 520px) {
    .game-brand {
      font-size: var(--text-base);
    }

    .game-panel {
      padding: 0.7rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .game-progress span {
      transition: none;
    }
  }
</style>
