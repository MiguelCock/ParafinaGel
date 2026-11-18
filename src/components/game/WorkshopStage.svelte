<script lang="ts">
  import type { GameState } from "@lib/game/game-state.svelte";
  import { stationLabels, stationOrder } from "@lib/game/data";
  import type { StationId } from "@lib/game/types";
  import CoolScene from "./CoolScene.svelte";
  import CounterScene from "./CounterScene.svelte";
  import CustomerPortrait from "./CustomerPortrait.svelte";
  import FinishScene from "./FinishScene.svelte";
  import MeltScene from "./MeltScene.svelte";
  import PourScene from "./PourScene.svelte";
  import StationIcon from "./StationIcon.svelte";
  import WorkshopBackdrop from "./WorkshopBackdrop.svelte";

  interface Props {
    game: GameState;
  }

  let { game }: Props = $props();

  const hotspots: { station: StationId; left: string; top: string }[] = [
    { station: "melt", left: "16%", top: "47%" },
    { station: "pour", left: "50%", top: "58%" },
    { station: "cool", left: "84%", top: "46%" },
    { station: "finish", left: "50%", top: "26%" },
    { station: "counter", left: "50%", top: "82%" },
  ];

  const hints: Record<StationId, string> = {
    counter: "Revisa el ticket y toma el pedido.",
    melt: "Calienta, elige aroma y color, y remueve.",
    pour: "Elige el frasco y vierte hasta la meta.",
    cool: "Abanica para enfriar más rápido.",
    finish: "Recorta, etiqueta, tapa y empaca.",
  };

  const scene = $derived(
    game.view === "overview" ? null : (game.view as StationId),
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

    {#if game.view !== "overview"}
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
        <h3>Tu primera vela</h3>
        <p>
          Atiende tres pedidos, prepara cada vela y descubre cómo se trabaja en
          el taller familiar.
        </p>
        <button
          class="game-action game-primary"
          type="button"
          onclick={() => game.start()}
          data-testid="start-game"
        >
          Empezar
        </button>
        <p class="stage__intro-note">
          Revisa el ticket y usa las pestañas para moverte entre estaciones.
        </p>
      </div>
    </div>
  {:else if game.view === "overview"}
    <div class="stage__overview">
      {#each hotspots as spot}
        <button
          class="hotspot"
          class:active={game.phase === spot.station}
          type="button"
          style={`left: ${spot.left}; top: ${spot.top}`}
          onclick={() => game.setView(spot.station)}
          data-testid={`hotspot-${spot.station}`}
        >
          <StationIcon station={spot.station} size={20} />
          <span>{stationLabels[spot.station]}</span>
        </button>
      {/each}

      {#if game.phase !== "dayEnd"}
        <div class="stage__customer">
          <CustomerPortrait customer={game.order.customer} size="sm" />
          <div>
            <strong>{game.order.customer.nombre}</strong>
            <span>
              {game.phase === "score"
                ? "Pedido entregado"
                : `Pedido ${game.currentOrderNumber} de ${game.totalOrders}`}
            </span>
          </div>
        </div>
      {/if}

      <p class="stage__hint">
        {game.phase === "dayEnd"
          ? "El taller cerró por hoy."
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
          <p class="game-eyebrow">Estación</p>
          <h3>{stationLabels[scene]}</h3>
        </div>
      </div>

      <div class="stage__scene-body">
        {#if scene === "counter"}
          <CounterScene
            customer={game.order.customer}
            happy={game.phase === "score"}
          />
        {:else if scene === "melt"}
          <MeltScene {game} />
        {:else if scene === "pour"}
          <PourScene {game} />
        {:else if scene === "cool"}
          <CoolScene {game} />
        {:else if scene === "finish"}
          <FinishScene {game} />
        {/if}
      </div>

      <p class="stage__hint">{hints[scene]}</p>
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
    z-index: 2;
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
    max-width: 13rem;
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
    z-index: 3;
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
    width: min(100%, 24rem);
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

  .stage__intro-note {
    font-size: var(--text-xs) !important;
    opacity: 0.8;
  }

  .stage__scene {
    position: absolute;
    inset: 3.2rem 8% 2.4rem;
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

  .stage__scene-body {
    display: grid;
    align-items: center;
    min-height: 0;
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
      min-height: 380px;
    }

    .stage__brand {
      max-width: 12rem;
    }

    .hotspot {
      padding: 0.35rem 0.5rem;
      font-size: 0.6rem;
    }

    .stage__scene {
      inset: 2.8rem 3% 1.8rem;
    }

    .stage__scene-head h3 {
      font-size: var(--text-xl);
    }

    .stage__hint {
      display: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .stage__back,
    .hotspot {
      transition: none;
    }
  }
</style>
