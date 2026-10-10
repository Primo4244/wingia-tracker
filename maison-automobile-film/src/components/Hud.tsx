import React from 'react';
import {AbsoluteFill} from 'remotion';
import {F} from '../lib/theme';

/** Editorial frame furniture: registration ticks + tiny labels. Quiet by design. */
export const Hud: React.FC<{
	color: string;
	left?: string;
	right?: string;
	opacity?: number;
}> = ({color, left = 'MAISON AUTOMOBILE', right, opacity = 0.55}) => {
	const tick = (x: number, y: number, rot: number) => (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: y,
				width: 26,
				height: 26,
				borderLeft: `2px solid ${color}`,
				borderTop: `2px solid ${color}`,
				transform: `rotate(${rot}deg)`,
			}}
		/>
	);
	return (
		<AbsoluteFill style={{opacity, pointerEvents: 'none'}}>
			{tick(56, 150, 0)}
			{tick(998, 150, 90)}
			<div
				style={{
					position: 'absolute',
					top: 158,
					left: 100,
					right: 100,
					display: 'flex',
					justifyContent: 'space-between',
					fontFamily: F.mono,
					fontSize: 22,
					letterSpacing: '0.18em',
					color,
				}}
			>
				<span>{left}</span>
				<span>{right}</span>
			</div>
		</AbsoluteFill>
	);
};
