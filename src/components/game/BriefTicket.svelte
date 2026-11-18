<script lang="ts">
  import { orderTypeLabels } from "@lib/game/data";
  import type { GameState } from "@lib/game/game-state.svelte";
  import CustomerPortrait from "./CustomerPortrait.svelte";

  interface Props {
    game: GameState;
  }

  let { game }: Props = $props();

  const brief = $derived(game.brief);
  const visibleLines = $derived(brief.lines.slice(0, game.revealed));
  const notes = $derived(visibleLines.flatMap((line) => line.notes));
  const complete = $derived(game.revealed >= brief.lines.length);
</script>

<article class="ticket" data-testid="brief-ticket">
  <span class="ticket__tape" aria-hidden="true"></span>
  <span class="ticket__stamp" aria-hidden="true">
    {orderTypeLabels[brief.type]}
  </span>

  <header class="ticket__header">
    <CustomerPortrait customer={brief.customer} size="sm" />
    <div>
      <p class="ticket__eyebrow">Pedido de diseño</p>
      <h3>{brief.customer.nombre}</h3>
      <p class="ticket__greeting">“{brief.customer.saludo}”</p>
    </div>
  </header>

  <div class="ticket__dialogue" aria-live="polite">
    {#each visibleLines as line, index}
      <p class="ticket__line" class:latest={index === visibleLines.length - 1}>
        {line.text}
      </p>
    {/each}
  </div>

  <dl class="ticket__specs">
    {#each notes as note}
      <div>
        <dt>{note.label}</dt>
        <dd>{note.value}</dd>
      </div>
    {/each}
    {#if notes.length === 0}
      <div class="ticket__empty">
        <dt>Detalles</dt>
        <dd>Escucha al cliente…</dd>
      </div>
    {/if}
  </dl>

  <div class="ticket__progress">
    <span>
      {visibleLines.length} de {brief.lines.length} detalles
    </span>
    <span class="ticket__dots" aria-hidden="true">
      {#each brief.lines as _, index}
        <i class:on={index < game.revealed}></i>
      {/each}
    </span>
  </div>

  {#if !game.noted}
    <div class="ticket__actions">
      {#if complete}
        <button
          class="game-action game-primary"
          type="button"
          onclick={() => game.createNote()}
          data-testid="create-note"
        >
          Crear nota
        </button>
      {:else}
        <button
          class="game-action game-primary"
          type="button"
          onclick={() => game.revealNext()}
          data-testid="reveal-next"
        >
          Continuar
        </button>
        <button
          class="game-action game-action--secondary game-action--small"
          type="button"
          onclick={() => game.revealAll()}
          data-testid="reveal-all"
        >
          Mostrar todo
        </button>
      {/if}
    </div>
  {:else}
    <p class="ticket__done">Nota creada · lista para diseñar</p>
  {/if}
</article>

<style>
  .ticket {
    position: relative;
    display: grid;
    gap: 0.65rem;
    padding: 1rem 0.9rem 0.9rem;
    border: 1px solid var(--color-border);
    border-radius: 0.3rem;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.5), transparent 45%),
      var(--color-bg-elevated);
    box-shadow:
      0 1px 0 rgba(42, 36, 30, 0.05),
      0 12px 22px -20px rgba(42, 36, 30, 0.5);
  }

  .ticket::after {
    content: "";
    position: absolute;
    right: 0;
    bottom: -1px;
    left: 0;
    height: 6px;
    background-image: radial-gradient(
      circle at 4px 0,
      transparent 4px,
      var(--color-bg-elevated) 4.5px
    );
    background-size: 8px 8px;
    background-repeat: repeat-x;
    pointer-events: none;
  }

  .ticket__tape {
    position: absolute;
    top: -0.4rem;
    left: 50%;
    width: 3.5rem;
    height: 0.9rem;
    background: rgba(228, 216, 202, 0.75);
    transform: translateX(-50%) rotate(-2deg);
    box-shadow: 0 1px 2px rgba(42, 36, 30, 0.08);
  }

  .ticket__stamp {
    position: absolute;
    top: 0.55rem;
    right: 0.6rem;
    padding: 0.15rem 0.4rem;
    border: 1px solid var(--color-accent);
    border-radius: 0.2rem;
    color: var(--color-accent);
    font-size: 0.55rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    opacity: 0.75;
    transform: rotate(-6deg);
  }

  .ticket__header {
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
    padding-right: 3.4rem;
  }

  .ticket__eyebrow {
    color: var(--color-accent);
    font-size: 0.62rem;
    font-weight: 800;
    letter-spacing: 0.13em;
    text-transform: uppercase;
  }

  .ticket__header h3 {
    font-family: var(--font-display);
    font-size: var(--text-xl);
    line-height: 1.05;
  }

  .ticket__greeting {
    margin-top: 0.2rem;
    color: var(--color-text-muted);
    font-size: 0.68rem;
    line-height: 1.35;
  }

  .ticket__dialogue {
    display: grid;
    gap: 0.4rem;
  }

  .ticket__line {
    position: relative;
    padding: 0.45rem 0.6rem;
    border-radius: 0.2rem 0.7rem 0.7rem 0.7rem;
    background: var(--color-surface);
    color: var(--color-text);
    font-family: var(--font-display);
    font-size: var(--text-base);
    line-height: 1.35;
  }

  .ticket__line.latest {
    background: var(--color-accent-soft);
    color: var(--color-heading);
  }

  .ticket__specs {
    display: grid;
    gap: 0.25rem;
    padding-top: 0.55rem;
    border-top: 1px dashed var(--color-border-strong);
    font-size: 0.7rem;
  }

  .ticket__specs > div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
  }

  .ticket__specs dt {
    color: var(--color-text-muted);
  }

  .ticket__specs dd {
    color: var(--color-heading);
    font-weight: 800;
    text-align: right;
  }

  .ticket__empty dd {
    color: var(--color-text-muted);
    font-weight: 600;
    font-style: italic;
  }

  .ticket__progress {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    color: var(--color-text-muted);
    font-size: 0.6rem;
    font-weight: 700;
  }

  .ticket__dots {
    display: flex;
    gap: 0.2rem;
  }

  .ticket__dots i {
    width: 0.45rem;
    height: 0.45rem;
    border-radius: 50%;
    background: var(--color-surface-strong);
  }

  .ticket__dots i.on {
    background: var(--color-accent);
  }

  .ticket__actions {
    display: grid;
    gap: 0.4rem;
  }

  .ticket__done {
    padding: 0.3rem 0.55rem;
    border-radius: 999px;
    background: var(--color-sage-soft);
    color: var(--color-sage);
    font-size: 0.62rem;
    font-weight: 800;
    text-align: center;
  }

  @media (max-width: 520px) {
    .ticket__stamp {
      display: none;
    }

    .ticket__header {
      padding-right: 0;
    }
  }
</style>
