import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/oswald";
import "@fontsource-variable/jetbrains-mono";
import { ExperienceDiagnostics } from "@/components/experience/experience-diagnostics";
import { ExperienceQualityProvider } from "@/components/experience/experience-quality-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { requireFilmPackageBySlug } from "@/data/film-registry";
import { homepageFeaturedFilmSlug, isPreviewContentEnabled } from "@/data/site-config";
import { canIndexSite } from "@/lib/site-publication-policy";
// This side-effect import executes the fail-closed visual manifest registry assertion.
import "@/data/visual-assets";
import "../styles/platform.css";
import "../styles/tokens.css";
import "./globals.css";
import "../styles/primitives.css";
import "../styles/homepage.css";
import "../styles/homepage-optics.css";
import "../styles/route-states.css";
import "../styles/methodology.css";
import "../styles/spoilers.css";
import "../styles/film-modules.css";
import "../styles/film-verdict.css";
import "../styles/experience.css";

const homepageFilmPackage = requireFilmPackageBySlug(homepageFeaturedFilmSlug);
const previewContentEnabled = isPreviewContentEnabled();

if (homepageFilmPackage.film.status === "draft" && !previewContentEnabled) {
  throw new Error(
    `Configured homepage feature "${homepageFeaturedFilmSlug}" is draft content. Enable DMR_PREVIEW_CONTENT_ENABLED only for an intentional preview build, or publish/select a safe homepage feature.`,
  );
}

const indexingEnabled = canIndexSite({
  siteIndexingRequested: process.env.DMR_SITE_INDEXING_ENABLED === "true",
  previewContentEnabled,
  homepageStatus: homepageFilmPackage.film.status,
});

export const metadata: Metadata = {
  title: {
    default: "DeepMovieReview — глубокий разбор кино",
    template: "%s · DeepMovieReview",
  },
  description:
    "Глубокий анализ кино: история, люди, отношения, идеи, форма, моральная структура и библейский синтез. Сначала фильм — потом вердикт.",
  robots: indexingEnabled
    ? { index: true, follow: true }
    : {
        index: false,
        follow: false,
        googleBot: { index: false, follow: false },
      },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>
        <a className="skipLink" href="#main">Перейти к содержимому</a>
        <ExperienceQualityProvider>
          <div className="appShell">
            <SiteHeader />
            <main id="main">{children}</main>
            <SiteFooter />
          </div>
          <ExperienceDiagnostics />
        </ExperienceQualityProvider>
      </body>
    </html>
  );
}
