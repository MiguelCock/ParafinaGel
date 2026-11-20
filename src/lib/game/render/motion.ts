import { MotionController } from "../motion";

export {
  easings,
  motionBudget,
  motionDistances,
  motionDurations,
  motionStagger,
} from "../motion";
export { motion } from "../motion.svelte";

/**
 * Tween controller shared by the active Pixi scene.
 * The renderer clears it on scene changes and pauses it while the game is
 * hidden or help is open.
 */
export const tweens = new MotionController();
