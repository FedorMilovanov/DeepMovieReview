import Link from "next/link";

export default function NotFound() {
  return (
    <section className="sectionShell filmPageHero">
      <div className="sectionIndex">404 / NOT FOUND</div>
      <h1>Nothing in this frame.</h1>
      <p className="sectionIntro">The requested page does not exist or is not available.</p>
      <div className="heroActions">
        <Link className="buttonPrimary" href="/">Home</Link>
        <Link className="buttonGhost" href="/films">Films</Link>
      </div>
    </section>
  );
}
