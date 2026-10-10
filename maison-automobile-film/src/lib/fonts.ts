import {continueRender, delayRender, staticFile} from 'remotion';

const faces: Array<[string, string, FontFaceDescriptors]> = [
	['Archivo', 'fonts/archivo-var.woff2', {weight: '100 900', stretch: '62% 125%'}],
	['Instrument Serif', 'fonts/instrument-serif.woff2', {style: 'normal'}],
	['Instrument Serif', 'fonts/instrument-serif-italic.woff2', {style: 'italic'}],
	['IBM Plex Mono', 'fonts/plex-mono-400.woff2', {weight: '400'}],
	['IBM Plex Mono', 'fonts/plex-mono-500.woff2', {weight: '500'}],
];

let loaded = false;

export const loadFonts = () => {
	if (loaded || typeof document === 'undefined') return;
	loaded = true;
	const handle = delayRender('Loading local fonts');
	Promise.all(
		faces.map(([family, file, desc]) => {
			const face = new FontFace(family, `url(${staticFile(file)}) format('woff2')`, desc);
			return face.load().then((f) => document.fonts.add(f));
		}),
	)
		.then(() => continueRender(handle))
		.catch((err) => {
			console.error(err);
			continueRender(handle);
		});
};
