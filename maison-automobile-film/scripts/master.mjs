// Two-pass loudness master for social delivery: -14 LUFS integrated, -1.5 dBTP.
// Cross-platform replacement for the old master.sh.
// Usage: node scripts/master.mjs in.mp4 out.mp4   (set FFMPEG=/path/to/ffmpeg if it is not on PATH)
import {spawnSync} from 'node:child_process';

const [, , input, output] = process.argv;
if (!input || !output) {
	console.error('usage: node scripts/master.mjs in.mp4 out.mp4');
	process.exit(1);
}
const ff = process.env.FFMPEG || 'ffmpeg';
const run = (args) => {
	const r = spawnSync(ff, args, {encoding: 'utf8', maxBuffer: 1 << 28});
	if (r.error) throw new Error(`cannot run ${ff}: ${r.error.message}`);
	return r;
};
const TARGET = 'I=-14:TP=-1.5:LRA=11';

const pass1 = run(['-hide_banner', '-nostats', '-i', input, '-af', `loudnorm=${TARGET}:print_format=json`, '-f', 'null', '-']);
const text = pass1.stderr;
const start = text.lastIndexOf('{');
const stats = JSON.parse(text.slice(start, text.indexOf('}', start) + 1));

const filter =
	`loudnorm=${TARGET}:measured_I=${stats.input_i}:measured_TP=${stats.input_tp}:measured_LRA=${stats.input_lra}` +
	`:measured_thresh=${stats.input_thresh}:offset=${stats.target_offset}:linear=true,aresample=48000`;
const pass2 = run(['-hide_banner', '-loglevel', 'error', '-y', '-i', input, '-c:v', 'copy', '-af', filter, '-c:a', 'aac', '-b:a', '256k', '-movflags', '+faststart', output]);
if (pass2.status !== 0) {
	console.error(pass2.stderr);
	process.exit(pass2.status ?? 1);
}
console.log(`mastered -> ${output}  (input ${stats.input_i} LUFS, ${stats.input_tp} dBTP)`);
