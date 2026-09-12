"use client";

import { Canvas, useFrame, useThree, type EventManager } from "@react-three/fiber";
import {
  Component,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import type { Mesh } from "three";
import * as THREE from "three/webgpu";
import { useExperienceQuality } from "@/components/experience/experience-quality-provider";
import styles from "./living-frame-depth-mesh.module.css";

export type LivingFrameGpuBenchmark = {
  p95FrameMs: number;
  samples: number;
};

type RendererFactoryProps = {
  canvas: EventTarget;
};

const createEventlessManager = (): EventManager<HTMLElement> => ({
  enabled: false,
  priority: 0,
});

type DepthMeshSceneProps = {
  pointer: { x: number; y: number };
  inspectDepth: boolean;
  reducedMotion: boolean;
  benchmarkToken: number;
  pendingPointerTimestampRef: MutableRefObject<number | null>;
  onPointerLatency: (latencyMs: number) => void;
  onBenchmarkComplete: (benchmark: LivingFrameGpuBenchmark) => void;
};

class LivingFrameDepthBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function percentile(values: readonly number[], ratio: number) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * ratio) - 1));
  return sorted[index];
}

function createMasterTexture() {
  const width = 512;
  const height = 214;
  const data = new Uint8Array(width * height * 4);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4;
      const nx = x / width;
      const ny = y / height;

      let r = 8 + Math.round(10 * (1 - ny));
      let g = 9 + Math.round(10 * (1 - ny));
      let b = 11 + Math.round(12 * (1 - ny));

      const moon = Math.hypot(nx - 0.72, ny - 0.25);
      if (moon < 0.075) {
        const glow = Math.max(0, 1 - moon / 0.075);
        r += Math.round(90 * glow);
        g += Math.round(88 * glow);
        b += Math.round(82 * glow);
      }

      const leftWall = nx > 0.08 && nx < 0.48 && ny > 0.44 && ny < 0.82;
      const rightWall = nx > 0.52 && nx < 0.94 && ny > 0.40 && ny < 0.84;
      if (leftWall) {
        r += 12;
        g += 13;
        b += 15;
      }
      if (rightWall) {
        r += 15;
        g += 8;
        b += 9;
      }

      const subjectA = Math.hypot((nx - 0.39) / 0.085, (ny - 0.64) / 0.24) < 1;
      const subjectB = Math.hypot((nx - 0.67) / 0.08, (ny - 0.66) / 0.22) < 1;
      if (subjectA) {
        r = 34;
        g = 35;
        b = 39;
      }
      if (subjectB) {
        r = 48;
        g = 27;
        b = 29;
      }

      const doorway = nx > 0.485 && nx < 0.525 && ny > 0.48 && ny < 0.82;
      if (doorway) {
        r += 75;
        g += 53;
        b += 28;
      }

      const vignette = Math.min(1, Math.hypot((nx - 0.5) * 1.25, (ny - 0.5) * 1.35));
      const shade = 1 - vignette * 0.42;

      data[i] = Math.max(0, Math.min(255, Math.round(r * shade)));
      data[i + 1] = Math.max(0, Math.min(255, Math.round(g * shade)));
      data[i + 2] = Math.max(0, Math.min(255, Math.round(b * shade)));
      data[i + 3] = 255;
    }
  }

  const texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat, THREE.UnsignedByteType);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

