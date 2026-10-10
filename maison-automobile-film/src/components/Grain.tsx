import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';

/** Deterministic film grain + soft vignette. Seed steps every 2 frames (12 fps grain, like film). */
export const Grain: React.FC<{opacity?: number; vignette?: number}> = ({opacity = 0.07, vignette = 0.55}) => {
	const frame = useCurrentFrame();
	const seed = Math.floor(frame / 2) % 24;
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			<AbsoluteFill
				style={{
					background: `radial-gradient(120% 80% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,${vignette}) 100%)`,
				}}
			/>
			<svg width="100%" height="100%" style={{position: 'absolute', inset: 0, opacity, mixBlendMode: 'overlay'}}>
				<filter id={`grain-${seed}`}>
					<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={seed} stitchTiles="stitch" />
					<feColorMatrix type="saturate" values="0" />
				</filter>
				<rect width="100%" height="100%" filter={`url(#grain-${seed})`} />
			</svg>
		</AbsoluteFill>
	);
};
