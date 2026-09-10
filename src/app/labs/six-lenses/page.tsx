import type { Metadata } from "next";
import Link from "next/link";
import { SixLensesLab } from "@/components/labs/six-lenses-lab";

export const metadata: Metadata = {
  title: "Six Lenses R&D Lab",
  description: "Internal one-frame prototype for the six DeepMovieReview analysis lenses.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SixLensesLabPage() {
  return (
    <>
      <div className="sectionShell" style={{ paddingBottom: 0 }}>
        <Link className="microLabel" href="/">← DeepMovieReview</Link>
      </div>
      <SixLensesLab />
    </>
  );
}
