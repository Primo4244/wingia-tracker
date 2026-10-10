import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Glass, GlassLabel} from '../components/Glass';
import {MaskRise, SlotRoll} from '../components/KineticText';
import {Vehicle} from '../components/Vehicle';
import {keys, ramp} from '../lib/anim';
import {C, E, F, wide} from '../lib/theme';

/**
 * PROCESS — one continuous gesture, never "step 1 / 2 / 3".
 *  0–45    CHOISISSEZ.     a selector strip decelerates, a bracket locks
 *  45–105  ON COORDONNE.   the bracket flattens into a timeline: lieu → horaire
 *  105–150 LES CLÉS.       a key drops in on a pendulum
 */

const LINE_Y = 1010;
const CARD = 720;
const ORDER: Array<'sedan' | 'suv' | 'compact'> = ['suv', 'compact', 'sedan', 'suv', 'compact', 'sedan', 'suv', 'compact'];
const TARGET = 5;

const stripX = (f: number) => keys(f, [0, 40], [540 - TARGET * CARD + 4600, 540 - TARGET * CARD], E.expoOut);

const Key: React.FC<{lit: number}> = ({lit}) => (
	<svg width={260} height={420} viewBox="0 0 260 420" style={{overflow: 'visible'}}>
		<defs>
			<linearGradient id="fob" x1="0" y1="0" x2="1" y2="1">
				<stop offset="0" stopColor="#2c2c30" />
				<stop offset="0.5" stopColor="#111113" />
				<stop offset="1" stopColor="#050506" />
			</linearGradient>
			<linearGradient id="fobSpec" x1="0" y1="0" x2="1" y2="0">
				<stop offset="0" stopColor="#fff" stopOpacity="0" />
				<stop offset="0.5" stopColor="#fff" stopOpacity="0.35" />
				<stop offset="1" stopColor="#fff" stopOpacity="0" />
			</linearGradient>
			<clipPath id="fobClip">
				<rect x={55} y={120} width={150} height={260} rx={62} />
			</clipPath>
		</defs>
		{/* ring */}
		<circle cx={130} cy={44} r={36} fill="none" stroke="#8d8a85" strokeWidth={7} />
		<circle cx={130} cy={44} r={36} fill="none" stroke="#fff" strokeOpacity={0.5} strokeWidth={2} strokeDasharray="40 400" />
		<rect x={118} y={78} width={24} height={50} rx={8} fill="#2a2a2d" />
		{/* fob */}
		<rect x={55} y={120} width={150} height={260} rx={62} fill="url(#fob)" />
		<g clipPath="url(#fobClip)">
			<rect x={-60 + lit * 260} y={80} width={70} height={340} fill="url(#fobSpec)" transform="skewX(-18)" />
		</g>
		<rect x={55} y={120} width={150} height={260} rx={62} fill="none" stroke="#fff" strokeOpacity={0.18} strokeWidth={2} />
		<circle cx={130} cy={210} r={22} fill="none" stroke="#5a5753" strokeWidth={2} />
		<circle cx={130} cy={276} r={22} fill="none" stroke="#5a5753" strokeWidth={2} />
		<line x1={112} y1={336} x2={148} y2={336} stroke={C.copper} strokeWidth={4} strokeLinecap="round" />
	</svg>
);

