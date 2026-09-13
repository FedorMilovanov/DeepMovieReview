import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
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

test("film slugs must be route-safe lowercase kebab-case", () => {
  const filmPackage: FilmPackage = {
    schemaVersion: 1,
    film: {
      slug: "../Unsafe Slug",
      title: "Invalid Slug Fixture",
      year: 2026,
      director: "Fixture",
      runtime: "—",
      genre: ["Drama"],
      premise: "Fixture",
      thesisQuestion: "Fixture?",
      status: "fixture",
    },
    modules: [],
  };

  const errors = validateFilmPackage(filmPackage);
  assert.ok(errors.includes("film: slug must use lowercase kebab-case URL-safe segments."));
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
            id: "ambiguous-source",
            label: "Ambiguous source",
            kind: "reference",
            href: "https:evil.example/path",
          },
          {
            id: "protocol-relative-source",
            label: "Protocol-relative source",
            kind: "reference",
            href: "//evil.example/path",
          },
          {
            id: "credentialed-source",
            label: "Credentialed source",
            kind: "reference",
            href: "https://user:password@example.com/path",
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
  assert.equal(errors.filter((error) => error.includes("ambiguous-source")).length, 1);
  assert.equal(errors.filter((error) => error.includes("protocol-relative-source")).length, 1);
  assert.equal(errors.filter((error) => error.includes("credentialed-source")).length, 1);
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

test("provenance verification and review dates require valid calendar dates", () => {
  const filmPackage: FilmPackage = {
    schemaVersion: 1,
    film: {
      slug: "date-integrity",
      title: "Date Integrity",
      year: 2026,
      director: "Director",
      runtime: "100 min",
      genre: ["Drama"],
      premise: "Premise",
      thesisQuestion: "Question?",
      status: "published",
    },
    ingest: {
      edition: {
        state: "LOCKED",
        sourceId: "film-master",
        editionIdentity: "Locked test master",
        measuredRuntimeSeconds: 6000,
        timestampConvention: "Seconds from first film frame",
        verifiedAt: "2026-02-30",
      },
    },
    evidence: [],
    modules: [{
      id: "sources",
      kind: "sources-method",
      heading: "Sources",
      spoilerLevel: "NONE",
      methodologyVersion: "v1",
      editorialRevision: "r1",
      analyzedEdition: "Edition",
      lastReviewedAt: "not-a-date",
      sources: [{
        id: "film-master",
        label: "Film edition",
        kind: "film-edition",
      }],
    }],
  };

  const invalidErrors = validateFilmPackage(filmPackage);
  assert.ok(invalidErrors.includes(
    "film: LOCKED edition verifiedAt must use a valid YYYY-MM-DD calendar date.",
  ));
  assert.ok(invalidErrors.includes(
    "sources: lastReviewedAt must use a valid YYYY-MM-DD calendar date.",
  ));

  if (filmPackage.ingest?.edition.state !== "LOCKED") {
    throw new Error("date regression fixture must use a locked edition");
  }
  filmPackage.ingest.edition.verifiedAt = "2024-02-29";
  const sourcesModule = filmPackage.modules[0];
  if (sourcesModule.kind !== "sources-method") {
    throw new Error("date regression fixture must use a sources-method module");
  }
  sourcesModule.lastReviewedAt = "2024-02-29";

  const validDateErrors = validateFilmPackage(filmPackage);
  assert.ok(!validDateErrors.some((error) => error.includes("verifiedAt must use")));
  assert.ok(!validDateErrors.some((error) => error.includes("lastReviewedAt must use")));
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
    ingest: {
      edition: {
        state: "LOCKED",
        sourceId: "source-1",
        editionIdentity: "Regression test editorial master",
        measuredRuntimeSeconds: 6000,
        timestampConvention: "00:00:00 starts at first film frame",
        verifiedAt: "2026-09-11",
      },
    },
    scenes: [{
      id: "scene-1",
      sequenceIndex: 0,
      startTimestampSeconds: 100,
      endTimestampSeconds: 160,
      shortLabel: "Verified scene",
      spoilerLevel: "NONE",
      verificationState: "VERIFIED",
    }],
    evidence: [{
      id: "evidence-1",
      label: "Evidence",
      observation: "Observed behavior",
      sceneId: "scene-1",
      timestampSeconds: 120,
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
    error.includes("characters/character-a/profile") &&
    error.includes("real-film interpretive claims require canonical evidence support")
  ));
});

test("character profile and interpretation support obey independent spoiler ceilings", () => {
  const filmPackage: FilmPackage = {
    schemaVersion: 1,
    film: {
      slug: "character-support-split",
      title: "Character Support Split",
      year: 2026,
      director: "Director",
      runtime: "100 min",
      genre: ["Drama"],
      premise: "Premise",
      thesisQuestion: "Question?",
      status: "draft",
    },
    ingest: {
      edition: {
        state: "LOCKED",
        sourceId: "film-master",
        editionIdentity: "Locked test master",
        measuredRuntimeSeconds: 6000,
        timestampConvention: "Seconds from first film frame",
        verifiedAt: "2026-09-11",
      },
    },
    scenes: [{
      id: "scene-safe",
      sequenceIndex: 0,
      startTimestampSeconds: 100,
      endTimestampSeconds: 180,
      shortLabel: "Safe scene",
      spoilerLevel: "NONE",
      verificationState: "VERIFIED",
    }],
    evidence: [
      {
        id: "evidence-none",
        label: "Safe evidence",
        observation: "Safe observation",
        sceneId: "scene-safe",
        timestampSeconds: 110,
        sourceIds: ["film-master"],
        spoilerLevel: "NONE",
      },
      {
        id: "evidence-major",
        label: "Protected evidence",
        observation: "Protected observation",
        sceneId: "scene-safe",
        timestampSeconds: 120,
        sourceIds: ["film-master"],
        spoilerLevel: "MAJOR",
      },
    ],
    modules: [
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
          profileSpoilerLevel: "NONE",
          interpretiveSpoilerLevel: "MAJOR",
          believes: "A protected interpretation",
          profileSupport: { evidenceIds: ["evidence-major"] },
          interpretiveSupport: { evidenceIds: ["evidence-major"] },
        }, {
          id: "character-b",
          name: "Character B",
          wants: "Truth",
          fears: "Loss",
          contradiction: "Contradiction",
          profileSpoilerLevel: "MAJOR",
          interpretiveSpoilerLevel: "NONE",
          profileSupport: { evidenceIds: ["evidence-none"] },
        }],
      },
      {
        id: "sources",
        kind: "sources-method",
        heading: "Sources",
        spoilerLevel: "NONE",
        methodologyVersion: "draft",
        editorialRevision: "draft",
        analyzedEdition: "Locked master",
        sources: [{
          id: "film-master",
          label: "Locked master",
          kind: "film-edition",
        }],
      },
    ],
  };

  const errors = validateFilmPackage(filmPackage);
  assert.ok(errors.includes(
    'characters/character-a/profile: support evidence "evidence-major" spoiler level "MAJOR" exceeds claim level "NONE".'
  ));
  assert.equal(errors.some((error) => error.startsWith("characters/character-a/interpretation: support evidence")), false);
  assert.ok(errors.includes(
    'characters/character-b: interpretiveSpoilerLevel "NONE" cannot be lower than profile level "MAJOR".'
  ));
});

