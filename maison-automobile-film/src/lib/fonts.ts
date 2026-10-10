import {continueRender, delayRender, staticFile} from 'remotion';

const faces: Array<[string, string, FontFaceDescriptors]> = [
	['Geist', 'fonts/geist-var.woff2', {weight: '100 900'}],
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
