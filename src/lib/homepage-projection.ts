import type { HomepageFixture, LensKey } from "@/lib/content";
import type { FilmModule, FilmModuleKind, FilmPackage } from "@/lib/film-package";

const lenses: HomepageFixture["lenses"] = [
  { key: "story", label: "Story", prompt: "What happens, and why does each turn matter?" },
  { key: "people", label: "People", prompt: "What do the characters want, fear, believe and become?" },
  { key: "relationships", label: "Relationships", prompt: "How do trust, power, loyalty and repair change?" },
  { key: "ideas", label: "Ideas", prompt: "What questions about life does the film appear to answer?" },
  { key: "moral-world", label: "Moral world", prompt: "What is condemned, normalized, rewarded or left unchallenged?" },
  { key: "craft", label: "Craft", prompt: "How do camera, music, editing and performance shape sympathy?" },
] satisfies Array<{ key: LensKey; label: string; prompt: string }>;

function moduleOfKind<K extends FilmModuleKind>(
  filmPackage: FilmPackage,
  kind: K,
): Extract<FilmModule, { kind: K }> {
  const module = filmPackage.modules.find((candidate): candidate is Extract<FilmModule, { kind: K }> => candidate.kind === kind);
  if (!module) throw new Error(`Homepage projection for ${filmPackage.film.slug} requires module "${kind}".`);
  return module;
}

/**
 * Homepage is a read-model projected from the canonical FilmPackage. It is not a
 * second editorial source of truth.
 */
export function projectHomepage(filmPackage: FilmPackage): HomepageFixture {
  const story = moduleOfKind(filmPackage, "story");
  const characters = moduleOfKind(filmPackage, "characters");
  const relationship = moduleOfKind(filmPackage, "relationship");
  const familyYouth = moduleOfKind(filmPackage, "family-youth");
  const meaning = moduleOfKind(filmPackage, "meaning");
  const permission = moduleOfKind(filmPackage, "permission");
  const craft = moduleOfKind(filmPackage, "craft");
  const autopsy = moduleOfKind(filmPackage, "autopsy");
  const decision = moduleOfKind(filmPackage, "decision");
  const biblical = moduleOfKind(filmPackage, "biblical-synthesis");

  return {
    featuredFilm: filmPackage.film,
    lenses,
    storyBeats: story.beats.map((beat) => ({
      label: beat.label,
      summary: beat.summary,
      spoilerSafe: beat.spoilerLevel === "NONE",
    })),
    characters: characters.characters.map(({ id, name, wants, fears, contradiction }) => ({
      id,
      name,
      wants,
      fears,
      contradiction,
    })),
    relationship: {
      id: relationship.id,
      label: relationship.label,
      people: [characters.characters[0]?.name ?? "Character A", characters.characters[1]?.name ?? "Character B"],
      summary: relationship.summary,
      events: relationship.events.map(({ id, label, change, tone }) => ({ id, label, change, tone })),
    },
    familyYouth: familyYouth.observations.map((item) => ({ label: item.subject, observation: item.claim })),
    meaning: {
      theme: meaning.theme,
      question: meaning.question,
      apparentClaim: meaning.apparentClaim,
      counterevidence: meaning.counterevidence,
      confidence: meaning.confidence,
    },
    permissions: permission.assessments.map(({ subject, state, rationale }) => ({ subject, state, rationale })),
    craft: craft.observations.map((item) => ({ device: item.observation, effect: item.interpretiveEffect })),
    sceneAutopsy: {
      label: autopsy.sceneLabel,
      act: autopsy.act,
      motive: autopsy.motive,
      knowledge: autopsy.knowledge,
      pressure: autopsy.pressure,
      consequence: autopsy.consequence,
    },
    decision: {
      question: decision.prompt,
      knownThen: decision.facts
        .filter((fact) => fact.knowledgeState === "KNOWN_TO_CHARACTER" || fact.knowledgeState === "REASONABLY_INFERABLE")
        .map((fact) => fact.text),
      revealedLater: decision.facts.filter((fact) => fact.knowledgeState === "REVEALED_LATER").map((fact) => fact.text),
    },
    biblicalSynthesis: {
      observation: biblical.observation,
      principle: biblical.principle,
      application: biblical.application,
      qualification: biblical.qualification,
    },
  };
}
