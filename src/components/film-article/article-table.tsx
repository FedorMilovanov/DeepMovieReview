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
  return (
    <figure className={`articleTableFigure${corrections ? " articleCorrections" : ""}`}>
      <figcaption id={captionId}>{caption}</figcaption>
      <div className="articleTableViewport" role="region" aria-labelledby={captionId} tabIndex={0}>
        <table className="articleTable" aria-labelledby={captionId}>
          {children}
        </table>
      </div>
    </figure>
  );
}
