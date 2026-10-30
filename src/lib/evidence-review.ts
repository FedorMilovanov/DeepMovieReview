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

/**
 * How many records stand behind how many checks.
 *
 * The map lists one card per claim–record link, so the same checked scene can
 * appear under six claims. A tally over unique records is the only honest answer
 * to «how much has actually been checked», and `unrecorded` is as much a result as
 * `seen`: a record with no ledger entry is not a silent success.
 */
export type ReviewTally = {
  records: number;
  seen: number;
  heard: number;
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
    heard: 0,
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
