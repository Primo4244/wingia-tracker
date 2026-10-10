import React, {useId} from 'react';
import {C} from '../lib/theme';

/**
 * Studio-lit vehicle silhouettes, drawn as vectors so they stay razor sharp
 * at any optical zoom. Deliberately generic body styles — no make or model is
 * implied. Replace with real fleet photography via <VehicleReveal src=… />
 * once Maison Automobile assets are available.
 */

type Wheel = {x: number; y: number; r: number};
type Shape = {
	body: string;
	glass: string;
	shoulder: string;
	rocker: string;
	pillar: string;
	head: [number, number, number, number];
	tail: [number, number, number, number];
	wheels: [Wheel, Wheel];
	ground: number;
};

export const SHAPES: Record<'sedan' | 'suv' | 'compact', Shape> = {
	sedan: {
		body: 'M 40 252 L 34 222 C 32 202 38 186 56 176 L 104 160 C 150 152 186 148 220 144 C 276 112 336 84 414 74 C 474 67 540 69 592 81 C 634 92 672 116 704 136 C 784 146 872 154 932 168 C 958 175 972 190 975 212 L 970 252 L 853 252 A 72 72 0 1 0 711 252 L 271 252 A 72 72 0 1 0 129 252 Z',
		glass: 'M 246 146 C 298 116 346 92 414 84 C 472 78 536 80 580 90 C 612 99 642 116 666 134 L 662 140 L 252 150 Z',
		shoulder: 'M 64 176 C 300 160 700 156 952 178',
		rocker: 'M 286 238 L 696 238',
		pillar: 'M 452 84 L 446 150',
		head: [902, 172, 968, 186],
		tail: [40, 186, 96, 166],
		wheels: [
			{x: 200, y: 238, r: 60},
			{x: 782, y: 238, r: 60},
		],
		ground: 298,
	},
	suv: {
		body: 'M 124 244 L 120 140 C 120 110 128 92 144 84 L 196 50 C 220 40 300 36 420 36 C 540 36 600 40 630 50 C 668 64 712 96 742 120 C 800 128 860 136 886 150 C 898 160 904 178 904 200 L 900 244 L 828 244 A 80 80 0 1 0 672 244 L 348 244 A 80 80 0 1 0 192 244 Z',
		glass: 'M 176 74 L 206 56 C 240 48 320 46 420 46 C 530 46 590 50 618 58 C 650 72 684 96 708 116 L 704 122 L 178 124 Z',
		shoulder: 'M 124 150 C 340 142 640 140 900 154',
		rocker: 'M 360 228 L 660 228',
		pillar: 'M 470 46 L 468 122',
		head: [850, 142, 898, 152],
		tail: [122, 96, 122, 150],
		wheels: [
			{x: 270, y: 228, r: 70},
			{x: 750, y: 228, r: 70},
		],
		ground: 298,
	},
	compact: {
		body: 'M 166 254 L 160 196 C 158 172 162 150 170 132 L 196 104 C 230 90 290 82 380 80 C 460 80 520 86 556 100 C 592 116 622 134 650 150 C 720 158 790 166 826 180 C 846 190 856 206 856 226 L 852 254 L 787 254 A 68 68 0 1 0 653 254 L 347 254 A 68 68 0 1 0 213 254 Z',
		glass: 'M 186 128 L 206 108 C 240 96 300 90 380 88 C 456 88 510 94 542 106 C 576 120 602 136 620 148 L 614 152 L 186 152 Z',
		shoulder: 'M 164 178 C 380 168 640 166 848 186',
		rocker: 'M 356 240 L 644 240',
		pillar: 'M 410 88 L 408 152',
		head: [806, 176, 850, 188],
		tail: [164, 130, 164, 172],
		wheels: [
			{x: 280, y: 242, r: 58},
			{x: 720, y: 242, r: 58},
		],
		ground: 298,
	},
};

export type Paint = 'ink' | 'pearl' | 'graphite';

