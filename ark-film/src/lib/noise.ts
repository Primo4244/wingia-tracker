/** Deterministic randomness: the same seed gives the same mountains, snow and contours every render. */
export const rng = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const smooth = (t: number) => t * t * (3 - 2 * t);

/** 1D fractal value noise in [0, 1]. */
export const fbm1 = (seed: number, octaves = 5) => {
  const tables = Array.from({ length: octaves }, (_, o) => {
    const r = rng(seed * 131 + o * 17);
    return Array.from({ length: 4096 }, r);
  });
  return (x: number) => {
    let sum = 0;
    let amp = 1;
    let total = 0;
    for (let o = 0; o < octaves; o++) {
      const f = x * 2 ** o;
      const i = Math.floor(f);
      const t = smooth(f - i);
      const table = tables[o];
      const a = table[((i % 4096) + 4096) % 4096];
      const b = table[(((i + 1) % 4096) + 4096) % 4096];
      sum += amp * (a + (b - a) * t);
      total += amp;
      amp *= 0.5;
    }
    return sum / total;
  };
};

/** 2D fractal value noise in [0, 1], used for the topographic heightfield. */
export const fbm2 = (seed: number, octaves = 4) => {
  const size = 256;
  const tables = Array.from({ length: octaves }, (_, o) => {
    const r = rng(seed * 977 + o * 31);
    return Array.from({ length: size * size }, r);
  });
  const at = (table: number[], x: number, y: number) =>
    table[(((y % size) + size) % size) * size + (((x % size) + size) % size)];
  return (x: number, y: number) => {
    let sum = 0;
    let amp = 1;
    let total = 0;
    for (let o = 0; o < octaves; o++) {
      const fx = x * 2 ** o;
      const fy = y * 2 ** o;
      const ix = Math.floor(fx);
      const iy = Math.floor(fy);
      const tx = smooth(fx - ix);
      const ty = smooth(fy - iy);
      const t = tables[o];
      const top = at(t, ix, iy) + (at(t, ix + 1, iy) - at(t, ix, iy)) * tx;
      const bottom = at(t, ix, iy + 1) + (at(t, ix + 1, iy + 1) - at(t, ix, iy + 1)) * tx;
      sum += amp * (top + (bottom - top) * ty);
      total += amp;
      amp *= 0.5;
    }
    return sum / total;
  };
};
