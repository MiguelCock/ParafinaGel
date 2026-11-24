<script lang="ts">
  import { supplyCategoryLabels } from "@lib/game/data";
  import type { RecipeLine } from "@lib/game/types";

  interface Props {
    recipe: RecipeLine[];
  }

  let { recipe }: Props = $props();

  const groups = $derived.by(() => {
    const map = new Map<string, RecipeLine[]>();
    for (const line of recipe) {
      const list = map.get(line.categoria) ?? [];
      list.push(line);
      map.set(line.categoria, list);
    }
    return [...map.entries()];
  });
</script>

<div class="shopping-list" data-testid="shopping-list">
  {#each groups as [category, lines]}
    <div class="shopping-list__group">
      <p class="shopping-list__category">
        {supplyCategoryLabels[category] ?? category}
      </p>
      <ul>
        {#each lines as line (line.supplyId)}
          <li>
            <span class="shopping-list__name">
              {line.nombre}
              <small>{line.detalle}</small>
            </span>
            <strong>
              {line.cantidad}
              {line.unidad}
              {#if line.porConfirmar}
                <small>por confirmar</small>
              {/if}
            </strong>
          </li>
        {/each}
      </ul>
    </div>
  {/each}
</div>

<style>
  .shopping-list {
    display: grid;
    gap: 0.55rem;
  }

  .shopping-list__group {
    display: grid;
    gap: 0.2rem;
  }

  .shopping-list__category {
    color: var(--color-accent);
    font-size: 0.58rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .shopping-list ul {
    display: grid;
    gap: 0.25rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .shopping-list li {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.75rem;
    padding-bottom: 0.2rem;
    border-bottom: 1px dotted var(--color-border);
    font-size: 0.68rem;
  }

  .shopping-list__name {
    display: grid;
    color: var(--color-heading);
    font-weight: 700;
    line-height: 1.25;
  }

  .shopping-list__name small {
    color: var(--color-text-muted);
    font-size: 0.56rem;
    font-weight: 500;
  }

  .shopping-list strong {
    color: var(--color-heading);
    font-size: 0.65rem;
    white-space: nowrap;
  }

  .shopping-list strong small {
    display: block;
    color: var(--color-accent);
    font-size: 0.5rem;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-align: right;
    text-transform: uppercase;
  }
</style>
