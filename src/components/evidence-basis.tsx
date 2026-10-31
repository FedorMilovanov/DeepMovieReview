import type { EvidenceReviewBasis } from "@/lib/film-package";
import {
  evidenceBasisMaterialLabels,
  evidenceBasisOutcomeLabels,
} from "@/lib/presentation-labels";
import { formatTimecode } from "@/lib/timecode";
import { pluralRu } from "@/lib/plural-ru";

/**
 * What stood behind a claim: the material the check used, what it concluded, and
 * the window it covered.
 *
 * One component, two readers — the film page's evidence map and the article's
 * timelines — so a card and an inline note can never drift into stating the
 * verification differently. A record with no basis says so instead of borrowing
 * the word «проверено».
 */
export function EvidenceBasisLine({ basis }: { basis?: EvidenceReviewBasis }) {
  if (!basis) {
    return (
      <p className="evidenceBasis" data-outcome="missing">
        <span>Основа проверки</span>в журнале не записана
      </p>
    );
  }

  const window = basis.window
    ? `${formatTimecode(basis.window.from)}–${formatTimecode(basis.window.to)}`
    : undefined;

  return (
    <p
      className="evidenceBasis"
      data-outcome={basis.outcome}
      data-refused-ancestor={basis.refusedAncestor}
    >
      <span>Основа проверки</span>
      {evidenceBasisMaterialLabels[basis.material]} · {evidenceBasisOutcomeLabels[basis.outcome]}
      {window ? ` · наблюдения ${basis.windowApproximate ? "≈ " : ""}${window}` : ""} · {basis.observations}{" "}
      {pluralRu(basis.observations, "наблюдение", "наблюдения", "наблюдений")}
      {basis.unrecorded?.length
        ? ` · не записано: ${basis.unrecorded
            .map((field) => (field === "reviewer" ? "кто проверял" : "когда"))
            .join(", ")}`
        : ""}
      {basis.note ? ` · ${basis.note}` : ""}
      {basis.refusedAncestor ? (
        <span className="evidenceBasisRefusal">
          исходная формулировка отклонена проверкой и переписана
        </span>
      ) : null}
    </p>
  );
}
