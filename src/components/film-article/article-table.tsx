import type { ReactNode } from "react";

/** Shared, server-rendered frame; native headers remain owned by each block. */
export function ArticleTable({
  blockId,
  caption,
  corrections = false,
  children,
}: {
  blockId: string;
  caption: string;
  corrections?: boolean;
  children?: ReactNode;
}) {
  const captionId = `article-table-${blockId}-caption`;
  const hintId = `article-table-${blockId}-hint`;
  return (
    <figure className={`articleTableFigure${corrections ? " articleCorrections" : ""}`}>
      <figcaption id={captionId}>{caption}</figcaption>
      <p className="articleTableScrollHint" id={hintId}>Если не видны все столбцы, проведите таблицу влево или выделите её и нажмите стрелку вправо. Название строки — в первом столбце; при сильном увеличении вернитесь к нему прокруткой.</p>
      <div className="articleTableViewport" role="region" aria-labelledby={captionId} aria-describedby={hintId} tabIndex={0}>
        <table className="articleTable" aria-labelledby={captionId}>
          {children}
        </table>
      </div>
    </figure>
  );
}
