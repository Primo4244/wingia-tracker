import React, {useId} from 'react';
import {Freeze, Img, OffthreadVideo, Sequence, staticFile, useVideoConfig} from 'remotion';
import {CLIPS} from '../lib/clips.generated';
import {CLIP_IN, CLIP_RATE, CLIP_SPOTS} from '../lib/fleet';

/**
 * A fleet visual in a rounded frame: a clip (public/cars/clips/<name>.mp4) when one
 * exists for the slot, otherwise the photo (public/cars/<name>.jpg, logos and plates
 * already blurred by scripts/prepare_cars.py). Pure function of its props: zoom/pan and
 * an optional horizontal motion blur, all driven by the caller.
 */
export const CarPhoto: React.FC<{
	name: string;
	width: number;
	height: number;
	/** frame, in the caller's timebase, at which a clip starts playing */
	at?: number;
	/** show a single frozen frame of the clip (carousels, thumbnails) */
	still?: boolean;
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
}> = ({name, width, height, at = 0, still = false, radius = 0, scale = 1, fx = 50, fy = 50, blurX = 0, shadow = false, style}) => {
	const id = useId().replace(/:/g, '');
	const {fps} = useVideoConfig();
	const clip = CLIPS[name];

	const mediaStyle: React.CSSProperties = {
		width: '100%',
		height: '100%',
		objectFit: 'cover',
		objectPosition: `${fx}% ${fy}%`,
		transform: `scale(${scale})`,
		transformOrigin: `${fx}% ${fy}%`,
		filter: blurX > 0.4 ? `url(#mb-${id})` : undefined,
	};

	const video = clip ? (
		<OffthreadVideo
			src={staticFile(`cars/clips/${name}.mp4`)}
			startFrom={Math.round((CLIP_IN[name] ?? 0) * fps)}
			playbackRate={CLIP_RATE[name] ?? 1}
			muted
			style={mediaStyle}
		/>
	) : null;

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
				{clip ? (
					<Sequence from={still ? 0 : at} layout="none">
						{still ? <Freeze frame={0}>{video}</Freeze> : video}
					</Sequence>
				) : (
					<Img src={staticFile(`cars/${name}.jpg`)} style={mediaStyle} />
				)}
				{clip &&
					(CLIP_SPOTS[name] ?? []).map((s, i) => (
						<div
							key={i}
							style={{
								position: 'absolute',
								left: `${s.x * 100}%`,
								top: `${s.y * 100}%`,
								width: `${s.w * 100}%`,
								height: `${s.h * 100}%`,
								borderRadius: 12,
								backdropFilter: 'blur(22px)',
								WebkitBackdropFilter: 'blur(22px)',
							}}
						/>
					))}
			</div>
		</div>
	);
};
