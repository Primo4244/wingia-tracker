import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Fog } from '../components/Atmosphere';
import { Ridge } from '../components/Ridge';
import { Snow } from '../components/Snow';
import { displayStyle, ProductTile, Reveal, textStyle } from '../components/Type';
import { progress, tween } from '../lib/motion';
import { C, SAFE } from '../theme';

export const WHITEOUT_FRAMES = 90;

/**
 * ark-scene "whiteout" (light tone): the fog builds to the middle of the scene (0.1 → 0.9) and
 * thins again (→ 0.3), the horizon disappears into it, the title rises 30% and fades in over
 * 1.4 s, and the mid layer stands in front of the fog.
 */
export const Whiteout: React.FC = () => {
  const frame = useCurrentFrame();
  const p = progress(frame, 0, WHITEOUT_FRAMES);
  const fog = p < 0.5 ? interpolate(p, [0, 0.5], [0.1, 0.9]) : interpolate(p, [0.5, 1], [0.9, 0.3]);
  const zoom = 1.18 - 0.18 * p;

  return (
    <AbsoluteFill style={{ backgroundColor: C.frost, overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <AbsoluteFill style={{ background: `linear-gradient(180deg, #F4F7F9 0%, ${C.frost} 45%, ${C.ice} 100%)` }} />
        {/* The horizon: it fades as the whiteout closes in. */}
        <Ridge
          seed={31}
          base={1080}
          amp={120}
          peak={{ x: 0.7, height: 150, spread: 0.2 }}
          top="#9FB3C4"
          bottom="#C9D6E0"
          style={{ opacity: 1 - fog * 0.9 }}
        />
        <Ridge
          seed={32}
          base={1500}
          amp={90}
          top="#C7D3DC"
          bottom={C.ice}
          style={{ opacity: 1 - fog * 0.6 }}
        />
        <Fog
          seed={33}
          opacity={fog}
          color="255 255 255"
          drift={3}
          y={[600, 1700]}
        />
      </AbsoluteFill>

      <Snow
        seed={34}
        density={6}
        minSize={3}
        maxSize={8}
        speed={1.8}
        opacity={0.55}
        color="111 138 161"
        gust={(f) => 2.5 * Math.exp(-f / 12)}
      />

      <div
        style={{
          ...displayStyle,
          position: 'absolute',
          left: SAFE.left - 6,
          top: SAFE.top + 20,
          fontSize: 270,
          color: C.night,
          opacity: tween(frame, 0, 42, 0, 1),
          transform: `translateY(${tween(frame, 0, 42, 30, 0)}%)`,
        }}
      >
        Whiteout
      </div>

      <Reveal
        start={10}
        distance={32}
        style={{ position: 'absolute', left: SAFE.left, top: 520, width: 800, color: C.night }}
      >
        <p style={{ ...textStyle, fontSize: 48, lineHeight: 1.3 }}>When the horizon disappears, the mid layer keeps you moving.</p>
      </Reveal>

      <div style={{ position: 'absolute', left: (1080 - 560) / 2, top: 780, transform: `translateY(${(6 - 12 * p) * 6}px)` }}>
        <ProductTile
          src="products/grid-fleece.png"
          name="Arc'teryx Grid Fleece Half-Zip"
          start={6}
          width={560}
          ratio={1.06}
          tone={C.night}
        />
      </div>
    </AbsoluteFill>
  );
};
