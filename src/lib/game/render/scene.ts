import type { Container } from "pixi.js";
import type { GameState } from "../game-state.svelte";

export interface StageScene {
  view: Container;
  update(game: GameState, delta: number): void;
  pointerDown?(x: number, y: number, game: GameState): void;
  pointerMove?(x: number, y: number, game: GameState): void;
  pointerUp?(x: number, y: number, game: GameState): void;
  keyDown?(
    key: string,
    game: GameState,
    shift: boolean,
    repeat?: boolean,
  ): void;
  keyUp?(key: string, game: GameState): void;
  ariaLabel(game: GameState): string;
  destroy(): void;
}
