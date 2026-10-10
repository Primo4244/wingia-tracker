import React from 'react';

/**
 * Glass panel — a semi-transparent slab that blurs what is behind it, with a
 * hairline light border and a specular sheen. The sheen position is driven by
 * `shine` (0→1, computed from useCurrentFrame by the caller), so it moves with
 * the scene and never with wall-clock time.
 *
 * Rendered as a sibling layer below its text: the text floats on the panel
 * without inheriting its backdrop-filter.
 */
export type GlassProps = {
	left: number;
	top: number;
	width: number;
	height: number;
	radius?: number;
	tone?: 'dark' | 'light';
	/** 0→1 position of the reflection band across the panel */
	shine?: number;
	opacity?: number;
	/** blur radius of the backdrop, px */
	blur?: number;
};

export const Glass: React.FC<GlassProps> = ({
	left,
	top,
	width,
	height,
	radius = 52,
	tone = 'dark',
	shine = 0.5,
	opacity = 1,
	blur = 28,
}) => {
	const isDark = tone === 'dark';
	const band = -30 + shine * 160; // travels from off-left to off-right
	return (
		<div
			style={{
				position: 'absolute',
				left,
				top,
				width,
				height,
				borderRadius: radius,
				overflow: 'hidden',
				opacity,
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
				pointerEvents: 'none',
			}}
		>
			{/* the reflection — a skewed band of light that slides across the glass */}
			<div
				style={{
					position: 'absolute',
					top: -20,
					bottom: -20,
					left: `${band}%`,
					width: '42%',
					borderRadius: radius,
					background: isDark
						? 'linear-gradient(100deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.22) 50%, rgba(255,255,255,0) 100%)'
						: 'linear-gradient(100deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0) 100%)',
					transform: 'skewX(-18deg)',
					mixBlendMode: isDark ? 'screen' : 'normal',
					overflow: 'hidden',
				}}
			/>
		</div>
	);
};
