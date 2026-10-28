import Link from "next/link";
import type { ArticleBlock, ArticleMeasurementRef, FilmArticle } from "@/lib/film-package";
import type { ArticleMeasurementView, ArticleProjection } from "@/lib/film-article";
import { articleReadingMinutes } from "@/lib/film-article";
import type { SpoilerLevel } from "@/lib/spoilers";

type ArticleViewProps = {
  article: FilmArticle;
  /** Route slug of the film this article belongs to. */
  filmSlug: string;
  projection: ArticleProjection;
  spoilerLevel: SpoilerLevel;
  /** Renders a measurement from the committed dataset, never from prose. */
  describeMeasurement: (ref: ArticleMeasurementRef) => ArticleMeasurementView | undefined;
  /** Master timecode formatter, supplied by the edition that owns the article. */
  formatTimecode: (seconds: number) => string;
};

const levelLabels: Record<SpoilerLevel, string> = {
  NONE: "без спойлеров",
  MINOR: "небольшие спойлеры",
  MAJOR: "значительные спойлеры",
  ENDING: "спойлеры к финалу",
  FULL: "полный разбор",
};

function MeasurementFigure({ view, text }: { view: ArticleMeasurementView; text: string }) {
  return (
    <figure className="articleMeasurement" aria-label={view.title}>
      <div className="articleMeasurementHead">
        <span className="microLabel">{view.title}</span>
        <strong>{view.primary}</strong>
      </div>
      <div className="articleMeasurementBody">
        <span>{view.secondary}</span>
        <span>{view.detail}</span>
      </div>
      <figcaption>{text}</figcaption>
    </figure>
  );
}

function ArticleBlockView({
  block,
  describeMeasurement,
  formatTimecode,
}: {
  block: ArticleBlock;
  describeMeasurement: ArticleViewProps["describeMeasurement"];
  formatTimecode: (seconds: number) => string;
}) {
  switch (block.kind) {
    case "paragraph":
      return <p className="articleParagraph">{block.text}</p>;
    case "subhead":
      return <h3 className="articleSubhead">{block.text}</h3>;
    case "pullquote":
      return (
        <blockquote className="articlePullquote">
          <p>{block.text}</p>
          {block.attribution ? <cite>{block.attribution}</cite> : null}
        </blockquote>
      );
    case "timeline":
      return (
        <ol className="articleTimeline" aria-label="Опорные точки разбора">
          {block.items.map((item) => (
            <li key={item.id}>
              <span className="articleTimecode">{formatTimecode(item.timestampSeconds)}</span>
              <p>{item.label}</p>
            </li>
          ))}
        </ol>
      );
    case "measurement": {
      const view = describeMeasurement(block.measurement);
      if (!view) return null;
      return <MeasurementFigure view={view} text={block.text} />;
    }
    case "measurement-table":
      return (
        <figure className="articleTableFigure">
          <figcaption>{block.caption}</figcaption>
          <table className="articleTable">
            <thead>
              <tr>
                {block.columns.map((column) => <th key={column} scope="col">{column}</th>)}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row) => {
                const view = describeMeasurement(row.measurement);
                if (!view) return null;
                return (
                  <tr key={row.id}>
                    <th scope="row">{row.label}</th>
                    <td>{view.primary}</td>
                    <td>{view.secondary}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </figure>
      );
    case "corrections":
      return (
        <figure className="articleTableFigure articleCorrections">
          <figcaption>{block.caption}</figcaption>
          <table className="articleTable">
            <thead>
              <tr>
                <th scope="col">Ходовое утверждение</th>
                <th scope="col">Что в кадре</th>
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row) => (
                <tr key={row.id}>
                  <th scope="row">{row.commonClaim}</th>
                  <td>{row.onScreen}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </figure>
      );
  }
}

export function ArticleView({
  article,
  filmSlug,
  projection,
  spoilerLevel,
  describeMeasurement,
  formatTimecode,
}: ArticleViewProps) {
  const { visibleSections, hiddenSections, nextHiddenLevel } = projection;
  const readingMinutes = articleReadingMinutes(article);
  const complete = hiddenSections === 0;

  return (
    <article className="articleShell">
      <header className="sectionShell articleHeader" id="article-top">
        <Link className="microLabel" href={`/films/${filmSlug}`}>← Разбор фильма</Link>
        <div className="sectionIndex">{article.kicker}</div>
        <h1 className="articleTitle">{article.title}</h1>
        <p className="articleStandfirst">{article.standfirst}</p>
        <div className="articleByline">
          <span>{article.byline.author}</span>
          <span>редакция {article.byline.editorialRevision}</span>
          <span>{readingMinutes} мин чтения</span>
          <span>точка зрения: {levelLabels[spoilerLevel]}</span>
        </div>
      </header>

      <nav className="sectionShell sectionRule articleOutline" aria-label="Разделы статьи">
        {visibleSections.map((section) => (
          <Link key={section.id} href={`#${section.id}`}>
            <span>{String(section.number).padStart(2, "0")}</span>
            <strong>{section.heading}</strong>
          </Link>
        ))}
      </nav>

      {hiddenSections > 0 ? (
        <p className="sectionShell spoilerOmissionNotice" aria-live="polite">
          Скрыто разделов: {hiddenSections}
          {nextHiddenLevel ? ` — следующий требует уровня «${levelLabels[nextHiddenLevel]}»` : ""}.
          Текст обрывается на том месте, где начинаются спойлеры, а не в случайной точке.
        </p>
      ) : null}

      {visibleSections.map((section) => (
        <section
          key={section.id}
          id={section.id}
          className="sectionShell sectionRule articleSection"
          aria-labelledby={`${section.id}-title`}
        >
          <div className="articleSectionHead">
            <div className="sectionIndex">{section.eyebrow}</div>
            <h2 id={`${section.id}-title`}>{section.heading}</h2>
            {section.standfirst ? <p className="sectionIntro">{section.standfirst}</p> : null}
          </div>
          <div className="articleBody">
            {section.blocks.map((block) => (
              <ArticleBlockView
                key={block.id}
                block={block}
                describeMeasurement={describeMeasurement}
                formatTimecode={formatTimecode}
              />
            ))}
          </div>
        </section>
      ))}

      {article.closing && complete ? (
        <footer className="sectionShell sectionRule articleClosing">
          <div className="sectionIndex">Редакция</div>
          <h2>{article.closing.heading}</h2>
          <p>{article.closing.text}</p>
        </footer>
      ) : null}
    </article>
  );
}
