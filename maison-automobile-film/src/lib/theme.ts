import {Easing} from 'remotion';

/**
 * Maison Automobile — visual system.
 * Monochrome, like the logo (black on white): deep black, white, and a
 * ladder of neutral greys. One sans family (Geist) carries everything; the
 * hierarchy comes from weight and size, never from italics or a colour accent.
 * `copper` / `copperHot` keep their names for the accent role (lines, pins,
 * progress) but are now neutral greys that read on both black and white.
 */
export const C = {
	ink: '#000000',
	carbon: '#0E0E10',
	graphite: '#1D1D1F',
	smoke: '#6E6E73',
	stone: '#86868B',
	bone: '#F5F5F7',
	paper: '#FBFBFD',
	copper: '#8E8E93',
	copperHot: '#FFFFFF',
	// the "old way" — cold institutional counter
	cold: '#DCE0E2',
	coldDeep: '#C4CACD',
	coldInk: '#1B2024',
	ledRed: '#1B2024',
};

export const F = {
	display: 'Geist',
	/** light-weight role (formerly the italic serif) */
	serif: 'Geist',
	/** small labels (formerly monospace) */
	mono: 'Geist',
};

/** Weight helper. The width argument is kept for call-site compatibility; Geist has no wdth axis. */
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
