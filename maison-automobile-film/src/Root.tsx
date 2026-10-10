import React from 'react';
import {Composition} from 'remotion';
import {LaunchFilm} from './LaunchFilm';
import {FPS, T} from './lib/theme';

export const RemotionRoot: React.FC = () => (
	<>
		<Composition
			id="LaunchFilm"
			component={LaunchFilm}
			durationInFrames={T.total}
			fps={FPS}
			width={1080}
			height={1920}
			defaultProps={{voiceover: null, music: true, sfx: true}}
		/>
	</>
);
