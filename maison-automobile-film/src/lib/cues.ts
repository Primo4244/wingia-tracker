/**
 * Sound-design cue sheet (global frames @30 fps). Each entry is a one-shot
 * placed on the timeline. Kept as data so the mix is easy to retime.
 */
export type Cue = {at: number; sfx: string; vol: number};

const typeRun = (from: number, to: number, every: number, vol: number): Cue[] =>
	Array.from({length: Math.floor((to - from) / every)}, (_, i) => ({at: from + i * every, sfx: 'type', vol}));

export const CUES: Cue[] = [
	// HOOK — counter world
	{at: 0, sfx: 'tick', vol: 0.4},
	{at: 15, sfx: 'tick', vol: 0.3},
	{at: 30, sfx: 'tick', vol: 0.3},
	{at: 45, sfx: 'tick', vol: 0.3},
	{at: 3, sfx: 'stamp', vol: 0.55},
	{at: 8, sfx: 'stamp', vol: 0.6},
	{at: 22, sfx: 'ding', vol: 0.28},
	{at: 33, sfx: 'stamp', vol: 0.55},
	{at: 39, sfx: 'stamp', vol: 0.65},
	{at: 52, sfx: 'passby', vol: 1},
	{at: 90, sfx: 'impact', vol: 0.95},
	// DESIRE
	{at: 110, sfx: 'ignite', vol: 0.45},
	{at: 165, sfx: 'whoosh_fast', vol: 0.45},
	{at: 169, sfx: 'click', vol: 0.3},
	{at: 173, sfx: 'click', vol: 0.3},
	{at: 176, sfx: 'whoosh_fast', vol: 0.25},
	{at: 194, sfx: 'whoosh_fast', vol: 0.3},
	{at: 226, sfx: 'whoosh', vol: 0.45},
	{at: 238, sfx: 'whoosh', vol: 0.55},
	{at: 268, sfx: 'roll', vol: 0.45},
	{at: 272, sfx: 'stamp', vol: 0.5},
	{at: 294, sfx: 'whoosh_fast', vol: 0.35},
	{at: 296, sfx: 'click', vol: 0.4},
	{at: 312, sfx: 'whoosh', vol: 0.5},
	// PROCESS
	{at: 330, sfx: 'stamp', vol: 0.6},
	{at: 333, sfx: 'roll', vol: 0.5},
	{at: 362, sfx: 'click', vol: 0.6},
	{at: 374, sfx: 'whoosh_fast', vol: 0.4},
	{at: 388, sfx: 'click', vol: 0.35},
	{at: 393, sfx: 'click', vol: 0.35},
	{at: 396, sfx: 'whoosh', vol: 0.28},
	{at: 436, sfx: 'keys', vol: 0.75},
	{at: 441, sfx: 'stamp', vol: 0.45},
	{at: 466, sfx: 'whoosh', vol: 0.5},
	// TERRITORY
	{at: 480, sfx: 'impact', vol: 0.9},
	{at: 487, sfx: 'whoosh_fast', vol: 0.5},
	...typeRun(486, 512, 2, 0.14),
	{at: 506, sfx: 'click', vol: 0.3},
	{at: 520, sfx: 'click', vol: 0.3},
	{at: 535, sfx: 'whoosh_fast', vol: 0.45},
	...typeRun(550, 566, 1, 0.1),
	{at: 585, sfx: 'riser', vol: 0.65},
	{at: 606, sfx: 'air', vol: 0.35},
	// BRAND
	{at: 645, sfx: 'brandhit', vol: 1},
	{at: 739, sfx: 'click', vol: 0.4},
];