export const S3Process: React.FC = () => {
	const f = useCurrentFrame();

	// iris in from the collapsed wheel of S2
	const iris = keys(f, [0, 14], [28, 1250], E.expoOut);

	/* ---------- a: choose */
	const sx = stripX(f);
	const vel = Math.abs(stripX(f + 0.5) - stripX(f - 0.5));
	const lock = ramp(f, [30, 42], [0, 1], E.backOut);
	const dim = ramp(f, [38, 46], [1, 0.18]);

	/* ---------- b: coordinate */
	const flatten = ramp(f, [45, 56], [0, 1], E.snap);
	const halfH = 175 * (1 - flatten);
	const halfW = 345 + 105 * ramp(f, [45, 58], [0, 1], E.snap);
	const lineDraw = ramp(f, [52, 62], [0, 1], E.expoOut);
	const pinPop = ramp(f, [58, 68], [0, 1], E.backOut);
	const clockPop = ramp(f, [63, 73], [0, 1], E.backOut);
	const dot = ramp(f, [68, 96], [0, 1], E.inOut);
	const clockSpin = keys(f, [63, 98], [0, 720 + 135], E.expoOut);
	const stripSquash = 1 - ramp(f, [45, 55], [0, 1], E.snap);

	/* ---------- c: keys */
	const t = f - 105;
	const cord = ramp(f, [105, 113], [0, 1], E.expoOut);
	const theta = t >= 0 ? 26 * Math.exp(-t / 13) * Math.cos(t * 0.34) : 0;
	const wipe = ramp(f, [140, 150], [0, 1], E.accel);

	const phaseA = f < 45;
	const phaseB = f >= 45 && f < 105;
	const phaseC = f >= 105;

	/* selector bracket → glass panel: it locks around the chosen car, then flattens into the timeline */
	const gScale = 1.35 - 0.35 * lock;
	const gW = 2 * halfW * gScale;
	const gH = 2 * halfH * gScale;
	const shine = ramp(f, [0, 150], [0, 1], E.glide);

	return (
		<AbsoluteFill style={{background: C.ink, overflow: 'hidden'}}>
			<AbsoluteFill style={{background: 'radial-gradient(90% 60% at 50% 46%, #FFFFFF 0%, #EDEDF0 55%, #D2D2D7 100%)', clipPath: `circle(${iris}px at 540px 960px)`}}>
				{/* faint paper ruling */}
				<AbsoluteFill
					style={{
						backgroundImage: `linear-gradient(90deg, rgba(10,10,11,0.045) 1px, transparent 1px)`,
						backgroundSize: '90px 100%',
						backgroundPosition: '0 0',
					}}
				/>

				{/* ------------------------------------------------ strip + bracket */}
				{(phaseA || phaseB) && (
					<>
						<div
							style={{
								position: 'absolute',
								left: 0,
								top: LINE_Y - 200,
								width: 1080,
								height: 400,
								transformOrigin: `540px 200px`,
								transform: `scaleY(${stripSquash})`,
								opacity: stripSquash,
							}}
						>
							{ORDER.map((type, i) => {
								const cx = sx + i * CARD;
								if (cx < -500 || cx > 1600) return null;
								const sel = i === TARGET;
								return (
									<div
										key={i}
										style={{
											position: 'absolute',
											left: cx - 320,
											top: 60,
											opacity: sel ? 1 : dim,
										}}
									>
										<Vehicle
											type={type}
											paint="graphite"
											width={640}
											reflection={false}
											headlight={sel ? ramp(f, [38, 41]) : 0}
											sweep={sel ? ramp(f, [36, 60], [-0.2, 1.2]) : -1}
											blur={Math.min(30, vel / 0.64 / 5)}
										/>
									</div>
								);
							})}
						</div>
						{f >= 30 && (
							<Glass tone="light" left={540 - gW / 2} top={LINE_Y - gH / 2} width={gW} height={gH} radius={Math.min(52, gH / 2)} shine={shine} opacity={ramp(f, [30, 33])} />
						)}
						<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
								{phaseB && (
								<g>
									{/* the timeline */}
									<line
										x1={540 - 450 * lineDraw}
										x2={540 + 450 * lineDraw}
										y1={LINE_Y}
										y2={LINE_Y}
										stroke={C.ink}
										strokeWidth={3}
									/>
									{Array.from({length: 21}).map((_, i) => {
										const x = 90 + i * 45;
										const vis = ramp(f, [54 + i * 0.5, 58 + i * 0.5]);
										return (
											<line key={i} x1={x} x2={x} y1={LINE_Y} y2={LINE_Y + (i % 5 === 0 ? 22 : 11)} stroke={C.ink} strokeWidth={2} opacity={vis * 0.7} />
										);
									})}
									{/* progress — the route already driven */}
									<line x1={180} x2={180 + 720 * dot} y1={LINE_Y} y2={LINE_Y} stroke={C.copper} strokeWidth={6} opacity={dot > 0 ? 1 : 0} />
								</g>
							)}
						</svg>
						{phaseB && (
							<>
								{/* the chosen car stays on screen and drives the timeline */}
								<div
									style={{
										position: 'absolute',
										left: 260 + 560 * dot - 240,
										top: LINE_Y - 141,
										opacity: ramp(f, [56, 66]),
									}}
								>
									<Vehicle type="sedan" paint="graphite" width={480} reflection={false} headlight={1} wheelAngle={dot * 720} sweep={ramp(f, [66, 100], [-0.2, 1.2])} />
								</div>
								<GlassLabel top={LINE_Y + 56} align="left" inset={60} tone="light" padding="16px 26px" radius={36} shine={shine} opacity={pinPop}>
									<div style={{display: 'flex', alignItems: 'center', gap: 14, fontFamily: F.mono, fontWeight: 600, fontSize: 28, letterSpacing: '0.04em', color: C.ink}}>
										<svg width={30} height={38} viewBox="0 0 30 38">
											<path d="M15 37 C15 37 2 22 2 14 A13 13 0 0 1 28 14 C28 22 15 37 15 37 Z" fill={C.ink} />
											<circle cx={15} cy={14} r={5} fill="#FFFFFF" />
										</svg>
										VOTRE LIEU
									</div>
								</GlassLabel>
								<GlassLabel top={LINE_Y + 56} align="right" inset={60} tone="light" padding="16px 26px" radius={36} shine={shine} opacity={clockPop}>
									<div style={{display: 'flex', alignItems: 'center', gap: 14, fontFamily: F.mono, fontWeight: 600, fontSize: 28, letterSpacing: '0.04em', color: C.ink}}>
										<svg width={34} height={34} viewBox="-17 -17 34 34">
											<circle r={15} fill="none" stroke={C.ink} strokeWidth={3} />
											<line x1={0} y1={0} x2={0} y2={-10} stroke={C.ink} strokeWidth={3} strokeLinecap="round" transform={`rotate(${clockSpin})`} />
											<line x1={0} y1={0} x2={0} y2={-6} stroke={C.ink} strokeWidth={3} strokeLinecap="round" transform={`rotate(${clockSpin / 12 + 90})`} />
										</svg>
										VOTRE HORAIRE
									</div>
								</GlassLabel>
							</>
						)}
					</>
				)}

				{/* CHOISISSEZ. */}
				{phaseA && (
					<GlassLabel top={540} tone="light" padding="26px 56px" radius={56} shine={shine}>
						<div style={{...wide(112, 840), fontSize: 112, lineHeight: 1, letterSpacing: '-0.02em', color: C.ink}}>
							<SlotRoll text="CHOISISSEZ." frame={f} start={3} spin={8} lockEvery={2} />
						</div>
					</GlassLabel>
				)}

				{/* ON COORDONNE. — rises into its panel */}
				{phaseB && (
					<GlassLabel top={600} tone="light" padding="30px 56px" radius={56} shine={shine} opacity={ramp(f, [50, 58])}>
						<div style={{overflow: 'hidden'}}>
							<div
								style={{
									...wide(100, 840),
									fontSize: 96,
									whiteSpace: 'nowrap',
									letterSpacing: '-0.02em',
									color: C.ink,
									lineHeight: 1.05,
									transform: `translateY(${(1 - ramp(f, [56, 72], [0, 1], E.expoOut)) * 110}%)`,
								}}
							>
								ON COORDONNE.
							</div>
						</div>
					</GlassLabel>
				)}

				{/* ------------------------------------------------ keys */}
				{phaseC && (
					<>
						<div
							style={{
								position: 'absolute',
								left: 540,
								top: 0,
								width: 0,
								height: 0,
								transform: `translateY(150px) rotate(${theta}deg)`,
							}}
						>
							<div style={{position: 'absolute', left: -1, top: -200, width: 2, height: 200 + 470 * cord, background: C.ink}} />
							<div style={{position: 'absolute', left: -130, top: -20 + 470 * cord, transform: 'scale(1.35)', transformOrigin: '130px 20px'}}>
								<Key lit={ramp(f, [112, 140], [0, 1], E.inOut)} />
							</div>
						</div>
						<GlassLabel top={1160} tone="light" padding="30px 64px 38px" radius={60} shine={shine}>
							<div style={{fontFamily: F.serif, fontWeight: 300, fontSize: 112, color: C.ink, lineHeight: 1.05}}>
								<MaskRise text="prenez" frame={f} start={107} dur={12} stagger={1} />
							</div>
							<div style={{...wide(104, 880), fontSize: 150, letterSpacing: '-0.03em', color: C.ink, lineHeight: 1}}>
								<MaskRise text="LES CLÉS." frame={f} start={111} dur={10} stagger={1.2} />
							</div>
						</GlassLabel>
					</>
				)}
			</AbsoluteFill>

			{/* exit: an ink panel rises like a garage door closing upward */}
			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					bottom: 0,
					height: 1920 * wipe,
					background: C.ink,
				}}
			/>
		</AbsoluteFill>
	);
};
