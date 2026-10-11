import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {CarPhoto} from '../components/CarPhoto';
import {GlassLabel} from '../components/Glass';
import {MaskRise} from '../components/KineticText';
import {keys, ramp} from '../lib/anim';
import {C, E, F, wide} from '../lib/theme';
import {Y_LINE} from './S1Hook';

/**
 * DESIRE (real fleet photos, from maisonautomobile.ca)
 *  a  0–75    the light line opens onto the car — LA BONNE / VOITURE
 *  b  75–150  the fleet, most accessible to most premium, five cuts on the beat
 *  c  150–240 macro push into the Kia K4 — SÉLECTIONNÉE. / préparée.
 */

const A_END = 75;
const FLEET_FROM = 78;
const STEP = 14; // frames per car
const MACRO_FROM = 150;

export const FLEET = [
	{photo: 'k4', name: 'Kia K4', fx: 50, fy: 55},
	{photo: 'a3', name: 'Audi A3', fx: 50, fy: 55},
	{photo: 'rav4', name: 'Toyota RAV4', fx: 55, fy: 55},
	{photo: 'gle', name: 'Mercedes-Benz GLE', fx: 50, fy: 55},
	{photo: 'cayenne', name: 'Porsche Cayenne', fx: 55, fy: 55},
] as const;

const CARD_W = 1000;
const CARD_H = 667;

