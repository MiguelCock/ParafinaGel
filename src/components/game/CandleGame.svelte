<script lang="ts">
  import CandleVisual from "./CandleVisual.svelte";
  import { pasos, type PasoJuego } from "@lib/game/steps";
  import type { ProductoJuego } from "@lib/game/types";

  interface Props {
    productos: ProductoJuego[];
  }

  let { productos }: Props = $props();

  let paso = $state<PasoJuego>("inicio");
  let seleccion = $state<ProductoJuego | null>(null);
  let interacciones = $state(0);
  let completado = $state(false);

  const pasoActual = $derived(pasos.find((item) => item.id === paso));
  const indice = $derived(pasoActual ? pasos.indexOf(pasoActual) + 1 : 0);
  const total = pasos.length;

  const colores: Record<string, string> = {
    Lavanda: "#9b8bb4",
    Bergamota: "#a8b87a",
    Vainilla: "#d8b384",
    Ámbar: "#c98a4b",
    Café: "#8b5e3c",
    Canela: "#b06a3f",
    Naranja: "#e39a4a",
    Limón: "#d8c95a",
    Romero: "#7c8b72",
  };

  const color = $derived(
    seleccion
      ? (colores[seleccion.aromas[0] ?? ""] ?? "var(--color-accent)")
      : "var(--color-accent)",
  );

  const progreso = $derived(
    paso === "resultado" ? 100 : paso === "inicio" ? 0 : (indice / total) * 100,
  );

  function empezar() {
    paso = "elegir";
  }

  function elegir(producto: ProductoJuego) {
    seleccion = producto;
  }

  function interactuar() {
    if (!pasoActual) return;

    interacciones = Math.min(interacciones + 1, pasoActual.interacciones);
    completado = interacciones >= pasoActual.interacciones;
  }

  function continuar() {
    if (!pasoActual) return;

    const siguiente = pasos[pasos.indexOf(pasoActual) + 1];
    interacciones = 0;
    completado = false;
    paso = siguiente ? siguiente.id : "resultado";
  }

  function reiniciar() {
    paso = "inicio";
    seleccion = null;
    interacciones = 0;
    completado = false;
  }
</script>

