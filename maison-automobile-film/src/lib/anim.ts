import {interpolate, EasingFunction} from 'remotion';

/** Clamped interpolate with an easing — the workhorse. */
export const ramp = (
	frame: number,
	range: [number, number],
	out: [number, number] = [0, 1],
	easing?: EasingFunction,
) =>
	interpolate(frame, range, out, {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing,
	});

/** Multi-key interpolate, clamped. */
export const keys = (
	frame: number,
	input: number[],
	output: number[],
	easing?: EasingFunction,
) =>
	interpolate(frame, input, output, {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing,
	});

/** Deterministic pseudo-random in [0,1). */
export const rand = (seed: number) => {
	const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
	return x - Math.floor(x);
};

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Visible only within [a, b). */
export const within = (frame: number, a: number, b: number) =>
	frame >= a && frame < b;
