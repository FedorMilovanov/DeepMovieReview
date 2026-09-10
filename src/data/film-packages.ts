import { homepageFixture, type ShellFilm } from "@/lib/content";
import type { FilmPackage } from "@/lib/film-package";

const secondFixtureFilm: ShellFilm = {
  slug: "second-fixture",
  title: "Second Fixture",
  year: 2026,
  director: "Renderer proof",
  runtime: "—",
  genre: ["Drama"],
  premise: "A second structural fixture proving that a new film can use the same route and module registry.",
  thesisQuestion: "Can the film shell remain coherent when a package selects a different module set?",
  status: "fixture",
};

export const pilotFilmPackage: FilmPackage = {
  schemaVersion: 1,
  film: homepageFixture.featuredFilm,
  modules: [
    {
      id: "story-overview",
      kind: "story",
      heading: "Understand the story before judging it.",
      eyebrow: "STORY",
      spoilerLevel: "NONE",
      summary: "The fixture demonstrates spoiler-aware plot structure without pretending to be a finished review.",
      beats: [
        { id: "beat-premise", label: "Premise", summary: "A stable world establishes expectations.", spoilerLevel: "NONE" },
        { id: "beat-disruption", label: "Disruption", summary: "A conflict reveals competing priorities.", spoilerLevel: "MINOR" },
        { id: "beat-turn", label: "Turning point", summary: "A choice changes the relationship between desire and duty.", spoilerLevel: "MAJOR" },
      ],
    },
    {
      id: "characters",
      kind: "characters",
      heading: "People carry the film's argument.",
      eyebrow: "PEOPLE",
      spoilerLevel: "NONE",
      characters: homepageFixture.characters,
    },
    {
      id: "relationship-a-b",
      kind: "relationship",
      heading: "Relationships change through events, not labels.",
      eyebrow: "RELATIONSHIP OBSERVATORY",
      spoilerLevel: "NONE",
      label: homepageFixture.relationship.label,
      summary: homepageFixture.relationship.summary,
      events: homepageFixture.relationship.events.map((event, index) => ({
        ...event,
        spoilerLevel: index < 2 ? "NONE" : index === 2 ? "MINOR" : "MAJOR",
      })),
    },
    {
      id: "meaning",
      kind: "meaning",
      heading: "What does the film appear to say?",
      eyebrow: "MEANING",
      spoilerLevel: "NONE",
      ...homepageFixture.meaning,
    },
    {
      id: "permission",
      kind: "permission",
      heading: "What does the film make costly, normal or rewarding?",
      eyebrow: "NARRATIVE PERMISSION",
      spoilerLevel: "NONE",
      assessments: homepageFixture.permissions.map((assessment, index) => ({
        id: `permission-${index + 1}`,
        ...assessment,
        spoilerLevel: index === 2 ? "MINOR" : "NONE",
      })),
    },
    {
      id: "scene-autopsy",
      kind: "autopsy",
      heading: "Evidence before conclusion.",
      eyebrow: "SCENE AUTOPSY",
      spoilerLevel: "MAJOR",
      sceneLabel: homepageFixture.sceneAutopsy.label,
      act: homepageFixture.sceneAutopsy.act,
      motive: homepageFixture.sceneAutopsy.motive,
      knowledge: homepageFixture.sceneAutopsy.knowledge,
      pressure: homepageFixture.sceneAutopsy.pressure,
      consequence: homepageFixture.sceneAutopsy.consequence,
      claim: "The scene is modeled as evidence for a relational and moral claim rather than a decorative screenshot.",
      counterevidence: "A real analysis must preserve evidence that complicates the preferred reading.",
    },
    {
      id: "biblical-synthesis",
      kind: "biblical-synthesis",
      heading: "The norm comes after careful description.",
      eyebrow: "BIBLICAL LENS + SYNTHESIS",
      spoilerLevel: "FULL",
      observation: homepageFixture.biblicalSynthesis.observation,
      principle: homepageFixture.biblicalSynthesis.principle,
      scriptureRefs: ["Fixture / no published citation"],
      application: homepageFixture.biblicalSynthesis.application,
      qualification: homepageFixture.biblicalSynthesis.qualification,
    },
  ],
};

export const secondFixturePackage: FilmPackage = {
  schemaVersion: 1,
  film: secondFixtureFilm,
  modules: [
    {
      id: "second-story",
      kind: "story",
      heading: "A smaller package should still render coherently.",
      eyebrow: "STORY",
      spoilerLevel: "NONE",
      summary: "This fixture intentionally omits several analytical modules.",
      beats: [
        { id: "second-premise", label: "Premise", summary: "A second package enters the same renderer.", spoilerLevel: "NONE" },
        { id: "second-ending", label: "Resolution", summary: "The ending remains gated until explicitly allowed.", spoilerLevel: "ENDING" },
      ],
    },
    {
      id: "second-meaning",
      kind: "meaning",
      heading: "Optional modules must not break page rhythm.",
      eyebrow: "MEANING",
      spoilerLevel: "NONE",
      theme: "Reusable structure",
      question: "Does a different film require different route code?",
      apparentClaim: "No. The film package should select modules while the renderer remains stable.",
      counterevidence: "Some future films may require genuinely new module types, which should be added deliberately to the registry.",
      confidence: "HIGH",
    },
  ],
};

export const filmPackages: FilmPackage[] = [pilotFilmPackage, secondFixturePackage];

export function getFilmPackageBySlug(slug: string) {
  return filmPackages.find((filmPackage) => filmPackage.film.slug === slug);
}
