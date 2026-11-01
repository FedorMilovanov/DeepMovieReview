import type { ArticleMeasurementView } from "@/lib/film-article";
import type { ArticleBlock, ArticleMeasurementRef, EvidenceRecord } from "@/lib/film-package";
import { evidenceBasisMaterialLabels, evidenceBasisOutcomeLabels } from "@/lib/presentation-labels";
import { canRevealSpoiler, withSpoilerQuery, type SpoilerLevel } from "@/lib/spoilers";
import { ArticleTable } from "./article-table";

/** Server-rendered citations keep their level and never invent a source label. */
export function ArticleCorrectionTable({ block, filmSlug, spoilerLevel, evidenceById, describeMeasurement }: {
  block: Extract<ArticleBlock, { kind: "corrections" }>;
  filmSlug: string;
  spoilerLevel: SpoilerLevel;
  evidenceById?: ReadonlyMap<string, EvidenceRecord>;
  describeMeasurement: (ref: ArticleMeasurementRef) => ArticleMeasurementView | undefined;
}) {
  return (
    <ArticleTable blockId={block.id} caption={block.caption} corrections>
      <thead>
        <tr>
          <th scope="col">Ходовое утверждение</th>
          <th scope="col">Что удалось проверить</th>
        </tr>
      </thead>
      <tbody>
        {block.rows.map((row) => {
          const evidenceIds = [...(row.evidenceId ? [row.evidenceId] : []), ...(row.evidenceIds ?? [])];
          const records = evidenceIds.flatMap((id) => {
            const record = evidenceById?.get(id);
            return record && canRevealSpoiler(spoilerLevel, record.spoilerLevel) ? [record] : [];
          });
          const measured = row.measurement ? describeMeasurement(row.measurement) : undefined;
          return (
            <tr key={row.id}>
              <th scope="row">{row.commonClaim}</th>
              <td>
                <span>{row.onScreen}</span>
                {records.length ? (
                  <ul className="articleCorrectionEvidence" aria-label="Опоры этой поправки">
                    {records.map((record) => (
                      <li key={record.id}>
                        <a href={`${withSpoilerQuery(`/films/${filmSlug}`, spoilerLevel)}#evidence-${record.id}`}>
                          {record.label} →
                        </a>
                        {record.basis ? <small>{evidenceBasisMaterialLabels[record.basis.material]} · {evidenceBasisOutcomeLabels[record.basis.outcome]}</small> : <small>основа проверки не записана</small>}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {measured ? <small className="articleTableNote">{measured.title}: {measured.primary} · {measured.secondary} · {measured.detail}</small> : null}
              </td>
            </tr>
          );
        })}
      </tbody>
    </ArticleTable>
  );
}
