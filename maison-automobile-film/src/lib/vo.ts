/**
 * Voice-over cue sheet — one ElevenLabs file per line, placed at the frame
 * where its picture beat lands (30 fps). Drop the files in public/audio/vo/
 * with these names, then render with the prop `voLines: true`.
 * Timings mirror the "Script voix off final" table in README.md.
 */
export const VO_LINES: Array<{file: string; at: number; text: string}> = [
	{file: '01.mp3', at: 3, text: 'Pas de comptoir.'},
	{file: '02.mp3', at: 33, text: 'Pas de file.'},
	{file: '03.mp3', at: 105, text: 'Juste la bonne voiture.'},
	{file: '04.mp3', at: 264, text: 'Sélectionnée.'},
	{file: '05.mp3', at: 294, text: 'Préparée.'},
	{file: '06.mp3', at: 333, text: 'Vous choisissez.'},
	{file: '07.mp3', at: 381, text: 'On coordonne.'},
	{file: '08.mp3', at: 435, text: 'Vous prenez les clés.'},
	{file: '09.mp3', at: 480, text: 'Montréal. Laval.'},
	{file: '10.mp3', at: 555, text: 'Selon votre lieu et votre horaire.'},
	{file: '11.mp3', at: 645, text: 'Maison Automobile.'},
	{file: '12.mp3', at: 693, text: 'Votre voiture. Là où vous en avez besoin.'},
];
