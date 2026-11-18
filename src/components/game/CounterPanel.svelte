<script lang="ts">
  import type { GameState } from "@lib/game/game-state.svelte";
  import BriefTicket from "./BriefTicket.svelte";

  interface Props {
    game: GameState;
  }

  let { game }: Props = $props();
</script>

<div class="game-station-panel" data-testid="counter-panel">
  <p class="game-eyebrow">Mostrador</p>
  <h3 class="game-title">Escucha el pedido</h3>
  <p class="game-text">
    {game.brief.customer.nombre} te cuenta lo que busca poco a poco. Pulsa “Continuar”
    para escuchar cada detalle y luego crea la nota de diseño.
  </p>

  <BriefTicket {game} />
</div>
