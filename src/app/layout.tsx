import type { Metadata } from "next";
import { ExperienceDiagnostics } from "@/components/experience/experience-diagnostics";
import { ExperienceQualityProvider } from "@/components/experience/experience-quality-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "../styles/platform.css";
import "./globals.css";
import "../styles/tokens.css";
import "../styles/primitives.css";
import "../styles/route-states.css";
import "../styles/methodology.css";
import "../styles/spoilers.css";
import "../styles/film-modules.css";
import "../styles/experience.css";

export const metadata: Metadata = {
  title: {
    default: "DeepMovieReview",
    template: "%s · DeepMovieReview",
  },
  description:
    "Deep analysis of cinema: story, people, relationships, ideas, craft, moral structure and biblical synthesis.",
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