<section class="game" aria-labelledby="game-title">
  <header class="game__header">
    <div>
      <p class="game__eyebrow">Mini-juego</p>
      <h2 id="game-title">Haz tu primera vela</h2>
    </div>
    {#if paso !== "inicio" && paso !== "resultado"}
      <p class="game__step-label">Paso {indice} de {total}</p>
    {/if}
  </header>

  {#if paso !== "inicio" && paso !== "resultado"}
    <div class="game__progress" aria-hidden="true">
      <span style={`width: ${progreso}%`}></span>
    </div>
  {/if}

  <div class="game__body">
    <div class="game__visual">
      <CandleVisual {paso} {color} />
      <p class="game__visual-caption">
        {#if paso === "resultado"}
          Tu vela está lista.
        {:else if seleccion}
          {seleccion.nombre}
        {:else}
          Elige un aroma para empezar.
        {/if}
      </p>
    </div>

    <div class="game__panel" aria-live="polite">
      {#if productos.length === 0}
        <div class="game__empty">
          <h3>El juego está en preparación</h3>
          <p>
            Muy pronto podrás probar nuestros productos aquí. Mientras tanto,
            explora el catálogo.
          </p>
          <a class="game__button" href="/productos">Ver catálogo</a>
        </div>
      {:else if paso === "inicio"}
        <div class="game__intro">
          <p class="game__kicker">2–3 minutos</p>
          <h3>Aprende cómo se hace una vela</h3>
          <p>
            Elige un producto, recorre el proceso y descubre el resultado. Sin
            registro y sin prisa.
          </p>
          <ul class="game__list">
            <li>Elige tu aroma favorito.</li>
            <li>Mezcla, vierte y deja curar.</li>
            <li>Termina con una recomendación real del catálogo.</li>
          </ul>
          <button class="game__button" type="button" onclick={empezar}>
            Empezar
          </button>
        </div>
      {:else if paso === "elegir"}
        <div class="game__step">
          <h3>{pasoActual?.titulo}</h3>
          <p>{pasoActual?.instruccion}</p>

          <div class="game__options">
            {#each productos as producto}
              <button
                type="button"
                class="game__option"
                class:selected={seleccion?.id === producto.id}
                aria-pressed={seleccion?.id === producto.id}
                onclick={() => elegir(producto)}
              >
                <span class="game__option-name">{producto.nombre}</span>
                <span class="game__option-aromas">
                  {producto.aromas.join(" · ")}
                </span>
              </button>
            {/each}
          </div>

          <p class="game__tip">{pasoActual?.tip}</p>
          <button
            class="game__button"
            type="button"
            disabled={!seleccion}
            onclick={continuar}
          >
            Continuar
          </button>
        </div>
      {:else if paso === "resultado"}
        <div class="game__result">
          <p class="game__kicker">Resultado</p>
          <h3>¡Tu vela está lista!</h3>
          <p>
            Probaste <strong>
              {seleccion?.nombre ?? "una vela de ejemplo"}
            </strong>. Este es el producto que recomendamos para ti.
          </p>

          <div class="game__result-card">
            <span class="game__result-label">Producto recomendado</span>
            <span class="game__result-name">{seleccion?.nombre}</span>
            <span class="game__result-aromas">
              {seleccion?.aromas.join(" · ")}
            </span>
          </div>

          <p class="game__tip">
            En la vida real, deja curar la vela varios días antes de encenderla.
          </p>

          <div class="game__actions">
            <a
              class="game__button"
              href={seleccion ? `/productos/${seleccion.id}/` : "/productos"}
            >
              Ver producto
            </a>
            <button
              class="game__button game__button--secondary"
              type="button"
              onclick={reiniciar}
            >
              Jugar de nuevo
            </button>
          </div>
        </div>
      {:else if pasoActual}
        <div class="game__step">
          <h3>{pasoActual.titulo}</h3>
          <p>{pasoActual.instruccion}</p>

          <div class="game__dots" aria-hidden="true">
            {#each Array.from({ length: pasoActual.interacciones }) as _, index}
              <span class:done={index < interacciones}></span>
            {/each}
          </div>

          <p class="game__tip">{pasoActual.tip}</p>

          {#if completado}
            <button class="game__button" type="button" onclick={continuar}>
              Continuar
            </button>
          {:else}
            <button class="game__button" type="button" onclick={interactuar}>
              {pasoActual.accion}
            </button>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</section>

<style>
  .game {
    overflow: hidden;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-bg-elevated);
    box-shadow: var(--shadow-md);
  }

  .game__header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: var(--space-4);
    padding: var(--space-5);
    border-bottom: 1px solid var(--color-border);
  }

  .game__eyebrow {
    color: var(--color-accent);
    font-size: var(--text-xs);
    font-weight: 800;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  .game__header h2 {
    margin-top: var(--space-1);
    font-size: var(--text-2xl);
  }

  .game__step-label {
    color: var(--color-text-muted);
    font-size: var(--text-sm);
    font-weight: 700;
    white-space: nowrap;
  }

  .game__progress {
    height: 5px;
    background: var(--color-surface);
  }

  .game__progress span {
    display: block;
    height: 100%;
    background: var(--color-accent);
    transition: width 300ms ease;
  }

  .game__body {
    display: grid;
    gap: var(--space-5);
    padding: var(--space-5);
  }

  .game__visual {
    display: grid;
    place-items: center;
    align-content: center;
    gap: var(--space-4);
    min-height: 320px;
    padding: var(--space-5);
    border-radius: var(--radius-md);
    background:
      radial-gradient(
        circle at 50% 30%,
        var(--color-accent-soft),
        transparent 65%
      ),
      var(--color-surface);
  }

  .game__visual-caption {
    color: var(--color-text-muted);
    font-size: var(--text-sm);
    font-weight: 600;
    text-align: center;
  }

  .game__panel {
    display: grid;
    align-content: start;
    gap: var(--space-4);
    min-height: 320px;
  }

  .game__panel h3 {
    font-size: var(--text-2xl);
  }

  .game__panel p {
    color: var(--color-text-muted);
  }

  .game__kicker {
    color: var(--color-accent) !important;
    font-size: var(--text-xs);
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .game__intro,
  .game__step,
  .game__result,
  .game__empty {
    display: grid;
    align-content: start;
    gap: var(--space-4);
  }

  .game__list {
    display: grid;
    gap: 0.5rem;
    color: var(--color-text-muted);
    font-size: var(--text-sm);
  }

  .game__list li {
    position: relative;
    padding-left: 1.25rem;
  }

  .game__list li::before {
    content: "";
    position: absolute;
    top: 0.55em;
    left: 0;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--color-accent);
  }

  .game__options {
    display: grid;
    gap: var(--space-2);
  }

  .game__option {
    display: grid;
    gap: 0.2rem;
    padding: var(--space-3) var(--space-4);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-bg);
    text-align: left;
    transition:
      border-color var(--transition),
      background-color var(--transition);
  }

  .game__option:hover {
    border-color: var(--color-accent);
  }

  .game__option.selected {
    border-color: var(--color-accent);
    background: var(--color-accent-soft);
  }

  .game__option-name {
    color: var(--color-heading);
    font-size: var(--text-sm);
    font-weight: 800;
  }

  .game__option-aromas {
    color: var(--color-text-muted);
    font-size: var(--text-xs);
  }

  .game__tip {
    padding: var(--space-3);
    border-left: 3px solid var(--color-sage);
    background: var(--color-sage-soft);
    color: var(--color-sage) !important;
    font-size: var(--text-sm);
  }

  .game__dots {
    display: flex;
    gap: 0.5rem;
  }

  .game__dots span {
    width: 2rem;
    height: 6px;
    border-radius: var(--radius-full);
    background: var(--color-surface-strong);
    transition: background-color var(--transition);
  }

  .game__dots span.done {
    background: var(--color-accent);
  }

  .game__button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    min-height: 2.75rem;
    padding: 0.7rem 1.2rem;
    border: 1px solid transparent;
    border-radius: var(--radius-full);
    background: var(--color-accent);
    color: var(--color-on-accent);
    font-size: var(--text-sm);
    font-weight: 800;
    text-align: center;
    transition:
      background-color var(--transition),
      transform var(--transition),
      opacity var(--transition);
  }

  .game__button:hover:not(:disabled) {
    background: var(--color-accent-hover);
    transform: translateY(-1px);
  }

  .game__button:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .game__button--secondary {
    border-color: var(--color-border-strong);
    background: transparent;
    color: var(--color-heading);
  }

  .game__button--secondary:hover:not(:disabled) {
    border-color: var(--color-accent);
    background: var(--color-surface);
  }

  .game__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .game__result-card {
    display: grid;
    gap: 0.2rem;
    padding: var(--space-4);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
  }

  .game__result-label {
    color: var(--color-text-muted);
    font-size: var(--text-xs);
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .game__result-name {
    color: var(--color-heading);
    font-family: var(--font-display);
    font-size: var(--text-xl);
    font-weight: 600;
  }

  .game__result-aromas {
    color: var(--color-text-muted);
    font-size: var(--text-sm);
  }

  @media (min-width: 860px) {
    .game__body {
      grid-template-columns: 0.85fr 1.15fr;
      gap: var(--space-6);
      padding: var(--space-6);
    }

    .game__visual {
      min-height: 420px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .game__button:hover:not(:disabled) {
      transform: none;
    }
  }
</style>
