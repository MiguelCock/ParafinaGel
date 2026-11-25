<script lang="ts">
  import { onMount } from "svelte";
  import { stationLabels, stationOrder } from "@lib/game/data";
  import { GameState } from "@lib/game/game-state.svelte";
  import { motion } from "@lib/game/motion.svelte";
  import BriefSummary from "./BriefSummary.svelte";
  import StationPanel from "./StationPanel.svelte";
  import StationTabs from "./StationTabs.svelte";
  import WorkshopStage from "./WorkshopStage.svelte";
  import "@styles/game.css";

  const game = new GameState();
  let showHelp = $state(false);
  let shellEl = $state<HTMLElement | null>(null);
  let panelEl = $state<HTMLElement | null>(null);

  $effect(() => {
    const phase = game.phase;
    if (phase === "intro") return;

    if (window.matchMedia("(max-width: 899px)").matches) {
      if (shellEl) {
        const top = shellEl.getBoundingClientRect().top + window.scrollY - 70;
        window.scrollTo({ top, behavior: "instant" });
      }
    } else if (panelEl) {
      panelEl.scrollTo({ top: 0, behavior: "instant" });
    }
  });

  const progressStations = $derived(
    game.mode === "guided" ? stationOrder : stationOrder.slice(1),
  );

  const phaseIndex = $derived(
    game.phase === "intro"
      ? -1
      : game.phase === "score" || game.phase === "dayEnd"
        ? progressStations.length
        : progressStations.indexOf(game.activeStation),
  );

  const status = $derived.by(() => {
    if (game.phase === "intro") {
      return "Taller ParafinaGel. Elige jugar pedidos o modo libre.";
    }
    if (game.phase === "brief") {
      return `Escuchando a ${game.brief.customer.nombre}.`;
    }
    if (game.phase === "score") {
      return `Resultado listo. ${game.score ? `${Math.round(game.score.total)} de 100 puntos.` : "Receta generada."}`;
    }
    if (game.phase === "dayEnd") {
      return `Fin del día. ${game.served} pedidos y ${game.totalPoints} puntos.`;
    }
    return `Estación activa: ${stationLabels[game.activeStation]}.`;
  });

  function openHelp() {
    showHelp = true;
    game.paused = true;
    motion.pause();
  }

  function closeHelp() {
    showHelp = false;
    game.paused = document.hidden;
    motion.resume();
  }

  function restartGame() {
    game.restart();
    closeHelp();
  }

  onMount(() => {
    motion.start();
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
      motion.stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  });
</script>

<svelte:window
  onkeydown={(event) => {
    if (event.key === "Escape" && showHelp) closeHelp();
  }}
/>

<div
  class="game-shell"
  data-motion={motion.reduced ? "reduced" : "full"}
  bind:this={shellEl}
  data-testid="game2d"
