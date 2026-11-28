import { SPOILER_LEVELS, type SpoilerLevel, withSpoilerQuery } from "@/lib/spoilers";

type SpoilerLevelControlProps = {
  pathname: string;
  current: SpoilerLevel;
};

const LABELS: Record<SpoilerLevel, string> = {
  NONE: "Без спойлеров",
  MINOR: "Небольшие",
  MAJOR: "Значительные",
  ENDING: "Финал",
  FULL: "Полный разбор",
};

// Use ordinary document navigation for a spoiler boundary: the next view is the
// independently projected response, even before hydration or when scripts fail.
export function SpoilerLevelControl({ pathname, current }: SpoilerLevelControlProps) {
  return (
    <nav className="spoilerControl" aria-label="Уровень спойлеров">
      <span className="microLabel">Спойлеры</span>
      <div className="spoilerOptions">
        {SPOILER_LEVELS.map((level, index) => (
          <a
            key={level}
            href={withSpoilerQuery(pathname, level)}
            className={level === current ? "spoilerOption spoilerOptionActive" : "spoilerOption"}
            aria-current={level === current ? "true" : undefined}
          >
            <span className="spoilerDepth" aria-hidden="true">
              {SPOILER_LEVELS.slice(1).map((mark, markIndex) => <i key={mark} data-filled={markIndex < index}/>)}
            </span>
            <span>{LABELS[level]}</span>
            {level === current ? <svg className="spoilerSelectedMark" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m3 8 3 3 7-7"/></svg> : null}
          </a>
        ))}
      </div>
    </nav>
  );
}
