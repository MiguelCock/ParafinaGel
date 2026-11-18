<script lang="ts">
  import type { GameState } from "@lib/game/game-state.svelte";

  interface Props {
    state: GameState;
  }

  let { state }: Props = $props();
</script>

<div class="game-station-panel" data-testid="counter-panel">
  <p class="game-eyebrow">Mostrador</p>
  <h3 class="game-title">Recibe el pedido</h3>
  <p class="game-text">
    {state.order.customer.nombre} ya sabe qué quiere. Revisa el ticket y empieza a
    preparar la vela.
  </p>

  <div class="game-note">
    Consejo: puedes mirar el ticket en cualquier momento. La estación activa
    está resaltada en el taller.
  </div>

  <button
    class="game-action game-primary"
    type="button"
    onclick={() => state.takeOrder()}
    data-testid="take-order"
  >
    Tomar pedido
  </button>
</div>
