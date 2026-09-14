"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useExperienceQuality } from "@/components/experience/experience-quality-provider";
import styles from "./moral-lens-cursor.module.css";

type LensState = "default" | "examine" | "trace" | "weigh" | "open";

const LENS_LABELS: Record<Exclude<LensState, "default">, string> = {
  examine: "EXAMINE",
  trace: "TRACE",
  weigh: "WEIGH",
  open: "OPEN",
};

const LENS_VALUES: ReadonlySet<string> = new Set(["examine", "trace", "weigh", "open"]);

const NATIVE_CURSOR_SELECTOR =
  "input, textarea, select, [contenteditable='true'], [data-native-cursor]";

const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";

let finePointerQuery: MediaQueryList | null = null;

function getFinePointerQuery(): MediaQueryList {
  if (!finePointerQuery) finePointerQuery = window.matchMedia(FINE_POINTER_QUERY);
  return finePointerQuery;
}

function subscribeFinePointer(onChange: () => void): () => void {
  const query = getFinePointerQuery();
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function readFinePointer(): boolean {
  return getFinePointerQuery().matches;
}

function readFinePointerServer(): boolean {
  return false;
}

/**
 * Moral Lens cursor (Visual Constitution §8): a tiny light point with a
 * lagging outer ring, plus contextual states (EXAMINE / TRACE / WEIGH / OPEN)
 * driven by `data-lens-cursor` attributes on instrument surfaces.
 *
 * Activation contract:
 * - fine pointers with hover only; never on touch;
 * - disabled under reduced motion and forced colors (native cursor wins);
 * - native cursor is always preserved over text-entry controls;
 * - purely decorative: aria-hidden, pointer-events none, no content inside.
 *
 * Motion note: continuous pointer tracking runs on rAF with lerp instead of
 * the Motion layout-animation path — high-frequency input following is not
 * layout animation, and this keeps the cursor dependency-free on every route.
 */
export function MoralLensCursor() {
  const { reducedMotion, forcedColors } = useExperienceQuality();
  // Media-query subscription via useSyncExternalStore (same pattern as the
  // experience provider): hydration-safe through the server snapshot, live
  // updates through the media 'change' event, no effect involved.
  const finePointer = useSyncExternalStore(
    subscribeFinePointer,
    readFinePointer,
    readFinePointerServer,
  );
  const [lensState, setLensState] = useState<LensState>("default");
  const [settled, setSettled] = useState(false);
  const [suppressed, setSuppressed] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const lensStateRef = useRef<LensState>("default");
  const suppressedRef = useRef(false);

  const enabled = finePointer && !reducedMotion && !forcedColors;

  useEffect(() => {
    if (enabled) {
      document.documentElement.dataset.moralLens = "active";
    } else {
      delete document.documentElement.dataset.moralLens;
    }
    return () => {
      delete document.documentElement.dataset.moralLens;
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    let targetX = -100;
    let targetY = -100;
    let ringX = -100;
    let ringY = -100;
    let frame = 0;
    let acquired = false;

    const tick = () => {
      ringX += (targetX - ringX) * 0.22;
      ringY += (targetY - ringY) * 0.22;
      dotRef.current?.style.setProperty(
        "transform",
        `translate3d(${targetX}px, ${targetY}px, 0)`,
      );
      ringRef.current?.style.setProperty(
        "transform",
        `translate3d(${ringX}px, ${ringY}px, 0)`,
      );
      frame = window.requestAnimationFrame(tick);
    };

    const handleMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      targetX = event.clientX;
      targetY = event.clientY;
      if (!acquired) {
        acquired = true;
        ringX = targetX;
        ringY = targetY;
        setSettled(true);
      }
      const target = event.target as HTMLElement | null;
      const lensValue = target?.closest?.("[data-lens-cursor]")?.getAttribute("data-lens-cursor");
      const next: LensState =
        lensValue && LENS_VALUES.has(lensValue) ? (lensValue as LensState) : "default";
      if (next !== lensStateRef.current) {
        lensStateRef.current = next;
        setLensState(next);
      }
      const nextSuppressed = Boolean(target?.closest?.(NATIVE_CURSOR_SELECTOR));
      if (nextSuppressed !== suppressedRef.current) {
        suppressedRef.current = nextSuppressed;
        setSuppressed(nextSuppressed);
      }
    };

    const handleLeave = () => setSettled(false);

    document.addEventListener("pointermove", handleMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", handleLeave);
    frame = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("pointermove", handleMove);
      document.documentElement.removeEventListener("pointerleave", handleLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      className={styles.lens}
      data-state={lensState}
      data-visible={settled && !suppressed ? "true" : undefined}
      aria-hidden="true"
    >
      <div ref={dotRef} className={styles.dot} />
      <div ref={ringRef} className={styles.ring}>
        {lensState !== "default" ? (
          <span className={styles.tag}>{LENS_LABELS[lensState]}</span>
        ) : null}
      </div>
    </div>
  );
}