test("published character deep fields require interpretive support separately from profile support", () => {
  const filmPackage: FilmPackage = {
    schemaVersion: 1,
    film: {
      slug: "published-character-deep-support",
      title: "Published Character Deep Support",
      year: 2026,
      director: "Director",
      runtime: "100 min",
      genre: ["Drama"],
      premise: "Premise",
      thesisQuestion: "Question?",
      status: "published",
    },
    ingest: {
      edition: {
        state: "LOCKED",
        sourceId: "film-master",
        editionIdentity: "Locked test master",
        measuredRuntimeSeconds: 6000,
        timestampConvention: "Seconds from first film frame",
        verifiedAt: "2026-09-11",
      },
    },
    scenes: [{
      id: "scene-1",
      sequenceIndex: 0,
      startTimestampSeconds: 100,
      endTimestampSeconds: 160,
      shortLabel: "Verified scene",
      spoilerLevel: "NONE",
      verificationState: "VERIFIED",
    }],
    evidence: [{
      id: "evidence-1",
      label: "Evidence",
      observation: "Observed behavior",
      sceneId: "scene-1",
      timestampSeconds: 120,
      sourceIds: ["film-master"],
      spoilerLevel: "NONE",
    }],
    modules: [{
      id: "characters",
      kind: "characters",
      heading: "Characters",
      spoilerLevel: "NONE",
      characters: [{
        id: "character-a",
        name: "Character A",
        wants: "Truth",
        fears: "Loss",
        contradiction: "Contradiction",
        believes: "Deep interpretation",
        profileSupport: { evidenceIds: ["evidence-1"] },
      }],
    }, {
      id: "final",
      kind: "final-synthesis",
      heading: "Final",
      spoilerLevel: "NONE",
      thesis: "Thesis",
      verdict: "Verdict",
      qualifications: [],
      confidence: "HIGH",
      facets: [
        { key: "CRAFT", label: "Craft", value: "Value" },
        { key: "MORAL_CLARITY", label: "Moral clarity", value: "Value" },
        { key: "DEPICTED_EVIL", label: "Depicted evil", value: "Value" },
        { key: "ROMANTICIZATION", label: "Romanticization", value: "Value" },
        { key: "DECISION_COMPLEXITY", label: "Decision complexity", value: "Value" },
        { key: "REDEMPTIVE_DIRECTION", label: "Redemptive direction", value: "Value" },
      ],
      support: { evidenceIds: ["evidence-1"] },
    }, {
      id: "sources",
      kind: "sources-method",
      heading: "Sources",
      spoilerLevel: "NONE",
      methodologyVersion: "v1",
      editorialRevision: "r1",
      analyzedEdition: "Locked master",
      lastReviewedAt: "2026-09-11",
      sources: [{
        id: "film-master",
        label: "Locked master",
        kind: "film-edition",
      }],
    }],
  };

  const errors = validateFilmPackage(filmPackage);
  assert.ok(errors.some((error) =>
    error.includes("characters/character-a/interpretation") &&
    error.includes("real-film interpretive claims require canonical evidence support")
  ));
});

test("LOCKED real-film Story summary and beats require canonical evidence support", () => {
  const filmPackage: FilmPackage = {
    schemaVersion: 1,
    film: {
      slug: "story-evidence-support",
      title: "Story Evidence Support",
      year: 2026,
      director: "Director",
      runtime: "100 min",
      genre: ["Drama"],
      premise: "Premise",
      thesisQuestion: "Question?",
      status: "draft",
    },
    ingest: {
      edition: {
        state: "LOCKED",
        sourceId: "film-master",
        editionIdentity: "Locked test master",
        measuredRuntimeSeconds: 6000,
        timestampConvention: "Seconds from first film frame",
        verifiedAt: "2026-09-11",
      },
    },
    modules: [{
      id: "story",
      kind: "story",
      heading: "Story",
      spoilerLevel: "NONE",
      summary: "Unsupported story synthesis.",
      beats: [{
        id: "beat-1",
        label: "Beat",
        summary: "Unsupported plot beat.",
        spoilerLevel: "NONE",
      }],
    }, {
      id: "sources",
      kind: "sources-method",
      heading: "Sources",
      spoilerLevel: "NONE",
      methodologyVersion: "draft",
      editorialRevision: "draft",
      analyzedEdition: "Locked master",
      sources: [{
        id: "film-master",
        label: "Locked master",
        kind: "film-edition",
      }],
    }],
  };

  const errors = validateFilmPackage(filmPackage);
  assert.ok(errors.includes(
    "story/summary: real-film interpretive claims require canonical evidence support."
  ));
  assert.ok(errors.includes(
    "story/beat-1: real-film interpretive claims require canonical evidence support."
  ));
});

test("LOCKED real-film Story module requires at least one plot beat", () => {
  const filmPackage: FilmPackage = {
    schemaVersion: 1,
    film: {
      slug: "story-empty",
      title: "Story Empty",
      year: 2026,
      director: "Director",
      runtime: "100 min",
      genre: ["Drama"],
      premise: "Premise",
      thesisQuestion: "Question?",
      status: "draft",
    },
    ingest: {
      edition: {
        state: "LOCKED",
        sourceId: "film-master",
        editionIdentity: "Locked test master",
        measuredRuntimeSeconds: 6000,
        timestampConvention: "Seconds from first film frame",
        verifiedAt: "2026-09-11",
      },
    },
    modules: [{
      id: "story",
      kind: "story",
      heading: "Story",
      spoilerLevel: "NONE",
      summary: "Summary",
      summarySupport: { evidenceIds: ["missing"] },
      beats: [],
    }, {
      id: "sources",
      kind: "sources-method",
      heading: "Sources",
      spoilerLevel: "NONE",
      methodologyVersion: "draft",
      editorialRevision: "draft",
      analyzedEdition: "Locked master",
      sources: [{
        id: "film-master",
        label: "Locked master",
        kind: "film-edition",
      }],
    }],
  };

  const errors = validateFilmPackage(filmPackage);
  assert.ok(errors.includes("story: real-film story module requires at least one plot beat."));
});

test("LOCKED real-film Decision context records require canonical support", () => {
  const filmPackage: FilmPackage = {
    schemaVersion: 1,
    film: {
      slug: "decision-evidence-support",
      title: "Decision Evidence Support",
      year: 2026,
      director: "Director",
      runtime: "100 min",
      genre: ["Drama"],
      premise: "Premise",
      thesisQuestion: "Question?",
      status: "draft",
    },
    ingest: {
      edition: {
        state: "LOCKED",
        sourceId: "film-master",
        editionIdentity: "Locked test master",
        measuredRuntimeSeconds: 6000,
        timestampConvention: "Seconds from first film frame",
        verifiedAt: "2026-09-11",
      },
    },
    scenes: [{
      id: "scene-1",
      sequenceIndex: 0,
      startTimestampSeconds: 100,
      endTimestampSeconds: 180,
      shortLabel: "Decision scene",
      spoilerLevel: "NONE",
      verificationState: "VERIFIED",
    }],
    evidence: [
      {
        id: "evidence-none",
        label: "Safe decision evidence",
        observation: "Safe observation",
        sceneId: "scene-1",
        timestampSeconds: 110,
        sourceIds: ["film-master"],
        spoilerLevel: "NONE",
      },
      {
        id: "evidence-minor",
        label: "Protected decision evidence",
        observation: "Protected observation",
        sceneId: "scene-1",
        timestampSeconds: 120,
        sourceIds: ["film-master"],
        spoilerLevel: "MINOR",
      },
    ],
    modules: [
      {
        id: "decision",
        kind: "decision",
        heading: "Decision",
        spoilerLevel: "NONE",
        prompt: "What could the character reasonably choose?",
        options: [{
          id: "option-supported",
          label: "Supported option",
          availableAtDecisionTime: true,
          support: { evidenceIds: ["evidence-none"] },
          spoilerLevel: "NONE",
        }, {
          id: "option-downgrade",
          label: "Spoiler-downgraded option",
          availableAtDecisionTime: true,
          support: { evidenceIds: ["evidence-minor"] },
          spoilerLevel: "NONE",
        }],
        facts: [{
          id: "fact-unsupported",
          text: "Unsupported knowledge claim",
          knowledgeState: "KNOWN_TO_CHARACTER",
          spoilerLevel: "NONE",
        }],
        pressures: [{
          id: "pressure-unsupported",
          kind: "EMOTIONAL",
          summary: "Unsupported pressure claim",
          spoilerLevel: "NONE",
        }],
        dutiesOrGoods: [{
          id: "duty-unsupported",
          label: "Unsupported duty/good claim",
          spoilerLevel: "NONE",
        }],
      },
      {
        id: "sources",
        kind: "sources-method",
        heading: "Sources",
        spoilerLevel: "NONE",
        methodologyVersion: "draft",
        editorialRevision: "draft",
        analyzedEdition: "Locked master",
        sources: [{
          id: "film-master",
          label: "Locked master",
          kind: "film-edition",
        }],
      },
    ],
  };

  const errors = validateFilmPackage(filmPackage);
  assert.ok(errors.includes(
    'decision/option/option-downgrade: support evidence "evidence-minor" spoiler level "MINOR" exceeds claim level "NONE".'
  ));
  assert.ok(errors.includes(
    "decision/fact/fact-unsupported: real-film interpretive claims require canonical evidence support."
  ));
  assert.ok(errors.includes(
    "decision/pressure/pressure-unsupported: real-film interpretive claims require canonical evidence support."
  ));
  assert.ok(errors.includes(
    "decision/duty/duty-unsupported: real-film interpretive claims require canonical evidence support."
  ));
  assert.equal(errors.some((error) => error.startsWith("decision/option/option-supported:")), false);
});

