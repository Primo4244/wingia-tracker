import React from 'react';
import {EasingFunction} from 'remotion';
import {ramp, rand} from '../lib/anim';
import {E} from '../lib/theme';

type Base = {
	text: string;
	frame: number;
	style?: React.CSSProperties;
};

/**
 * Per-character mask rise — each glyph emerges from beneath a hard baseline,
 * staggered. Used for words that should feel "built", not faded.
 */
export const MaskRise: React.FC<
	Base & {start: number; dur?: number; stagger?: number; easing?: EasingFunction; from?: number}
> = ({text, frame, start, dur = 14, stagger = 1.5, easing = E.expoOut, from = 110, style}) => (
	<span style={{display: 'inline-flex', whiteSpace: 'pre', ...style}}>
		{text.split('').map((ch, i) => {
			const p = ramp(frame, [start + i * stagger, start + i * stagger + dur], [0, 1], easing);
			return (
				<span key={i} style={{display: 'inline-block', overflow: 'hidden', lineHeight: 1, paddingBottom: '0.02em'}}>
					<span style={{display: 'inline-block', transform: `translateY(${(1 - p) * from}%)`}}>{ch}</span>
				</span>
			);
		})}
	</span>
);

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

/**
 * Selector roll — glyphs cycle through random characters before locking,
 * left to right. Literal metaphor for "choisir".
 */
export const SlotRoll: React.FC<Base & {start: number; lockEvery?: number; spin?: number}> = ({
	text,
	frame,
	start,
	lockEvery = 2,
	spin = 8,
	style,
}) => (
	<span style={{display: 'inline-flex', whiteSpace: 'pre', ...style}}>
		{text.split('').map((ch, i) => {
			const lockAt = start + spin + i * lockEvery;
			let shown = ch;
			if (frame < start) shown = ' ';
			else if (frame < lockAt && ch !== ' ' && ch !== '.')
				shown = GLYPHS[Math.floor(rand(i * 31 + frame * 7) * GLYPHS.length)];
			const settle = ramp(frame, [lockAt, lockAt + 5], [1, 0], E.expoOut);
			return (
				<span
					key={i}
					style={{
						display: 'inline-block',
						transform: `translateY(${settle * -6}%)`,
						opacity: frame < lockAt ? 0.55 : 1,
					}}
				>
					{shown === ' ' ? ' ' : shown}
				</span>
			);
		})}
	</span>
);

/** Typewriter with a block cursor. */
export const TypeOn: React.FC<Base & {start: number; cps?: number; cursor?: boolean; cursorColor?: string}> = ({
	text,
	frame,
	start,
	cps = 1,
	cursor = true,
	cursorColor = 'currentColor',
	style,
}) => {
	const n = Math.max(0, Math.min(text.length, Math.floor((frame - start) * cps)));
	const blink = Math.floor(frame / 8) % 2 === 0;
	return (
		<span style={{whiteSpace: 'pre', ...style}}>
			{text.slice(0, n)}
			{cursor && frame >= start && (n < text.length || blink) ? (
				<span style={{display: 'inline-block', width: '0.6em', height: '1em', background: cursorColor, verticalAlign: '-0.12em', marginLeft: '0.05em'}} />
			) : null}
		</span>
	);
};

/** Per-word focus pull: blur → sharp with a tiny scale settle. */
export const FocusWords: React.FC<Base & {start: number; stagger?: number; dur?: number}> = ({
	text,
	frame,
	start,
	stagger = 4,
	dur = 16,
	style,
}) => (
	<span style={{whiteSpace: 'pre', ...style}}>
		{text.split(' ').map((w, i) => {
			const p = ramp(frame, [start + i * stagger, start + i * stagger + dur], [0, 1], E.quartOut);
			return (
				<span
					key={i}
					style={{
						display: 'inline-block',
						filter: `blur(${(1 - p) * 14}px)`,
						opacity: p,
						transform: `scale(${1.06 - 0.06 * p})`,
						marginRight: '0.26em',
					}}
				>
					{w}
				</span>
			);
		})}
	</span>
);

/**
 * Squeeze — letters not in `keep` collapse to zero width so a word folds
 * into its abbreviation (MONTRÉAL → MTL).
 */
export const Squeeze: React.FC<Base & {keep: number[]; start: number; dur?: number; charWidth: number}> = ({
	text,
	frame,
	keep,
	start,
	dur = 12,
	charWidth,
	style,
}) => {
	return (
		<span style={{display: 'inline-flex', whiteSpace: 'pre', ...style}}>
			{text.split('').map((ch, i) => {
				const kept = keep.includes(i);
				const local = kept ? 1 : 1 - ramp(frame, [start + i * 0.6, start + i * 0.6 + dur], [0, 1], E.snap);
				return (
					<span
						key={i}
						style={{
							display: 'inline-block',
							maxWidth: kept ? undefined : `${local * charWidth}em`,
							overflow: 'hidden',
							textAlign: 'center',
							paddingTop: '0.3em',
							marginTop: '-0.3em',
							opacity: kept ? 1 : local * local,
							transform: kept ? undefined : `scaleX(${0.4 + 0.6 * local})`,
						}}
					>
						{ch}
					</span>
				);
			})}
		</span>
	);
};
