import React, {useId} from 'react';
import {Img, staticFile} from 'remotion';

/**
 * A fleet photo (public/cars/<name>.jpg, logos and plates already blurred by
 * scripts/prepare_cars.py) in a rounded frame. Pure function of its props:
 * zoom/pan and an optional horizontal motion blur, all driven by the caller.
 */
export const CarPhoto: React.FC<{
	name: string;
	width: number;
	height: number;
	radius?: number;
	/** zoom, 1 = fill the frame */
	scale?: number;
	/** focal point of the crop, 0–100 */
	fx?: number;
	fy?: number;
	/** horizontal motion blur, px (std deviation) */
	blurX?: number;
	/** drop shadow under the frame */
	shadow?: boolean;
	style?: React.CSSProperties;
}> = ({name, width, height, radius = 0, scale = 1, fx = 50, fy = 50, blurX = 0, shadow = false, style}) => {
	const id = useId().replace(/:/g, '');
	return (
		<div
			style={{
				position: 'relative',
				width,
				height,
				borderRadius: radius,
				boxShadow: shadow ? '0 40px 90px rgba(0,0,0,0.45)' : undefined,
				...style,
			}}
		>
			{blurX > 0.4 && (
				<svg width={0} height={0} style={{position: 'absolute'}}>
					<filter id={`mb-${id}`} x="-20%" y="0" width="140%" height="100%">
						<feGaussianBlur stdDeviation={`${blurX} 0`} />
					</filter>
				</svg>
			)}
			<div style={{position: 'absolute', inset: 0, borderRadius: radius, overflow: 'hidden'}}>
				<Img
					src={staticFile(`cars/${name}.jpg`)}
					style={{
						width: '100%',
						height: '100%',
						objectFit: 'cover',
						objectPosition: `${fx}% ${fy}%`,
						transform: `scale(${scale})`,
						transformOrigin: `${fx}% ${fy}%`,
						filter: blurX > 0.4 ? `url(#mb-${id})` : undefined,
					}}
				/>
			</div>
		</div>
	);
};