>
  <p class="visually-hidden" aria-live="polite">{status}</p>

  <header class="game-hud">
    <div class="game-brand">
      <span class="game-brand__flame" aria-hidden="true"></span>
      <span>Taller ParafinaGel</span>
    </div>

    <div class="game-hud__meta" aria-label="Progreso">
      {#if game.mode === "guided"}
        <span class="hud-chip">Día 1</span>
        <span class="hud-chip">
          Pedido {game.currentOrderNumber}/{game.totalBriefs}
        </span>
        <span class="hud-chip">{game.totalPoints} pts</span>
      {:else}
        <span class="hud-chip hud-chip--sage">Modo libre</span>
        <span class="hud-chip">Sin reloj</span>
      {/if}
    </div>

    <div class="game-hud__actions">
      {#if game.mode === "sandbox" && game.phase !== "intro"}
        <button type="button" onclick={() => game.exitSandbox()}>
          Salir
        </button>
      {/if}
      <button
        type="button"
        class:active={game.expert}
        aria-pressed={game.expert}
        onclick={() => game.toggleExpert()}
        data-testid="toggle-expert"
      >
        Experto
      </button>
      <button type="button" onclick={openHelp} data-testid="open-help">
        Cómo jugar
      </button>
    </div>
  </header>

  <div class="game-progress" aria-hidden="true">
    {#each progressStations as station, index}
      <span
        class:done={index < phaseIndex}
        class:current={index === phaseIndex}
        title={stationLabels[station]}
      ></span>
    {/each}
  </div>

  <div class="game-body">
    <WorkshopStage {game} />

    <aside
      class="game-panel"
      class:game-panel--intro={game.phase === "intro"}
      bind:this={panelEl}
      aria-label="Pedido y estación"
    >
      {#if game.phase === "intro"}
        <div class="game-panel__intro">
          <p class="game-eyebrow">Cómo jugar</p>
          <h3 class="game-title">Diseña, crea y pide tus insumos</h3>
          <ol>
            <li>Escucha el brief y crea la nota.</li>
            <li>Diseña la vela: capas, figura o gel.</li>
            <li>Prepara el envase, el porta pabilo y la mecha.</li>
            <li>Calienta, mezcla color y aroma, vierte y espera el curado.</li>
            <li>Cuida el acabado y recibe tu receta.</li>
          </ol>
          <p class="game-text">
            Los pedidos son de ejemplo. Temperaturas, tiempos y materiales se
            validarán con el taller antes de publicar.
          </p>
        </div>
      {:else}
        {#if game.mode === "guided" && game.noted && game.phase !== "score" && game.phase !== "dayEnd"}
          <BriefSummary {game} />
        {/if}

        {#if game.phase !== "score" && game.phase !== "dayEnd"}
          <StationTabs {game} />
        {/if}

        <StationPanel {game} />
      {/if}
    </aside>
  </div>
</div>

{#if showHelp}
  <div
    class="game-help"
    data-motion={motion.reduced ? "reduced" : "full"}
    role="dialog"
    aria-modal="true"
    aria-labelledby="help-title"
  >
    <div class="game-help__card">
      <p class="game-eyebrow">Cómo jugar</p>
      <h3 id="help-title" class="game-title">Ocho estaciones, una receta</h3>
      <ol>
        <li><strong>Mostrador:</strong> escucha el brief y crea la nota.</li>
        <li>
          <strong>Diseño:</strong> elige cera, recipiente o molde, capas, figura,
          gel, aroma, mecha y etiqueta.
        </li>
        <li>
          <strong>Preparación:</strong> coloca el porta pabilo, engancha la mecha
          y usa el sostenedor de madera para centrarla.
        </li>
        <li>
          <strong>Cera:</strong> mantén la palanca para calentar y gira la cuchara
          dentro de la olla.
        </li>
        <li>
          <strong>Mezcla:</strong> cada capa o parte tiene su fogón. Calienta, dosifica
          color gota a gota, agrega el aroma y revuelve.
        </li>
        <li>
          <strong>Vertido:</strong> la mecha ya está lista; arrastra la jarra sobre
          la boca del frasco y suelta para cerrar la capa.
        </li>
        <li>
          <strong>Curado:</strong> toca el ventilador; cuando la vela esté firme,
          retira el sostenedor con clic o H. En gel, toca las burbujas.
        </li>
        <li>
          <strong>Acabado:</strong> arrastra la etiqueta y su tirador, corta la mecha
          sobre la vela, y toca la tapa y el empaque.
        </li>
      </ol>
      <p class="game-text">
        Al final obtienes puntos, estrellas y la receta con la lista de insumos.
        En <strong>Modo libre</strong> puedes diseñar sin pedido ni reloj. El
        botón <strong>Experto</strong> oculta las pistas numéricas. El taller usa
        WebGL; si tu navegador no lo soporta, puedes ver la receta igual.
      </p>
      <button
        class="game-action game-primary"
        type="button"
        onclick={closeHelp}
        data-testid="close-help"
      >
        Entendido
      </button>
      <button
        class="game-action game-action--secondary game-action--small"
        type="button"
        onclick={restartGame}
        data-testid="restart-game"
      >
        Reiniciar día
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

  .hud-chip--sage {
    border-color: var(--color-sage);
    background: var(--color-sage-soft);
    color: var(--color-sage);
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

  .game-hud__actions button.active {
    border-color: var(--color-accent);
    background: var(--color-accent-soft);
    color: var(--color-accent-strong);
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
    width: min(100%, 30rem);
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
      grid-template-columns: minmax(0, 1fr) 400px;
      min-height: min(80vh, 780px);
    }

    .game-panel {
      max-height: min(80vh, 780px);
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

    .hud-chip {
      font-size: 0.6rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .game-progress span {
      transition: none;
    }
  }
</style>
