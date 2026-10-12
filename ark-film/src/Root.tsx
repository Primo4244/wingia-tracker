import React from 'react';
import { Composition } from 'remotion';
import { Ad15, AD15_FRAMES } from './Ad15';
import { Ad30, AD30_FRAMES } from './Ad30';
import { loadFonts } from './lib/fonts';
import { FPS, H, W } from './theme';

loadFonts();

export const Root: React.FC = () => (
  <>
    <Composition
      id="ARK-15"
      component={Ad15}
      durationInFrames={AD15_FRAMES}
      fps={FPS}
      width={W}
      height={H}
    />
    <Composition
      id="ARK-30"
      component={Ad30}
      durationInFrames={AD30_FRAMES}
      fps={FPS}
      width={W}
      height={H}
    />
  </>
);
