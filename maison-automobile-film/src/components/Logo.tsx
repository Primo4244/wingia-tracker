import React, {useId} from 'react';
import {ramp} from '../lib/anim';
import {
	LOGO_ARCS_LEFT,
	LOGO_AUTOMOBILE,
	LOGO_MAISON,
	LOGO_PILLAR_LEFT,
	LOGO_PILLAR_RIGHT_ARC,
	LOGO_TRANSFORM,
	PILLAR_RIGHT_CLIP,
} from '../lib/logo-paths';
import {E} from '../lib/theme';

/**
 * The official Maison Automobile logo, built in three moves:
 *   1. the two pillars rise out of the baseline,
 *   2. the arcs are drawn as a line of light, then fill in,
 *   3. MAISON then AUTOMOBILE settle letter by letter.
 * Everything is driven by `f` (scene frame) from `start`.
 * Rendered in the original viewBox (0 0 480 600) at `width` px.
 */
export const Logo: React.FC<{f: number; start: number; width: number; color: string}> = ({f, start, width, color}) => {
	const id = useId().replace(/:/g, '');
	const t = f - start;

	// 1. pillars: a reveal window opening upward from the baseline (y 344 → 150)
	const rise = ramp(t, [0, 20], [0, 1], E.expoOut);
	const riseTop = 344 - 198 * rise;

	// 2. arcs: outline traced, then filled
	const draw = ramp(t, [12, 40], [0, 1], E.inOut);
	const fill = ramp(t, [32, 48], [0, 1], E.quartOut);
	const strokeFade = 1 - ramp(t, [44, 56], [0, 1]);

	const letter = (i: number, at: number, step: number) => {
		const p = ramp(t, [at + i * step, at + i * step + 12], [0, 1], E.expoOut);
		return {opacity: p, transform: `translate(0 ${(1 - p) * -90})`};
	};

	const tracePath = (d: string, key: React.Key) => (
		<path
			key={key}
			d={d}
			fill={color}
			fillOpacity={fill}
			stroke={color}
			strokeOpacity={draw > 0 ? strokeFade : 0}
			strokeWidth={14}
			pathLength={1}
			strokeDasharray={`${draw} 1`}
		/>
	);

	return (
		<svg width={width} height={(width * 600) / 480} viewBox="0 0 480 600" style={{overflow: 'visible'}}>
			<defs>
				<clipPath id={`${id}-rise`} clipPathUnits="userSpaceOnUse">
					<rect x={0} y={riseTop} width={480} height={346 - riseTop} />
				</clipPath>
				<clipPath id={`${id}-pillarR`} clipPathUnits="userSpaceOnUse">
					<polygon points={PILLAR_RIGHT_CLIP} />
				</clipPath>
				<mask id={`${id}-arcR`} maskUnits="userSpaceOnUse" x={0} y={0} width={480} height={600}>
					<rect x={0} y={0} width={480} height={600} fill="#fff" />
					<polygon points={PILLAR_RIGHT_CLIP} fill="#000" />
				</mask>
			</defs>

			{/* 1. pillars */}
			<g clipPath={`url(#${id}-rise)`}>
				<g transform={LOGO_TRANSFORM}>
					{LOGO_PILLAR_LEFT.map((d, i) => (
						<path key={i} d={d} fill={color} />
					))}
				</g>
				<g clipPath={`url(#${id}-pillarR)`}>
					<g transform={LOGO_TRANSFORM}>
						{LOGO_PILLAR_RIGHT_ARC.map((d, i) => (
							<path key={i} d={d} fill={color} />
						))}
					</g>
				</g>
			</g>

			{/* 2. arcs */}
			<g transform={LOGO_TRANSFORM}>{LOGO_ARCS_LEFT.map(tracePath)}</g>
			<g mask={`url(#${id}-arcR)`}>
				<g transform={LOGO_TRANSFORM}>{LOGO_PILLAR_RIGHT_ARC.map(tracePath)}</g>
			</g>

			{/* 3. wordmark */}
			<g transform={LOGO_TRANSFORM}>
				{LOGO_MAISON.map((d, i) => (
					<g key={i} {...letter(i, 40, 2.5)}>
						<path d={d} fill={color} />
					</g>
				))}
				{LOGO_AUTOMOBILE.map((d, i) => (
					<g key={i} {...letter(i, 52, 1.5)}>
						<path d={d} fill={color} />
					</g>
				))}
			</g>
		</svg>
	);
};
