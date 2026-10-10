import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {BrandLockup} from '../components/BrandLockup';
import {FocusWords} from '../components/KineticText';
import {Glass} from '../components/Glass';
import {Vehicle} from '../components/Vehicle';
import {ramp} from '../lib/anim';
import {C, E, F} from '../lib/theme';
import {BRAND_LINE_Y} from './S4City';

/**
 * BRAND — silence, a line, the name. Then the promise, then the address.
 * The end card holds long enough to be remembered.
 */
export const S5Brand: React.FC = () => {
	const f = useCurrentFrame();

	const lineW = 1080 - (1080 - 760) * ramp(f, [0, 16], [0, 1], E.expoOut);
	const lift = ramp(f, [68, 98], [0, 1], E.inOut) * 150;
	const push = 1 + ramp(f, [0, 195], [0, 0.025]);
	const urlLine = ramp(f, [124, 140], [0, 1], E.expoOut);

	return (
		<AbsoluteFill style={{background: C.ink, overflow: 'hidden'}}>
			<AbsoluteFill style={{transform: `scale(${push})`}}>
				{/* a ghost of the car, light-painted once more, very far back */}
				<div style={{position: 'absolute', left: -310, top: 1210, opacity: 0.11}}>
					<Vehicle type="sedan" width={1700} draw={ramp(f, [10, 90], [0, 1], E.inOut)} lit={0} reflection={false} />
				</div>

				{/* the lockup floats on a glass panel */}
				<Glass left={60} top={780 - lift} width={960} height={330} radius={60} shine={ramp(f, [0, 195], [0, 1])} opacity={ramp(f, [24, 40])} />

				<div style={{position: 'absolute', left: 0, top: BRAND_LINE_Y - 200 - lift}}>
					<BrandLockup f={f} lineWidth={lineW} start={30} />
				</div>

				<Glass left={300} top={592 - lift} width={480} height={56} radius={28} shine={ramp(f, [0, 195], [0, 1])} opacity={ramp(f, [96, 108])} />
				<div
					style={{
						position: 'absolute',
						left: 0,
						right: 0,
						top: BRAND_LINE_Y - 350 - lift,
						textAlign: 'center',
						fontFamily: F.mono,
						fontSize: 22,
						letterSpacing: `${0.5 - 0.15 * ramp(f, [96, 140], [0, 1], E.expoOut)}em`,
						color: C.stone,
						opacity: ramp(f, [96, 108]),
					}}
				>
					MONTRÉAL — LAVAL
				</div>

				<Glass left={80} top={1058} width={920} height={210} radius={56} shine={ramp(f, [0, 195], [0, 1])} opacity={ramp(f, [74, 88])} />
				<div
					style={{
						position: 'absolute',
						left: 0,
						right: 0,
						top: 1090,
						textAlign: 'center',
						fontFamily: F.serif,
						fontSize: 64,
						lineHeight: 1.12,
						color: C.bone,
					}}
				>
					<div>
						<FocusWords text="Votre voiture." frame={f} start={78} />
					</div>
					<div style={{fontWeight: 400, color: C.stone}}>
						<FocusWords text="Là où vous en avez besoin." frame={f} start={90} stagger={3} />
					</div>
				</div>

				<Glass left={230} top={1362} width={620} height={108} radius={54} shine={ramp(f, [0, 195], [0, 1])} opacity={ramp(f, [120, 134])} />
				<div
					style={{
						position: 'absolute',
						left: 0,
						right: 0,
						top: 1390,
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						gap: 14,
					}}
				>
					<div
						style={{
							fontFamily: F.mono,
							fontWeight: 500,
							fontSize: 40,
							letterSpacing: '0.1em',
							color: C.bone,
							clipPath: `inset(0 ${(1 - urlLine) * 100}% 0 0)`,
						}}
					>
						maisonautomobile.ca
					</div>
					<div style={{width: 470 * urlLine, height: 2, background: C.copper}} />
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
