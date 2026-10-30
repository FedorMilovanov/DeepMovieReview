import { ReadingOutline } from "./reading-outline";
import { ArticleTable } from "./article-table";
import Link from "next/link";
import type { ArticleBlock, ArticleMeasurementRef, FilmArticle } from "@/lib/film-package";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { illustrationView } from "@/data/film-illustrations";
import type { ArticleMeasurementView, ArticleProjection } from "@/lib/film-article";
import { articleReadingMinutes } from "@/lib/film-article";
import { withSpoilerQuery, type SpoilerLevel } from "@/lib/spoilers";

type ArticleViewProps = {
  article: FilmArticle;
  /** Route slug of the film this article belongs to. */
  filmSlug: string;
  /**
   * The film's own title, for the middle crumb. The article data carries a
   * kicker ("Разбор / залоченное издание") and never the film title, so the
   * page passes it in rather than the trail guessing from prose.
   */
  filmTitle: string;
  projection: ArticleProjection;
  spoilerLevel: SpoilerLevel;
  /** Renders a measurement from the committed dataset, never from prose. */
  describeMeasurement: (ref: ArticleMeasurementRef) => ArticleMeasurementView | undefined;
  /** Master timecode formatter, supplied by the edition that owns the article. */
  formatTimecode: (seconds: number) => string;
  /**
   * Module headings keyed by module id, so a section's analytical links read as
   * titles rather than as ids. Supplied by the page from the package itself; the
   * article data never repeats a module's own wording.
   */
  moduleHeadings?: Record<string, string>;
};

const levelLabels: Record<SpoilerLevel, string> = {
  NONE: "без спойлеров",
  MINOR: "небольшие спойлеры",
  MAJOR: "значительные спойлеры",
  ENDING: "спойлеры к финалу",
  FULL: "полный разбор",
};

/** `2026-10-28` → `28.10.2026`. Kept local: the article has no date formatter of its own. */
function formatSignatureDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${day}.${month}.${year}`;
}

/** Original drawing. Provenance stays in the model and accessible alternative, not a prose caption. */
function ArticleIllustration({
  block,
}: {
  block: Extract<ArticleBlock, { kind: "illustration" }>;
}) {
  const view = illustrationView(block.assetId);
  if (!view) return null;
  return (
    <figure className="articleIllustration" data-layout={block.layout ?? "wide"}>
      <picture>
        {view.sources.map((source) => (
          <source key={source.type} srcSet={source.srcSet} sizes={view.sizes} type={source.type} />
        ))}
        <img
          src={view.src}
          srcSet={view.srcSet}
          sizes={view.sizes}
          alt={`Авторская иллюстрация, не кадр из фильма. ${view.alt}`}
          width={view.width}
          height={view.height}
          loading="lazy"
          decoding="async"
        />
      </picture>
    </figure>
  );
}

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
    case "aside":
      return (
        <aside className="articleAside" role="note" aria-label={block.label}>
          <p className="microLabel">{block.label}</p>
          <p>{block.text}</p>
        </aside>
      );
    case "illustration":
      return <ArticleIllustration block={block} />;
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
        <ArticleTable blockId={block.id} caption={block.caption}>
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
        </ArticleTable>
      );
    case "corrections":
      return (
        <ArticleTable blockId={block.id} caption={block.caption} corrections>
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
        </ArticleTable>
      );
  }
}

export function ArticleView({
  article,
  filmSlug,
  filmTitle,
  projection,
  spoilerLevel,
  describeMeasurement,
  formatTimecode,
  moduleHeadings,
}: ArticleViewProps) {
  const { visibleSections, hiddenSections, nextHiddenLevel } = projection;
  const readingMinutes = articleReadingMinutes(article);
  const complete = hiddenSections === 0;

  return (
    <article className="articleShell">
      <header className="sectionShell articleHeader" id="article-top">
        <Breadcrumbs
          trail={[
            { label: "Фильмы", href: "/films" },
            { label: filmTitle, href: `/films/${filmSlug}` },
            { label: "Разбор" },
          ]}
        />
        <div className="articleHeaderLinks">
          <Link className="microLabel" href={`/films/${filmSlug}`}>← Разбор фильма</Link>
          <Link className="microLabel" href={`/films/${filmSlug}/making`}>Как это снимали →</Link>
        </div>
        <div className="sectionIndex">{article.kicker}</div>
        <h1 className="articleTitle">{article.title}</h1>
        <p className="articleStandfirst">{article.standfirst}</p>
        <div className="articleByline">
          <span>{article.byline.author}</span>
          <span>
            {article.byline.reviewedAt
              ? `редакция ${article.byline.editorialRevision} · ${formatSignatureDate(article.byline.reviewedAt)}`
              : `черновик · ${article.byline.editorialRevision}`}
          </span>
          <span>{readingMinutes} мин чтения</span>
          <span>точка зрения: {levelLabels[spoilerLevel]}</span>
        </div>
      </header>

      <ReadingOutline sections={visibleSections.map(({ id, number, heading }) => ({ id, number, heading }))} />
      <noscript>
        <nav className="sectionShell articleOutline" aria-label="Разделы статьи без JavaScript">
          {visibleSections.map(({ id, number, heading }) => (
            <a key={id} href={`#${id}`}><span>{number}</span><strong>{heading}</strong></a>
          ))}
        </nav>
      </noscript>

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
            <h2 id={`${section.id}-title`} tabIndex={-1}>{section.heading}</h2>
            {section.standfirst ? <p className="sectionIntro">{section.standfirst}</p> : null}
            {section.moduleIds?.length ? (
              <div className="articleModuleLinks">
                <span className="microLabel">
                  {section.moduleIds.length > 1
                    ? "Аналитические модули этого раздела"
                    : "Аналитический модуль этого раздела"}
                </span>
                <ul>
                  {section.moduleIds.map((moduleId) => (
                    <li key={moduleId}>
                      <Link
                        className="articleModuleLink"
                        href={`${withSpoilerQuery(`/films/${filmSlug}`, spoilerLevel)}#${moduleId}`}
                      >
                        {moduleHeadings?.[moduleId] ?? moduleId}
                        <span aria-hidden="true">→</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
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
