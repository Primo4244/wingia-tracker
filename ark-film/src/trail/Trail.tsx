import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import React, { useLayoutEffect, useMemo, useRef } from 'react';
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame } from 'remotion';
import * as THREE from 'three';
import { Grain } from '../components/Atmosphere';
import { displayStyle, MaskLine, Reveal } from '../components/Type';
import { rng } from '../lib/noise';
import { tween } from '../lib/motion';
import { body, C, easeInOut, H, SAFE, W } from '../theme';
import { LINE_ORDER, PINK, TOQUE_VARIANTS } from './toques';
import { crestX, height, meshHeight, SUMMIT_Z } from './world';

export const TRAIL_FRAMES = 450;

const SPACING = 4.6;
const TOQUE_H = 3.2;

/** The line: points along the crest, evenly spaced by arc length, with their heading. */
const buildLine = () => {
  const samples: THREE.Vector3[] = [];
  for (let z = 10; z >= SUMMIT_Z; z -= 0.5) samples.push(new THREE.Vector3(crestX(z), 0, z));
  const lengths = [0];
  for (let i = 1; i < samples.length; i++) lengths.push(lengths[i - 1] + samples[i].distanceTo(samples[i - 1]));
  const total = lengths[lengths.length - 1];
  const at = (s: number) => {
    let i = lengths.findIndex((l) => l >= s);
    if (i <= 0) i = 1;
    const t = (s - lengths[i - 1]) / (lengths[i] - lengths[i - 1] || 1);
    const p = samples[i - 1].clone().lerp(samples[i], Math.min(1, Math.max(0, t)));
    p.y = meshHeight(p.x, p.z);
    return p;
  };
  return { at, total };
};

const LINE = buildLine();

/** Toques up to just under the summit, then a gap, then the pink one alone on top. */
const PLACES = (() => {
  const list: { s: number; variant: number }[] = [];
  const last = LINE.total - 26;
  const count = Math.floor(last / SPACING);
  for (let i = 0; i < count; i++) list.push({ s: 6 + i * SPACING, variant: LINE_ORDER[i % LINE_ORDER.length] });
  list.push({ s: LINE.total - 2, variant: PINK });
  return list;
})();

/** Knit: vertical ribs as a bump texture, shared by every toque. */
const knitTexture = () => {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 64;
  const g = c.getContext('2d')!;
  for (let x = 0; x < 512; x++) {
    const v = 128 + 110 * Math.sin((x / 512) * Math.PI * 2 * 64);
    g.fillStyle = `rgb(${v},${v},${v})`;
    g.fillRect(x, 0, 1, 64);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
};

/** The knitted graphic: a bold angular line drawing around the crown (alpha map). */
const graphicTexture = () => {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 256;
  const g = c.getContext('2d')!;
  g.fillStyle = '#000';
  g.fillRect(0, 0, 1024, 256);
  g.strokeStyle = '#fff';
  g.lineWidth = 16;
  g.lineJoin = 'miter';
  g.lineCap = 'square';
  const r = rng(5);
  g.beginPath();
  g.moveTo(40, 190);
  for (let x = 40; x < 980; x += 46) g.lineTo(x + 23, 70 + r() * 60), g.lineTo(x + 46, 170 + r() * 40);
  g.stroke();
  for (let x = 120; x < 960; x += 92) {
    g.beginPath();
    g.moveTo(x, 150);
    g.lineTo(x + 18, 215);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  return t;
};

const crownProfile = [
  [0.0, 1.0], [0.22, 0.985], [0.4, 0.93], [0.53, 0.82], [0.61, 0.66], [0.645, 0.48], [0.66, 0.3], [0.665, 0.0],
]
  // Bottom to top, so the lathe's faces point outward.
  .reverse()
  .map(([x, y]) => new THREE.Vector2(x, y));

const Toques: React.FC = () => {
  const crown = useRef<THREE.InstancedMesh>(null);
  const cuff = useRef<THREE.InstancedMesh>(null);
  const art = useRef<THREE.InstancedMesh>(null);
  const { knit, graphic, crownGeo, cuffGeo, artGeo } = useMemo(
    () => ({
      knit: knitTexture(),
      graphic: graphicTexture(),
      crownGeo: new THREE.LatheGeometry(crownProfile, 48),
      cuffGeo: new THREE.CylinderGeometry(0.69, 0.69, 0.3, 48, 1, true).translate(0, 0.15, 0),
      artGeo: new THREE.LatheGeometry(
        crownProfile.filter((p) => p.y > 0.28 && p.y < 0.9).map((p) => new THREE.Vector2(p.x * 1.006, p.y)),
        48
      ),
    }),
    []
  );

  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const r = rng(17);
    const col = new THREE.Color();
    PLACES.forEach(({ s, variant }, i) => {
      const p = LINE.at(s);
      const ahead = LINE.at(s + 1);
      const yaw = Math.atan2(ahead.x - p.x, ahead.z - p.z) + (r() - 0.5) * 0.3;
      q.setFromEuler(new THREE.Euler((r() - 0.5) * 0.05, yaw, (r() - 0.5) * 0.05));
      const scale = TOQUE_H * (i === PLACES.length - 1 ? 1.7 : 1);
      m.compose(new THREE.Vector3(p.x, p.y - 0.35, p.z), q, new THREE.Vector3(scale, scale, scale));
      for (const ref of [crown, cuff, art]) ref.current?.setMatrixAt(i, m);
      const v = TOQUE_VARIANTS[variant];
      crown.current?.setColorAt(i, col.set(v.crown));
      cuff.current?.setColorAt(i, col.set(v.crown).multiplyScalar(0.9));
      art.current?.setColorAt(i, col.set(v.graphic));
    });
    for (const ref of [crown, cuff, art]) {
      if (!ref.current) continue;
      ref.current.instanceMatrix.needsUpdate = true;
      if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
    }
  }, []);

  return (
    <group>
      <instancedMesh
        ref={crown}
        args={[crownGeo, undefined, PLACES.length]}
      >
        <meshStandardMaterial
          roughness={0.95}
          bumpMap={knit}
          bumpScale={0.6}
        />
      </instancedMesh>
      <instancedMesh
        ref={cuff}
        args={[cuffGeo, undefined, PLACES.length]}
      >
        <meshStandardMaterial
          roughness={0.95}
          bumpMap={knit}
          bumpScale={0.6}
          side={THREE.DoubleSide}
        />
      </instancedMesh>
      <instancedMesh
        ref={art}
        args={[artGeo, undefined, PLACES.length]}
      >
        <meshStandardMaterial
          roughness={0.95}
          alphaMap={graphic}
          alphaTest={0.5}
          transparent
          bumpMap={knit}
          bumpScale={0.5}
        />
      </instancedMesh>
    </group>
  );
};

