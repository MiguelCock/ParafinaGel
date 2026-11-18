<script lang="ts">
  import { orderTypeLabels } from "@lib/game/data";
  import type { GameState } from "@lib/game/game-state.svelte";

  interface Props {
    game: GameState;
  }

  let { game }: Props = $props();

  const brief = $derived(game.brief);
</script>

<details class="brief-summary" data-testid="brief-summary">
  <summary>
    <span class="brief-summary__stamp">
      {orderTypeLabels[brief.type]}
    </span>
    <span>Nota de {brief.customer.nombre}</span>
  </summary>

  <div class="brief-summary__body">
    <p>{brief.summary}</p>
    <dl>
      {#each brief.lines.flatMap((line) => line.notes) as note}
        <div>
          <dt>{note.label}</dt>
          <dd>{note.value}</dd>
        </div>
      {/each}
    </dl>
  </div>
</details>

<style>
  .brief-summary {
    border: 1px solid var(--color-border);
    border-radius: 0.6rem;
    background: var(--color-bg);
  }

  .brief-summary summary {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.5rem 0.6rem;
    color: var(--color-heading);
    font-size: var(--text-xs);
    font-weight: 800;
    cursor: pointer;
    list-style: none;
  }

  .brief-summary summary::-webkit-details-marker {
    display: none;
  }

  .brief-summary summary::after {
    content: "+";
    margin-left: auto;
    color: var(--color-text-muted);
    font-size: var(--text-base);
    line-height: 1;
  }

  .brief-summary[open] summary::after {
    content: "−";
  }

  .brief-summary__stamp {
    padding: 0.12rem 0.35rem;
    border: 1px solid var(--color-accent);
    border-radius: 0.2rem;
    color: var(--color-accent);
    font-size: 0.52rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .brief-summary__body {
    display: grid;
    gap: 0.4rem;
    padding: 0 0.6rem 0.6rem;
    border-top: 1px dashed var(--color-border);
    padding-top: 0.5rem;
    color: var(--color-text-muted);
    font-size: var(--text-xs);
    line-height: 1.45;
  }

  .brief-summary__body dl {
    display: grid;
    gap: 0.2rem;
  }

  .brief-summary__body dl > div {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
  }

  .brief-summary__body dt {
    color: var(--color-text-muted);
  }

  .brief-summary__body dd {
    color: var(--color-heading);
    font-weight: 700;
    text-align: right;
  }
</style>
