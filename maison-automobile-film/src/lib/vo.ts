/**
 * Voice-over cue sheet — Maggie (ElevenLabs), one file per line, placed at the
 * frame where its picture beat lands (30 fps). Files in public/audio/vo/ are
 * trimmed of leading silence and level-matched to -18 LUFS each.
 * `dur` is the trimmed length in frames; the music ducks under it.
 * Timings mirror the "Script voix off final" table in README.md.
 */
export const VO_LINES: Array<{file: string; at: number; dur: number; text: string}> = [
	{file: '01.wav', at: 2, dur: 31, text: 'Pas de comptoir.'},
	{file: '02.wav', at: 35, dur: 24, text: 'Pas de file.'},
	{file: '03.wav', at: 105, dur: 44, text: 'Juste la bonne voiture.'},
	{file: '04.wav', at: 264, dur: 24, text: 'Sélectionnée.'},
	{file: '05.wav', at: 294, dur: 20, text: 'Préparée.'},
	{file: '06.wav', at: 333, dur: 32, text: 'Vous choisissez.'},
	{file: '07.wav', at: 381, dur: 31, text: 'On coordonne.'},
	{file: '08.wav', at: 435, dur: 31, text: 'Vous prenez les clés.'},
	{file: '09.wav', at: 480, dur: 35, text: 'Partout au Québec.'},
	{file: '10.wav', at: 531, dur: 82, text: 'Remise coordonnée, selon votre lieu et votre horaire.'},
	{file: '11.wav', at: 645, dur: 33, text: 'Maison Automobile.'},
	{file: '12.wav', at: 693, dur: 73, text: 'Votre voiture. Là où vous en avez besoin.'},
];

/** 0 → 1: how much the voice is speaking at `frame`, with soft 6-frame ramps. */
export const voPresence = (frame: number) => {
	let p = 0;
	for (const l of VO_LINES) {
		const a = l.at - 6;
		const b = l.at + l.dur + 6;
		if (frame < a || frame > b) continue;
		const v = Math.min(1, (frame - a) / 6, (b - frame) / 6);
		p = Math.max(p, v);
	}
	return p;
};
