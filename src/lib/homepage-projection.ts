import type { LensKey, NarrativePermissionState, ShellFilm } from "@/lib/content";
import type { Confidence, FilmModule, FilmModuleKind, FilmPackage } from "@/lib/film-package";
import { projectFilmModules } from "@/lib/film-module-projection";

export type HomepageViewModel = {
  featuredFilm: ShellFilm;
  lenses: Array<{ key: LensKey; label: string; prompt: string }>;
  storyBeats: Array<{ label: string; summary: string; spoilerSafe: boolean }>;
  characters: Array<{ id: string; name: string; wants: string; fears: string; contradiction: string }>;
  relationship: {
    id: string;
    label: string;
    summary: string;
    events: Array<{ id: string; label: string; change: string; tone: "trust" | "fracture" | "pressure" | "repair" }>;
  };
  familyYouth: Array<{ label: string; observation: string }> | null;
  meaning: {
    theme: string;
    question: string;
    apparentClaim: string;
    counterevidence: string;
    confidence: Confidence;
  };
  permissions: Array<{ subject: string; state: NarrativePermissionState; rationale: string }>;
  craft: Array<{ device: string; effect: string }>;
  sceneAutopsy: { label: string; act: string; motive: string; knowledge: string; pressure: string; consequence: string } | null;
  decision: { question: string; knownThen: string[]; revealedLater: string[] } | null;
  biblicalSynthesis: { observation: string; principle: string; application: string; qualification: string } | null;
};

const lenses: HomepageViewModel["lenses"] = [
  { key: "story", label: "Story", prompt: "What happens, and why does each turn matter?" },
  { key: "people", label: "People", prompt: "What do the characters want, fear, believe and become?" },
  { key: "relationships", label: "Relationships", prompt: "How do trust, power, loyalty and repair change?" },
  { key: "ideas", label: "Ideas", prompt: "What questions about life does the film appear to answer?" },
  { key: "moral-world", label: "Moral world", prompt: "What is condemned, normalized, rewarded or left unchallenged?" },
  { key: "craft", label: "Craft", prompt: "How do camera, music, editing and performance shape sympathy?" },
];

function optionalModuleOfKind<K extends FilmModuleKind>(
  filmPackage: FilmPackage,
  kind: K,
): Extract<FilmModule, { kind: K }> | undefined {
  return filmPackage.modules.find(
    (candidate): candidate is Extract<FilmModule, { kind: K }> => candidate.kind === kind,
  );
}

function moduleOfKind<K extends FilmModuleKind>(filmPackage: FilmPackage, kind: K): Extract<FilmModule, { kind: K }> {
  const filmModule = filmPackage.modules.find(
    (candidate): candidate is Extract<FilmModule, { kind: K }> => candidate.kind === kind,
  );
  if (!filmModule) throw new Error(`Homepage projection for ${filmPackage.film.slug} requires module "${kind}".`);
  return filmModule;
}

/**
 * Homepage is a read-model projected from the canonical FilmPackage.
 * Synthetic fixtures may expose the whole shell; real film content is always
 * reduced to spoiler-safe NONE data before homepage composition.
 */
export function projectHomepage(filmPackage: FilmPackage): HomepageViewModel {
  const homepageModules =
    filmPackage.film.status === "fixture"
      ? filmPackage.modules
      : projectFilmModules(filmPackage.modules, "NONE");
  const homepagePackage: FilmPackage = { ...filmPackage, modules: homepageModules };

  const story = moduleOfKind(homepagePackage, "story");
  const characters = moduleOfKind(homepagePackage, "characters");
  const relationship = moduleOfKind(homepagePackage, "relationship");
  const familyYouth = optionalModuleOfKind(homepagePackage, "family-youth");
  const meaning = moduleOfKind(homepagePackage, "meaning");
  const permission = moduleOfKind(homepagePackage, "permission");
  const craft = moduleOfKind(homepagePackage, "craft");
  const autopsy = optionalModuleOfKind(homepagePackage, "autopsy");
  const decision = optionalModuleOfKind(homepagePackage, "decision");
  const biblical = optionalModuleOfKind(homepagePackage, "biblical-synthesis");

  return {
    featuredFilm: filmPackage.film,
    lenses,
    storyBeats: story.beats.map((beat) => ({
      label: beat.label,
      summary: beat.summary,
      spoilerSafe: beat.spoilerLevel === "NONE",
    })),
    characters: characters.characters.map(({ id, name, wants, fears, contradiction }) => ({ id, name, wants, fears, contradiction })),
    relationship: {
      id: relationship.id,
      label: relationship.label,
      summary: relationship.summary,
      events: relationship.events.map(({ id, label, change, tone }) => ({ id, label, change, tone })),
    },
    familyYouth: familyYouth
      ? familyYouth.observations.map((item) => ({ label: item.subject, observation: item.claim }))
      : null,
    meaning: {
      theme: meaning.theme,
      question: meaning.question,
      apparentClaim: meaning.apparentClaim,
      counterevidence: meaning.counterevidence,
      confidence: meaning.confidence,
    },
    permissions: permission.assessments.map(({ subject, state, rationale }) => ({ subject, state, rationale })),
    craft: craft.observations.map((item) => ({ device: item.observation, effect: item.interpretiveEffect })),
    sceneAutopsy: autopsy
      ? {
          label: autopsy.sceneLabel,
          act: autopsy.act,
          motive: autopsy.motive,
          knowledge: autopsy.knowledge,
          pressure: autopsy.pressure,
          consequence: autopsy.consequence,
        }
      : null,
    decision: decision
      ? {
          question: decision.prompt,
          knownThen: decision.facts
            .filter((fact) => fact.knowledgeState === "KNOWN_TO_CHARACTER" || fact.knowledgeState === "REASONABLY_INFERABLE")
            .map((fact) => fact.text),
          revealedLater: decision.facts
            .filter((fact) => fact.knowledgeState === "REVEALED_LATER")
            .map((fact) => fact.text),
        }
      : null,
    biblicalSynthesis: biblical
      ? {
          observation: biblical.observation,
          principle: biblical.principle,
          application: biblical.application,
          qualification: biblical.qualification,
        }
      : null,
  };
}
