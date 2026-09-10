import type { NarrativePermissionState, ShellFilm } from "@/lib/content";
import type { SpoilerLevel } from "@/lib/spoilers";

export type FilmModuleKind =
  | "story"
  | "characters"
  | "relationship"
  | "meaning"
  | "permission"
  | "autopsy"
  | "biblical-synthesis"
  | "sources-method";

export type FilmModuleBase = {
  id: string;
  kind: FilmModuleKind;
  heading: string;
  eyebrow?: string;
  spoilerLevel: SpoilerLevel;
};

export type StoryModule = FilmModuleBase & {
  kind: "story";
  summary: string;
  beats: Array<{
    id: string;
    label: string;
    summary: string;
    spoilerLevel: SpoilerLevel;
  }>;
};

export type CharactersModule = FilmModuleBase & {
  kind: "characters";
  characters: Array<{
    id: string;
    name: string;
    wants: string;
    fears: string;
    contradiction: string;
    roleInArgument?: string;
  }>;
};

export type RelationshipModule = FilmModuleBase & {
  kind: "relationship";
  label: string;
  summary: string;
  events: Array<{
    id: string;
    label: string;
    change: string;
    tone: "trust" | "fracture" | "pressure" | "repair";
    spoilerLevel: SpoilerLevel;
  }>;
};

export type MeaningModule = FilmModuleBase & {
  kind: "meaning";
  theme: string;
  question: string;
  apparentClaim: string;
  counterevidence: string;
  confidence: "HIGH" | "MEDIUM" | "LOW";
};

export type PermissionModule = FilmModuleBase & {
  kind: "permission";
  assessments: Array<{
    id: string;
    subject: string;
    state: NarrativePermissionState;
    rationale: string;
    spoilerLevel: SpoilerLevel;
  }>;
};

export type AutopsyModule = FilmModuleBase & {
  kind: "autopsy";
  sceneLabel: string;
  act: string;
  motive: string;
  knowledge: string;
  pressure: string;
  consequence: string;
  claim: string;
  counterevidence?: string;
};

export type BiblicalSynthesisModule = FilmModuleBase & {
  kind: "biblical-synthesis";
  observation: string;
  principle: string;
  scriptureRefs: string[];
  application: string;
  qualification: string;
};

export type SourcesMethodModule = FilmModuleBase & {
  kind: "sources-method";
  methodologyVersion: string;
  editorialRevision: string;
  analyzedEdition: string;
  lastReviewedAt?: string;
  sources: Array<{
    id: string;
    label: string;
    kind: "film-edition" | "scripture" | "reference" | "editorial-note";
    locator?: string;
    href?: string;
  }>;
};

export type FilmModule =
  | StoryModule
  | CharactersModule
  | RelationshipModule
  | MeaningModule
  | PermissionModule
  | AutopsyModule
  | BiblicalSynthesisModule
  | SourcesMethodModule;

export type FilmPackage = {
  schemaVersion: 1;
  film: ShellFilm;
  modules: FilmModule[];
};

export function assertNever(value: never): never {
  throw new Error(`Unhandled film module: ${JSON.stringify(value)}`);
}
