import Link from "next/link";

export default function NotFound() {
  return (
    <section className="sectionShell filmPageHero">
      <div className="sectionIndex">404 / Не найдено</div>
      <h1>В этом кадре пусто.</h1>
      <p className="sectionIntro">Запрошенная страница не существует или недоступна.</p>
      <div className="heroActions">
        <Link className="buttonPrimary" href="/">На главную</Link>
        <Link className="buttonGhost" href="/films">Фильмы</Link>
      </div>
    </section>
  );
}
