<script lang="ts">
  import {
    MIX_FULL_STIRS,
    mixAromaAccuracy,
    mixAromaRange,
    mixColorAccuracy,
    mixStirAccuracy,
    mixTargetColorDrops,
  } from "@lib/game/craft";
  import { scentsById, waxesById } from "@lib/game/data";
  import type { GameState } from "@lib/game/game-state.svelte";

  interface Props {
    game: GameState;
  }

  let { game }: Props = $props();

  const wax = $derived(
    game.design.waxId ? (waxesById[game.design.waxId] ?? null) : null,
  );
  const unit = $derived(game.mixUnit);
  const colorTarget = $derived(unit ? mixTargetColorDrops(unit.grams) : 0);
  const aromaRange = $derived(
    unit ? mixAromaRange(unit.grams, wax) : { min: 0, max: 0 },
  );
  const inRange = $derived(
    Boolean(wax && unit) &&
      unit.temperature >= (wax?.meltMin ?? 0) &&
      unit.temperature <= (wax?.meltMax ?? 100),
  );
  const scentOptions = $derived(
    game.design.scentIds
      .map((id) => scentsById[id])
      .filter((scent): scent is NonNullable<typeof scent> => Boolean(scent)),
  );
  const ready = $derived(
    Boolean(unit) && unit.colorDrops > 0 && unit.aromaMl > 0 && unit.mix > 0,
  );
  const colorAccuracy = $derived(unit ? mixColorAccuracy(unit) : 0);
  const aromaAccuracy = $derived(unit ? mixAromaAccuracy(unit, wax) : 0);
  const stirAccuracy = $derived(unit ? mixStirAccuracy(unit) : 0);
</script>

