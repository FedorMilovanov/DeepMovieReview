"use client";

import Image, { type StaticImageData } from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { useExperienceQuality } from "@/components/experience/experience-quality-provider";

export type LensCursorState = "examine" | "trace" | "weigh" | "open";

export type LivingFrameProps = {
  art: StaticImageData;
  alt: string;
  priority?: boolean;
  sizes?: string;
  metaLeft?: string;
  metaRight?: string;
  captionTitle?: string;
  captionNote?: string;
  /**
   * Accessible label for the frame, rendered as screen-reader-only text.
   * (An aria-label would not compute: figure has no implicit role without
   * a figcaption, and would override the caption when one is present.)
   */
  label?: string;
  className?: string;
  parallax?: boolean;
  /**
   * Give the image plane a small 3D rotation under the pointer.
   *
   * The frame itself never tilts: captions, timecodes and the border stay flat,
   * so type is never rendered at an angle. Only the picture moves in depth,
   * which reads as a lens rather than as a card trick.
   */
  tilt?: boolean;
  objectPosition?: string;
  zoomed?: boolean;
  /** Moral Lens cursor state over this frame (default: examine). */
  lensCursor?: LensCursorState;
  /** Shared-element transition key (film slug) for view-transition morphing. */
  transitionSlug?: string;
  children?: ReactNode;
};

/**
 * Production Living Frame (Phase A).
 *
 * Single-master cinematic frame with bounded pointer parallax and a
 * pointer-following relight. This is the launch-path treatment selected by
 * R&D-02 (segmented-planes thinking, DOM-only): whole-image movement measured
 * in pixels, no mesh deformation, no persistent render loop, work scheduled
 * only from input. Static image + semantic overlays survive without JS.
 */
export function LivingFrame({
  art,
  alt,
  priority = false,
  sizes = "(max-width: 900px) 100vw, 50vw",
  metaLeft,
  metaRight,
  captionTitle,
  captionNote,
  label,
  className,
  parallax = true,
  tilt = false,
  objectPosition,
  zoomed = false,
  lensCursor = "examine",
  transitionSlug,
  children,
}: LivingFrameProps) {
  const frameRef = useRef<HTMLElement>(null);
  const pointerRef = useRef<{ clientX: number; clientY: number } | null>(null);
  const frameRequestRef = useRef<number | null>(null);
  const { reducedMotion, tier } = useExperienceQuality();

  const interactive = parallax && !reducedMotion && tier !== "LITE";
  const tilts = interactive && tilt;

  const resetFrame = useCallback(() => {
    const frame = frameRef.current;
    if (!frame) return;
    frame.style.setProperty("--lf-x", "0px");
    frame.style.setProperty("--lf-y", "0px");
    frame.style.setProperty("--lf-light-x", "50%");
    frame.style.setProperty("--lf-light-y", "42%");
    frame.style.setProperty("--lf-rx", "0deg");
    frame.style.setProperty("--lf-ry", "0deg");
  }, []);

  const cancelPendingFrame = useCallback(() => {
    if (frameRequestRef.current !== null) {
      window.cancelAnimationFrame(frameRequestRef.current);
      frameRequestRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!interactive) {
      cancelPendingFrame();
      pointerRef.current = null;
      resetFrame();
    }
  }, [cancelPendingFrame, interactive, resetFrame]);

  useEffect(
    () => () => {
      cancelPendingFrame();
    },
    [cancelPendingFrame],
  );


  const flushPointer = useCallback(() => {
    frameRequestRef.current = null;
    const frame = frameRef.current;
    const pointer = pointerRef.current;
    if (!frame || !pointer || !interactive) return;

    const bounds = frame.getBoundingClientRect();
    if (bounds.width <= 0 || bounds.height <= 0) return;

    const localX = pointer.clientX - bounds.left;
    const localY = pointer.clientY - bounds.top;
    // Scrolling moves the frame out from under a stationary pointer; without
    // this check the parallax and the tilt would hold a position the pointer no
    // longer occupies.
    if (localX < 0 || localY < 0 || localX > bounds.width || localY > bounds.height) {
      pointerRef.current = null;
      resetFrame();
      return;
    }
    const nx = (localX / bounds.width - 0.5) * 2;
    const ny = (localY / bounds.height - 0.5) * 2;

    frame.style.setProperty("--lf-x", `${nx * -9}px`);
    frame.style.setProperty("--lf-y", `${ny * -6}px`);
    frame.style.setProperty("--lf-light-x", `${localX}px`);
    frame.style.setProperty("--lf-light-y", `${localY}px`);

    if (tilts) {
      // Two degrees is the whole budget: enough to read as depth on a 2.39:1
      // plane, small enough that the image never looks like it is sliding out
      // of its frame. The existing 1.06 scale already covers the corners, so
      // no white gap can open at the edges.
      frame.style.setProperty("--lf-rx", `${(ny * -2.2).toFixed(2)}deg`);
      frame.style.setProperty("--lf-ry", `${(nx * 2.6).toFixed(2)}deg`);
    }
  }, [interactive, tilts, resetFrame]);

  useEffect(() => {
    if (!interactive) return;
    const onViewportShift = () => {
      if (!pointerRef.current || frameRequestRef.current !== null) return;
      frameRequestRef.current = window.requestAnimationFrame(flushPointer);
    };
    window.addEventListener("scroll", onViewportShift, { passive: true });
    window.addEventListener("resize", onViewportShift, { passive: true });
    return () => {
      window.removeEventListener("scroll", onViewportShift);
      window.removeEventListener("resize", onViewportShift);
    };
  }, [flushPointer, interactive]);

  function handlePointerMove(event: ReactPointerEvent<HTMLElement>) {
    if (event.pointerType === "touch" || !interactive) return;
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

  const frameClassName = ["livingFrame", "livingFrameLive", className]
    .filter(Boolean)
    .join(" ");
  const frameStyle = {
    "--lf-object-position": objectPosition ?? "50% 50%",
    "--lf-zoom": zoomed ? "1.14" : "1.06",
  } as CSSProperties;

  return (
    <figure
      ref={frameRef}
      className={frameClassName}
      style={frameStyle}
      data-lens-cursor={lensCursor}
      data-film-transition-media={transitionSlug}
      data-zoomed={zoomed || undefined}
      data-tilt={tilts ? "media" : undefined}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div className="lfMedia">
        <Image
          src={art}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          placeholder="blur"
          className="lfImage"
        />
      </div>
      <span className="lfGrade" aria-hidden="true" />
      <span className="lfLight" aria-hidden="true" />
      <span className="lfGrain" aria-hidden="true" />
      <span className="lfVignette" aria-hidden="true" />
      {metaLeft || metaRight ? (
        <div className="frameMeta" aria-hidden="true">
          <span>{metaLeft}</span>
          <span>{metaRight}</span>
        </div>
      ) : null}
      {children ? <div className="lfAnnotations">{children}</div> : null}
      {captionTitle ? (
        <figcaption className="frameCaption">
          <strong>{captionTitle}</strong>
          {captionNote ? <span>{captionNote}</span> : null}
        </figcaption>
      ) : null}
      {label ? <span className="visuallyHidden">{label}</span> : null}
    </figure>
  );
}
