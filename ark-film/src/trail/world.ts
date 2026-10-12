import { fbm2 } from '../lib/noise';

/**
 * The world of "The line": one long knife-edge arête running away from the camera (-z) and
 * climbing to a summit, with rough peaks and drops on both sides. Units are roughly metres / 2.
 */
const relief = fbm2(91, 5);
const fine = fbm2(92, 4);

export const LENGTH = 900;
export const SUMMIT_Z = -830;

/** The crest line: where the toques stand, in x, for a given z. */
export const crestX = (z: number) => 34 * Math.sin(z * 0.0062) + 16 * Math.sin(z * 0.017 + 1.3) + 6 * Math.sin(z * 0.041);

/** Crest height: rising toward a summit at the far end. */
export const crestY = (z: number) => {
  // Rises to the summit, then falls away steeply behind it, so the summit stands alone.
  const past = Math.max(0, SUMMIT_Z - z);
  const climb = 60 + 0.11 * Math.min(-z, -SUMMIT_Z) - 1.4 * past;
  const summit = 70 * Math.exp(-(((z - SUMMIT_Z) / 140) ** 2));
  const saddle = -22 * Math.exp(-(((z + 360) / 55) ** 2));
  const bumps = 6 * Math.sin(z * 0.05) + 3 * Math.sin(z * 0.13);
  return climb + summit + saddle + bumps;
};

const ridged = (x: number, z: number) => {
  let sum = 0;
  let amp = 1;
  let w = 1;
  for (let o = 0; o < 4; o++) {
    const n = relief(x * 0.004 * 2 ** o + 10, z * 0.004 * 2 ** o + 20) * 2 - 1;
    const r = (1 - Math.abs(n)) ** 2 * w;
    w = Math.min(1, r * 1.8);
    sum += r * amp;
    amp *= 0.5;
  }
  return sum;
};

/**
 * Height of the rendered mesh (a 2-unit grid of triangles), not of the smooth function: the
 * toques stand on what the camera sees, so none float above a sharp crest.
 */
export const GRID = { x0: -280, z0: 90, step: 2 };
export const meshHeight = (x: number, z: number) => {
  const gx = (x - GRID.x0) / GRID.step;
  const gz = (GRID.z0 - z) / GRID.step;
  const i = Math.floor(gx);
  const j = Math.floor(gz);
  const fx = gx - i;
  const fz = gz - j;
  const at = (a: number, b: number) => height(GRID.x0 + a * GRID.step, GRID.z0 - b * GRID.step);
  // The plane's triangles split each cell along one diagonal; take the lower of the two faces' corners as a safe floor.
  const h00 = at(i, j), h10 = at(i + 1, j), h01 = at(i, j + 1), h11 = at(i + 1, j + 1);
  const bilinear = h00 * (1 - fx) * (1 - fz) + h10 * fx * (1 - fz) + h01 * (1 - fx) * fz + h11 * fx * fz;
  return Math.min(bilinear, height(x, z));
};

/** Terrain height anywhere. */
export const height = (x: number, z: number) => {
  const d = Math.abs(x - crestX(z));
  const crest = crestY(z);
  // Knife edge: flat enough on top to stand a line of toques, steep below.
  const flank = crest - 0.06 * d * d * Math.exp(-d / 40) - 1.05 * Math.max(0, d - 6);
  // Rough neighbouring peaks, growing away from the crest so the line itself stays clean.
  const peaks = 70 * ridged(x, z) * Math.min(1, d / 60) - 30;
  // Rock and wind-carved snow: grit grows quickly off the crest line.
  const grit = (fine(x * 0.05, z * 0.05) - 0.5) * Math.min(10, 0.4 + d * 0.3) + (fine(x * 0.2, z * 0.2) - 0.5) * Math.min(2.5, d * 0.12);
  return Math.max(flank, peaks + flank * 0.25) + grit;
};
