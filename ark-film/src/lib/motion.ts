import { interpolate } from 'remotion';
import { easeOut } from '../theme';

type Ease = (t: number) => number;

/** A clamped tween from `start` over `duration` frames: the frame-driven stand-in for gsap.to. */
export const tween = (frame: number, start: number, duration: number, from: number, to: number, ease: Ease = easeOut) =>
  interpolate(frame, [start, start + duration], [from, to], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });

/** Linear 0→1 progress across a range: the stand-in for a scrubbed ScrollTrigger. */
export const progress = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

/** Seconds to frames at 30 fps, rounded. */
export const s = (seconds: number) => Math.round(seconds * 30);
