<script lang="ts">
  import type { ProductoJuego } from "@lib/game/types";
  import CandleGame from "@components/game/CandleGame.svelte";
  import Game3D from "./Game3D.svelte";

  interface Props {
    productos: ProductoJuego[];
  }

  let { productos }: Props = $props();

  function supportsWebGL(): boolean {
    if (typeof document === "undefined") return false;

    try {
      const canvas = document.createElement("canvas");
      return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
    } catch {
      return false;
    }
  }

  let webgl = supportsWebGL();
  let mode = $state<"3d" | "2d">(webgl ? "3d" : "2d");
</script>

<div class="game-experience">
  <div class="game-experience__bar">
    <div>
      <p class="eyebrow">Experiencia</p>
      <p class="game-experience__title">Elige cómo jugar</p>
    </div>

    <div
      class="game-experience__switch"
      role="group"
      aria-label="Modo de juego"
    >
      <button
        type="button"
        class:active={mode === "3d"}
        onclick={() => (mode = "3d")}
        disabled={!webgl}
        data-testid="mode-3d"
      >
        3D
      </button>
      <button
        type="button"
        class:active={mode === "2d"}
        onclick={() => (mode = "2d")}
        data-testid="mode-2d"
      >
        Modo ligero
      </button>
    </div>
  </div>

  {#if !webgl}
    <p class="game-experience__note">
      Tu navegador no soporta WebGL. Estás jugando en modo ligero; el taller 3D
      necesita un navegador con aceleración gráfica.
    </p>
  {/if}

  {#if mode === "3d" && webgl}
    <Game3D onLightMode={() => (mode = "2d")} />
  {:else}
    <CandleGame {productos} />
  {/if}
</div>

<style>
  .game-experience {
    display: grid;
    gap: 0.75rem;
  }

  .game-experience__bar {
    display: flex;
    flex-wrap: wrap;
    align-items: end;
    justify-content: space-between;
    gap: 0.75rem;
  }

  .game-experience__title {
    font-family: var(--font-display);
    font-size: var(--text-xl);
    color: var(--color-heading);
  }

  .game-experience__switch {
    display: inline-flex;
    padding: 0.2rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-full);
    background: var(--color-surface);
  }

  .game-experience__switch button {
    min-height: 34px;
    padding: 0.35rem 0.75rem;
    border: 0;
    border-radius: var(--radius-full);
    background: transparent;
    color: var(--color-text-muted);
    font-size: var(--text-xs);
    font-weight: 800;
  }

  .game-experience__switch button.active {
    background: var(--color-bg-elevated);
    color: var(--color-heading);
    box-shadow: var(--shadow-sm);
  }

  .game-experience__switch button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .game-experience__note {
    padding: 0.65rem 0.8rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-sage-soft);
    color: var(--color-sage);
    font-size: var(--text-sm);
  }
</style>
