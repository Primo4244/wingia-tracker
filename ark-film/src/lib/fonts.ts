import { continueRender, delayRender, staticFile } from 'remotion';

/** The storefront's own font files (captured from the site), loaded before the first frame. */
const FACES: [family: string, weight: string, file: string][] = [
  ['Big Shoulders', '800', 'fonts/BigShoulders-800.woff2'],
  ['Schibsted Grotesk', '400', 'fonts/SchibstedGrotesk-400.woff2'],
  ['Schibsted Grotesk', '500', 'fonts/SchibstedGrotesk-500.woff2'],
  ['Schibsted Grotesk', '600', 'fonts/SchibstedGrotesk-600.woff2'],
];

let started = false;

export const loadFonts = () => {
  if (started || typeof document === 'undefined') return;
  started = true;
  const handle = delayRender('Loading ARK fonts');
  Promise.all(
    FACES.map(([family, weight, file]) => {
      const face = new FontFace(family, `url(${staticFile(file)}) format('woff2')`, { weight });
      (document.fonts as unknown as { add: (f: FontFace) => void }).add(face);
      return face.load();
    })
  )
    .then(() => continueRender(handle))
    .catch((error) => {
      console.error(error);
      continueRender(handle);
    });
};
