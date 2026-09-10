import test from "node:test";
import assert from "node:assert/strict";
import { projectFilmModule } from "../src/lib/film-module-projection";
import { projectHomepage } from "../src/lib/homepage-projection";
import { validateFilmPackage } from "../src/lib/film-package-integrity";
import { canIndexSite } from "../src/lib/site-publication-policy";
import { validateVisualAssetManifest } from "../src/lib/visual-assets";
import { downgradeTier, lowerOfTier, selectInitialTier } from "../src/lib/experience-quality";
import { canRevealSpoiler, parseSpoilerLevel, withSpoilerQuery } from "../src/lib/spoilers";
import type { FilmPackage, CharactersModule } from "../src/lib/film-package";

test("site indexing is allowed only for a published non-preview public build", () => {
  const statuses = ["fixture", "draft", "published"] as const;

  for (const homepageStatus of statuses) {
    for (const siteIndexingRequested of [false, true]) {
      for (const previewContentEnabled of [false, true]) {
        const actual = canIndexSite({
          siteIndexingRequested,
          previewContentEnabled,
          homepageStatus,
        });
        const expected =
          homepageStatus === "published" &&
          siteIndexingRequested &&
          !previewContentEnabled;
        assert.equal(
          actual,
          expected,
          JSON.stringify({ homepageStatus, siteIndexingRequested, previewContentEnabled }),
        );
      }
    }
  }
});

test("ambiguous backslash source URLs are rejected before URL normalization", () => {
  const filmPackage: FilmPackage = {
    schemaVersion: 1,
    film: {
      slug: "url-fixture",
      title: "URL Fixture",
      year: 2026,
      director: "Fixture",
      runtime: "—",
      genre: ["Drama"],
      premise: "Fixture",
      thesisQuestion: "Fixture?",
      status: "fixture",
    },
    modules: [
      {
        id: "sources",
        kind: "sources-method",
        heading: "Sources",
        spoilerLevel: "NONE",
        methodologyVersion: "fixture",
        editorialRevision: "fixture",
        analyzedEdition: "fixture",
        sources: [
          {
            id: "bad-source",
            label: "Bad source",
            kind: "reference",
            href: "https:\\evil.example/path",
          },
          {
            id: "good-source",
            label: "Good source",
            kind: "reference",
            href: "https://example.com/path",
          },
          {
            id: "good-internal",
            label: "Internal source",
            kind: "reference",
            href: "/methodology",
          },
        ],
      },
    ],
  };

  const errors = validateFilmPackage(filmPackage);
  assert.equal(errors.filter((error) => error.includes("bad-source")).length, 1);
  assert.equal(errors.some((error) => error.includes("good-source")), false);
  assert.equal(errors.some((error) => error.includes("good-internal")), false);
});

test("character profile spoiler level removes protected wants/fears/contradiction before render", () => {
  const charactersModule: CharactersModule = {
    id: "characters",
    kind: "characters",
    heading: "Characters",
    spoilerLevel: "NONE",
    characters: [
      {
        id: "safe",
        name: "Safe Character",
        wants: "A spoiler-safe goal",
        fears: "A spoiler-safe fear",
        contradiction: "A spoiler-safe contradiction",
        interpretiveSpoilerLevel: "MINOR",
        believes: "Protected belief",
        selfDeception: "Protected self-deception",
      },
      {
        id: "hidden",
        name: "Hidden Character",
        wants: "Spoiler goal",
        fears: "Spoiler fear",
        contradiction: "Spoiler contradiction",
        profileSpoilerLevel: "MINOR",
      },
    ],
  };

  const projected = projectFilmModule(charactersModule, "NONE");
  assert.ok(projected && projected.kind === "characters");
  assert.equal(projected.characters.length, 1);
  assert.equal(projected.characters[0]?.id, "safe");
  assert.equal(projected.characters[0]?.believes, undefined);
  assert.equal(projected.characters[0]?.selfDeception, undefined);
});

