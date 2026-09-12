import type { Metadata } from "next";
import { FilmMediaFrame } from "@/components/film-media-frame";
import { FilmTransitionLink } from "@/components/film-transition-link";
import { filmPackages } from "@/data/film-registry";
import { isPreviewContentEnabled } from "@/data/site-config";

export const metadata: Metadata = {
  title: "Фильмы",
  description: "Разборы фильмов «Глубокие воды».",
};

const statusLabels = {
  fixture: "фикстура",
  draft: "черновик",
  published: "опубликовано",
} as const;

function packageStatusLabel(filmPackage: (typeof filmPackages)[number]) {
  if (filmPackage.research?.state === "SECONDARY_SOURCES") return "исследовательский черновик · мастер не заблокирован";
  return statusLabels[filmPackage.film.status];
}

export default function FilmsPage() {
  const publishedPackages = filmPackages.filter((filmPackage) => filmPackage.film.status === "published");
  const previewContentEnabled = isPreviewContentEnabled();
  const isPrelaunch = publishedPackages.length === 0;
  const visiblePackages = previewContentEnabled ? filmPackages : publishedPackages;

  return (
    <section className="sectionShell filmIndexHero" aria-labelledby="films-title">
      <div className="sectionIndex">Фильмы / Индекс</div>
      <h1 id="films-title">Фильмы</h1>
      <p className="sectionIntro">
        {isPrelaunch
          ? "Сначала строится оболочка платформы. Реальные разборы появятся в этом индексе как структурированные пакеты контента."
          : "Опубликованные разборы связывают историю, людей, отношения, идеи, форму, моральную аргументацию и библейский синтез."}
      </p>
      {isPrelaunch && previewContentEnabled ? (
        <p className="fixtureNotice">
          Предпросмотр включает структурные фикстуры и исследовательские черновики реальных фильмов. Черновики по вторичным источникам не являются каноническими разборами и остаются закрытыми от публичной индексации до блокировки мастера и кадровой проверки.
        </p>
      ) : null}
      {visiblePackages.length === 0 ? (
        <p className="fixtureNotice">Опубликованных разборов пока нет.</p>
      ) : null}
      <div className="filmList">
        {visiblePackages.map((filmPackage, index) => {
          const { film, modules } = filmPackage;
          return (
            <FilmTransitionLink
              className="filmRow"
              href={`/films/${film.slug}`}
              key={film.slug}
              slug={film.slug}
            >
              <span className="filmRowIndex">{String(index + 1).padStart(3, "0")}</span>
              <FilmMediaFrame slug={film.slug} variant="index" />
              <span className="filmRowTitle"><strong>{film.title}</strong></span>
              <span className="filmRowMeta">
                {film.year} · {packageStatusLabel(filmPackage)} · {modules.length} модулей
              </span>
            </FilmTransitionLink>
          );
        })}
      </div>
    </section>
  );
}
