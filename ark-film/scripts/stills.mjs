// Renders key frames of a composition in one bundle and tiles them into a contact sheet.
// Usage: node scripts/stills.mjs <name> <frame> [<frame> ...]
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const [name, ...frames] = process.argv.slice(2);
const browserExecutable = process.env.REMOTION_BROWSER ?? '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const outDir = path.resolve('out/stills', name);
fs.mkdirSync(outDir, { recursive: true });

const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const composition = await selectComposition({ serveUrl, id: process.env.COMP ?? 'ARK-15', browserExecutable });
const files = [];
for (const f of frames.map(Number)) {
  const output = path.join(outDir, `${String(f).padStart(4, '0')}.png`);
  await renderStill({ composition, serveUrl, frame: f, output, browserExecutable });
  files.push(output);
}
// Contact sheet: frames side by side with their frame number burned under each (review only).
const sheet = path.resolve('out/stills', `${name}-sheet.jpg`);
const inputs = files.flatMap((f) => ['-i', f]);
const labels = files.map((f, i) => `[${i}:v]scale=360:640,drawtext=text='f ${frames[i]}':x=12:y=h-40:fontsize=26:fontcolor=white:box=1:boxcolor=black@0.6[v${i}]`);
const filter = files.length > 1 ? `${labels.join(';')};${files.map((_, i) => `[v${i}]`).join('')}hstack=inputs=${files.length}` : labels[0].replace('[v0]', '');
execFileSync('ffmpeg', ['-loglevel', 'error', '-y', ...inputs, '-filter_complex', filter, '-q:v', '3', sheet]);
console.log(sheet);
