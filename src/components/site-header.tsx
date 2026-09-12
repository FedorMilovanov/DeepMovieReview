"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteHeader() {
  const pathname = usePathname();

  function linkProps(href: string) {
    const isCurrent = href === "/" ? pathname === "/" : pathname.startsWith(href);
    return isCurrent ? { "aria-current": "page" as const } : {};
  }

  return (
    <header className="siteHeader">
      <Link className="brand" href="/" aria-label="Глубокие воды — на главную">
        <span className="brandMark" aria-hidden="true">DW</span>
        <span className="brandText">Deep Waters</span>
      </Link>
      <nav className="siteNav" aria-label="Основная навигация">
        <Link href="/films" {...linkProps("/films")}>Фильмы</Link>
        <Link href="/#lenses">Обзор</Link>
        <Link href="/methodology" {...linkProps("/methodology")}>Методология</Link>
      </nav>
    </header>
  );
}