test("decision modules disappear when the current spoiler level removes every usable nested item", () => {
  const projected = projectFilmModule({
    id: "decision-empty-at-none",
    kind: "decision",
    heading: "Decision",
    spoilerLevel: "NONE",
    prompt: "A spoiler-safe framing question",
    options: [{
      id: "option",
      label: "Protected option",
      availableAtDecisionTime: true,
      spoilerLevel: "MINOR",
    }],
    facts: [{
      id: "fact",
      text: "Protected fact",
      knowledgeState: "KNOWN_TO_CHARACTER",
      spoilerLevel: "MINOR",
    }],
    pressures: [{
      id: "pressure",
      kind: "EMOTIONAL",
      summary: "Protected pressure",
      spoilerLevel: "MINOR",
    }],
    dutiesOrGoods: [{
      id: "duty",
      label: "Protected duty",
      spoilerLevel: "MINOR",
    }],
  }, "NONE");

  assert.equal(projected, null);
});


test("real-film drafts require methodology revision and analyzed-edition metadata", () => {
  const filmPackage: FilmPackage = {
    schemaVersion: 1,
    film: {
      slug: "source-metadata-required",
      title: "Source Metadata Required",
      year: 2026,
      director: "Director",
      runtime: "100 min",
      genre: ["Drama"],
      premise: "Premise",
      thesisQuestion: "Question?",
      status: "draft",
    },
    ingest: {
      edition: {
        state: "TARGET_ONLY",
        sourceId: "film-master",
        note: "Target selected.",
      },
    },
    modules: [{
      id: "sources",
      kind: "sources-method",
      heading: "Sources",
      spoilerLevel: "NONE",
      methodologyVersion: "",
      editorialRevision: "",
      analyzedEdition: "",
      sources: [{
        id: "film-master",
        label: "Target master",
        kind: "film-edition",
      }],
    }],
  };

  const errors = validateFilmPackage(filmPackage);
  assert.ok(errors.includes("sources: methodologyVersion is required for real-film analysis."));
  assert.ok(errors.includes("sources: editorialRevision is required for real-film analysis."));
  assert.ok(errors.includes("sources: analyzedEdition is required for real-film analysis."));
});

test("real-film drafts require machine-readable edition ingest state", () => {
  const filmPackage: FilmPackage = {
    schemaVersion: 1,
    film: {
      slug: "real-draft-without-ingest",
      title: "Real Draft",
      year: 2026,
      director: "Director",
      runtime: "100 min",
      genre: ["Drama"],
      premise: "Premise",
      thesisQuestion: "Question?",
      status: "draft",
    },
    modules: [{
      id: "sources",
      kind: "sources-method",
      heading: "Sources",
      spoilerLevel: "NONE",
      methodologyVersion: "draft",
      editorialRevision: "draft",
      analyzedEdition: "Target only",
      sources: [{
        id: "film-master",
        label: "Target master",
        kind: "film-edition",
      }],
    }],
  };

  const errors = validateFilmPackage(filmPackage);
  assert.ok(errors.includes("film: real-film package requires ingest.edition metadata."));
});

test("TARGET_ONLY real-film edition blocks canonical evidence", () => {
  const filmPackage: FilmPackage = {
    schemaVersion: 1,
    film: {
      slug: "target-only-draft",
      title: "Target Only Draft",
      year: 2026,
      director: "Director",
      runtime: "100 min",
      genre: ["Drama"],
      premise: "Premise",
      thesisQuestion: "Question?",
      status: "draft",
    },
    ingest: {
      edition: {
        state: "TARGET_ONLY",
        sourceId: "film-master",
        note: "Target selected; exact master not acquired.",
      },
    },
    evidence: [{
      id: "premature-evidence",
      label: "Premature evidence",
      observation: "This must not be accepted before the exact master is locked.",
      sourceIds: ["film-master"],
      spoilerLevel: "NONE",
    }],
    modules: [{
      id: "sources",
      kind: "sources-method",
      heading: "Sources",
      spoilerLevel: "NONE",
      methodologyVersion: "draft",
      editorialRevision: "draft",
      analyzedEdition: "Target only",
      sources: [{
        id: "film-master",
        label: "Target master",
        kind: "film-edition",
      }],
    }],
  };

  const errors = validateFilmPackage(filmPackage);
  assert.ok(errors.includes("film: canonical evidence requires a LOCKED edition, not TARGET_ONLY."));
});

function buildResearchTierPackage(): FilmPackage {
  return {
    schemaVersion: 1,
    film: {
      slug: "research-tier-draft",
      title: "Research Tier Draft",
      year: 2026,
      director: "Director",
      runtime: "100 min",
      genre: ["Drama"],
      premise: "Premise",
      thesisQuestion: "Question?",
      status: "draft",
    },
    ingest: {
      edition: {
        state: "TARGET_ONLY",
        sourceId: "film-master",
        note: "Target selected; exact master not acquired.",
      },
    },
    research: {
      state: "SECONDARY_SOURCES",
      note: "Assembled from secondary sources while the master is not locked.",
      assembledAt: "2026-09-12",
    },
    scenes: [{
      id: "research-scene",
      sequenceIndex: 1,
      shortLabel: "Opening",
      startTimestampSeconds: 10,
      endTimestampSeconds: 120,
      verificationState: "DRAFT",
      spoilerLevel: "NONE",
    }],
    evidence: [{
      id: "research-evidence",
      label: "Secondary evidence",
      observation: "Documented by a published reference, not by the un-locked master.",
      sceneId: "research-scene",
      timestampSeconds: 30,
      sourceIds: ["reference-source"],
      spoilerLevel: "NONE",
    }],
    modules: [
      {
        id: "sources",
        kind: "sources-method",
        heading: "Sources",
        spoilerLevel: "NONE",
        methodologyVersion: "research-draft",
        editorialRevision: "research-1",
        analyzedEdition: "Target only; research tier.",
        sources: [
          { id: "film-master", label: "Target master", kind: "film-edition" },
          { id: "reference-source", label: "Published reference", kind: "reference", researchRole: "professional-reference" },
        ],
      },
      {
        id: "story",
        kind: "story",
        heading: "Story",
        spoilerLevel: "NONE",
        summary: "A summary assembled from secondary sources.",
        summarySupport: { evidenceIds: ["research-evidence"] },
        beats: [{
          id: "beat",
          label: "Opening beat",
          summary: "Opening beat documented by the reference.",
          spoilerLevel: "NONE",
          support: { evidenceIds: ["research-evidence"] },
        }],
      },
    ],
  };
}

test("SECONDARY_SOURCES research tier admits draft scenes, secondary evidence and analysis modules", () => {
  const errors = validateFilmPackage(buildResearchTierPackage());
  assert.deepEqual(errors, []);
});

test("research tier cannot stay in place once the package is published", () => {
  const filmPackage = buildResearchTierPackage();
  filmPackage.film.status = "published";
  const errors = validateFilmPackage(filmPackage);
  assert.ok(errors.includes("research: a published package cannot remain in the SECONDARY_SOURCES research tier."));
});

