<script lang="ts">
  import { waxColors } from "@lib/game/data";

  interface Props {
    value: string | null;
    onSelect: (colorId: string) => void;
    label?: string;
  }

  let { value, onSelect, label = "Color" }: Props = $props();
</script>

<div class="color-dots" role="group" aria-label={label}>
  {#each waxColors as color}
    <button
      class="color-dot"
      class:selected={value === color.id}
      type="button"
      style={`--dot: ${color.hex}`}
      aria-label={color.nombre}
      aria-pressed={value === color.id}
      title={color.nombre}
      onclick={() => onSelect(color.id)}
    ></button>
  {/each}
</div>

<style>
  .color-dots {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
  }

  .color-dot {
    width: 2rem;
    height: 2rem;
    padding: 0;
    border: 1px solid rgba(42, 36, 30, 0.14);
    border-radius: 50%;
    background: var(--dot);
    box-shadow: inset 0 -2px 4px rgba(42, 36, 30, 0.12);
    transition:
      transform var(--transition),
      box-shadow var(--transition);
  }

  .color-dot:hover {
    transform: translateY(-1px) scale(1.06);
  }

  .color-dot.selected {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
    box-shadow:
      0 0 0 2px var(--color-bg-elevated),
      0 0 0 4px var(--color-accent);
  }

  @media (prefers-reduced-motion: reduce) {
    .color-dot {
      transition: none;
    }
  }
</style>
