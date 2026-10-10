import React from 'react';

/**
 * Glass — semi-transparent surface that blurs what is behind it, with a
 * hairline light border and a specular sheen. The sheen position is driven by
 * `shine` (0→1, computed from useCurrentFrame by the caller), so it moves with
 * the scene and never with wall-clock time.
 */
type Tone = 'dark' | 'light';

const surface = (tone: Tone, radius: number, blur: number): React.CSSProperties => {
	const isDark = tone === 'dark';
	return {
		borderRadius: radius,
		overflow: 'hidden',
		background: isDark
			? 'linear-gradient(160deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.05) 55%, rgba(255,255,255,0.09) 100%)'
			: 'linear-gradient(160deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.5) 55%, rgba(255,255,255,0.66) 100%)',
		backdropFilter: `blur(${blur}px) saturate(160%)`,
		WebkitBackdropFilter: `blur(${blur}px) saturate(160%)`,
		border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.34)' : 'rgba(10,10,11,0.1)'}`,
		boxShadow: [
			`inset 0 1.5px 0 ${isDark ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.95)'}`,
			`inset 0 -1px 0 ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(10,10,11,0.06)'}`,
			isDark ? '0 40px 90px rgba(0,0,0,0.45)' : '0 30px 70px rgba(10,10,11,0.18)',
		].join(', '),
	};
};

/** The reflection — a skewed band of light that slides across the glass. */
const Sheen: React.FC<{tone: Tone; shine: number; radius: number}> = ({tone, shine, radius}) => (
	<div
		style={{
			position: 'absolute',
			top: -20,
			bottom: -20,
			left: `${-30 + shine * 160}%`,
			width: '42%',
			borderRadius: radius,
			background:
				tone === 'dark'
					? 'linear-gradient(100deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.22) 50%, rgba(255,255,255,0) 100%)'
					: 'linear-gradient(100deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0) 100%)',
			transform: 'skewX(-18deg)',
			mixBlendMode: tone === 'dark' ? 'screen' : 'normal',
			pointerEvents: 'none',
		}}
	/>
);

/** Fixed-geometry panel, for shapes that are not text (the S3 selector). */
export const Glass: React.FC<{
	left: number;
	top: number;
	width: number;
	height: number;
	radius?: number;
	tone?: Tone;
	shine?: number;
	opacity?: number;
	blur?: number;
}> = ({left, top, width, height, radius = 52, tone = 'dark', shine = 0.5, opacity = 1, blur = 28}) => (
	<div style={{position: 'absolute', left, top, width, height, opacity, pointerEvents: 'none', ...surface(tone, radius, blur)}}>
		<Sheen tone={tone} shine={shine} radius={radius} />
	</div>
);

/**
 * Text on glass. The panel wraps its content (padding included) and sits on a
 * full-width row, so it is always centred on the text and the text can never
 * run past its edges, whatever the font or the copy.
 */
export const GlassLabel: React.FC<{
	top: number;
	children: React.ReactNode;
	align?: 'center' | 'left' | 'right';
	/** horizontal margin of the row, px */
	inset?: number;
	padding?: string;
	radius?: number;
	tone?: Tone;
	shine?: number;
	opacity?: number;
	blur?: number;
	/** extra transform on the row (motion) */
	transform?: string;
	style?: React.CSSProperties;
}> = ({
	top,
	children,
	align = 'center',
	inset = 40,
	padding = '28px 48px',
	radius = 52,
	tone = 'dark',
	shine = 0.5,
	opacity = 1,
	blur = 28,
	transform,
	style,
}) => (
	<div
		style={{
			position: 'absolute',
			left: inset,
			right: inset,
			top,
			display: 'flex',
			justifyContent: align === 'center' ? 'center' : align === 'left' ? 'flex-start' : 'flex-end',
			opacity,
			transform,
			pointerEvents: 'none',
		}}
	>
		<div
			style={{
				position: 'relative',
				display: 'flex',
				flexDirection: 'column',
				alignItems: align === 'center' ? 'center' : align === 'left' ? 'flex-start' : 'flex-end',
				textAlign: align,
				padding,
				maxWidth: '100%',
				...surface(tone, radius, blur),
				...style,
			}}
		>
			<Sheen tone={tone} shine={shine} radius={radius} />
			<div style={{position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'inherit'}}>{children}</div>
		</div>
	</div>
);
