"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useExperienceQuality } from "@/components/experience/experience-quality-provider";
import styles from "./living-frame-lab.module.css";

export function LivingFrameLab() {
  const frameRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef<{ clientX: number; clientY: number } | null>(null);
  const frameRequestRef = useRef<number | null>(null);
  const [showDepth, setShowDepth] = useState(false);
  const { reducedMotion } = useExperienceQuality();

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

  useEffect(() => {
    if (reducedMotion) {
      cancelPendingFrame();
      pointerRef.current = null;
      resetFrame();
    }
  }, [cancelPendingFrame, reducedMotion, resetFrame]);

  useEffect(() => () => cancelPendingFrame(), [cancelPendingFrame]);

  const flushPointer = useCallback(() => {
    frameRequestRef.current = null;
    const frame = frameRef.current;
    const pointer = pointerRef.current;
    if (!frame || !pointer || reducedMotion) return;

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
  }, [reducedMotion]);

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch" || reducedMotion) return;
    pointerRef.current = { clientX: event.clientX, clientY: event.clientY };
    if (frameRequestRef.current === null) {
      frameRequestRef.current = window.requestAnimationFrame(flushPointer);
    }
  }

  function handlePointerLeave() {
    pointerRef.current = null;
    cancelPendingFrame();
    resetFrame();
  }

  return (
    <div className={styles.labShell}>
      <header className={styles.intro}>
        <p className={styles.kicker}>R&amp;D / LIVING FRAME / CSS BASELINE</p>
        <h1>A still should feel dimensional before WebGPU arrives.</h1>
        <p className={styles.lede}>
          This lab establishes the cheapest acceptable 2.5D path: layered depth, restrained pointer parallax and local light. A later depth-mesh build must beat this baseline to justify its cost.
        </p>
      </header>

      <section className={styles.experiment} aria-labelledby="living-frame-title">
        <div className={styles.experimentTopline}>
          <div>
            <span>FRAME / FIXTURE</span>
            <strong id="living-frame-title">Trust / Control</strong>
          </div>
          <button
            className={styles.depthToggle}
            type="button"
            aria-pressed={showDepth}
            onClick={() => setShowDepth((value) => !value)}
          >
            {showDepth ? "Hide depth" : "Inspect depth"}
          </button>
        </div>

        <div
          ref={frameRef}
          className={styles.frame}
          data-show-depth={showDepth}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
        >
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
          <div className={styles.frameMeta}>
            <span>2.39:1 / LITE-CAPABLE</span>
            <span>POINTER LIGHT / DEPTH TRACE</span>
          </div>
          <div className={styles.frameCaption}>
            <strong>Protection becomes possession.</strong>
            <span>Fixture statement / no editorial authority</span>
          </div>
        </div>
      </section>

      <section className={styles.rules} aria-labelledby="living-frame-rules">
        <p className={styles.kicker}>BASELINE CONTRACT</p>
        <h2 id="living-frame-rules">The expensive renderer must prove a visible semantic gain.</h2>
        <div className={styles.ruleGrid}>
          <article><span>01</span><strong>Lite remains premium</strong><p>A static or layered fallback cannot look like a broken version of the real site.</p></article>
          <article><span>02</span><strong>Depth stays restrained</strong><p>Foreground movement is measured in pixels, not amusement-park camera swings.</p></article>
          <article><span>03</span><strong>Motion is optional</strong><p>Touch and reduced-motion preserve composition without requiring pointer choreography.</p></article>
          <article><span>04</span><strong>Film owns the image</strong><p>Future depth maps enhance an editorial master; the effect never becomes the subject.</p></article>
        </div>
      </section>
    </div>
  );
}
