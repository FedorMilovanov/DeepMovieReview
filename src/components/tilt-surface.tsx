"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { useExperienceQuality } from "@/components/experience/experience-quality-provider";

export type TiltSurfaceProps = {
  children: ReactNode;
  className?: string;
  /** Maximum rotation in degrees on either axis. */
  maxTilt?: number;
  /** How far the card lifts towards the viewer. */
  lift?: number;
  /** Adds a pointer-tracked specular highlight. */
  glare?: boolean;
  as?: "article" | "div" | "li" | "figure";
  /** Passed through for CSS targeting by the owning section. */
  dataAttributes?: Record<string, string | undefined>;
  style?: CSSProperties;
};

/**
 * A card that turns towards the pointer — and only towards the pointer.
 *
 * Rules this component keeps, because most tilt implementations break them:
 *
 *  - **Nothing tilts for a keyboard user, a touch user, or a reader who asked
 *    for less motion.** Mode is decided by media query *and* the shared
 *    experience tier, so a low-end device does not pay for the effect either.
 *  - **No persistent render loop.** Work happens inside a single
 *    requestAnimationFrame scheduled by input, and the values settle through a
 *    CSS transition, not through an animation loop that runs forever.
 *  - **No layout reads on the main thread per frame beyond one rect**, taken
 *    once per batched pointer event.
 *  - **The card never clips its own text.** Rotation is capped at a few
 *    degrees and the lift is small; captions keep their optical size because
 *    the perspective origin stays at the centre.
 *  - **Server markup is complete.** The component renders the same children
 *    without hover, so the page is readable and indexable before hydration.
 */
export function TiltSurface({
  children,
  className,
  maxTilt = 5,
  lift = 1.012,
  glare = true,
  as = "article",
  dataAttributes,
  style,
}: TiltSurfaceProps) {
  const ref = useRef<HTMLElement>(null);
  const frameRef = useRef<number | null>(null);
  const pointerRef = useRef<{ clientX: number; clientY: number } | null>(null);
  const { reducedMotion, tier } = useExperienceQuality();
  const interactive = !reducedMotion && tier !== "LITE";

  const reset = useCallback(() => {
    const node = ref.current;
    if (!node) return;
    node.style.setProperty("--tilt-x", "0deg");
    node.style.setProperty("--tilt-y", "0deg");
    node.style.setProperty("--tilt-gx", "50%");
    node.style.setProperty("--tilt-gy", "50%");
    node.removeAttribute("data-tilted");
  }, []);

  const cancel = useCallback(() => {
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!interactive) {
      cancel();
      pointerRef.current = null;
      reset();
    }
    return cancel;
  }, [cancel, interactive, reset]);

  const flush = useCallback(() => {
    frameRef.current = null;
    const node = ref.current;
    const pointer = pointerRef.current;
    if (!node || !pointer || !interactive) return;
    const bounds = node.getBoundingClientRect();
    if (bounds.width <= 0 || bounds.height <= 0) return;
    const localX = pointer.clientX - bounds.left;
    const localY = pointer.clientY - bounds.top;
    // A scroll can move the card out from under a pointer that never moved.
    // Recomputing from the last coordinates would then tilt a card the pointer
    // has already left, so the card lets go instead.
    if (localX < 0 || localY < 0 || localX > bounds.width || localY > bounds.height) {
      pointerRef.current = null;
      reset();
      return;
    }
    const nx = (localX / bounds.width - 0.5) * 2;
    const ny = (localY / bounds.height - 0.5) * 2;
    node.style.setProperty("--tilt-x", `${(ny * -maxTilt).toFixed(2)}deg`);
    node.style.setProperty("--tilt-y", `${(nx * maxTilt).toFixed(2)}deg`);
    node.style.setProperty("--tilt-gx", `${localX}px`);
    node.style.setProperty("--tilt-gy", `${localY}px`);
    node.setAttribute("data-tilted", "true");
  }, [interactive, maxTilt, reset]);

  // While the page scrolls under a still pointer, the card is following a
  // rectangle it no longer sees. Recompute on the next frame instead of waiting
  // for the pointer to move again.
  useEffect(() => {
    if (!interactive) return;
    const onViewportShift = () => {
      if (!pointerRef.current || frameRef.current !== null) return;
      frameRef.current = window.requestAnimationFrame(flush);
    };
    window.addEventListener("scroll", onViewportShift, { passive: true });
    window.addEventListener("resize", onViewportShift, { passive: true });
    return () => {
      window.removeEventListener("scroll", onViewportShift);
      window.removeEventListener("resize", onViewportShift);
    };
  }, [flush, interactive]);

  function onPointerMove(event: ReactPointerEvent<HTMLElement>) {
    if (!interactive || event.pointerType === "touch") return;
    pointerRef.current = { clientX: event.clientX, clientY: event.clientY };
    if (frameRef.current === null) frameRef.current = window.requestAnimationFrame(flush);
  }

  function onPointerLeave() {
    pointerRef.current = null;
    cancel();
    reset();
  }

  const Tag = as;
  const classes = ["tiltSurface", glare ? "tiltSurfaceGlare" : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag
      ref={ref as never}
      className={classes}
      style={{ ...style, "--tilt-lift": String(lift) } as CSSProperties}
      data-tilt-surface={interactive ? "on" : "off"}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      {...dataAttributes}
    >
      {children}
    </Tag>
  );
}
