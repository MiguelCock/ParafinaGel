<script lang="ts">
  import type { Game3DState } from "@lib/game3d/game-state.svelte";

  interface Props {
    state: Game3DState;
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
    class="game-action"
    type="button"
    onclick={() => state.takeOrder()}
    data-testid="take-order"
  >
    Tomar pedido
  </button>
</div>
