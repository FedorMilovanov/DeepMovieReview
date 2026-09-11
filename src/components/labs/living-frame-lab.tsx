"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  LivingFrameDepthMesh,
  type LivingFrameGpuBenchmark,
} from "@/components/labs/living-frame-depth-mesh";
import { useExperienceQuality } from "@/components/experience/experience-quality-provider";
import styles from "./living-frame-lab.module.css";

type LivingFrameVariant = "A" | "B" | "C";

type VariantMetrics = {
  p95FrameMs: number | null;
  frameSamples: number;
  p95PointerMs: number | null;
  pointerSamples: number;
};

const INITIAL_METRICS: Record<LivingFrameVariant, VariantMetrics> = {
  A: { p95FrameMs: null, frameSamples: 0, p95PointerMs: null, pointerSamples: 0 },
  B: { p95FrameMs: null, frameSamples: 0, p95PointerMs: null, pointerSamples: 0 },
  C: { p95FrameMs: 0, frameSamples: 0, p95PointerMs: 0, pointerSamples: 0 },
};

const DEPTH_MESH_TEXTURE_BYTES = 512 * 256 * 4 + 256 * 128;

function percentile(values: readonly number[], ratio: number) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * ratio) - 1));
  return sorted[index];
}

function formatMetric(value: number | null, unit: string) {
  return value === null ? "Not measured" : `${value.toFixed(2)} ${unit}`;
}

