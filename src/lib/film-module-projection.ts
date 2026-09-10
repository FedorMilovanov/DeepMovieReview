import type { FilmModule } from "@/lib/film-package";
import { canRevealSpoiler, type SpoilerLevel } from "@/lib/spoilers";

function visible<T extends { spoilerLevel: SpoilerLevel }>(items: T[], level: SpoilerLevel): T[] {
  return items.filter((item) => canRevealSpoiler(level, item.spoilerLevel));
}

/** Hidden nested content is removed before it can enter the render tree. */
export function projectFilmModule(module: FilmModule, level: SpoilerLevel): FilmModule | null {
  if (!canRevealSpoiler(level, module.spoilerLevel)) return null;

  switch (module.kind) {
    case "story":
      return { ...module, beats: visible(module.beats, level) };
    case "characters":
      return {
        ...module,
        characters: module.characters.map((character) => {
          const allowed = canRevealSpoiler(level, character.interpretiveSpoilerLevel ?? module.spoilerLevel);
          if (allowed) return character;
          return {
            id: character.id,
            name: character.name,
            wants: character.wants,
            fears: character.fears,
            contradiction: character.contradiction,
            interpretiveSpoilerLevel: character.interpretiveSpoilerLevel,
          };
        }),
      };
    case "relationship":
      return { ...module, events: visible(module.events, level) };
    case "family-youth": {
      const observations = visible(module.observations, level);
      return observations.length > 0 || module.summary ? { ...module, observations } : null;
    }
    case "teaching-signals": {
      const signals = visible(module.signals, level);
      return signals.length > 0 ? { ...module, signals } : null;
    }
    case "permission": {
      const assessments = visible(module.assessments, level);
      return assessments.length > 0 ? { ...module, assessments } : null;
    }
    case "craft": {
      const observations = visible(module.observations, level);
      const pressureAssessments = visible(module.pressureAssessments ?? [], level);
      return observations.length > 0 || pressureAssessments.length > 0
        ? { ...module, observations, pressureAssessments }
        : null;
    }
    case "decision": {
      const options = module.options.filter((option) => canRevealSpoiler(level, option.spoilerLevel ?? module.spoilerLevel));
      const facts = visible(module.facts, level);
      const pressures = visible(module.pressures, level);
      const dutiesOrGoods = visible(module.dutiesOrGoods, level);
      const editorialJudgment = module.editorialJudgment && canRevealSpoiler(level, module.editorialJudgment.spoilerLevel)
        ? module.editorialJudgment
        : undefined;
      return { ...module, options, facts, pressures, dutiesOrGoods, editorialJudgment };
    }
    case "moral-analysis": {
      const events = visible(module.events, level);
      return events.length > 0 || module.summary ? { ...module, events } : null;
    }
    case "meaning":
    case "autopsy":
    case "biblical-synthesis":
    case "final-synthesis":
    case "sources-method":
      return module;
  }
}

export function projectFilmModules(modules: FilmModule[], level: SpoilerLevel): FilmModule[] {
  return modules.flatMap((module) => {
    const projected = projectFilmModule(module, level);
    return projected ? [projected] : [];
  });
}
