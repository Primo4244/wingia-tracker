import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, interpolate, staticFile, useCurrentFrame } from 'remotion';
import * as THREE from 'three';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { Grain } from '../components/Atmosphere';
import { displayStyle, MaskLine, Reveal } from '../components/Type';
import { rng } from '../lib/noise';
import { tween } from '../lib/motion';
import { body, C, easeInOut, H, SAFE, W } from '../theme';
import { useWorldData, WorldData } from './assets';
import { LINE_ORDER, PINK, TOQUE_VARIANTS } from './toques';

export const TRAIL_FRAMES = 450;

const SPACING = 4.6;
const TOQUE_H = 3.2;
const slug = (name: string) => name.toLowerCase().replace(/ \/ /g, '-').replace(/ /g, '-');

/**
 * Loads textures before the frame renders. ThreeCanvas only draws when the frame changes, so
 * once they are in, the scene is drawn again before the frame is released.
 */
const useTextures = (urls: string[], setup: (t: THREE.Texture, i: number) => void = () => {}) => {
  const [textures, setTextures] = useState<THREE.Texture[] | null>(null);
  const [handle] = useState(() => delayRender('Loading textures'));
  const advance = useThree((s) => s.advance);
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    Promise.all(urls.map((u) => loader.loadAsync(u)))
      .then((ts) => {
        ts.forEach(setup);
        setTextures(ts);
      })
      .catch((e) => {
        console.error(e);
        continueRender(handle);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!textures) return;
    requestAnimationFrame(() => {
      advance(performance.now());
      continueRender(handle);
    });
  }, [textures, advance, handle]);
  return textures;
};

/** Arc-length lookup on the baked crest line (one point per metre). */
const makeLine = (pts: [number, number, number][]) => {
  const v = pts.map(([x, y, z]) => new THREE.Vector3(x, y, z));
  const at = (s: number) => {
    const c = Math.min(Math.max(s, 0), v.length - 1.001);
    const i = Math.floor(c);
    return v[i].clone().lerp(v[i + 1], c - i);
  };
  return { at, length: v.length - 1 };
};

type Line = ReturnType<typeof makeLine>;

const Terrain: React.FC<{ data: WorldData }> = ({ data }) => {
  const tex = useTextures([staticFile('world/albedo.jpg'), staticFile('world/normal.png'), staticFile('world/snow-detail.png')], (t, i) => {
    if (i === 0) t.colorSpace = THREE.SRGBColorSpace;
    if (i === 2) t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 8;
  });
  // Close-range snow: wind ripples and grain tiled in world space, faded out with distance, so
  // the crest under the drone is not a smooth surface.
  const onBeforeCompile = useMemo(
    () => (shader: THREE.WebGLProgramParametersWithUniforms) => {
      if (!tex) return;
      shader.uniforms.detailMap = { value: tex[2] };
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vWorldD;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvWorldD = (modelMatrix * vec4(transformed, 1.0)).xyz;');
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nuniform sampler2D detailMap;\nvarying vec3 vWorldD;')
        .replace(
          '#include <map_fragment>',
          `#include <map_fragment>
          vec4 dA = texture2D(detailMap, vWorldD.xz * 0.3);
          vec4 dB = texture2D(detailMap, vWorldD.xz * 0.055 + 0.37);
          float dFade = 1.0 - smoothstep(25.0, 160.0, length(vWorldD - cameraPosition));
          diffuseColor.rgb *= mix(1.0, 0.86 + 0.28 * (dA.a * 0.6 + dB.a * 0.4), dFade);`
        )
        .replace(
          '#include <normal_fragment_maps>',
          `#include <normal_fragment_maps>
          vec3 dN = (dA.xyz * 2.0 - 1.0) * 0.55 + (dB.xyz * 2.0 - 1.0) * 0.45;
          normal = normalize(normal + (viewMatrix * vec4(dN.x, 0.0, dN.y, 0.0)).xyz * 1.1 * dFade);`
        );
    },
    [tex]
  );
  const geo = useMemo(() => {
    const { size, n, x0, zFar } = data.meta;
    const g = new THREE.PlaneGeometry(size, size, n, n);
    g.rotateX(-Math.PI / 2);
    // Row 0 of the plane is its far edge after the rotation, as in height.bin.
    g.translate(x0 + size / 2, 0, zFar + size / 2);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) pos.setY(i, data.height[i]);
    g.computeVertexNormals();
    return g;
  }, [data]);
  if (!tex) return null;
  return (
    <mesh
      geometry={geo}
      receiveShadow
      castShadow
    >
      <meshStandardMaterial
        map={tex[0]}
        normalMap={tex[1]}
        normalScale={new THREE.Vector2(1.4, 1.4)}
        roughness={0.88}
        metalness={0}
        onBeforeCompile={onBeforeCompile}
      />
    </mesh>
  );
};

