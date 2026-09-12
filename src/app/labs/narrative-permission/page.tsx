import type { Metadata } from "next";
import Link from "next/link";
import { NarrativePermissionLab } from "@/components/labs/narrative-permission-lab";

export const metadata: Metadata = {
  title: "Narrative Permission R&D Lab",
  description: "Internal information-design prototype for Deep Waters Narrative Permission analysis.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NarrativePermissionLabPage() {
  return (
    <>
      <div className="sectionShell" style={{ paddingBottom: 0 }}>
        <Link className="microLabel" href="/">← Глубокие воды</Link>
      </div>
      <NarrativePermissionLab />
    </>
  );
}
