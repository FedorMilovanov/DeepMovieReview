"use client";

import Link from "next/link";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="ru">
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
            DeepMovieReview · критическая ошибка приложения
          </p>
          <h1 id="global-error-title" style={{ margin: 0, maxWidth: "14ch", fontSize: "clamp(2.2rem, 7vw, 5rem)", lineHeight: 0.96 }}>
            Оболочка приложения не смогла восстановить этот кадр.
          </h1>
          <p style={{ margin: 0, maxWidth: "50rem", opacity: 0.72, lineHeight: 1.6 }}>
            Повторите рендер. Если сбой повторяется, вернитесь на главную и продолжите с чистого маршрута.
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
              Повторить
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
              На главную
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
