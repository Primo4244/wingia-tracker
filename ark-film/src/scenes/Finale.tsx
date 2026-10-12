import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Fog } from '../components/Atmosphere';
import { Ridge } from '../components/Ridge';
import { Snow } from '../components/Snow';
import { displayStyle, MaskLine, Reveal, textStyle } from '../components/Type';
import { progress, tween } from '../lib/motion';
import { body, C, power2Out, SAFE } from '../theme';

export const FINALE_FRAMES = 105;

/**
 * ark-finale then the footer: the scene settles and darkens (scale 1.16 → 1, shade 0.55 → 1)
 * while "Winter here / is not a season." rise line by line (power2.out), the statement and
 * the action follow, and the ARK wordmark rises at the bottom, fading into the night.
 */
export const Finale: React.FC = () => {
  const frame = useCurrentFrame();
  const p = progress(frame, 0, 45);

  return (
    <AbsoluteFill style={{ backgroundColor: C.night, overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `scale(${1.16 - 0.16 * tween(frame, 0, 60, 0, 1)})` }}>
        <AbsoluteFill style={{ background: 'linear-gradient(180deg, #0B1015 0%, #121A23 45%, #22303D 75%, #2A3846 100%)' }} />
        <Ridge
          seed={51}
          base={1720}
          amp={260}
          peak={{ x: 0.62, height: 260, spread: 0.22 }}
          top="#3B5064"
          bottom="#121A23"
          detail
        />
        <Fog
          seed={52}
          opacity={0.25}
          drift={1.2}
          y={[1400, 1800]}
        />
      </AbsoluteFill>
      <Snow
        seed={53}
        density={5}
        minSize={3}
        maxSize={8}
        speed={1}
        opacity={0.55}
      />
      <AbsoluteFill style={{ backgroundColor: C.night, opacity: 0.55 + 0.35 * p }} />

      <div style={{ position: 'absolute', left: SAFE.left, right: SAFE.right - 40, top: SAFE.top + 30, color: C.frost }}>
        <h2 style={{ ...displayStyle, fontSize: 136, lineHeight: 0.9, whiteSpace: 'nowrap' }}>
          <MaskLine
            start={2}
            duration={18}
            ease={power2Out}
          >
            Winter here
          </MaskLine>
          <MaskLine
            start={8}
            duration={18}
            ease={power2Out}
          >
            is not a season.
          </MaskLine>
        </h2>
        <Reveal
          start={18}
          distance={24}
          duration={18}
          style={{ marginTop: 34 }}
        >
          <p style={{ ...textStyle, fontSize: 44, maxWidth: 800, color: 'rgb(233 238 242 / 0.85)' }}>
            It is the weather we dress for, layer by layer, from the shell inward.
          </p>
        </Reveal>
        <Reveal
          start={26}
          distance={16}
          duration={16}
          style={{ marginTop: 40, display: 'grid', gap: 18, justifyItems: 'start' }}
        >
          <p style={{ ...textStyle, fontSize: 44, color: C.frost, fontWeight: 500 }}>Every piece in this film is in the shop.</p>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 18,
              padding: '32px 46px',
              background: C.frost,
              color: C.night,
              fontFamily: body,
              fontWeight: 600,
              fontSize: 46,
              lineHeight: 1,
            }}
          >
            Shop the pieces · link in bio
            <svg
              width="36"
              height="36"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path
                d="M3 10h13M11 5l5 5-5 5"
                stroke={C.night}
                strokeWidth="1.8"
              />
            </svg>
          </span>
        </Reveal>
      </div>

      {/* The footer wordmark: huge, centred, frost fading into the night below it. */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1010, display: 'flex', justifyContent: 'center' }}>
        <MaskLine
          start={30}
          duration={40}
        >
          <span
            style={{
              ...displayStyle,
              display: 'block',
              fontSize: 600,
              lineHeight: 0.78,
              letterSpacing: '-0.02em',
              backgroundImage: 'linear-gradient(180deg, #E9EEF2 0%, #9FB3C4 45%, rgb(42 56 70 / 0.35) 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            ARK
          </span>
        </MaskLine>
      </div>
    </AbsoluteFill>
  );
};
