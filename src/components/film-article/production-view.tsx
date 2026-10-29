import Link from "next/link";
import type {
  ProductionBlock,
  ProductionDossier,
  ProductionSourceTier,
} from "@/lib/production-dossier";
import type { PageHeroImage } from "@/lib/page-metadata";

const tierLabels: Record<ProductionSourceTier, string> = {
  PRIMARY: "первичный",
  SECONDARY: "вторичный",
  TERTIARY: "третичный",
};

const tierNotes: Record<ProductionSourceTier, string> = {
  PRIMARY: "Люди, делавшие фильм, и студия: интервью, отраслевой журнал, пресс-джуне, официальные материалы.",
  SECONDARY: "Редакционная проверка: справочные и отраслевые издания, кассовые сводки, газетные рецензии.",
  TERTIARY: "Наводки и пересказы: вики, списки, любительские разборы. Никогда не держат утверждение в одиночку.",
};

/** `2026-10-28` → `28.10.2026`. */
function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${day}.${month}.${year}`;
}

function SourceRefs({ ids }: { ids: string[] }) {
  if (ids.length === 0) return null;
  return (
    <sup className="productionRefs" aria-label="Источники">
      {ids.map((id) => (
        <a key={id} href={`#source-${id}`}>
          {id.replace(/^src-/, "").slice(0, 2)}
        </a>
      ))}
    </sup>
  );
}

function ProductionBlockView({ block }: { block: ProductionBlock }) {
  switch (block.kind) {
    case "paragraph":
      return <p className="articleParagraph">{block.text}</p>;
    case "subhead":
      return <h3 className="articleSubhead">{block.text}</h3>;
    case "pullquote":
      return (
        <blockquote className="articlePullquote">
          <p>{block.text}</p>
        </blockquote>
      );
    case "facts":
      return (
        <figure className="productionFacts" aria-label={block.caption}>
          <figcaption className="microLabel">{block.caption}</figcaption>
          <dl>
            {block.rows.map((row) => (
              <div key={row.id}>
                <dt>{row.label}</dt>
                <dd>
                  {row.value}
                  <SourceRefs ids={row.sourceIds} />
                </dd>
              </div>
            ))}
          </dl>
        </figure>
      );
    case "timeline":
      return (
        <figure className="productionTimeline" aria-label={block.caption}>
          <figcaption className="microLabel">{block.caption}</figcaption>
          <ol>
            {block.items.map((item) => (
              <li key={item.id}>
                <time dateTime={item.date}>{item.date.replace(/-/g, ".")}</time>
                <span>{item.label}</span>
                <SourceRefs ids={item.sourceIds} />
              </li>
            ))}
          </ol>
        </figure>
      );
    case "myths":
      return (
        <figure className="productionMyths" aria-label={block.caption}>
          <figcaption className="microLabel">{block.caption}</figcaption>
          <div className="productionMythList">
            {block.rows.map((row) => (
              <article key={row.id} className="productionMyth">
                <h4>{row.claim}</h4>
                <p>{row.verdict}</p>
                <SourceRefs ids={row.sourceIds} />
              </article>
            ))}
          </div>
        </figure>
      );
  }
}

export function ProductionDossierView({
  dossier,
  filmSlug,
  cover,
}: {
  dossier: ProductionDossier;
  filmSlug: string;
  /** The page's own cover. Absent only if the edition has no art at all. */
  cover?: PageHeroImage;
}) {
  const byTier = (tier: ProductionSourceTier) =>
    dossier.sources.filter((source) => source.tier === tier);

  return (
    <article className="articleShell productionShell">
      <header className="sectionShell articleHeader" id="production-top">
        <Link className="microLabel" href={`/films/${filmSlug}`}>
          ← Разбор фильма
        </Link>
        <div className="sectionIndex">{dossier.kicker}</div>
        <h1 className="articleTitle">{dossier.title}</h1>
        {cover ? (
          <figure className="productionHero">
            {/*
              Plain `<picture>` rather than `next/image`: the asset is already
              encoded in two formats and two sizes, and the point here is to let
              the browser pick AVIF when it can. The `<img>` is the guaranteed
              fallback, so nothing depends on format negotiation succeeding.
            */}
            <picture>
              {cover.sources.map((source) => (
                <source key={source.src} srcSet={source.src} type={source.type} />
              ))}
              <img
                src={cover.src}
                alt={cover.alt}
                width={cover.width}
                height={cover.height}
                loading="eager"
                decoding="async"
              />
            </picture>
            <figcaption className="microLabel">
              Оригинальная иллюстрация «Глубоких вод» · не кадр из фильма
            </figcaption>
          </figure>
        ) : null}
        <p className="articleStandfirst">{dossier.standfirst}</p>
        <div className="articleByline">
          <span>{dossier.byline.author}</span>
          <span>материал {dossier.byline.editorialRevision} · {formatDate(dossier.byline.reviewedAt ?? dossier.byline.draftedAt)}</span>
          <span>{dossier.sections.length} разделов</span>
          <span>{dossier.sources.length} источников</span>
        </div>
        <p className="productionSpoilerNote">
          Здесь нет ни одного спойлера: производственная история рассказывается так, чтобы её можно было
          читать до просмотра. Всё, что касается содержания картины, осталось в разборе.
        </p>
      </header>

      <nav className="sectionShell sectionRule articleOutline" aria-label="Разделы материала">
        {dossier.sections.map((section) => (
          <Link key={section.id} href={`#${section.id}`}>
            <span>{String(section.number).padStart(2, "0")}</span>
            <strong>{section.heading}</strong>
          </Link>
        ))}
      </nav>

      {dossier.sections.map((section) => (
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
              <ProductionBlockView key={block.id} block={block} />
            ))}
          </div>
        </section>
      ))}

      {dossier.closing ? (
        <footer className="sectionShell sectionRule articleClosing">
          <div className="sectionIndex">Редакция</div>
          <h2>{dossier.closing.heading}</h2>
          <p>{dossier.closing.text}</p>
        </footer>
      ) : null}

      <section
        id="production-sources"
        className="sectionShell sectionRule productionSourceRegister"
        aria-labelledby="production-sources-title"
      >
        <div className="articleSectionHead">
          <div className="sectionIndex">Реестр</div>
          <h2 id="production-sources-title">Источники: {dossier.sources.length}</h2>
          <p className="sectionIntro">
            Каждый источник открывался {formatDate(dossier.sources[0]?.checkedOn ?? dossier.byline.draftedAt)}.
            Под каждым сказано, что именно он подтверждает, — список без этого бесполезен.
          </p>
        </div>

        {(["PRIMARY", "SECONDARY", "TERTIARY"] as const).map((tier) => {
          const sources = byTier(tier);
          if (sources.length === 0) return null;
          return (
            <div key={tier} className="productionSourceGroup">
              <h3>
                {tierLabels[tier]} · {sources.length}
              </h3>
              <p className="microLabel">{tierNotes[tier]}</p>
              <ol>
                {sources.map((source) => (
                  <li key={source.id} id={`source-${source.id}`}>
                    <details>
                      <summary>
                        <span>{source.label}</span>
                        <small>{source.publisher}</small>
                      </summary>
                      <p>{source.supports}</p>
                      <a href={source.url} rel="noreferrer noopener" target="_blank">
                        {source.url}
                      </a>
                    </details>
                  </li>
                ))}
              </ol>
            </div>
          );
        })}
      </section>
    </article>
  );
}
