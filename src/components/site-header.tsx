import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="siteHeader">
      <Link className="brand" href="/" aria-label="DeepMovieReview home">
        <span className="brandMark" aria-hidden="true">DMR</span>
        <span className="brandText">DeepMovieReview</span>
      </Link>
      <nav className="siteNav" aria-label="Primary navigation">
        <Link href="/films">Films</Link>
        <Link href="/#lenses">Explore</Link>
        <Link href="/methodology">Methodology</Link>
      </nav>
    </header>
  );
}
