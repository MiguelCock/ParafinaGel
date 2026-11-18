<script lang="ts">
  import { onMount } from "svelte";
  import { Canvas } from "@threlte/core";
  import { ACESFilmicToneMapping } from "three";
  import { formatCOP } from "@lib/format";
  import { Game3DState } from "@lib/game3d/game-state.svelte";
  import { stationLabels } from "@lib/game3d/data";
  import GameScene from "./GameScene.svelte";
  import OrderTicket from "./OrderTicket.svelte";
  import StationPanel from "./StationPanel.svelte";
  import StationTabs from "./StationTabs.svelte";
  import "@styles/game.css";

  interface Props {
    onLightMode: () => void;
  }

  let { onLightMode }: Props = $props();

  const game = new Game3DState();
  const status = $derived(
    game.phase === "intro"
      ? "Taller ParafinaGel. Pulsa Empezar."
      : game.phase === "score"
        ? `Pedido entregado. Puntuación ${game.score?.total ?? 0} de 100.`
        : game.phase === "dayEnd"
          ? `Fin del día. Propinas ${game.totalTips} pesos.`
          : `Estación activa: ${stationLabels[game.phase]}.`,
  );
  const isDev = import.meta.env.DEV;
  let statsText = $state("");

  onMount(() => {
    if (window.matchMedia("(max-width: 760px)").matches) {
      game.quality = "baja";
    }

    const onVisibility = () => {
      game.paused = document.hidden;
    };

    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  });
</script>