const PAINT: Record<Paint, {top: string; mid: string; low: string; rim: string; spec: number}> = {
	ink: {top: '#2a2a2e', mid: '#111113', low: '#060607', rim: '#ffffff', spec: 0.55},
	graphite: {top: '#4a4b50', mid: '#26272b', low: '#0d0d0f', rim: '#ffffff', spec: 0.5},
	pearl: {top: '#f4f1ea', mid: '#cfcac1', low: '#5d5a55', rim: '#ffffff', spec: 0.75},
};

export type VehicleProps = {
	type?: keyof typeof SHAPES;
	paint?: Paint;
	/** 0→1 light-painting stroke of the silhouette */
	draw?: number;
	/** 0→1 body lit (fill + highlights) */
	lit?: number;
	/** -0.3→1.3 position of the travelling reflection band */
	sweep?: number;
	/** degrees */
	wheelAngle?: number;
	/** 0→1 headlight intensity */
	headlight?: number;
	/** horizontal motion blur in viewBox units */
	blur?: number;
	reflection?: boolean;
	silhouette?: boolean;
	style?: React.CSSProperties;
	width?: number;
};

export const WheelArt: React.FC<{w: Wheel; angle: number; id: string; lit: number}> = ({w, angle, id, lit}) => {
	const spokes = 5;
	const {x, y, r} = w;
	const spoke = (side: 1 | -1) =>
		`M ${x + side * r * 0.045} ${y - r * 0.16} L ${x + side * r * 0.12} ${y - r * 0.69} L ${x + side * r * 0.035} ${y - r * 0.7} L ${x + side * r * 0.008} ${y - r * 0.16} Z`;
	return (
		<g>
			{/* tyre + sidewall */}
			<circle cx={x} cy={y} r={r} fill="#060606" />
			<circle cx={x} cy={y} r={r * 0.9} fill="none" stroke="#141414" strokeWidth={r * 0.06} opacity={lit} />
			<circle cx={x} cy={y} r={r - 1.2} fill="none" stroke="#2c2c2c" strokeWidth={1.2} opacity={lit} />
			{/* barrel */}
			<circle cx={x} cy={y} r={r * 0.75} fill={`url(#${id}-rim)`} opacity={0.35 + 0.65 * lit} />
			<circle cx={x} cy={y} r={r * 0.69} fill="#09090a" />
			{/* brake disc + caliper */}
			<circle cx={x} cy={y} r={r * 0.5} fill="none" stroke="#2e2e30" strokeWidth={r * 0.12} opacity={lit} />
			<circle cx={x} cy={y} r={r * 0.5} fill="none" stroke="#4a4a4d" strokeWidth={0.8} strokeDasharray="2 3" opacity={0.6 * lit} />
			<path d={`M ${x + r * 0.3} ${y - r * 0.42} A ${r * 0.52} ${r * 0.52} 0 0 1 ${x + r * 0.5} ${y - r * 0.12}`} stroke={C.copper} strokeWidth={r * 0.1} fill="none" strokeLinecap="round" opacity={0.85 * lit} />
			<g transform={`rotate(${angle} ${x} ${y})`} opacity={0.3 + 0.7 * lit}>
				{Array.from({length: spokes}).map((_, i) => (
					<g key={i} transform={`rotate(${(360 / spokes) * i} ${x} ${y})`}>
						{([1, -1] as const).map((side) => (
							<path key={side} d={spoke(side)} fill={`url(#${id}-spoke)`} stroke="#fff" strokeOpacity={0.35} strokeWidth={0.5} />
						))}
					</g>
				))}
				{/* lug nuts */}
				{Array.from({length: spokes}).map((_, i) => {
					const a = ((360 / spokes) * i + 36) * (Math.PI / 180);
					return <circle key={i} cx={x + Math.sin(a) * r * 0.12} cy={y - Math.cos(a) * r * 0.12} r={r * 0.022} fill="#999" />;
				})}
				<circle cx={x} cy={y} r={r * 0.17} fill="none" stroke="#6d6d70" strokeWidth={1.2} />
				<circle cx={x} cy={y} r={r * 0.055} fill={C.copper} />
			</g>
			{/* polished lip */}
			<circle cx={x} cy={y} r={r * 0.745} fill="none" stroke="#d6d6d6" strokeWidth={1.4} opacity={0.75 * lit} />
			<circle cx={x} cy={y} r={r * 0.745} fill="none" stroke="#fff" strokeWidth={2} strokeDasharray={`${r * 0.9} ${r * 4}`} transform={`rotate(-140 ${x} ${y})`} opacity={0.9 * lit} />
		</g>
	);
};