test("research tier is only valid while the edition is TARGET_ONLY", () => {
  const filmPackage = buildResearchTierPackage();
  filmPackage.ingest = {
    edition: {
      state: "LOCKED",
      sourceId: "film-master",
      editionIdentity: "Edition identity",
      measuredRuntimeSeconds: 6000,
      timestampConvention: "start-of-first-frame",
      verifiedAt: "2026-09-12",
    },
  };
  const errors = validateFilmPackage(filmPackage);
  assert.ok(errors.includes("research: the SECONDARY_SOURCES tier is only valid while the edition is TARGET_ONLY."));
});

test("research-tier scenes must stay DRAFT until the master is locked", () => {
  const filmPackage = buildResearchTierPackage();
  filmPackage.scenes = [{
    id: "research-scene",
    sequenceIndex: 1,
    shortLabel: "Opening",
    startTimestampSeconds: 10,
    endTimestampSeconds: 120,
    verificationState: "VERIFIED",
    spoilerLevel: "NONE",
  }];
  const errors = validateFilmPackage(filmPackage);
  assert.ok(errors.includes("scene/research-scene: research-tier scenes must stay DRAFT until the viewing master is LOCKED."));
});

test("research-tier evidence must not cite the target film-edition source", () => {
  const filmPackage = buildResearchTierPackage();
  filmPackage.evidence = [{
    id: "research-evidence",
    label: "Secondary evidence",
    observation: "Falsely anchored to the un-locked master.",
    sceneId: "research-scene",
    timestampSeconds: 30,
    sourceIds: ["film-master"],
    spoilerLevel: "NONE",
  }];
  const errors = validateFilmPackage(filmPackage);
  assert.ok(errors.some((error) => error.includes("research-tier evidence must not cite the target film-edition source \"film-master\" (the master is not locked).")));
});

test("research-tier evidence rejects any film-edition source before master lock", () => {
  const filmPackage = buildResearchTierPackage();
  const sourcesModule = filmPackage.modules.find((module) => module.kind === "sources-method");
  assert.ok(sourcesModule && sourcesModule.kind === "sources-method");
  sourcesModule.sources.push({
    id: "alternate-film-edition",
    label: "Another release that has not been locked",
    kind: "film-edition",
  });
  filmPackage.evidence = [{
    id: "research-evidence",
    label: "Invalid edition-backed research evidence",
    observation: "This must not be treated as secondary-source evidence.",
    sceneId: "research-scene",
    timestampSeconds: 30,
    sourceIds: ["alternate-film-edition"],
    spoilerLevel: "NONE",
  }];
  const errors = validateFilmPackage(filmPackage);
  assert.ok(errors.includes(
    'evidence/research-evidence: research-tier evidence must not cite film-edition source "alternate-film-edition" before the viewing master is LOCKED.',
  ));
});

test("research-tier evidence requires secondary source references", () => {
  const filmPackage = buildResearchTierPackage();
  filmPackage.evidence = [{
    id: "research-evidence",
    label: "Secondary evidence",
    observation: "No sources cited.",
    sceneId: "research-scene",
    timestampSeconds: 30,
    spoilerLevel: "NONE",
  }];
  const errors = validateFilmPackage(filmPackage);
  assert.ok(errors.includes("evidence/research-evidence: research-tier evidence requires at least one secondary source reference."));
});

test("SECONDARY_SOURCES references require an explicit research role", () => {
  const filmPackage = buildResearchTierPackage();
  const sourcesModule = filmPackage.modules.find((module) => module.kind === "sources-method");
  assert.ok(sourcesModule && sourcesModule.kind === "sources-method");
  const reference = sourcesModule.sources.find((source) => source.id === "reference-source");
  assert.ok(reference);
  delete reference.researchRole;
  const errors = validateFilmPackage(filmPackage);
  assert.ok(errors.includes("sources/reference-source: SECONDARY_SOURCES reference requires researchRole."));
});

test("researchRole is rejected on non-reference sources", () => {
  const filmPackage = buildResearchTierPackage();
  const sourcesModule = filmPackage.modules.find((module) => module.kind === "sources-method");
  assert.ok(sourcesModule && sourcesModule.kind === "sources-method");
  const edition = sourcesModule.sources.find((source) => source.id === "film-master");
  assert.ok(edition);
  edition.researchRole = "primary-material";
  const errors = validateFilmPackage(filmPackage);
  assert.ok(errors.includes("sources/film-master: researchRole is valid only for reference sources."));
});

test("research tier without a note or valid assembledAt date is rejected", () => {
  const filmPackage = buildResearchTierPackage();
  filmPackage.research = { state: "SECONDARY_SOURCES", note: "   ", assembledAt: "2026-13-99" };
  const errors = validateFilmPackage(filmPackage);
  assert.ok(errors.includes("research: SECONDARY_SOURCES tier requires a note."));
  assert.ok(errors.includes("research: assembledAt must use a valid YYYY-MM-DD calendar date."));
});

test("LOCKED real-film evidence must cite the locked film-edition source", () => {
  const filmPackage: FilmPackage = {
    schemaVersion: 1,
    film: {
      slug: "locked-draft",
      title: "Locked Draft",
      year: 2026,
      director: "Director",
      runtime: "100 min",
      genre: ["Drama"],
      premise: "Premise",
      thesisQuestion: "Question?",
      status: "draft",
    },
    ingest: {
      edition: {
        state: "LOCKED",
        sourceId: "film-master",
        editionIdentity: "Disc / region / file identity",
        measuredRuntimeSeconds: 6000,
        timestampConvention: "00:00:00 starts at first film frame",
        verifiedAt: "2026-09-11",
      },
    },
    evidence: [{
      id: "secondary-only",
      label: "Secondary-only claim",
      observation: "A web source cannot stand in for observation of the locked film.",
      sourceIds: ["secondary-source"],
      spoilerLevel: "NONE",
    }],
    modules: [{
      id: "sources",
      kind: "sources-method",
      heading: "Sources",
      spoilerLevel: "NONE",
      methodologyVersion: "draft",
      editorialRevision: "draft",
      analyzedEdition: "Locked master",
      sources: [
        {
          id: "film-master",
          label: "Locked master",
          kind: "film-edition",
        },
        {
          id: "secondary-source",
          label: "Secondary research",
          kind: "reference",
          href: "https://example.com/research",
        },
      ],
    }],
  };

  const errors = validateFilmPackage(filmPackage);
  assert.ok(errors.some((error) =>
    error.includes("evidence/secondary-only") &&
    error.includes('must reference locked film-edition source "film-master"')
  ));
});

test("LOCKED real-film draft interpretive claims require canonical support", () => {
  const filmPackage: FilmPackage = {
    schemaVersion: 1,
    film: {
      slug: "locked-draft-unsupported-meaning",
      title: "Locked Draft Unsupported Meaning",
      year: 2026,
      director: "Director",
      runtime: "100 min",
      genre: ["Drama"],
      premise: "Premise",
      thesisQuestion: "Question?",
      status: "draft",
    },
    ingest: {
      edition: {
        state: "LOCKED",
        sourceId: "film-master",
        editionIdentity: "Locked test master",
        measuredRuntimeSeconds: 6000,
        timestampConvention: "Seconds from first film frame",
        verifiedAt: "2026-09-11",
      },
    },
    modules: [
      {
        id: "meaning",
        kind: "meaning",
        heading: "Meaning",
        spoilerLevel: "NONE",
        theme: "Theme",
        question: "Question?",
        apparentClaim: "An unsupported draft interpretation",
        counterevidence: "None yet",
        confidence: "LOW",
      },
      {
        id: "sources",
        kind: "sources-method",
        heading: "Sources",
        spoilerLevel: "NONE",
        methodologyVersion: "draft",
        editorialRevision: "draft",
        analyzedEdition: "Locked master",
        sources: [{
          id: "film-master",
          label: "Locked master",
          kind: "film-edition",
        }],
      },
    ],
  };

  const errors = validateFilmPackage(filmPackage);
  assert.ok(errors.includes(
    "meaning: real-film interpretive claims require canonical evidence support."
  ));
});

