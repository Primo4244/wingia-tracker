/**
 * Per-slot settings for the fleet footage (used only when a clip exists for the slot).
 * Slots: pass, night, macro, k4, a3, rav4, gle, cayenne.
 */

/** Where the usable moment of each clip starts, in seconds. Pick the best second of the take. */
export const CLIP_IN: Record<string, number> = {};

/** Playback speed (1 = real time). Below 1 slows a take down. */
export const CLIP_RATE: Record<string, number> = {};

/**
 * Areas to blur on a clip, as fractions of the frame (x, y, w, h in 0–1).
 * Only valid for a LOCKED-OFF shot (tripod). On a moving shot, hide logos on the car
 * itself (matte tape) instead — see PLAN-DE-TOURNAGE.md.
 */
export const CLIP_SPOTS: Record<string, Array<{x: number; y: number; w: number; h: number}>> = {};
