import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { rng } from '../lib/noise';
import { H, W } from '../theme';

type Props = {
  seed: number;
  /** Flakes per 100,000 px², as in the site's ParticleField. */
  density: number;
  minSize: number;
  maxSize: number;
  /** Fall speed in px per frame at pace 1 (the site's 60 fps speed, doubled for 30 fps). */
  speed: number;
  opacity: number;
  blur?: number;
  /** Extra push from wind, as a function of the frame (the site's scroll "gust"). */
  gust?: (frame: number) => number;
  /** Flake colour as an `r g b` triplet; frost white by default. */
  color?: string;
};

/**
 * The site's two snow planes, made deterministic: each flake's position is a pure function of
 * the frame (no state, no requestAnimationFrame). Soft radial sprites like the site's.
 */
export const Snow: React.FC<Props> = ({ seed, density, minSize, maxSize, speed, opacity, blur = 0, gust, color = '240 245 249' }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const flakes = useMemo(() => {
    const r = rng(seed);
    const count = Math.round(((W * H) / 100000) * density);
    return Array.from({ length: count }, () => ({
      x: r() * W,
      y: r() * H,
      size: minSize + r() ** 2 * (maxSize - minSize),
      drift: r() * Math.PI * 2,
      pace: 0.6 + r() * 0.8,
      alpha: 0.35 + r() * 0.65,
    }));
  }, [seed, density, minSize, maxSize]);

  // Accumulated gust up to this frame, so a push moves flakes and then they keep falling.
  const push = useMemo(() => {
    const acc = new Float32Array(durationInFrames + 1);
    for (let f = 1; f <= durationInFrames; f++) acc[f] = acc[f - 1] + (gust ? gust(f) : 0);
    return acc;
  }, [gust, durationInFrames]);
  const pushed = push[Math.min(frame, durationInFrames)] ?? 0;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', filter: blur ? `blur(${blur}px)` : undefined }}>
      {flakes.map((p, i) => {
        const fall = (p.y + (p.pace * speed * frame + pushed * p.pace * 0.6)) % (H + p.size * 2);
        const x = (((p.x + Math.sin(p.drift + 0.024 * frame) * 22 + 0.5 * speed * frame + pushed * p.pace * 2) % (W + p.size)) + W + p.size) % (W + p.size);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x - p.size / 2,
              top: fall - p.size,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              opacity: p.alpha * opacity,
              background: `radial-gradient(circle, rgb(${color} / 1) 0%, rgb(${color} / 0.55) 45%, rgb(${color} / 0) 70%)`,
            }}
          />
        );
      })}
    </div>
  );
};
