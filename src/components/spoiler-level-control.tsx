import Link from "next/link";
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

export function SpoilerLevelControl({ pathname, current }: SpoilerLevelControlProps) {
  return (
    <nav className="spoilerControl" aria-label="Уровень спойлеров">
      <span className="microLabel">Спойлеры</span>
      <div className="spoilerOptions">
        {SPOILER_LEVELS.map((level) => (
          <Link
            key={level}
            href={withSpoilerQuery(pathname, level)}
            className={level === current ? "spoilerOption spoilerOptionActive" : "spoilerOption"}
            aria-current={level === current ? "true" : undefined}
            scroll={false}
          >
            {LABELS[level]}
          </Link>
        ))}
      </div>
    </nav>
  );
}
