import {Easing} from 'remotion';

/**
 * Maison Automobile — reconstructed visual system.
 * The live site could not be reached during production, so this palette is a
 * deliberate art-direction choice (ink / bone / copper). Swap here if the
 * official brand values differ.
 */
export const C = {
	ink: '#0A0A0B',
	carbon: '#121214',
	graphite: '#232327',
	smoke: '#6E6B66',
	stone: '#A8A29A',
	bone: '#EEE9E0',
	paper: '#F6F3EE',
	copper: '#C8864A',
	copperHot: '#E9A766',
	// the "old way" — cold institutional counter
	cold: '#DCE0E2',
	coldDeep: '#C4CACD',
	coldInk: '#1B2024',
	ledRed: '#E23B2E',
};

export const F = {
	display: 'Archivo',
	serif: 'Instrument Serif',
	mono: 'IBM Plex Mono',
};

/** Archivo variable axes helper (wdth 62–125, wght 100–900). */
export const wide = (wdth: number, wght: number) => ({
	fontFamily: F.display,
	fontVariationSettings: `'wdth' ${wdth}, 'wght' ${wght}`,
});

/** Easing vocabulary — deliberately varied, never the same curve everywhere. */
export const E = {
	expoOut: Easing.bezier(0.16, 1, 0.3, 1),
	quartOut: Easing.bezier(0.25, 1, 0.5, 1),
	snap: Easing.bezier(0.85, 0, 0.15, 1),
	inOut: Easing.bezier(0.65, 0, 0.35, 1),
	accel: Easing.bezier(0.7, 0, 0.84, 0),
	glide: Easing.bezier(0.33, 0.0, 0.2, 1),
	punch: Easing.bezier(0.05, 0.9, 0.1, 1),
	backOut: Easing.bezier(0.34, 1.45, 0.64, 1),
	linear: Easing.linear,
};

export const FPS = 30;
export const BPM = 120;
export const BEAT = (60 / BPM) * FPS; // 15 frames
export const BAR = BEAT * 4; // 60 frames

/** Master timeline (frames @30fps). Every scene boundary sits on the beat grid. */
export const T = {
	hook: {from: 0, dur: 90},
	desire: {from: 90, dur: 240},
	process: {from: 330, dur: 150},
	city: {from: 480, dur: 135},
	brand: {from: 615, dur: 195},
	total: 810,
};
