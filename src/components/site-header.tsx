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
export function SiteHeader() {
  const pathname = usePathname();
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
    <header className="siteHeader" data-scrolled={scrolled || undefined}>
      {/* The monogram is decoration: it is drawn by CSS, so the link's visible
          text is exactly "Deep Waters" and its accessible name can contain that
          text verbatim (WCAG 2.5.3, label in name). A text node here would put
          "DW" into the name or, worse, leave the name saying something the
          visible label does not. */}
      <Link className="brand" href="/" aria-label="Deep Waters — на главную">
        <span className="brandMark" aria-hidden="true" />
        <span className="brandText">Deep Waters</span>
      </Link>
      <nav className="siteNav" aria-label="Основная навигация">
        {NAV_LINKS.map((link) => (
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
            {NAV_LINKS.map((link) => <Link key={link.href} href={link.href} {...linkProps(link.href)}>{link.label}</Link>)}
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
        {NAV_LINKS.map((link) => (
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
