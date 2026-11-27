<script lang="ts">
  import { orderTypeLabels, stationLabels, stationOrder } from "@lib/game/data";
  import type { GameState } from "@lib/game/game-state.svelte";
  import type { StationId } from "@lib/game/types";
  import CounterScene from "./CounterScene.svelte";
  import CustomerPortrait from "./CustomerPortrait.svelte";
  import StationIcon from "./StationIcon.svelte";
  import StageCanvas from "./StageCanvas.svelte";
  import WorkshopBackdrop from "./WorkshopBackdrop.svelte";

  interface Props {
    game: GameState;
  }

  let { game }: Props = $props();

  const hotspots: { station: StationId; left: string; top: string }[] = [
    { station: "design", left: "20%", top: "30%" },
    { station: "wick", left: "70%", top: "38%" },
    { station: "melt", left: "14%", top: "48%" },
    { station: "mix", left: "34%", top: "48%" },
    { station: "pour", left: "50%", top: "58%" },
    { station: "cool", left: "85%", top: "48%" },
    { station: "finish", left: "50%", top: "25%" },
    { station: "counter", left: "50%", top: "82%" },
  ];

  const hints: Record<StationId, string> = {
    counter: "Escucha los detalles y crea la nota de diseño.",
    design: "Elige cera, forma, colores, aroma, mecha y etiqueta.",
    melt: "Corta el bloque si hace falta, gira la perilla y remueve tres veces.",
    mix: "Calienta cada fogón, dosifica color y aroma, y revuelve.",
    pour: "Llena cada capa o parte hasta la zona verde.",
    wick: "Coloca la mecha al centro, fíjala y córtala con la tijera.",
    cool: "Retira el sostenedor y espera el curado; en gel, quita las burbujas.",
    finish: "Alinea la etiqueta, pon la tapa y empaca.",
  };

  const scene = $derived(
    game.view === "overview" ? null : (game.view as StationId),
  );

  const sceneHint = $derived.by(() => {
    if (game.phase === "score") {
      return "Así queda tu vela · receta lista para pedir insumos";
    }
    if (scene === "pour") {
      if (game.craft.waitingFilm)
        return "Deja que la capa cuaje antes de seguir";
      if (game.pourComplete) return "Vertido completo · deja curar la vela";
      return "La mecha ya está lista; arrastra la jarra sobre la boca y suelta al terminar";
    }
    if (scene === "mix") {
      return game.canContinueMix
        ? "Todos los fogones listos · pasa al vertido"
        : "Calienta cada fogón y mezcla su color y aroma";
    }
    if (scene === "cool" && game.craft.cooled) {
      return game.craft.holder
        ? "Vela firme · retira el sostenedor con clic o H"
        : "La vela está lista · pasa al acabado";
    }
    if (scene) return hints[scene];
    return "";
  });

  const visibleHotspots = $derived(
    game.mode === "guided"
      ? hotspots
      : hotspots.filter((spot) => spot.station !== "counter"),
  );
</script>

