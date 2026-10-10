import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';

/**
 * Wraps a layer and gives it a physical response to hits: a fast scale punch
 * that decays, plus an optional micro-shake. Only used on the big hits.
 */
export const BeatImpact: React.FC<{
	hits: number[];
	strength?: number;
	shake?: number;
	children: React.ReactNode;
}> = ({hits, strength = 0.025, shake = 0, children}) => {
	const frame = useCurrentFrame();
	let s = 0;
	let dx = 0;
	let dy = 0;
	for (const h of hits) {
		const t = frame - h;
		if (t < 0 || t > 20) continue;
		const k = Math.exp(-t / 3.2);
		s += strength * k;
		dx += shake * k * Math.sin(t * 2.7 + h);
		dy += shake * k * Math.cos(t * 3.1 + h);
	}
	return (
		<AbsoluteFill style={{transform: `translate(${dx}px, ${dy}px) scale(${1 + s})`}}>
			{children}
		</AbsoluteFill>
	);
};
