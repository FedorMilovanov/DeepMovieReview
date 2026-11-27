import type { ProductionSource } from "@/lib/production-dossier";
import { EvidenceBasisLine } from "@/components/evidence-basis";
import { ReadingOutline } from "./reading-outline";
import { DiveEntry } from "./dive-entry";
import { ArticleTable } from "./article-table";
import { ArticleCorrectionTable } from "./article-correction-table";
import Link from "next/link";
import type {
  ArticleBlock,
  ArticleSection,
  ArticleMeasurementRef,
  EvidenceRecord,
  FilmArticle,
  FinalSynthesisModule,
} from "@/lib/film-package";
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
  synthesis?: FinalSynthesisModule;
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
  /**
   * Evidence records by id, for the blocks that show their own proof. The
   * article never stores a label or a timecode next to a claim: it stores the
   * id, and the record decides what the reader sees.
   */
  evidenceById?: ReadonlyMap<string, EvidenceRecord>;
  contextSourcesById?: ReadonlyMap<string, ProductionSource>;
};

/** Original drawing. Provenance stays in the model and accessible alternative, not a prose caption. */
function ArticleIllustration({
  block,
}: {
  block: Extract<ArticleBlock, { kind: "illustration" }>;
}) {
  const view = illustrationView(block.assetId);
  if (!view) return null;
  return (
    <figure id={block.id} className="articleIllustration" data-layout={block.layout ?? "wide"}>
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
      <figcaption>{block.caption}</figcaption>
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

/**
 * Two readings of the same second, side by side, with the open question below.
 *
 * The panel deliberately has no winner row, no meter and no percentage: what a
 * comparison of this kind can honestly deliver is the shape of the disagreement
 * plus the proof each side stands on.
 */
function ArticleDuel({
  block,
  evidenceById,
  filmSlug,
  spoilerLevel,
  formatTimecode,
}: {
  block: Extract<ArticleBlock, { kind: "duel" }>;
  evidenceById?: ReadonlyMap<string, EvidenceRecord>;
  filmSlug: string;
  spoilerLevel: SpoilerLevel;
  formatTimecode: (seconds: number) => string;
}) {
  return (
    <section id={block.id} className="articleDuel" aria-label={block.label}>
      <p className="articleDuelLabel">{block.label}</p>
      <p className="articlePerspectiveHint">Откройте разные перспективы и сравните, что меняется в прочтении сцены.</p>
      <h3 className="articleDuelQuestion">{block.question}</h3>
      <div className="articleDuelSides">
        {block.sides.map((side) => (
          <details className="articleDuelSide" key={side.id} id={side.id}>
            <summary>{side.label}</summary>
            <p>{side.reading}</p>
            <ul className="articleDuelEvidence" aria-label="Опора этой стороны">
              {side.evidenceIds.map((id) => {
                const record = evidenceById?.get(id);
                if (!record) return null;
                return (
                  <li key={id}>
                    <a href={`${withSpoilerQuery(`/films/${filmSlug}`, spoilerLevel)}#evidence-${record.id}`}>
                      {record.timestampSeconds !== undefined ? (
                        <span className="articleDuelTime">{formatTimecode(record.timestampSeconds)} · </span>
                      ) : null}
                      {record.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </details>
        ))}
      </div>
      <p className="articleDuelOpen">
        <span className="microLabel">Остаётся открытым</span>
        {block.open}
      </p>
    </section>
  );
}

function ArticleBlockView({
  block,
  filmSlug,
  spoilerLevel,
  describeMeasurement,
  evidenceById,
  contextSourcesById,
  formatTimecode,
}: {
  block: ArticleBlock;
  filmSlug: string;
  spoilerLevel: SpoilerLevel;
  describeMeasurement: ArticleViewProps["describeMeasurement"];
  evidenceById?: ReadonlyMap<string, EvidenceRecord>;
  contextSourcesById?: ReadonlyMap<string, ProductionSource>;
  formatTimecode: (seconds: number) => string;
}) {
  switch (block.kind) {
    case "duel":
      return <ArticleDuel block={block} evidenceById={evidenceById} filmSlug={filmSlug} spoilerLevel={spoilerLevel} formatTimecode={formatTimecode} />;
    case "paragraph": {
      const records = (ids: string[]) => ids.flatMap((id) => {
        const record = evidenceById?.get(id);
        return record ? [record] : [];
      });
      const supports = records(block.support?.evidenceIds ?? []);
      const counter = records(block.support?.counterevidenceIds ?? []);
      return (
        <>
          <p id={block.id} data-reading-block className="articleParagraph">{block.text}</p>
          {supports.length || counter.length || block.contextSourceIds?.length ? (
            <details className="articleSupport">
              <summary>Сцена и источники</summary>
              <ul>
                {[...supports.map(record => ({ record, counter: false })), ...counter.map(record => ({ record, counter: true }))].map(({ record, counter }, index) => (
                  <li key={index}>
                    <span>{record.timestampSeconds === undefined ? "—" : formatTimecode(record.timestampSeconds)}</span>
                    <div>
                      <a href={`${withSpoilerQuery(`/films/${filmSlug}`, spoilerLevel)}#evidence-${record.id}`}>{counter ? "Контрдовод: " : ""}{record.label}</a>
                      <p>{record.observation}</p>
                      {record.basis ? <EvidenceBasisLine basis={record.basis} /> : <small>Материал проверки не записан.</small>}
                      {record.id === "truman-ev-rain" && filmSlug === "the-truman-show" ? <a href="https://github.com/FedorMilovanov/DeepMovieReview/blob/main/docs/72-FILM-001-DIRECT-MASTER-RECHECK.md">Дополнительная сверка оригинала от 4 ноября 2026 года</a> : null}
                    </div>
                  </li>
                ))}
              </ul>
              {block.contextSourceIds?.length ? (
                <div className="articleContextSources">
                  <strong>Контекст, не экранное доказательство:</strong>{" "}
                  {block.contextSourceIds.flatMap((id) => {
                    const source = contextSourcesById?.get(id);
                    return source ? [<a key={id} href={source.url}>{source.label} · {source.publisher}</a>] : [];
                  })}
                </div>
              ) : null}
            </details>
          ) : null}
        </>
      );
    }
    case "aside":
      return (
        <aside id={block.id} className="articleAside" role="note" aria-label={block.label}>
          <p className="microLabel">{block.label}</p>
          <p>{block.text}</p>
        </aside>
      );
    case "illustration":
      return <ArticleIllustration block={block} />;
    case "subhead":
      return <h3 id={block.id} className="articleSubhead">{block.text}</h3>;
    case "pullquote":
      return (
        <blockquote id={block.id} className="articlePullquote">
          <p>{block.text}</p>
          {block.attribution ? <cite>{block.attribution}</cite> : null}
        </blockquote>
      );
    case "timeline": {
      function anchorDetail(item: Extract<ArticleBlock, { kind: "timeline" }>["items"][number]) {
        const record = evidenceById?.get(item.evidenceId);
        return (
          <>
            <span className="articleTimecode">{formatTimecode(item.timestampSeconds)}</span>
            <p>{item.label}</p>
            {record ? (
              <>
                <a className="articleTimelineBasisLabel" href={`${withSpoilerQuery(`/films/${filmSlug}`, spoilerLevel)}#evidence-${record.id}`}>{record.label}</a>
                {record.basis ? <EvidenceBasisLine basis={record.basis} /> : <small>Материал проверки не записан.</small>}
              </>
            ) : null}
          </>
        );
      }
      const withoutStill = block.items.filter(item => !item.still);
      return (
        <div id={block.id} className="articleSceneSequence" hidden={!block.items.length}>
          {block.items.map(item => {
            const still = item.still;
            if (!still) return null;
            return (
              <figure id={item.id} className="articleSceneStill" key={item.id}>
                <picture>
                  <source type="image/avif" srcSet={still.avifSrc} />
                  <img src={still.src} width={still.width} height={still.height} alt={still.alt} loading="lazy" decoding="async" />
                </picture>
                <figcaption>
                  <span>Кадр фильма · {still.caption}</span>
                  <small>{still.credit}</small>
                  <details className="articleSupport">
                    <summary>Таймкод и основание</summary>
                    {anchorDetail(item)}
                    {still.samplingKind === "grid" ? (
                      <small>Отметка сетки {formatTimecode(still.sampleTimeSeconds)} · шаг {still.samplingIntervalSeconds} с; время кадра может отличаться.</small>
                    ) : still.samplingKind === "clip" ? (
                      <small>Кадр из фрагмента {still.clip.file} · примерно {formatTimecode(still.sampleTimeSeconds)}; точный PTS не удостоверен.</small>
                    ) : (
                      <small>Выборка исходного MKV около {formatTimecode(still.sampleTimeSeconds)}; точный PTS не удостоверен.</small>
                    )}
                  </details>
                </figcaption>
              </figure>
            );
          })}
          {withoutStill.length ? (
            <details className="articleSupport">
              <summary>Другие моменты сцены</summary>
              <ol className="articleSceneReferences">
                {withoutStill.map(item => <li id={item.id} key={item.id}><div>{anchorDetail(item)}</div></li>)}
              </ol>
            </details>
          ) : null}
        </div>
      );
    }
    case "measurement": {
      const view = describeMeasurement(block.measurement);
      if (!view) return null;
      return <details id={block.id} className="articleVerdictContext"><summary>Как измеряли этот эпизод</summary><MeasurementFigure view={view} text={block.text} /></details>;
    }
    case "measurement-table":
      return (
        <details id={block.id} className="articleVerdictContext">
          <summary>Монтажные измерения</summary>
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
                <tr key={row.id} id={row.id}>
                  <th scope="row">
                    {row.label}
                    {/* The span and the rate belong to the row, not to a hover
                        title: a reader comparing a 65-second window with a
                        four-minute one should not have to divide. */}
                    <small className="articleTableNote">{view.detail}</small>
                  </th>
                  <td>{view.primary}</td>
                  <td>{view.secondary}</td>
                </tr>
              );
            })}
          </tbody>
          </ArticleTable>
        </details>
      );
    case "corrections":
      return <details id={block.id} className="articleVerdictContext"><summary>Редакционные уточнения к распространённым пересказам</summary><ArticleCorrectionTable block={block} filmSlug={filmSlug} spoilerLevel={spoilerLevel}
        evidenceById={evidenceById} describeMeasurement={describeMeasurement} /></details>;
  }
}

/** A visual interpretation of the opening evidence, not a reconstruction of a shot. */
function OpeningKnowledgeDiagram() {
  return (
    <figure className="articleKnowledgeDiagram">
      <svg viewBox="0 0 320 246" width="100%" role="img" aria-labelledby="truman-opening-diagram-title truman-opening-diagram-desc">
        <title id="truman-opening-diagram-title">Предмет и объяснение</title>
        <desc id="truman-opening-diagram-desc">Два независимых входа: наблюдаемый осветительный прибор с надписью Sirius и сообщение о детали самолёта. Их сопоставление создаёт вопрос о доверии к объяснению.</desc>
        <g fill="none" stroke="currentColor" strokeWidth="1.25">
          <rect x="10" y="12" width="144" height="82" rx="5" />
          <rect x="166" y="12" width="144" height="82" rx="5" />
          <path d="M82 94 V126 H160 M238 94 V126 H160 V158 M155 151 L160 158 L165 151" />
          <rect x="44" y="158" width="232" height="72" rx="5" />
        </g>
        <g textAnchor="middle" fill="currentColor" fontSize="13">
          <text x="82" y="34">Что видно</text>
          <text x="82" y="58" fontSize="20" fontWeight="bold">Sirius</text>
          <text x="82" y="78" fontSize="11">Осветительный прибор</text>
          <text x="238" y="34">Что говорят</text>
          <text x="238" y="57">Деталь</text>
          <text x="238" y="76">самолёта</text>
          <text x="160" y="183" fontSize="16" fontWeight="bold">Точка сомнения</text>
          <text x="160" y="206">Как проверить объяснение?</text>
        </g>
      </svg>
      <figcaption>Авторская схема прочтения: различие между наблюдением и готовым объяснением. Не план камеры и не кадр фильма.</figcaption>
    </figure>
  );
}

/** Editorial placement, using only items that survived the server spoiler/rights projection. */
const trumanStillPlacement: Record<string, string> = {
  "truman-article-anchor-rain": "truman-article-machine-rain",
  "truman-article-anchor-ghost": "truman-article-machine-4",
  "truman-article-anchor-newspaper": "truman-article-machine-4",
  "truman-article-anchor-elevator": "truman-article-machine-5",
  "truman-article-anchor-sylvia": "truman-article-cast-sylvia",
  "truman-article-bond-tools": "truman-article-bonds-marriage-2",
  "truman-article-bond-held": "truman-article-bonds-marriage-2",
  "truman-article-bond-reunion": "truman-article-bonds-friendship-3",
  "truman-article-anchor-mococoa": "truman-article-props-grater",
  "truman-article-anchor-knife": "truman-article-props-grater",
  "truman-article-anchor-wall": "truman-article-props-ladder",
  "truman-article-anchor-setting-sail": "truman-article-decision-4",
  "truman-article-anchor-sail-number": "truman-article-decision-4",
  "truman-article-anchor-decision-exit": "truman-article-decision-5",
  "truman-article-anchor-seahaven": "truman-article-morality-2",
  "truman-article-anchor-nothing-left": "truman-article-morality-4",
};

function readingBlocks(section: ArticleSection): ArticleBlock[] {
  const targets = new Set(section.blocks.map(block => block.id));
  const placements = new Map<string, Extract<ArticleBlock, { kind: "timeline" }>["items"]>();
  const rest = section.blocks.map(block => {
    if (block.kind !== "timeline") return block;
    const items = block.items.filter(item => {
      const target = trumanStillPlacement[item.id];
      if (!item.still || !target || !targets.has(target)) return true;
      placements.set(target, [...(placements.get(target) ?? []), item]);
      return false;
    });
    return { ...block, items };
  });
  return rest.flatMap(block => {
    const items = placements.get(block.id);
    return items ? [block, { kind: "timeline" as const, id: block.id + "-frames", items }] : [block];
  });
}

function ArticleReadingBlock(props: Parameters<typeof ArticleBlockView>[0]) {
  return (
    <>
      <ArticleBlockView {...props} />
      {props.block.id === "truman-article-method-3" ? <OpeningKnowledgeDiagram /> : null}
      {props.block.id === "truman-article-method-4" && props.evidenceById?.has("truman-ev-light") && props.evidenceById.has("truman-ev-light-explanation") ? (
        <DiveEntry observation={props.evidenceById.get("truman-ev-light")!.observation}
          report={props.evidenceById.get("truman-ev-light-explanation")!.observation} />
      ) : null}
    </>
  );
}

export function ArticleView({
  article,
  filmSlug,
  filmTitle,
  projection,
  synthesis,
  spoilerLevel,
  describeMeasurement,
  evidenceById,
  contextSourcesById,
  formatTimecode,
  moduleHeadings,
}: ArticleViewProps) {
  const { visibleSections, hiddenSections, nextHiddenLevel } = projection;
  const pathname = `/films/${filmSlug}`;
  const nextSection = article.sections[visibleSections.length];
  const readingMinutes = articleReadingMinutes(article, projection);
  const complete = hiddenSections === 0;
  const readingSections = [
    ...visibleSections.map(({ id, number, heading }) => ({ id, number, heading })),
    ...(complete && synthesis ? [{ id: "article-verdict", number: article.sections.length + 1, heading: synthesis.heading }] : []),
  ];

  return (
    <article className="articleShell">
      <header className="sectionShell articleHeader" id="article-top">
        <Breadcrumbs
          trail={[
            { label: "Фильмы", href: "/films" },
            { label: filmTitle },
          ]}
        />

        <div className="sectionIndex">{article.kicker}</div>
        <h1 className="articleTitle">{article.title}</h1>
        <p className="articleStandfirst">{article.standfirst}</p>
        <div className="articleByline">
          <span>{article.byline.author}</span>
          <span>≈ {readingMinutes} мин {complete ? "чтения" : "открытого текста"}</span>
        </div>
        <p className="articleReadingNote">{complete ? "Открыт весь текст, включая финал." : spoilerLevel === "NONE" ? "Начало без спойлеров. По ходу чтения открывайте следующие главы; весь фильм можно раскрыть через меню «Разделы»." : "Продолжайте чтение; следующие сюжетные повороты открываются отдельно."}</p>
        <div className="articleHeaderLinks">
          <Link className="microLabel" href={`/films/${filmSlug}/making`}>Как это снимали →</Link>
          <a className="microLabel" href="#film-evidence-appendix">Сцены и источники ↓</a>
        </div>
      </header>

      <ReadingOutline sections={readingSections} fullHref={complete ? undefined : withSpoilerQuery(pathname, "FULL")} />

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
          </div>
          <div className="articleBody">
            {/* Projection keeps every block in its original section order; the
                compact position key avoids serializing long editorial IDs twice. */}
            {readingBlocks(section).map((block) => (
              <ArticleReadingBlock key={block.id} block={block} filmSlug={filmSlug} spoilerLevel={spoilerLevel}
                describeMeasurement={describeMeasurement} evidenceById={evidenceById}
                contextSourcesById={contextSourcesById} formatTimecode={formatTimecode} />
            ))}
            {section.moduleIds?.length ? (
              <details className="articleSupport">
                <summary>Подробнее в аналитическом досье</summary>
                <div className="articleModuleLinks">
                  {section.moduleIds.map(moduleId => <a className="articleModuleLink" key={moduleId}
                    href={`${withSpoilerQuery(pathname, spoilerLevel)}#${moduleId}`}>{moduleHeadings?.[moduleId] ?? moduleId} →</a>)}
                </div>
              </details>
            ) : null}
          </div>
        </section>
      ))}

      {nextHiddenLevel && nextSection ? (
        <section className="sectionShell sectionRule articleReveal" aria-labelledby="article-reveal-title">
          <div className="articleSectionHead">
            <h2 id="article-reveal-title">{nextHiddenLevel === "ENDING" ? "Дальше — финал фильма" : "Продолжить чтение?"}</h2>
            <p className="sectionIntro">{nextHiddenLevel === "ENDING" ? "Следующая часть обсуждает развязку. Откройте её, если готовы узнать финал." : nextHiddenLevel === "MINOR" ? "Дальше разбираем несколько ранних событий фильма." : nextHiddenLevel === "MAJOR" ? "Дальше обсуждаем существенные сюжетные повороты." : "Далее — итоговое прочтение всей картины."}</p>
            <a className="buttonPrimary" href={withSpoilerQuery(`${pathname}#${nextSection.id}`, nextHiddenLevel)}>{nextHiddenLevel === "ENDING" ? "Открыть финальную часть" : "Открыть следующую часть"}</a>
          </div>
        </section>
      ) : null}

      {complete && synthesis ? (
        <section id="article-verdict" className="sectionShell sectionRule articleSection articleVerdict" aria-labelledby="article-verdict-title">
          <div className="articleSectionHead">
            <div className="sectionIndex">Редакционная оценка</div>
            <h2 id="article-verdict-title" tabIndex={-1}>{synthesis.heading}</h2>
            <p className="sectionIntro">Качество кино и тяжесть показанного зла — разные оси, не один усреднённый балл.</p>
          </div>
          <p className="articleParagraph">{synthesis.verdict}</p>
          <details className="articleVerdictContext">
            <summary>Подробная редакционная оценка</summary>
            <dl className="articleVerdictGrid">
              {synthesis.facets.map(facet => (
                <div key={facet.key}><dt>{facet.label}</dt><dd>{facet.value}</dd></div>
              ))}
            </dl>
          </details>
          {synthesis.qualifications.length ? (
            <details className="articleVerdictContext articleQualifications">
              <summary>Что важно оговорить</summary>
              <ul>{synthesis.qualifications.map(text => <li key={text}>{text}</li>)}</ul>
            </details>
          ) : null}
        </section>
      ) : null}

      {article.closing && complete ? (
        <footer className="sectionShell sectionRule articleClosing">
          <details className="articleVerdictContext">
            <summary>{article.closing.heading} — как проверяли материал</summary>
            <p>{article.closing.text}</p>
          </details>
        </footer>
      ) : null}
    </article>
  );
}
