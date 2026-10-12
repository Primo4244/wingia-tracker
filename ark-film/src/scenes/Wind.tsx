import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { Fog, Streaks } from '../components/Atmosphere';
import { Ridge } from '../components/Ridge';
import { Snow } from '../components/Snow';
import { displayStyle, headingStyle, ProductTile, Reveal, textStyle } from '../components/Type';
import { progress, tween } from '../lib/motion';
import { PRODUCTS, formatPrice } from '../data/products';
import { C, easeInOut, SAFE } from '../theme';

export const WIND_FRAMES = 75;

/**
 * ark-chapter "Wind": the scene opens from a framed window to full bleed (inset 8% 5% → 0,
 * scale 1.28 → 1.06), wind streaks cross it faster in the gust, the word slides in from -14%
 * and leans into the wind then rights itself, the shell rises through the scene.
 */
export const Wind: React.FC = () => {
  const frame = useCurrentFrame();

  // The window opens over the first two beats, eased like a scroll.
  const open = tween(frame, 0, 30, 0, 1, easeInOut);
  const inset = (v: number) => `${(v * (1 - open)).toFixed(2)}%`;
  const scene = progress(frame, 0, WIND_FRAMES);

  // Gust: strong as the scene arrives, then it settles; the word leans with it.
  const gust = Math.exp(-frame / 14);
  const gustAt = (f: number) => 6 * Math.exp(-f / 14) + 1.2;

  return (
    <AbsoluteFill style={{ backgroundColor: C.night, overflow: 'hidden' }}>
      <AbsoluteFill style={{ clipPath: `inset(${inset(8)} ${inset(5)} ${inset(8)} ${inset(5)})` }}>
        <AbsoluteFill style={{ transform: `scale(${1.28 - 0.22 * open}) translateY(${scene * 3}%)` }}>
          {/* The range: rendered from a procedural heightfield (scripts/make-terrain.py), sky included. */}
          <Img
            src={staticFile('terrain/wind-far.png')}
            style={{ position: 'absolute', left: -210, top: 0, width: 1500, height: 1920, filter: 'contrast(1.1)' }}
          />
          {/* Spindrift: snow torn off the crest by the wind. */}
          <Fog
            seed={22}
            opacity={0.42}
            drift={16}
            y={[760, 1180]}
          />
          <Ridge
            seed={23}
            base={1560}
            amp={200}
            top="#1E2A36"
            bottom="#0B1015"
            detail
          />
        </AbsoluteFill>
        <Streaks
          seed={24}
          count={80}
          speed={9}
          opacity={0.5}
          gust={(f) => gustAt(f)}
        />
        <Snow
          seed={25}
          density={4}
          minSize={3}
          maxSize={9}
          speed={1.6}
          opacity={0.6}
          gust={gustAt}
        />
      </AbsoluteFill>

      {/* Night enters from the previous scene and settles under the copy. */}
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(to bottom, #0B1015 0%, rgb(11 16 21 / 0) 22%), linear-gradient(to top, #0B1015 0%, rgb(11 16 21 / 0.8) 12%, rgb(11 16 21 / 0) 34%)',
        }}
      />

      <div
        style={{
          ...displayStyle,
          position: 'absolute',
          left: SAFE.left - 10,
          top: SAFE.top + 10,
          fontSize: 360,
          lineHeight: 0.8,
          color: C.frost,
          transformOrigin: 'left bottom',
          transform: `translateX(${-14 + 14 * tween(frame, 0, 40, 0, 1, easeInOut)}%) skewX(${-8 * gust}deg)`,
        }}
      >
        Wind
      </div>

      <Reveal
        start={12}
        style={{ position: 'absolute', left: SAFE.left, top: 560, width: 520, color: C.frost, textShadow: '0 1px 14px rgb(11 16 21 / 0.55)' }}
      >
        <h2 style={{ ...headingStyle, fontSize: 76 }}>Shells</h2>
        <p style={{ ...textStyle, fontSize: 48, marginTop: 10, color: 'rgb(233 238 242 / 0.88)' }}>The outer layer.</p>
      </Reveal>

      <div style={{ position: 'absolute', left: 360, top: 760, transform: `translateY(${(8 - 14 * scene) * 6}px)` }}>
        <ProductTile
          src={PRODUCTS.alphaSv.image}
          name={PRODUCTS.alphaSv.name}
          price={formatPrice(PRODUCTS.alphaSv.price)}
          start={8}
          width={570}
          ratio={1.0}
        />
      </div>
    </AbsoluteFill>
  );
};