/** The arête and its surroundings: one mesh, snow on gentle slopes, rock on steep ones. */
const Terrain: React.FC = () => {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(560, 1060, 280, 530);
    g.rotateX(-Math.PI / 2);
    // Matches GRID in world.ts: x from -280, z from +90, 2-unit cells.
    g.translate(0, 0, -440);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) pos.setY(i, height(pos.getX(i), pos.getZ(i)));
    g.computeVertexNormals();
    const nrm = g.attributes.normal;
    const colors = new Float32Array(pos.count * 3);
    const snow = new THREE.Color('#eef3f7');
    const shade = new THREE.Color('#c9d6e0');
    const rock = new THREE.Color('#2b333d');
    const c = new THREE.Color();
    const r = rng(3);
    for (let i = 0; i < pos.count; i++) {
      const up = nrm.getY(i);
      const jitter = (r() - 0.5) * 0.12;
      const k = THREE.MathUtils.smoothstep(up + jitter, 0.55, 0.78);
      c.copy(rock).lerp(up > 0.9 ? snow : shade, k);
      colors.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return g;
  }, []);

  return (
    <mesh geometry={geo}>
      <meshStandardMaterial
        vertexColors
        roughness={0.92}
        metalness={0}
      />
    </mesh>
  );
};

/** Blowing snow around the camera: positions are a pure function of the frame. */
const SnowField: React.FC<{ center: THREE.Vector3; opacity: number }> = ({ center, opacity }) => {
  const frame = useCurrentFrame();
  const COUNT = 5000;
  const BOX = new THREE.Vector3(90, 50, 90);
  const { base, geo, sprite } = useMemo(() => {
    const r = rng(77);
    const b = new Float32Array(COUNT * 3).map(() => r());
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(COUNT * 3), 3));
    const c = document.createElement('canvas');
    c.width = c.height = 32;
    const x = c.getContext('2d')!;
    const grad = x.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = grad;
    x.fillRect(0, 0, 32, 32);
    return { base: b, geo: g, sprite: new THREE.CanvasTexture(c) };
  }, []);

  const pos = geo.attributes.position as THREE.BufferAttribute;
  const t = frame / 30;
  const wind = new THREE.Vector3(14, -6, 9);
  const wrap = (v: number, size: number, c: number) => {
    const local = (((v - c + size / 2) % size) + size) % size;
    return c - size / 2 + local;
  };
  for (let i = 0; i < COUNT; i++) {
    const sway = Math.sin(t * 1.3 + i) * 1.5;
    pos.setXYZ(
      i,
      wrap(base[i * 3] * BOX.x + wind.x * t + sway, BOX.x, center.x),
      wrap(base[i * 3 + 1] * BOX.y + wind.y * t, BOX.y, center.y),
      wrap(base[i * 3 + 2] * BOX.z + wind.z * t, BOX.z, center.z)
    );
  }
  pos.needsUpdate = true;

  return (
    <points
      geometry={geo}
      frustumCulled={false}
    >
      <pointsMaterial
        map={sprite}
        size={0.32}
        transparent
        opacity={opacity}
        depthWrite={false}
        color="#ffffff"
      />
    </points>
  );
};

