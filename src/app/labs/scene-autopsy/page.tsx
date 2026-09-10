import type { Metadata } from "next";
import Link from "next/link";
import { SceneAutopsyLab } from "@/components/labs/scene-autopsy-lab";

export const metadata: Metadata = {
  title: "Scene Autopsy R&D Lab",
  description: "Internal semantic prototype for DeepMovieReview scene evidence analysis.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SceneAutopsyLabPage() {
  return (
    <>
      <div className="sectionShell" style={{ paddingBottom: 0 }}>
        <Link className="microLabel" href="/">← DeepMovieReview</Link>
      </div>
      <SceneAutopsyLab />
    </>
  );
}
