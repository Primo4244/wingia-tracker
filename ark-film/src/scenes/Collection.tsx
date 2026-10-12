import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Contours } from '../components/Atmosphere';
import { displayStyle, MaskLine, ProductTile, Reveal, textStyle } from '../components/Type';
import { formatPrice, PRODUCTS } from '../data/products';
import { progress } from '../lib/motion';
import { C, SAFE } from '../theme';

export const COLLECTION_FRAMES = 105;

/** The homepage collection's four pieces, in its order: shell, down hoody, vest, fleece. */
const PIECES = [PRODUCTS.betaSl, PRODUCTS.thorium, PRODUCTS.downVest, PRODUCTS.gridFleece];

/**
 * ark-collection "The collection": the four pieces rise into place one after another, and the
 * columns drift at slightly different depths (the site's depth list [-48, -16, -40, -8]).
 */
export const Collection: React.FC<{ frames?: number }> = ({ frames = COLLECTION_FRAMES }) => {
  const frame = useCurrentFrame();
  const p = progress(frame, 0, frames);
  const depth = [-48, -16, -40, -8];

  return (
    <AbsoluteFill style={{ backgroundColor: C.night, overflow: 'hidden' }}>
      <Contours
        seed={71}
        opacity={0.1}
        offset={[0, -p * 40]}
      />

      <div style={{ position: 'absolute', left: SAFE.left, right: SAFE.right, top: SAFE.top + 10, color: C.frost }}>
        <h2 style={{ ...displayStyle, fontSize: 150, lineHeight: 0.9 }}>
          <MaskLine start={0}>The collection</MaskLine>
        </h2>
        <Reveal
          start={8}
          style={{ marginTop: 22 }}
        >
          <p style={{ ...textStyle, fontSize: 42, maxWidth: 800, color: 'rgb(233 238 242 / 0.85)' }}>
            Four layers to start: a shell, a down hoody, a vest and a fleece.
          </p>
        </Reveal>
      </div>

      <div
        style={{
          position: 'absolute',
          left: SAFE.left,
          top: 580,
          display: 'grid',
          gridTemplateColumns: '384px 384px',
          columnGap: 34,
          rowGap: 26,
        }}
      >
        {PIECES.map((piece, i) => (
          <div
            key={piece.name}
            style={{ transform: `translateY(${depth[i] * p}px)` }}
          >
            <ProductTile
              src={piece.image}
              name={piece.name}
              price={formatPrice(piece.price)}
              start={6 + i * 5}
              width={384}
              ratio={0.78}
              compact
            />
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