<div class="game-station-panel" data-testid="mix-panel">
  <p class="game-eyebrow">Estación de mezcla</p>
  <h3 class="game-title">Un fogón por color</h3>
  <p class="game-text">
    La cera se repartió entre {game.craft.units.length}
    {game.craft.units.length === 1 ? "fogón" : "fogones"}. Calienta cada uno,
    dosifica el color gota a gota, agrega el aroma y revuelve antes de pasar al
    vertido.
  </p>

  <div class="burner-tabs" role="group" aria-label="Fogones de mezcla">
    {#each game.craft.units as item, index (item.id)}
      <button
        class="burner-tab"
        class:burner-tab--active={index === game.mixIndex}
        class:burner-tab--done={item.colorDrops > 0 &&
          item.aromaMl > 0 &&
          item.mix > 0}
        type="button"
        aria-pressed={index === game.mixIndex}
        onclick={() => game.selectMixBatch(index)}
        data-testid={`mix-burner-${index}`}
      >
        <span class="burner-tab__number">{index + 1}</span>
        <span>
          <strong>{item.label}</strong>
          <small>
            {item.scentId
              ? (scentsById[item.scentId]?.nombre ?? `${item.grams} g`)
              : `${item.grams} g`}
          </small>
        </span>
      </button>
    {/each}
  </div>

  {#if unit}
    <div class="mix-current">
      <span class="game-badge" data-testid="mix-temperature">
        {Math.round(unit.temperature)} °C
      </span>
      <span
        class:game-warning={!inRange}
        class:game-success={ready}
        class="game-badge"
      >
        {!inRange
          ? "Calienta el fogón"
          : unit.colorDrops <= 0
            ? "Falta color"
            : unit.aromaMl <= 0
              ? "Falta aroma"
              : unit.mix <= 0
                ? "Falta revolver"
                : "Fogón listo"}
      </span>
    </div>

    <p class="game-text">
      Fogón {game.mixIndex + 1} de {game.craft.units.length} · {unit.label} ·
      {unit.grams} g de cera
    </p>

    <div
      class="dose-row"
      data-testid="mix-color"
      data-current={unit.colorDrops}
      data-target={colorTarget}
    >
      <span class="dose-row__label">Color</span>
      <strong>{unit.colorDrops} / {colorTarget} gotas</strong>
      <span class="dose-row__score">{Math.round(colorAccuracy * 100)} %</span>
    </div>

    <div
      class="dose-row"
      data-testid="mix-aroma"
      data-current={unit.aromaMl}
      data-min={aromaRange.min}
      data-max={aromaRange.max}
    >
      <span class="dose-row__label">Aroma</span>
      <strong>{unit.aromaMl.toFixed(1)} ml</strong>
      <span class="dose-row__score">
        {aromaRange.min.toFixed(1)}–{aromaRange.max.toFixed(1)} ml ·
        {Math.round(aromaAccuracy * 100)} %
      </span>
    </div>

    {#if scentOptions.length > 1}
      <label class="scent-picker">
        <span>Aroma de este fogón</span>
        <select
          value={unit.scentId ?? ""}
          disabled={unit.aromaMl > 0}
          onchange={(event) =>
            game.setMixScent(game.mixIndex, event.currentTarget.value)}
          data-testid="mix-scent"
        >
          {#each scentOptions as option (option.id)}
            <option value={option.id}>{option.nombre}</option>
          {/each}
        </select>
      </label>
    {:else if unit.scentId}
      <p class="game-text">
        Aroma: <strong>
          {scentsById[unit.scentId]?.nombre ?? unit.scentId}
        </strong>
      </p>
    {/if}

    <div class="game-row">
      <span class="game-text">Revueltos: {unit.stirs}/{MIX_FULL_STIRS}</span>
      <span class="game-badge">
        {Math.round(stirAccuracy * 100)} % de mezcla
      </span>
    </div>

    <div class="manual-note">
      <span class="manual-note__icon" aria-hidden="true">↕</span>
      <span>
        <strong>Palanca:</strong> mantén el control del fogón.
        <br />
        <strong>Color:</strong> toca el frasco o pulsa C para una gota.
        <br />
        <strong>Aroma:</strong> mantén el gotero o A para dosificar.
        <br />
        <strong>Cuchara:</strong> arrastra en círculos o usa ← →.
        {#if game.craft.units.length > 1}
          <br />
          <strong>Fogón:</strong> pulsa 1–{game.craft.units.length}.
        {/if}
      </span>
    </div>

    <div class="game-row">
      <span class="game-text">
        {game.mixReadyCount}/{game.craft.units.length}
        {game.craft.units.length === 1 ? "fogón listo" : "fogones listos"}
      </span>
      <span class="game-badge">
        {game.canContinueMix ? "Mezcla completa" : "Faltan fogones"}
      </span>
    </div>

    <button
      class="game-action game-primary"
      type="button"
      onclick={() => game.goPour()}
      disabled={!game.canContinueMix}
      data-testid="mix-continue"
    >
      Ir al vertido
    </button>
  {/if}
</div>

<style>
  .burner-tabs {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(7.5rem, 1fr));
    gap: 0.35rem;
  }

  .burner-tab {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    min-height: 2.5rem;
    padding: 0.35rem 0.5rem;
    border: 1px solid var(--color-border);
    border-radius: 0.55rem;
    background: var(--color-bg);
    color: var(--color-text-muted);
    text-align: left;
  }

  .burner-tab strong {
    display: block;
    color: var(--color-heading);
    font-size: 0.65rem;
    line-height: 1.2;
  }

  .burner-tab small {
    display: block;
    font-size: 0.55rem;
  }

  .burner-tab--active {
    border-color: var(--color-accent);
    background: var(--color-accent-soft);
    color: var(--color-accent-strong);
  }

  .burner-tab--done:not(.burner-tab--active) {
    border-color: var(--color-sage);
    background: var(--color-sage-soft);
    color: var(--color-sage);
  }

  .burner-tab__number {
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    width: 1.35rem;
    height: 1.35rem;
    border-radius: 50%;
    background: var(--color-bg-elevated);
    color: var(--color-heading);
    font-size: 0.6rem;
    font-weight: 800;
  }

  .mix-current {
    display: flex;
    justify-content: space-between;
    gap: 0.4rem;
  }

  .dose-row {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: baseline;
    gap: 0.45rem;
    padding: 0.35rem 0.5rem;
    border: 1px solid var(--color-border);
    border-radius: 0.45rem;
    background: var(--color-bg);
  }

  .dose-row__label {
    color: var(--color-text-muted);
    font-size: 0.58rem;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .dose-row strong {
    color: var(--color-heading);
    font-size: 0.68rem;
  }

  .dose-row__score {
    color: var(--color-text-muted);
    font-size: 0.55rem;
    text-align: right;
  }

  .scent-picker {
    display: grid;
    gap: 0.2rem;
    color: var(--color-text-muted);
    font-size: 0.6rem;
    font-weight: 700;
  }

  .scent-picker select {
    min-height: 2rem;
    padding: 0.2rem 0.4rem;
    border: 1px solid var(--color-border);
    border-radius: 0.4rem;
    background: var(--color-bg);
    color: var(--color-heading);
    font: inherit;
  }

  .manual-note {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 0.5rem;
    padding: 0.55rem 0.65rem;
    border-left: 3px solid var(--color-accent);
    border-radius: 0.4rem;
    background: var(--color-accent-soft);
    color: var(--color-accent-strong);
    font-size: 0.65rem;
    line-height: 1.45;
  }

  .manual-note__icon {
    display: grid;
    place-items: center;
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 50%;
    background: var(--color-bg-elevated);
    font-size: 0.9rem;
    font-weight: 800;
  }
</style>