<div class="game3d" data-testid="game3d">
  <p class="visually-hidden" aria-live="polite">{status}</p>

  <header class="game3d__hud">
    <div class="game3d__brand">
      <span class="game3d__flame" aria-hidden="true"></span>
      <span>Taller ParafinaGel</span>
    </div>

    <div class="game3d__meta" aria-label="Progreso del día">
      <span>Día 1</span>
      <span>Pedido {game.currentOrderNumber}/{game.totalOrders}</span>
      <span>Propinas {formatCOP(game.totalTips)}</span>
    </div>

    <div class="game3d__actions">
      <button
        type="button"
        onclick={() => game.toggleQuality()}
        data-testid="quality-toggle"
      >
        Calidad: {game.quality === "alta" ? "Alta" : "Baja"}
      </button>
      <button type="button" onclick={onLightMode} data-testid="light-mode">
        Modo ligero
      </button>
    </div>
  </header>

  <div class="game3d__stage">
    <div class="game3d__canvas">
      <Canvas
        shadows={game.quality === "alta"}
        dpr={game.quality === "alta" ? [1, 1.8] : [0.75, 1.2]}
        renderMode="always"
        toneMapping={ACESFilmicToneMapping}
      >
        <GameScene
          state={game}
          onTick={(delta) => game.tick(delta)}
          onStats={(value) =>
            (statsText = `${value.fps} fps · ${value.calls} calls · ${value.triangles} tris`)}
        />
      </Canvas>

      {#if isDev && statsText}
        <div class="game3d__stats" data-testid="stats">{statsText}</div>
      {/if}

      {#if game.phase === "intro"}
        <div class="game3d__intro">
          <div class="game3d__intro-card">
            <p class="game-eyebrow">Taller ParafinaGel</p>
            <h3>Tu primera vela</h3>
            <p class="game-text">
              Atiende tres pedidos, prepara cada vela y descubre cómo se trabaja
              en el taller familiar.
            </p>
            <button
              class="game-action"
              type="button"
              onclick={() => game.start()}
              data-testid="start-game"
            >
              Empezar
            </button>
            <p class="game3d__intro-note">
              Consejo: revisa el ticket y usa las pestañas para moverte entre
              estaciones.
            </p>
          </div>
        </div>
      {/if}
    </div>

    <aside class="game3d__panel" aria-label="Pedido y estación">
      {#if game.phase === "intro"}
        <div class="game3d__panel-intro">
          <p class="game-eyebrow">Cómo jugar</p>
          <h3 class="game-title">Un pedido, cinco estaciones</h3>
          <ol>
            <li>Recibe el pedido en el mostrador.</li>
            <li>Calienta la cera, elige aroma y color.</li>
            <li>Elige el frasco y vierte.</li>
            <li>Deja enfriar y termina los detalles.</li>
            <li>Entrega la vela y recibe propina.</li>
          </ol>
          <p class="game-text">
            El juego usa tiempos y temperaturas aproximados. Los datos reales
            del taller se validarán contigo.
          </p>
        </div>
      {:else}
        <OrderTicket order={game.order} phase={game.phase} />
        {#if game.phase !== "score" && game.phase !== "dayEnd"}
          <StationTabs state={game} />
        {/if}
        <StationPanel state={game} />
      {/if}
    </aside>
  </div>
</div>

<style>
  .game3d {
    overflow: hidden;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-bg-elevated);
    box-shadow: var(--shadow-md);
  }

  .game3d__hud {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.6rem 1rem;
    padding: 0.65rem 0.85rem;
    border-bottom: 1px solid var(--color-border);
    background: var(--color-bg-elevated);
  }

  .game3d__brand {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    color: var(--color-heading);
    font-family: var(--font-display);
    font-size: var(--text-lg);
    font-weight: 600;
    letter-spacing: -0.02em;
  }

  .game3d__flame {
    width: 0.65rem;
    height: 0.9rem;
    border-radius: 60% 60% 50% 50%;
    background: linear-gradient(180deg, #f6d36f, var(--color-accent));
    box-shadow: 0 0 12px rgba(246, 211, 111, 0.75);
  }

  .game3d__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem 0.75rem;
    color: var(--color-text-muted);
    font-size: var(--text-xs);
    font-weight: 700;
  }

  .game3d__actions {
    display: flex;
    gap: 0.35rem;
  }

  .game3d__actions button {
    min-height: 32px;
    padding: 0.35rem 0.6rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-full);
    background: var(--color-bg);
    color: var(--color-text-muted);
    font-size: 0.68rem;
    font-weight: 700;
  }

  .game3d__actions button:hover {
    border-color: var(--color-accent);
    color: var(--color-accent);
  }

  .game3d__stage {
    display: grid;
    grid-template-columns: 1fr;
  }

  .game3d__canvas {
    position: relative;
    height: clamp(320px, 44vh, 460px);
    background: #f7eee1;
    touch-action: manipulation;
  }

  .game3d__stats {
    position: absolute;
    bottom: 0.5rem;
    left: 0.5rem;
    z-index: 2;
    padding: 0.25rem 0.45rem;
    border-radius: 4px;
    background: rgba(30, 25, 20, 0.78);
    color: #fbf3e9;
    font-family: var(--font-mono);
    font-size: 0.62rem;
    pointer-events: none;
  }

  .game3d__intro {
    position: absolute;
    inset: 0;
    z-index: 4;
    display: grid;
    place-items: center;
    padding: var(--space-4);
    background: rgba(250, 245, 238, 0.68);
    backdrop-filter: blur(4px);
  }

  .game3d__intro-card {
    display: grid;
    justify-items: start;
    gap: 0.6rem;
    width: min(100%, 26rem);
    padding: var(--space-5);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-bg-elevated);
    box-shadow: var(--shadow-lg);
  }

  .game3d__intro-card h3 {
    font-size: var(--text-3xl);
  }

  .game3d__intro-note {
    color: var(--color-text-muted);
    font-size: var(--text-xs);
  }

  .game3d__panel {
    display: grid;
    align-content: start;
    gap: 0.75rem;
    padding: 0.9rem;
    border-top: 1px solid var(--color-border);
    background: var(--color-bg-elevated);
  }

  .game3d__panel-intro {
    display: grid;
    gap: 0.65rem;
  }

  .game3d__panel-intro ol {
    display: grid;
    gap: 0.4rem;
    padding-left: 1.1rem;
    list-style: decimal;
    color: var(--color-text-muted);
    font-size: var(--text-sm);
  }

  @media (min-width: 900px) {
    .game3d__stage {
      grid-template-columns: minmax(0, 1fr) 360px;
    }

    .game3d__canvas {
      height: min(72vh, 720px);
    }

    .game3d__panel {
      max-height: min(72vh, 720px);
      overflow-y: auto;
      border-top: 0;
      border-left: 1px solid var(--color-border);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .game3d__actions button,
    .game3d__flame {
      transition: none;
      animation: none;
    }
  }
</style>
