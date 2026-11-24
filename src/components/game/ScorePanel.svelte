<script lang="ts">
  import type { GameState } from "@lib/game/game-state.svelte";
  import type { OrderType } from "@lib/game/types";
  import { buildSuppliesMessage } from "@lib/game/supplies";
  import { whatsappLink } from "@lib/whatsapp";
  import ShoppingList from "./ShoppingList.svelte";

  interface Props {
    game: GameState;
  }

  let { game }: Props = $props();

  const stylePhrase: Record<OrderType, string> = {
    clasico: "clásica",
    capas: "en capas",
    figura: "de figura",
    gel: "de gel",
  };

  const score = $derived(game.score);
  const recipe = $derived(game.recipe);
  const message = $derived(
    whatsappLink(buildSuppliesMessage(game.design, recipe)),
  );
  const recipeOnly = $derived(!score);
  const gel = $derived(game.design.mode === "gel");
</script>

<div class="game-station-panel receipt" data-testid="score-panel">
  <span class="receipt__stamp" aria-hidden="true">
    {recipeOnly ? "Receta" : "Listo"}
  </span>

  <p class="game-eyebrow">
    {game.mode === "sandbox"
      ? "Modo libre"
      : recipeOnly
        ? "Tu receta"
        : "Pedido entregado"}
  </p>
  <h3 class="game-title">
    {#if recipeOnly}
      Tu receta está lista
    {:else if game.mode === "sandbox"}
      Tu vela quedó lista
    {:else}
      ¡Gracias, {game.brief.customer.nombre}!
    {/if}
  </h3>
  <p class="game-text">
    {recipeOnly
      ? "Este es el diseño que armaste. Con la receta puedes prepararlo en casa o pedir los insumos."
      : `Una vela ${stylePhrase[game.design.mode]} con tu receta. Esta es la lista de materiales para hacerla.`}
  </p>

  {#if score}
    <div class="score-hero">
      <p class="score-hero__number">
        {Math.round(score.total)}<span>/100</span>
      </p>
      <div
        class="game-stars"
        role="img"
        aria-label={`${score.stars} de 5 estrellas`}
      >
        {#each Array.from({ length: 5 }) as _, index}
          <span
            class:game-star--filled={index < score.stars}
            aria-hidden="true"
          >
            ★
          </span>
        {/each}
      </div>
      <span class="score-hero__points">+{score.points} pts</span>
    </div>

    <div class="score-groups">
      <div class="score-group">
        <p class="score-group__title">
          Diseño <strong>{Math.round(score.design.total)}/60</strong>
        </p>
        <div class="game-breakdown">
          <div>
            <span>Tipo</span><strong>{Math.round(score.design.type)}</strong>
          </div>
          <div>
            <span>Cera</span><strong>{Math.round(score.design.wax)}</strong>
          </div>
          <div>
            <span>Forma</span><strong>{Math.round(score.design.vessel)}</strong>
          </div>
          <div>
            <span>Aroma</span><strong>{Math.round(score.design.scent)}</strong>
          </div>
          <div>
            <span>Color</span><strong>{Math.round(score.design.colors)}</strong>
          </div>
          <div>
            <span>Mecha</span><strong>{Math.round(score.design.wick)}</strong>
          </div>
          <div>
            <span>Etiqueta</span><strong>
              {Math.round(score.design.label)}
            </strong>
          </div>
        </div>
      </div>

      <div class="score-group">
        <p class="score-group__title">
          Taller <strong>{Math.round(score.execution.total)}/40</strong>
        </p>
        <div class="game-breakdown">
          <div>
            <span>Temperatura</span>
            <strong>{Math.round(score.execution.temperature)}</strong>
          </div>
          <div>
            <span>Preparación</span>
            <strong>{Math.round(score.execution.prep)}</strong>
          </div>
          <div>
            <span>Vertido</span><strong>
              {Math.round(score.execution.pour)}
            </strong>
          </div>
          <div>
            <span>Mezcla</span><strong>
              {Math.round(score.execution.mix)}
            </strong>
          </div>
          <div>
            <span>Derrame</span><strong>
              {Math.round(score.execution.spill)}
            </strong>
          </div>
          <div>
            <span>Mecha</span><strong>
              {Math.round(score.execution.wick)}
            </strong>
          </div>
          <div>
            <span>Etiqueta</span><strong>
              {Math.round(score.execution.label)}
            </strong>
          </div>
          <div>
            <span>Corte de mecha</span><strong>
              {Math.round(score.execution.trim)}
            </strong>
          </div>
          {#if gel}
            <div>
              <span>Burbujas</span><strong>
                {Math.round(score.execution.gel)}
              </strong>
            </div>
          {/if}
        </div>
      </div>
    </div>
  {/if}

  <a
    class="score-whatsapp"
    href={message}
    target="_blank"
    rel="noopener noreferrer"
    data-testid="order-supplies"
  >
    Pedir insumos por WhatsApp
  </a>

  <p class="recipe__note">
    Lista de ejemplo con cantidades aproximadas. El catálogo real de insumos y
    precios se está preparando.
  </p>

  <section class="recipe">
    <div class="recipe__head">
      <h4>Receta e insumos</h4>
      <span>{recipe.length} materiales</span>
    </div>
    <ShoppingList {recipe} />
  </section>

  <div class="score-actions">
    {#if game.mode === "sandbox"}
      <button
        class="game-action game-primary"
        type="button"
        onclick={() => game.backToDesign()}
        data-testid="back-to-design"
      >
        Volver a diseñar
      </button>
      <button
        class="game-action game-action--secondary"
        type="button"
        onclick={() => game.exitSandbox()}
        data-testid="leave-sandbox"
      >
        Salir del modo libre
      </button>
    {:else}
      <button
        class="game-action game-primary"
        type="button"
        onclick={() => game.next()}
        data-testid="next-customer"
      >
        {game.isLastBrief ? "Terminar el día" : "Siguiente cliente"}
      </button>
      <a class="game-action game-action--secondary" href="/productos/">
        Ver insumos
      </a>
    {/if}
  </div>
</div>

<style>
  .receipt {
    position: relative;
    padding: 1rem;
    border: 1px solid var(--color-border);
    border-radius: 0.35rem;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.5), transparent 40%),
      var(--color-bg-elevated);
    box-shadow:
      0 1px 0 rgba(42, 36, 30, 0.05),
      0 14px 26px -24px rgba(42, 36, 30, 0.6);
  }

  .receipt::after {
    content: "";
    position: absolute;
    right: 0;
    bottom: -1px;
    left: 0;
    height: 8px;
    background-image: radial-gradient(
      circle at 5px 0,
      transparent 5px,
      var(--color-bg-elevated) 5.5px
    );
    background-size: 10px 10px;
    background-repeat: repeat-x;
    pointer-events: none;
  }

  .receipt__stamp {
    position: absolute;
    top: 0.75rem;
    right: 0.8rem;
    padding: 0.18rem 0.45rem;
    border: 2px solid var(--color-sage);
    border-radius: 0.25rem;
    color: var(--color-sage);
    font-size: 0.55rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    opacity: 0.7;
    transform: rotate(-7deg);
  }

  .score-hero {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    padding: 0.4rem 0;
    border-block: 1px dashed var(--color-border-strong);
  }

  .score-hero__number {
    color: var(--color-heading);
    font-family: var(--font-display);
    font-size: 2.6rem;
    font-weight: 600;
    line-height: 0.9;
  }

  .score-hero__number span {
    color: var(--color-text-muted);
    font-family: var(--font-body);
    font-size: var(--text-sm);
    font-weight: 700;
  }

  .score-hero__points {
    margin-left: auto;
    padding: 0.2rem 0.5rem;
    border-radius: 999px;
    background: var(--color-sage-soft);
    color: var(--color-sage);
    font-size: 0.65rem;
    font-weight: 800;
  }

  .score-groups {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.7rem;
  }

  .score-group {
    display: grid;
    gap: 0.3rem;
    padding: 0.55rem;
    border: 1px solid var(--color-border);
    border-radius: 0.65rem;
    background: var(--color-bg);
  }

  .score-group__title {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
    color: var(--color-text-muted);
    font-size: 0.6rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .score-group__title strong {
    color: var(--color-heading);
  }

  .score-group .game-breakdown {
    font-size: 0.65rem;
  }

  .recipe {
    display: grid;
    gap: 0.5rem;
    padding-top: 0.6rem;
    border-top: 2px dashed var(--color-border-strong);
  }

  .recipe__head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .recipe__head h4 {
    font-family: var(--font-display);
    font-size: var(--text-lg);
  }

  .recipe__head span {
    color: var(--color-text-muted);
    font-size: 0.6rem;
    font-weight: 700;
  }

  .recipe__note {
    color: var(--color-text-muted);
    font-size: 0.58rem;
    line-height: 1.4;
    text-align: center;
  }

  .score-whatsapp {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 48px;
    padding: 0.65rem 1rem;
    border-radius: var(--radius-full);
    background: var(--color-whatsapp);
    color: var(--color-on-whatsapp);
    font-size: var(--text-sm);
    font-weight: 800;
    text-decoration: none;
    box-shadow: 0 12px 24px -16px var(--color-whatsapp);
  }

  .score-whatsapp:hover {
    background: var(--color-whatsapp-hover);
  }

  .score-actions {
    display: grid;
    gap: 0.45rem;
  }

  @media (max-width: 520px) {
    .receipt__stamp {
      display: none;
    }

    .score-groups {
      grid-template-columns: 1fr;
    }
  }
</style>
