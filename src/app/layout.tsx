import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";
import "../styles/tokens.css";
import "../styles/primitives.css";
import "../styles/route-states.css";
import "../styles/methodology.css";

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
        <div className="appShell">
          <SiteHeader />
          <main id="main">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
