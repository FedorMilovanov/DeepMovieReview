"use client";

import { useExperienceQuality } from "@/components/experience/experience-quality-provider";

export function ExperienceDiagnostics() {
  const quality = useExperienceQuality();

  if (process.env.NODE_ENV === "production") return null;

  return (
    <output className="experienceDiagnostics" aria-label="Experience quality diagnostics">
      <span>{quality.backend}</span>
      <strong>{quality.tier}</strong>
      <span>DPR {quality.dpr.toFixed(2)}</span>
      <span>{quality.reducedMotion ? "reduced motion" : "motion"}</span>
      <span>{quality.documentVisible ? "visible" : "hidden"}</span>
      {quality.downgradeReason ? <span title={quality.downgradeReason}>downgraded</span> : null}
    </output>
  );
}
