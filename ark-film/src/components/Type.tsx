import React from 'react';
import { Img, staticFile, useCurrentFrame } from 'remotion';
import { tween } from '../lib/motion';
import { body, C, display } from '../theme';

/**
 * A line that rises out of its own mask (the site's SplitText `mask: 'lines'` reveal):
 * yPercent 105 → 0 with expo.out unless told otherwise.
 */
export const MaskLine: React.FC<{
  start: number;
  duration?: number;
  ease?: (t: number) => number;
  /** Extra exit: the line sinks back into its mask from this frame. */
  exitAt?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ start, duration = 30, ease, exitAt, children, style }) => {
  const frame = useCurrentFrame();
  let y = tween(frame, start, duration, 105, 0, ease);
  if (exitAt !== undefined) y += tween(frame, exitAt, 12, 0, -105);
  return (
    <span style={{ display: 'block', overflow: 'hidden', paddingBlockStart: '0.04em', ...style }}>
      <span style={{ display: 'block', transform: `translateY(${y}%)` }}>{children}</span>
    </span>
  );
};

/** Copy that arrives like the site's revealOnEnter: rises and fades in, expo.out. */
export const Reveal: React.FC<{ start: number; distance?: number; duration?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  start,
  distance = 40,
  duration = 22,
  children,
  style,
}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        opacity: tween(frame, start, duration, 0, 1),
        transform: `translateY(${tween(frame, start, duration, distance, 0)}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const displayStyle: React.CSSProperties = {
  fontFamily: display,
  fontWeight: 800,
  lineHeight: 0.82,
  letterSpacing: '-0.01em',
  textTransform: 'uppercase',
  margin: 0,
};

export const headingStyle: React.CSSProperties = {
  fontFamily: body,
  fontWeight: 600,
  fontSize: 64,
  lineHeight: 1.1,
  letterSpacing: '-0.01em',
  margin: 0,
};

export const textStyle: React.CSSProperties = {
  fontFamily: body,
  fontWeight: 400,
  fontSize: 42,
  lineHeight: 1.4,
  margin: 0,
  textWrap: 'balance',
} as React.CSSProperties;

/**
 * The site's Ice tile: packshots shot on white, multiplied onto frost light. The piece rises
 * into place (y 64 → 0, 1.2 s) while its photo settles (scale 1.12 → 1, 1.6 s): never hidden.
 */
export const ProductTile: React.FC<{
  src: string;
  name: string;
  price?: string;
  colour?: string;
  start: number;
  width: number;
  /** Image area ratio, height / width. */
  ratio?: number;
  /** Light position inside the tile, as on the site's pointer light. */
  light?: [number, number];
  /** Text colour of the caption under the tile (night on light scenes). */
  tone?: string;
  style?: React.CSSProperties;
}> = ({ src, name, price, colour, start, width, ratio = 1.15, light = [50, 35], tone = C.frost, style }) => {
  const frame = useCurrentFrame();
  const rise = tween(frame, start, 36, 150, 0);
  const settle = tween(frame, start, 48, 1.12, 1);
  return (
    <div style={{ width, transform: `translateY(${rise}px)`, ...style }}>
      <div
        style={{
          position: 'relative',
          width,
          height: width * ratio,
          overflow: 'hidden',
          isolation: 'isolate',
          background: `radial-gradient(120% 90% at ${light[0]}% ${light[1]}%, #f4f7f9 0%, transparent 62%), linear-gradient(180deg, #dfe7ed 0%, ${C.ice} 100%)`,
        }}
      >
        <Img
          src={staticFile(src)}
          style={{
            position: 'absolute',
            inset: '6%',
            width: '88%',
            height: '88%',
            objectFit: 'contain',
            mixBlendMode: 'multiply',
            transform: `scale(${settle})`,
          }}
        />
      </div>
      {/* The caption waits until the tile has nearly landed, so it never dips below the safe line. */}
      <div style={{ opacity: tween(frame, start + 16, 14, 0, 1), color: tone }}>
        <div style={{ marginTop: 18, fontFamily: body, fontWeight: 500, fontSize: 32, lineHeight: 1.25 }}>{name}</div>
        {price ? <div style={{ marginTop: 4, fontFamily: body, fontWeight: 600, fontSize: 36, lineHeight: 1.2, fontVariantNumeric: 'tabular-nums' }}>{price}</div> : null}
        {colour ? <div style={{ fontFamily: body, fontSize: 28, lineHeight: 1.3, opacity: 0.62 }}>{colour}</div> : null}
      </div>
    </div>
  );
};