<section class="stage" aria-label="Taller ilustrado de ParafinaGel">
  <WorkshopBackdrop />
  <div class="stage__shade" aria-hidden="true"></div>

  <header class="stage__top">
    <span class="stage__brand">
      <span class="stage__flame" aria-hidden="true"></span>
      Taller ParafinaGel
    </span>

    {#if game.view !== "overview" && game.phase !== "intro"}
      <button
        class="stage__back"
        type="button"
        onclick={() => game.setView("overview")}
        data-testid="back-to-workshop"
      >
        ← Ver taller
      </button>
    {/if}
  </header>

  {#if game.phase === "intro"}
    <div class="stage__intro">
      <div class="stage__intro-card">
        <p class="game-eyebrow">Una tarde en el taller</p>
        <h3>Diseña la vela. Compra los insumos.</h3>
        <p>
          Escucha un brief, arma la vela por capas, figura o gel, y recibe la
          receta con todo lo que necesitas para hacerla.
        </p>
        <div class="stage__intro-actions">
          <button
            class="game-action game-primary"
            type="button"
            onclick={() => game.startGuided()}
            data-testid="start-game"
          >
            Jugar pedidos
          </button>
          <button
            class="game-action game-action--secondary"
            type="button"
            onclick={() => game.startSandbox()}
            data-testid="start-sandbox"
          >
            Modo libre
          </button>
        </div>
        <p class="stage__intro-note">
          Cuatro pedidos · clásica, capas, figura y gel · sin prisa.
        </p>
      </div>
    </div>
  {:else if game.view === "overview"}
    <div class="stage__overview">
      {#each visibleHotspots as spot}
        <button
          class="hotspot"
          class:active={game.activeStation === spot.station}
          type="button"
          style={`left: ${spot.left}; top: ${spot.top}`}
          onclick={() => game.setView(spot.station)}
          data-testid={`hotspot-${spot.station}`}
        >
          <StationIcon station={spot.station} size={20} />
          <span>{stationLabels[spot.station]}</span>
        </button>
      {/each}

      {#if game.mode === "guided" && game.phase !== "dayEnd"}
        <div class="stage__customer">
          <CustomerPortrait customer={game.brief.customer} size="sm" />
          <div>
            <strong>{game.brief.customer.nombre}</strong>
            <span>
              {game.phase === "score"
                ? "Pedido entregado"
                : `Pedido ${game.currentOrderNumber} de ${game.totalBriefs}`}
            </span>
          </div>
        </div>
      {:else if game.mode === "sandbox"}
        <div class="stage__customer">
          <span class="stage__sandbox-dot" aria-hidden="true">✦</span>
          <div>
            <strong>Modo libre</strong>
            <span>Diseña sin pedido ni reloj</span>
          </div>
        </div>
      {/if}

      <p class="stage__hint">
        {game.phase === "dayEnd"
          ? "El taller cerró por hoy."
          : game.mode === "sandbox"
            ? "Toca una estación o vuelve al diseño."
            : "Toca una estación para acercarte."}
      </p>
    </div>
  {:else if scene}
    <div class="stage__scene" data-testid={`scene-${scene}`}>
      <div class="stage__scene-head">
        <span class="stage__scene-icon">
          <StationIcon station={scene} size={20} />
        </span>
        <div>
          <p class="game-eyebrow">
            {game.phase === "score"
              ? "Pedido entregado"
              : game.mode === "sandbox"
                ? "Modo libre"
                : "Estación"}
          </p>
          <h3>{game.phase === "score" ? "Resultado" : stationLabels[scene]}</h3>
        </div>
        {#if game.mode === "guided" && scene !== "counter"}
          <span class="stage__scene-type">
            {orderTypeLabels[game.design.mode]}
          </span>
        {/if}
      </div>

      <div class="stage__scene-body">
        {#if scene === "counter"}
          <CounterScene
            brief={game.brief}
            revealed={game.revealed}
            noted={game.noted}
          />
        {:else}
          <StageCanvas {game} {scene} />
        {/if}
      </div>

      <p class="stage__hint">{sceneHint}</p>
    </div>
  {/if}
</section>

<style>
  .stage {
    position: relative;
    height: 100%;
    min-height: clamp(340px, 52vh, 640px);
    overflow: hidden;
    border-radius: var(--radius-lg);
    background: #f8ecdd;
    isolation: isolate;
  }

  .stage__shade {
    position: absolute;
    inset: 0;
    z-index: 1;
    background:
      radial-gradient(
        ellipse at 50% 35%,
        transparent 20%,
        rgba(74, 52, 35, 0.12) 100%
      ),
      linear-gradient(180deg, rgba(255, 249, 242, 0.08), rgba(74, 52, 35, 0.18));
    pointer-events: none;
  }

  .stage__top {
    position: absolute;
    top: 0.7rem;
    right: 0.7rem;
    left: 0.7rem;
    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .stage__brand,
  .stage__back {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    min-height: 2.1rem;
    padding: 0.35rem 0.7rem;
    border: 1px solid rgba(143, 95, 64, 0.2);
    border-radius: 999px;
    background: rgba(255, 249, 242, 0.88);
    box-shadow: 0 6px 14px -10px rgba(42, 36, 30, 0.45);
    color: #5c4838;
    font-size: var(--text-xs);
    font-weight: 800;
    backdrop-filter: blur(8px);
  }

  .stage__brand {
    font-family: var(--font-display);
    font-size: var(--text-sm);
    letter-spacing: -0.01em;
  }

  .stage__flame {
    width: 0.55rem;
    height: 0.8rem;
    border-radius: 60% 60% 50% 50%;
    background: linear-gradient(180deg, #f6d36f, #b4552f);
    box-shadow: 0 0 10px rgba(246, 211, 111, 0.7);
  }

  .stage__back {
    cursor: pointer;
    transition:
      background-color var(--transition),
      transform var(--transition);
  }

  .stage__back:hover {
    background: #fff9f2;
    transform: translateY(-1px);
  }

  .stage__overview {
    position: absolute;
    inset: 0;
    z-index: 2;
  }

  .hotspot {
    position: absolute;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    min-height: 2.35rem;
    padding: 0.4rem 0.65rem;
    border: 1px solid rgba(143, 95, 64, 0.2);
    border-radius: 999px;
    background: rgba(255, 249, 242, 0.9);
    box-shadow: 0 8px 18px -12px rgba(42, 36, 30, 0.55);
    color: #5c4838;
    font-size: 0.68rem;
    font-weight: 800;
    transform: translate(-50%, -50%);
    transition:
      background-color var(--transition),
      border-color var(--transition),
      color var(--transition),
      transform var(--transition);
    backdrop-filter: blur(8px);
  }

  .hotspot:hover {
    border-color: #b4552f;
    color: #8f3f20;
    transform: translate(-50%, -50%) translateY(-2px);
  }

  .hotspot.active {
    border-color: #b4552f;
    background: #f3ddd2;
    color: #8f3f20;
    box-shadow:
      0 0 0 3px rgba(180, 85, 47, 0.12),
      0 10px 20px -14px rgba(42, 36, 30, 0.65);
  }

  .stage__customer {
    position: absolute;
    bottom: 1rem;
    left: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    max-width: 14rem;
    padding: 0.4rem 0.6rem 0.4rem 0.4rem;
    border: 1px solid rgba(143, 95, 64, 0.18);
    border-radius: 0.9rem;
    background: rgba(255, 249, 242, 0.9);
    box-shadow: 0 8px 18px -14px rgba(42, 36, 30, 0.5);
    backdrop-filter: blur(8px);
  }

  .stage__customer div {
    display: grid;
    gap: 0.05rem;
  }

  .stage__customer strong {
    color: #3b2d25;
    font-family: var(--font-display);
    font-size: 0.8rem;
    line-height: 1.1;
  }

  .stage__customer span {
    color: #7a6450;
    font-size: 0.6rem;
    font-weight: 700;
  }

  .stage__sandbox-dot {
    display: grid;
    place-items: center;
    width: 2.2rem;
    height: 2.2rem;
    border-radius: 50%;
    background: #e4eadf;
    color: #4f6247;
    font-size: 1rem;
  }

  .stage__hint {
    position: absolute;
    bottom: 0.5rem;
    left: 50%;
    z-index: 2;
    width: max-content;
    max-width: 90%;
    padding: 0.25rem 0.6rem;
    border: 1px solid var(--color-border);
    border-radius: 999px;
    background: color-mix(in srgb, var(--color-bg-elevated) 90%, transparent);
    color: var(--color-text-muted);
    font-size: 0.63rem;
    font-weight: 600;
    text-align: center;
    text-shadow: none;
    box-shadow: 0 4px 10px -8px rgba(42, 36, 30, 0.5);
    transform: translateX(-50%);
    pointer-events: none;
  }

  .stage__intro {
    position: absolute;
    inset: 0;
    z-index: 4;
    display: grid;
    place-items: center;
    padding: 1rem;
    background: rgba(250, 238, 224, 0.5);
    backdrop-filter: blur(3px);
  }

  .stage__intro-card {
    display: grid;
    justify-items: start;
    gap: 0.55rem;
    width: min(100%, 25rem);
    padding: 1.25rem;
    border: 1px solid var(--color-border);
    border-radius: 1rem;
    background: var(--color-bg-elevated);
    box-shadow: 0 24px 50px -30px rgba(42, 36, 30, 0.7);
  }

  .stage__intro-card h3 {
    color: var(--color-heading);
    font-size: var(--text-3xl);
  }

  .stage__intro-card p {
    color: var(--color-text-muted);
    font-size: var(--text-sm);
  }

  .stage__intro-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.45rem;
    width: 100%;
  }

  .stage__intro-actions :global(.game-action) {
    flex: 1 1 8rem;
  }

  .stage__intro-note {
    font-size: var(--text-xs) !important;
  }

  .stage__scene {
    position: absolute;
    inset: 3.2rem 7% 2.4rem;
    z-index: 2;
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto;
    gap: 0.55rem;
    padding: 1rem;
    border: 1px solid var(--color-border);
    border-radius: 1.1rem;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.18), transparent 45%),
      color-mix(in srgb, var(--color-bg-elevated) 94%, transparent);
    box-shadow: 0 24px 50px -30px rgba(42, 36, 30, 0.72);
    backdrop-filter: blur(6px);
    overflow: auto;
  }

  .stage__scene-head {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px dashed var(--color-border-strong);
  }

  .stage__scene-icon {
    display: grid;
    place-items: center;
    width: 2.4rem;
    height: 2.4rem;
    border-radius: 50%;
    background: var(--color-accent-soft);
    color: var(--color-accent-strong);
  }

  .stage__scene-head h3 {
    font-size: var(--text-2xl);
    line-height: 1;
  }

  .stage__scene-type {
    margin-left: auto;
    padding: 0.2rem 0.55rem;
    border: 1px solid var(--color-accent);
    border-radius: 999px;
    color: var(--color-accent);
    font-size: 0.58rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .stage__scene-body {
    display: grid;
    align-items: stretch;
    min-height: 0;
    overflow: hidden;
  }

  @media (max-width: 899px) {
    .stage {
      min-height: 360px;
    }

    .stage__scene {
      inset: 3rem 4% 2rem;
      padding: 0.75rem;
    }

    .stage__customer {
      display: none;
    }
  }

  @media (max-width: 520px) {
    .stage {
      min-height: 360px;
    }

    .stage__brand {
      max-width: 12rem;
    }

    .hotspot {
      gap: 0.2rem;
      padding: 0.3rem 0.42rem;
      font-size: 0.55rem;
    }

    .hotspot :global(svg) {
      width: 15px;
      height: 15px;
    }

    .stage__scene {
      inset: 2.8rem 3% 1.8rem;
    }

    .stage__scene-head h3 {
      font-size: var(--text-xl);
    }

    .stage__scene-type {
      display: none;
    }

    .stage__hint {
      display: none;
    }

    .stage__intro-card h3 {
      font-size: var(--text-2xl);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .stage__back,
    .hotspot {
      transition: none;
    }
  }
</style>
