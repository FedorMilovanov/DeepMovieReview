import {
  AutopsyModuleView,
  BiblicalSynthesisModuleView,
  CharactersModuleView,
  MeaningModuleView,
  PermissionModuleView,
  RelationshipModuleView,
  SourcesMethodModuleView,
  StoryModuleView,
} from "@/components/film-modules/module-components";
import { assertNever, type FilmModule } from "@/lib/film-package";
import { canRevealSpoiler, type SpoilerLevel } from "@/lib/spoilers";

type FilmModuleRendererProps = {
  module: FilmModule;
  spoilerLevel: SpoilerLevel;
};

export function getVisibleFilmModules(modules: FilmModule[], spoilerLevel: SpoilerLevel) {
  return modules.filter((module) => canRevealSpoiler(spoilerLevel, module.spoilerLevel));
}

export function FilmModuleRenderer({ module, spoilerLevel }: FilmModuleRendererProps) {
  if (!canRevealSpoiler(spoilerLevel, module.spoilerLevel)) return null;

  switch (module.kind) {
    case "story":
      return <StoryModuleView module={module} spoilerLevel={spoilerLevel} />;
    case "characters":
      return <CharactersModuleView module={module} />;
    case "relationship":
      return <RelationshipModuleView module={module} spoilerLevel={spoilerLevel} />;
    case "meaning":
      return <MeaningModuleView module={module} />;
    case "permission":
      return <PermissionModuleView module={module} spoilerLevel={spoilerLevel} />;
    case "autopsy":
      return <AutopsyModuleView module={module} />;
    case "biblical-synthesis":
      return <BiblicalSynthesisModuleView module={module} />;
    case "sources-method":
      return <SourcesMethodModuleView module={module} />;
    default:
      return assertNever(module);
  }
}

export function FilmModuleList({ modules, spoilerLevel }: { modules: FilmModule[]; spoilerLevel: SpoilerLevel }) {
  const visibleModules = getVisibleFilmModules(modules, spoilerLevel);

  return (
    <>
      {visibleModules.map((module) => (
        <FilmModuleRenderer key={module.id} module={module} spoilerLevel={spoilerLevel} />
      ))}
    </>
  );
}
