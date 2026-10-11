import { Easing } from 'remotion';

/** ARK tokens, taken from the theme's `--ark-*` variables (snippets/ark-night-styles.liquid). */
export const C = {
  night: '#0B1015',
  deep: '#121A23',
  steel: '#2A3846',
  glacier: '#9FB3C4',
  frost: '#E9EEF2',
  ice: '#D5DFE7',
  frostFill: '#6F8AA1',
} as const;

/** GSAP `expo.out` as the site writes it (`--ark-ease-out`), and `--ark-ease-in-out`. */
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
/** GSAP `power2.out`, used by the finale's line reveals. */
export const power2Out = Easing.bezier(0.33, 1, 0.68, 1);

export const FPS = 30;
export const W = 1080;
export const H = 1920;

/** 120 BPM: one beat is 15 frames. Every cut lands on a beat. */
export const BEAT = 15;

/** Text never goes below this line (platform UI sits under it), nor into the margins. */
export const SAFE = { top: 230, bottom: 1500, left: 96, right: 150 } as const;

export const display = "'Big Shoulders', 'Arial Narrow', sans-serif";
export const body = "'Schibsted Grotesk', Arial, sans-serif";
