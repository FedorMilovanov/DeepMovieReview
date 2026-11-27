import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { filmPackages, getFilmPackageBySlug } from "@/data/film-registry";
import { isPreviewContentEnabled } from "@/data/site-config";
import { getDiveFear, getDiveOpening } from "@/lib/dive-opening";
import { parseSpoilerLevel, withSpoilerQuery } from "@/lib/spoilers";
import { DiveExperience } from "@/components/film-article/dive-experience";

type DivePageProps = { params: Promise<{ slug: string }>; searchParams: Promise<{ spoilers?: string | string[] }> };
export const dynamicParams = false;

export function generateStaticParams() {
  const preview = isPreviewContentEnabled();
  return filmPackages.filter(pkg => (preview || pkg.film.status === "published") && getDiveOpening(pkg)).map(pkg => ({slug:pkg.film.slug}));
}

// The article remains the canonical indexed research edition while DIVE is a pilot.
export async function generateMetadata({ params }: DivePageProps): Promise<Metadata> {
  const {slug} = await params;
  const pkg = getFilmPackageBySlug(slug);
  if (!pkg || !getDiveOpening(pkg) || (pkg.film.status !== "published" && !isPreviewContentEnabled())) return {};
  return { title: `Погружение: ${pkg.film.title}`, description: "Интерактивное исследование фильма: наблюдение, гипотезы, развилки и синтез. Первое путешествие без спойлеров.", robots: {index:false,follow:true}, alternates:{canonical:`/films/${slug}`} };
}

export default async function FilmDivePage({params, searchParams}: DivePageProps) {
  const [{slug}, query] = await Promise.all([params, searchParams]);
  const pkg = getFilmPackageBySlug(slug);
  if (!pkg || (pkg.film.status !== "published" && !isPreviewContentEnabled())) notFound();
  const opening = getDiveOpening(pkg);
  if (!opening) notFound();
  const level = parseSpoilerLevel(query.spoilers);
  const fear = getDiveFear(pkg, level);
  return <DiveExperience title={pkg.film.title} articleHref={withSpoilerQuery(`/films/${slug}`, level)}
    journeyHref={`/films/${slug}/dive`} fear={fear} {...opening}/>;
}
