<script lang="ts">
  import { onMount } from "svelte";
  import { stationLabels } from "@lib/game/data";
  import type { GameState } from "@lib/game/game-state.svelte";
  import type { StationId } from "@lib/game/types";
  import CandlePreview from "./CandlePreview.svelte";

  interface Props {
    game: GameState;
    scene: StationId;
  }

  let { game, scene }: Props = $props();

  let host: HTMLDivElement;
  let wrapper: HTMLDivElement;
  let renderer: import("@lib/game/render/stage-renderer").StageRenderer | null =
    null;
  let loading = $state(true);
  let failed = $state(false);
  let activeScene = $state<StationId>("design");

  const ariaLabel = $derived.by(() => {
    if (game.phase === "score") {
      return "Resultado de la vela. Revisa la receta y pide los insumos en el panel.";
    }
    if (game.phase === "wick") {
      return "Preparación. Coloca el porta pabilo y la mecha en el centro con el puntero o las flechas, usa el sostenedor y pulsa Enter para fijar.";
    }
    if (game.phase === "finish") {
      return "Acabado. Arrastra la etiqueta y su tirador, corta la mecha, y toca la tapa y el empaque.";
    }
    if (game.phase === "mix") {
      return "Mezcla. Hay varios fogones. Selecciona uno con 1–4, mantén su palanca para calentar, añade gotas de color con C, mantén A para el aroma y revuelve con las flechas o la cuchara.";
    }
    if (game.phase === "pour") {
      return "Vertido. La mecha ya está preparada. Arrastra la jarra sobre la boca del frasco y suelta para terminar la capa.";
    }
    if (game.phase === "melt") {
      if (!game.cutPrepared) {
        return "Estación de cera. La parafina está en bloque: arrastra el cuchillo de izquierda a derecha sobre el bloque o pulsa C para cortarla.";
      }
      if (!game.stearicPrepared) {
        return "Estación de cera. Toca el frasco de ácido esteárico o pulsa E para agregarlo a la olla.";
      }
      return "Estación de cera. Mantén la palanca para calentar y arrastra la cuchara en círculos para remover.";
    }
    if (game.phase === "cool") {
      return "Curado. Toca el ventilador para abanicar; cuando la vela esté firme, retira el sostenedor tocándolo o pulsando H. En gel, toca las burbujas o pulsa B.";
    }
    return `Vista previa del diseño. ${stationLabels[scene]}.`;
  });

  onMount(() => {
    let disposed = false;

    (async () => {
      try {
        const module = await import("@lib/game/render/stage-renderer");
        if (disposed) return;
        if (!module.webglAvailable()) {
          failed = true;
          loading = false;
          return;
        }

        const instance = new module.StageRenderer(host, game, activeScene);
        await instance.init();
        if (disposed) {
          instance.destroy();
          return;
        }
        instance.setScene(activeScene);
        renderer = instance;
        loading = false;
      } catch (error) {
        console.error("No se pudo iniciar WebGL", error);
        if (!disposed) {
          failed = true;
          loading = false;
        }
      }
    })();

    return () => {
      disposed = true;
      renderer?.destroy();
      renderer = null;
    };
  });

  $effect(() => {
    activeScene = scene;
    if (renderer) renderer.setScene(activeScene);
  });

  function handleKeyDown(event: KeyboardEvent) {
    if (
      [
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        " ",
        "Enter",
      ].includes(event.key)
    ) {
      event.preventDefault();
    }
    renderer?.handleKeyDown(event);
  }

  function handleKeyUp(event: KeyboardEvent) {
    renderer?.handleKeyUp(event);
  }
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex a11y_no_noninteractive_element_interactions -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
  class="stage-canvas"
  bind:this={wrapper}
  tabindex="0"
  role="application"
  aria-label={ariaLabel}
  onkeydown={handleKeyDown}
  onkeyup={handleKeyUp}
  onpointerdown={() => wrapper?.focus({ preventScroll: true })}
  data-testid={`stage-canvas-${scene}`}
>
  <div class="stage-canvas__host" bind:this={host}></div>

  {#if loading}
    <p class="stage-canvas__loading">Preparando el taller…</p>
  {/if}

  {#if failed}
    <div class="stage-canvas__fallback" data-testid="stage-fallback">
      <p class="game-eyebrow">Sin WebGL</p>
      <p class="stage-canvas__message">
        Tu navegador no pudo iniciar el taller visual. Puedes revisar el diseño
        y la receta, pero los mini-juegos necesitan WebGL.
      </p>
      {#if game.canDesign}
        <CandlePreview design={game.design} showWick showLabel />
        <button
          class="game-action game-primary game-action--small"
          type="button"
          onclick={() => game.viewRecipe()}
          data-testid="fallback-recipe"
        >
          Ver receta sin taller
        </button>
      {/if}
    </div>
  {/if}
</div>

<style>
  .stage-canvas {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 15rem;
    border-radius: 0.9rem;
    outline: none;
  }

  .stage-canvas:focus-visible {
    box-shadow: inset 0 0 0 2px
      color-mix(in srgb, var(--color-accent) 50%, transparent);
  }

  .stage-canvas__host {
    position: absolute;
    inset: 0;
  }

  .stage-canvas__host :global(canvas) {
    display: block;
    width: 100%;
    height: 100%;
  }

  .stage-canvas__loading {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    color: var(--color-text-muted);
    font-size: var(--text-sm);
    font-weight: 700;
  }

  .stage-canvas__fallback {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    align-content: center;
    gap: 0.6rem;
    padding: 1rem;
    border-radius: 0.9rem;
    background: var(--color-surface);
    color: var(--color-text-muted);
    text-align: center;
  }

  .stage-canvas__fallback :global(.game-eyebrow) {
    color: var(--color-accent-strong);
  }

  .stage-canvas__message {
    max-width: 28rem;
    font-size: var(--text-sm);
    line-height: 1.45;
  }

  .stage-canvas__fallback :global(.candle-preview) {
    width: 6rem;
  }

  @media (max-width: 520px) {
    .stage-canvas {
      min-height: 13rem;
    }
  }
</style>