export const Vehicle: React.FC<VehicleProps> = ({
	type = 'sedan',
	paint = 'ink',
	draw = 1,
	lit = 1,
	sweep = -1,
	wheelAngle = 0,
	headlight = 0,
	blur = 0,
	reflection = true,
	silhouette = false,
	style,
	width = 1000,
}) => {
	const raw = useId().replace(/:/g, '');
	const id = `v${raw}`;
	const s = SHAPES[type];
	const p = PAINT[paint];
	const [hx1, hy1, hx2, hy2] = s.head;
	const [tx1, ty1, tx2, ty2] = s.tail;

	const body = (
		<g>
			{/* body */}
			<path d={s.body} fill={silhouette ? C.ink : `url(#${id}-paint)`} opacity={silhouette ? 1 : lit} />
			{!silhouette && (
				<g opacity={lit}>
					<path d={s.glass} fill={`url(#${id}-glass)`} />
					<path d={s.pillar} stroke={p.low} strokeWidth={10} />
					{/* travelling studio reflection, clipped to the body */}
					<g clipPath={`url(#${id}-clip)`}>
						<rect
							x={sweep * 1300 - 300}
							y={-40}
							width={150}
							height={400}
							fill={`url(#${id}-band)`}
							transform={`skewX(-28)`}
						/>
						<rect
							x={sweep * 1300 - 120}
							y={-40}
							width={26}
							height={400}
							fill={`url(#${id}-band)`}
							opacity={0.8}
							transform={`skewX(-28)`}
						/>
						{/* soft top light */}
						<rect x={0} y={0} width={1000} height={320} fill={`url(#${id}-top)`} />
					</g>
					<path d={s.shoulder} stroke="#fff" strokeOpacity={p.spec * 0.55} strokeWidth={1.6} fill="none" />
					<path d={s.rocker} stroke="#fff" strokeOpacity={0.12} strokeWidth={1.2} fill="none" />
					{/* tail light */}
					<line x1={tx1} y1={ty1} x2={tx2} y2={ty2} stroke={C.copper} strokeWidth={5} strokeLinecap="round" opacity={0.9} />
				</g>
			)}
			<g opacity={Math.min(1, draw * 1.6)}>
				{s.wheels.map((w, i) => (
					<WheelArt key={i} w={w} angle={wheelAngle} id={id} lit={silhouette ? 0.15 : lit} />
				))}
			</g>
			{/* rim light — the silhouette edge catching the softbox */}
			<path
				d={s.body}
				fill="none"
				stroke={`url(#${id}-edge)`}
				strokeWidth={2.4}
				pathLength={1}
				strokeDasharray={draw >= 1 ? undefined : `${draw} 1`}
				strokeLinejoin="round"
			/>
			{/* headlight */}
			{headlight > 0 && (
				<g>
					<line x1={hx1} y1={hy1} x2={hx2} y2={hy2} stroke="#fff" strokeWidth={6} strokeLinecap="round" opacity={headlight} />
					<line x1={hx1} y1={hy1} x2={hx2} y2={hy2} stroke="#fff" strokeWidth={22} strokeLinecap="round" opacity={headlight * 0.18} filter={`url(#${id}-soft)`} />
				</g>
			)}
		</g>
	);

	return (
		<svg
			viewBox="0 0 1000 400"
			width={width}
			height={(width * 400) / 1000}
			style={{overflow: 'visible', ...style}}
		>
			<defs>
				<linearGradient id={`${id}-paint`} x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
					<stop offset="0" stopColor={p.top} />
					<stop offset="0.45" stopColor={p.mid} />
					<stop offset="1" stopColor={p.low} />
				</linearGradient>
				<linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="1">
					<stop offset="0" stopColor="#1a1a1d" />
					<stop offset="0.55" stopColor="#040405" />
					<stop offset="1" stopColor="#141416" />
				</linearGradient>
				<linearGradient id={`${id}-band`} x1="0" y1="0" x2="1" y2="0">
					<stop offset="0" stopColor="#fff" stopOpacity="0" />
					<stop offset="0.5" stopColor="#fff" stopOpacity={p.spec * 0.55} />
					<stop offset="1" stopColor="#fff" stopOpacity="0" />
				</linearGradient>
				<linearGradient id={`${id}-top`} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#fff" stopOpacity={0.14} />
					<stop offset="0.35" stopColor="#fff" stopOpacity={0} />
				</linearGradient>
				<linearGradient id={`${id}-edge`} x1="0" y1="40" x2="0" y2="270" gradientUnits="userSpaceOnUse">
					<stop offset="0.1" stopColor="#fff" stopOpacity={1} />
					<stop offset="0.55" stopColor="#fff" stopOpacity={0.55} />
					<stop offset="0.78" stopColor="#fff" stopOpacity={0.05} />
				</linearGradient>
				<radialGradient id={`${id}-rim`}>
					<stop offset="0.6" stopColor="#2b2b2d" />
					<stop offset="0.92" stopColor="#8e8e90" />
					<stop offset="1" stopColor="#3a3a3c" />
				</radialGradient>
				<linearGradient id={`${id}-spoke`} x1="0" y1="0" x2="1" y2="0">
					<stop offset="0" stopColor="#5e5e61" />
					<stop offset="0.5" stopColor="#c9c9cb" />
					<stop offset="1" stopColor="#3c3c3f" />
				</linearGradient>
				<clipPath id={`${id}-clip`}>
					<path d={s.body} />
				</clipPath>
				<filter id={`${id}-soft`} x="-50%" y="-200%" width="200%" height="500%">
					<feGaussianBlur stdDeviation="8" />
				</filter>
				<filter id={`${id}-mb`} x="-30%" y="-10%" width="160%" height="120%">
					<feGaussianBlur stdDeviation={`${blur} 0`} />
				</filter>
				<linearGradient id={`${id}-fade`} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#fff" stopOpacity={0.22} />
					<stop offset="0.35" stopColor="#fff" stopOpacity={0} />
				</linearGradient>
				<mask id={`${id}-reflmask`} maskUnits="userSpaceOnUse" x="-200" y={s.ground} width="1400" height="200">
					<rect x="-200" y={s.ground} width="1400" height="160" fill={`url(#${id}-fade)`} />
				</mask>
				<radialGradient id={`${id}-floor`}>
					<stop offset="0" stopColor="#fff" stopOpacity={0.09} />
					<stop offset="1" stopColor="#fff" stopOpacity={0} />
				</radialGradient>
			</defs>
			<g filter={blur > 0.2 ? `url(#${id}-mb)` : undefined}>
				{reflection && !silhouette && (
					<>
						<ellipse cx={500} cy={s.ground} rx={560} ry={26} fill={`url(#${id}-floor)`} opacity={lit} />
						<g mask={`url(#${id}-reflmask)`} opacity={lit}>
							<g transform={`translate(0 ${s.ground * 2}) scale(1 -1)`}>{body}</g>
						</g>
						<ellipse cx={500} cy={s.ground + 2} rx={430} ry={7} fill="#000" opacity={0.9 * lit} />
					</>
				)}
				{body}
			</g>
		</svg>
	);
};
