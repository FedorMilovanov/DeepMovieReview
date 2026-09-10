"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import styles from "./moral-lens-lab.module.css";

type LensMode = "FRAME" | "EXAMINE" | "WEIGH" | "HOLD";

type LensTarget = {
  mode: LensMode;
  eyebrow: string;
  title: string;
  copy: string;
};

const TARGETS: LensTarget[] = [
  {
    mode: "FRAME",
    eyebrow: "FILM / ENTRY",
    title: "Open the frame",
    copy: "The cursor stays quiet until the viewer approaches a meaningful cinematic surface.",
  },
  {
    mode: "EXAMINE",
    eyebrow: "SCENE / EVIDENCE",
    title: "Examine the scene",
    copy: "The reticle becomes an analytical lens only where evidence can actually be inspected.",
  },
  {
    mode: "WEIGH",
    eyebrow: "DECISION / PRESSURE",
    title: "Weigh the choice",
    copy: "Difficult decisions use a distinct verb so interaction reinforces the intellectual task.",
  },
  {
    mode: "HOLD",
    eyebrow: "OBJECT / SPATIAL",
    title: "Hold to inspect",
    copy: "Future 3D objects can inherit this state without making the whole site feel like a game UI.",
  },
];

const DEFAULT_LABEL = "LENS";

export function MoralLensLab() {
  const stageRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const targetPosition = useRef({ x: 0, y: 0 });
  const currentPosition = useRef({ x: 0, y: 0 });
  const [selected, setSelected] = useState<LensMode>("EXAMINE");

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const tick = () => {
      const cursor = cursorRef.current;
      if (cursor) {
        const easing = reducedMotion.matches ? 1 : 0.22;
        currentPosition.current.x += (targetPosition.current.x - currentPosition.current.x) * easing;
        currentPosition.current.y += (targetPosition.current.y - currentPosition.current.y) * easing;
        cursor.style.transform = `translate3d(${currentPosition.current.x}px, ${currentPosition.current.y}px, 0)`;
      }
      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function updatePointer(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") return;

    const stage = stageRef.current;
    const cursor = cursorRef.current;
    if (!stage || !cursor) return;

    const bounds = stage.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;

    targetPosition.current = { x, y };
    stage.style.setProperty("--lens-x", `${x}px`);
    stage.style.setProperty("--lens-y", `${y}px`);

    const target = (event.target as HTMLElement).closest<HTMLElement>("[data-lens-mode]");
    const mode = target?.dataset.lensMode ?? "DEFAULT";
    const label = target?.dataset.lensLabel ?? DEFAULT_LABEL;

    cursor.dataset.mode = mode.toLowerCase();
    cursor.dataset.visible = "true";
    const labelNode = cursor.querySelector<HTMLElement>("[data-lens-label]");
    if (labelNode) labelNode.textContent = label;
  }

  function enterStage(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    targetPosition.current = { x, y };
    currentPosition.current = { x, y };
    if (cursorRef.current) cursorRef.current.dataset.visible = "true";
  }

  function leaveStage() {
    if (cursorRef.current) {
      cursorRef.current.dataset.visible = "false";
      cursorRef.current.dataset.mode = "default";
    }
  }

  return (
    <div className={styles.labShell}>
      <header className={styles.intro}>
        <p className={styles.kicker}>R&amp;D / MORAL LENS / V0</p>
        <h1>Cursor as an instrument, not decoration.</h1>
        <p className={styles.lede}>
          This isolated lab tests the interaction grammar before any WebGPU scene exists. The native site shell remains untouched.
        </p>
      </header>

      <div
        ref={stageRef}
        className={styles.stage}
        onPointerEnter={enterStage}
        onPointerMove={updatePointer}
        onPointerLeave={leaveStage}
      >
        <div className={styles.stageNoise} aria-hidden="true" />
        <div className={styles.stageHeader}>
          <span>POINTER / FINE INPUT</span>
          <span>SELECTED / {selected}</span>
        </div>

        <div className={styles.targetGrid}>
          {TARGETS.map((target, index) => (
            <button
              key={target.mode}
              type="button"
              className={styles.target}
              data-lens-mode={target.mode}
              data-lens-label={target.mode}
              aria-pressed={selected === target.mode}
              onClick={() => setSelected(target.mode)}
            >
              <span className={styles.targetIndex}>0{index + 1}</span>
              <span className={styles.targetEyebrow}>{target.eyebrow}</span>
              <strong>{target.title}</strong>
              <span className={styles.targetCopy}>{target.copy}</span>
            </button>
          ))}
        </div>

        <div className={styles.stageFooter}>
          <span>Move between semantic targets.</span>
          <span>Keyboard/touch remain native.</span>
        </div>

        <div
          ref={cursorRef}
          className={styles.lensCursor}
          data-visible="false"
          data-mode="default"
          aria-hidden="true"
        >
          <span className={styles.lensRing} />
          <span className={styles.lensDot} />
          <span className={styles.lensLabel} data-lens-label>{DEFAULT_LABEL}</span>
        </div>
      </div>

      <section className={styles.notes} aria-labelledby="lens-rules-title">
        <p className={styles.kicker}>PASS / FAIL RULES</p>
        <h2 id="lens-rules-title">The cursor earns its place only if meaning survives without it.</h2>
        <div className={styles.noteGrid}>
          <p><strong>Fine pointer only.</strong> Touch never receives a fake mouse cursor.</p>
          <p><strong>Reduced motion.</strong> Inertia collapses to direct tracking.</p>
          <p><strong>Forced colors.</strong> The custom lens disappears and native input wins.</p>
          <p><strong>No text interference.</strong> Production use must never block selection, links, forms or reading.</p>
        </div>
      </section>
    </div>
  );
}
