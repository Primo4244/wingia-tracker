import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import { Grain } from './components/Atmosphere';
import { Summit, SUMMIT_FRAMES } from './scenes/Summit';
import { DeepCold, DEEP_COLD_FRAMES } from './scenes/DeepCold';
import { Finale, FINALE_FRAMES } from './scenes/Finale';
import { Whiteout, WHITEOUT_FRAMES } from './scenes/Whiteout';
import { Wind, WIND_FRAMES } from './scenes/Wind';
import { C } from './theme';

/** Scene plan for the 15 s cut. Every start is a multiple of the 15-frame beat (120 BPM). */
export const PLAN_15 = [
  { id: 'summit', from: 0, frames: SUMMIT_FRAMES, Scene: Summit },
  { id: 'wind', from: 105, frames: WIND_FRAMES, Scene: Wind },
  { id: 'whiteout', from: 195, frames: WHITEOUT_FRAMES, Scene: Whiteout },
  { id: 'deep-cold', from: 285, frames: DEEP_COLD_FRAMES, Scene: DeepCold },
  { id: 'finale', from: 360, frames: FINALE_FRAMES, Scene: Finale },
];

export const AD15_FRAMES = 450;

export const Ad15: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.night }}>
    {PLAN_15.map(({ id, from, frames, Scene }) => (
      <Sequence
        key={id}
        name={id}
        from={from}
        durationInFrames={frames}
      >
        <Scene />
      </Sequence>
    ))}
    <Grain />
    {/* Temporary score, 120 BPM: its hits land on the cuts at 3.5, 6.5, 9.5 and 12 s. */}
    <Audio src={staticFile('audio/temp-15.wav')} />
  </AbsoluteFill>
);
