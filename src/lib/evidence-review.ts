import type { EvidenceReviewBasis } from "./film-package";

/**
 * A verification ledger entry, as far as the basis derivation needs to see it.
 *
 * Structural on purpose: the article layer must not import one film's ledger.
 * The caller passes whatever its edition recorded, and this module turns it into
 * the small honest summary the reader sees.
 */
export type LedgerEntryLike = {
  status: "VISUAL_CONFIRMED" | "TRANSCRIPT_CONFIRMED" | "PENDING_LOCAL_REVIEW" | "CONTRADICTED";
  frames: { frameTimeSeconds: number }[];
};

const MATERIAL: Record<LedgerEntryLike["status"], EvidenceReviewBasis["material"]> = {
  VISUAL_CONFIRMED: "frames",
  CONTRADICTED: "frames",
  TRANSCRIPT_CONFIRMED: "subtitle-track",
  PENDING_LOCAL_REVIEW: "frames",
};

const OUTCOME: Record<LedgerEntryLike["status"], EvidenceReviewBasis["outcome"]> = {
  VISUAL_CONFIRMED: "seen",
  TRANSCRIPT_CONFIRMED: "heard",
  CONTRADICTED: "refused",
  PENDING_LOCAL_REVIEW: "refused",
};

const TIMED = new Set<EvidenceReviewBasis["material"]>(["frames", "subtitle-track"]);

/**
 * Derive the review basis from a ledger entry.
 *
 * Nothing here is editorial: the material follows the status the reviewer chose,
 * the window is the first and last observed second, and the count is the number of
 * observations. `PENDING_LOCAL_REVIEW` is reported as `refused` because a record
 * that was not checked in picture may not be described as seen.
 */
export function reviewBasis(entry: LedgerEntryLike | undefined): EvidenceReviewBasis | undefined {
  if (!entry || entry.frames.length === 0) return undefined;

  const times = entry.frames
    .map((frame) => frame.frameTimeSeconds)
    .filter((seconds) => Number.isFinite(seconds))
    .sort((a, b) => a - b);
  const material = MATERIAL[entry.status];

  const basis: EvidenceReviewBasis = {
    material,
    observations: entry.frames.length,
    outcome: OUTCOME[entry.status],
  };
  if (TIMED.has(material) && times.length > 0) {
    basis.window = { from: times[0]!, to: times[times.length - 1]! };
  }
  // The ledger has never recorded who reviewed a record or when. Saying so is
  // cheaper than implying a signature the data does not carry.
  basis.unrecorded = ["reviewer", "date"];
  return basis;
}
