/* eslint-disable react/no-unknown-property -- react-three-fiber JSX intrinsics */
import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

/* ── helpers ───────────────────────────────────────────────────────────────── */

function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeGlowTexture(): THREE.CanvasTexture {
  const size = 128;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.28, 'rgba(180,220,255,0.8)');
  g.addColorStop(0.6, 'rgba(90,180,255,0.22)');
  g.addColorStop(1, 'rgba(90,180,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}

/* ── spiral galaxy backdrop ────────────────────────────────────────────────── */

const GAL_COUNT = 8000;

function Galaxy({ glow }: { glow: THREE.Texture }) {
  const ref = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const rng = makeRng(24680);
    const pos = new Float32Array(GAL_COUNT * 3);
    const col = new Float32Array(GAL_COUNT * 3);
    const inner = new THREE.Color('#eaf2ff');
    const outer = new THREE.Color('#4a78d0');
    const radius = 7;
    for (let i = 0; i < GAL_COUNT; i++) {
      const r = Math.pow(rng(), 0.6) * radius;
      const branch = ((i % 3) / 3) * Math.PI * 2;
      const angle = branch + r * 0.75 + (rng() - 0.5) * 0.3;
      const spread = (Math.pow(rng(), 3) - 0.5) * (0.4 + r * 0.12);
      const bulge = r < 1.2 ? 1.6 : 0.3;
      pos[i * 3] = Math.cos(angle) * r + spread;
      pos[i * 3 + 1] = (Math.pow(rng(), 3) - 0.5) * 0.6 * bulge;
      pos[i * 3 + 2] = Math.sin(angle) * r + spread;
      const mix = inner.clone().lerp(outer, Math.min(r / radius, 1));
      col[i * 3] = mix.r;
      col[i * 3 + 1] = mix.g;
      col[i * 3 + 2] = mix.b;
    }
    return [pos, col];
  }, []);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.018;
  });

  return (
    <points ref={ref} position={[-4.5, 3.5, -36]} rotation={[1.15, 0.2, -0.5]} scale={1.3}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.075}
        map={glow}
        vertexColors
        transparent
        opacity={0.9}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ── streaming stars — gentle forward drift ────────────────────────────────── */

const STREAM_COUNT = 700;
const STREAM_FAR = -55;
const STREAM_NEAR = 10;

