<script lang="ts">
  import { formatCOP } from "@lib/format";
  import {
    inclusions,
    labels,
    molds,
    recommendedWickTypes,
    scents,
    vessels,
    waxColors,
    waxes,
    wickTypes,
  } from "@lib/game/data";
  import type { GameState } from "@lib/game/game-state.svelte";
  import type { WaxId } from "@lib/game/types";
  import AccessibleMaterialPicker from "./AccessibleMaterialPicker.svelte";
  import CandlePreview from "./CandlePreview.svelte";

  interface Props {
    game: GameState;
  }

  let { game }: Props = $props();

  type ShelfCategory =
    | "wax"
    | "vessel"
    | "mold"
    | "wick"
    | "scent"
    | "color"
    | "label"
    | "inclusion";

  let activeCategory = $state<ShelfCategory>("wax");
  let activeLayer = $state(0);
  let activePart = $state<string | null>(null);
  let dragged = $state<{ category: ShelfCategory; id: string } | null>(null);

  const requiredUse = $derived(
    game.design.mode === "figura"
      ? "mold"
      : game.design.mode === "gel"
        ? "gel"
        : "container",
  );
  const vessel = $derived(
    game.design.vesselId
      ? (vessels.find((item) => item.id === game.design.vesselId) ?? null)
      : null,
  );
  const recommended = $derived(
    vessel ? recommendedWickTypes(vessel.diameterMm) : wickTypes,
  );
  const mold = $derived(
    game.design.moldId
      ? (molds.find((item) => item.id === game.design.moldId) ?? null)
      : null,
  );
  const moldParts = $derived(mold?.parts ?? []);
  const currentLayer = $derived(
    Math.min(activeLayer, Math.max(0, game.design.layers.length - 1)),
  );
  const currentPart = $derived(
    activePart && moldParts.some((part) => part.id === activePart)
      ? activePart
      : (moldParts[0]?.id ?? null),
  );

  const categories = $derived.by(() => {
    const list: { id: ShelfCategory; label: string }[] = [
      { id: "wax", label: "Ceras" },
    ];
    if (game.design.mode === "figura") {
      list.push({ id: "mold", label: "Moldes" });
    } else {
      list.push({ id: "vessel", label: "Envases" });
    }
    list.push(
      { id: "wick", label: "Pabilos" },
      { id: "scent", label: "Aromas" },
    );
    if (game.design.mode === "gel") {
      list.push({ id: "inclusion", label: "Montajes" });
    } else {
      list.push({ id: "color", label: "Colores" });
    }
    list.push({ id: "label", label: "Etiquetas" });
    return list;
  });
  const visibleCategory = $derived(
    categories.some((category) => category.id === activeCategory)
      ? activeCategory
      : (categories[0]?.id ?? "wax"),
  );
  const shelfLabel = $derived(
    categories.find((category) => category.id === visibleCategory)?.label ??
      "Materiales",
  );

  function waxDisabled(id: string): boolean {
    const wax = waxes.find((item) => item.id === id);
    return !wax || !wax.use.includes(requiredUse);
  }

  function vesselDisabled(id: string): boolean {
    const item = vessels.find((entry) => entry.id === id);
    return !item || (game.design.mode === "gel" && !item.transparent);
  }

  function wickDisabled(id: string): boolean {
    return Boolean(vessel) && !recommended.some((wick) => wick.id === id);
  }

  function colorName(id: string): string {
    return waxColors.find((color) => color.id === id)?.nombre ?? "Natural";
  }

  function waxFormatLabel(
    format: "block" | "flakes" | "gel",
    priceUnit: "kg" | "pote",
  ): string {
    if (priceUnit === "pote") return "Pote 700 g";
    if (format === "block") return "Bloque";
    if (format === "flakes") return "Escamas";
    return "Gel";
  }

  function activeColor(): string | null {
    if (game.design.mode === "figura") {
      return currentPart
        ? (game.design.figureColors[currentPart] ?? "natural")
        : null;
    }
    return game.design.layers[currentLayer]?.colorId ?? null;
  }

  function isSelected(category: ShelfCategory, id: string): boolean {
    switch (category) {
      case "wax":
        return game.design.waxId === id;
      case "vessel":
        return game.design.vesselId === id;
      case "mold":
        return game.design.moldId === id;
      case "wick":
        return game.design.wickId === id;
      case "scent":
        return game.design.scentIds.includes(id);
      case "label":
        return game.design.labelId === id;
      case "inclusion":
        return game.design.inclusions.includes(id);
      case "color":
        return activeColor() === id;
    }
  }

  function apply(category: ShelfCategory, id: string): void {
    switch (category) {
      case "wax":
        if (!waxDisabled(id)) game.selectWax(id as WaxId);
        break;
      case "vessel":
        if (!vesselDisabled(id)) game.selectVessel(id);
        break;
      case "mold":
        game.selectMold(id);
        break;
      case "wick":
        if (!wickDisabled(id)) game.selectWick(id);
        break;
      case "scent":
        game.selectScent(id);
        break;
      case "label":
        game.selectLabel(id);
        break;
      case "inclusion":
        game.toggleInclusion(id);
        break;
      case "color":
        if (game.design.mode === "figura" && currentPart) {
          game.setFigureColor(currentPart, id);
        } else {
          game.setLayerColor(currentLayer, id);
        }
        break;
    }
  }

  function onDragStart(
    event: DragEvent,
    category: ShelfCategory,
    id: string,
  ): void {
    dragged = { category, id };
    event.dataTransfer?.setData("text/plain", `${category}:${id}`);
    if (event.dataTransfer) event.dataTransfer.effectAllowed = "copy";
  }

  function onDrop(event: DragEvent): void {
    event.preventDefault();
    if (!dragged) return;
    apply(dragged.category, dragged.id);
    dragged = null;
  }
