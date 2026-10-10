/**
 * Voice-over cue sheet — Maggie (ElevenLabs), one file per line, placed at the
 * frame where its picture beat lands (30 fps). Files in public/audio/vo/ are
 * trimmed of leading silence and level-matched to -18 LUFS each.
 * `dur` is the trimmed length in frames; the music ducks under it.
 * Timings mirror the "Script voix off final" table in README.md.
 */
export const VO_LINES: Array<{file: string; at: number; dur: number; text: string}> = [
	{file: '01.wav', at: 2, dur: 35, text: 'Pas de comptoir.'},
	{file: '02.wav', at: 37, dur: 28, text: 'Pas de file.'},
	{file: '03.wav', at: 105, dur: 48, text: 'Juste la bonne voiture.'},
	{file: '04.wav', at: 264, dur: 28, text: 'Sélectionnée.'},
	{file: '05.wav', at: 294, dur: 24, text: 'Préparée.'},
	{file: '06.wav', at: 333, dur: 36, text: 'Vous choisissez.'},
	{file: '07.wav', at: 381, dur: 34, text: 'On coordonne.'},
	{file: '08.wav', at: 435, dur: 35, text: 'Vous prenez les clés.'},
	{file: '09.wav', at: 480, dur: 40, text: 'Partout au Québec.'},
	{file: '10.wav', at: 528, dur: 86, text: 'Remise coordonnée, selon votre lieu et votre horaire.'},
	{file: '11.wav', at: 645, dur: 37, text: 'Maison Automobile.'},
	{file: '12.wav', at: 693, dur: 77, text: 'Votre voiture. Là où vous en avez besoin.'},
];

/** Lines closer than this (frames) share one duck, so the music does not pump between them. */
const HOLD_GAP = 75;
const RAMP = 12;

/** Speaking windows, merged across short gaps. */
const WINDOWS = VO_LINES.reduce<Array<[number, number]>>((acc, l) => {
	const last = acc[acc.length - 1];
	const a = l.at;
	const b = l.at + l.dur;
	if (last && a - last[1] < HOLD_GAP) last[1] = Math.max(last[1], b);
	else acc.push([a, b]);
	return acc;
}, []);

/** 0 → 1: how much the voice bed is active at `frame`, with soft ramps. */
export const voPresence = (frame: number) => {
	let p = 0;
	for (const [a0, b0] of WINDOWS) {
		const a = a0 - RAMP;
		const b = b0 + RAMP;
		if (frame < a || frame > b) continue;
		p = Math.max(p, Math.min(1, (frame - a) / RAMP, (b - frame) / RAMP));
	}
	return p;
};