function StreamStars({ reduced }: { reduced: boolean }) {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const rng = makeRng(1122);
    const pos = new Float32Array(STREAM_COUNT * 3);
    for (let i = 0; i < STREAM_COUNT; i++) {
      pos[i * 3] = (rng() - 0.5) * 34;
      pos[i * 3 + 1] = (rng() - 0.5) * 22;
      pos[i * 3 + 2] = STREAM_FAR + rng() * (STREAM_NEAR - STREAM_FAR);
    }
    return pos;
  }, []);

  useFrame((_, delta) => {
    if (reduced || !ref.current) return;
    const arr = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < STREAM_COUNT; i++) {
      arr[i * 3 + 2] += delta * 2.2;
      if (arr[i * 3 + 2] > STREAM_NEAR) arr[i * 3 + 2] = STREAM_FAR;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        color="#cfe0ff"
        transparent
        opacity={0.8}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

/* ── planet ────────────────────────────────────────────────────────────────── */

function Planet() {
  return (
    <group position={[7, 2.5, -32]}>
      <mesh>
        <sphereGeometry args={[6, 48, 48]} />
        <meshStandardMaterial
          color="#4a1e36"
          roughness={1}
          metalness={0}
          emissive="#2e0d26"
          emissiveIntensity={0.25}
        />
      </mesh>
      <mesh scale={1.06}>
        <sphereGeometry args={[6, 48, 48]} />
        <meshBasicMaterial color="#a03a70" transparent opacity={0.1} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

/* ── capital ship — translucent, drifting in the background ─────────────────── */

function Ship({ reduced, glow }: { reduced: boolean; glow: THREE.Texture }) {
  const drift = useRef<THREE.Group>(null);
  const tilt = useRef<THREE.Group>(null);
  const engLight = useRef<THREE.PointLight>(null);
  const navRed = useRef<THREE.Mesh>(null);
  const navGreen = useRef<THREE.Mesh>(null);

  // shared translucent metal materials — holographic feel
  const hull = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#3f4756',
        metalness: 0.95,
        roughness: 0.42,
        transparent: true,
        opacity: 0.5,
      }),
    []
  );
  const dark = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#232935',
        metalness: 0.9,
        roughness: 0.55,
        transparent: true,
        opacity: 0.5,
      }),
    []
  );

  const greebles = useMemo(() => {
    const rng = makeRng(555);
    const out: { pos: [number, number, number]; size: [number, number, number]; dark: boolean }[] =
      [];
    for (let i = 0; i < 120; i++) {
      const side = rng() > 0.5 ? 1 : -1;
      const onTop = rng() > 0.45;
      const z = -1.8 + rng() * 3.6;
      const x = onTop ? (rng() - 0.5) * 0.7 : side * (0.36 + rng() * 0.06);
      const y = onTop ? 0.28 + rng() * 0.2 : (rng() - 0.5) * 0.28;
      const s = 0.04 + rng() * 0.12;
      out.push({
        pos: [x, y, z],
        size: [s * (0.6 + rng()), s * (0.6 + rng() * 1.8), s * (0.6 + rng() * 1.5)],
        dark: rng() > 0.5,
      });
    }
    return out;
  }, []);

  const windows = useMemo(() => {
    const rng = makeRng(777);
    const out: { pos: [number, number, number]; warm: boolean }[] = [];
    for (let i = 0; i < 70; i++) {
      const side = rng() > 0.5 ? 1 : -1;
      out.push({
        pos: [side * 0.41, -0.08 + rng() * 0.3, -1.6 + rng() * 3.2],
        warm: rng() > 0.4,
      });
    }
    return out;
  }, []);

  useFrame(state => {
    const t = state.clock.elapsedTime;
    if (drift.current && !reduced) {
      drift.current.position.x = Math.sin(t * 0.06) * 2.6;
      drift.current.position.z = -4 + Math.sin(t * 0.05) * 1.2;
    }
    if (tilt.current && !reduced) {
      tilt.current.rotation.z = 0.12 + Math.sin(t * 0.22) * 0.05;
      tilt.current.rotation.x = 0.14 + Math.sin(t * 0.18) * 0.03;
    }
    if (engLight.current) engLight.current.intensity = reduced ? 3 : 2.4 + Math.sin(t * 5) * 1.1;
    if (navRed.current) {
      (navRed.current.material as THREE.MeshBasicMaterial).opacity =
        Math.sin(t * 3.2) > 0.4 ? 1 : 0.05;
    }
    if (navGreen.current) {
      (navGreen.current.material as THREE.MeshBasicMaterial).opacity =
        Math.sin(t * 3.2 + Math.PI) > 0.4 ? 1 : 0.05;
    }
  });

  return (
    <group ref={drift} position={[0, 1.7, -4]}>
      <group ref={tilt} rotation={[0.14, 0.6, 0.12]} scale={0.62}>
        {/* main hull */}
        <mesh material={hull}>
          <boxGeometry args={[0.8, 0.5, 4.4]} />
        </mesh>
        {/* nose wedge */}
        <mesh material={hull} position={[0, 0, -2.5]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.001, 0.42, 0.9, 4]} />
        </mesh>
        {/* keel */}
        <mesh material={dark} position={[0, -0.32, 0.3]}>
          <boxGeometry args={[0.5, 0.28, 3]} />
        </mesh>
        {/* bridge stack */}
        <mesh material={hull} position={[0, 0.42, 0.7]}>
          <boxGeometry args={[0.5, 0.34, 1.4]} />
        </mesh>
        <mesh material={hull} position={[0, 0.66, 0.55]}>
          <boxGeometry args={[0.34, 0.22, 0.8]} />
        </mesh>
        <mesh material={hull} position={[0, 0.82, 0.5]}>
          <boxGeometry args={[0.18, 0.16, 0.4]} />
        </mesh>
        {/* sponsons */}
        <mesh material={dark} position={[-0.5, -0.05, 0.9]}>
          <boxGeometry args={[0.28, 0.24, 1.8]} />
        </mesh>
        <mesh material={dark} position={[0.5, -0.05, 0.9]}>
          <boxGeometry args={[0.28, 0.24, 1.8]} />
        </mesh>

        {/* greebles */}
        {greebles.map((b, i) => (
          <mesh key={i} material={b.dark ? dark : hull} position={b.pos}>
            <boxGeometry args={b.size} />
          </mesh>
        ))}

        {/* windows / running lights */}
        {windows.map((w, i) => (
          <mesh key={i} position={w.pos}>
            <boxGeometry args={[0.02, 0.03, 0.06]} />
            <meshBasicMaterial color={w.warm ? '#ffcf8a' : '#7fd0ff'} />
          </mesh>
        ))}

        {/* nav lights */}
        <mesh ref={navRed} position={[-0.66, 0.05, 0.9]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshBasicMaterial color="#ff4b57" transparent />
        </mesh>
        <mesh ref={navGreen} position={[0.66, 0.05, 0.9]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshBasicMaterial color="#4bff86" transparent />
        </mesh>

        {/* engine housing */}
        <mesh material={dark} position={[0, 0, 2.35]}>
          <boxGeometry args={[0.86, 0.56, 0.3]} />
        </mesh>

        {/* engines + glow + trails */}
        {[-0.24, 0, 0.24].map((x, i) => (
          <group key={i} position={[x, -0.02, 2.5]}>
            <mesh>
              <circleGeometry args={[0.1, 20]} />
              <meshBasicMaterial color="#bfeaff" />
            </mesh>
            <sprite position={[0, 0, 0.05]} scale={[0.7, 0.7, 1]}>
              <spriteMaterial
                map={glow}
                color="#5ab6ff"
                transparent
                opacity={0.85}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
              />
            </sprite>
            <sprite position={[0, 0, 1.5]} scale={[0.35, 3.2, 1]}>
              <spriteMaterial
                map={glow}
                color="#3f8fff"
                transparent
                opacity={0.32}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
              />
            </sprite>
          </group>
        ))}

        <pointLight
          ref={engLight}
          position={[0, 0, 2.9]}
          color="#5ab6ff"
          intensity={2.5}
          distance={8}
        />
      </group>
    </group>
  );
}

/* ── scene ─────────────────────────────────────────────────────────────────── */

function Scene({ reduced }: { reduced: boolean }) {
  const glow = useMemo(() => makeGlowTexture(), []);

  return (
    <>
      <color attach="background" args={['#04060c']} />
      <fog attach="fog" args={['#05070f', 12, 58]} />

      <ambientLight intensity={0.28} />
      <directionalLight position={[5, 6, 4]} intensity={1.5} color="#e4ecff" />
      <directionalLight position={[-6, 1, -4]} intensity={1} color="#9a6cff" />

      <Stars
        radius={80}
        depth={55}
        count={5000}
        factor={3.2}
        saturation={0}
        fade
        speed={reduced ? 0 : 0.45}
      />
      <StreamStars reduced={reduced} />
      <Galaxy glow={glow} />
      <Planet />
      <Ship reduced={reduced} glow={glow} />
    </>
  );
}

export function LoadingScene({ reduced }: { reduced: boolean }) {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Canvas
        camera={{ position: [0, 0.4, 8.6], fov: 44 }}
        dpr={[1, 1.6]}
        gl={{ antialias: true }}
        frameloop={reduced ? 'demand' : 'always'}
      >
        <Scene reduced={reduced} />
      </Canvas>
    </div>
  );
}
