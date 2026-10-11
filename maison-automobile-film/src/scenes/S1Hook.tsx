import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {CarPhoto} from '../components/CarPhoto';
import {GlassLabel} from '../components/Glass';
import {QueueBarriers} from '../components/QueueBarriers';
import {keys, ramp} from '../lib/anim';
import {C, E, wide} from '../lib/theme';

/**
 * HOOK — the old way.
 * Cold, institutional counter: a queue that never moves.
 * Then a real car (the fleet's GLE) crosses the frame at speed, right to left,
 * and drags the Maison world (darkness, light) in behind it.
 */
export const Y_LINE = 1180; // light-line height — shared with S2 for the match cut
const PASS: [number, number] = [54, 86];

/** left edge of the full-frame photo while it crosses */
const photoLeftAt = (f: number) => keys(f, [PASS[0], PASS[1]], [1080, -1080], E.inOut);

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
				transformOrigin: '50% 100%',
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

	// photo kinematics + velocity-driven motion blur
	const left = photoLeftAt(frame);
	const vel = Math.abs(photoLeftAt(frame + 0.5) - photoLeftAt(frame - 0.5));
	const trailing = left + 1080; // right edge of the photo, uncovering the dark world

	const punch = ramp(frame, [0, 8], [1.07, 1], E.expoOut);
	const lineIn = ramp(frame, [PASS[0] + 8, PASS[1]], [0, 1]);

	return (
		<AbsoluteFill style={{background: C.cold, overflow: 'hidden'}}>
			{/* ------------------------------------------------ cold world */}
			<AbsoluteFill style={{transform: `scale(${punch})`}}>
				<AbsoluteFill style={{background: 'linear-gradient(180deg, #E8EBEC 0%, #D7DCDE 60%, #CDD3D6 100%)'}} />
				{/* the queue: rows of barrier posts and belts, going nowhere */}
				<QueueBarriers frame={frame} />

				{/* the line — on glass; the panel grows when the second line lands */}
				<GlassLabel top={940} tone="light" padding="44px 56px" radius={60} shine={ramp(frame, [0, 54], [0, 1], E.glide)}>
					<div
						style={{
							...wide(100, 860),
							fontSize: 118,
							lineHeight: 0.96,
							letterSpacing: '-0.025em',
							color: C.coldInk,
							textAlign: 'center',
						}}
					>
						<Stamp frame={frame} at={3}>PAS DE</Stamp>
						<Stamp frame={frame} at={8}>COMPTOIR.</Stamp>
						{frame >= 33 && <div style={{height: 26}} />}
						<Stamp frame={frame} at={33}>PAS DE</Stamp>
						<Stamp frame={frame} at={39} style={{color: C.carmin}}>
							FILE.
						</Stamp>
					</div>
				</GlassLabel>
			</AbsoluteFill>

			{/* ---------------------------- Maison world, dragged in behind the car */}
			<AbsoluteFill
				style={{
					background: C.ink,
					clipPath: `inset(0 0 0 ${Math.max(0, trailing - 30)}px)`,
				}}
			>
				{/* light-trail, stays behind as the motif of the film */}
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
				<div style={{position: 'absolute', left, top: 0}}>
					<CarPhoto name="pass" at={PASS[0]} width={1080} height={1920} blurX={Math.min(28, vel / 5)} />
				</div>
			)}
		</AbsoluteFill>
	);
};