/** The drone: follows the line, dives and banks with it, then rises and orbits the summit. */
const useDrone = (frame: number) => {
  const total = LINE.total;
  // Distance flown along the line: a slow start in the storm, full speed, then braking.
  const s = interpolate(frame, [0, 45, 120, 260, 330, 380], [0, 18, 160, total - 150, total - 40, total - 22], {
    easing: easeInOut,
    extrapolateRight: 'clamp',
  });
  const target = LINE.at(s + 26);
  const here = LINE.at(s);
  const ahead = LINE.at(s + 8);
  const dir = ahead.clone().sub(here).setY(0).normalize();
  const side = new THREE.Vector3(-dir.z, 0, dir.x);
  // Height above the crest and side offset: low and close, with dives over the saddle.
  const lift = interpolate(frame, [0, 45, 150, 200, 240, 300, 350], [3.2, 4.5, 7, 2.6, 9, 6, 22], {
    extrapolateRight: 'clamp',
  });
  const swing = 7 * Math.sin(frame * 0.035) + interpolate(frame, [0, 60], [2, 0], { extrapolateRight: 'clamp' });
  const follow = here.clone().addScaledVector(dir, -9).addScaledVector(side, swing);
  follow.y = Math.max(follow.y, height(follow.x, follow.z) + 2) + lift;

  // Summit orbit around the pink toque.
  const summit = LINE.at(total - 2);
  const angle = interpolate(frame, [350, 450], [-0.4, 1.5]);
  const radius = interpolate(frame, [350, 450], [30, 21]);
  const orbit = new THREE.Vector3(summit.x + Math.sin(angle) * radius, summit.y + interpolate(frame, [350, 450], [12, 4]), summit.z + Math.cos(angle) * radius);
  const blend = tween(frame, 335, 50, 0, 1, easeInOut);
  const position = follow.lerp(orbit, blend);
  // At the end the drone aims below the toque, so it sits in the top half and the copy has the bottom.
  const aim = summit.clone().setY(summit.y + TOQUE_H * 0.8 - 4.2 * tween(frame, 370, 40, 0, 1, easeInOut));
  const look = target.clone().lerp(aim, tween(frame, 300, 70, 0, 1, easeInOut));
  // Bank with the line's curve, plus a little deterministic hand-held shake.
  const bend = LINE.at(s + 30).clone().sub(ahead).setY(0).normalize();
  const roll = (1 - blend) * THREE.MathUtils.clamp((dir.x * bend.z - dir.z * bend.x) * 2.4, -0.35, 0.35);
  const shake = new THREE.Vector3(Math.sin(frame * 1.7) * 0.06, Math.sin(frame * 2.3 + 1) * 0.05, 0);
  return { position: position.add(shake), look, roll };
};

const Rig: React.FC = () => {
  const frame = useCurrentFrame();
  const { camera, scene } = useThree();
  const drone = useDrone(frame);
  camera.position.copy(drone.position);
  camera.up.set(Math.sin(drone.roll), Math.cos(drone.roll), 0);
  camera.lookAt(drone.look);
  // Storm to clear sky: the fog thins as the line climbs.
  const density = interpolate(frame, [0, 40, 120, 330, 400], [0.05, 0.02, 0.009, 0.005, 0.003], { extrapolateRight: 'clamp' });
  const fogColor = new THREE.Color('#aebdca').lerp(new THREE.Color('#d6e0e8'), tween(frame, 260, 120, 0, 1));
  scene.fog = new THREE.FogExp2(fogColor, density);
  scene.background = fogColor;
  // A soft light that rides with the drone, so the summit toque keeps its colour on every side.
  const fill = tween(frame, 330, 40, 0, 1.6);
  return (
    <>
      <pointLight
        position={drone.position.clone().add(new THREE.Vector3(-6, 10, 0))}
        intensity={fill}
        decay={0}
        color="#fff1e6"
      />
      <SnowField
        center={drone.position}
        opacity={interpolate(frame, [0, 300, 380], [0.95, 0.8, 0.25], { extrapolateRight: 'clamp' })}
      />
    </>
  );
};

