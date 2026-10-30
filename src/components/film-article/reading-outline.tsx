"use client";

import { useEffect, useRef, useState } from "react";

type ReadingSection = { id: string; number: number; heading: string };

/** One spoiler-projected contents list: mouse preview, click pin and keyboard access. */
export function ReadingOutline({ sections }: { sections: ReadingSection[] }) {
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [active, setActive] = useState(sections[0]?.id ?? "");
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Read the section boundaries, not just the most recent observer batch.
    // A section can span several screens; reverse scroll and hash jumps must
    // still identify the last section that crossed the reading line.
    let frame = 0;
    const update = () => {
      frame = 0;
      const first = document.getElementById(sections[0]?.id ?? "");
      const padding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      const margin = first ? parseFloat(getComputedStyle(first).scrollMarginBlockStart) || 0 : 0;
      // Native anchors combine scroll-padding and scroll-margin. Honour their
      // real landing line even in a short landscape viewport, not a magic y.
      const line = Math.min(window.innerHeight - 1, Math.max(window.innerHeight * 0.28, padding + margin + 1));
      let current = sections[0]?.id ?? "";
      for (const { id } of sections) {
        const section = document.getElementById(id);
        if (section && section.getBoundingClientRect().top <= line) current = id;
      }
      setActive(current);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const observer = new ResizeObserver(schedule);
    const article = root.current?.closest("article");
    if (article) observer.observe(article);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [sections]);

  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) {
        setOpen(false);
        setPinned(false);
      }
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [open]);

  if (!sections.length) return null;
  const activeIndex = Math.max(0, sections.findIndex(section => section.id === active));
  return (
    <div
      className="readingOutline"
      ref={root}
      onPointerEnter={(event) => { if (event.pointerType === "mouse") setOpen(true); }}
      onPointerLeave={() => {
        if (!pinned && !root.current?.contains(document.activeElement)) setOpen(false);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false);
          setPinned(false);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          setOpen(false);
          setPinned(false);
          trigger.current?.focus();
        }
      }}
    >
      <button
        ref={trigger}
        className="readingOutlineTrigger"
        aria-label="Оглавление статьи"
        aria-expanded={open}
        aria-controls="reading-outline-panel"
        onClick={() => {
          setOpen(!pinned);
          setPinned(!pinned);
        }}
      >
        <span className="readingOutlineWord">Разделы</span>
        <span className="readingOutlineRail" aria-hidden="true">
          {sections.map(({ id }, index) => <i key={id} data-active={id === active} data-read={index < activeIndex} />)}
        </span>
        <span className="readingOutlinePosition" aria-hidden="true">{String(activeIndex + 1).padStart(2, "0")}</span>
      </button>
      <nav id="reading-outline-panel" className="articleOutline readingOutlinePanel" hidden={!open} aria-label="Разделы статьи">
        <div className="readingOutlineHeading">В этом разборе <span>{activeIndex + 1} / {sections.length}</span></div>
        {sections.map(({ id, number, heading }) => (
          <a
            key={id}
            href={`#${id}`}
            aria-current={active === id ? "location" : undefined}
            onClick={() => {
              setActive(id);
              setOpen(false);
              setPinned(false);
              // Let the native hash navigation run first, then focus its heading.
              requestAnimationFrame(() => document.getElementById(`${id}-title`)?.focus({ preventScroll: true }));
            }}
          >
            <span>{String(number).padStart(2, "0")}</span><strong>{heading}</strong>
          </a>
        ))}
      </nav>
    </div>
  );
}
