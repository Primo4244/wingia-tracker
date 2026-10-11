import React from 'react';
import { Composition } from 'remotion';
import { Ad15, AD15_FRAMES } from './Ad15';
import { loadFonts } from './lib/fonts';
import { FPS, H, W } from './theme';

loadFonts();

export const Root: React.FC = () => (
  <Composition
    id="ARK-15"
    component={Ad15}
    durationInFrames={AD15_FRAMES}
    fps={FPS}
    width={W}
    height={H}
  />
);
