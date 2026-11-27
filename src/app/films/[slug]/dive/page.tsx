import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { filmPackages, getFilmPackageBySlug } from "@/data/film-registry";
import { isPreviewContentEnabled } from "@/data/site-config";
import { getDiveOpening } from "@/lib/dive-opening";
import { DiveExperience } from "@/components/film-article/dive-experience";

type DivePageProps = { params: Promise<{ slug: string }> };
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

export default async function FilmDivePage({params}: DivePageProps) {
  const {slug} = await params;
  const pkg = getFilmPackageBySlug(slug);
  if (!pkg || (pkg.film.status !== "published" && !isPreviewContentEnabled())) notFound();
  const opening = getDiveOpening(pkg);
  if (!opening) notFound();
  return <DiveExperience title={pkg.film.title} articleHref={`/films/${slug}`} {...opening}/>;
}
