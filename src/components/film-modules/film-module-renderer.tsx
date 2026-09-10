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

type FilmModuleRendererProps = { module: FilmModule };

export function getVisibleFilmModules(modules: FilmModule[], spoilerLevel: SpoilerLevel) {
  return projectFilmModules(modules, spoilerLevel);
}

/** Presentation only: spoiler policy has already been resolved by projectFilmModules. */
export function FilmModuleRenderer({ module }: FilmModuleRendererProps) {
  switch (module.kind) {
    case "story": return <StoryModuleView module={module} />;
    case "characters": return <CharactersModuleView module={module} />;
    case "relationship": return <RelationshipModuleView module={module} />;
    case "family-youth": return <FamilyYouthModuleView module={module} />;
    case "meaning": return <MeaningModuleView module={module} />;
    case "teaching-signals": return <TeachingSignalsModuleView module={module} />;
    case "permission": return <PermissionModuleView module={module} />;
    case "craft": return <CraftModuleView module={module} />;
    case "autopsy": return <AutopsyModuleView module={module} />;
    case "decision": return <DecisionModuleView module={module} />;
    case "moral-analysis": return <MoralAnalysisModuleView module={module} />;
    case "biblical-synthesis": return <BiblicalSynthesisModuleView module={module} />;
    case "final-synthesis": return <FinalSynthesisModuleView module={module} />;
    case "sources-method": return <SourcesMethodModuleView module={module} />;
    default: return assertNever(module);
  }
}

export function FilmModuleList({ modules }: { modules: FilmModule[] }) {
  return <>{modules.map((module) => <FilmModuleRenderer key={module.id} module={module} />)}</>;
}
