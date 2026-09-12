"use client";

import { Float } from "@react-three/drei";
import { Canvas, useFrame, type EventManager } from "@react-three/fiber";
import { motion } from "motion/react";
import {
  Component,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Mesh } from "three";
import * as THREE from "three/webgpu";
import { useExperienceQuality } from "@/components/experience/experience-quality-provider";
import styles from "./verdict-core.module.css";

type RendererFactoryProps = {
  canvas: EventTarget;
};

const createEventlessManager = (): EventManager<HTMLElement> => ({
  enabled: false,
  priority: 0,
});

class VerdictCoreBoundary extends Component<
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

function StaticCoreFallback() {
  return <div className={styles.fallback} aria-hidden="true" />;
}

function percentile(values: readonly number[], ratio: number) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * ratio) - 1));
  return sorted[index];
}

function CoreMesh({
  freeze,
  reportFrameSample,
}: {
  freeze: boolean;
  reportFrameSample: (frameMs: number) => void;
}) {
  const meshRef = useRef<Mesh>(null);
  const frameWindowRef = useRef<number[]>([]);
  const reportCounterRef = useRef(0);

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    if (!freeze) {
      mesh.rotation.y += delta * 0.11;
      mesh.rotation.x = Math.sin(state.clock.elapsedTime * 0.28) * 0.08;
      mesh.rotation.z = Math.cos(state.clock.elapsedTime * 0.17) * 0.035;
    }

    if (freeze) return;

    const frameWindow = frameWindowRef.current;
    frameWindow.push(delta * 1000);
    if (frameWindow.length > 90) frameWindow.shift();

    reportCounterRef.current += 1;
    if (reportCounterRef.current >= 30 && frameWindow.length >= 30) {
      reportCounterRef.current = 0;
      reportFrameSample(percentile(frameWindow, 0.9));
    }
  });

  return (
    <Float
      speed={freeze ? 0 : 0.42}
      rotationIntensity={freeze ? 0 : 0.08}
      floatIntensity={freeze ? 0 : 0.22}
    >
      <mesh ref={meshRef} castShadow receiveShadow scale={1.05}>
        <icosahedronGeometry args={[1.18, 5]} />
        <meshPhysicalMaterial
          color="#11100f"
          metalness={0.92}
          roughness={0.2}
          clearcoat={1}
          clearcoatRoughness={0.16}
        />
      </mesh>
    </Float>
  );
}

export function VerdictCore() {
  const {
    backend,
    tier,
    dpr,
    reducedMotion,
    forcedColors,
    documentVisible,
    reportFrameSample,
    reportRendererBackend,
    reportRendererFailure,
  } = useExperienceQuality();
  const shellRef = useRef<HTMLDivElement>(null);
  const [inViewport, setInViewport] = useState(true);

  useEffect(() => {
    const element = shellRef.current;
    if (!element || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => setInViewport(entry?.isIntersecting ?? false),
      { rootMargin: "200px 0px", threshold: 0.01 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const gpuEnabled = backend !== "unknown" && backend !== "none" && tier !== "LITE" && !forcedColors;
  const maxDpr = tier === "ULTRA" ? Math.min(dpr, 2) : tier === "HIGH" ? Math.min(dpr, 1.6) : 1.25;
  const frameloop = !documentVisible || !inViewport ? "never" : reducedMotion ? "demand" : "always";
  const fallback = <StaticCoreFallback />;

  const createRenderer = useCallback(async (props: RendererFactoryProps) => {
    if (!(props.canvas instanceof HTMLCanvasElement)) {
      const reason = "VerdictCore requires a DOM canvas surface.";
      reportRendererFailure(reason);
      throw new Error(reason);
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

      renderer.setClearColor(0x000000, 0);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = tier === "ULTRA" ? 1 : 0.92;
      return renderer;
    } catch (error) {
      const reason = error instanceof Error
        ? `Renderer initialization failed: ${error.message}`
        : "Renderer initialization failed.";
      reportRendererFailure(reason);
      throw error;
    }
  }, [backend, reportRendererBackend, reportRendererFailure, tier]);

  const opticsAnimate = !reducedMotion && inViewport && documentVisible
    ? { rotate: [0, 2.5, 0], opacity: [0.68, 0.9, 0.68] }
    : { rotate: 0, opacity: 0.68 };

  return (
    <div
      ref={shellRef}
      className={styles.shell}
      aria-label="Adaptive cinematic verdict visualization"
      data-render-visible={inViewport}
    >
      {gpuEnabled ? (
        <VerdictCoreBoundary fallback={fallback}>
          <div className={styles.canvas} aria-hidden="true">
            <Canvas
              events={createEventlessManager}
              dpr={[1, maxDpr]}
              frameloop={frameloop}
              camera={{ position: [0, 0, 4.5], fov: 38, near: 0.1, far: 20 }}
              shadows={tier === "ULTRA" || tier === "HIGH"}
              gl={createRenderer}
              fallback={fallback}
            >
              <ambientLight intensity={0.42} />
              <directionalLight position={[3.5, 4.5, 3]} intensity={2.4} color="#f0dcc0" />
              <directionalLight position={[-4, -1.5, 2]} intensity={1.15} color="#5f161c" />
              <Suspense fallback={null}>
                <CoreMesh freeze={reducedMotion} reportFrameSample={reportFrameSample} />
              </Suspense>
            </Canvas>
          </div>
        </VerdictCoreBoundary>
      ) : (
        fallback
      )}

      <motion.div
        className={styles.optics}
        aria-hidden="true"
        animate={opticsAnimate}
        transition={{ duration: 12, repeat: reducedMotion ? 0 : Infinity, ease: "easeInOut" }}
      />
      <div className={styles.meta} aria-hidden="true">
        <span>Ядро вердикта / адаптивно</span>
        <span>{backend.toUpperCase()} · {tier}</span>
      </div>
    </div>
  );
}
