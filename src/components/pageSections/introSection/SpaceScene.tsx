/* eslint-disable react/no-unknown-property -- react-three-fiber JSX intrinsics */
import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

/* ── deterministic PRNG (pure — safe during render) ────────────────────────── */

function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ── procedural textures (no external assets) ──────────────────────────────── */

function makeGlowTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.25, 'rgba(255,255,255,0.75)');
  g.addColorStop(0.55, 'rgba(255,255,255,0.18)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

function makePlanetTexture(base: string, band: string): THREE.CanvasTexture {
  const w = 256;
  const h = 128;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);
  // soft horizontal bands like a gas giant
  for (let y = 0; y < h; y += 1) {
    const n = Math.sin(y * 0.18) * 0.5 + Math.sin(y * 0.55 + 1.3) * 0.3;
    ctx.globalAlpha = 0.08 + Math.abs(n) * 0.12;
    ctx.fillStyle = band;
    ctx.fillRect(0, y, w, 1);
  }
  ctx.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ── spiral galaxy (particle disk) ─────────────────────────────────────────── */

interface GalaxyProps {
  count?: number;
  radius?: number;
  arms?: number;
  spin?: number;
  inner: string;
  outer: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  speed: number;
  seed: number;
  sprite: THREE.Texture;
}

function Galaxy({
  count = 9000,
  radius = 5,
  arms = 3,
  spin = 0.85,
  inner,
  outer,
  position,
  rotation,
  scale,
  speed,
  seed,
  sprite,
}: GalaxyProps) {
  const ref = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const rng = makeRng(seed);
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const cInner = new THREE.Color(inner);
    const cOuter = new THREE.Color(outer);
    for (let i = 0; i < count; i++) {
      const r = Math.pow(rng(), 0.7) * radius;
      const branch = ((i % arms) / arms) * Math.PI * 2;
      const angle = branch + r * spin + (rng() - 0.5) * 0.35;
      const spread = (Math.pow(rng(), 3) - 0.5) * (0.45 + r * 0.14);
      const bulge = r < 1.1 ? 1.5 : 0.35;
      const yScatter = (Math.pow(rng(), 3) - 0.5) * 0.5 * bulge;

      pos[i * 3] = Math.cos(angle) * r + spread;
      pos[i * 3 + 1] = yScatter;
      pos[i * 3 + 2] = Math.sin(angle) * r + spread;

      const mix = cInner.clone().lerp(cOuter, Math.min(r / radius, 1));
      col[i * 3] = mix.r;
      col[i * 3 + 1] = mix.g;
      col[i * 3 + 2] = mix.b;
    }
    return [pos, col];
  }, [count, radius, arms, spin, inner, outer, seed]);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * speed;
  });

  return (
    <points ref={ref} position={position} rotation={rotation} scale={scale}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        sizeAttenuation
        map={sprite}
        vertexColors
        transparent
        opacity={0.95}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ── nebula cloud (additive sprite) ────────────────────────────────────────── */

function Nebula({
  position,
  scale,
  color,
  sprite,
  opacity = 0.22,
}: {
  position: [number, number, number];
  scale: number;
  color: string;
  sprite: THREE.Texture;
  opacity?: number;
}) {
  return (
    <sprite position={position} scale={[scale, scale * 0.7, 1]}>
      <spriteMaterial
        map={sprite}
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </sprite>
  );
}

/* ── planet ────────────────────────────────────────────────────────────────── */

function Planet({
  position,
  scale,
  texture,
}: {
  position: [number, number, number];
  scale: number;
  texture: THREE.Texture;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.09;
  });
  return (
    <mesh ref={ref} position={position} scale={scale}>
      <sphereGeometry args={[1, 48, 48]} />
      <meshStandardMaterial map={texture} roughness={0.95} metalness={0} />
    </mesh>
  );
}

/* ── camera parallax rig ───────────────────────────────────────────────────── */

function Rig({
  pointer,
  reduced,
}: {
  pointer: React.RefObject<{ x: number; y: number }>;
  reduced: boolean;
}) {
  useFrame(state => {
    if (reduced || !pointer.current) return;
    const targetX = pointer.current.x * 1.6;
    const targetY = pointer.current.y * 1.0;
    state.camera.position.x += (targetX - state.camera.position.x) * 0.035;
    state.camera.position.y += (targetY - state.camera.position.y) * 0.035;
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

/* ── whole scene ───────────────────────────────────────────────────────────── */

function Scene({
  pointer,
  reduced,
}: {
  pointer: React.RefObject<{ x: number; y: number }>;
  reduced: boolean;
}) {
  const glow = useMemo(() => makeGlowTexture(), []);
  const iceGiant = useMemo(() => makePlanetTexture('#4a5d80', '#8fa8cf'), []);
  const rockGiant = useMemo(() => makePlanetTexture('#2f3a52', '#5f7196'), []);
  const drift = reduced ? 0 : 1;

  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight position={[6, 4, 6]} intensity={1.4} color="#dfe8ff" />

      <Stars
        radius={80}
        depth={60}
        count={5200}
        factor={3.5}
        saturation={0}
        fade
        speed={reduced ? 0 : 0.9}
      />

      {/* nebulae — deep background */}
      <Nebula position={[-8, 2, -22]} scale={26} color="#3f6ad8" sprite={glow} opacity={0.16} />
      <Nebula position={[10, -3, -24]} scale={30} color="#2f56b8" sprite={glow} opacity={0.14} />
      <Nebula position={[2, 5, -20]} scale={16} color="#b0468f" sprite={glow} opacity={0.1} />
      <Nebula position={[-4, -5, -18]} scale={14} color="#9a3f9a" sprite={glow} opacity={0.08} />

      {/* spiral galaxies */}
      <Galaxy
        sprite={glow}
        seed={1337}
        inner="#f4f6ff"
        outer="#3f6fc0"
        position={[7.5, 2.5, -8]}
        rotation={[1.1, 0.3, -0.5]}
        scale={1.15}
        speed={0.06 * drift}
        arms={4}
      />
      <Galaxy
        sprite={glow}
        seed={7331}
        inner="#eef3ff"
        outer="#4a78c8"
        position={[-9, -1.5, -12]}
        rotation={[1.35, -0.2, 0.7]}
        scale={0.9}
        speed={0.045 * drift}
        arms={3}
      />
      <Galaxy
        sprite={glow}
        seed={4242}
        inner="#ffffff"
        outer="#5b83cf"
        position={[0.5, 4, -16]}
        rotation={[1.25, 0.1, -1.2]}
        scale={0.6}
        speed={0.036 * drift}
        arms={5}
      />

      {/* planets */}
      <Planet texture={iceGiant} position={[-8.5, 4.2, -4]} scale={1.3} />
      <Planet texture={rockGiant} position={[4.5, -4.5, -3]} scale={0.9} />

      <Rig pointer={pointer} reduced={reduced} />
    </>
  );
}

export function SpaceScene({ reduced }: { reduced: boolean }) {
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (reduced) return;
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [reduced]);

  return (
    <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: -2, pointerEvents: 'none' }}>
      <Canvas
        camera={{ position: [0, 0, 12], fov: 60 }}
        dpr={[1, 1.6]}
        gl={{ antialias: true, alpha: true }}
        frameloop={reduced ? 'demand' : 'always'}
      >
        <Scene pointer={pointer} reduced={reduced} />
      </Canvas>
    </div>
  );
}
