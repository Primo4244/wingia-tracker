import React, { useMemo } from 'react';
import { useCurrentFrame } from 'remotion';
import { fbm2, rng } from '../lib/noise';
import { H, W } from '../theme';

/** The wind chapter's streaks: thin lines crossing left to right, longer in a gust. */
export const Streaks: React.FC<{ seed: number; count: number; speed: number; opacity: number; gust?: (f: number) => number }> = ({
  seed,
  count,
  speed,
  opacity,
  gust,
}) => {
  const frame = useCurrentFrame();
  const lines = useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: count }, () => ({
      x: r() * W,
      y: r() * H,
      size: 3 + r() ** 2 * 6,
      pace: 0.6 + r() * 0.8,
      alpha: 0.35 + r() * 0.65,
    }));
  }, [seed, count]);
  const g = gust ? Math.abs(gust(frame)) : 0;

  return (
    <svg
      width={W}
      height={H}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    >
      {lines.map((p, i) => {
        const length = p.size * (16 + g * 8);
        const run = p.pace * speed * frame;
        const span = W + length * 2;
        const x = ((p.x + run) % span) - length;
        const y = (p.y + run * 0.07) % H;
        return (
          <line
            key={i}
            x1={x - length}
            y1={y - length * 0.07}
            x2={x}
            y2={y}
            stroke="rgb(236,242,247)"
            strokeOpacity={p.alpha * opacity}
            strokeWidth={Math.max(1.2, p.size * 0.36)}
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
};

/** Drifting banks of fog: wide soft ellipses moving at their own speeds. */
export const Fog: React.FC<{ seed: number; opacity: number; color?: string; drift?: number; y?: [number, number] }> = ({
  seed,
  opacity,
  color = '233 238 242',
  drift = 2,
  y = [0, H],
}) => {
  const frame = useCurrentFrame();
  const banks = useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: 9 }, () => ({
      x: r() * W * 1.6 - W * 0.3,
      y: y[0] + r() * (y[1] - y[0]),
      w: 700 + r() * 900,
      h: 260 + r() * 420,
      speed: (0.4 + r()) * drift,
      a: 0.4 + r() * 0.6,
    }));
  }, [seed, drift, y]);

  return (
    <div style={{ position: 'absolute', inset: 0, opacity, pointerEvents: 'none' }}>
      {banks.map((b, i) => {
        const span = W + b.w * 2;
        const x = ((((b.x + b.speed * frame) % span) + span) % span) - b.w;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: b.y - b.h / 2,
              width: b.w,
              height: b.h,
              borderRadius: '50%',
              background: `radial-gradient(closest-side, rgb(${color} / ${b.a}), rgb(${color} / 0))`,
            }}
          />
        );
      })}
    </div>
  );
};

/** Film grain: SVG turbulence reseeded every frame, so it moves like grain and stays deterministic. */
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.08 }) => {
  const frame = useCurrentFrame();
  return (
    <svg
      width={W}
      height={H}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', mixBlendMode: 'overlay', opacity }}
    >
      <filter id="ark-grain">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.85"
          numOctaves={2}
          seed={frame % 97}
          stitchTiles="stitch"
        />
        <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.6 -0.3" />
      </filter>
      <rect
        width={W}
        height={H}
        filter="url(#ark-grain)"
      />
    </svg>
  );
};

/**
 * Topographic contour lines: marching squares over a fractal heightfield, so the lines are real
 * iso-heights of one invented massif, not decoration drawn by hand.
 */
export const Contours: React.FC<{ seed: number; levels?: number; color?: string; opacity?: number; offset?: [number, number] }> = ({
  seed,
  levels = 14,
  color = '#9FB3C4',
  opacity = 0.18,
  offset = [0, 0],
}) => {
  const d = useMemo(() => {
    const n = fbm2(seed, 4);
    const cell = 18;
    const cols = Math.ceil((W * 1.3) / cell);
    const rows = Math.ceil((H * 1.2) / cell);
    const field: number[][] = [];
    for (let j = 0; j <= rows; j++) {
      const row: number[] = [];
      for (let i = 0; i <= cols; i++) {
        // A broad dome so the lines close around a summit instead of wandering.
        const dx = i / cols - 0.55;
        const dy = j / rows - 0.42;
        row.push(n(i * 0.035, j * 0.035) * 0.7 + (1 - Math.sqrt(dx * dx + dy * dy)) * 0.6);
      }
      field.push(row);
    }
    const parts: string[] = [];
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    for (let l = 1; l <= levels; l++) {
      const iso = 0.35 + (l / (levels + 1)) * 0.75;
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const a = field[j][i];
          const b = field[j][i + 1];
          const c = field[j + 1][i + 1];
          const e = field[j + 1][i];
          const x = i * cell;
          const y = j * cell;
          const pts: [number, number][] = [];
          if ((a < iso) !== (b < iso)) pts.push([lerp(x, x + cell, (iso - a) / (b - a)), y]);
          if ((b < iso) !== (c < iso)) pts.push([x + cell, lerp(y, y + cell, (iso - b) / (c - b))]);
          if ((e < iso) !== (c < iso)) pts.push([lerp(x, x + cell, (iso - e) / (c - e)), y + cell]);
          if ((a < iso) !== (e < iso)) pts.push([x, lerp(y, y + cell, (iso - a) / (e - a))]);
          if (pts.length >= 2) parts.push(`M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}L${pts[1][0].toFixed(1)},${pts[1][1].toFixed(1)}`);
          if (pts.length === 4) parts.push(`M${pts[2][0].toFixed(1)},${pts[2][1].toFixed(1)}L${pts[3][0].toFixed(1)},${pts[3][1].toFixed(1)}`);
        }
      }
    }
    return parts.join('');
  }, [seed, levels]);

  return (
    <svg
      width={W * 1.3}
      height={H * 1.2}
      style={{ position: 'absolute', left: -W * 0.15 + offset[0], top: -H * 0.1 + offset[1], pointerEvents: 'none' }}
    >
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeOpacity={opacity}
        strokeWidth={2}
      />
    </svg>
  );
};
