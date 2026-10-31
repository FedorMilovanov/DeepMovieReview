import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import type {
  ProductionBlock,
  ProductionClaim,
  ProductionDossier,
  ProductionSource,
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

type ProductionLookup = {
  claims: Map<string, ProductionClaim>;
  sources: Map<string, ProductionSource>;
};

function SourceRefs({ ids, lookup }: { ids: string[]; lookup: ProductionLookup }) {
  if (ids.length === 0) return null;
  return (
    <span className="productionRefs" role="group" aria-label="Источники в реестре">
      {ids.map((id) => {
        const source = lookup.sources.get(id);
        if (!source) return null;
        return <a key={id} href={`#source-${id}`} aria-label={`Источник: ${source.label}, ${source.publisher}`}>{source.publisher}</a>;
      })}
    </span>
  );
}

const claimStatusLabels: Record<ProductionClaim["status"], string> = {
  CONFIRMED: "в реестре: подтверждено",
  DISPUTED: "в реестре: оспаривается",
  UNVERIFIED: "в реестре: не проверено",
};

function ParagraphClaims({ ids, lookup }: { ids?: string[]; lookup: ProductionLookup }) {
  const claims = (ids ?? []).flatMap((id) => {
    const claim = lookup.claims.get(id);
    return claim ? [claim] : [];
  });
  if (!claims.length) return null;
  return (
    <details className="productionParagraphClaims">
      <summary>Основания абзаца · {claims.length}</summary>
      <p>Это привязки к отдельным утверждениям, а не подтверждение каждого слова абзаца. Проверяйте содержание и ограничения источника.</p>
      <ul>
        {claims.map((claim) => (
          <li key={claim.id}>
            <span>{claim.text}</span>
            <small>{claimStatusLabels[claim.status]}</small>
            <SourceRefs ids={claim.sourceIds} lookup={lookup} />
          </li>
        ))}
      </ul>
    </details>
  );
}

function ProductionBlockView({ block, lookup }: { block: ProductionBlock; lookup: ProductionLookup }) {
  switch (block.kind) {
    case "paragraph":
      return <div className="productionParagraph"><p className="articleParagraph">{block.text}</p><ParagraphClaims ids={block.claimIds} lookup={lookup} /></div>;
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
                  <SourceRefs ids={row.sourceIds} lookup={lookup} />
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
                <SourceRefs ids={item.sourceIds} lookup={lookup} />
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
                <h3>{row.claim}</h3>
                <p>{row.verdict}</p>
                <SourceRefs ids={row.sourceIds} lookup={lookup} />
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
  filmTitle,
  cover,
}: {
  dossier: ProductionDossier;
  filmSlug: string;
  /** The film's title, so the trail names the film instead of repeating the kicker. */
  filmTitle: string;
  /** The page's own cover. Absent only if the edition has no art at all. */
  cover?: PageHeroImage;
}) {
  const byTier = (tier: ProductionSourceTier) =>
    dossier.sources.filter((source) => source.tier === tier);
  const lookup: ProductionLookup = {
    claims: new Map(dossier.claims.map((claim) => [claim.id, claim])),
    sources: new Map(dossier.sources.map((source) => [source.id, source])),
  };

  return (
    <article className="articleShell productionShell">
      <header className="sectionShell articleHeader" id="production-top">
        <Breadcrumbs
          trail={[
            { label: "Фильмы", href: "/films" },
            { label: filmTitle, href: `/films/${filmSlug}` },
            { label: "Как это снимали" },
          ]}
        />
        <div className="articleHeaderLinks">
          <Link className="microLabel" href={`/films/${filmSlug}`}>← Разбор фильма</Link>
          <Link className="microLabel" href={`/films/${filmSlug}/article`}>Читать разбор →</Link>
        </div>
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
          Материал о производстве обсуждает сюжет, отдельные сцены и финал фильма. Если вы ещё не
          смотрели «Шоу Трумана», вернитесь сюда после просмотра.
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
              <ProductionBlockView key={block.id} block={block} lookup={lookup} />
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
            Дата последнего обращения указана у каждого источника. Запись объясняет, на какое
            утверждение он направлен; связь из реестра не заменяет самостоятельной проверки текста.
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
                    <div className="productionSourceEntry">
                      <h4>{source.label}</h4>
                      <small>{source.publisher} · проверено <time dateTime={source.checkedOn}>{formatDate(source.checkedOn)}</time></small>
                      <p>{source.supports}</p>
                      <a href={source.url} rel="noreferrer noopener" target="_blank">
                        Открыть источник: {source.publisher} ↗
                      </a>
                    </div>
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
