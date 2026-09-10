import type { Metadata } from "next";
import { ExperienceDiagnostics } from "@/components/experience/experience-diagnostics";
import { ExperienceQualityProvider } from "@/components/experience/experience-quality-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { filmPackages } from "@/data/film-registry";
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

const hasPublishedFilms = filmPackages.some((filmPackage) => filmPackage.film.status === "published");

export const metadata: Metadata = {
  title: {
    default: "DeepMovieReview",
    template: "%s · DeepMovieReview",
  },
  description:
    "Deep analysis of cinema: story, people, relationships, ideas, craft, moral structure and biblical synthesis.",
  robots: hasPublishedFilms
    ? { index: true, follow: true }
    : {
        index: false,
        follow: false,
        googleBot: { index: false, follow: false },
      },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skipLink" href="#main">Skip to content</a>
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
