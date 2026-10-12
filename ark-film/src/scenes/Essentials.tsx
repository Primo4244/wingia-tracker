import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Fog } from '../components/Atmosphere';
import { Ridge } from '../components/Ridge';
import { Snow } from '../components/Snow';
import { displayStyle, MaskLine, ProductTile, Reveal, textStyle } from '../components/Type';
import { formatPrice, PRODUCTS, TOQUE_COLOURS } from '../data/products';
import { progress } from '../lib/motion';
import { C, SAFE } from '../theme';

export const ESSENTIALS_FRAMES = 120;

/**
 * ark-essentials "Winter essentials": the compact toque rail of the homepage. The pink Bird
 * toque leads, large; three other colours rise beside it one after another (revealPieces:
 * the card rises, its packshot settles), under falling snow at night.
 */
export const Essentials: React.FC<{ frames?: number }> = ({ frames = ESSENTIALS_FRAMES }) => {
  const frame = useCurrentFrame();
  const p = progress(frame, 0, frames);
  const { toque } = PRODUCTS;

  return (
    <AbsoluteFill style={{ backgroundColor: C.night, overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `scale(${1.12 - 0.12 * p})` }}>
        <AbsoluteFill style={{ background: 'linear-gradient(180deg, #0B1015 0%, #121A23 55%, #2A3846 100%)' }} />
        <Ridge
          seed={61}
          base={1760}
          amp={240}
          peak={{ x: 0.3, height: 200, spread: 0.25 }}
          top="#34475A"
          bottom="#121A23"
          detail
        />
        <Fog
          seed={62}
          opacity={0.2}
          drift={1}
          y={[1500, 1850]}
        />
      </AbsoluteFill>
      <Snow
        seed={63}
        density={7}
        minSize={3}
        maxSize={8}
        speed={1.4}
        opacity={0.65}
      />
      <Snow
        seed={64}
        density={0.7}
        minSize={16}
        maxSize={36}
        speed={3}
        opacity={0.45}
        blur={2}
      />

      <div style={{ position: 'absolute', left: SAFE.left, right: SAFE.right, top: SAFE.top + 10, color: C.frost }}>
        <h2 style={{ ...displayStyle, fontSize: 150, lineHeight: 0.9 }}>
          <MaskLine start={0}>Winter</MaskLine>
          <MaskLine start={3}>essentials</MaskLine>
        </h2>
        <Reveal
          start={10}
          style={{ marginTop: 22 }}
        >
          <p style={{ ...textStyle, fontSize: 48, color: 'rgb(233 238 242 / 0.88)' }}>The last layer, on top.</p>
        </Reveal>
      </div>

      <div style={{ position: 'absolute', left: SAFE.left, top: 640, transform: `translateY(${(6 - 12 * p) * 5}px)` }}>
        <ProductTile
          src={toque.image}
          name={toque.name}
          colour={toque.colour}
          price={formatPrice(toque.price)}
          start={4}
          width={540}
          ratio={0.95}
          zoom={1.4}
        />
      </div>

      <div style={{ position: 'absolute', left: 676, top: 640, display: 'grid', gap: 22, transform: `translateY(${(4 - 14 * p) * 5}px)` }}>
        {TOQUE_COLOURS.map((t, i) => (
          <ProductTile
            key={t.colour}
            src={t.image}
            name={t.colour}
            start={10 + i * 4}
            width={254}
            ratio={0.72}
            zoom={1.3}
            compact
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};
