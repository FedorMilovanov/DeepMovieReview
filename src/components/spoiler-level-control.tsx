import Link from "next/link";
import { SPOILER_LEVELS, type SpoilerLevel, withSpoilerQuery } from "@/lib/spoilers";

type SpoilerLevelControlProps = {
  pathname: string;
  current: SpoilerLevel;
};

const LABELS: Record<SpoilerLevel, string> = {
  NONE: "Spoiler-free",
  MINOR: "Minor",
  MAJOR: "Major",
  ENDING: "Ending",
  FULL: "Full analysis",
};

export function SpoilerLevelControl({ pathname, current }: SpoilerLevelControlProps) {
  return (
    <nav className="spoilerControl" aria-label="Spoiler visibility">
      <span className="microLabel">Spoilers</span>
      <div className="spoilerOptions">
        {SPOILER_LEVELS.map((level) => (
          <Link
            key={level}
            href={withSpoilerQuery(pathname, level)}
            className={level === current ? "spoilerOption spoilerOptionActive" : "spoilerOption"}
            aria-current={level === current ? "page" : undefined}
            scroll={false}
          >
            {LABELS[level]}
          </Link>
        ))}
      </div>
    </nav>
  );
}
