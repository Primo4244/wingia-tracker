import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FocusWords} from '../components/KineticText';
import {Glass, GlassLabel} from '../components/Glass';
import {Logo} from '../components/Logo';
import {Vehicle} from '../components/Vehicle';
import {ramp} from '../lib/anim';
import {C, E, F} from '../lib/theme';
import {BRAND_LINE_Y} from './S4City';

/**
 * BRAND — silence, a line, the logo. Then the territory, the promise, the address.
 * The line left by the province (S4) rises to become the logo's baseline;
 * the pillars grow out of it, the arcs are drawn, the wordmark settles.
 */
const LOGO_W = 760;
const K = LOGO_W / 480; // px per logo viewBox unit
const CONTENT_TOP = 155 * K; // symbol top inside the svg
const BASELINE = 344 * K; // pillar feet
const CONTENT_H = (445 - 155) * K; // symbol + wordmark

export const S5Brand: React.FC = () => {
	const f = useCurrentFrame();

	const lift = ramp(f, [68, 98], [0, 1], E.inOut) * 100;
	const logoTop = 420 - lift; // top of the symbol, px
	const svgTop = logoTop - CONTENT_TOP;
	const push = 1 + ramp(f, [0, 195], [0, 0.025]);
	const urlLine = ramp(f, [124, 140], [0, 1], E.expoOut);
	const sheen = ramp(f, [0, 195], [0, 1]);

	// the line from S4 travels up to the logo baseline and narrows to the pillars' feet
	const lineP = ramp(f, [0, 24], [0, 1], E.inOut);
	const lineY = BRAND_LINE_Y + (svgTop + BASELINE - BRAND_LINE_Y) * lineP;
	const lineW = 1080 - (1080 - 420) * lineP;
	const lineOp = 1 - ramp(f, [44, 58], [0, 1]);

	return (
		<AbsoluteFill style={{background: C.ink, overflow: 'hidden'}}>
			<AbsoluteFill style={{transform: `scale(${push})`}}>
				{/* a ghost of the car, light-painted once more, very far back */}
				<div style={{position: 'absolute', left: -310, top: 1210, opacity: 0.11}}>
					<Vehicle type="sedan" width={1700} draw={ramp(f, [10, 90], [0, 1], E.inOut)} lit={0} reflection={false} />
				</div>

				{/* the logo floats on a glass panel */}
				<Glass left={150} top={logoTop - 64} width={780} height={CONTENT_H + 128} radius={64} shine={sheen} opacity={ramp(f, [26, 40])} />

				<div
					style={{
						position: 'absolute',
						left: 540 - lineW / 2,
						top: lineY - 1,
						width: lineW,
						height: 2,
						background: '#fff',
						boxShadow: '0 0 14px rgba(255,255,255,0.45)',
						opacity: lineOp,
					}}
				/>

				<div style={{position: 'absolute', left: 540 - LOGO_W / 2, top: svgTop}}>
					<Logo f={f} start={30} width={LOGO_W} color={C.bone} />
				</div>

				<GlassLabel top={logoTop + CONTENT_H + 96} padding="12px 28px" radius={30} shine={sheen} opacity={ramp(f, [96, 108])}>
					<div
						style={{
							fontFamily: F.mono,
							fontWeight: 500,
							fontSize: 24,
							letterSpacing: `${0.3 - 0.2 * ramp(f, [96, 140], [0, 1], E.expoOut)}em`,
							color: C.bone,
						}}
					>
						PARTOUT AU QUÉBEC
					</div>
				</GlassLabel>

				<GlassLabel top={940} padding="26px 56px 30px" radius={56} shine={sheen} opacity={ramp(f, [74, 88])}>
					<div style={{fontFamily: F.serif, fontSize: 64, lineHeight: 1.12, color: C.bone}}>
						<FocusWords text="Votre voiture." frame={f} start={78} />
					</div>
					<div style={{fontFamily: F.serif, fontSize: 64, lineHeight: 1.12, color: C.stone}}>
						<FocusWords text="Là où vous en avez besoin." frame={f} start={90} stagger={3} />
					</div>
				</GlassLabel>

				<GlassLabel top={1230} padding="22px 44px 20px" radius={48} shine={sheen} opacity={ramp(f, [120, 134])}>
					<div
						style={{
							fontFamily: F.mono,
							fontWeight: 500,
							fontSize: 40,
							letterSpacing: '0.04em',
							color: C.bone,
							clipPath: `inset(0 ${(1 - urlLine) * 100}% 0 0)`,
						}}
					>
						maisonautomobile.ca
					</div>
					<div style={{width: 420 * urlLine, height: 2, marginTop: 10, background: C.copper}} />
				</GlassLabel>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
