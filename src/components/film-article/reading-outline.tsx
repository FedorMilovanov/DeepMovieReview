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
    const observer = new IntersectionObserver((entries) => {
      const current = entries.filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (current) setActive(current.target.id);
    }, { rootMargin: "-15% 0px -65% 0px" });
    sections.forEach(({ id }) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
    return () => observer.disconnect();
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
          {sections.map(({ id }) => <i key={id} data-active={id === active} />)}
        </span>
      </button>
      <nav id="reading-outline-panel" className="articleOutline readingOutlinePanel" hidden={!open} aria-label="Разделы статьи">
        <div className="readingOutlineHeading">В этом разборе <span>{sections.length}</span></div>
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