function createDepthTexture() {
  const width = 256;
  const height = 107;
  const data = new Uint8Array(width * height);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const nx = x / width;
      const ny = y / height;

      let depth = 34 + Math.round(18 * ny);

      const leftWall = nx > 0.08 && nx < 0.48 && ny > 0.44 && ny < 0.82;
      const rightWall = nx > 0.52 && nx < 0.94 && ny > 0.40 && ny < 0.84;
      if (leftWall || rightWall) depth = 112;

      const subjectA = Math.hypot((nx - 0.39) / 0.095, (ny - 0.64) / 0.26);
      const subjectB = Math.hypot((nx - 0.67) / 0.09, (ny - 0.66) / 0.24);
      if (subjectA < 1.15) depth = Math.max(depth, Math.round(205 - Math.max(0, subjectA - 0.72) * 120));
      if (subjectB < 1.15) depth = Math.max(depth, Math.round(218 - Math.max(0, subjectB - 0.72) * 120));

      const doorway = nx > 0.48 && nx < 0.53 && ny > 0.47 && ny < 0.83;
      if (doorway) depth = 96;

      data[y * width + x] = Math.max(0, Math.min(255, depth));
    }
  }

  const texture = new THREE.DataTexture(data, width, height, THREE.RedFormat, THREE.UnsignedByteType);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

function DepthMeshScene({
  pointer,
  inspectDepth,
  reducedMotion,
  benchmarkToken,
  pendingPointerTimestampRef,
  onPointerLatency,
  onBenchmarkComplete,
}: DepthMeshSceneProps) {
  const meshRef = useRef<Mesh>(null);
  const { invalidate } = useThree();
  const benchmarkRef = useRef({
    token: 0,
    startedAt: 0,
    skipFirst: true,
    samples: [] as number[],
    active: false,
  });
  const masterTexture = useMemo(() => createMasterTexture(), []);
  const depthTexture = useMemo(() => createDepthTexture(), []);

  useEffect(() => () => {
    masterTexture.dispose();
    depthTexture.dispose();
  }, [depthTexture, masterTexture]);

  useEffect(() => {
    if (benchmarkToken <= 0 || benchmarkRef.current.token === benchmarkToken) return;
    benchmarkRef.current = {
      token: benchmarkToken,
      startedAt: performance.now(),
      skipFirst: true,
      samples: [],
      active: true,
    };
    invalidate();
  }, [benchmarkToken, invalidate]);

  useEffect(() => {
    invalidate();
  }, [inspectDepth, invalidate, pointer.x, pointer.y, reducedMotion]);

  useFrame((_state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    mesh.rotation.x = reducedMotion ? 0 : -pointer.y * 0.032;
    mesh.rotation.y = reducedMotion ? 0 : pointer.x * 0.046;
    mesh.position.x = reducedMotion ? 0 : pointer.x * 0.035;
    mesh.position.y = reducedMotion ? 0 : -pointer.y * 0.02;

    if (pendingPointerTimestampRef.current !== null) {
      onPointerLatency(performance.now() - pendingPointerTimestampRef.current);
      pendingPointerTimestampRef.current = null;
    }

    const benchmark = benchmarkRef.current;
    if (!benchmark.active) return;

    if (benchmark.skipFirst) {
      benchmark.skipFirst = false;
    } else {
      const frameMs = delta * 1000;
      if (Number.isFinite(frameMs) && frameMs > 0 && frameMs < 250) benchmark.samples.push(frameMs);
    }

    if (performance.now() - benchmark.startedAt < 1200) {
      invalidate();
      return;
    }

    benchmark.active = false;
    onBenchmarkComplete({
      p95FrameMs: Number(percentile(benchmark.samples, 0.95).toFixed(2)),
      samples: benchmark.samples.length,
    });
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[2.8, 3.2, 4]} intensity={1.2} color="#f0dcc0" />
      <mesh ref={meshRef}>
        <planeGeometry args={[4.78, 2, 96, 40]} />
        <meshStandardMaterial
          map={masterTexture}
          displacementMap={depthTexture}
          displacementScale={inspectDepth ? 0.22 : 0.13}
          displacementBias={-0.04}
          roughness={0.92}
          metalness={0.02}
          wireframe={inspectDepth}
          side={THREE.DoubleSide}
        />
      </mesh>
    </>
  );
}