test("LOCKED real-film analytical summaries require canonical support", () => {
  const filmPackage: FilmPackage = {
    schemaVersion: 1,
    film: {
      slug: "unsupported-module-summaries",
      title: "Unsupported Module Summaries",
      year: 2026,
      director: "Director",
      runtime: "100 min",
      genre: ["Drama"],
      premise: "Premise",
      thesisQuestion: "Question?",
      status: "draft",
    },
    ingest: {
      edition: {
        state: "LOCKED",
        sourceId: "film-master",
        editionIdentity: "Locked test master",
        measuredRuntimeSeconds: 6000,
        timestampConvention: "Seconds from first film frame",
        verifiedAt: "2026-09-11",
      },
    },
    modules: [
      {
        id: "relationship",
        kind: "relationship",
        heading: "Relationship",
        spoilerLevel: "NONE",
        label: "A / B",
        summary: "Unsupported relationship synthesis.",
        events: [],
      },
      {
        id: "family",
        kind: "family-youth",
        heading: "Family",
        spoilerLevel: "NONE",
        summary: "Unsupported family/social-formation synthesis.",
        observations: [],
      },
      {
        id: "moral",
        kind: "moral-analysis",
        heading: "Moral",
        spoilerLevel: "NONE",
        summary: "Unsupported moral synthesis.",
        events: [],
      },
      {
        id: "sources",
        kind: "sources-method",
        heading: "Sources",
        spoilerLevel: "NONE",
        methodologyVersion: "draft",
        editorialRevision: "draft",
        analyzedEdition: "Locked master",
        sources: [{
          id: "film-master",
          label: "Locked master",
          kind: "film-edition",
        }],
      },
    ],
  };

  const errors = validateFilmPackage(filmPackage);
  assert.ok(errors.includes(
    "relationship/summary: real-film interpretive claims require canonical evidence support."
  ));
  assert.ok(errors.includes(
    "family/summary: real-film interpretive claims require canonical evidence support."
  ));
  assert.ok(errors.includes(
    "moral/summary: real-film interpretive claims require canonical evidence support."
  ));
});

test("LOCKED real-film draft evidence requires verified scene and numeric timestamp locators", () => {
  const filmPackage: FilmPackage = {
    schemaVersion: 1,
    film: {
      slug: "locked-draft-unlocated-evidence",
      title: "Locked Draft Unlocated Evidence",
      year: 2026,
      director: "Director",
      runtime: "100 min",
      genre: ["Drama"],
      premise: "Premise",
      thesisQuestion: "Question?",
      status: "draft",
    },
    ingest: {
      edition: {
        state: "LOCKED",
        sourceId: "film-master",
        editionIdentity: "Locked test master",
        measuredRuntimeSeconds: 6000,
        timestampConvention: "Seconds from first film frame",
        verifiedAt: "2026-09-11",
      },
    },
    evidence: [{
      id: "unlocated",
      label: "Unlocated",
      observation: "Canonical real-film evidence must be reproducibly locatable even before publication.",
      sourceIds: ["film-master"],
      spoilerLevel: "NONE",
    }],
    modules: [{
      id: "sources",
      kind: "sources-method",
      heading: "Sources",
      spoilerLevel: "NONE",
      methodologyVersion: "draft",
      editorialRevision: "draft",
      analyzedEdition: "Locked master",
      sources: [{
        id: "film-master",
        label: "Locked master",
        kind: "film-edition",
      }],
    }],
  };

  const errors = validateFilmPackage(filmPackage);
  assert.ok(errors.includes("evidence/unlocated: real-film evidence requires a canonical sceneId."));
  assert.ok(errors.includes("evidence/unlocated: real-film evidence requires timestampSeconds."));
});

test("LOCKED edition source must resolve to a film-edition source", () => {
  const filmPackage: FilmPackage = {
    schemaVersion: 1,
    film: {
      slug: "wrong-lock-source-kind",
      title: "Wrong Lock Source Kind",
      year: 2026,
      director: "Director",
      runtime: "100 min",
      genre: ["Drama"],
      premise: "Premise",
      thesisQuestion: "Question?",
      status: "draft",
    },
    ingest: {
      edition: {
        state: "LOCKED",
        sourceId: "metadata-page",
        editionIdentity: "Not actually a viewing master",
        measuredRuntimeSeconds: 6000,
        timestampConvention: "00:00:00",
        verifiedAt: "2026-09-11",
      },
    },
    modules: [{
      id: "sources",
      kind: "sources-method",
      heading: "Sources",
      spoilerLevel: "NONE",
      methodologyVersion: "draft",
      editorialRevision: "draft",
      analyzedEdition: "Bad lock",
      sources: [{
        id: "metadata-page",
        label: "Metadata page",
        kind: "reference",
        href: "https://example.com/metadata",
      }],
    }],
  };

  const errors = validateFilmPackage(filmPackage);
  assert.ok(errors.includes('film: ingest edition source "metadata-page" must have kind "film-edition".'));
});


test("TARGET_ONLY real-film edition blocks canonical scene registry", () => {
  const filmPackage: FilmPackage = {
    schemaVersion: 1,
    film: {
      slug: "target-only-scenes",
      title: "Target Only Scenes",
      year: 2026,
      director: "Director",
      runtime: "100 min",
      genre: ["Drama"],
      premise: "Premise",
      thesisQuestion: "Question?",
      status: "draft",
    },
    ingest: {
      edition: {
        state: "TARGET_ONLY",
        sourceId: "film-master",
        note: "Exact master is not locked.",
      },
    },
    scenes: [{
      id: "scene-1",
      sequenceIndex: 0,
      startTimestampSeconds: 0,
      endTimestampSeconds: 60,
      shortLabel: "Premature scene",
      spoilerLevel: "NONE",
      verificationState: "DRAFT",
    }],
    modules: [{
      id: "sources",
      kind: "sources-method",
      heading: "Sources",
      spoilerLevel: "NONE",
      methodologyVersion: "draft",
      editorialRevision: "draft",
      analyzedEdition: "Target only",
      sources: [{
        id: "film-master",
        label: "Target master",
        kind: "film-edition",
      }],
    }],
  };

  const errors = validateFilmPackage(filmPackage);
  assert.ok(errors.includes("film: canonical scene registry requires a LOCKED edition, not TARGET_ONLY."));
});

test("TARGET_ONLY real-film packages reject analytical modules before master lock", () => {
  const filmPackage: FilmPackage = {
    schemaVersion: 1,
    film: {
      slug: "target-only-analysis",
      title: "Target Only Analysis",
      year: 2026,
      director: "Director",
      runtime: "100 min",
      genre: ["Drama"],
      premise: "Premise",
      thesisQuestion: "Question?",
      status: "draft",
    },
    ingest: {
      edition: {
        state: "TARGET_ONLY",
        sourceId: "film-master",
        note: "Target selected; exact master not acquired.",
      },
    },
    modules: [
      {
        id: "premature-meaning",
        kind: "meaning",
        heading: "Premature meaning",
        spoilerLevel: "NONE",
        theme: "Speculative theme",
        question: "Question?",
        apparentClaim: "A claim written before viewing the locked film.",
        counterevidence: "None verified.",
        confidence: "LOW",
      },
      {
        id: "sources",
        kind: "sources-method",
        heading: "Sources",
        spoilerLevel: "NONE",
        methodologyVersion: "draft",
        editorialRevision: "draft",
        analyzedEdition: "Target only",
        sources: [{
          id: "film-master",
          label: "Target master",
          kind: "film-edition",
        }],
      },
    ],
  };

  const errors = validateFilmPackage(filmPackage);
  assert.ok(errors.includes(
    "module/premature-meaning: TARGET_ONLY real-film packages may contain only sources-method modules until the viewing master is LOCKED."
  ));
});