export function LivingFrameLab() {
  const frameRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef<{ clientX: number; clientY: number; timestamp: number } | null>(null);
  const frameRequestRef = useRef<number | null>(null);
  const cssBenchmarkFrameRef = useRef<number | null>(null);
  const pointerSamplesRef = useRef<Record<"A" | "B", number[]>>({ A: [], B: [] });
  const [showDepth, setShowDepth] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<LivingFrameVariant>("B");
  const [metrics, setMetrics] = useState(INITIAL_METRICS);
  const [gpuBenchmarkToken, setGpuBenchmarkToken] = useState(0);
  const [benchmarking, setBenchmarking] = useState(false);
  const { backend, tier, reducedMotion } = useExperienceQuality();

  const effectiveVariant: LivingFrameVariant = reducedMotion ? "C" : selectedVariant;

  const resetFrame = useCallback(() => {
    const frame = frameRef.current;
    if (!frame) return;
    frame.style.setProperty("--near-x", "0px");
    frame.style.setProperty("--near-y", "0px");
    frame.style.setProperty("--mid-x", "0px");
    frame.style.setProperty("--mid-y", "0px");
    frame.style.setProperty("--far-x", "0px");
    frame.style.setProperty("--far-y", "0px");
    frame.style.setProperty("--light-x", "50%");
    frame.style.setProperty("--light-y", "42%");
  }, []);

  const cancelPendingFrame = useCallback(() => {
    if (frameRequestRef.current !== null) {
      window.cancelAnimationFrame(frameRequestRef.current);
      frameRequestRef.current = null;
    }
  }, []);

  const recordPointerLatency = useCallback((variant: "A" | "B", latencyMs: number) => {
    if (!Number.isFinite(latencyMs) || latencyMs <= 0 || latencyMs > 500) return;
    const samples = pointerSamplesRef.current[variant];
    samples.push(latencyMs);
    if (samples.length > 60) samples.shift();

    setMetrics((current) => ({
      ...current,
      [variant]: {
        ...current[variant],
        p95PointerMs: Number(percentile(samples, 0.95).toFixed(2)),
        pointerSamples: samples.length,
      },
    }));
  }, []);

  useEffect(() => {
    if (reducedMotion || effectiveVariant !== "B") {
      cancelPendingFrame();
      pointerRef.current = null;
      resetFrame();
    }
  }, [cancelPendingFrame, effectiveVariant, reducedMotion, resetFrame]);

  useEffect(() => () => {
    cancelPendingFrame();
    if (cssBenchmarkFrameRef.current !== null) cancelAnimationFrame(cssBenchmarkFrameRef.current);
  }, [cancelPendingFrame]);

  const flushPointer = useCallback(() => {
    frameRequestRef.current = null;
    const frame = frameRef.current;
    const pointer = pointerRef.current;
    if (!frame || !pointer || reducedMotion || effectiveVariant !== "B") return;

    const bounds = frame.getBoundingClientRect();
    if (bounds.width <= 0 || bounds.height <= 0) return;

    const localX = pointer.clientX - bounds.left;
    const localY = pointer.clientY - bounds.top;
    const nx = (localX / bounds.width - 0.5) * 2;
    const ny = (localY / bounds.height - 0.5) * 2;

    frame.style.setProperty("--near-x", `${nx * 14}px`);
    frame.style.setProperty("--near-y", `${ny * 9}px`);
    frame.style.setProperty("--mid-x", `${nx * 7}px`);
    frame.style.setProperty("--mid-y", `${ny * 5}px`);
    frame.style.setProperty("--far-x", `${nx * 2.5}px`);
    frame.style.setProperty("--far-y", `${ny * 1.8}px`);
    frame.style.setProperty("--light-x", `${localX}px`);
    frame.style.setProperty("--light-y", `${localY}px`);
    recordPointerLatency("B", performance.now() - pointer.timestamp);
  }, [effectiveVariant, recordPointerLatency, reducedMotion]);

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch" || reducedMotion || effectiveVariant !== "B") return;
    pointerRef.current = {
      clientX: event.clientX,
      clientY: event.clientY,
      timestamp: performance.now(),
    };
    if (frameRequestRef.current === null) {
      frameRequestRef.current = window.requestAnimationFrame(flushPointer);
    }
  }

  function handlePointerLeave() {
    pointerRef.current = null;
    cancelPendingFrame();
    resetFrame();
  }

  const handleGpuBenchmarkComplete = useCallback((benchmark: LivingFrameGpuBenchmark) => {
    setMetrics((current) => ({
      ...current,
      A: {
        ...current.A,
        p95FrameMs: benchmark.p95FrameMs,
        frameSamples: benchmark.samples,
      },
    }));
    setBenchmarking(false);
  }, []);

  const runCssBenchmark = useCallback(() => {
    const frame = frameRef.current;
    if (!frame) {
      setBenchmarking(false);
      return;
    }

    const startedAt = performance.now();
    let previous = startedAt;
    const samples: number[] = [];

    const step = (now: number) => {
      const elapsed = now - startedAt;
      if (elapsed > 0) {
        const frameMs = now - previous;
        if (frameMs > 0 && frameMs < 250) samples.push(frameMs);
      }
      previous = now;

      const t = elapsed / 1000;
      frame.style.setProperty("--near-x", `${Math.sin(t * 5) * 12}px`);
      frame.style.setProperty("--near-y", `${Math.cos(t * 4) * 7}px`);
      frame.style.setProperty("--mid-x", `${Math.sin(t * 5) * 6}px`);
      frame.style.setProperty("--mid-y", `${Math.cos(t * 4) * 4}px`);
      frame.style.setProperty("--far-x", `${Math.sin(t * 5) * 2}px`);
      frame.style.setProperty("--far-y", `${Math.cos(t * 4) * 1.4}px`);

      if (elapsed < 1200) {
        cssBenchmarkFrameRef.current = requestAnimationFrame(step);
        return;
      }

      cssBenchmarkFrameRef.current = null;
      resetFrame();
      setMetrics((current) => ({
        ...current,
        B: {
          ...current.B,
          p95FrameMs: Number(percentile(samples, 0.95).toFixed(2)),
          frameSamples: samples.length,
        },
      }));
      setBenchmarking(false);
    };

    cssBenchmarkFrameRef.current = requestAnimationFrame(step);
  }, [resetFrame]);

  function runBenchmark() {
    if (benchmarking) return;
    setBenchmarking(true);

    if (effectiveVariant === "A") {
      setGpuBenchmarkToken((token) => token + 1);
      return;
    }

    if (effectiveVariant === "B") {
      runCssBenchmark();
      return;
    }

    setMetrics((current) => ({
      ...current,
      C: { p95FrameMs: 0, frameSamples: 0, p95PointerMs: 0, pointerSamples: 0 },
    }));
    setBenchmarking(false);
  }

  const variantCopy: Record<LivingFrameVariant, { label: string; detail: string }> = {
    A: {
      label: "A / Depth mesh",
      detail: "Procedural master + 96×40 displaced mesh + depth texture. Highest complexity and distortion risk.",
    },
    B: {
      label: "B / Segmented planes",
      detail: "Foreground, subject and environment planes. Event-driven CSS transforms with no persistent render loop.",
    },
    C: {
      label: "C / Lite static",
      detail: "Static designed composition. No pointer choreography, GPU dependency or animation requirement.",
    },
  };

  return (
    <div
      className={styles.labShell}
      data-living-frame-rd
      data-selected-variant={selectedVariant}
      data-effective-variant={effectiveVariant}
      data-reduced-motion={reducedMotion}
    >
      <header className={styles.intro}>
        <p className={styles.kicker}>R&amp;D / LIVING FRAME / A-B-C COMPARISON</p>
        <h1>Depth must earn its cost.</h1>
        <p className={styles.lede}>
          One fixture, three rendering strategies. The launch path should be the cheapest treatment that adds cinematic presence without making reading wait for GPU initialization or introducing visible edge distortion.
        </p>
      </header>

      <section className={styles.comparison} aria-labelledby="living-frame-variants">
        <p className={styles.kicker}>VARIANTS</p>
        <h2 id="living-frame-variants">Compare the treatment, not three different compositions.</h2>
        <div className={styles.variantControls} role="group" aria-label="Living Frame rendering variant">
          {(Object.keys(variantCopy) as LivingFrameVariant[]).map((variant) => (
            <button
              type="button"
              key={variant}
              className={styles.variantButton}
              aria-pressed={selectedVariant === variant}
              onClick={() => setSelectedVariant(variant)}
              data-living-frame-variant={variant}
            >
              <strong>{variantCopy[variant].label}</strong>
              <span>{variantCopy[variant].detail}</span>
            </button>
          ))}
        </div>
        {reducedMotion ? (
          <p className={styles.motionNotice} role="status">
            Reduced Motion is active. The effective comparison path is C / Lite static even if another variant remains selected.
          </p>
        ) : null}
      </section>

      <section className={styles.experiment} aria-labelledby="living-frame-title">
        <div className={styles.experimentTopline}>
          <div>
            <span>FRAME / FIXTURE / EFFECTIVE {effectiveVariant}</span>
            <strong id="living-frame-title">Trust / Control</strong>
          </div>
          <div className={styles.experimentActions}>
            <button
              className={styles.depthToggle}
              type="button"
              aria-pressed={showDepth && effectiveVariant !== "C"}
              disabled={effectiveVariant === "C"}
              onClick={() => setShowDepth((value) => !value)}
            >
              {showDepth ? "Hide depth" : "Inspect depth"}
            </button>
            <button
              className={styles.depthToggle}
              type="button"
              disabled={benchmarking}
              onClick={runBenchmark}
              data-run-living-frame-benchmark
            >
              {benchmarking ? "Benchmarking…" : "Run 1.2s benchmark"}
            </button>
          </div>
        </div>

        <div
          ref={frameRef}
          className={styles.frame}
          data-show-depth={showDepth && effectiveVariant !== "C"}
          data-variant={effectiveVariant}
          onPointerMove={effectiveVariant === "B" ? handlePointerMove : undefined}
          onPointerLeave={effectiveVariant === "B" ? handlePointerLeave : undefined}
        >
          {effectiveVariant === "A" ? (
            <LivingFrameDepthMesh
              inspectDepth={showDepth}
              reducedMotion={reducedMotion}
              benchmarkToken={gpuBenchmarkToken}
              onPointerLatency={(latencyMs) => recordPointerLatency("A", latencyMs)}
              onBenchmarkComplete={handleGpuBenchmarkComplete}
            />
          ) : (
            <>
              <div className={`${styles.layer} ${styles.farLayer}`} data-depth-label="FAR / ENVIRONMENT" aria-hidden="true">
                <span className={styles.moon} />
                <span className={styles.horizon} />
              </div>
              <div className={`${styles.layer} ${styles.midLayer}`} data-depth-label="MID / ARCHITECTURE" aria-hidden="true">
                <span className={styles.wallA} />
                <span className={styles.wallB} />
                <span className={styles.doorLight} />
              </div>
              <div className={`${styles.layer} ${styles.nearLayer}`} data-depth-label="NEAR / SUBJECTS" aria-hidden="true">
                <span className={styles.subjectA} />
                <span className={styles.subjectB} />
              </div>
              <div className={styles.opticalLayer} aria-hidden="true" />
            </>
          )}

          <div className={styles.frameMeta}>
            <span>2.39:1 / {effectiveVariant === "A" ? `${backend.toUpperCase()} · ${tier}` : effectiveVariant === "B" ? "DOM PLANES" : "STATIC LITE"}</span>
            <span>{effectiveVariant === "C" ? "NO MOTION" : "BOUNDED INTERACTION / IDLE SETTLES"}</span>
          </div>
          <div className={styles.frameCaption}>
            <strong>Protection becomes possession.</strong>
            <span>Fixture statement / no editorial authority</span>
          </div>
        </div>
      </section>

      <section className={styles.measurements} aria-labelledby="living-frame-measurements">
        <p className={styles.kicker}>MEASUREMENTS</p>
        <h2 id="living-frame-measurements">Runtime cost stays visible beside visual ambition.</h2>
        <div className={styles.metricGrid}>
          {(Object.keys(metrics) as LivingFrameVariant[]).map((variant) => {
            const metric = metrics[variant];
            const textureBytes = variant === "A" ? DEPTH_MESH_TEXTURE_BYTES : 0;
            return (
              <article
                key={variant}
                data-living-frame-metric={variant}
                data-frame-p95={metric.p95FrameMs ?? ""}
                data-pointer-p95={metric.p95PointerMs ?? ""}
                data-texture-bytes={textureBytes}
              >
                <span className={styles.metricVariant}>{variantCopy[variant].label}</span>
                <dl>
                  <div><dt>p95 active frame interval</dt><dd>{formatMetric(metric.p95FrameMs, "ms")}</dd></div>
                  <div><dt>Frame samples</dt><dd>{metric.frameSamples}</dd></div>
                  <div><dt>p95 pointer → render</dt><dd>{formatMetric(metric.p95PointerMs, "ms")}</dd></div>
                  <div><dt>Pointer samples</dt><dd>{metric.pointerSamples}</dd></div>
                  <div><dt>Fixture GPU texture working set</dt><dd>{textureBytes === 0 ? "0 B" : `${(textureBytes / 1024).toFixed(0)} KiB`}</dd></div>
                  <div><dt>Network asset transfer</dt><dd>0 B / procedural fixture</dd></div>
                </dl>
                <p>
                  {variant === "A"
                    ? "Distortion risk: displacement can bend silhouette boundaries; the prototype intentionally caps depth scale."
                    : variant === "B"
                      ? "Distortion risk: no mesh deformation; separation is limited to whole visual planes."
                      : "Distortion risk: none from motion or displacement."}
                </p>
              </article>
            );
          })}
        </div>
        <p className={styles.measurementNote}>
          Frame values are active benchmark intervals, not a claim about every end-user GPU. The production decision also weighs visual gain, distortion risk, idle behavior, mobile composition and implementation complexity.
        </p>
      </section>

      <section className={styles.rules} aria-labelledby="living-frame-rules">
        <p className={styles.kicker}>ACCEPTANCE CONTRACT</p>
        <h2 id="living-frame-rules">The expensive renderer must prove a visible semantic gain.</h2>
        <div className={styles.ruleGrid}>
          <article><span>01</span><strong>Lite remains premium</strong><p>Static composition must look intentional, not like a failed GPU path.</p></article>
          <article><span>02</span><strong>Depth stays restrained</strong><p>Whole-frame movement remains measured in pixels and shallow mesh rotation.</p></article>
          <article><span>03</span><strong>Idle means idle</strong><p>A uses demand rendering; B schedules work only from input or its bounded benchmark; C renders no animation.</p></article>
          <article><span>04</span><strong>Reduced Motion wins</strong><p>The effective variant collapses to C instead of merely shortening animation durations.</p></article>
        </div>
      </section>
    </div>
  );
}
