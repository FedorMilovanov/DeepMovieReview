import {
  trumanEvidenceMigrationWave1,
  trumanEvidenceMigrationWave2,
  trumanEvidenceMigrationWave3,
  type TrumanEvidenceMigrationPlan,
} from "./the-truman-show-evidence-migration";
import {
  trumanEvidenceAlreadyAtomicIds,
  trumanEvidenceRewriteCandidates,
  type TrumanEvidenceRewriteCandidate,
} from "./the-truman-show-evidence-rewrite";

export type TrumanEvidencePromotionPath =
  | "SPLIT_REQUIRED"
  | "FACTUAL_REWRITE"
  | "ALREADY_ATOMIC";

export type TrumanEvidencePromotionBlocker =
  | "CONSUMER_REWIRE"
  | "FACTUAL_REWRITE"
  | "VISUAL_REVIEW"
  | "EDITORIAL_SCENE_VERIFICATION"
  | "LOCKED_FILM_EDITION";

export type TrumanEvidencePromotionReadiness = {
  evidenceId: string;
  path: TrumanEvidencePromotionPath;
  currentSupportReferences: number;
  blockers: TrumanEvidencePromotionBlocker[];
  note: string;
};

const migrationPlans: TrumanEvidenceMigrationPlan[] = [
  ...trumanEvidenceMigrationWave1,
  ...trumanEvidenceMigrationWave2,
  ...trumanEvidenceMigrationWave3,
];

const atomicSupportReferences = new Map<string, number>([
  ["truman-ev-interviews", 5],
  ["truman-ev-dialog", 14],
]);

const hasVisualReplacement = (plan: TrumanEvidenceMigrationPlan): boolean =>
  plan.replacements.some(
    (replacement) =>
      replacement.grounding === "VISUAL" || replacement.grounding === "MIXED",
  );

const migrationReadiness = (
  plan: TrumanEvidenceMigrationPlan,
): TrumanEvidencePromotionReadiness => {
  const blockers: TrumanEvidencePromotionBlocker[] = ["CONSUMER_REWIRE"];

  if (hasVisualReplacement(plan)) blockers.push("VISUAL_REVIEW");

  blockers.push("EDITORIAL_SCENE_VERIFICATION", "LOCKED_FILM_EDITION");

  return {
    evidenceId: plan.retiringEvidenceId,
    path: "SPLIT_REQUIRED",
    currentSupportReferences: plan.expectedSupportReferences,
    blockers,
    note:
      "Current research record is compound and must retire through its declared atomic replacement graph before canonical promotion.",
  };
};

const rewriteReadiness = (
  candidate: TrumanEvidenceRewriteCandidate,
): TrumanEvidencePromotionReadiness => {
  const blockers: TrumanEvidencePromotionBlocker[] = ["FACTUAL_REWRITE"];

  if (candidate.verification !== "TRANSCRIPT_ONLY") {
    blockers.push("VISUAL_REVIEW");
  }

  blockers.push("EDITORIAL_SCENE_VERIFICATION", "LOCKED_FILM_EDITION");

  return {
    evidenceId: candidate.evidenceId,
    path: "FACTUAL_REWRITE",
    currentSupportReferences: candidate.expectedSupportReferences,
    blockers,
    note:
      "Stable evidence ID may remain, but its research observation must be replaced by the factual rewrite contract before canonical promotion.",
  };
};

const atomicReadiness = (evidenceId: string): TrumanEvidencePromotionReadiness => ({
  evidenceId,
  path: "ALREADY_ATOMIC",
  currentSupportReferences: atomicSupportReferences.get(evidenceId) ?? -1,
  blockers: ["EDITORIAL_SCENE_VERIFICATION", "LOCKED_FILM_EDITION"],
  note:
    "Current structure is already a bounded dialogue observation; final canonical wording still requires verified editorial-scene placement and locked film-edition provenance.",
});

/**
 * Complete pre-lock readiness matrix for the current 39 Film 001 research
 * evidence records.
 *
 * This is a migration/control-plane dataset only. It does not mutate the
 * FilmPackage, promote a scene, or authorize publication.
 */
export const trumanEvidencePromotionReadiness: TrumanEvidencePromotionReadiness[] = [
  ...migrationPlans.map(migrationReadiness),
  ...trumanEvidenceRewriteCandidates.map(rewriteReadiness),
  ...trumanEvidenceAlreadyAtomicIds.map(atomicReadiness),
].sort((a, b) => a.evidenceId.localeCompare(b.evidenceId));

export const trumanEvidencePromotionSummary = {
  evidenceRecords: trumanEvidencePromotionReadiness.length,
  splitRequired: trumanEvidencePromotionReadiness.filter(
    (item) => item.path === "SPLIT_REQUIRED",
  ).length,
  factualRewrite: trumanEvidencePromotionReadiness.filter(
    (item) => item.path === "FACTUAL_REWRITE",
  ).length,
  alreadyAtomic: trumanEvidencePromotionReadiness.filter(
    (item) => item.path === "ALREADY_ATOMIC",
  ).length,
  currentSupportReferences: trumanEvidencePromotionReadiness.reduce(
    (total, item) => total + item.currentSupportReferences,
    0,
  ),
  visualReviewBlocked: trumanEvidencePromotionReadiness.filter((item) =>
    item.blockers.includes("VISUAL_REVIEW"),
  ).length,
} as const;
