import React from 'react';
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile } from 'remotion';
import { Grain } from './components/Atmosphere';
import { Collection } from './scenes/Collection';
import { DeepCold } from './scenes/DeepCold';
import { Essentials } from './scenes/Essentials';
import { Finale } from './scenes/Finale';
import { Summit } from './scenes/Summit';
import { Whiteout } from './scenes/Whiteout';
import { Wind } from './scenes/Wind';
import { C } from './theme';

/**
 * The 30 s cut: the homepage in order, from the shell inward. Every cut lands on the 15-frame
 * beat (120 BPM). Durations are provisional until the 30 s voice-over take is placed.
 */
export const PLAN_30: { id: string; frames: number; render: (frames: number) => React.ReactNode }[] = [
  { id: 'summit', frames: 120, render: (f) => <Summit frames={f} /> },
  { id: 'wind', frames: 120, render: (f) => <Wind frames={f} /> },
  {
    id: 'whiteout',
    frames: 150,
    render: (f) => (
      <Whiteout
        frames={f}
        piece="gridFleece"
        line="When the horizon disappears, the mid layer keeps you moving."
      />
    ),
  },
  { id: 'deep-cold', frames: 105, render: (f) => <DeepCold frames={f} /> },
  { id: 'essentials', frames: 120, render: (f) => <Essentials frames={f} /> },
  { id: 'collection', frames: 105, render: (f) => <Collection frames={f} /> },
  { id: 'finale', frames: 180, render: (f) => <Finale frames={f} /> },
];

export const AD30_FRAMES = PLAN_30.reduce((sum, s) => sum + s.frames, 0);

/** Set once the 30 s take is placed in public/audio/vo-30.wav. */
const HAS_VO = false;

/** Music under the voice: down 12 dB from just before the first line, and it stays down. */
const musicVolume = (frame: number) =>
  HAS_VO ? interpolate(frame, [4, 10], [1, 0.25], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 1;

export const Ad30: React.FC = () => {
  let from = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: C.night }}>
      {PLAN_30.map(({ id, frames, render }) => {
        const start = from;
        from += frames;
        return (
          <Sequence
            key={id}
            name={id}
            from={start}
            durationInFrames={frames}
          >
            {render(frames)}
          </Sequence>
        );
      })}
      <Grain />
      {/* Temporary score, 120 BPM: hits on every cut (scripts/make-music.py). */}
      <Audio
        src={staticFile('audio/temp-30.wav')}
        volume={musicVolume}
      />
      {HAS_VO ? <Audio src={staticFile('audio/vo-30.wav')} /> : null}
    </AbsoluteFill>
  );
};
