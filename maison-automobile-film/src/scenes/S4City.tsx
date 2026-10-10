import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Glass} from '../components/Glass';
import {Squeeze, TypeOn} from '../components/KineticText';
import {keys, ramp} from '../lib/anim';
import {C, E, F, wide} from '../lib/theme';

/**
 * TERRITORY — MONTRÉAL ↔ LAVAL as typography laid out like a map:
 * Laval on top (north), Rivière des Prairies, Montréal below.
 * The names fold into MTL / LAV, a copper route links them, and the
 * river straightens into the line that will carry the brand.
 */

export const BRAND_LINE_Y = 960;
const RIVER_Y = 905;

const riverPath = (amp: number, y: number) => {
	const pts: string[] = [];
	for (let x = -40; x <= 1120; x += 20) {
		const yy = y + Math.sin(x / 120 + 0.6) * amp + Math.sin(x / 47) * amp * 0.25;
		pts.push(`${x === -40 ? 'M' : 'L'} ${x} ${yy.toFixed(2)}`);
	}
	return pts.join(' ');
};

export const S4City: React.FC = () => {
	const f = useCurrentFrame();

	const mtlX = keys(f, [0, 9], [520, 0], E.punch) - f * 0.35;
	const lavX = keys(f, [7, 16], [-520, 0], E.punch) + f * 0.35;
	const mtlBlur = ramp(f, [0, 9], [16, 0]);
	const lavBlur = ramp(f, [7, 16], [16, 0]);

	const exit = ramp(f, [118, 133], [0, 1], E.inOut);
	const fade = 1 - ramp(f, [116, 126], [0, 1], E.accel);

	const riverDraw = ramp(f, [12, 30], [0, 1], E.inOut);
	const amp = 16 * (1 - exit);
	const riverY = RIVER_Y + (BRAND_LINE_Y - RIVER_Y) * exit;

	const route = ramp(f, [60, 76], [0, 1], E.inOut);
	const travel = f > 76 ? 0.5 - 0.5 * Math.cos(((f - 76) / 30) * Math.PI) : 0;
	const routeA = {x: 996, y: 1250}; // MTL
	const routeB = {x: 996, y: 700}; // LAV
	const routeD = `M ${routeA.x} ${routeA.y} C ${routeA.x + 40} ${routeA.y - 220}, ${routeB.x - 60} ${routeB.y + 220}, ${routeB.x} ${routeB.y}`;
	const bez = (t: number) => {
		const p0 = routeA;
		const p1 = {x: routeA.x + 40, y: routeA.y - 220};
		const p2 = {x: routeB.x - 60, y: routeB.y + 220};
		const p3 = routeB;
		const u = 1 - t;
		return {
			x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
			y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
		};
	};
	const car = bez(travel);
	const beatPulse = Math.exp(-((f % 15) / 4));

	const nameStyle: React.CSSProperties = {
		...wide(62, 900),
		fontSize: 238,
		lineHeight: 0.8,
		letterSpacing: '-0.01em',
		color: C.bone,
		whiteSpace: 'nowrap',
	};

	return (
		<AbsoluteFill style={{background: C.ink, overflow: 'hidden'}}>
			{/* survey grid */}
			<AbsoluteFill
				style={{
					opacity: 0.5 * fade,
					backgroundImage:
						'linear-gradient(90deg, rgba(238,233,224,0.06) 1px, transparent 1px), linear-gradient(0deg, rgba(238,233,224,0.06) 1px, transparent 1px)',
					backgroundSize: '90px 90px',
					backgroundPosition: `${-f * 0.6}px ${f * 0.3}px`,
				}}
			/>

			<AbsoluteFill style={{opacity: fade}}>
				{/* LAVAL — north, on glass */}
				<Glass left={36 + lavX} top={300} width={780} height={262} radius={56} shine={ramp(f, [0, 135], [0, 1])} />
				<div style={{position: 'absolute', left: 56 + lavX, top: 330, filter: lavBlur > 0.5 ? `blur(${lavBlur}px)` : undefined, ...nameStyle}}>
					<Squeeze text="LAVAL" keep={[0, 1, 2]} frame={f} start={58} dur={12} charWidth={0.75} />
				</div>

				{/* MONTRÉAL — south, on glass */}
				<Glass left={40 + mtlX} top={966} width={1000} height={262} radius={56} shine={ramp(f, [0, 135], [0, 1])} />
				<div style={{position: 'absolute', left: 46 + mtlX, top: 1000, filter: mtlBlur > 0.5 ? `blur(${mtlBlur}px)` : undefined, ...nameStyle}}>
					<Squeeze text="MONTRÉAL" keep={[0, 3, 7]} frame={f} start={56} dur={12} charWidth={0.75} />
				</div>

				{/* river label */}
				<div style={{position: 'absolute', left: 64, top: RIVER_Y - 62, fontFamily: F.mono, fontSize: 20, letterSpacing: '0.3em', color: C.smoke}}>
					<TypeOn text="RIVIÈRE DES PRAIRIES" frame={f} start={22} cps={1.4} cursor={false} />
				</div>

				{/* copy, right column — appears once names have folded */}
				<Glass left={530} top={372} width={500} height={300} radius={56} shine={ramp(f, [0, 135], [0, 1])} opacity={ramp(f, [78, 92])} />
				<div style={{position: 'absolute', left: 560, top: 1040, color: C.bone}}>
					<div style={{fontFamily: F.mono, fontSize: 24, letterSpacing: '0.24em', color: C.copper}}>
						<TypeOn text="REMISE COORDONNÉE" frame={f} start={70} cps={1.2} cursorColor={C.copper} />
					</div>
				</div>
				<div
					style={{
						position: 'absolute',
						left: 560,
						top: 410,
						fontFamily: F.serif,
						fontStyle: 'italic',
						fontSize: 66,
						lineHeight: 1.08,
						color: C.bone,
					}}
				>
					{['selon votre', 'lieu et', 'votre horaire.'].map((l, i) => (
						<div key={i} style={{overflow: 'hidden'}}>
							<div style={{transform: `translateY(${(1 - ramp(f, [80 + i * 5, 94 + i * 5], [0, 1], E.expoOut)) * 105}%)`}}>{l}</div>
						</div>
					))}
				</div>
			</AbsoluteFill>

			<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
				{/* river → becomes the brand line */}
				<path
					d={riverPath(amp, riverY)}
					fill="none"
					stroke={exit > 0 ? '#fff' : C.stone}
					strokeOpacity={0.55 + 0.45 * exit}
					strokeWidth={2 + exit * 0.5}
					pathLength={1}
					strokeDasharray={`${riverDraw} 1`}
				/>
				<g opacity={fade}>
					{/* route */}
					<path d={routeD} fill="none" stroke={C.copper} strokeWidth={3} pathLength={1} strokeDasharray={`${route} 1`} />
					<path d={routeD} fill="none" stroke={C.copper} strokeWidth={1} strokeOpacity={0.4} strokeDasharray="4 10" />
					{[routeA, routeB].map((p, i) => {
						const s = ramp(f, [58 + i * 14, 68 + i * 14], [0, 1], E.backOut);
						return (
							<g key={i} transform={`translate(${p.x} ${p.y}) scale(${s})`}>
								<circle r={20} fill="none" stroke={C.copper} strokeWidth={2} />
								<line x1={-34} x2={-24} stroke={C.copper} strokeWidth={2} />
								<line x1={24} x2={34} stroke={C.copper} strokeWidth={2} />
								<line y1={-34} y2={-24} stroke={C.copper} strokeWidth={2} />
								<line y1={24} y2={34} stroke={C.copper} strokeWidth={2} />
							</g>
						);
					})}
					{f > 76 && (
						<g transform={`translate(${car.x} ${car.y})`}>
							<circle r={10 + beatPulse * 14} fill={C.copper} opacity={0.18 * beatPulse} />
							<circle r={9} fill={C.copperHot} />
						</g>
					)}
				</g>
			</svg>

		</AbsoluteFill>
	);
};