test("scene registry validates ids, sequence indexes and verified time ranges", () => {
  const filmPackage: FilmPackage = {
    schemaVersion: 1,
    film: {
      slug: "bad-scenes",
      title: "Bad Scenes",
      year: 2026,
      director: "Director",
      runtime: "100 min",
      genre: ["Drama"],
      premise: "Premise",
      thesisQuestion: "Question?",
      status: "draft",
    },
    ingest: {
      edition: {
        state: "LOCKED",
        sourceId: "film-master",
        editionIdentity: "Locked test master",
        measuredRuntimeSeconds: 6000,
        timestampConvention: "Seconds from first film frame",
        verifiedAt: "2026-09-11",
      },
    },
    scenes: [
      {
        id: "scene-1",
        sequenceIndex: 0,
        startTimestampSeconds: 10,
        shortLabel: "Verified without end",
        spoilerLevel: "NONE",
        verificationState: "VERIFIED",
      },
      {
        id: "scene-1",
        sequenceIndex: 0,
        startTimestampSeconds: 6100,
        endTimestampSeconds: 6200,
        shortLabel: "Outside runtime",
        spoilerLevel: "MINOR",
        verificationState: "DRAFT",
      },
    ],
    modules: [{
      id: "sources",
      kind: "sources-method",
      heading: "Sources",
      spoilerLevel: "NONE",
      methodologyVersion: "draft",
      editorialRevision: "draft",
      analyzedEdition: "Locked",
      sources: [{
        id: "film-master",
        label: "Locked master",
        kind: "film-edition",
      }],
    }],
  };

  const errors = validateFilmPackage(filmPackage);
  assert.ok(errors.includes('scenes: duplicate scene id "scene-1".'));
  assert.ok(errors.includes('scenes: duplicate sequence index "0".'));
  assert.ok(errors.includes("scene/scene-1: VERIFIED scene requires endTimestampSeconds."));
  assert.ok(errors.includes("scene/scene-1: startTimestampSeconds must be inside the locked edition runtime."));
  assert.ok(errors.includes("scene/scene-1: endTimestampSeconds exceeds the locked edition runtime."));
});

test("real-film evidence scene references must resolve to verified canonical scenes", () => {
  const filmPackage: FilmPackage = {
    schemaVersion: 1,
    film: {
      slug: "scene-evidence-links",
      title: "Scene Evidence Links",
      year: 2026,
      director: "Director",
      runtime: "100 min",
      genre: ["Drama"],
      premise: "Premise",
      thesisQuestion: "Question?",
      status: "draft",
    },
    ingest: {
      edition: {
        state: "LOCKED",
        sourceId: "film-master",
        editionIdentity: "Locked test master",
        measuredRuntimeSeconds: 6000,
        timestampConvention: "Seconds from first film frame",
        verifiedAt: "2026-09-11",
      },
    },
    scenes: [{
      id: "scene-draft",
      sequenceIndex: 0,
      startTimestampSeconds: 100,
      endTimestampSeconds: 160,
      shortLabel: "Draft scene",
      spoilerLevel: "NONE",
      verificationState: "DRAFT",
    }],
    evidence: [
      {
        id: "unknown-scene",
        label: "Unknown scene",
        observation: "Unknown scene reference.",
        sceneId: "scene-missing",
        sourceIds: ["film-master"],
        spoilerLevel: "NONE",
      },
      {
        id: "draft-scene",
        label: "Draft scene",
        observation: "Draft scene reference.",
        sceneId: "scene-draft",
        sourceIds: ["film-master"],
        spoilerLevel: "NONE",
      },
    ],
    modules: [{
      id: "sources",
      kind: "sources-method",
      heading: "Sources",
      spoilerLevel: "NONE",
      methodologyVersion: "draft",
      editorialRevision: "draft",
      analyzedEdition: "Locked",
      sources: [{
        id: "film-master",
        label: "Locked master",
        kind: "film-edition",
      }],
    }],
  };

  const errors = validateFilmPackage(filmPackage);
  assert.ok(errors.includes('evidence/unknown-scene: unknown scene id "scene-missing".'));
  assert.ok(errors.includes('evidence/draft-scene: canonical evidence cannot reference unverified scene "scene-draft".'));
});

test("real-film evidence timestampSeconds must fall inside its verified scene", () => {
  const filmPackage: FilmPackage = {
    schemaVersion: 1,
    film: {
      slug: "scene-time-range",
      title: "Scene Time Range",
      year: 2026,
      director: "Director",
      runtime: "100 min",
      genre: ["Drama"],
      premise: "Premise",
      thesisQuestion: "Question?",
      status: "draft",
    },
    ingest: {
      edition: {
        state: "LOCKED",
        sourceId: "film-master",
        editionIdentity: "Locked test master",
        measuredRuntimeSeconds: 6000,
        timestampConvention: "Seconds from first film frame",
        verifiedAt: "2026-09-11",
      },
    },
    scenes: [{
      id: "scene-verified",
      sequenceIndex: 0,
      startTimestampSeconds: 100,
      endTimestampSeconds: 160,
      shortLabel: "Verified scene",
      spoilerLevel: "NONE",
      verificationState: "VERIFIED",
    }],
    evidence: [
      {
        id: "before",
        label: "Before scene",
        observation: "Timestamp is before scene.",
        sceneId: "scene-verified",
        timestampSeconds: 99,
        sourceIds: ["film-master"],
        spoilerLevel: "NONE",
      },
      {
        id: "after",
        label: "After scene",
        observation: "Timestamp is after scene.",
        sceneId: "scene-verified",
        timestampSeconds: 161,
        sourceIds: ["film-master"],
        spoilerLevel: "NONE",
      },
      {
        id: "legacy",
        label: "Legacy locator",
        observation: "Real-film evidence must not use free-form timestamp text.",
        sceneId: "scene-verified",
        timestamp: "00:02:00",
        sourceIds: ["film-master"],
        spoilerLevel: "NONE",
      },
      {
        id: "no-scene",
        label: "No scene",
        observation: "Numeric timestamp without scene container.",
        timestampSeconds: 120,
        sourceIds: ["film-master"],
        spoilerLevel: "NONE",
      },
    ],
    modules: [{
      id: "sources",
      kind: "sources-method",
      heading: "Sources",
      spoilerLevel: "NONE",
      methodologyVersion: "draft",
      editorialRevision: "draft",
      analyzedEdition: "Locked",
      sources: [{
        id: "film-master",
        label: "Locked master",
        kind: "film-edition",
      }],
    }],
  };

  const errors = validateFilmPackage(filmPackage);
  assert.ok(errors.includes('evidence/before: timestampSeconds falls before scene "scene-verified".'));
  assert.ok(errors.includes('evidence/after: timestampSeconds falls at or after scene end "scene-verified".'));
  assert.ok(errors.includes("evidence/legacy: real-film evidence must use timestampSeconds instead of legacy timestamp text."));
  assert.ok(errors.includes("evidence/no-scene: timestampSeconds requires a canonical sceneId."));
});

test("valid locked real-film scene and evidence chain passes scene/time integrity", () => {
  const filmPackage: FilmPackage = {
    schemaVersion: 1,
    film: {
      slug: "valid-scene-chain",
      title: "Valid Scene Chain",
      year: 2026,
      director: "Director",
      runtime: "100 min",
      genre: ["Drama"],
      premise: "Premise",
      thesisQuestion: "Question?",
      status: "draft",
    },
    ingest: {
      edition: {
        state: "LOCKED",
        sourceId: "film-master",
        editionIdentity: "Locked test master",
        measuredRuntimeSeconds: 6000,
        timestampConvention: "Seconds from first film frame",
        verifiedAt: "2026-09-11",
      },
    },
    scenes: [{
      id: "scene-verified",
      sequenceIndex: 0,
      startTimestampSeconds: 100,
      endTimestampSeconds: 160,
      shortLabel: "Verified scene",
      spoilerLevel: "NONE",
      verificationState: "VERIFIED",
    }],
    evidence: [{
      id: "valid-evidence",
      label: "Valid evidence",
      observation: "Observed directly in the locked master.",
      sceneId: "scene-verified",
      timestampSeconds: 130,
      sourceIds: ["film-master"],
      spoilerLevel: "NONE",
    }],
    modules: [{
      id: "sources",
      kind: "sources-method",
      heading: "Sources",
      spoilerLevel: "NONE",
      methodologyVersion: "draft",
      editorialRevision: "draft",
      analyzedEdition: "Locked",
      sources: [{
        id: "film-master",
        label: "Locked master",
        kind: "film-edition",
      }],
    }],
  };

  const errors = validateFilmPackage(filmPackage);
  assert.deepEqual(errors, []);
});