/** Distant ranges all around: lower detail, mostly lost in the haze, snow on their gentle faces. */
const FarRanges: React.FC<{ data: WorldData }> = ({ data }) => {
  const geo = useMemo(() => {
    const { farSize, fn, farZ0 } = data.meta;
    const g = new THREE.PlaneGeometry(farSize, farSize, fn, fn);
    g.rotateX(-Math.PI / 2);
    g.translate(0, 0, farZ0 + farSize / 2);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) pos.setY(i, data.far[i]);
    g.computeVertexNormals();
    const nrm = g.attributes.normal;
    const col = new Float32Array(pos.count * 3);
    const snow = new THREE.Color('#e8eef3');
    const rock = new THREE.Color('#3a424c');
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      c.copy(rock).lerp(snow, THREE.MathUtils.smoothstep(nrm.getY(i), 0.6, 0.8));
      col.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return g;
  }, [data]);
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial
        vertexColors
        roughness={0.95}
      />
    </mesh>
  );
};

/** The lathe of a fitted beanie, bottom to top so its faces point outward. */
const toqueGeometry = () => {
  const profile = [
    [0.5, 0.0], [0.505, 0.12], [0.5, 0.3], [0.485, 0.48], [0.45, 0.64], [0.385, 0.79], [0.29, 0.9], [0.17, 0.97], [0.0, 1.0],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  return new THREE.LatheGeometry(profile, 64);
};

const knitBump = () => {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 16;
  const g = c.getContext('2d')!;
  for (let x = 0; x < 1024; x++) {
    const v = 128 + 120 * Math.sin((x / 1024) * Math.PI * 2 * 90);
    g.fillStyle = `rgb(${v},${v},${v})`;
    g.fillRect(x, 0, 1, 16);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
};

/** 24 instanced meshes, one per colourway, each wrapped in its own packshot. */
const Toques: React.FC<{ data: WorldData; line: Line }> = ({ data, line }) => {
  const urls = TOQUE_VARIANTS.map((v) => staticFile(`toques/${data.toques[slug(v.name)]}`));
  const tex = useTextures(urls, (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = THREE.RepeatWrapping;
    t.anisotropy = 8;
  });
  const geo = useMemo(toqueGeometry, []);
  const bump = useMemo(knitBump, []);
  const places = useMemo(() => {
    const list: { s: number; variant: number }[] = [];
    const last = line.length - 30;
    for (let s = 8, i = 0; s < last; s += SPACING, i++) list.push({ s, variant: LINE_ORDER[i % LINE_ORDER.length] });
    list.push({ s: line.length - 1.5, variant: PINK });
    return list;
  }, [line]);
  const refs = useRef<(THREE.InstancedMesh | null)[]>([]);

  useLayoutEffect(() => {
    if (!tex) return;
    const r = rng(17);
    const counts = new Array(TOQUE_VARIANTS.length).fill(0);
    const m = new THREE.Matrix4();
    places.forEach(({ s, variant }, i) => {
      const p = line.at(s);
      const a = line.at(s + 1);
      const yaw = Math.atan2(a.x - p.x, a.z - p.z) + Math.PI / 2 + (r() - 0.5) * 0.25;
      const hero = i === places.length - 1;
      const sc = TOQUE_H * (hero ? 1.6 : 1) * (0.97 + r() * 0.06);
      m.compose(
        new THREE.Vector3(p.x, p.y - 0.3, p.z),
        new THREE.Quaternion().setFromEuler(new THREE.Euler((r() - 0.5) * 0.06, yaw, (r() - 0.5) * 0.06)),
        new THREE.Vector3(sc * 1.05, sc, sc * 1.05)
      );
      refs.current[variant]?.setMatrixAt(counts[variant]++, m);
    });
    refs.current.forEach((mesh, v) => {
      if (!mesh) return;
      mesh.count = counts[v];
      mesh.instanceMatrix.needsUpdate = true;
    });
  }, [tex, places, line]);

  if (!tex) return null;
  return (
    <group>
      {TOQUE_VARIANTS.map((v, i) => (
        <instancedMesh
          key={v.name}
          ref={(el) => {
            refs.current[i] = el;
          }}
          args={[geo, undefined, places.length]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            map={tex[i]}
            bumpMap={bump}
            bumpScale={1.2}
            roughness={1}
          />
        </instancedMesh>
      ))}
    </group>
  );
};

/** Soft cloud texture: layered radial puffs, for mist banks and the sea of clouds. */
const cloudTexture = (seed: number) => {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const g = c.getContext('2d')!;
  const r = rng(seed);
  for (let i = 0; i < 70; i++) {
    const x = 80 + r() * 352;
    const y = 120 + r() * 272;
    const rad = 40 + r() * 120;
    const grad = g.createRadialGradient(x, y, 0, x, y, rad);
    grad.addColorStop(0, `rgba(255,255,255,${0.16 + r() * 0.14})`);
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 512, 512);
  }
  return new THREE.CanvasTexture(c);
};

/** Mist banks across the line that the drone flies through, and a sea of clouds below the arête. */
const Clouds: React.FC<{ line: Line }> = ({ line }) => {
  const frame = useCurrentFrame();
  const tex = useMemo(() => [cloudTexture(1), cloudTexture(2), cloudTexture(3)], []);
  const banks = useMemo(() => {
    const r = rng(41);
    const out: { p: THREE.Vector3; size: number; t: number; o: number }[] = [];
    for (let s = 30; s < line.length - 120; s += 26 + r() * 30) {
      const p = line.at(s);
      for (let k = 0; k < 3; k++)
        out.push({ p: p.clone().add(new THREE.Vector3((r() - 0.5) * 80, (r() - 0.3) * 30, (r() - 0.5) * 30)), size: 40 + r() * 70, t: k, o: 0.5 + r() * 0.5 });
    }
    return out;
  }, [line]);
  const sea = useMemo(() => {
    const r = rng(43);
    return Array.from({ length: 90 }, () => ({
      x: (r() - 0.5) * 2400,
      z: 300 - r() * 2200,
      y: 860 + r() * 90,
      size: 260 + r() * 380,
      t: Math.floor(r() * 3),
      rot: r() * Math.PI,
    }));
  }, []);
  // Mist thins as the storm clears near the summit.
  const mist = interpolate(frame, [0, 250, 330], [1, 0.75, 0.15], { extrapolateRight: 'clamp' });
  return (
    <group>
      {banks.map((b, i) => (
        <sprite
          key={i}
          position={b.p}
          scale={[b.size, b.size * 0.6, 1]}
        >
          <spriteMaterial
            map={tex[b.t]}
            transparent
            depthWrite={false}
            opacity={b.o * mist}
            color="#eef2f6"
          />
        </sprite>
      ))}
      {sea.map((c, i) => (
        <mesh
          key={`s${i}`}
          position={[c.x + frame * 0.6, c.y, c.z]}
          rotation={[-Math.PI / 2, 0, c.rot]}
        >
          <planeGeometry args={[c.size, c.size]} />
          <meshBasicMaterial
            map={tex[c.t]}
            transparent
            depthWrite={false}
            opacity={0.85}
            color="#f4f1ee"
          />
        </mesh>
      ))}
    </group>
  );
};

/** Blowing snow around the camera: a pure function of the frame. */
const SnowField: React.FC<{ center: THREE.Vector3; opacity: number }> = ({ center, opacity }) => {
  const frame = useCurrentFrame();
  const COUNT = 6000;
  const BOX = new THREE.Vector3(70, 40, 70);
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
  const wrap = (v: number, size: number, c: number) => c - size / 2 + ((((v - c + size / 2) % size) + size) % size);
  for (let i = 0; i < COUNT; i++) {
    pos.setXYZ(
      i,
      wrap(base[i * 3] * BOX.x + 22 * t + Math.sin(t * 1.3 + i) * 1.2, BOX.x, center.x),
      wrap(base[i * 3 + 1] * BOX.y - 7 * t, BOX.y, center.y),
      wrap(base[i * 3 + 2] * BOX.z + 10 * t, BOX.z, center.z)
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
        size={0.22}
        transparent
        opacity={opacity}
        depthWrite={false}
      />
    </points>
  );
};

/** The drone's flight: storm start, chase, a swing out over the void, the climb, the summit orbit. */
const drone = (frame: number, line: Line) => {
  const L = line.length;
  const s = interpolate(frame, [0, 40, 110, 250, 320, 370], [0, 14, 150, L - 330, L - 70, L - 30], { easing: easeInOut, extrapolateRight: 'clamp' });
  const here = line.at(s);
  const ahead = line.at(s + 10);
  const dir = ahead.clone().sub(here).setY(0).normalize();
  const side = new THREE.Vector3(-dir.z, 0, dir.x);
  // Out over the void and down the wall, then back to the line: the scale of the drop.
  const out = Math.sin(Math.PI * tween(frame, 150, 80, 0, 1, easeInOut));
  const lift = interpolate(frame, [0, 40, 120, 150, 330, 360], [2.4, 3.6, 5.5, 5, 8, 18], { extrapolateRight: 'clamp' }) - 26 * out;
  const swing = 5 * Math.sin(frame * 0.04) + 46 * out;
  const pos = here.clone().addScaledVector(dir, -8).addScaledVector(side, swing);
  pos.y = here.y + lift;
  let look = line.at(s + 24 + 30 * out);
  look.y += 1.2;

  // Summit orbit around the pink toque.
  const summit = line.at(L - 1.5);
  const ang = interpolate(frame, [340, 450], [-0.5, 1.4]);
  const rad = interpolate(frame, [340, 450], [34, 19]);
  const orbit = new THREE.Vector3(summit.x + Math.sin(ang) * rad, summit.y + interpolate(frame, [340, 450], [13, 3.5]), summit.z + Math.cos(ang) * rad);
  const blend = tween(frame, 330, 55, 0, 1, easeInOut);
  const aim = summit.clone().setY(summit.y + TOQUE_H * 1.6 * 0.5 - 3.8 * tween(frame, 380, 40, 0, 1, easeInOut));
  look = look.lerp(aim, tween(frame, 300, 80, 0, 1, easeInOut));
  const bend = line.at(s + 40).sub(ahead).setY(0).normalize();
  const roll = (1 - blend) * THREE.MathUtils.clamp((dir.x * bend.z - dir.z * bend.x) * 2.6, -0.4, 0.4) - 0.25 * out;
  const shake = new THREE.Vector3(Math.sin(frame * 1.7) * 0.05, Math.sin(frame * 2.3 + 1) * 0.04, 0);
  return { position: pos.lerp(orbit, blend).add(shake), look, roll };
};

const SUN_ELEVATION = 14;
const SUN_AZIMUTH = 150;

const Scene: React.FC<{ data: WorldData }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { camera, scene, gl } = useThree();
  const line = useMemo(() => makeLine(data.line), [data]);
  const sky = useMemo(() => {
    const s = new Sky();
    s.scale.setScalar(40000);
    const u = s.material.uniforms;
    u.turbidity.value = 5;
    u.rayleigh.value = 1.6;
    u.mieCoefficient.value = 0.006;
    u.mieDirectionalG.value = 0.86;
    return s;
  }, []);
  const sunDir = useMemo(
    () => new THREE.Vector3().setFromSphericalCoords(1, THREE.MathUtils.degToRad(90 - SUN_ELEVATION), THREE.MathUtils.degToRad(SUN_AZIMUTH)),
    []
  );
  const target = useMemo(() => new THREE.Object3D(), []);
  useEffect(() => {
    sky.material.uniforms.sunPosition.value.copy(sunDir);
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
  }, [sky, sunDir, gl]);

  const d = drone(frame, line);
  camera.position.copy(d.position);
  camera.up.set(Math.sin(d.roll), Math.cos(d.roll), 0);
  camera.lookAt(d.look);
  (camera as THREE.PerspectiveCamera).far = 30000;
  (camera as THREE.PerspectiveCamera).updateProjectionMatrix();

  // The storm: dense fog first, clearing as the line climbs; its colour moves to the warm horizon.
  const storm = interpolate(frame, [0, 40, 120, 260, 340], [1, 0.5, 0.2, 0.08, 0.03], { extrapolateRight: 'clamp' });
  const fogColor = new THREE.Color('#c3ccd6').lerp(new THREE.Color('#d9d4cf'), 1 - storm);
  scene.fog = new THREE.FogExp2(fogColor, 0.00012 + storm * 0.012);
  sky.material.uniforms.rayleigh.value = 1.6 - storm * 1.2;

  // The sun's shadow box follows what the camera looks at, so shadows stay sharp there.
  target.position.copy(d.look);
  target.updateMatrixWorld();
  const sunPos = d.look.clone().addScaledVector(sunDir, 400);

  return (
    <>
      <primitive object={sky} />
      <primitive object={target} />
      <hemisphereLight args={['#c9dbec', '#4a5562', 1.1 + storm * 0.4]} />
      <directionalLight
        position={sunPos}
        target={target}
        intensity={4.2 * (1 - storm * 0.6)}
        color="#ffd9b0"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-70}
        shadow-camera-right={70}
        shadow-camera-top={70}
        shadow-camera-bottom={-70}
        shadow-camera-near={10}
        shadow-camera-far={900}
        shadow-bias={-0.0004}
        shadow-normalBias={0.6}
      />
      {/* A soft light riding with the drone at the summit, so the pink keeps its colour on every side. */}
      <pointLight
        position={d.position.clone().add(new THREE.Vector3(-4, 8, 0))}
        intensity={tween(frame, 320, 40, 0, 2.2)}
        decay={0}
        color="#fff1e6"
      />
      <Terrain data={data} />
      <FarRanges data={data} />
      <Toques
        data={data}
        line={line}
      />
      <Clouds line={line} />
      <SnowField
        center={d.position}
        opacity={0.35 + storm * 0.6}
      />
    </>
  );
};

const World: React.FC = () => {
  const data = useWorldData();
  const advance = useThree((s) => s.advance);
  const [handle] = useState(() => delayRender('Drawing the world'));
  useEffect(() => {
    if (!data) return;
    requestAnimationFrame(() => {
      advance(performance.now());
      continueRender(handle);
    });
  }, [data, advance, handle]);
  return data ? <Scene data={data} /> : null;
};

/**
 * "The line": a single file of giant Bird toques in the store's 24 colourways along a knife-edge
 * arête, chased by an FPV drone through a storm that clears at the summit, where the Powder Pink
 * toque waits alone. Real-scale terrain baked in scripts/make-world.py; packshots wrapped on
 * each toque (scripts/unwrap-toques.py).
 */
export const Trail: React.FC = () => {
  const frame = useCurrentFrame();
  const card = tween(frame, 385, 30, 0, 1);

  return (
    <AbsoluteFill style={{ backgroundColor: C.night }}>
      <ThreeCanvas
        width={W}
        height={H}
        camera={{ fov: 70, near: 0.3, far: 30000 }}
        gl={{ antialias: true }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.0;
        }}
      >
        <World />
      </ThreeCanvas>

      <AbsoluteFill
        style={{
          background:
            'radial-gradient(120% 80% at 50% 45%, rgb(11 16 21 / 0) 55%, rgb(11 16 21 / 0.5) 100%), linear-gradient(to bottom, rgb(11 16 21 / 0.3), rgb(11 16 21 / 0) 16%)',
        }}
      />

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
          style={{ marginTop: 34 }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
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
      <Grain opacity={0.06} />
    </AbsoluteFill>
  );
};
