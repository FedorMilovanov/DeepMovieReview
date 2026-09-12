import type { Metadata } from "next";
import Link from "next/link";
import { MoralLensLab } from "@/components/labs/moral-lens-lab";

export const metadata: Metadata = {
  title: "Moral Lens R&D Lab",
  description: "Internal interaction prototype for the Deep Waters Moral Lens cursor grammar.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function MoralLensLabPage() {
  return (
    <>
      <div className="sectionShell" style={{ paddingBottom: 0 }}>
        <Link className="microLabel" href="/">← Глубокие воды</Link>
      </div>
      <MoralLensLab />
    </>
  );
}
