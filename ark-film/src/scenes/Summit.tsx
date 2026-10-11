import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { Fog } from '../components/Atmosphere';
import { Ridge } from '../components/Ridge';
import { Snow } from '../components/Snow';
import { displayStyle, MaskLine, Reveal, textStyle } from '../components/Type';
import { easeInOut, C, SAFE, H } from '../theme';
import { s, tween } from '../lib/motion';

export const SUMMIT_FRAMES = 105;

/**
 * ark-summit: a blue-hour summit in depth planes (sky, far massif, the ARK wordmark, the near
 * ridge that hides its feet), two snow planes, then the copy. Timings are the site's intro:
 * dawn 2.6 s, ridge lift 2.4 s, letters 1.7 s with 0.11 s stagger from 0.25 s, title lines from
 * 0.95 s. The last beats play the site's scroll depth: the wordmark sinks back behind the ridge.
 */
export const Summit: React.FC = () => {
  const frame = useCurrentFrame();

  const dawn = tween(frame, 0, s(2.6), 0, 1);
  const ridgeLift = tween(frame, 0, s(2.4), 60, 0);
  // Virtual scroll for the exit, eased like a hand on a trackpad.
  const scroll = tween(frame, 72, SUMMIT_FRAMES - 72, 0, 1, easeInOut);

  const letters = 'ARK'.split('');

  return (
    <AbsoluteFill style={{ backgroundColor: C.night, overflow: 'hidden' }}>
      {/* Sky and far massif: settle in from a darker, wider shot. */}
      <AbsoluteFill
        style={{
          transform: `translateY(${scroll * 0.12 * 400}px) scale(${1.16 - 0.16 * dawn})`,
          filter: `brightness(${0.4 + 0.6 * dawn}) saturate(${0.7 + 0.3 * dawn})`,
          transformOrigin: '50% 40%',
        }}
      >
        {/* The massif: rendered from a procedural heightfield (scripts/make-terrain.py), sky included. */}
        <Img
          src={staticFile('terrain/summit-far.png')}
          style={{ position: 'absolute', left: -210, top: 0, width: 1500, height: 1920, filter: 'contrast(1.12)' }}
        />
        <Fog
          seed={8}
          opacity={0.55}
          drift={0.8}
          y={[860, 1060]}
        />
      </AbsoluteFill>

      <Snow
        seed={1}
        density={9}
        minSize={3}
        maxSize={8}
        speed={1.1}
        opacity={0.7}
        gust={(f) => (f > 72 ? 4 * scroll : 0)}
      />

      {/* The wordmark, placed so its feet are buried behind the near ridge. */}
      <div
        style={{
          ...displayStyle,
          position: 'absolute',
          left: 0,
          right: 0,
          top: 600,
          display: 'flex',
          justifyContent: 'center',
          fontSize: 560,
          lineHeight: 0.8,
          letterSpacing: '-0.02em',
          color: C.frost,
          textShadow: '0 0.04em 0.18em rgb(11 16 21 / 0.25)',
          transform: `translateY(${scroll * 0.75 * 448}px)`,
        }}
      >
        {letters.map((letter, i) => (
          <span
            key={letter}
            style={{
              display: 'inline-block',
              transform: `translateY(${tween(frame, s(0.25) + i * s(0.11), s(1.7), 140, 0)}%)`,
            }}
          >
            {letter}
          </span>
        ))}
      </div>

      <AbsoluteFill style={{ transform: `translateY(${ridgeLift - scroll * 0.07 * H}px)` }}>
        <Ridge
          seed={11}
          base={1230}
          amp={230}
          top="#2E3E4E"
          bottom="#0E151C"
          detail
        />
      </AbsoluteFill>

      <Snow
        seed={2}
        density={0.9}
        minSize={18}
        maxSize={44}
        speed={3.2}
        opacity={0.5}
        blur={2}
        gust={(f) => (f > 72 ? 10 * scroll : 0)}
      />

      {/* Night at the top for the platform UI, night at the bottom under the copy. */}
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(to bottom, rgb(11 16 21 / 0.62), rgb(11 16 21 / 0) 260px), linear-gradient(to top, #0B1015 0%, #0B1015 20%, rgb(11 16 21 / 0.72) 34%, rgb(11 16 21 / 0) 52%)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: SAFE.left,
          right: SAFE.right,
          top: 1170,
          color: C.frost,
          opacity: 1 - 0.85 * scroll,
          transform: `translateY(${-scroll * 60}px)`,
        }}
      >
        <h1 style={{ ...displayStyle, fontSize: 104, lineHeight: 0.9 }}>
          <MaskLine start={s(0.45)}>Jackets and toques</MaskLine>
          <MaskLine start={s(0.52)}>for the cold</MaskLine>
        </h1>
        <Reveal
          start={s(0.6)}
          distance={18}
          style={{ marginTop: 26 }}
        >
          <p style={{ ...textStyle, maxWidth: 760, color: 'rgb(233 238 242 / 0.8)' }}>Shells, down, fleece and knit toques for real winter.</p>
        </Reveal>
      </div>
    </AbsoluteFill>
  );
};
