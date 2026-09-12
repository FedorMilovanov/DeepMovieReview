"use client";

import Link from "next/link";

export default function AppError({ reset }: { reset: () => void }) {
  return (
    <section className="sectionShell routeError" aria-labelledby="route-error-title">
      <div role="alert" aria-atomic="true">
        <div className="sectionIndex">Ошибка / Восстановимо</div>
        <h1 id="route-error-title">Этот кадр не удалось собрать.</h1>
        <p className="sectionIntro">
          Повторите попытку, вернитесь к индексу фильмов или на главную страницу.
        </p>
      </div>
      <div className="routeErrorActions">
        <button className="buttonPrimary" type="button" onClick={reset}>
          Повторить
        </button>
        <Link className="buttonGhost" href="/films">Фильмы</Link>
        <Link className="buttonGhost" href="/">На главную</Link>
      </div>
    </section>
  );
}
