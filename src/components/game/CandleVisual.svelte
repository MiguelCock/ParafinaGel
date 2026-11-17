<script lang="ts">
  import type { PasoJuego } from "@lib/game/steps";

  interface Props {
    paso: PasoJuego;
    color: string;
  }

  let { paso, color }: Props = $props();

  const nivel = $derived(
    paso === "preparar"
      ? 40
      : paso === "verter"
        ? 60
        : paso === "curar" || paso === "resultado"
          ? 82
          : 8,
  );

  const llama = $derived(paso === "resultado");
</script>

<div
  class="candle"
  style={`--wax: ${color}; --nivel: ${nivel}%`}
  aria-hidden="true"
>
  <div class="candle__spark candle__spark--1"></div>
  <div class="candle__spark candle__spark--2"></div>
  <div class="candle__spark candle__spark--3"></div>

  <div class="candle__flame" class:visible={llama}></div>
  <div class="candle__wick"></div>

  <div class="candle__jar">
    <div class="candle__wax"></div>
    <span class="candle__label">ParafinaGel</span>
  </div>

  <div class="candle__shadow"></div>
</div>

<style>
  .candle {
    position: relative;
    width: 220px;
    height: 300px;
  }

  .candle__jar {
    position: absolute;
    bottom: 20px;
    left: 50%;
    width: 150px;
    height: 190px;
    overflow: hidden;
    border: 3px solid var(--color-heading);
    border-radius: 18px 18px 24px 24px;
    background: var(--color-bg-elevated);
    transform: translateX(-50%);
  }

  .candle__wax {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: var(--nivel);
    background: var(--wax);
    opacity: 0.9;
    transition: height 420ms ease;
  }

  .candle__label {
    position: absolute;
    bottom: 18px;
    left: 50%;
    padding: 0.3rem 0.55rem;
    border-radius: 4px;
    background: var(--color-bg-elevated);
    color: var(--color-heading);
    font-family: var(--font-display);
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    transform: translateX(-50%);
    white-space: nowrap;
  }

  .candle__wick {
    position: absolute;
    bottom: 210px;
    left: 50%;
    width: 3px;
    height: 15px;
    border-radius: 2px;
    background: var(--color-heading);
    transform: translateX(-50%);
  }

  .candle__flame {
    position: absolute;
    bottom: 222px;
    left: 50%;
    width: 28px;
    height: 42px;
    border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
    background: linear-gradient(180deg, #f6d36f 0%, #e08a5f 60%, #b4552f 100%);
    opacity: 0;
    transform: translateX(-50%) scale(0.7);
    transition:
      opacity 320ms ease,
      transform 320ms ease;
  }

  .candle__flame.visible {
    opacity: 1;
    transform: translateX(-50%) scale(1);
    animation: flicker 1.8s ease-in-out infinite;
  }

  .candle__shadow {
    position: absolute;
    bottom: 4px;
    left: 50%;
    width: 180px;
    height: 24px;
    border-radius: 50%;
    background: var(--color-heading);
    opacity: 0.1;
    transform: translateX(-50%);
  }

  .candle__spark {
    position: absolute;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--color-accent);
    opacity: 0;
    transition: opacity 320ms ease;
  }

  .candle__spark--1 {
    top: 44px;
    left: 36px;
  }

  .candle__spark--2 {
    top: 20px;
    right: 44px;
    width: 4px;
    height: 4px;
  }

  .candle__spark--3 {
    top: 76px;
    right: 24px;
    background: var(--color-sage);
  }

  .candle:has(.candle__flame.visible) .candle__spark {
    opacity: 0.7;
  }

  @keyframes flicker {
    0%,
    100% {
      transform: translateX(-50%) scale(1) rotate(-1deg);
    }
    50% {
      transform: translateX(-50%) scale(1.04) rotate(1deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .candle__flame.visible {
      animation: none;
    }

    .candle__wax {
      transition: none;
    }
  }
</style>
