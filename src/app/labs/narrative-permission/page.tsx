import type { Metadata } from "next";
import Link from "next/link";
import { NarrativePermissionLab } from "@/components/labs/narrative-permission-lab";

export const metadata: Metadata = {
  title: "Narrative Permission R&D Lab",
  description: "Internal information-design prototype for DeepMovieReview Narrative Permission analysis.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NarrativePermissionLabPage() {
  return (
    <>
      <div className="sectionShell" style={{ paddingBottom: 0 }}>
        <Link className="microLabel" href="/">← DeepMovieReview</Link>
      </div>
      <NarrativePermissionLab />
    </>
  );
}