test("canonical scene sequence cannot move backward or overlap", () => {
  const filmPackage: FilmPackage = {
    schemaVersion: 1,
    film: {
      slug: "scene-overlap",
      title: "Scene Overlap",
      year: 2026,
      director: "Director",
      runtime: "100 min",
      genre: ["Drama"],
      premise: "Premise",
      thesisQuestion: "Question?",
      status: "draft",
    },
    ingest: {
      edition: {
        state: "LOCKED",
        sourceId: "film-master",
        editionIdentity: "Locked test master",
        measuredRuntimeSeconds: 6000,
        timestampConvention: "Seconds from first film frame",
        verifiedAt: "2026-09-11",
      },
    },
    scenes: [
      {
        id: "scene-a",
        sequenceIndex: 0,
        startTimestampSeconds: 100,
        endTimestampSeconds: 180,
        shortLabel: "Scene A",
        spoilerLevel: "NONE",
        verificationState: "VERIFIED",
      },
      {
        id: "scene-b",
        sequenceIndex: 1,
        startTimestampSeconds: 170,
        endTimestampSeconds: 220,
        shortLabel: "Scene B",
        spoilerLevel: "NONE",
        verificationState: "VERIFIED",
      },
      {
        id: "scene-c",
        sequenceIndex: 2,
        startTimestampSeconds: 90,
        endTimestampSeconds: 99,
        shortLabel: "Scene C",
        spoilerLevel: "NONE",
        verificationState: "VERIFIED",
      },
    ],
    modules: [{
      id: "sources",
      kind: "sources-method",
      heading: "Sources",
      spoilerLevel: "NONE",
      methodologyVersion: "draft",
      editorialRevision: "draft",
      analyzedEdition: "Locked",
      sources: [{
        id: "film-master",
        label: "Locked master",
        kind: "film-edition",
      }],
    }],
  };

  const errors = validateFilmPackage(filmPackage);
  assert.ok(errors.includes('scene/scene-b: scene range overlaps previous scene "scene-a".'));
  assert.ok(errors.includes('scene/scene-c: startTimestampSeconds must not precede earlier sequence scene "scene-b".'));
});

test("scene autopsy anchors cannot point to evidence from another scene", () => {
  const filmPackage: FilmPackage = {
    schemaVersion: 1,
    film: {
      slug: "cross-scene-autopsy",
      title: "Cross Scene Autopsy",
      year: 2026,
      director: "Director",
      runtime: "100 min",
      genre: ["Drama"],
      premise: "Premise",
      thesisQuestion: "Question?",
      status: "draft",
    },
    ingest: {
      edition: {
        state: "LOCKED",
        sourceId: "film-master",
        editionIdentity: "Locked test master",
        measuredRuntimeSeconds: 6000,
        timestampConvention: "Seconds from first film frame",
        verifiedAt: "2026-09-11",
      },
    },
    scenes: [
      {
        id: "scene-a",
        sequenceIndex: 0,
        startTimestampSeconds: 100,
        endTimestampSeconds: 160,
        shortLabel: "Scene A",
        spoilerLevel: "NONE",
        verificationState: "VERIFIED",
      },
      {
        id: "scene-b",
        sequenceIndex: 1,
        startTimestampSeconds: 160,
        endTimestampSeconds: 220,
        shortLabel: "Scene B",
        spoilerLevel: "NONE",
        verificationState: "VERIFIED",
      },
    ],
    evidence: [{
      id: "evidence-b",
      label: "Evidence from B",
      observation: "Observed in scene B.",
      sceneId: "scene-b",
      timestampSeconds: 180,
      sourceIds: ["film-master"],
      spoilerLevel: "NONE",
    }],
    modules: [
      {
        id: "autopsy-a",
        kind: "autopsy",
        heading: "Autopsy",
        spoilerLevel: "NONE",
        sceneId: "scene-a",
        sceneLabel: "Scene A",
        act: "Act",
        motive: "Motive",
        knowledge: "Knowledge",
        pressure: "Pressure",
        consequence: "Consequence",
        claim: "Claim",
        anchors: [{
          id: "anchor-b",
          label: "Wrong scene",
          evidenceId: "evidence-b",
          point: { x: 0.5, y: 0.5 },
        }],
      },
      {
        id: "sources",
        kind: "sources-method",
        heading: "Sources",
        spoilerLevel: "NONE",
        methodologyVersion: "draft",
        editorialRevision: "draft",
        analyzedEdition: "Locked",
        sources: [{
          id: "film-master",
          label: "Locked master",
          kind: "film-edition",
        }],
      },
    ],
  };

  const errors = validateFilmPackage(filmPackage);
  assert.ok(errors.includes('autopsy-a/anchor-b: anchor evidence must belong to autopsy scene "scene-a".'));
});


test("real-film evidence cannot downgrade the spoiler level of its canonical scene", () => {
  const filmPackage: FilmPackage = {
    schemaVersion: 1,
    film: {
      slug: "scene-spoiler-downgrade",
      title: "Scene Spoiler Downgrade",
      year: 2026,
      director: "Director",
      runtime: "100 min",
      genre: ["Drama"],
      premise: "Premise",
      thesisQuestion: "Question?",
      status: "draft",
    },
    ingest: {
      edition: {
        state: "LOCKED",
        sourceId: "film-master",
        editionIdentity: "Locked test master",
        measuredRuntimeSeconds: 6000,
        timestampConvention: "Seconds from first film frame",
        verifiedAt: "2026-09-11",
      },
    },
    scenes: [{
      id: "scene-major",
      sequenceIndex: 0,
      startTimestampSeconds: 100,
      endTimestampSeconds: 160,
      shortLabel: "Major scene",
      spoilerLevel: "MAJOR",
      verificationState: "VERIFIED",
    }],
    evidence: [{
      id: "evidence-none",
      label: "Downgraded evidence",
      observation: "Evidence from a protected scene.",
      sceneId: "scene-major",
      timestampSeconds: 120,
      sourceIds: ["film-master"],
      spoilerLevel: "NONE",
    }],
    modules: [{
      id: "sources",
      kind: "sources-method",
      heading: "Sources",
      spoilerLevel: "NONE",
      methodologyVersion: "draft",
      editorialRevision: "draft",
      analyzedEdition: "Locked",
      sources: [{
        id: "film-master",
        label: "Locked master",
        kind: "film-edition",
      }],
    }],
  };

  const errors = validateFilmPackage(filmPackage);
  assert.ok(errors.includes(
    'evidence/evidence-none: spoiler level "NONE" cannot be lower than scene "scene-major" level "MAJOR".'
  ));
});

test("scene autopsy cannot downgrade the spoiler level of its canonical scene", () => {
  const filmPackage: FilmPackage = {
    schemaVersion: 1,
    film: {
      slug: "autopsy-spoiler-downgrade",
      title: "Autopsy Spoiler Downgrade",
      year: 2026,
      director: "Director",
      runtime: "100 min",
      genre: ["Drama"],
      premise: "Premise",
      thesisQuestion: "Question?",
      status: "draft",
    },
    ingest: {
      edition: {
        state: "LOCKED",
        sourceId: "film-master",
        editionIdentity: "Locked test master",
        measuredRuntimeSeconds: 6000,
        timestampConvention: "Seconds from first film frame",
        verifiedAt: "2026-09-11",
      },
    },
    scenes: [{
      id: "scene-ending",
      sequenceIndex: 0,
      startTimestampSeconds: 5000,
      endTimestampSeconds: 5100,
      shortLabel: "Ending scene",
      spoilerLevel: "ENDING",
      verificationState: "VERIFIED",
    }],
    modules: [
      {
        id: "autopsy-none",
        kind: "autopsy",
        heading: "Autopsy",
        spoilerLevel: "NONE",
        sceneId: "scene-ending",
        sceneLabel: "Ending scene",
        act: "Act",
        motive: "Motive",
        knowledge: "Knowledge",
        pressure: "Pressure",
        consequence: "Consequence",
        claim: "Claim",
      },
      {
        id: "sources",
        kind: "sources-method",
        heading: "Sources",
        spoilerLevel: "NONE",
        methodologyVersion: "draft",
        editorialRevision: "draft",
        analyzedEdition: "Locked",
        sources: [{
          id: "film-master",
          label: "Locked master",
          kind: "film-edition",
        }],
      },
    ],
  };

  const errors = validateFilmPackage(filmPackage);
  assert.ok(errors.includes(
    'autopsy-none: spoiler level "NONE" cannot be lower than scene "scene-ending" level "ENDING".'
  ));
});


