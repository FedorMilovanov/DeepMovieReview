"use client";

import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { useHydrated } from "@/lib/use-hydrated";

type ReadingSection = { id: string; number: number; heading: string };

/** One spoiler-projected contents list: mouse preview, click pin and keyboard access. */
export function ReadingOutline({ sections }: { sections: ReadingSection[] }) {
  const hydrated = useHydrated();
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
    // The control is portalled into the sticky header after hydration; observe
    // the article itself rather than assuming the control is still its child.
    const article = document.querySelector(".articleShell");
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

  useEffect(() => {
    if (!open) return;
    const panel = root.current?.querySelector<HTMLElement>('.readingOutlinePanel');
    const current = panel?.querySelector<HTMLElement>('[aria-current="location"]');
    const heading = panel?.querySelector<HTMLElement>('.readingOutlineHeading');
    if (!panel || !current || !heading) return;
    // Scroll only the contents panel, never the document being read.
    const item = current.getBoundingClientRect();
    const top = heading.getBoundingClientRect().bottom;
    const bottom = panel.getBoundingClientRect().bottom - parseFloat(getComputedStyle(panel).paddingBottom);
    if (item.top < top) panel.scrollTop -= top - item.top;
    else if (item.bottom > bottom) panel.scrollTop += item.bottom - bottom;
  }, [open, active]);

  if (!sections.length) return null;
  const activeIndex = Math.max(0, sections.findIndex(section => section.id === active));
  const position = String(activeIndex + 1).padStart(2, "0");
  const outline = (
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
        aria-label={`Разделы ${position} — оглавление статьи`}
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
        </span>{/* A real separator keeps the visible word and number distinct in label-in-name checks. */}{" "}
        <span className="readingOutlinePosition" aria-hidden="true">{position}</span>
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
              // Let the native hash update run first. Re-land explicitly: a
              // repeated link to the current hash need not scroll on its own.
              requestAnimationFrame(() => {
                const section = document.getElementById(id);
                section?.scrollIntoView({ block: "start", inline: "nearest" });
                const headingId = section?.getAttribute("aria-labelledby");
                if (headingId) document.getElementById(headingId)?.focus({ preventScroll: true });
              });
            }}
          >
            <span>{String(number).padStart(2, "0")}</span><strong>{heading}</strong>
          </a>
        ))}
      </nav>
    </div>
  );
  // The server/failed-hydration view is an ordinary list of hash links, so it
  // works even if scripts are enabled but blocked. The inert button is hidden
  // until hydration moves it into the reserved header slot.
  const slot = hydrated ? document.getElementById("reading-outline-slot") : null;
  if (slot) return createPortal(outline, slot);
  return (
    <>
      <nav className="sectionShell articleOutline" aria-label="Разделы статьи без JavaScript">
        {sections.map(({ id, number, heading }) => (
          <a key={id} href={`#${id}`}><span>{number}</span><strong>{heading}</strong></a>
        ))}
      </nav>
      {outline}
    </>
  );
}
