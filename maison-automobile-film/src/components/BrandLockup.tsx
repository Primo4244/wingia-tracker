import React from 'react';
import {ramp} from '../lib/anim';
import {C, E, wide} from '../lib/theme';

/**
 * MAISON / AUTOMOBILE lockup, split by a light line.
 * Each word emerges from behind the line (masked at the line) and its
 * tracking settles slowly — the one long, patient animation of the film.
 * A specular band crosses the letters like light over a body panel.
 *
 * Typographic reconstruction: replace with the official logo (SVG) in
 * public/brand/ when available.
 */
export const BrandLockup: React.FC<{f: number; lineWidth: number; start: number}> = ({f, lineWidth, start}) => {
	const up = ramp(f, [start, start + 18], [0, 1], E.expoOut);
	const down = ramp(f, [start + 3, start + 21], [0, 1], E.expoOut);
	const track = ramp(f, [start, start + 70], [0, 1], E.expoOut);
	const spec = ramp(f, [start + 26, start + 62], [0, 1], E.inOut);

	const specStyle = (base: string): React.CSSProperties => ({
		backgroundImage: `linear-gradient(105deg, ${base} 0%, ${base} 42%, #ffffff 50%, ${base} 58%, ${base} 100%)`,
		backgroundSize: '300% 100%',
		backgroundPosition: `${100 - spec * 100}% 0`,
		WebkitBackgroundClip: 'text',
		backgroundClip: 'text',
		color: 'transparent',
	});

	return (
		<div style={{position: 'relative', width: 1080, height: 400}}>
			{/* MAISON — above the line */}
			<div style={{position: 'absolute', left: 0, right: 0, bottom: 200 + 1, height: 220, overflow: 'hidden'}}>
				<div
					style={{
						position: 'absolute',
						left: 0,
						right: 0,
						bottom: 22,
						textAlign: 'center',
						...wide(125, 720),
						fontSize: 148,
						lineHeight: 1,
						letterSpacing: `${0.5 - 0.37 * track}em`,
						paddingLeft: `${0.5 - 0.37 * track}em`,
						transform: `translateY(${(1 - up) * 170}px)`,
						whiteSpace: 'nowrap',
						...specStyle(C.bone),
					}}
				>
					MAISON
				</div>
			</div>
			{/* the line */}
			<div
				style={{
					position: 'absolute',
					top: 199,
					left: 540 - lineWidth / 2,
					width: lineWidth,
					height: 2,
					background: '#fff',
					boxShadow: '0 0 14px rgba(255,255,255,0.35)',
				}}
			/>
			{/* AUTOMOBILE — below the line */}
			<div style={{position: 'absolute', left: 0, right: 0, top: 200 + 1, height: 160, overflow: 'hidden'}}>
				<div
					style={{
						position: 'absolute',
						left: 0,
						right: 0,
						top: 28,
						textAlign: 'center',
						...wide(125, 400),
						fontSize: 66,
						lineHeight: 1,
						letterSpacing: `${0.8 - 0.42 * track}em`,
						paddingLeft: `${0.8 - 0.42 * track}em`,
						transform: `translateY(${(1 - down) * -110}px)`,
						whiteSpace: 'nowrap',
						...specStyle(C.bone),
					}}
				>
					AUTOMOBILE
				</div>
			</div>
		</div>
	);
};
