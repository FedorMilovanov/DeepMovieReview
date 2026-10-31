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
        {SPOILER_LEVELS.map((level) => (
          <a
            key={level}
            href={withSpoilerQuery(pathname, level)}
            className={level === current ? "spoilerOption spoilerOptionActive" : "spoilerOption"}
            aria-current={level === current ? "true" : undefined}
          >
            {LABELS[level]}
          </a>
        ))}
      </div>
    </nav>
  );
}
