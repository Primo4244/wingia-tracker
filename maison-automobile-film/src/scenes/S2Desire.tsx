import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {GlassLabel} from '../components/Glass';
import {MaskRise} from '../components/KineticText';
import {Vehicle} from '../components/Vehicle';
import {keys, ramp} from '../lib/anim';
import {C, E, F, wide} from '../lib/theme';
import {Y_LINE} from './S1Hook';

/**
 * DESIRE
 *  a  0–75    light paints the car — LA BONNE / VOITURE (type behind the body)
 *  b  75–150  the fleet in three bands, three speeds — DE L'ACCESSIBLE / AU PREMIUM
 *  c  150–240 optical zoom into the wheel → the rim becomes a dial — SÉLECTIONNÉE. / préparée.
 */

const A_END = 75;
const B_END = 150;

/* ------------------------------------------------------------------ part a */
const Reveal: React.FC<{f: number}> = ({f}) => {
	const lineScale = ramp(f, [0, 14], [1, 0], E.snap);
	const draw = ramp(f, [2, 28], [0, 1], E.inOut);
	const lit = ramp(f, [18, 42], [0, 1], E.quartOut);
	const head = f >= 20 ? ramp(f, [20, 23], [0, 1]) : 0;
	const push = ramp(f, [0, A_END], [1, 1.045], E.glide);
	const textIn = ramp(f, [8, 34], [0, 1], E.expoOut);

	return (
		<AbsoluteFill style={{background: C.ink, transform: `scale(${push})`}}>
			{/* floor gradient — a studio cyclorama */}
			<AbsoluteFill
				style={{
					background: `radial-gradient(70% 28% at 50% ${Y_LINE + 110}px, rgba(255,255,255,${0.07 * lit}) 0%, rgba(0,0,0,0) 70%)`,
				}}
			/>
			{/* headline pair on one glass panel — the car body passes over its lower edge */}
			<GlassLabel
				top={700}
				padding="34px 70px 30px"
				radius={60}
				shine={ramp(f, [0, A_END], [0, 1])}
				opacity={ramp(f, [6, 14])}
				transform={`translateX(${-f * 0.25}px)`}
			>
				<div style={{fontFamily: F.serif, fontWeight: 300, fontSize: 120, lineHeight: 1.05, color: C.stone}}>
					<MaskRise text="la bonne" frame={f} start={22} dur={16} stagger={1.2} />
				</div>
				<div style={{...wide(112, 840), fontSize: 176, lineHeight: 1, letterSpacing: '-0.03em', color: C.bone, opacity: textIn}}>
					<MaskRise text="VOITURE" frame={f} start={8} dur={14} stagger={1.4} />
				</div>
			</GlassLabel>

			{/* the light line from the hook, collapsing into the contour */}
			<div
				style={{
					position: 'absolute',
					left: 0,
					top: Y_LINE - 1,
					width: 1080,
					height: 2,
					background: '#fff',
					transform: `scaleX(${lineScale})`,
					boxShadow: '0 0 18px rgba(255,255,255,0.5)',
				}}
			/>
			<div style={{position: 'absolute', left: 40 + f * 0.4, top: Y_LINE - 180}}>
				<Vehicle
					type="sedan"
					paint="ink"
					width={1000}
					draw={draw}
					lit={lit}
					headlight={head}
					sweep={ramp(f, [24, 72], [-0.25, 1.25], E.glide)}
				/>
			</div>
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ part b */
type BandSpec = {
	type: 'sedan' | 'suv' | 'compact';
	paint: 'ink' | 'pearl' | 'graphite';
	flip: boolean;
	width: number;
	x: (f: number) => number;
	bg: string;
	dir: 1 | -1;
};

const BANDS: BandSpec[] = [
	{type: 'compact', paint: 'graphite', flip: true, width: 860, x: (f) => keys(f, [A_END, 240], [330, -260]), bg: '#141416', dir: 1},
	{type: 'sedan', paint: 'ink', flip: false, width: 1500, x: (f) => keys(f, [A_END, 186], [-760, -380], E.quartOut), bg: C.ink, dir: -1},
	{type: 'suv', paint: 'pearl', flip: false, width: 940, x: (f) => keys(f, [A_END, 240], [-330, 700], E.linear), bg: '#19191C', dir: 1},
];

const bandWheelAngle = (spec: BandSpec, f: number, r: number) => {
	const dx = spec.x(f) - spec.x(A_END);
	const scale = spec.width / 1000;
	return ((dx / (r * scale)) * 180) / Math.PI * 1.6 * (spec.flip ? -1 : 1);
};

/* where the band-2 sedan's front wheel sits on screen */
const B2_TOP = 960 - 180 * 1.5;
const wheelScreen = (f: number) => ({
	x: BANDS[1].x(f) + 782 * 1.5,
	y: B2_TOP + 238 * 1.5,
});

const Fleet: React.FC<{f: number}> = ({f}) => {
	// collapse: outer bands leave, middle band takes the frame
	const collapse = ramp(f, [138, 152], [0, 1], E.snap);
	const zoom = keys(f, [150, 184], [1, 4.45], E.inOut);
	const zp = ramp(f, [150, 184], [0, 1], E.inOut);
	const zoomBlur = Math.sin(Math.PI * zp) * 7;
	const w = wheelScreen(Math.min(f, 186));
	const tx = (540 - w.x) * zp;
	const ty = (960 - w.y) * zp;

	return (
		<AbsoluteFill style={{background: C.ink}}>
			{BANDS.map((b, i) => {
				const p = ramp(f, [A_END + i * 4, A_END + i * 4 + 11], [0, 1], E.expoOut);
				const fromLeft = i % 2 === 0;
				let top = i * 640;
				let height = 640;
				let offY = 0;
				if (i === 0) offY = -660 * collapse;
				if (i === 2) offY = 660 * collapse;
				if (i === 1) {
					top = 640 - 640 * collapse;
					height = 640 + 1280 * collapse;
				}
				const clip = fromLeft ? `inset(0 ${(1 - p) * 100}% 0 0)` : `inset(0 0 0 ${(1 - p) * 100}%)`;
				const isMid = i === 1;
				const car = (
					<div
						style={{
							position: 'absolute',
							left: b.x(f),
							top: isMid ? B2_TOP - top : i === 0 ? 262 : 250,
							transform: b.flip ? 'scaleX(-1)' : undefined,
						}}
					>
						<Vehicle
							type={b.type}
							paint={b.paint}
							width={b.width}
							wheelAngle={bandWheelAngle(b, f, b.type === 'suv' ? 70 : 58)}
							sweep={ramp(f, [A_END + i * 6, A_END + 70 + i * 6], [-0.2, 1.2], E.glide)}
							headlight={1}
							blur={isMid ? 0 : 3}
						/>
					</div>
				);
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: 0,
							width: 1080,
							top: top + offY,
							height,
							overflow: 'hidden',
							clipPath: clip,
							background: b.bg,
						}}
					>
						<div
							style={{
								position: 'absolute',
								inset: 0,
								background: `radial-gradient(80% 40% at 50% 75%, rgba(255,255,255,0.06), rgba(0,0,0,0) 70%)`,
							}}
						/>
						{isMid ? (
							<div
								style={{
									position: 'absolute',
									inset: 0,
									transformOrigin: `${w.x}px ${w.y - top}px`,
									transform: `translate(${tx}px, ${ty}px) scale(${zoom})`,
									filter: zoomBlur > 0.3 ? `blur(${zoomBlur}px)` : undefined,
								}}
							>
								{car}
							</div>
						) : (
							car
						)}
						<div
							style={{
								position: 'absolute',
								[fromLeft ? 'right' : 'left']: 56,
								bottom: 34,
								fontFamily: F.mono,
								fontSize: 22,
								letterSpacing: '0.08em',
								color: C.stone,
								opacity: 1 - collapse,
							}}
						>
							{`0${i + 1} / 03`}
						</div>
					</div>
				);
			})}
			{/* hairline separators */}
			{[640, 1280].map((y, i) => (
				<div
					key={y}
					style={{
						position: 'absolute',
						left: 0,
						right: 0,
						top: y - 1 + (i === 0 ? -660 : 660) * collapse,
						height: 2,
						background: C.ink,
						opacity: 1 - collapse,
					}}
				/>
			))}
			{/* copy — on glass, at the top of its band, clear of the cars */}
			<GlassLabel top={70 - 660 * collapse} padding="22px 46px" shine={ramp(f, [A_END, 150], [0, 1])} opacity={ramp(f, [84, 96])}>
				<div style={{...wide(100, 820), fontSize: 88, lineHeight: 1, letterSpacing: '-0.02em', color: C.bone}}>
					<MaskRise text="DE L'ACCESSIBLE" frame={f} start={86} dur={12} stagger={0.9} />
				</div>
			</GlassLabel>
			<GlassLabel top={1312 + 660 * collapse} padding="22px 46px" shine={ramp(f, [A_END, 150], [0, 1])} opacity={ramp(f, [102, 114])}>
				<div style={{...wide(100, 820), fontSize: 88, lineHeight: 1, letterSpacing: '-0.02em', color: C.bone}}>
					<MaskRise text="AU PREMIUM." frame={f} start={104} dur={12} stagger={0.9} from={-110} />
				</div>
			</GlassLabel>
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ part c */
const Dial: React.FC<{f: number}> = ({f}) => {
	const ticks = 120;
	const shown = ramp(f, [178, 200], [0, ticks], E.quartOut);
	const ringRot = keys(f, [178, 205, 240], [-60, 4, 0], E.expoOut);
	const textOp = ramp(f, [186, 196]);
	const spec = ramp(f, [204, 226], [0, 1], E.inOut);
	const R = 470;

	return (
		<AbsoluteFill>
			<svg width={1080} height={1920} style={{position: 'absolute'}}>
				<defs>
					<path id="dialText" d={`M 540 ${960 - 520} a 520 520 0 1 1 -0.1 0`} />
					<linearGradient id="specBand" x1="0" y1="0" x2="1" y2="0">
						<stop offset="0" stopColor="#fff" stopOpacity="0" />
						<stop offset="0.5" stopColor="#fff" stopOpacity="0.5" />
						<stop offset="1" stopColor="#fff" stopOpacity="0" />
					</linearGradient>
					<clipPath id="wheelClip">
						<circle cx={540} cy={960} r={300} />
					</clipPath>
				</defs>
				<g transform={`rotate(${ringRot} 540 960)`}>
					{Array.from({length: ticks}).map((_, i) => {
						if (i >= shown) return null;
						const a = (i / ticks) * Math.PI * 2 - Math.PI / 2;
						const major = i % 10 === 0;
						const r1 = major ? R - 34 : R - 14;
						return (
							<line
								key={i}
								x1={540 + Math.cos(a) * r1}
								y1={960 + Math.sin(a) * r1}
								x2={540 + Math.cos(a) * R}
								y2={960 + Math.sin(a) * R}
								stroke={major ? C.copper : C.bone}
								strokeWidth={major ? 3 : 1.5}
								opacity={major ? 1 : 0.55}
							/>
						);
					})}
				</g>
				<g transform={`rotate(${f * 0.35} 540 960)`} opacity={textOp}>
					<text fontFamily={F.mono} fontSize={24} letterSpacing="5" fill={C.stone}>
						<textPath href="#dialText">
							SÉLECTIONNÉE — PRÉPARÉE — SÉLECTIONNÉE — PRÉPARÉE — SÉLECTIONNÉE — PRÉPARÉE —
						</textPath>
					</text>
				</g>
				{/* the polish pass: a specular band sweeping across the rim */}
				{spec > 0 && spec < 1 && (
					<g clipPath="url(#wheelClip)" style={{mixBlendMode: 'screen'}}>
						<rect
							x={240 + spec * 700 - 260}
							y={600}
							width={160}
							height={720}
							fill="url(#specBand)"
							transform={`skewX(-24)`}
						/>
					</g>
				)}
			</svg>
			{/* SÉLECTIONNÉE. */}
			<GlassLabel top={220} padding="24px 52px" shine={ramp(f, [176, 226], [0, 1])} opacity={ramp(f, [182, 188])}>
				<div style={{...wide(100, 820), fontSize: 96, lineHeight: 1, letterSpacing: '-0.02em', color: C.bone}}>
					<MaskRise text="SÉLECTIONNÉE." frame={f} start={182} dur={12} stagger={0.8} />
				</div>
			</GlassLabel>
			{/* préparée. — revealed by the same light that polishes the rim */}
			<GlassLabel top={1300} padding="22px 60px 34px" shine={ramp(f, [204, 226], [0, 1])} opacity={ramp(f, [204, 212])}>
				<div
					style={{
						fontFamily: F.serif,
						fontWeight: 300,
						fontSize: 150,
						lineHeight: 1.1,
						color: C.bone,
						clipPath: `inset(0 ${(1 - ramp(f, [204, 222], [0, 1], E.inOut)) * 100}% 0 0)`,
					}}
				>
					préparée.
				</div>
			</GlassLabel>
		</AbsoluteFill>
	);
};

export const S2Desire: React.FC = () => {
	const f = useCurrentFrame();
	// exit: the whole dial collapses into a point → becomes the selector in S3
	const exit = ramp(f, [224, 240], [0, 1], E.accel);
	const exitScale = 1 - 0.94 * exit;

	return (
		<AbsoluteFill style={{background: C.ink, overflow: 'hidden'}}>
			{f < A_END ? (
				<Reveal f={f} />
			) : (
				<AbsoluteFill
					style={{
						transformOrigin: '540px 960px',
						transform: `scale(${exitScale}) rotate(${exit * 50}deg)`,
					}}
				>
					<Fleet f={f} />
					{f >= 176 && (
						<AbsoluteFill style={{opacity: 1 - ramp(f, [222, 230])}}>
							<Dial f={f} />
						</AbsoluteFill>
					)}
				</AbsoluteFill>
			)}
		</AbsoluteFill>
	);
};
