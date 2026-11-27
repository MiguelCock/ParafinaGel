/**
 * Minimal PixiJS surface for the hidden fluid lab.
 *
 * The lab imports this module dynamically so the bundler only includes the
 * classes it actually uses. Importing the whole `pixi.js` namespace in a
 * dynamic import pulls in the full barrel and grows the shared game chunk.
 */
export { Application, Container, Graphics } from "pixi.js";