test("homepage omits optional sections when NONE projection leaves them with no usable content", () => {
  const filmPackage: FilmPackage = {
    schemaVersion: 1,
    film: {
      slug: "homepage-projection-test",
      title: "Homepage Projection Test",
      year: 2026,
      director: "Fixture",
      runtime: "100 min",
      genre: ["Drama"],
      premise: "Fixture",
      thesisQuestion: "Can optional slices disappear cleanly?",
      status: "published",
    },
    modules: [
      {
        id: "story",
        kind: "story",
        heading: "Story",
        spoilerLevel: "NONE",
        summary: "Safe story",
        beats: [{ id: "beat", label: "Premise", summary: "Safe beat", spoilerLevel: "NONE" }],
      },
      {
        id: "characters",
        kind: "characters",
        heading: "Characters",
        spoilerLevel: "NONE",
        characters: [{
          id: "character-a",
          name: "Character A",
          wants: "Truth",
          fears: "Loss",
          contradiction: "Protective but controlling",
        }],
      },
      {
        id: "relationship",
        kind: "relationship",
        heading: "Relationship",
        spoilerLevel: "NONE",
        label: "A / B",
        summary: "Safe relationship summary",
        events: [{
          id: "rel-event",
          label: "Opening",
          change: "Trust is provisional.",
          tone: "trust",
          spoilerLevel: "NONE",
        }],
      },
      {
        id: "family",
        kind: "family-youth",
        heading: "Family",
        spoilerLevel: "NONE",
        summary: "A wrapper summary that is not rendered by the homepage read model.",
        observations: [{
          id: "family-hidden",
          domain: "AUTHORITY",
          subject: "Authority",
          claim: "Protected observation",
          confidence: "MEDIUM",
          spoilerLevel: "MINOR",
        }],
      },
      {
        id: "meaning",
        kind: "meaning",
        heading: "Meaning",
        spoilerLevel: "NONE",
        theme: "Truth",
        question: "What does truth cost?",
        apparentClaim: "Truth matters.",
        counterevidence: "Truth can hurt.",
        confidence: "MEDIUM",
      },
      {
        id: "permission",
        kind: "permission",
        heading: "Permission",
        spoilerLevel: "NONE",
        assessments: [{
          id: "permission-safe",
          subject: "Deception",
          state: "QUESTIONED",
          rationale: "It carries relational cost.",
          spoilerLevel: "NONE",
        }],
      },
      {
        id: "craft",
        kind: "craft",
        heading: "Craft",
        spoilerLevel: "NONE",
        observations: [{
          id: "craft-safe",
          mechanism: "CAMERA_DISTANCE",
          observation: "Close framing",
          interpretiveEffect: "Maintains empathy.",
          confidence: "MEDIUM",
          spoilerLevel: "NONE",
        }],
      },
      {
        id: "decision",
        kind: "decision",
        heading: "Decision",
        spoilerLevel: "NONE",
        prompt: "Reveal the truth?",
        options: [{
          id: "option-hidden",
          label: "Reveal",
          availableAtDecisionTime: true,
          spoilerLevel: "MINOR",
        }],
        facts: [{
          id: "fact-hidden",
          text: "Protected fact",
          knowledgeState: "KNOWN_TO_CHARACTER",
          spoilerLevel: "MINOR",
        }],
        pressures: [{
          id: "pressure-hidden",
          kind: "EMOTIONAL",
          summary: "Protected pressure",
          spoilerLevel: "MINOR",
        }],
        dutiesOrGoods: [{
          id: "duty-hidden",
          label: "Truthfulness",
          spoilerLevel: "MINOR",
        }],
      },
    ],
  };

  const homepage = projectHomepage(filmPackage);
  assert.equal(homepage.familyYouth, null);
  assert.equal(homepage.decision, null);
});

test("visual asset paths stay app-rooted and protocol-relative paths are rejected", () => {
  const errors = validateVisualAssetManifest({
    schemaVersion: 1,
    id: "visual-test",
    role: "hero",
    title: "Visual test",
    alt: "Fixture visual",
    aspectRatio: 2,
    focalPoint: { x: 0.5, y: 0.5 },
    provenance: { sourceKind: "fixture" },
    variants: [
      {
        id: "lite",
        purpose: "display",
        src: "/assets/lite.webp",
        format: "webp",
        width: 1200,
        height: 600,
      },
      {
        id: "bad",
        purpose: "gpu-texture",
        src: "//cdn.example.com/hero.webp",
        format: "webp",
        width: 1200,
        height: 600,
        minTier: "HIGH",
      },
    ],
  });

  assert.ok(errors.some((error) => error.includes("bad") && error.includes("app-root")));
});

