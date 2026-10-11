import React from 'react';
import { AbsoluteFill, staticFile, useCurrentFrame } from 'remotion';
import { Contours } from '../components/Atmosphere';
import { Snow } from '../components/Snow';
import { displayStyle, headingStyle, MaskLine, ProductTile, Reveal, textStyle } from '../components/Type';
import { progress } from '../lib/motion';
import { C, SAFE } from '../theme';

export const DEEP_COLD_FRAMES = 75;

/** Ice-filled letters, as the site's .ark-frost__letters: glacier blue screened with an ice texture. */
const IceWord: React.FC<{ children: string; shift: number }> = ({ children, shift }) => (
  <span
    style={{
      display: 'inline-block',
      color: C.glacier,
      backgroundColor: C.frostFill,
      backgroundImage: `linear-gradient(180deg, rgb(233 238 242 / 0.55), rgb(233 238 242 / 0.1) 70%), url(${staticFile('textures/ice.jpg')})`,
      backgroundBlendMode: 'screen, screen',
      backgroundSize: '100% 100%, cover',
      backgroundPosition: `0 0, 50% ${shift}%`,
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    }}
  >
    {children}
  </span>
);

/**
 * ark-frost "Deep cold": the two words rise out of their masks (105% → 0, 0.12 s stagger), the
 * ice drifts inside them (10% → 65% and 85% → 30%), and the insulated piece stands in front of
 * the second line. Contour lines of an invented massif drift behind, very faint.
 */
export const DeepCold: React.FC = () => {
  const frame = useCurrentFrame();
  const p = progress(frame, 0, DEEP_COLD_FRAMES);

  return (
    <AbsoluteFill style={{ backgroundColor: C.night, overflow: 'hidden' }}>
      <Contours
        seed={41}
        opacity={0.16}
        offset={[0, -p * 60]}
      />
      <Snow
        seed={42}
        density={3}
        minSize={2}
        maxSize={6}
        speed={0.9}
        opacity={0.5}
      />

      <div
        style={{
          ...displayStyle,
          position: 'absolute',
          left: SAFE.left - 18,
          top: SAFE.top - 10,
          fontSize: 430,
          lineHeight: 0.78,
          letterSpacing: '-0.015em',
        }}
      >
        <MaskLine
          start={0}
          duration={36}
        >
          <IceWord shift={10 + 55 * p}>Deep</IceWord>
        </MaskLine>
        <MaskLine
          start={4}
          duration={36}
        >
          <IceWord shift={85 - 55 * p}>Cold</IceWord>
        </MaskLine>
      </div>

      <Reveal
        start={14}
        style={{ position: 'absolute', left: SAFE.left, top: 1010, width: 330, color: C.frost }}
      >
        <h2 style={{ ...headingStyle, fontSize: 64 }}>Insulation</h2>
        <p style={{ ...textStyle, fontSize: 42, marginTop: 12, color: 'rgb(233 238 242 / 0.85)', textWrap: 'pretty' } as React.CSSProperties}>
          Insulated pieces hold warmth in.
        </p>
      </Reveal>

      <div style={{ position: 'absolute', left: 480, top: 840, transform: `translateY(${(8 - 16 * p) * 6}px)` }}>
        <ProductTile
          src="products/macai.png"
          name="Arc'teryx Macai Jacket"
          start={4}
          width={450}
          ratio={1.12}
        />
      </div>
    </AbsoluteFill>
  );
};
