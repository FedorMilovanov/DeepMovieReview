"use client";

import Link from "next/link";

export default function AppError({ reset }: { reset: () => void }) {
  return (
    <section className="sectionShell routeError" aria-labelledby="route-error-title">
      <div role="alert" aria-atomic="true">
        <div className="sectionIndex">ERROR / RECOVERABLE</div>
        <h1 id="route-error-title">This view could not be assembled.</h1>
        <p className="sectionIntro">
          Retry this view, return to the film index, or go back to the homepage.
        </p>
      </div>
      <div className="routeErrorActions">
        <button className="buttonPrimary" type="button" onClick={reset}>
          Retry
        </button>
        <Link className="buttonGhost" href="/films">Films</Link>
        <Link className="buttonGhost" href="/">Home</Link>
      </div>
    </section>
  );
}
