"use client";

import Link from "next/link";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#050505", color: "#f2eee8", fontFamily: "Arial, Helvetica, sans-serif" }}>
        <main
          role="alert"
          aria-labelledby="global-error-title"
          style={{
            minHeight: "100svh",
            display: "grid",
            alignContent: "center",
            gap: "1.25rem",
            width: "min(92vw, 900px)",
            marginInline: "auto",
          }}
        >
          <p style={{ margin: 0, opacity: 0.6, letterSpacing: "0.12em", textTransform: "uppercase", fontSize: "0.72rem" }}>
            DeepMovieReview / fatal application error
          </p>
          <h1 id="global-error-title" style={{ margin: 0, maxWidth: "12ch", fontSize: "clamp(2.5rem, 8vw, 6rem)", lineHeight: 0.94 }}>
            The application shell could not recover this view.
          </h1>
          <p style={{ margin: 0, maxWidth: "50rem", opacity: 0.72, lineHeight: 1.6 }}>
            Retry the render. If the failure persists, return to the homepage and continue from a clean route.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
            <button
              type="button"
              onClick={reset}
              style={{
                padding: "0.8rem 1rem",
                border: "1px solid currentColor",
                background: "#f2eee8",
                color: "#050505",
                cursor: "pointer",
              }}
            >
              Retry
            </button>
            <Link
              href="/"
              style={{
                padding: "0.8rem 1rem",
                border: "1px solid #777",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              Home
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
