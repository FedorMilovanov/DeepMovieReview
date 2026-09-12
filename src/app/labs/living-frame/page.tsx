import type { Metadata } from "next";
import Link from "next/link";
import { LivingFrameLab } from "@/components/labs/living-frame-lab";

export const metadata: Metadata = {
  title: "Living Frame R&D Lab",
  description: "Internal 2.5D baseline prototype for the Deep Waters Living Frame system.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LivingFrameLabPage() {
  return (
    <>
      <div className="sectionShell" style={{ paddingBottom: 0 }}>
        <Link className="microLabel" href="/">← Глубокие воды</Link>
      </div>
      <LivingFrameLab />
    </>
  );
}
