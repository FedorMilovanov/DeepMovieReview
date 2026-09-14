"use client";

import { useEffect, useRef, type ReactNode } from "react";

type PipelineSpyProps = {
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
};

/**
 * Scroll-driven highlight for the analysis-route steps: the step whose
 * center is nearest the viewport middle carries `data-active`. Without JS
 * (or before hydration) every step renders in its resting state, so no
 * content or meaning depends on this enhancement.
 */
export function PipelineSpy({ children, className, ariaLabel }: PipelineSpyProps) {
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const items = [...list.querySelectorAll<HTMLElement>(":scope > li")];
    if (items.length === 0) return;

    let frame: number | null = null;
    let active: HTMLElement | null = null;

    function update() {
      frame = null;
      const middle = window.innerHeight * 0.5;
      let nearest: HTMLElement | null = null;
      let nearestDistance = Number.POSITIVE_INFINITY;
      for (const item of items) {
        const rect = item.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) continue;
        const distance = Math.abs(rect.top + rect.height / 2 - middle);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearest = item;
        }
      }
      if (nearest !== active) {
        active?.removeAttribute("data-active");
        nearest?.setAttribute("data-active", "true");
        active = nearest;
      }
    }

    function schedule() {
      if (frame === null) frame = window.requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <ol ref={listRef} className={className} aria-label={ariaLabel}>
      {children}
    </ol>
  );
}