export function LivingFrameDepthMesh({
  inspectDepth,
  reducedMotion,
  benchmarkToken,
  onPointerLatency,
  onBenchmarkComplete,
}: {
  inspectDepth: boolean;
  reducedMotion: boolean;
  benchmarkToken: number;
  onPointerLatency: (latencyMs: number) => void;
  onBenchmarkComplete: (benchmark: LivingFrameGpuBenchmark) => void;
}) {
  const {
    backend,
    tier,
    dpr,
    reportRendererBackend,
    reportRendererFailure,
  } = useExperienceQuality();
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const pointerFrameRef = useRef<number | null>(null);
  const pendingPointerRef = useRef<{ x: number; y: number; timestamp: number } | null>(null);
  const pendingPointerTimestampRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (pointerFrameRef.current !== null) cancelAnimationFrame(pointerFrameRef.current);
  }, []);

  const createRenderer = useCallback(async (props: RendererFactoryProps) => {
    if (!(props.canvas instanceof HTMLCanvasElement)) {
      throw new Error("Living Frame depth mesh requires a DOM canvas.");
    }

    try {
      const renderer = new THREE.WebGPURenderer({
        canvas: props.canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
        forceWebGL: backend === "webgl2",
      });
      await renderer.init();
      const rendererBackend = renderer.backend as { isWebGPUBackend?: boolean };
      reportRendererBackend(rendererBackend.isWebGPUBackend ? "webgpu" : "webgl2");
      renderer.setClearColor(0x050505, 1);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.92;
      return renderer;
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Living Frame renderer failed.";
      reportRendererFailure(`Living Frame renderer initialization failed: ${reason}`);
      throw error;
    }
  }, [backend, reportRendererBackend, reportRendererFailure]);

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (reducedMotion || event.pointerType === "touch") return;

    const bounds = event.currentTarget.getBoundingClientRect();
    if (bounds.width <= 0 || bounds.height <= 0) return;

    pendingPointerRef.current = {
      x: ((event.clientX - bounds.left) / bounds.width - 0.5) * 2,
      y: ((event.clientY - bounds.top) / bounds.height - 0.5) * 2,
      timestamp: performance.now(),
    };

    if (pointerFrameRef.current !== null) return;
    pointerFrameRef.current = requestAnimationFrame(() => {
      pointerFrameRef.current = null;
      const next = pendingPointerRef.current;
      if (!next) return;
      pendingPointerTimestampRef.current = next.timestamp;
      setPointer({ x: next.x, y: next.y });
    });
  }

  function handlePointerLeave() {
    pendingPointerRef.current = null;
    pendingPointerTimestampRef.current = null;
    setPointer({ x: 0, y: 0 });
  }

  const gpuAvailable = backend !== "unknown" && backend !== "none" && tier !== "LITE";
  const maxDpr = tier === "ULTRA" ? Math.min(dpr, 1.8) : tier === "HIGH" ? Math.min(dpr, 1.5) : 1.2;

  return (
    <div
      className={styles.shell}
      data-gpu-status={backend === "unknown" ? "detecting" : gpuAvailable ? "active" : "fallback"}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {gpuAvailable ? (
        <LivingFrameDepthBoundary
          fallback={
            <div className={styles.fallback}>
              <span>Depth mesh renderer failed safely. Compare the segmented or Lite path instead.</span>
            </div>
          }
        >
          <Canvas
            events={createEventlessManager}
            dpr={[1, maxDpr]}
            frameloop="demand"
            camera={{ position: [0, 0, 4.35], fov: 31, near: 0.1, far: 20 }}
            gl={createRenderer}
          >
            <Suspense fallback={null}>
              <DepthMeshScene
                pointer={pointer}
                inspectDepth={inspectDepth}
                reducedMotion={reducedMotion}
                benchmarkToken={benchmarkToken}
                pendingPointerTimestampRef={pendingPointerTimestampRef}
                onPointerLatency={onPointerLatency}
                onBenchmarkComplete={onBenchmarkComplete}
              />
            </Suspense>
          </Canvas>
        </LivingFrameDepthBoundary>
      ) : (
        <div className={styles.fallback}>
          <span>{backend === "unknown" ? "Detecting GPU path…" : "Depth mesh unavailable at current quality tier."}</span>
        </div>
      )}
    </div>
  );
}
