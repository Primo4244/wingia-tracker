import { useEffect, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';

export type WorldMeta = { size: number; n: number; x0: number; zFar: number; farSize: number; fn: number; farZ0: number; summit: [number, number, number] };
export type WorldData = { meta: WorldMeta; height: Float32Array; far: Float32Array; line: [number, number, number][]; toques: Record<string, string> };

let cache: Promise<WorldData> | null = null;

const load = () =>
  (cache ??= (async () => {
    const [meta, height, far, line, toques] = await Promise.all([
      fetch(staticFile('world/meta.json')).then((r) => r.json()),
      fetch(staticFile('world/height.bin')).then((r) => r.arrayBuffer()),
      fetch(staticFile('world/far.bin')).then((r) => r.arrayBuffer()),
      fetch(staticFile('world/line.json')).then((r) => r.json()),
      fetch(staticFile('toques/index.json')).then((r) => r.json()),
    ]);
    return { meta, height: new Float32Array(height), far: new Float32Array(far), line, toques };
  })());

/** The baked world (scripts/make-world.py), loaded once per tab; rendering waits for it. */
export const useWorldData = () => {
  const [data, setData] = useState<WorldData | null>(null);
  const [handle] = useState(() => delayRender('Loading the world'));
  useEffect(() => {
    load()
      .then((d) => {
        setData(d);
        continueRender(handle);
      })
      .catch((e) => {
        console.error(e);
        continueRender(handle);
      });
  }, [handle]);
  return data;
};
