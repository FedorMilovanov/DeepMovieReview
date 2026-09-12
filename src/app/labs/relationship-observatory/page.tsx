import type { Metadata } from "next";
import Link from "next/link";
import { RelationshipObservatoryLab } from "@/components/labs/relationship-observatory-lab";

export const metadata: Metadata = {
  title: "Relationship Observatory R&D Lab",
  description: "Internal semantic prototype for the Deep Waters Relationship Observatory.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RelationshipObservatoryLabPage() {
  return (
    <>
      <div className="sectionShell" style={{ paddingBottom: 0 }}>
        <Link className="microLabel" href="/">← Глубокие воды</Link>
      </div>
      <RelationshipObservatoryLab />
    </>
  );
}