/* ------------------------------------------------------------------ part a */
const Reveal: React.FC<{f: number}> = ({f}) => {
	const lineScale = ramp(f, [0, 14], [1, 0], E.snap);
	const open = ramp(f, [2, 32], [0, 1], E.inOut);
	const push = ramp(f, [0, A_END], [1, 1.045], E.glide);
	const textIn = ramp(f, [8, 34], [0, 1], E.expoOut);
	const sheen = ramp(f, [0, A_END], [0, 1]);

	return (
		<AbsoluteFill style={{background: C.ink, transform: `scale(${push})`}}>
			<AbsoluteFill
				style={{
					background: `radial-gradient(70% 28% at 50% ${Y_LINE + 110}px, rgba(255,255,255,${0.07 * open}) 0%, rgba(0,0,0,0) 70%)`,
				}}
			/>

			{/* the light line from the hook opens like a shutter onto the car */}
			<div
				style={{
					position: 'absolute',
					left: 40,
					top: Y_LINE - CARD_H / 2,
					clipPath: `inset(${(1 - open) * 50}% 0 ${(1 - open) * 50}% 0 round 40px)`,
				}}
			>
				<CarPhoto name="a3-night" width={CARD_W} height={CARD_H} radius={40} scale={1.04 + 0.04 * (1 - open)} fx={30} fy={50} />
			</div>
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

			<GlassLabel top={400} padding="30px 72px 34px" radius={60} shine={sheen} opacity={ramp(f, [6, 14])} transform={`translateX(${-f * 0.25}px)`}>
				<div style={{fontFamily: F.serif, fontWeight: 300, fontSize: 108, lineHeight: 1.05, color: C.stone}}>
					<MaskRise text="la bonne" frame={f} start={22} dur={16} stagger={1.2} />
				</div>
				<div style={{...wide(100, 860), fontSize: 150, lineHeight: 1, letterSpacing: '-0.03em', color: C.bone, opacity: textIn}}>
					<MaskRise text="VOITURE" frame={f} start={8} dur={14} stagger={1.4} />
				</div>
			</GlassLabel>
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ part b */
const xAt = (i: number, f: number) => {
	const start = FLEET_FROM + i * STEP;
	const enter = ramp(f, [start, start + 8], [0, 1], E.expoOut);
	const exit = i < FLEET.length - 1 ? ramp(f, [start + STEP, start + STEP + 8], [0, 1], E.expoOut) : 0;
	return (1 - enter) * 1100 - exit * 1100;
};

const Fleet: React.FC<{f: number}> = ({f}) => {
	const idx = Math.max(0, Math.min(FLEET.length - 1, Math.floor((f - FLEET_FROM) / STEP)));
	const startCur = FLEET_FROM + idx * STEP;
	const local = f - startCur;
	const sheen = ramp(f, [A_END, MACRO_FROM], [0, 1]);

	// the hand-off to the macro: everything zooms past the camera
	const z = ramp(f, [MACRO_FROM, MACRO_FROM + 16], [0, 1], E.accel);
	const fade = 1 - ramp(f, [MACRO_FROM + 8, MACRO_FROM + 18]);

	const progress = idx + ramp(local, [0, 8], [0, 1], E.expoOut);
	const dotX = (k: number) => 190 + (k * 700) / (FLEET.length - 1);

	return (
		<AbsoluteFill style={{background: C.ink}}>
			<AbsoluteFill style={{transform: `scale(${1 + 1.2 * z})`, transformOrigin: '50% 50%', opacity: fade}}>
				<AbsoluteFill
					style={{background: 'radial-gradient(80% 40% at 50% 50%, rgba(255,255,255,0.07), rgba(0,0,0,0) 70%)'}}
				/>

				{FLEET.map((car, i) => {
					const start = FLEET_FROM + i * STEP;
					const x = xAt(i, f);
					if (f < start - 1 || x <= -1100) return null;
					const vel = Math.abs(xAt(i, f + 0.5) - xAt(i, f - 0.5));
					return (
						<div key={car.photo} style={{position: 'absolute', left: 40 + x, top: 570}}>
							<CarPhoto
								name={car.photo}
								width={CARD_W}
								height={CARD_H}
								radius={40}
								shadow
								scale={1.07 - 0.07 * ramp(f, [start, start + STEP + 6])}
								fx={car.fx}
								fy={car.fy}
								blurX={Math.min(24, vel / 9)}
							/>
						</div>
					);
				})}

				{/* the claim */}
				<GlassLabel top={240} padding="26px 52px 30px" shine={sheen} opacity={ramp(f, [FLEET_FROM - 2, FLEET_FROM + 6])}>
					<div style={{...wide(100, 820), fontSize: 80, lineHeight: 1.02, letterSpacing: '-0.02em', color: C.bone}}>
						<MaskRise text="DE L'ACCESSIBLE" frame={f} start={80} dur={12} stagger={0.9} />
					</div>
					<div style={{...wide(100, 820), fontSize: 80, lineHeight: 1.02, letterSpacing: '-0.02em', color: C.carminHot}}>
						<MaskRise text="AU PREMIUM." frame={f} start={112} dur={12} stagger={0.9} />
					</div>
				</GlassLabel>

				{/* model name — text only, no marque */}
				<GlassLabel
					top={1340}
					padding="18px 40px 20px"
					radius={44}
					shine={sheen}
					opacity={ramp(local, [0, 5])}
					transform={`translateY(${(1 - ramp(local, [0, 8], [0, 1], E.expoOut)) * 26}px)`}
				>
					<div style={{...wide(100, 700), fontSize: 52, lineHeight: 1, letterSpacing: '-0.01em', color: C.bone}}>{FLEET[idx].name}</div>
				</GlassLabel>

				{/* accessible → premium */}
				<svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: ramp(f, [FLEET_FROM, FLEET_FROM + 8])}}>
					<line x1={dotX(0)} x2={dotX(FLEET.length - 1)} y1={1510} y2={1510} stroke="#fff" strokeOpacity={0.25} strokeWidth={3} />
					<line x1={dotX(0)} x2={190 + (progress * 700) / (FLEET.length - 1)} y1={1510} y2={1510} stroke={C.carmin} strokeWidth={5} />
					{FLEET.map((_, k) => (
						<circle key={k} cx={dotX(k)} cy={1510} r={k === idx ? 13 : 8} fill={k <= idx ? C.carmin : '#3a3835'} stroke={k === idx ? C.bone : 'none'} strokeWidth={3} />
					))}
				</svg>

				<GlassLabel top={1610} padding="14px 30px" radius={36} shine={sheen} opacity={ramp(f, [FLEET_FROM + 6, FLEET_FROM + 16])}>
					<div style={{fontFamily: F.mono, fontWeight: 500, fontSize: 26, letterSpacing: '0.16em', color: C.stone}}>SELON DISPONIBILITÉ</div>
				</GlassLabel>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ part c */
const Macro: React.FC<{f: number}> = ({f}) => {
	const fadeIn = ramp(f, [MACRO_FROM + 4, MACRO_FROM + 18]);
	const zoom = keys(f, [MACRO_FROM, 240], [1.8, 2.3], E.glide);
	const fx = keys(f, [MACRO_FROM, 240], [37, 42]);
	const fy = 64;
	const spec = ramp(f, [204, 228], [0, 1], E.inOut);
	const sheen = ramp(f, [172, 226], [0, 1]);
	const W = 1080;
	const H = 1920;

	return (
		<AbsoluteFill style={{opacity: fadeIn}}>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					transformOrigin: `${fx}% ${fy}%`,
					transform: `translate(${((50 - fx) / 100) * W}px, ${((50 - fy) / 100) * H}px) scale(${zoom})`,
				}}
			>
				<CarPhoto name="k4-portrait" width={W} height={H} />
			</div>

			{/* darken top and bottom so the glass copy keeps its contrast */}
			<AbsoluteFill
				style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 28%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.6) 100%)'}}
			/>

			{/* the polish pass: a band of light sweeping across the paint */}
			{spec > 0 && spec < 1 && (
				<AbsoluteFill style={{mixBlendMode: 'screen', overflow: 'hidden'}}>
					<div
						style={{
							position: 'absolute',
							top: -200,
							bottom: -200,
							left: -400 + spec * 1900,
							width: 300,
							transform: 'skewX(-22deg)',
							background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.55), rgba(255,255,255,0))',
						}}
					/>
				</AbsoluteFill>
			)}

			<GlassLabel top={220} padding="24px 52px" shine={sheen} opacity={ramp(f, [172, 178])}>
				<div style={{...wide(100, 820), fontSize: 92, lineHeight: 1, letterSpacing: '-0.02em', color: C.bone}}>
					<MaskRise text="SÉLECTIONNÉE." frame={f} start={174} dur={12} stagger={0.8} />
				</div>
			</GlassLabel>

			<GlassLabel top={1300} padding="22px 60px 34px" shine={sheen} opacity={ramp(f, [204, 212])}>
				<div
					style={{
						fontFamily: F.serif,
						fontWeight: 300,
						fontSize: 140,
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
	// exit: the frame collapses into a point → becomes the selector in S3
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
					{f < MACRO_FROM + 20 && <Fleet f={f} />}
					{f >= MACRO_FROM && <Macro f={f} />}
				</AbsoluteFill>
			)}
		</AbsoluteFill>
	);
};
