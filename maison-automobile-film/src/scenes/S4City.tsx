import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {GlassLabel} from '../components/Glass';
import {MaskRise} from '../components/KineticText';
import {ramp} from '../lib/anim';
import {QC_ORIGIN, QC_PATHS} from '../lib/quebec';
import {C, E, F, wide} from '../lib/theme';

/**
 * TERRITORY — the province of Québec.
 *   0–26    the outline is traced in light
 *   10–80   from Montréal, a wave lights the province up, dot by dot
 *   24–60   PARTOUT AU QUÉBEC. on glass over the map, then the delivery line
 *   108–135 the province flattens into the line that carries the logo (S5)
 */

export const BRAND_LINE_Y = 960;

const DOT = 18; // dot-grid pitch, px

export const S4City: React.FC = () => {
	const f = useCurrentFrame();

	const outline = ramp(f, [0, 26], [0, 1], E.inOut);
	const wave = ramp(f, [10, 80], [0, 1], E.quartOut);
	const waveR = 40 + 1500 * wave;
	const push = 1 + ramp(f, [0, 110], [0, 0.06], E.glide);

	const exit = ramp(f, [108, 130], [0, 1], E.inOut);
	const flat = 1 - 0.996 * exit;
	const copyOut = 1 - ramp(f, [104, 114], [0, 1]);
	const handoff = ramp(f, [118, 132], [0, 1]);

	// three soft pulses leave Montréal on the beat
	const pulses = [10, 25, 40].map((at) => {
		const p = ramp(f, [at, at + 45], [0, 1], E.quartOut);
		return {r: 30 + 1300 * p, o: (1 - p) * (f >= at ? 0.9 : 0)};
	});
	const beat = Math.exp(-((f % 15) / 4));

	return (
		<AbsoluteFill style={{background: C.ink, overflow: 'hidden'}}>
			<AbsoluteFill
				style={{
					transformOrigin: `540px ${BRAND_LINE_Y}px`,
					transform: `scaleY(${flat})`,
				}}
			>
				<AbsoluteFill style={{transformOrigin: `${QC_ORIGIN.x}px ${QC_ORIGIN.y}px`, transform: `scale(${push})`}}>
					<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
						<defs>
							<clipPath id="qc-shape">
								{QC_PATHS.map((d, i) => (
									<path key={i} d={d} />
								))}
							</clipPath>
							<pattern id="qc-dots" width={DOT} height={DOT} patternUnits="userSpaceOnUse">
								<circle cx={DOT / 2} cy={DOT / 2} r={2.6} fill="#fff" />
							</pattern>
							<radialGradient id="qc-front" gradientUnits="userSpaceOnUse" cx={QC_ORIGIN.x} cy={QC_ORIGIN.y} r={waveR}>
								<stop offset="0" stopColor="#fff" stopOpacity="0.55" />
								<stop offset="0.82" stopColor="#fff" stopOpacity="0.3" />
								<stop offset="0.97" stopColor="#fff" stopOpacity="1" />
								<stop offset="1" stopColor="#fff" stopOpacity="0" />
							</radialGradient>
							<mask id="qc-wave" maskUnits="userSpaceOnUse" x={0} y={0} width={1080} height={1920}>
								<circle cx={QC_ORIGIN.x} cy={QC_ORIGIN.y} r={waveR} fill="url(#qc-front)" />
							</mask>
							<filter id="qc-glow" x="-10%" y="-10%" width="120%" height="120%">
								<feGaussianBlur stdDeviation="6" result="b" />
								<feMerge>
									<feMergeNode in="b" />
									<feMergeNode in="SourceGraphic" />
								</feMerge>
							</filter>
						</defs>

						{/* the province lights up, dot by dot, from Montréal outward */}
						<g clipPath="url(#qc-shape)">
							<rect x={0} y={0} width={1080} height={1920} fill="#fff" opacity={0.04 * outline} />
							<rect x={0} y={0} width={1080} height={1920} fill="url(#qc-dots)" mask="url(#qc-wave)" opacity={0.85} />
							{pulses.map((p, i) => (
								<circle key={i} cx={QC_ORIGIN.x} cy={QC_ORIGIN.y} r={p.r} fill="none" stroke="#fff" strokeWidth={3} opacity={p.o * 0.6} />
							))}
						</g>

						{/* the outline, traced in light */}
						<g filter="url(#qc-glow)">
							{QC_PATHS.map((d, i) => (
								<path
									key={i}
									d={d}
									fill="none"
									stroke="#fff"
									strokeWidth={2.5 + 2 * exit}
									strokeLinejoin="round"
									pathLength={1}
									strokeDasharray={`${outline} 1`}
								/>
							))}
						</g>

						{/* the origin: Montréal / Laval */}
						<g opacity={ramp(f, [2, 8])}>
							<circle cx={QC_ORIGIN.x} cy={QC_ORIGIN.y} r={10 + beat * 12} fill="#fff" opacity={0.18 * beat} />
							<circle cx={QC_ORIGIN.x} cy={QC_ORIGIN.y} r={8} fill="#fff" />
						</g>
					</svg>
				</AbsoluteFill>
			</AbsoluteFill>

			{/* the claim, on glass over the lit map */}
			<GlassLabel top={600} padding="34px 64px 38px" radius={60} shine={ramp(f, [0, 135], [0, 1])} opacity={ramp(f, [22, 30]) * copyOut}>
				<div style={{...wide(100, 860), fontSize: 132, lineHeight: 0.98, letterSpacing: '-0.03em', color: C.bone}}>
					<MaskRise text="PARTOUT" frame={f} start={24} dur={12} stagger={1.1} />
				</div>
				<div style={{...wide(100, 860), fontSize: 132, lineHeight: 0.98, letterSpacing: '-0.03em', color: C.bone}}>
					<MaskRise text="AU QUÉBEC." frame={f} start={30} dur={12} stagger={1.1} />
				</div>
			</GlassLabel>

			<GlassLabel top={1080} padding="22px 44px 26px" radius={48} shine={ramp(f, [0, 135], [0, 1])} opacity={ramp(f, [50, 60]) * copyOut}>
				<div style={{fontFamily: F.mono, fontWeight: 500, fontSize: 26, letterSpacing: '0.08em', color: C.bone}}>REMISE COORDONNÉE</div>
				<div style={{fontFamily: F.serif, fontWeight: 300, fontSize: 48, lineHeight: 1.15, color: C.stone, marginTop: 6}}>
					selon votre lieu et votre horaire.
				</div>
			</GlassLabel>

			{/* handoff: a single line at the brand height, picked up by S5 */}
			<div
				style={{
					position: 'absolute',
					left: 0,
					top: BRAND_LINE_Y - 1,
					width: 1080,
					height: 2,
					background: '#fff',
					boxShadow: '0 0 14px rgba(255,255,255,0.45)',
					opacity: handoff,
				}}
			/>
		</AbsoluteFill>
	);
};