test("published real-film packages reject draft scenes and unlocated evidence", () => {
  const filmPackage: FilmPackage = {
    schemaVersion: 1,
    film: {
      slug: "published-scene-location-gate",
      title: "Published Scene Location Gate",
      year: 2026,
      director: "Director",
      runtime: "100 min",
      genre: ["Drama"],
      premise: "Premise",
      thesisQuestion: "Question?",
      status: "published",
    },
    ingest: {
      edition: {
        state: "LOCKED",
        sourceId: "film-master",
        editionIdentity: "Locked test master",
        measuredRuntimeSeconds: 6000,
        timestampConvention: "Seconds from first film frame",
        verifiedAt: "2026-09-11",
      },
    },
    scenes: [{
      id: "scene-draft",
      sequenceIndex: 0,
      startTimestampSeconds: 100,
      endTimestampSeconds: 160,
      shortLabel: "Draft scene",
      spoilerLevel: "NONE",
      verificationState: "DRAFT",
    }],
    evidence: [{
      id: "unlocated-evidence",
      label: "Unlocated evidence",
      observation: "Published film evidence must be reproducibly locatable.",
      sourceIds: ["film-master"],
      spoilerLevel: "NONE",
    }],
    modules: [{
      id: "sources",
      kind: "sources-method",
      heading: "Sources",
      spoilerLevel: "NONE",
      methodologyVersion: "v1",
      editorialRevision: "r1",
      analyzedEdition: "Locked test master",
      lastReviewedAt: "2026-09-11",
      sources: [{
        id: "film-master",
        label: "Locked master",
        kind: "film-edition",
      }],
    }],
  };

  const errors = validateFilmPackage(filmPackage);
  assert.ok(errors.includes("scene/scene-draft: published real-film scenes must be VERIFIED."));
  assert.ok(errors.includes("evidence/unlocated-evidence: real-film evidence requires a canonical sceneId."));
  assert.ok(errors.includes("evidence/unlocated-evidence: real-film evidence requires timestampSeconds."));
});


test("real-film claim support cannot depend on more revealing evidence", () => {
  const filmPackage: FilmPackage = {
    schemaVersion: 1,
    film: {
      slug: "claim-support-spoiler-gate",
      title: "Claim Support Spoiler Gate",
      year: 2026,
      director: "Director",
      runtime: "100 min",
      genre: ["Drama"],
      premise: "Premise",
      thesisQuestion: "Question?",
      status: "draft",
    },
    ingest: {
      edition: {
        state: "LOCKED",
        sourceId: "film-master",
        editionIdentity: "Locked test master",
        measuredRuntimeSeconds: 6000,
        timestampConvention: "Seconds from first film frame",
        verifiedAt: "2026-09-11",
      },
    },
    scenes: [{
      id: "scene-safe",
      sequenceIndex: 0,
      startTimestampSeconds: 100,
      endTimestampSeconds: 180,
      shortLabel: "Safe scene",
      spoilerLevel: "NONE",
      verificationState: "VERIFIED",
    }],
    evidence: [
      {
        id: "evidence-none",
        label: "Safe evidence",
        observation: "Safe observation",
        sceneId: "scene-safe",
        timestampSeconds: 110,
        sourceIds: ["film-master"],
        spoilerLevel: "NONE",
      },
      {
        id: "evidence-minor",
        label: "Protected evidence",
        observation: "Protected observation",
        sceneId: "scene-safe",
        timestampSeconds: 120,
        sourceIds: ["film-master"],
        spoilerLevel: "MINOR",
      },
    ],
    modules: [
      {
        id: "meaning-low",
        kind: "meaning",
        heading: "Meaning",
        spoilerLevel: "NONE",
        theme: "Theme",
        question: "Question?",
        apparentClaim: "Low-level claim",
        counterevidence: "Counterevidence",
        confidence: "MEDIUM",
        support: { evidenceIds: ["evidence-minor"] },
      },
      {
        id: "meaning-safe",
        kind: "meaning",
        heading: "Meaning safe",
        spoilerLevel: "MINOR",
        theme: "Theme",
        question: "Question?",
        apparentClaim: "Protected claim",
        counterevidence: "Counterevidence",
        confidence: "MEDIUM",
        support: { evidenceIds: ["evidence-none"] },
      },
      {
        id: "craft",
        kind: "craft",
        heading: "Craft",
        spoilerLevel: "NONE",
        observations: [{
          id: "craft-minor",
          mechanism: "LIGHTING",
          observation: "Protected craft observation",
          interpretiveEffect: "Protected effect",
          confidence: "MEDIUM",
          spoilerLevel: "MINOR",
        }],
        pressureAssessments: [{
          id: "pressure-none",
          kind: "EMPATHY",
          rationale: "Low-level pressure assessment",
          craftObservationIds: ["craft-minor"],
          confidence: "MEDIUM",
          spoilerLevel: "NONE",
        }],
      },
      {
        id: "autopsy-low",
        kind: "autopsy",
        heading: "Autopsy",
        spoilerLevel: "NONE",
        sceneId: "scene-safe",
        sceneLabel: "Safe scene",
        act: "Act",
        motive: "Motive",
        knowledge: "Knowledge",
        pressure: "Pressure",
        consequence: "Consequence",
        claim: "Low-level autopsy claim",
        anchors: [{
          id: "anchor-minor",
          label: "Protected anchor",
          evidenceId: "evidence-minor",
          point: { x: 0.5, y: 0.5 },
        }],
      },
      {
        id: "sources",
        kind: "sources-method",
        heading: "Sources",
        spoilerLevel: "NONE",
        methodologyVersion: "draft",
        editorialRevision: "draft",
        analyzedEdition: "Locked master",
        sources: [{
          id: "film-master",
          label: "Locked master",
          kind: "film-edition",
        }],
      },
    ],
  };

  const errors = validateFilmPackage(filmPackage);

  assert.ok(errors.includes(
    'meaning-low: support evidence "evidence-minor" spoiler level "MINOR" exceeds claim level "NONE".'
  ));
  assert.equal(errors.some((error) => error.startsWith("meaning-safe: support evidence")), false);
  assert.ok(errors.includes(
    'craft/pressure-none: craft observation "craft-minor" spoiler level "MINOR" exceeds assessment level "NONE".'
  ));
  assert.ok(errors.includes(
    'autopsy-low/anchor-minor: anchor evidence "evidence-minor" spoiler level "MINOR" exceeds autopsy level "NONE".'
  ));
});

test("documentation concrete repository file references resolve", () => {
  const markdownFiles = [
    "README.md",
    "AGENTS.md",
    ...readdirSync("docs")
      .filter((name) => name.endsWith(".md"))
      .map((name) => "docs/" + name),
  ];
  const concreteRepoPath =
    /`((?:src|scripts|tests|docs|\.github)\/[^`\n]+?\.(?:ts|tsx|md|mjs|cjs|js|jsx|json|yml|yaml|css))`/g;
  const missing: string[] = [];

  for (const markdownFile of markdownFiles) {
    const markdown = readFileSync(markdownFile, "utf8");

    for (const match of markdown.matchAll(concreteRepoPath)) {
      const reference = match[1];
      if (reference && !existsSync(reference)) {
        missing.push(markdownFile + ": " + reference);
      }
    }
  }

  assert.deepEqual(missing, []);
});
