"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

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
    // Отложенное закрытие: синхронный setState в effect запрещён линт-правилом.
    const raf = requestAnimationFrame(() => {
      setMenuOpen((open) => (open ? false : open));
    });
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

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

  return (
    <header className="siteHeader" data-scrolled={scrolled || undefined}>
      <Link className="brand" href="/" aria-label="Глубокие воды — на главную">
        <span className="brandMark" aria-hidden="true">DW</span>
        <span className="brandText">Deep Waters</span>
      </Link>
      <nav className="siteNav" aria-label="Основная навигация">
        {NAV_LINKS.map((link) => (
          <Link key={link.href} href={link.href} {...linkProps(link.href)}>
            {link.label}
          </Link>
        ))}
      </nav>
      <button
        ref={menuButtonRef}
        type="button"
        className="menuButton"
        aria-expanded={menuOpen}
        aria-controls="site-menu"
        onClick={() => setMenuOpen((value) => !value)}
      >
        {menuOpen ? "Закрыть" : "Меню"}
      </button>
      <nav
        id="site-menu"
        className="siteMenu"
        aria-label="Меню"
        data-open={menuOpen || undefined}
        inert={!menuOpen}
      >
        {NAV_LINKS.map((link) => (
          <Link key={link.href} href={link.href} {...linkProps(link.href)}>
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
