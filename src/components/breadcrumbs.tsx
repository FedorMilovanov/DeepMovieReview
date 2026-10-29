import Link from "next/link";

/**
 * A breadcrumb trail, as navigation rather than decoration.
 *
 * Two reasons this exists instead of a lone "← back" link. First, a reader who
 * lands from search has no idea that this film belongs to a catalogue: the
 * trail tells them in one line. Second, it is the only place the page states
 * where it sits in the hierarchy for assistive technology — hence the ordered
 * list, the `aria-current` on the final crumb, and a labelled `<nav>`.
 *
 * The trail is data, never inferred: the page that knows its own hierarchy
 * passes it in.
 */
export type Breadcrumb = {
  label: string;
  /** Omitted for the current page, which is not a link. */
  href?: string;
};

export function Breadcrumbs({ trail }: { trail: Breadcrumb[] }) {
  if (trail.length === 0) return null;
  return (
    <nav className="breadcrumbs" aria-label="Хлебные крошки">
      <ol>
        {trail.map((crumb, index) => {
          const last = index === trail.length - 1;
          return (
            <li key={`${crumb.label}-${index}`}>
              {crumb.href && !last ? (
                <Link href={crumb.href}>{crumb.label}</Link>
              ) : (
                <span aria-current={last ? "page" : undefined}>{crumb.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