test("experience quality selection is deterministic across fallback scenarios", () => {
  assert.equal(selectInitialTier({
    backend: "none",
    dpr: 1,
    viewportWidth: 1440,
    hardwareConcurrency: 16,
    reducedMotion: false,
    forcedColors: false,
  }), "LITE");

  assert.equal(selectInitialTier({
    backend: "webgl2",
    dpr: 1,
    viewportWidth: 1440,
    hardwareConcurrency: 8,
    reducedMotion: false,
    forcedColors: false,
  }), "MEDIUM");

  assert.equal(selectInitialTier({
    backend: "webgl2",
    dpr: 3,
    viewportWidth: 390,
    hardwareConcurrency: 8,
    reducedMotion: false,
    forcedColors: false,
  }), "LITE");

  assert.equal(selectInitialTier({
    backend: "webgpu",
    dpr: 2,
    viewportWidth: 1440,
    hardwareConcurrency: 12,
    reducedMotion: false,
    forcedColors: false,
  }), "ULTRA");

  assert.equal(selectInitialTier({
    backend: "webgpu",
    dpr: 2,
    viewportWidth: 1440,
    hardwareConcurrency: 12,
    reducedMotion: true,
    forcedColors: false,
  }), "HIGH");

  assert.equal(selectInitialTier({
    backend: "webgpu",
    dpr: 3,
    viewportWidth: 390,
    hardwareConcurrency: 12,
    reducedMotion: false,
    forcedColors: false,
  }), "MEDIUM");

  assert.equal(selectInitialTier({
    backend: "webgpu",
    dpr: 1,
    viewportWidth: 1440,
    hardwareConcurrency: 12,
    reducedMotion: false,
    forcedColors: true,
  }), "LITE");
});

test("quality downgrade helpers never raise an already-lower tier", () => {
  assert.equal(downgradeTier("ULTRA"), "HIGH");
  assert.equal(downgradeTier("HIGH"), "MEDIUM");
  assert.equal(downgradeTier("MEDIUM"), "LITE");
  assert.equal(downgradeTier("LITE"), "LITE");
  assert.equal(lowerOfTier("MEDIUM", "ULTRA"), "MEDIUM");
  assert.equal(lowerOfTier("ULTRA", "MEDIUM"), "MEDIUM");
});

test("spoiler helpers normalize URL state and preserve monotonic reveal permissions", () => {
  assert.equal(parseSpoilerLevel("minor"), "MINOR");
  assert.equal(parseSpoilerLevel(["ENDING", "FULL"]), "ENDING");
  assert.equal(parseSpoilerLevel("not-a-level"), "NONE");
  assert.equal(canRevealSpoiler("NONE", "MINOR"), false);
  assert.equal(canRevealSpoiler("FULL", "ENDING"), true);
  assert.equal(withSpoilerQuery("/films/example", "NONE"), "/films/example");
  assert.equal(withSpoilerQuery("/films/example", "MAJOR"), "/films/example?spoilers=major");
});

test("published character profiles require canonical evidence support", () => {
  const filmPackage: FilmPackage = {
    schemaVersion: 1,
    film: {
      slug: "published-character-support",
      title: "Published Character Support",
      year: 2026,
      director: "Director",
      runtime: "100 min",
      genre: ["Drama"],
      premise: "Premise",
      thesisQuestion: "Question?",
      status: "published",
    },
    evidence: [{
      id: "evidence-1",
      label: "Evidence",
      observation: "Observed behavior",
      sourceIds: ["source-1"],
      spoilerLevel: "NONE",
    }],
    modules: [
      {
        id: "characters",
        kind: "characters",
        heading: "Characters",
        spoilerLevel: "NONE",
        characters: [{
          id: "character-a",
          name: "Character A",
          wants: "Control",
          fears: "Loss",
          contradiction: "Protective and controlling",
        }],
      },
      {
        id: "sources",
        kind: "sources-method",
        heading: "Sources",
        spoilerLevel: "NONE",
        methodologyVersion: "v1",
        editorialRevision: "r1",
        analyzedEdition: "Edition",
        lastReviewedAt: "2026-09-10",
        sources: [{
          id: "source-1",
          label: "Film edition",
          kind: "film-edition",
        }],
      },
    ],
  };

  const errors = validateFilmPackage(filmPackage);
  assert.ok(errors.some((error) =>
    error.includes("characters/character-a") &&
    error.includes("published interpretive claims require evidence support")
  ));
});
