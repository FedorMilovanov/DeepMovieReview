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
  TRANSCRIPT_CONFIRMED: "subtitle",
  CONTRADICTED: "refused",
  PENDING_LOCAL_REVIEW: "pending",
};

const TIMED = new Set<EvidenceReviewBasis["material"]>(["frames", "clip-frames", "subtitle-track"]);

/**
 * Derive the review basis from a ledger entry.
 *
 * The material follows the ledger status, the window spans the first and last
 * observations, and the count is the number of observations. A visual result is
 * pending at a cited second which is not one of those discrete observations.
 * `PENDING_LOCAL_REVIEW` is reported as `pending`, not as `refused`:
 * «not checked yet» and «checked and did not hold» are different answers, and a
 * reader who is told the second when the first is true is being misled.
 */
export function reviewBasis(entry: LedgerEntryLike | undefined, anchorSeconds?: number): EvidenceReviewBasis | undefined {
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
  if (material === "frames" && times.length > 0) {
    basis.observationTimes = times;
    if (anchorSeconds !== undefined && Number.isFinite(anchorSeconds)) {
      basis.anchorRelation = times.some((time) => Math.abs(time - anchorSeconds) < 0.000001)
        ? "listed"
        : anchorSeconds > times[0]! && anchorSeconds < times[times.length - 1]!
          ? "between"
          : "outside";
      // An enclosing range is not a continuous check. Preserve the nearby
      // observations, but do not mark the cited second itself as seen.
      if (basis.outcome === "seen" && basis.anchorRelation !== "listed") basis.outcome = "pending";
    }
  }
  // `window` spans the first and last observation; it is not a stretch of film
  // somebody watched continuously, and the UI labels it as the observations it is.
  // The ledger has never recorded who reviewed a record or when. Saying so is
  // cheaper than implying a signature the data does not carry.
  basis.unrecorded = ["reviewer", "date"];
  return basis;
}

/**
 * How many records stand behind how many checks.
 *
 * The map lists one card per claim–record link, so the same record can appear
 * under several claims. This tally counts records, not independent checks: split
 * records may share an inherited basis. `unrecorded` is not a silent success.
 */
export type ReviewTally = {
  records: number;
  seen: number;
  subtitle: number;
  refused: number;
  pending: number;
  unrecorded: number;
  /** Records whose original formulation a check refused before it was rewritten. */
  rewritten: number;
};

export function tallyReviewBasis(records: { basis?: EvidenceReviewBasis }[]): ReviewTally {
  const tally: ReviewTally = {
    records: records.length,
    seen: 0,
    subtitle: 0,
    refused: 0,
    pending: 0,
    unrecorded: 0,
    rewritten: 0,
  };
  for (const record of records) {
    if (!record.basis) tally.unrecorded += 1;
    else {
      tally[record.basis.outcome] += 1;
      if (record.basis.refusedAncestor) tally.rewritten += 1;
    }
  }
  return tally;
}
