"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useHydrated } from "@/lib/use-hydrated";

const NAV_LINKS = [
  { href: "/films", label: "Фильмы" },
  { href: "/#lenses", label: "Обзор" },
  { href: "/methodology", label: "Методология" },
] as const;

/**
 * Site header: low-contrast at top, gains a solid surface after the first
 * scroll; collapses to an accessible disclosure menu on narrow viewports.
 */
export function SiteHeader({diveHref}: {diveHref?:string}) {
  const pathname = usePathname();
  const observatory = pathname === "/" && Boolean(diveHref);
  const navLinks = diveHref ? [{href:diveHref,label:"DIVE"},...NAV_LINKS] : NAV_LINKS;
  const hydrated = useHydrated();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPathname, setMenuPathname] = useState(pathname);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [pendingAnchor, setPendingAnchor] = useState<{ pathname: string; hash: string } | null>(null);

  if (menuPathname !== pathname) {
    // Navigation resets the disclosure in the same render pass — the
    // render-time adjustment pattern from the React docs, no effect needed.
    setMenuPathname(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    let frame: number | null = null;
    const update = () => {
      frame = null;
      setScrolled(window.scrollY > 24);
    };
    const schedule = () => {
      if (frame === null) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      window.removeEventListener("scroll", schedule);
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, []);



  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  function linkProps(href: string) {
    const isCurrent = href === "/" ? pathname === "/" : pathname.startsWith(href);
    return isCurrent ? { "aria-current": "page" as const } : {};
  }

  // The router may commit a hash after this header closes, or render its target
  // after a cross-route navigation. Wait for both, preserve router history,
  // and stop if the destination never appears.
  useEffect(() => {
    if (!pendingAnchor) return;
    let frame = 0;
    const deadline = performance.now() + 5000;
    const attempt = () => {
      if (window.location.pathname === pendingAnchor.pathname && window.location.hash === pendingAnchor.hash) {
        const target = document.getElementById(pendingAnchor.hash.slice(1));
        if (target) {
          // Next's same-hash navigation may not scroll again after a reader has
          // moved away. Respect the destination's CSS scroll padding/margins.
          target.scrollIntoView({ block: "start", inline: "nearest" });
          target.focus({ preventScroll: true });
        }
        if (target && document.activeElement === target) {
          setPendingAnchor(null);
          return;
        }
      }
      if (performance.now() < deadline) frame = requestAnimationFrame(attempt);
      else setPendingAnchor(null);
    };
    frame = requestAnimationFrame(attempt);
    return () => cancelAnimationFrame(frame);
  }, [pendingAnchor]);

  function closeMenuAfterNavigation(href: string) {
    setMenuOpen(false);
    const destination = new URL(href, window.location.href);
    setPendingAnchor(destination.hash ? { pathname: destination.pathname, hash: destination.hash } : null);
  }

  return (
    <header className="siteHeader" data-scrolled={scrolled || undefined} data-observatory={observatory || undefined}>
      {/* The monogram is decoration: it is drawn by CSS, so the link's visible
          text is exactly "Deep Waters" and its accessible name can contain that
          text verbatim (WCAG 2.5.3, label in name). A text node here would put
          "DW" into the name or, worse, leave the name saying something the
          visible label does not. */}
      <Link className="brand" href="/" aria-label={observatory ? "Глубокие воды — на главную" : "Deep Waters — на главную"}>
        <span className="brandMark" aria-hidden="true">{observatory ? <svg viewBox="0 0 48 32" width="38" height="28" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M2 12c8-6 14-6 22 0s14 6 22 0M2 20c8-6 14-6 22 0s14 6 22 0"/></svg> : null}</span>
        <span className="brandText">{observatory ? "Глубокие воды" : "Deep Waters"}</span>
      </Link>
      <nav className="siteNav" aria-label="Основная навигация">
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href} {...linkProps(link.href)}>
            {link.label}
          </Link>
        ))}
      </nav>
      {/* The article's hydrated outline uses this reserved header slot. It never
          floats over a line of reading text; no-JS has its own article list. */}
      <div id="reading-outline-slot" className="readingOutlineSlot" />
      {!hydrated ? (
        <details className="siteMenuFallback">
          <summary>Меню</summary>
          <nav aria-label="Меню">
            {navLinks.map((link) => <Link key={link.href} href={link.href} {...linkProps(link.href)}>{link.label}</Link>)}
          </nav>
        </details>
      ) : null}
      {hydrated ? <button
        ref={menuButtonRef}
        type="button"
        className="menuButton"
        aria-expanded={menuOpen}
        aria-controls="site-menu"
        onClick={() => setMenuOpen((value) => !value)}
      >
        {menuOpen ? "Закрыть" : "Меню"}
      </button> : null}
      <nav
        id="site-menu"
        className="siteMenu"
        aria-label="Меню"
        data-open={menuOpen || undefined}
        inert={!menuOpen}
      >
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => closeMenuAfterNavigation(link.href)}
            {...linkProps(link.href)}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
