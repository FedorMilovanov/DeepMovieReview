import { FinalSynthesisModuleView } from "@/components/film-modules/final-synthesis-view";
import {
  AutopsyModuleView,
  BiblicalSynthesisModuleView,
  CharactersModuleView,
  CraftModuleView,
  DecisionModuleView,
  FamilyYouthModuleView,
  MeaningModuleView,
  MoralAnalysisModuleView,
  PermissionModuleView,
  RelationshipModuleView,
  SourcesMethodModuleView,
  StoryModuleView,
  TeachingSignalsModuleView,
} from "@/components/film-modules/module-components";
import { assertNever, type FilmModule } from "@/lib/film-package";
import { projectFilmModules } from "@/lib/film-module-projection";
import type { SpoilerLevel } from "@/lib/spoilers";

type FilmModuleRendererProps = { module: FilmModule; spoilerLevel: SpoilerLevel };

export function getVisibleFilmModules(modules: FilmModule[], spoilerLevel: SpoilerLevel) {
  return projectFilmModules(modules, spoilerLevel);
}

export function FilmModuleRenderer({ module, spoilerLevel }: FilmModuleRendererProps) {
  switch (module.kind) {
    case "story": return <StoryModuleView module={module} spoilerLevel={spoilerLevel} />;
    case "characters": return <CharactersModuleView module={module} spoilerLevel={spoilerLevel} />;
    case "relationship": return <RelationshipModuleView module={module} spoilerLevel={spoilerLevel} />;
    case "family-youth": return <FamilyYouthModuleView module={module} spoilerLevel={spoilerLevel} />;
    case "meaning": return <MeaningModuleView module={module} />;
    case "teaching-signals": return <TeachingSignalsModuleView module={module} spoilerLevel={spoilerLevel} />;
    case "permission": return <PermissionModuleView module={module} spoilerLevel={spoilerLevel} />;
    case "craft": return <CraftModuleView module={module} spoilerLevel={spoilerLevel} />;
    case "autopsy": return <AutopsyModuleView module={module} />;
    case "decision": return <DecisionModuleView module={module} spoilerLevel={spoilerLevel} />;
    case "moral-analysis": return <MoralAnalysisModuleView module={module} spoilerLevel={spoilerLevel} />;
    case "biblical-synthesis": return <BiblicalSynthesisModuleView module={module} />;
    case "final-synthesis": return <FinalSynthesisModuleView module={module} />;
    case "sources-method": return <SourcesMethodModuleView module={module} />;
    default: return assertNever(module);
  }
}

export function FilmModuleList({ modules, spoilerLevel }: { modules: FilmModule[]; spoilerLevel: SpoilerLevel }) {
  const visibleModules = projectFilmModules(modules, spoilerLevel);
  return <>{visibleModules.map((module) => <FilmModuleRenderer key={module.id} module={module} spoilerLevel={spoilerLevel} />)}</>;
}
