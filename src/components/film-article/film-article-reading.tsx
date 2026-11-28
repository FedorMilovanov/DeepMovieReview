import { notFound } from "next/navigation";
import { ArticleView } from "@/components/film-article/article-view";
import { getArticleMeasurementBundle } from "@/data/article-measurements";
import { getProductionDossier } from "@/data/films/production-dossiers";
import { filmStillsServable } from "@/data/site-config";
import { projectFilmModule } from "@/lib/film-module-projection";
import { projectArticleSections } from "@/lib/film-article";
import { canRevealSpoiler, type SpoilerLevel } from "@/lib/spoilers";
import type { FilmPackage } from "@/lib/film-package";

export function FilmArticleReading({ filmPackage, spoilerLevel }: { filmPackage: FilmPackage; spoilerLevel: SpoilerLevel }) {
  if (!filmPackage.article) notFound();
  const measurements = getArticleMeasurementBundle(filmPackage.film.slug);
  if (!measurements) notFound();

  // Stills follow the rights switch, not the publication status: publishing the
  // analysis did not clear the right to reproduce frames of the film.
  const projection = projectArticleSections(filmPackage.article, spoilerLevel, {
    stills: filmStillsServable(),
  });
  const finalModule = filmPackage.modules.find(module => module.kind === "final-synthesis");
  const finalProjection = finalModule ? projectFilmModule(finalModule, spoilerLevel) : null;
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Фильмы", item: "/films" },
      { "@type": "ListItem", position: 2, name: filmPackage.film.title, item: `/films/${filmPackage.film.slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        // The object is built from the film package, never from user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ArticleView
        article={filmPackage.article}
        filmSlug={filmPackage.film.slug}
        filmTitle={filmPackage.film.title}
        projection={projection}
        synthesis={finalProjection?.kind === "final-synthesis" ? finalProjection : undefined}
        spoilerLevel={spoilerLevel}
        describeMeasurement={measurements.describe}
        evidenceById={new Map((filmPackage.evidence ?? [])
          .filter((record) => canRevealSpoiler(spoilerLevel, record.spoilerLevel))
          .map((record) => [record.id, record]))}
        contextSourcesById={new Map((getProductionDossier(filmPackage.film.slug)?.sources ?? []).map((source) => [source.id, source]))}
        formatTimecode={measurements.formatTimecode}
        moduleHeadings={Object.fromEntries(
          filmPackage.modules.map((filmModule) => [filmModule.id, filmModule.heading]),
        )}
      />
    </>
  );
}