const World: React.FC = () => {
  const frame = useCurrentFrame();
  const sun = tween(frame, 280, 120, 0.6, 2.4);
  return (
    <>
      <hemisphereLight args={['#d7e4ef', '#2a3846', 0.9]} />
      {/* Key light low from behind the camera's left: it lights the faces the drone sees. */}
      <directionalLight
        position={[-260, 140, 260]}
        intensity={1.4 + sun}
        color="#ffe6cc"
      />
      {/* Rim from the summit side, cold. */}
      <directionalLight
        position={[160, 120, -900]}
        intensity={0.7}
        color="#c8d6e4"
      />
      <Terrain />
      <Toques />
      <Rig />
    </>
  );
};

/**
 * "The line": a single file of giant Bird toques, all 24 colours, standing along a knife-edge
 * arête in a storm. An FPV drone chases it, the storm clears as it climbs, and the last toque,
 * Powder Pink, waits alone on the summit.
 */
export const Trail: React.FC = () => {
  const frame = useCurrentFrame();
  const card = tween(frame, 385, 30, 0, 1);

  return (
    <AbsoluteFill style={{ backgroundColor: C.night }}>
      <ThreeCanvas
        width={W}
        height={H}
        camera={{ fov: 62, near: 0.3, far: 1600, position: [0, 80, 20] }}
        gl={{ antialias: true }}
        onCreated={({ gl }) => {
          // Neutral tone mapping keeps the knit colours true; ACES would grey them.
          gl.toneMapping = THREE.NeutralToneMapping;
        }}
      >
        <World />
      </ThreeCanvas>

      {/* Vignette and a little night at the edges, as on the site's scenes. */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(120% 80% at 50% 45%, rgb(11 16 21 / 0) 55%, rgb(11 16 21 / 0.55) 100%), linear-gradient(to bottom, rgb(11 16 21 / 0.35), rgb(11 16 21 / 0) 18%)',
        }}
      />

      {/* Opening title over the storm. */}
      <div
        style={{
          position: 'absolute',
          left: SAFE.left,
          right: SAFE.right,
          top: SAFE.top + 20,
          color: C.frost,
          opacity: 1 - tween(frame, 50, 14, 0, 1),
          textShadow: '0 2px 30px rgb(11 16 21 / 0.45)',
        }}
      >
        <h1 style={{ ...displayStyle, fontSize: 150, lineHeight: 0.9 }}>
          <MaskLine start={4}>Winter</MaskLine>
          <MaskLine start={8}>essentials</MaskLine>
        </h1>
      </div>

      {/* End card: night rises from the bottom, the toque's line, then ARK and the link. */}
      <AbsoluteFill style={{ background: `linear-gradient(to top, rgb(11 16 21 / ${0.92 * card}) 0%, rgb(11 16 21 / ${0.7 * card}) 34%, rgb(11 16 21 / 0) 58%)` }} />
      <div style={{ position: 'absolute', left: SAFE.left, right: SAFE.right, top: 1040, color: C.frost }}>
        <Reveal
          start={392}
          distance={24}
          duration={18}
        >
          <p style={{ fontFamily: body, fontWeight: 500, fontSize: 40, margin: 0 }}>Arc&apos;teryx Bird Toque</p>
          <p style={{ ...displayStyle, fontSize: 132, lineHeight: 0.9, marginTop: 10 }}>24 colours.</p>
          <p style={{ fontFamily: body, fontWeight: 600, fontSize: 46, margin: '18px 0 0', fontVariantNumeric: 'tabular-nums' }}>$39.99 CAD</p>
        </Reveal>
        <Reveal
          start={404}
          distance={16}
          duration={16}
          style={{ marginTop: 34, display: 'flex', alignItems: 'center', gap: 28 }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 16,
              padding: '28px 40px',
              background: C.frost,
              color: C.night,
              fontFamily: body,
              fontWeight: 600,
              fontSize: 42,
              lineHeight: 1,
            }}
          >
            Shop the colours · link in bio
          </span>
        </Reveal>
      </div>
      <div style={{ position: 'absolute', left: SAFE.left, top: SAFE.top + 10, opacity: tween(frame, 396, 20, 0, 1) }}>
        <span style={{ ...displayStyle, fontSize: 150, color: C.frost, letterSpacing: '-0.02em', textShadow: '0 2px 30px rgb(11 16 21 / 0.35)' }}>ARK</span>
      </div>
      <Grain opacity={0.07} />
      {/* Temporary score, 120 BPM: risers into the take-off (1.5 s), the dives, the summit and the card. */}
      <Audio src={staticFile('audio/temp-line.wav')} />
    </AbsoluteFill>
  );
};
