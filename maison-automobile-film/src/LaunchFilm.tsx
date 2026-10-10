import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {keys} from './lib/anim';
import {BeatImpact} from './components/BeatImpact';
import {Grain} from './components/Grain';
import {loadFonts} from './lib/fonts';
import {CUES} from './lib/cues';
import {VO_LINES, voPresence} from './lib/vo';
import {C, T} from './lib/theme';
import {S1Hook} from './scenes/S1Hook';
import {S2Desire} from './scenes/S2Desire';
import {S3Process} from './scenes/S3Process';
import {S4City} from './scenes/S4City';
import {S5Brand} from './scenes/S5Brand';

loadFonts();

export type LaunchFilmProps = {
	/** optional ElevenLabs voice-over, placed at frame 0 (see VOICEOVER.md for timings) */
	voiceover?: string | null;
	music?: boolean;
	sfx?: boolean;
	/** per-line ElevenLabs files from public/audio/vo/, timed by src/lib/vo.ts */
	voLines?: boolean;
};

export const LaunchFilm: React.FC<LaunchFilmProps> = ({voiceover = null, music = true, sfx = true, voLines = false}) => {
	const frame = useCurrentFrame();
	// light scenes (counter, process) get a much softer vignette — dark scenes keep the lens falloff
	const vignette = keys(frame, [0, 86, 92, 330, 336, 466, 480], [0.16, 0.16, 0.5, 0.5, 0.14, 0.14, 0.5]);
	return (
	<AbsoluteFill style={{background: C.ink}}>
		<Sequence from={T.hook.from} durationInFrames={T.hook.dur} name="01 Hook — sans comptoir">
			<S1Hook />
		</Sequence>
		<Sequence from={T.desire.from} durationInFrames={T.desire.dur} name="02 Désir — la flotte">
			<BeatImpact hits={[0]} strength={0.02}>
				<S2Desire />
			</BeatImpact>
		</Sequence>
		<Sequence from={T.process.from} durationInFrames={T.process.dur} name="03 Simplicité — choisir / coordonner / clés">
			<S3Process />
		</Sequence>
		<Sequence from={T.city.from} durationInFrames={T.city.dur} name="04 Territoire — MTL ↔ LAV">
			<BeatImpact hits={[0]} strength={0.035} shake={4}>
				<S4City />
			</BeatImpact>
		</Sequence>
		<Sequence from={T.brand.from} durationInFrames={T.brand.dur} name="05 Marque — end card">
			<BeatImpact hits={[30]} strength={0.012}>
				<S5Brand />
			</BeatImpact>
		</Sequence>

		<Grain vignette={vignette} />

		{music && (
			<Audio
				src={staticFile('audio/music.wav')}
				// the music steps back (about -7 dB) while the voice speaks
				volume={(f) => 0.78 * (1 - (voLines ? 0.55 * voPresence(f) : 0))}
			/>
		)}
		{sfx &&
			CUES.map((c, i) => (
				<Sequence key={i} from={c.at} name={`sfx ${c.sfx}`} layout="none">
					<Audio src={staticFile(`audio/sfx_${c.sfx}.wav`)} volume={c.vol} />
				</Sequence>
			))}
		{voiceover && <Audio src={staticFile(voiceover)} volume={1} />}
		{voLines &&
			VO_LINES.map((l) => (
				<Sequence key={l.file} from={l.at} name={`vo ${l.text}`} layout="none">
					<Audio src={staticFile(`audio/vo/${l.file}`)} volume={1} />
				</Sequence>
			))}
	</AbsoluteFill>
	);
};
