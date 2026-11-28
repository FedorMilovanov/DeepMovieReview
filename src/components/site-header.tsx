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
    const dismissOutside = (event: PointerEvent) => {
      if (!(event.target instanceof Node)) return;
      if (menuButtonRef.current?.contains(event.target) || document.getElementById("site-menu")?.contains(event.target)) return;
      setMenuOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", dismissOutside);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", dismissOutside);
    };
  }, [menuOpen]);

  function linkProps(href: string) {
    const isCurrent = !href.includes("#") && pathname === href;
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
      <Link className="brand" href="/" aria-label="Deep Waters / Глубокие воды — на главную">
        <span className="brandMark" aria-hidden="true"><svg viewBox="0 0 48 32" width="38" height="28" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="24" cy="16" r="13"/><path d="M11 16h26M24 3v26" opacity=".35"/><path d="M4 16c7-7 13-7 20 0s13 7 20 0M4 22c7-7 13-7 20 0s13 7 20 0" strokeLinecap="round"/><circle cx="24" cy="16" r="3" fill="currentColor" stroke="none"/></svg></span>
        <span className="brandText"><strong lang="en">DEEP WATERS</strong><small>Глубокие воды</small></span>
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
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">{menuOpen?<path d="m6 6 12 12M18 6 6 18"/>:<path d="M4 7h16M4 12h16M4 17h11"/>}</svg><span>{menuOpen ? "Закрыть" : "Меню"}</span>
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