</script>

<div class="materials" data-testid="material-shelf">
  <div
    class="workbench"
    class:workbench--dragging={dragged !== null}
    role="region"
    aria-label="Mesa de trabajo de materiales"
    data-testid="material-dropzone"
    ondragover={(event) => event.preventDefault()}
    ondrop={onDrop}
    ondragend={() => (dragged = null)}
  >
    {#if dragged}
      <span class="workbench__drop">Suelta para aplicar</span>
    {/if}
    <div class="workbench__preview">
      <CandlePreview design={game.design} compact />
    </div>
    <div>
      <p class="materials__eyebrow">Mesa de trabajo</p>
      <p class="materials__hint">
        Arrastra un objeto aquí o toca un material para aplicarlo.
      </p>
      <p class="materials__selection">
        {game.design.waxId
          ? (waxes.find((wax) => wax.id === game.design.waxId)?.nombre ?? "")
          : "Sin cera"}
        {#if game.design.wickId}
          · {wickTypes.find((wick) => wick.id === game.design.wickId)?.nombre}
        {/if}
        {#if game.design.scentIds.length > 0}
          · {game.design.scentIds
            .map((id) => scents.find((scent) => scent.id === id)?.nombre)
            .filter(Boolean)
            .join(" + ")}
        {/if}
      </p>
    </div>
  </div>

  <div
    class="materials__tabs"
    role="group"
    aria-label="Categorías de materiales"
  >
    {#each categories as category}
      <button
        class="materials__tab"
        class:active={visibleCategory === category.id}
        type="button"
        aria-pressed={visibleCategory === category.id}
        onclick={() => (activeCategory = category.id)}
        data-testid={`material-tab-${category.id}`}
      >
        {category.label}
      </button>
    {/each}
  </div>

  {#if visibleCategory === "color" && game.design.mode === "figura"}
    <div class="materials__targets">
      {#each moldParts as part}
        <button
          class="materials__target"
          class:active={currentPart === part.id}
          type="button"
          onclick={() => (activePart = part.id)}
          data-testid={`material-part-${part.id}`}
        >
          {part.nombre}
        </button>
      {/each}
    </div>
  {:else if visibleCategory === "color" && game.design.layers.length > 1}
    <div class="materials__targets">
      {#each game.design.layers as layer, index}
        <button
          class="materials__target"
          class:active={currentLayer === index}
          type="button"
          onclick={() => (activeLayer = index)}
          data-testid={`material-layer-${index}`}
        >
          Capa {index + 1}
        </button>
      {/each}
    </div>
  {/if}

  <div
    class="materials__shelf"
    role="group"
    aria-label={`Estantería de ${shelfLabel}`}
    data-testid="material-shelf-rack"
  >
    <div class="materials__shelf-head">
      <span class="materials__shelf-title">{shelfLabel}</span>
      <span class="materials__shelf-note">Toca o arrastra a la mesa</span>
    </div>
    {#if visibleCategory === "wax"}
      <div class="materials__grid">
        {#each waxes as wax}
          <button
            class="shelf-object"
            class:selected={isSelected("wax", wax.id)}
            class:disabled={waxDisabled(wax.id)}
            type="button"
            draggable={!waxDisabled(wax.id)}
            onclick={() => apply("wax", wax.id)}
            ondragstart={(event) => onDragStart(event, "wax", wax.id)}
            aria-pressed={isSelected("wax", wax.id)}
            disabled={waxDisabled(wax.id)}
            data-testid={`material-wax-${wax.id}`}
          >
            <span
              class="shelf-object__visual object-wax object-wax--{wax.format}"
              class:object-wax--pote={wax.priceUnit === "pote"}
              style={`--object-color: ${wax.hex}`}
              aria-hidden="true"
            ></span>
            <span class="shelf-object__body">
              <strong>{wax.nombre}</strong>
              <span class="shelf-object__tag">
                {waxFormatLabel(wax.format, wax.priceUnit)}
              </span>
              <span>
                {formatCOP(wax.price)}
                / {wax.priceUnit === "pote" ? "pote 700 g" : "kg"}
              </span>
              {#if waxDisabled(wax.id)}
                <em>No compatible con este tipo</em>
              {/if}
            </span>
          </button>
        {/each}
      </div>
    {:else if visibleCategory === "vessel"}
      <div class="materials__grid">
        {#each vessels as item}
          <button
            class="shelf-object"
            class:selected={isSelected("vessel", item.id)}
            class:disabled={vesselDisabled(item.id)}
            type="button"
            draggable={!vesselDisabled(item.id)}
            onclick={() => apply("vessel", item.id)}
            ondragstart={(event) => onDragStart(event, "vessel", item.id)}
            aria-pressed={isSelected("vessel", item.id)}
            disabled={vesselDisabled(item.id)}
            data-testid={`material-vessel-${item.id}`}
          >
            <span
              class="shelf-object__visual object-vessel object-vessel--{item.material}"
              class:object-vessel--transparent={item.transparent}
              style={`--object-color: ${item.glass}`}
              aria-hidden="true"
            ></span>
            <span class="shelf-object__body">
              <strong>{item.nombre}</strong>
              <span>{item.diameterMm} mm · {item.capacityG} g</span>
              {#if vesselDisabled(item.id)}
                <em>No compatible con gel</em>
              {/if}
            </span>
          </button>
        {/each}
      </div>
    {:else if visibleCategory === "mold"}
      <div class="materials__grid">
        {#each molds as item}
          <button
            class="shelf-object"
            class:selected={isSelected("mold", item.id)}
            type="button"
            draggable="true"
            onclick={() => apply("mold", item.id)}
            ondragstart={(event) => onDragStart(event, "mold", item.id)}
            aria-pressed={isSelected("mold", item.id)}
            data-testid={`material-mold-${item.id}`}
          >
            <span
              class="shelf-object__visual object-mold object-mold--{item.id}"
              aria-hidden="true"
            ></span>
            <span class="shelf-object__body">
              <strong>{item.nombre}</strong>
              <span>{item.descripcion}</span>
            </span>
          </button>
        {/each}
      </div>
    {:else if visibleCategory === "wick"}
      <div class="materials__grid">
        {#each wickTypes as wick}
          <button
            class="shelf-object"
            class:selected={isSelected("wick", wick.id)}
            class:disabled={wickDisabled(wick.id)}
            type="button"
            draggable={!wickDisabled(wick.id)}
            onclick={() => apply("wick", wick.id)}
            ondragstart={(event) => onDragStart(event, "wick", wick.id)}
            aria-pressed={isSelected("wick", wick.id)}
            disabled={wickDisabled(wick.id)}
            data-testid={`material-wick-${wick.id}`}
          >
            <span
              class="shelf-object__visual object-wick object-wick--{wick.id}"
              aria-hidden="true"
            ></span>
            <span class="shelf-object__body">
              <strong>{wick.nombre}</strong>
              <span>{formatCOP(wick.price)} / unidad</span>
              {#if wickDisabled(wick.id)}
                <em>No coincide con el diámetro</em>
              {/if}
            </span>
          </button>
        {/each}
      </div>
      <div class="shelf-tools">
        <div class="shelf-tool">
          <span class="shelf-tool__visual object-porta" aria-hidden="true"
          ></span>
          <span>
            <strong>Porta pabilo</strong>
            <small>Base metálica</small>
          </span>
        </div>
        <div class="shelf-tool">
          <span class="shelf-tool__visual object-centrador" aria-hidden="true"
          ></span>
          <span>
            <strong>Centrador</strong>
            <small>Se retira al curar</small>
          </span>
        </div>
      </div>
    {:else if visibleCategory === "scent"}
      <div class="materials__grid">
        {#each scents as scent}
          <button
            class="shelf-object"
            class:selected={isSelected("scent", scent.id)}
            type="button"
            draggable="true"
            onclick={() => apply("scent", scent.id)}
            ondragstart={(event) => onDragStart(event, "scent", scent.id)}
            aria-pressed={isSelected("scent", scent.id)}
            data-testid={`material-scent-${scent.id}`}
          >
            <span
              class="shelf-object__visual object-bottle object-bottle--aroma"
              style="--object-color: #d9c4ae"
              aria-hidden="true"
            ></span>
            <span class="shelf-object__body">
              <strong>{scent.nombre}</strong>
              <span>{scent.familia} · {scent.notas}</span>
            </span>
          </button>
        {/each}
      </div>
    {:else if visibleCategory === "color"}
      <div class="materials__grid">
        {#each waxColors as color}
          <button
            class="shelf-object"
            class:selected={isSelected("color", color.id)}
            type="button"
            draggable="true"
            onclick={() => apply("color", color.id)}
            ondragstart={(event) => onDragStart(event, "color", color.id)}
            aria-pressed={isSelected("color", color.id)}
            data-testid={`material-color-${color.id}`}
          >
            <span
              class="shelf-object__visual object-bottle object-bottle--color"
              style={`--object-color: ${color.hex}`}
              aria-hidden="true"
            ></span>
            <span class="shelf-object__body">
              <strong>{color.nombre}</strong>
              <span>{colorName(color.id)}</span>
            </span>
          </button>
        {/each}
      </div>
    {:else if visibleCategory === "label"}
      <div class="materials__grid">
        {#each labels as label}
          <button
            class="shelf-object"
            class:selected={isSelected("label", label.id)}
            type="button"
            draggable="true"
            onclick={() => apply("label", label.id)}
            ondragstart={(event) => onDragStart(event, "label", label.id)}
            aria-pressed={isSelected("label", label.id)}
            data-testid={`material-label-${label.id}`}
          >
            <span
              class="shelf-object__visual object-label"
              style={`--object-color: ${label.color}; --object-accent: ${label.accent}`}
              aria-hidden="true"
            ></span>
            <span class="shelf-object__body">
              <strong>{label.nombre}</strong>
              <span>Etiqueta para el acabado</span>
            </span>
          </button>
        {/each}
      </div>
    {:else}
      <div class="materials__grid">
        {#each inclusions as inclusion}
          <button
            class="shelf-object"
            class:selected={isSelected("inclusion", inclusion.id)}
            type="button"
            draggable="true"
            onclick={() => apply("inclusion", inclusion.id)}
            ondragstart={(event) =>
              onDragStart(event, "inclusion", inclusion.id)}
            aria-pressed={isSelected("inclusion", inclusion.id)}
            data-testid={`material-inclusion-${inclusion.id}`}
          >
            <span
              class="shelf-object__visual object-inclusion"
              style={`--object-color: ${inclusion.color}`}
              aria-hidden="true"
            ></span>
            <span class="shelf-object__body">
              <strong>{inclusion.nombre}</strong>
              <span>Montaje para gel</span>
            </span>
          </button>
        {/each}
      </div>
    {/if}
  </div>

  <AccessibleMaterialPicker {game} />
</div>

<style>
  .materials {
    display: grid;
    gap: 0.55rem;
    padding-top: 0.6rem;
    border-top: 1px dashed var(--color-border);
  }

  .workbench {
    position: relative;
    display: grid;
    grid-template-columns: 5rem minmax(0, 1fr);
    gap: 0.65rem;
    align-items: center;
    min-height: 6rem;
    padding: 0.55rem;
    border: 1px dashed var(--color-accent);
    border-radius: 0.75rem;
    background: var(--color-accent-soft);
    transition:
      border-color var(--motion-fast, 160ms) var(--motion-ease, ease),
      background-color var(--motion-fast, 160ms) var(--motion-ease, ease),
      box-shadow var(--motion-fast, 160ms) var(--motion-ease, ease);
  }

  .workbench--dragging {
    border-style: solid;
    background: color-mix(
      in srgb,
      var(--color-accent-soft) 78%,
      var(--color-bg-elevated)
    );
    box-shadow:
      inset 0 0 0 1px var(--color-accent),
      0 12px 24px -20px var(--color-accent);
  }

  .workbench__drop {
    position: absolute;
    top: 0.35rem;
    right: 0.45rem;
    padding: 0.12rem 0.4rem;
    border-radius: 999px;
    background: var(--color-accent);
    color: var(--color-on-accent);
    font-size: 0.52rem;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .workbench__preview {
    display: grid;
    place-items: center;
    height: 5rem;
    overflow: hidden;
  }

  .workbench__preview :global(.candle-preview) {
    max-height: 5rem;
    width: auto;
  }

  .materials__eyebrow {
    color: var(--color-accent-strong);
    font-size: 0.62rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .materials__hint {
    margin-top: 0.15rem;
    color: var(--color-heading);
    font-size: 0.68rem;
    line-height: 1.35;
  }

  .materials__selection {
    margin-top: 0.3rem;
    color: var(--color-heading);
    font-size: 0.68rem;
    font-weight: 800;
    line-height: 1.35;
  }

  .materials__tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .materials__tab,
  .materials__target {
    min-height: 2rem;
    padding: 0.3rem 0.55rem;
    border: 1px solid var(--color-border);
    border-radius: 999px;
    background: var(--color-bg);
    color: var(--color-text-muted);
    font-size: 0.62rem;
    font-weight: 800;
  }

  .materials__tab.active,
  .materials__target.active {
    border-color: var(--color-accent);
    background: var(--color-accent-soft);
    color: var(--color-accent-strong);
  }

  .materials__targets {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .materials__shelf {
    position: relative;
    display: grid;
    gap: 0.4rem;
    padding: 0.45rem 0.4rem 0.65rem;
    border: 1px solid var(--color-border);
    border-radius: 0.8rem;
    background:
      linear-gradient(
        180deg,
        color-mix(in srgb, var(--color-bg-elevated) 88%, transparent),
        color-mix(in srgb, var(--color-surface) 72%, transparent)
      ),
      repeating-linear-gradient(
        180deg,
        transparent 0 3.6rem,
        color-mix(in srgb, var(--color-border) 28%, transparent) 3.6rem 3.7rem
      );
    box-shadow:
      inset 0 8px 18px color-mix(in srgb, var(--color-heading) 5%, transparent),
      inset 0 -10px 18px
        color-mix(in srgb, var(--color-heading) 7%, transparent),
      0 14px 24px -22px var(--color-heading);
  }

  .materials__shelf::before,
  .materials__shelf::after {
    content: "";
    position: absolute;
    right: 0.55rem;
    left: 0.55rem;
    height: 0.35rem;
    border-radius: 999px;
    pointer-events: none;
  }

  .materials__shelf::before {
    top: 0.15rem;
    background: linear-gradient(
      180deg,
      var(--color-bg-elevated),
      color-mix(in srgb, var(--color-border) 55%, transparent)
    );
  }

  .materials__shelf::after {
    bottom: 0.15rem;
    background: color-mix(in srgb, var(--color-heading) 8%, transparent);
    filter: blur(2px);
  }

  .materials__shelf-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.1rem 0.15rem 0;
  }

  .materials__shelf-title {
    color: var(--color-heading);
    font-family: var(--font-display);
    font-size: 0.82rem;
    font-weight: 600;
  }

  .materials__shelf-note {
    color: var(--color-text-muted);
    font-size: 0.52rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .materials__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.35rem;
    max-height: 18rem;
    overflow-y: auto;
    padding: 0.1rem 0.15rem 0.15rem 0.1rem;
    scrollbar-gutter: stable;
  }

  .shelf-object {
    position: relative;
    display: grid;
    grid-template-columns: 2.5rem minmax(0, 1fr);
    gap: 0.4rem;
    align-items: center;
    min-height: 4.2rem;
    padding: 0.4rem;
    border: 1px solid var(--color-border);
    border-radius: 0.6rem;
    background: var(--color-bg-elevated);
    color: var(--color-heading);
    text-align: left;
    cursor: grab;
    box-shadow: 0 7px 12px -11px var(--color-heading);
    transition:
      border-color var(--motion-fast, 160ms) var(--motion-ease, ease),
      background-color var(--motion-fast, 160ms) var(--motion-ease, ease),
      box-shadow var(--motion-fast, 160ms) var(--motion-ease, ease),
      transform var(--motion-fast, 160ms) var(--motion-ease, ease);
  }

  .shelf-object:hover:not(:disabled) {
    border-color: var(--color-accent);
    box-shadow: 0 12px 18px -14px var(--color-heading);
    transform: translateY(-1px);
  }

  .shelf-object:focus-visible,
  .materials__tab:focus-visible,
  .materials__target:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  .shelf-object.selected {
    border-color: var(--color-accent);
    box-shadow:
      inset 0 0 0 1px var(--color-accent),
      0 10px 18px -14px var(--color-accent);
    background: var(--color-accent-soft);
  }

  .shelf-object.selected::after {
    content: "✓";
    position: absolute;
    top: 0.28rem;
    right: 0.32rem;
    display: grid;
    place-items: center;
    width: 0.9rem;
    height: 0.9rem;
    border-radius: 50%;
    background: var(--color-accent);
    color: var(--color-on-accent);
    font-size: 0.55rem;
    font-weight: 800;
    line-height: 1;
  }

  .shelf-object.selected .shelf-object__body,
  .shelf-object.selected .shelf-object__body span {
    color: var(--color-heading);
  }

  .shelf-object:disabled {
    opacity: 0.58;
    border-style: dashed;
    box-shadow: none;
    cursor: not-allowed;
  }

  .shelf-object__visual {
    position: relative;
    display: block;
    width: 2.5rem;
    height: 3.2rem;
    justify-self: center;
  }

  .object-wax {
    position: relative;
    width: 2.4rem;
    height: 1.8rem;
    margin-top: 0.6rem;
    border-radius: 0.35rem;
    background: var(--object-color);
    border: 2px solid color-mix(in srgb, var(--object-color) 60%, #5a4634);
    box-shadow: 0.25rem 0.25rem 0 rgba(42, 36, 30, 0.12);
  }

  .object-wax::after {
    content: "";
    position: absolute;
    inset: 0.55rem 0.35rem auto;
    height: 0.3rem;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.55);
  }

  .object-wax--block::before {
    content: "";
    position: absolute;
    right: 0.25rem;
    bottom: 0.28rem;
    left: 0.25rem;
    height: 1px;
    background: color-mix(in srgb, var(--object-color) 55%, #5a4634);
    box-shadow:
      0 0.3rem 0 color-mix(in srgb, var(--object-color) 55%, #5a4634),
      0 0.6rem 0 color-mix(in srgb, var(--object-color) 45%, transparent);
    opacity: 0.35;
  }

  .object-wax--flakes {
    height: 2rem;
    border: 0;
    background: transparent;
    box-shadow: none;
  }

  .object-wax--flakes::before {
    content: "";
    position: absolute;
    right: 0.05rem;
    bottom: 0;
    left: 0.05rem;
    height: 1.35rem;
    background: var(--object-color);
    clip-path: polygon(
      0 100%,
      12% 42%,
      30% 62%,
      48% 20%,
      64% 55%,
      82% 30%,
      100% 100%
    );
    filter: drop-shadow(
      0.12rem 0.14rem 0 color-mix(in srgb, #5a4634 22%, transparent)
    );
  }

  .object-wax--flakes::after {
    top: 0.7rem;
    left: 0.55rem;
    width: 0.3rem;
    height: 0.24rem;
    background: rgba(255, 255, 255, 0.6);
    box-shadow:
      0.55rem 0.35rem 0 rgba(255, 255, 255, 0.4),
      1.05rem -0.05rem 0 rgba(255, 255, 255, 0.45);
  }

  .object-wax--gel {
    background: color-mix(in srgb, var(--object-color) 32%, transparent);
    border-color: color-mix(in srgb, var(--object-color) 55%, #5a4634);
    box-shadow:
      inset 0 0 0 1px rgba(255, 255, 255, 0.5),
      inset 0 -0.4rem 0.6rem rgba(255, 255, 255, 0.2),
      0 0.25rem 0.5rem -0.35rem #5a4634;
  }

  .object-wax--gel::after {
    background: rgba(255, 255, 255, 0.72);
  }

  .object-wax--pote {
    width: 2.2rem;
    height: 1.55rem;
    margin-top: 0.85rem;
    border-radius: 0.55rem 0.55rem 0.4rem 0.4rem;
  }

  .object-wax--pote::before {
    content: "";
    position: absolute;
    top: -0.25rem;
    right: -0.12rem;
    left: -0.12rem;
    height: 0.36rem;
    border: 1px solid color-mix(in srgb, var(--object-color) 55%, #5a4634);
    border-radius: 999px;
    background: color-mix(in srgb, var(--object-color) 68%, #5a4634);
  }

  .object-vessel {
    position: relative;
    width: 2rem;
    height: 2.8rem;
    margin-top: 0.2rem;
    overflow: hidden;
    border: 2px solid color-mix(in srgb, var(--object-color) 55%, #5a4634);
    border-radius: 0.35rem 0.35rem 0.5rem 0.5rem;
    background: color-mix(in srgb, var(--object-color) 35%, white);
    box-shadow: inset 0.3rem 0 0.5rem -0.35rem rgba(255, 255, 255, 0.8);
  }

  .object-vessel::before {
    content: "";
    position: absolute;
    top: 0.35rem;
    bottom: 0.35rem;
    left: 0.28rem;
    width: 0.22rem;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.62);
  }

  .object-vessel::after {
    content: "";
    position: absolute;
    top: -2px;
    right: -2px;
    left: -2px;
    height: 0.32rem;
    border-bottom: 1px solid
      color-mix(in srgb, var(--object-color) 55%, #5a4634);
    background: color-mix(in srgb, var(--object-color) 58%, white);
  }

  .object-vessel--transparent {
    background: color-mix(in srgb, var(--object-color) 22%, transparent);
    box-shadow:
      inset 0.3rem 0 0.5rem -0.35rem rgba(255, 255, 255, 0.8),
      inset 0 -0.5rem 0.8rem -0.5rem rgba(255, 255, 255, 0.55);
  }

  .object-vessel--metal {
    border-radius: 0.25rem;
    background: repeating-linear-gradient(
      90deg,
      #b8bbb4 0 0.2rem,
      #eef0ea 0.2rem 0.42rem,
      #b8bbb4 0.42rem 0.6rem
    );
  }

  .object-vessel--metal::after {
    background: #8b8e87;
    border-bottom-color: #64675f;
  }

  .object-vessel--ceramica {
    border-radius: 0.6rem 0.6rem 0.45rem 0.45rem;
    background:
      radial-gradient(
        circle at 25% 35%,
        rgba(255, 255, 255, 0.3) 0 0.1rem,
        transparent 0.12rem
      ),
      radial-gradient(
        circle at 70% 62%,
        rgba(90, 70, 52, 0.16) 0 0.08rem,
        transparent 0.1rem
      ),
      color-mix(in srgb, var(--object-color) 72%, white);
  }

  .object-wick {
    width: 2.2rem;
    height: 2.2rem;
    margin-top: 0.5rem;
    border: 2px solid #8f5f40;
    border-radius: 50%;
    background:
      radial-gradient(circle at 50% 50%, #6f5541 0 0.18rem, transparent 0.2rem),
      #f3e3cd;
  }

  .object-wick::after {
    content: "";
    position: absolute;
    left: 50%;
    top: -0.65rem;
    width: 2px;
    height: 1.1rem;
    background: #3b2d25;
  }

  .object-wick--pabilo-3 {
    width: 1.7rem;
    height: 1.7rem;
    margin-top: 0.85rem;
  }

  .object-wick--pabilo-45 {
    width: 2.1rem;
    height: 2.1rem;
    margin-top: 0.65rem;
  }

  .object-wick--pabilo-67 {
    width: 2.5rem;
    height: 2.5rem;
    margin-top: 0.35rem;
  }

  .shelf-tools {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.35rem;
    margin-top: 0.1rem;
  }

  .shelf-tool {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    min-height: 3.2rem;
    padding: 0.35rem 0.4rem;
    border: 1px dashed var(--color-border-strong);
    border-radius: 0.5rem;
    background: color-mix(in srgb, var(--color-surface) 65%, transparent);
    color: var(--color-text-muted);
    font-size: 0.58rem;
    line-height: 1.25;
  }

  .shelf-tool strong {
    display: block;
    color: var(--color-heading);
    font-size: 0.62rem;
  }

  .shelf-tool small {
    display: block;
    font-size: 0.52rem;
  }

  .shelf-tool__visual {
    position: relative;
    flex: 0 0 auto;
    width: 1.8rem;
    height: 1.8rem;
  }

  .object-porta {
    border: 2px solid #64675f;
    border-radius: 50%;
    background: radial-gradient(circle, #8a8d8a 0 0.3rem, #d8d9d4 0.32rem);
    box-shadow: inset 0 -0.2rem 0.3rem -0.2rem #64675f;
  }

  .object-porta::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0.2rem;
    height: 0.7rem;
    transform: translate(-50%, -50%);
    border-radius: 999px;
    background: #3b2d25;
  }

  .object-centrador {
    width: 1.8rem;
    height: 0.45rem;
  }

  .object-centrador::before {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    height: 0.35rem;
    border-radius: 999px;
    background: #d2a77e;
    border: 1px solid #8f5f40;
  }

  .object-centrador::after {
    content: "";
    position: absolute;
    top: 0.3rem;
    left: 0.25rem;
    width: 0.25rem;
    height: 0.7rem;
    border-radius: 0 0 0.15rem 0.15rem;
    background: #8f5f40;
    box-shadow: 1.15rem 0 0 #8f5f40;
  }

  .object-bottle {
    width: 1.7rem;
    height: 2.8rem;
    margin-top: 0.2rem;
    border-radius: 0.3rem 0.3rem 0.45rem 0.45rem;
    background: var(--object-color);
    border: 2px solid color-mix(in srgb, var(--object-color) 55%, #5a4634);
  }

  .object-bottle::before {
    content: "";
    position: absolute;
    left: 50%;
    top: -0.45rem;
    width: 0.6rem;
    height: 0.55rem;
    transform: translateX(-50%);
    border-radius: 0.15rem;
    background: #8f5f40;
  }

  .object-bottle--color {
    width: 1.5rem;
    height: 2.55rem;
    border-radius: 0.25rem 0.25rem 0.35rem 0.35rem;
    background:
      linear-gradient(
        90deg,
        rgba(255, 255, 255, 0.42) 0 0.2rem,
        transparent 0.2rem
      ),
      var(--object-color);
  }

  .object-bottle--color::before {
    top: -0.65rem;
    width: 0.45rem;
    height: 0.7rem;
    border-radius: 0.1rem;
    background: #3b2d25;
    box-shadow: 0 0.28rem 0 -0.05rem #8f5f40;
  }

  .object-bottle--color::after {
    content: "";
    position: absolute;
    right: 0.2rem;
    bottom: 0.55rem;
    left: 0.2rem;
    height: 0.38rem;
    border-top: 1px solid rgba(255, 255, 255, 0.65);
    border-bottom: 1px solid rgba(42, 36, 30, 0.35);
  }

  .object-bottle--aroma::after {
    content: "";
    position: absolute;
    top: 0.75rem;
    right: 0.2rem;
    left: 0.2rem;
    height: 0.75rem;
    border-radius: 0.12rem;
    background:
      linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.72),
        rgba(255, 255, 255, 0.35)
      ),
      #f3e3cd;
    border: 1px solid rgba(90, 70, 52, 0.28);
  }

  .object-label {
    width: 2.3rem;
    height: 1.6rem;
    margin-top: 0.8rem;
    border: 2px solid var(--object-accent);
    border-radius: 0.2rem;
    background:
      linear-gradient(
        180deg,
        transparent 0.35rem,
        var(--object-accent) 0.35rem 0.42rem,
        transparent 0.42rem 0.7rem,
        color-mix(in srgb, var(--object-accent) 55%, transparent) 0.7rem 0.76rem,
        transparent 0.76rem
      ),
      var(--object-color);
  }

  .object-mold {
    width: 2.3rem;
    height: 2.3rem;
    margin-top: 0.5rem;
    border: 2px solid #8f5f40;
    border-radius: 50% 50% 45% 45%;
    background: #f3e3cd;
  }

  .object-mold--corazon {
    border-radius: 50% 50% 42% 42%;
    transform: rotate(-6deg);
  }

  .object-mold--luna {
    border-radius: 50%;
    background:
      radial-gradient(
        circle at 68% 40%,
        var(--color-bg-elevated) 0 44%,
        transparent 45%
      ),
      #e4d4bd;
  }

  .object-mold--flor {
    border-radius: 45% 55% 42% 58% / 55% 45% 58% 42%;
    background:
      radial-gradient(circle at 50% 50%, #d2a77e 0 22%, transparent 24%),
      #f3e3cd;
  }

  .object-mold--osito {
    border-radius: 44% 44% 50% 50%;
  }

  .object-mold--osito::before,
  .object-mold--osito::after {
    content: "";
    position: absolute;
    top: -0.35rem;
    width: 0.75rem;
    height: 0.75rem;
    border: 2px solid #8f5f40;
    border-radius: 50%;
    background: #f3e3cd;
  }

  .object-mold--osito::before {
    left: 0.05rem;
  }

  .object-mold--osito::after {
    right: 0.05rem;
  }

  .object-inclusion {
    width: 2rem;
    height: 2rem;
    margin-top: 0.6rem;
    border-radius: 50%;
    background: var(--object-color);
    box-shadow: 0 0 0 4px
      color-mix(in srgb, var(--object-color) 22%, transparent);
  }

  .shelf-object__body {
    display: grid;
    gap: 0.1rem;
    min-width: 0;
    color: var(--color-text-muted);
    font-size: 0.62rem;
    line-height: 1.3;
  }

  .shelf-object__tag {
    justify-self: start;
    padding: 0.05rem 0.3rem;
    border-radius: 999px;
    background: var(--color-surface);
    color: var(--color-text-muted);
    font-size: 0.5rem;
    font-weight: 800;
    letter-spacing: 0.04em;
    line-height: 1.2;
    text-transform: uppercase;
  }

  .shelf-object__body strong {
    overflow: hidden;
    color: var(--color-heading);
    font-size: 0.7rem;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .shelf-object__body em {
    color: var(--color-accent-strong);
    font-size: 0.58rem;
    font-style: normal;
    font-weight: 700;
  }

  @media (max-width: 520px) {
    .materials__grid {
      grid-template-columns: 1fr;
    }

    .materials__shelf-note {
      display: none;
    }

    .shelf-tools {
      grid-template-columns: 1fr;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .shelf-object,
    .workbench {
      transition: none;
    }

    .shelf-object:hover:not(:disabled) {
      transform: none;
    }
  }
</style>
