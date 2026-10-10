import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Glass} from '../components/Glass';
import {Vehicle} from '../components/Vehicle';
import {keys, ramp} from '../lib/anim';
import {C, E, F, wide} from '../lib/theme';

/**
 * HOOK — the old way.
 * Cold, institutional counter: a ticket number, a queue that never moves.
 * Then a car body crosses the frame at speed and drags the Maison world
 * (darkness, light) in behind it.
 */
export const Y_LINE = 1180; // headlight height — shared with S2 for the match cut
const CAR_SCALE = 3;
const CAR_TOP = Y_LINE - 179 * CAR_SCALE;
const PASS: [number, number] = [54, 86];

export const carLeftAt = (f: number) =>
	keys(f, [PASS[0], PASS[1]], [-2990, 1140], E.inOut);

const Stamp: React.FC<{frame: number; at: number; children: React.ReactNode; style?: React.CSSProperties}> = ({
	frame,
	at,
	children,
	style,
}) => {
	if (frame < at) return null;
	const p = ramp(frame, [at, at + 5], [0, 1], E.expoOut);
	return (
		<div
			style={{
				transformOrigin: '0% 100%',
				transform: `scale(${1.1 - 0.1 * p}) translateY(${(1 - p) * 10}px)`,
				...style,
			}}
		>
			{children}
		</div>
	);
};

export const S1Hook: React.FC = () => {
	const frame = useCurrentFrame();

	// car kinematics + velocity-driven motion blur
	const left = carLeftAt(frame);
	const vel = Math.abs(carLeftAt(frame + 0.5) - carLeftAt(frame - 0.5));
	const rearX = left + 34 * CAR_SCALE;

	const punch = ramp(frame, [0, 8], [1.07, 1], E.expoOut);
	const coldDrift = frame * 0.6;

	const lineIn = ramp(frame, [PASS[0] + 8, PASS[1]], [0, 1]);

	return (
		<AbsoluteFill style={{background: C.cold, overflow: 'hidden'}}>
			{/* ------------------------------------------------ cold world */}
			<AbsoluteFill style={{transform: `scale(${punch})`}}>
				<AbsoluteFill
					style={{background: 'linear-gradient(180deg, #E8EBEC 0%, #D7DCDE 60%, #CDD3D6 100%)'}}
				/>
				{/* giant ticket number, bleeding off frame */}
				<div
					style={{
						position: 'absolute',
						left: -70 - coldDrift,
						top: 150,
						...wide(62, 820),
						fontSize: 860,
						lineHeight: 0.8,
						letterSpacing: '-0.03em',
						color: C.coldDeep,
					}}
				>
					047
				</div>
				<Glass left={64} top={226} width={352} height={70} radius={35} tone="light" shine={ramp(frame, [0, 54], [0, 1], E.glide)} />
				<div
					style={{
						position: 'absolute',
						left: 84,
						top: 250,
						fontFamily: F.mono,
						fontSize: 26,
						letterSpacing: '0.2em',
						color: C.coldInk,
						opacity: 0.7,
					}}
				>
					VOTRE NUMÉRO
				</div>

				{/* the queue — tickets crawling, going nowhere */}
				<div
					style={{
						position: 'absolute',
						top: 836,
						left: 84 - frame * 1.4,
						display: 'flex',
						gap: 14,
					}}
				>
					{Array.from({length: 14}).map((_, i) => (
						<div
							key={i}
							style={{
								border: `2px solid ${C.coldInk}`,
								opacity: 0.32 - i * 0.012,
								padding: '8px 14px',
								fontFamily: F.mono,
								fontSize: 28,
								color: C.coldInk,
							}}
						>
							{String(48 + i).padStart(3, '0')}
						</div>
					))}
				</div>

				{/* the line — floats on a glass panel */}
				<Glass left={40} top={918} width={1000} height={640} radius={60} tone="light" shine={ramp(frame, [0, 54], [0, 1], E.glide)} />
				<div
					style={{
						position: 'absolute',
						left: 84,
						top: 960,
						...wide(108, 860),
						fontSize: 136,
						lineHeight: 0.92,
						letterSpacing: '-0.025em',
						color: C.coldInk,
					}}
				>
					<Stamp frame={frame} at={3}>PAS DE</Stamp>
					<Stamp frame={frame} at={8}>COMPTOIR.</Stamp>
					<div style={{height: 22}} />
					<Stamp frame={frame} at={33}>PAS DE</Stamp>
					<Stamp frame={frame} at={39} style={{color: C.ledRed}}>
						FILE.
					</Stamp>
				</div>
			</AbsoluteFill>

			{/* ---------------------------- Maison world, dragged in by the car */}
			<AbsoluteFill
				style={{
					background: C.ink,
					clipPath: `inset(0 ${Math.max(0, 1080 - rearX - 40)}px 0 0)`,
				}}
			>
				{/* headlight light-trail, stays behind as the motif of the film */}
				<div
					style={{
						position: 'absolute',
						left: 0,
						top: Y_LINE - 1,
						height: 2,
						width: 1080,
						background: '#fff',
						opacity: 0.9 * lineIn,
						boxShadow: '0 0 18px rgba(255,255,255,0.5)',
					}}
				/>
			</AbsoluteFill>

			{/* ------------------------------------------------------- the car */}
			{frame >= PASS[0] && frame <= PASS[1] && (
				<div style={{position: 'absolute', left, top: CAR_TOP}}>
					<Vehicle
						type="sedan"
						paint="ink"
						width={1000 * CAR_SCALE}
						headlight={1}
						sweep={ramp(frame, PASS, [1.2, -0.2])}
						wheelAngle={frame * 47}
						blur={Math.min(17, vel / CAR_SCALE / 6)}
						reflection={false}
					/>
				</div>
			)}
		</AbsoluteFill>
	);
};
