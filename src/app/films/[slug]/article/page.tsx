import { notFound, permanentRedirect } from "next/navigation";
import { filmPackages, getFilmPackageBySlug } from "@/data/film-registry";
import { isPreviewContentEnabled } from "@/data/site-config";
import { getArticleMeasurementBundle } from "@/data/article-measurements";
import { parseSpoilerLevel, withSpoilerQuery } from "@/lib/spoilers";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ spoilers?: string | string[] }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  const preview = isPreviewContentEnabled();
  return filmPackages
    .filter((filmPackage) => filmPackage.article && getArticleMeasurementBundle(filmPackage.film.slug))
    .filter((filmPackage) => preview || filmPackage.film.status === "published")
    .map((filmPackage) => ({ slug: filmPackage.film.slug }));
}

/** Legacy address; a fragment is inherited by the browser across this redirect. */
export default async function FilmArticlePage({ params, searchParams }: ArticlePageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const filmPackage = getFilmPackageBySlug(slug);
  if (!filmPackage?.article || !getArticleMeasurementBundle(slug)) notFound();
  if (filmPackage.film.status !== "published" && !isPreviewContentEnabled()) notFound();
  permanentRedirect(withSpoilerQuery(`/films/${slug}`, parseSpoilerLevel(query.spoilers)));
}
