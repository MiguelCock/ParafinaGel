<script lang="ts">
  import { wickTypesById } from "@lib/game/data";
  import type { GameState } from "@lib/game/game-state.svelte";

  interface Props {
    game: GameState;
  }

  let { game }: Props = $props();

  const wick = $derived(game.wickInfo);
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
  const doble = $derived(game.design.wickId === "doble");
</script>

<div class="game-station-panel" data-testid="wick-panel">
  <p class="game-eyebrow">Colocar la mecha</p>
  <h3 class="game-title">Busca el centro</h3>
  <p class="game-text">
    Mueve la mecha con las flechas hasta el centro de la pieza. Cuanto más cerca
    quede, mejor será la combustión.
  </p>

  {#if wick}
    <div class="game-note">
      Mecha {wick.nombre.toLowerCase()} · {wick.diameterMin}–{wick.diameterMax} mm.
      {doble ? "La mecha doble se centra como una sola pieza." : wick.note}
    </div>
  {/if}

  <div class="wick-pad" aria-label="Mover la mecha">
    <span></span>
    <button
      class="wick-key"
      type="button"
      aria-label="Mover la mecha hacia arriba"
      onclick={() => game.moveWick(0, -4)}
      disabled={game.craft.wick.placed}
      data-testid="wick-up"
    >
      ↑
    </button>
    <span></span>
    <button
      class="wick-key"
      type="button"
      aria-label="Mover la mecha a la izquierda"
      onclick={() => game.moveWick(-4, 0)}
      disabled={game.craft.wick.placed}
      data-testid="wick-left"
    >
      ←
    </button>
    <span class="wick-pad__target" aria-hidden="true">◎</span>
    <button
      class="wick-key"
      type="button"
      aria-label="Mover la mecha a la derecha"
      onclick={() => game.moveWick(4, 0)}
      disabled={game.craft.wick.placed}
      data-testid="wick-right"
    >
      →
    </button>
    <span></span>
    <button
      class="wick-key"
      type="button"
      aria-label="Mover la mecha hacia abajo"
      onclick={() => game.moveWick(0, 4)}
      disabled={game.craft.wick.placed}
      data-testid="wick-down"
    >
      ↓
    </button>
    <span></span>
  </div>

  {#if game.craft.wick.placed}
    <p class="game-note" data-testid="wick-quality">
      Mecha colocada · {quality}. {wickTypesById[game.design.wickId ?? ""]
        ?.nombre ?? "Mecha"}.
    </p>
  {:else}
    <p class="game-text">
      Cuando esté lista, pulsa “Colocar mecha”. Aún podrás ajustarla antes de
      confirmar.
    </p>
  {/if}

  <button
    class="game-action"
    type="button"
    onclick={() => game.placeWick()}
    disabled={game.craft.wick.placed}
    data-testid="place-wick"
  >
    {game.craft.wick.placed ? "Mecha colocada" : "Colocar mecha"}
  </button>

  <button
    class="game-action game-primary"
    type="button"
    onclick={() => game.goCool()}
    disabled={!game.craft.wick.placed}
    data-testid="wick-continue"
  >
    Ir al curado
  </button>
</div>

<style>
  .wick-pad {
    display: grid;
    grid-template-columns: repeat(3, 3rem);
    justify-content: center;
    gap: 0.3rem;
  }

  .wick-key {
    display: grid;
    place-items: center;
    width: 3rem;
    height: 3rem;
    border: 1px solid var(--color-border-strong);
    border-radius: 0.7rem;
    background: var(--color-bg);
    color: var(--color-heading);
    font-size: var(--text-lg);
    transition:
      background-color var(--transition),
      border-color var(--transition);
  }

  .wick-key:hover:not(:disabled) {
    border-color: var(--color-accent);
    background: var(--color-accent-soft);
  }

  .wick-key:disabled {
    opacity: 0.4;
  }

  .wick-pad__target {
    display: grid;
    place-items: center;
    color: var(--color-accent);
    font-size: var(--text-xl);
    opacity: 0.7;
  }

  @media (prefers-reduced-motion: reduce) {
    .wick-key {
      transition: none;
    }
  }
</style>
