import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="siteHeader">
      <Link className="brand" href="/" aria-label="Глубокие воды — на главную">
        <span className="brandMark" aria-hidden="true">DW</span>
        <span className="brandText">Deep Waters</span>
      </Link>
      <nav className="siteNav" aria-label="Основная навигация">
        <Link href="/films">Фильмы</Link>
        <Link href="/#lenses">Обзор</Link>
        <Link href="/methodology">Методология</Link>
      </nav>
    </header>
  );
}
