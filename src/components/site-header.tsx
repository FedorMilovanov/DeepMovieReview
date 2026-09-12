import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="siteHeader">
      <Link className="brand" href="/" aria-label="DeepMovieReview — на главную">
        <span className="brandMark" aria-hidden="true">DMR</span>
        <span className="brandText">DeepMovieReview</span>
      </Link>
      <nav className="siteNav" aria-label="Основная навигация">
        <Link href="/films">Фильмы</Link>
        <Link href="/#lenses">Обзор</Link>
        <Link href="/methodology">Методология</Link>
      </nav>
    </header>
  );
}
