import React, { useMemo } from 'react';
import { fbm1 } from '../lib/noise';
import { H, W } from '../theme';

type Props = {
  seed: number;
  /** Baseline of the range, in px from the top of the frame. */
  base: number;
  /** Height of the ordinary crests above the baseline. */
  amp: number;
  /** One dominant summit: x as a fraction of the width, height in px, spread as a fraction. */
  peak?: { x: number; height: number; spread: number };
  /** Gradient of the face, top to bottom. */
  top: string;
  bottom: string;
  /** Lit rock relief and side light, for the near, detailed ranges. */
  detail?: boolean;
  /** Horizontal overscan so parallax and drift never show an edge. */
  overscan?: number;
  style?: React.CSSProperties;
};

/**
 * A procedural mountain range: ridged fractal noise for the crest line, an optional dominant
 * summit, and lit rock relief on the faces. Built once per seed.
 */
export const Ridge: React.FC<Props> = ({ seed, base, amp, peak, top, bottom, detail = false, overscan = 0.2, style }) => {
  const width = W * (1 + overscan * 2);
  const id = `ridge-${seed}`;

  const { crest } = useMemo(() => {
    const n = fbm1(seed, 6);
    const step = 6;
    const points: [number, number][] = [];
    for (let x = 0; x <= width; x += step) {
      const u = x / width;
      // Ridged noise gives sharp crests instead of rolling hills.
      const ridged = 1 - Math.abs(2 * n(u * 7) - 1);
      let y = base - amp * (0.35 * n(u * 2.2) + 0.65 * ridged ** 1.6);
      if (peak) {
        const d = (u - peak.x) / peak.spread;
        // A sharp, slightly asymmetric summit.
        // A massif, not a spike: a broad shoulder, rough flanks, a slightly offset top.
        const shape = Math.exp(-(Math.abs(d) ** 1.7) * (d < 0 ? 2.2 : 1.6));
        y -= peak.height * shape * (0.82 + 0.36 * n(u * 19 + 3));
      }
      points.push([x, y]);
    }
    const crest = `M0,${H} ` + points.map(([x, y]) => `L${x.toFixed(1)},${y.toFixed(1)}`).join(' ') + ` L${width},${H} Z`;

    return { crest };
  }, [seed, base, amp, peak, width, detail]);

  return (
    <svg
      width={width}
      height={H}
      viewBox={`0 0 ${width} ${H}`}
      style={{ position: 'absolute', left: -(width - W) / 2, top: 0, overflow: 'visible', ...style }}
    >
      <defs>
        <linearGradient
          id={`${id}-face`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop
            offset="0%"
            stopColor={top}
          />
          <stop
            offset="100%"
            stopColor={bottom}
          />
        </linearGradient>
        <linearGradient
          id={`${id}-light`}
          x1="0"
          y1="0"
          x2="1"
          y2="0"
        >
          <stop
            offset="0%"
            stopColor="rgb(233 238 242)"
            stopOpacity="0.16"
          />
          <stop
            offset="55%"
            stopColor="rgb(233 238 242)"
            stopOpacity="0"
          />
          <stop
            offset="100%"
            stopColor="rgb(11 16 21)"
            stopOpacity="0.35"
          />
        </linearGradient>
        {/* Rock relief: a noise heightfield lit by a low blue-hour sun from the left. */}
        <filter
          id={`${id}-relief`}
          x="0"
          y="0"
          width="1"
          height="1"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.0032 0.0085"
            numOctaves={5}
            seed={seed}
          />
          <feDiffuseLighting
            result="light"
            lightingColor="#ffffff"
            surfaceScale={11}
            diffuseConstant={1.15}
          >
            <feDistantLight
              azimuth={205}
              elevation={34}
            />
          </feDiffuseLighting>
          {/* Multiply the lit relief into the face colours, keeping the face's own outline. */}
          <feBlend
            in="light"
            in2="SourceGraphic"
            mode="multiply"
            result="shaded"
          />
          <feComposite
            in="shaded"
            in2="SourceGraphic"
            operator="in"
          />
        </filter>
        <clipPath id={`${id}-clip`}>
          <path d={crest} />
        </clipPath>
      </defs>
      <path
        d={crest}
        fill={`url(#${id}-face)`}
        filter={detail ? `url(#${id}-relief)` : undefined}
      />
      {detail ? (
        <g clipPath={`url(#${id}-clip)`}>
          <rect
            width={width}
            height={H}
            fill={`url(#${id}-light)`}
          />
        </g>
      ) : null}
    </svg>
  );
};
