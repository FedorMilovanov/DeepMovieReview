import type { LensKey, NarrativePermissionState, ShellFilm } from "@/lib/content";
import type { ArticleSceneStill, Confidence, FilmModule, FilmModuleKind, FilmPackage } from "@/lib/film-package";
import { projectArticleSections } from "./film-article";
import { projectFilmModules } from "./film-module-projection";
import { canRevealSpoiler } from "./spoilers";

export type HomepageViewModel = {
  featuredFilm: ShellFilm;
  lenses: Array<{ key: LensKey; label: string; prompt: string }>;
  storyBeats: Array<{ label: string; summary: string; spoilerSafe: boolean }>;
  characters: Array<{ id: string; name: string; wants: string; fears: string; contradiction: string;
    visual?: { assetId: string; caption: string } }>;
  paths: { storyId?: string; charactersId?: string; hasScenes: boolean; relationshipId?: string; hasRelationships: boolean; comparisonId?: string; hasComparison: boolean };
  sceneExample: {
    sceneId: string;
    sceneLabel: string;
    still?: ArticleSceneStill;
    readings: Array<{ lens: LensKey; text: string; evidence: Array<{ id: string; label: string }>; counterevidence: Array<{ id: string; label: string }> }>;
  } | null;
  /**
   * Null when the relationship module sits above the homepage's spoiler budget.
   * The homepage stops at NONE, and a film whose relationship module is MAJOR has
   * no spoiler-safe relationship panel to show — an absent panel is the honest
   * result, not a reason to lift the budget.
   */
  relationship: {
    id: string;
    label: string;
    summary: string;
    events: Array<{ id: string; label: string; change: string; tone: "trust" | "fracture" | "pressure" | "repair" }>;
  } | null;
  familyYouth: Array<{ label: string; observation: string }> | null;
  /**
   * Null when the meaning module has nothing left at the homepage's spoiler level.
   * The homepage projects at NONE and never lifts that to fill a slot.
   */
  meaning: {
    theme: string;
    question: string;
    apparentClaim: string;
    counterevidence: string;
    confidence: Confidence;
  } | null;
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

function projectSceneExample(filmPackage: FilmPackage, stills: boolean): HomepageViewModel["sceneExample"] {
  const requiredLenses = new Set(lenses.map((lens) => lens.key));
  const scene = filmPackage.scenes?.find((item) =>
    canRevealSpoiler("NONE", item.spoilerLevel) &&
    item.lensReadings?.filter((reading) => canRevealSpoiler("NONE", reading.spoilerLevel)).length === requiredLenses.size,
  );
  if (!scene?.lensReadings) return null;
  const safeReadings = scene.lensReadings.filter((reading) => canRevealSpoiler("NONE", reading.spoilerLevel));
  if (new Set(safeReadings.map((reading) => reading.lens)).size !== requiredLenses.size ||
      safeReadings.some((reading) => !requiredLenses.has(reading.lens))) return null;
  const evidence = new Map((filmPackage.evidence ?? [])
    .filter((record) => record.sceneId === scene.id && canRevealSpoiler("NONE", record.spoilerLevel))
    .map((record) => [record.id, record]));
  const readings = safeReadings.map((reading) => ({
    lens: reading.lens,
    text: reading.text,
    evidence: reading.support.evidenceIds.flatMap((id) => {
      const record = evidence.get(id);
      return record ? [{ id: record.id, label: record.label }] : [];
    }),
    counterevidence: (reading.support.counterevidenceIds ?? []).flatMap((id) => {
      const record = evidence.get(id);
      return record ? [{ id: record.id, label: record.label }] : [];
    }),
  }));
  // Fail closed even if called with an unvalidated package.
  if (readings.some((reading, index) => reading.evidence.length !== safeReadings[index]!.support.evidenceIds.length || reading.evidence.length === 0 ||
      reading.counterevidence.length !== (safeReadings[index]!.support.counterevidenceIds ?? []).length)) return null;
  const evidenceIds = new Set(readings.flatMap((reading) => reading.evidence.map((record) => record.id)));
  const sections = filmPackage.article ? projectArticleSections(filmPackage.article, "NONE", { stills }).visibleSections : [];
  const still = sections.flatMap((section) => section.blocks.flatMap((block) =>
    block.kind === "timeline" ? block.items.filter((item) => evidenceIds.has(item.evidenceId) && item.still).map((item) => item.still) : [],
  ))[0];
  return { sceneId: scene.id, sceneLabel: scene.shortLabel, readings, still };
}

/**
 * Homepage is a read-model projected from the canonical FilmPackage.
 * Synthetic fixtures may expose the whole shell; real film content is always
 * reduced to spoiler-safe NONE data before homepage composition.
 */
export function projectHomepage(filmPackage: FilmPackage, options: { stills?: boolean } = {}): HomepageViewModel {
  const homepageModules =
    filmPackage.film.status === "fixture"
      ? filmPackage.modules
      : projectFilmModules(filmPackage.modules, "NONE");
  const homepagePackage: FilmPackage = { ...filmPackage, modules: homepageModules };

  const story = moduleOfKind(homepagePackage, "story");
  const characters = moduleOfKind(homepagePackage, "characters");
  const relationship = optionalModuleOfKind(homepagePackage, "relationship");
  const familyYouth = optionalModuleOfKind(homepagePackage, "family-youth");
  const meaning = optionalModuleOfKind(homepagePackage, "meaning");
  const permission = optionalModuleOfKind(homepagePackage, "permission");
  const craft = optionalModuleOfKind(homepagePackage, "craft");
  const autopsy = optionalModuleOfKind(homepagePackage, "autopsy");
  const decision = optionalModuleOfKind(homepagePackage, "decision");
  const biblical = optionalModuleOfKind(homepagePackage, "biblical-synthesis");

  const familyYouthItems = familyYouth
    ? familyYouth.observations.map((item) => ({ label: item.subject, observation: item.claim }))
    : [];
  const knownThen = decision
    ? decision.facts
        .filter((fact) => fact.knowledgeState === "KNOWN_TO_CHARACTER" || fact.knowledgeState === "REASONABLY_INFERABLE")
        .map((fact) => fact.text)
    : [];
  const revealedLater = decision
    ? decision.facts
        .filter((fact) => fact.knowledgeState === "REVEALED_LATER")
        .map((fact) => fact.text)
    : [];

  return {
    featuredFilm: filmPackage.film,
    lenses,
    storyBeats: story.beats.map((beat) => ({
      label: beat.label,
      summary: beat.summary,
      spoilerSafe: beat.spoilerLevel === "NONE",
    })),
    characters: characters.characters.map(({ id, name, wants, fears, contradiction, visual }) => ({ id, name, wants, fears, contradiction, visual })),
    paths: {
      storyId: story.id,
      charactersId: characters.id,
      hasScenes: (filmPackage.scenes ?? []).some((scene) => canRevealSpoiler("NONE", scene.spoilerLevel)),
      relationshipId: relationship?.id,
      hasRelationships: filmPackage.modules.some((module) => module.kind === "relationship"),
      comparisonId: filmPackage.comparison && canRevealSpoiler("NONE", filmPackage.comparison.spoilerLevel) ? filmPackage.comparison.id : undefined,
      hasComparison: Boolean(filmPackage.comparison),
    },
    sceneExample: projectSceneExample(filmPackage, options.stills === true),
    relationship: relationship
      ? {
          id: relationship.id,
          label: relationship.label,
          summary: relationship.summary,
          events: relationship.events.map(({ id, label, change, tone }) => ({ id, label, change, tone })),
        }
      : null,
    familyYouth: familyYouthItems.length > 0 ? familyYouthItems : null,
    meaning: meaning
      ? {
          theme: meaning.theme,
          question: meaning.question,
          apparentClaim: meaning.apparentClaim,
          counterevidence: meaning.counterevidence,
          confidence: meaning.confidence,
        }
      : null,
    permissions: permission
      ? permission.assessments.map(({ subject, state, rationale }) => ({ subject, state, rationale }))
      : [],
    craft: craft
      ? craft.observations.map((item) => ({ device: item.observation, effect: item.interpretiveEffect }))
      : [],
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
    decision: decision && (knownThen.length > 0 || revealedLater.length > 0)
      ? {
          question: decision.prompt,
          knownThen,
          revealedLater,
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
