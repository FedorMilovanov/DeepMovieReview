import type { FilmModule } from "@/lib/film-package";
import { canRevealSpoiler, filterBySpoilerLevel, type SpoilerLevel } from "./spoilers";

/** Hidden nested content is removed before it can enter the render tree. */
export function projectFilmModule(module: FilmModule, level: SpoilerLevel): FilmModule | null {
  if (!canRevealSpoiler(level, module.spoilerLevel)) return null;

  switch (module.kind) {
    case "story":
      return { ...module, beats: filterBySpoilerLevel(module.beats, level) };
    case "characters": {
      const characters = module.characters.flatMap((character) => {
        const profileAllowed = canRevealSpoiler(level, character.profileSpoilerLevel ?? module.spoilerLevel);
        if (!profileAllowed) return [];

        const interpretationAllowed = canRevealSpoiler(
          level,
          character.interpretiveSpoilerLevel ?? character.profileSpoilerLevel ?? module.spoilerLevel,
        );
        if (interpretationAllowed) return [character];

        return [{
          id: character.id,
          name: character.name,
          wants: character.wants,
          fears: character.fears,
          contradiction: character.contradiction,
          profileSpoilerLevel: character.profileSpoilerLevel,
          interpretiveSpoilerLevel: character.interpretiveSpoilerLevel,
        }];
      });
      return characters.length > 0 ? { ...module, characters } : null;
    }
    case "relationship":
      return { ...module, events: filterBySpoilerLevel(module.events, level) };
    case "family-youth": {
      const observations = filterBySpoilerLevel(module.observations, level);
      return observations.length > 0 || module.summary ? { ...module, observations } : null;
    }
    case "teaching-signals": {
      const signals = filterBySpoilerLevel(module.signals, level);
      return signals.length > 0 ? { ...module, signals } : null;
    }
    case "permission": {
      const assessments = filterBySpoilerLevel(module.assessments, level);
      return assessments.length > 0 ? { ...module, assessments } : null;
    }
    case "craft": {
      const observations = filterBySpoilerLevel(module.observations, level);
      const pressureAssessments = filterBySpoilerLevel(module.pressureAssessments ?? [], level);
      return observations.length > 0 || pressureAssessments.length > 0
        ? { ...module, observations, pressureAssessments }
        : null;
    }
    case "decision": {
      const options = module.options.filter((option) => canRevealSpoiler(level, option.spoilerLevel ?? module.spoilerLevel));
      const facts = filterBySpoilerLevel(module.facts, level);
      const pressures = filterBySpoilerLevel(module.pressures, level);
      const dutiesOrGoods = filterBySpoilerLevel(module.dutiesOrGoods, level);
      const editorialJudgment = module.editorialJudgment && canRevealSpoiler(level, module.editorialJudgment.spoilerLevel)
        ? module.editorialJudgment
        : undefined;
      return options.length > 0 ||
        facts.length > 0 ||
        pressures.length > 0 ||
        dutiesOrGoods.length > 0 ||
        editorialJudgment
        ? { ...module, options, facts, pressures, dutiesOrGoods, editorialJudgment }
        : null;
    }
    case "moral-analysis": {
      const events = filterBySpoilerLevel(module.events, level);
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
