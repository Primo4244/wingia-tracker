import React from 'react';
import {C} from '../lib/theme';

/**
 * Airport-style queue: rows of chrome stanchions linked by sagging belts,
 * receding to a vanishing point. Universally read as "waiting in line".
 * Pure function of `frame` (a slow lateral drift — the line never advances).
 */
const VP = {x: 540, y: 330}; // vanishing point
const FOCAL = 520;
const CAM_H = 1.6; // camera height above the floor (world units)
const POST_H = 1.0;
const ROWS = [-2.3, -0.8, 0.7, 2.2]; // lane dividers (world x)
const DEPTHS = Array.from({length: 9}, (_, i) => 1.5 + i * 1.15);

const project = (x: number, y: number, z: number) => ({
	x: VP.x + (x * FOCAL) / z,
	y: VP.y + ((CAM_H - y) * FOCAL) / z,
});

export const QueueBarriers: React.FC<{frame: number}> = ({frame}) => {
	const drift = -frame * 0.006;
	const fog = (z: number) => Math.max(0, 1 - (z - 1.5) / 11);

	const posts: React.ReactNode[] = [];
	const belts: React.ReactNode[] = [];
	ROWS.forEach((rx, r) => {
		const x = rx + drift;
		DEPTHS.forEach((z, i) => {
			const base = project(x, 0, z);
			const top = project(x, POST_H, z);
			const w = (0.07 * FOCAL) / z;
			const o = fog(z);
			posts.push(
				<g key={`p${r}-${i}`} opacity={o}>
					<ellipse cx={base.x} cy={base.y} rx={w * 2.6} ry={w * 0.55} fill={C.coldInk} opacity={0.18} />
					<ellipse cx={base.x} cy={base.y - w * 0.2} rx={w * 2.1} ry={w * 0.5} fill="url(#qb-chrome)" />
					<rect x={base.x - w / 2} y={top.y} width={w} height={base.y - top.y} rx={w / 2} fill="url(#qb-chrome)" />
					<ellipse cx={top.x} cy={top.y} rx={w * 0.75} ry={w * 0.35} fill="#F3F6F7" />
				</g>,
			);
			if (i < DEPTHS.length - 1) {
				const z2 = DEPTHS[i + 1];
				const a = project(x, POST_H * 0.88, z);
				const b = project(x, POST_H * 0.88, z2);
				const sag = ((0.12 * FOCAL) / ((z + z2) / 2)) * 0.6;
				const bw = (0.05 * FOCAL) / ((z + z2) / 2);
				belts.push(
					<path
						key={`b${r}-${i}`}
						d={`M ${a.x} ${a.y} Q ${(a.x + b.x) / 2} ${(a.y + b.y) / 2 + sag} ${b.x} ${b.y}`}
						stroke={C.coldInk}
						strokeOpacity={0.55 * fog(z2)}
						strokeWidth={bw}
						fill="none"
						strokeLinecap="round"
					/>,
				);
			}
		});
	});

	return (
		<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
			<defs>
				<linearGradient id="qb-chrome" x1="0" y1="0" x2="1" y2="0">
					<stop offset="0" stopColor="#7E878C" />
					<stop offset="0.35" stopColor="#F4F7F8" />
					<stop offset="0.6" stopColor="#AEB6BA" />
					<stop offset="1" stopColor="#6B7378" />
				</linearGradient>
			</defs>
			{/* far to near so nearer posts overlap */}
			{belts.reverse()}
			{posts.reverse()}
		</svg>
	);
};
