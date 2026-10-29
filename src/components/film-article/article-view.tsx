import Link from "next/link";
import type { ArticleBlock, ArticleMeasurementRef, FilmArticle } from "@/lib/film-package";
import { illustrationView } from "@/data/film-illustrations";
import type { ArticleMeasurementView, ArticleProjection } from "@/lib/film-article";
import { articleReadingMinutes } from "@/lib/film-article";
import { withSpoilerQuery, type SpoilerLevel } from "@/lib/spoilers";

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
  /**
   * Timecode of a canonical evidence record, already formatted.
   *
   * A storyboard panel names its evidence and nothing else: the number under the
   * drawing is read from the record, so it cannot disagree with the moment.
   */
  timecodeForEvidence: (evidenceId: string) => string | undefined;
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

/**
 * An illustration inside the argument.
 *
 * A plain `<picture>` again: AVIF first, JPEG as the guaranteed fallback, no
 * build-time image service. The caption is not decoration — it is where the
 * picture admits it is a drawing and not a frame of the film, and the validator
 * refuses the block if that sentence is missing.
 */
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
          alt={view.alt}
          width={view.width}
          height={view.height}
          loading="lazy"
          decoding="async"
        />
      </picture>
      <figcaption>{block.caption}</figcaption>
    </figure>
  );
}

function Storyboard({
  block,
  timecodeForEvidence,
}: {
  block: Extract<ArticleBlock, { kind: "storyboard" }>;
  timecodeForEvidence: ArticleViewProps["timecodeForEvidence"];
}) {
  return (
    <section className="articleStoryboard" aria-label={block.title}>
      <p className="microLabel">{block.title}</p>
      <ol className="articleStoryboardPanels">
        {block.panels.map((panel, index) => {
          const view = illustrationView(panel.assetId);
          if (!view) return null;
          return (
            <li key={panel.id} className="articleStoryboardPanel">
              <div className="articleStoryboardFrame">
                <picture>
                  {view.sources.map((source) => (
                    <source key={source.type} srcSet={source.srcSet} sizes="(max-width: 720px) 50vw, 240px" type={source.type} />
                  ))}
                  <img
                    src={view.src}
                    srcSet={view.srcSet}
                    sizes="(max-width: 720px) 50vw, 240px"
                    alt={view.alt}
                    width={view.width}
                    height={view.height}
                    loading="lazy"
                    decoding="async"
                  />
                </picture>
                <span className="articleStoryboardNumber">{index + 1}</span>
              </div>
              <p className="articleStoryboardTime">{timecodeForEvidence(panel.evidenceId) ?? "—"}</p>
              <p className="articleStoryboardLabel">{panel.label}</p>
            </li>
          );
        })}
      </ol>
    </section>
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
  timecodeForEvidence,
}: {
  block: ArticleBlock;
  describeMeasurement: ArticleViewProps["describeMeasurement"];
  formatTimecode: (seconds: number) => string;
  timecodeForEvidence: ArticleViewProps["timecodeForEvidence"];
}) {
  switch (block.kind) {
    case "paragraph":
      return <p className="articleParagraph">{block.text}</p>;
    case "aside":
      return (
        <aside className="articleAside" aria-label={block.label}>
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
    case "storyboard":
      return <Storyboard block={block} timecodeForEvidence={timecodeForEvidence} />;
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
  timecodeForEvidence,
  moduleHeadings,
}: ArticleViewProps) {
  const { visibleSections, hiddenSections, nextHiddenLevel } = projection;
  const readingMinutes = articleReadingMinutes(article);
  const complete = hiddenSections === 0;

  return (
    <article className="articleShell">
      <header className="sectionShell articleHeader" id="article-top">
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
                timecodeForEvidence={timecodeForEvidence}
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
