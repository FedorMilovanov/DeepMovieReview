import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ArticleTable } from "../src/components/film-article/article-table";
import { EvidenceBasisLine } from "../src/components/evidence-basis";
import { FilmEvidenceMap } from "../src/components/film-modules/evidence-map";
import { FilmSceneTable } from "../src/components/film-modules/scene-table";
import { FilmComparisonView } from "../src/components/film-comparison";
import { theFastAndTheFuriousDraftPackage } from "../src/data/films/the-fast-and-the-furious";
import { createRequire } from "node:module";
import test from "node:test";
// Load the same CSS import reader used by the audits from the repository root,
// not the temporary TypeScript test output directory.
const { readStylesheet } = createRequire(`${process.cwd()}/package.json`)(
  "./scripts/lib/style-sources.mjs",
) as { readStylesheet: (path: string) => string };
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { projectFilmComparison, projectFilmModule } from "../src/lib/film-module-projection";
import { publishedFilmStillsEnabled } from "../src/data/site-config";
import { trumanArticleStills } from "../src/data/films/the-truman-show-stills";
import { projectHomepage } from "../src/lib/homepage-projection";
import { validateFilmPackage } from "../src/lib/film-package-integrity";
import {
  articlePageMetadata,
  filmPageMetadata,
  fitDescription,
  fitTitle,
  heroImageFromAsset,
  productionPageMetadata,
  shareImageFromAsset,
} from "../src/lib/page-metadata";
import {
  PRODUCTION_SOURCE_MINIMUM,
  PRODUCTION_TERTIARY_MAX_SHARE,
  validateProductionDossier,
  validateProductionDossierRegistry,
} from "../src/lib/production-dossier";
import { productionDossiers, getProductionDossier } from "../src/data/films/production-dossiers";
import { theTrumanShowProductionDossier } from "../src/data/films/the-truman-show-production";
import { articleIllustrations, illustrationFacts, illustrationView } from "../src/data/film-illustrations";
import {
  arcCredibilityLabels,
  characterPresentationLabels,
  identificationLabels,
} from "../src/lib/presentation-labels";
import { validateFilmArticle } from "../src/lib/film-article-integrity";
import { reviewBasis, tallyReviewBasis } from "../src/lib/evidence-review";
import { evidenceBasisMaterialLabels, evidenceBasisOutcomeLabels } from "../src/lib/presentation-labels";
import {
  canIndexSite,
  resolveIndexingRequest,
  resolveSiteOrigin,
} from "../src/lib/site-publication-policy";
import { validateVisualAssetManifest } from "../src/lib/visual-assets";
import { downgradeTier, lowerOfTier, selectInitialTier } from "../src/lib/experience-quality";
import { canRevealSpoiler, filterBySpoilerLevel, parseSpoilerLevel, withSpoilerQuery } from "../src/lib/spoilers";
import { filterFilmIndex, filmIndexStatusLabel } from "../src/lib/film-index";
import { pluralRu } from "../src/lib/plural-ru";
import { COMPARISON_DIMENSIONS, type FilmPackage, type CharactersModule } from "../src/lib/film-package";
import { theTrumanShowDraftPackage } from "../src/data/films/the-truman-show";
import {
  TRUMAN_MASTER_RUNTIME_SECONDS,
  trumanEvidenceReanchors,
  trumanMasterChapters,
} from "../src/data/films/the-truman-show-master-reanchor";
import { trumanMasterSegmentation } from "../src/data/films/the-truman-show-master-segmentation";
import {
  trumanCanonicalScenesWithoutResearchOrigin,
  trumanResearchSceneRewire,
  TRUMAN_CREDITS_START_SECONDS,
  TRUMAN_INVENTORY_RUNTIME_SECONDS,
  trumanCanonicalSceneSummary,
  trumanCanonicalScenes,
  trumanNonSceneChapters,
} from "../src/data/films/the-truman-show-scene-inventory";
import {
  trumanPostLockEvidenceSummary,
  trumanPostLockEvidenceVerifications,
  trumanVisualVerificationSummary,
  trumanVisualVerifications,
} from "../src/data/films/the-truman-show-visual-verification";
import {
  TRUMAN_LOCKED_EDITION_SOURCE_ID,
  trumanCanonicalEvidence,
  trumanCanonicalEvidenceSummary,
} from "../src/data/films/the-truman-show-canonical-evidence";
import { theTrumanShowCanonicalPackage } from "../src/data/films/the-truman-show-canonical";
import { theTrumanShowArticle } from "../src/data/films/the-truman-show-article";
import {
  filmShareAssets,
  getFilmShareAsset,
  getProductionCoverAsset,
} from "../src/data/film-share-assets";
import {
  describeTrumanMeasurement,
  formatMasterTimecode,
  resolveTrumanMeasurement,
  trumanMasterHolds,
  trumanMasterSilences,
  trumanMasterTimingTotals,
  trumanMasterWindows,
  trumanMeasuredDigitStrings,
} from "../src/data/films/the-truman-show-master-windows";
import { projectArticleSections, articleReadingMinutes, countArticleWords } from "../src/lib/film-article";
import {
  trumanEvidenceMigrationWave1,
  trumanEvidenceMigrationWave2,
  trumanEvidenceMigrationWave3,
} from "../src/data/films/the-truman-show-evidence-migration";
import {
  TRUMAN_MASTER_ENGLISH_SUBTITLE_CUES,
  TRUMAN_MASTER_SCENE_CHANGE_CANDIDATES,
  TRUMAN_SCENE_CHANGE_THRESHOLD,
  deriveTrumanMasterChapterMetrics,
  trumanMasterChapterMetrics,
} from "../src/data/films/the-truman-show-master-metrics";
import {
  trumanEvidenceAlreadyAtomicIds,
  trumanEvidenceRewriteCandidates,
} from "../src/data/films/the-truman-show-evidence-rewrite";
import {
  trumanEvidencePromotionReadiness,
  trumanEvidencePromotionSummary,
} from "../src/data/films/the-truman-show-promotion-readiness";

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

test("the frozen research draft is not a second source of truth", () => {
  // Two packages for one film is how a site comes to have two answers. The canonical
  // package is served; the research draft is an archive, and the rule that keeps it
  // an archive is that nothing under src/ imports it.
  // grep exits 1 when nothing matches, which is the passing result here.
  const hits = spawnSync("grep", ["-rl", 'from "@/data/films/the-truman-show"', "src"], {
    encoding: "utf8",
  }).stdout.trim();
  assert.equal(hits, "", `the frozen draft must not be imported: ${hits}`);
  const draft = readFileSync("src/data/films/the-truman-show.ts", "utf8");
  assert.match(draft, /ЗАМОРОЖЕННЫЙ ИССЛЕДОВАТЕЛЬСКИЙ ЧЕРНОВИК/);
  assert.match(draft, /the-truman-show-canonical\.ts/);
});

test("a page's own robots tag never contradicts robots.txt", () => {
  // The film routes wrote `robots: undefined` for any published film, which drops the
  // layout's noindex at the page level while robots.txt still says Disallow: /. On a
  // preview deployment that made a published page indexable by its own tag.
  const filmRoutes = [
    readFileSync("src/app/films/[slug]/page.tsx", "utf8"),
    readFileSync("src/app/films/[slug]/article/page.tsx", "utf8"),
    readFileSync("src/app/films/[slug]/making/page.tsx", "utf8"),
  ];
  for (const source of filmRoutes) {
    assert.match(source, /film\.status === "published" && siteIndexingEnabled\(\)/);
  }
  // The site-wide consumers read the switch from one place too.
  for (const route of ["src/app/robots.ts", "src/app/sitemap.ts", "src/app/layout.tsx"]) {
    const source = readFileSync(route, "utf8");
    assert.match(source, /siteIndexingEnabled\(\)/, route);
    assert.doesNotMatch(source, /resolveIndexingRequest\(/, `${route} must not re-derive the switch`);
  }
});

test("a deployment indexes itself without anyone setting a variable", () => {
  // Zero-config: a real host means a public site; a Vercel preview deployment never
  // competes with the production host in an index; and an explicit flag still wins.
  assert.equal(resolveIndexingRequest({}), false, "no host and no flag stays closed");
  assert.equal(resolveIndexingRequest({ VERCEL_PROJECT_PRODUCTION_URL: "deep.vercel.app" }), true);
  assert.equal(
    resolveIndexingRequest({ VERCEL_PROJECT_PRODUCTION_URL: "deep.vercel.app", VERCEL_ENV: "preview" }),
    false,
    "a preview deployment is not the site",
  );
  assert.equal(
    resolveIndexingRequest({ VERCEL_PROJECT_PRODUCTION_URL: "deep.vercel.app", VERCEL_ENV: "production" }),
    true,
  );
  assert.equal(resolveIndexingRequest({ DMR_SITE_INDEXING_ENABLED: "false", VERCEL_ENV: "production", DMR_SITE_URL: "https://a.example" }), false);
  assert.equal(resolveIndexingRequest({ DMR_SITE_INDEXING_ENABLED: "true" }), true);

  // A preview deployment is a hard floor: the flag cannot open one.
  assert.equal(
    resolveIndexingRequest({
      DMR_SITE_INDEXING_ENABLED: "true",
      DMR_SITE_URL: "https://a.example",
      VERCEL_ENV: "preview",
    }),
    false,
    "no variable may open a preview deployment to crawlers",
  );

  // Origin: explicit URL, then the platform's production host, then localhost.
  // The third argument is the environment, injected so a test that passes
  // `undefined` exercises the fallback instead of inheriting the CI job's variables.
  const noEnv = {};
  assert.equal(resolveSiteOrigin("https://a.example/path", "b.vercel.app", noEnv), "https://a.example");
  assert.equal(resolveSiteOrigin(undefined, "deep.vercel.app", noEnv), "https://deep.vercel.app");
  assert.equal(resolveSiteOrigin(undefined, undefined, noEnv), "http://localhost:3000");
  assert.equal(
    resolveSiteOrigin(undefined, undefined, { DMR_SITE_URL: "https://from-env.example/x" }),
    "https://from-env.example",
  );
  assert.equal(
    resolveSiteOrigin(undefined, undefined, { VERCEL_PROJECT_PRODUCTION_URL: "prod.vercel.app" }),
    "https://prod.vercel.app",
  );
});

test("site origin normalization keeps only a safe http(s) origin", () => {
  assert.equal(resolveSiteOrigin("https://example.com/path?query=1#hash"), "https://example.com");
  assert.equal(resolveSiteOrigin("http://localhost:3000/preview"), "http://localhost:3000");
  assert.throws(() => resolveSiteOrigin("file:///tmp/site"), /DMR_SITE_URL must use http\(s\)/);
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

test("generated visual assets require reproducible provenance metadata", () => {
  const baseManifest = {
    schemaVersion: 1 as const,
    id: "generated-visual-test",
    role: "hero" as const,
    title: "Generated visual test",
    alt: "Generated fixture visual",
    aspectRatio: 2,
    focalPoint: { x: 0.5, y: 0.5 },
    variants: [{
      id: "display",
      purpose: "display" as const,
      src: "/assets/generated.webp",
      format: "webp" as const,
      width: 1200,
      height: 600,
    }],
  };

  const missing = validateVisualAssetManifest({
    ...baseManifest,
    provenance: { sourceKind: "generated" },
  });
  assert.ok(missing.includes("Generated assets require provenance.generator."));
  assert.ok(missing.includes("Generated assets require provenance.promptVersion."));
  assert.ok(missing.includes("Generated assets require provenance.createdAt."));

  const invalidDate = validateVisualAssetManifest({
    ...baseManifest,
    provenance: {
      sourceKind: "generated",
      generator: "Test generator",
      promptVersion: "test-v1",
      createdAt: "2026-02-30",
    },
  });
  assert.ok(invalidDate.includes("provenance.createdAt must be a real YYYY-MM-DD calendar date."));

  const valid = validateVisualAssetManifest({
    ...baseManifest,
    provenance: {
      sourceKind: "generated",
      generator: "Test generator",
      promptVersion: "test-v1",
      createdAt: "2026-09-14",
    },
  });
  assert.deepEqual(valid, []);
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
  const scoped = [
    { id: "safe", spoilerLevel: "NONE" },
    { id: "minor", spoilerLevel: "MINOR" },
    { id: "ending", spoilerLevel: "ENDING" },
  ] as const;
  assert.deepEqual(
    filterBySpoilerLevel(scoped, "MINOR").map((item) => item.id),
    ["safe", "minor"],
  );
  assert.deepEqual(filterBySpoilerLevel(scoped, "NONE").map((item) => item.id), ["safe"]);
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

test("MASTER_IDENTIFIED keeps the research tier fail-closed while recording measured master identity", () => {
  const filmPackage = buildResearchTierPackage();
  filmPackage.ingest = {
    edition: {
      state: "MASTER_IDENTIFIED",
      sourceId: "film-master",
      editionIdentity: "Exact file-based viewing master",
      measuredRuntimeSeconds: 6000,
      timestampConvention: "Matroska PTS from 00:00:00.000",
      identifiedAt: "2026-09-15",
      note: "Master measured; canonical evidence re-verification still in progress.",
      frameRate: "24000/1001",
      audioTrack: "English Original",
      subtitleTrack: "Embedded English SubRip",
      masterDigest: "sha256:test-master",
    },
  };

  const errors = validateFilmPackage(filmPackage);
  assert.deepEqual(errors, []);
});

test("MASTER_IDENTIFIED requires complete measured identity metadata", () => {
  const filmPackage = buildResearchTierPackage();
  filmPackage.ingest = {
    edition: {
      state: "MASTER_IDENTIFIED",
      sourceId: "film-master",
      editionIdentity: "   ",
      measuredRuntimeSeconds: 0,
      timestampConvention: "",
      identifiedAt: "2026-13-99",
      note: "",
    },
  };

  const errors = validateFilmPackage(filmPackage);
  assert.ok(errors.includes("film: MASTER_IDENTIFIED edition requires editionIdentity."));
  assert.ok(errors.includes("film: MASTER_IDENTIFIED edition requires positive measuredRuntimeSeconds."));
  assert.ok(errors.includes("film: MASTER_IDENTIFIED edition requires timestampConvention."));
  assert.ok(errors.includes("film: MASTER_IDENTIFIED edition state requires a note."));
  assert.ok(errors.includes("film: MASTER_IDENTIFIED edition identifiedAt must use a valid YYYY-MM-DD calendar date."));
});

test("MASTER_IDENTIFIED measured runtime constrains research scene and evidence timestamps", () => {
  const filmPackage = buildResearchTierPackage();
  filmPackage.ingest = {
    edition: {
      state: "MASTER_IDENTIFIED",
      sourceId: "film-master",
      editionIdentity: "Exact file-based viewing master",
      measuredRuntimeSeconds: 100,
      timestampConvention: "Matroska PTS from 00:00:00.000",
      identifiedAt: "2026-09-15",
      note: "Measured master under re-verification.",
    },
  };
  filmPackage.scenes = [{
    id: "research-scene",
    sequenceIndex: 1,
    shortLabel: "Opening",
    startTimestampSeconds: 10,
    verificationState: "DRAFT",
    spoilerLevel: "NONE",
  }];
  filmPackage.evidence = [{
    id: "research-evidence",
    label: "Secondary evidence",
    observation: "Timestamp deliberately outside measured runtime.",
    sceneId: "research-scene",
    timestampSeconds: 101,
    sourceIds: ["reference-source"],
    spoilerLevel: "NONE",
  }];

  const errors = validateFilmPackage(filmPackage);
  assert.ok(errors.includes("evidence/research-evidence: timestampSeconds must be inside the measured edition runtime."));
});

test("MASTER_IDENTIFIED still blocks canonical evidence outside the research tier", () => {
  const filmPackage = buildResearchTierPackage();
  filmPackage.research = undefined;
  filmPackage.ingest = {
    edition: {
      state: "MASTER_IDENTIFIED",
      sourceId: "film-master",
      editionIdentity: "Exact file-based viewing master",
      measuredRuntimeSeconds: 6000,
      timestampConvention: "Matroska PTS from 00:00:00.000",
      identifiedAt: "2026-09-15",
      note: "Master measured; canonical promotion not complete.",
    },
  };

  const errors = validateFilmPackage(filmPackage);
  assert.ok(errors.includes("film: canonical evidence requires a LOCKED edition, not MASTER_IDENTIFIED."));
  assert.ok(errors.includes("film: canonical scene registry requires a LOCKED edition, not MASTER_IDENTIFIED."));
});

test("research tier cannot stay in place once the package is published", () => {
  const filmPackage = buildResearchTierPackage();
  filmPackage.film.status = "published";
  const errors = validateFilmPackage(filmPackage);
  assert.ok(errors.includes("research: a published package cannot remain in the SECONDARY_SOURCES research tier."));
});

test("research tier is rejected once the edition is LOCKED", () => {
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
  assert.ok(errors.includes("research: the SECONDARY_SOURCES tier is only valid before the edition is LOCKED."));
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

test("research-tier evidence must not cite the active pre-lock film-edition source", () => {
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
  assert.ok(errors.some((error) => error.includes("research-tier evidence must not cite the active pre-lock film-edition source \"film-master\".")));
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
  assert.ok(errors.includes("scene/scene-1: startTimestampSeconds must be inside the measured edition runtime."));
  assert.ok(errors.includes("scene/scene-1: endTimestampSeconds exceeds the measured edition runtime."));
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

test("documentation preserves the SECONDARY_SOURCES pre-lock exception", () => {
  const readme = readFileSync("README.md", "utf8");
  const agentRules = readFileSync("AGENTS.md", "utf8");
  const domainModules = readFileSync("docs/26-FILM-DOMAIN-MODULES-V0.md", "utf8");
  const ingestStatus = readFileSync("docs/29-FILM-001-INGEST-STATUS.md", "utf8");

  assert.ok(readme.includes("SECONDARY_SOURCES"));
  assert.ok(readme.includes("MASTER_IDENTIFIED"));
  assert.ok(!readme.includes(
    "`TARGET_ONLY` packages cannot contain analytical modules beyond `sources-method`, canonical scenes or evidence"
  ));
  assert.ok(agentRules.includes("MASTER_IDENTIFIED"));
  assert.ok(agentRules.includes("Research-tier evidence may reference only `DRAFT` scene estimates"));
  assert.ok(domainModules.includes("Outside the explicit `SECONDARY_SOURCES` research tier"));
  assert.ok(ingestStatus.includes(
    "`claim → evidence record → declared secondary source + DRAFT scene estimate`"
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

test("russian pluralization follows the one/few/many rule with the 11-14 exception", () => {
  const cases: Array<[number, string]> = [
    [0, "many"],
    [1, "one"],
    [2, "few"],
    [4, "few"],
    [5, "many"],
    [10, "many"],
    [11, "many"],
    [12, "many"],
    [14, "many"],
    [21, "one"],
    [22, "few"],
    [25, "many"],
    [101, "one"],
    [102, "few"],
    [111, "many"],
    [112, "many"],
    [114, "many"],
    [121, "one"],
    [122, "few"],
    [125, "many"],
  ];

  for (const [count, expected] of cases) {
    assert.equal(pluralRu(count, "one", "few", "many"), expected, `count=${count}`);
  }
});

test("film index filter matches localized/original title, year and status and keeps the full list on empty query", () => {
  const films = [
    { title: "Пилотный фильм", year: 2024, status: "фикстура" },
    { title: "Шоу Трумана", originalTitle: "The Truman Show", year: 1998, status: "черновик" },
    { title: "Форсаж", originalTitle: "The Fast and the Furious", year: 2001, status: "черновик" },
  ];

  assert.deepEqual(filterFilmIndex(films, ""), films);
  assert.deepEqual(filterFilmIndex(films, "   "), films);
  assert.deepEqual(
    filterFilmIndex(films, "truman").map((film) => film.title),
    ["Шоу Трумана"],
  );
  assert.deepEqual(
    filterFilmIndex(films, "1998").map((film) => film.title),
    ["Шоу Трумана"],
  );
  assert.deepEqual(
    filterFilmIndex(films, "ЧЕРНОВИК").map((film) => film.title),
    ["Шоу Трумана", "Форсаж"],
  );
  assert.deepEqual(
    filterFilmIndex(films, "  форсаж  ").map((film) => film.title),
    ["Форсаж"],
  );
  assert.deepEqual(
    filterFilmIndex(films, "The\t\tTruman   Show").map((film) => film.title),
    ["Шоу Трумана"],
  );
  assert.deepEqual(filterFilmIndex(films, "несуществующий фильм"), []);
});


test("Film 001 re-anchor ledger exactly covers the research evidence inventory", () => {
  const evidenceIds = [...(theTrumanShowDraftPackage.evidence ?? []).map((item) => item.id)].sort();
  const ledgerIds = [...trumanEvidenceReanchors.map((item) => item.evidenceId)].sort();

  assert.equal(trumanEvidenceReanchors.length, 39);
  assert.equal(new Set(ledgerIds).size, ledgerIds.length);
  assert.deepEqual(ledgerIds, evidenceIds);
});

test("Film 001 embedded master chapters form one exact continuous timeline", () => {
  assert.equal(trumanMasterChapters.length, 24);
  assert.equal(trumanMasterChapters[0]?.startTimestampSeconds, 0);
  assert.equal(
    trumanMasterChapters[trumanMasterChapters.length - 1]?.endTimestampSeconds,
    TRUMAN_MASTER_RUNTIME_SECONDS,
  );

  for (const [index, chapter] of trumanMasterChapters.entries()) {
    assert.equal(chapter.sequenceIndex, index + 1);
    assert.ok(chapter.endTimestampSeconds > chapter.startTimestampSeconds);

    const next = trumanMasterChapters[index + 1];
    if (next) {
      assert.equal(
        chapter.endTimestampSeconds,
        next.startTimestampSeconds,
        `chapter boundary drift between ${chapter.id} and ${next.id}`,
      );
    }
  }
});

test("Film 001 re-anchor timestamps stay inside their declared master chapters", () => {
  const chaptersById = new Map(trumanMasterChapters.map((chapter) => [chapter.id, chapter]));

  for (const record of trumanEvidenceReanchors) {
    const referencedChapterIds = [
      ...record.candidateChapterIds,
      ...record.anchors.map((anchor) => anchor.chapterId),
    ];

    for (const chapterId of referencedChapterIds) {
      assert.ok(chaptersById.has(chapterId), `${record.evidenceId}: unknown chapter ${chapterId}`);
    }

    if (record.status === "TRANSCRIPT_ANCHORED") {
      assert.ok(record.anchors.length > 0, `${record.evidenceId}: transcript state requires anchors`);
      assert.equal(record.candidateChapterIds.length, 0);
    }

    if (record.status === "MIXED_REVIEW_REQUIRED") {
      assert.ok(record.anchors.length > 0, `${record.evidenceId}: mixed state requires a grounded cue`);
      assert.ok(
        record.candidateChapterIds.length > 0,
        `${record.evidenceId}: mixed state must preserve the visual-review boundary`,
      );
    }

    if (record.status === "VISUAL_REVIEW_REQUIRED") {
      assert.equal(
        record.anchors.length,
        0,
        `${record.evidenceId}: visual-only state must not masquerade as transcript verification`,
      );
      assert.ok(
        record.candidateChapterIds.length > 0,
        `${record.evidenceId}: visual-review record needs at least one bounded search chapter`,
      );
    }

    for (const anchor of record.anchors) {
      assert.equal(anchor.basis, "EMBEDDED_ENGLISH_SUBTITLE");
      const chapter = chaptersById.get(anchor.chapterId);
      assert.ok(chapter);
      assert.ok(
        anchor.timestampSeconds >= chapter.startTimestampSeconds &&
          anchor.timestampSeconds < chapter.endTimestampSeconds,
        `${record.evidenceId}: ${anchor.timestampSeconds} must stay inside ${anchor.chapterId}`,
      );
    }
  }
});


test("Film 001 evidence migration wave 1 is dependency-safe", () => {
  const currentEvidenceIds = new Set(
    (theTrumanShowDraftPackage.evidence ?? []).map((item) => item.id),
  );
  const source = readFileSync("src/data/films/the-truman-show.ts", "utf8");
  const replacementIds: string[] = [];

  assert.equal(trumanEvidenceMigrationWave1.length, 7);
  assert.equal(
    trumanEvidenceMigrationWave1.reduce(
      (total, plan) => total + plan.expectedSupportReferences,
      0,
    ),
    14,
  );

  for (const plan of trumanEvidenceMigrationWave1) {
    assert.ok(
      currentEvidenceIds.has(plan.retiringEvidenceId),
      `${plan.retiringEvidenceId}: retiring evidence must still exist`,
    );

    const occurrences = source.split(`"${plan.retiringEvidenceId}"`).length - 1;
    assert.equal(
      occurrences - 1,
      plan.expectedSupportReferences,
      `${plan.retiringEvidenceId}: support fan-out drifted`,
    );

    assert.ok(
      plan.expectedSupportReferences <= 3,
      `${plan.retiringEvidenceId}: wave 1 must remain low-fan-out`,
    );

    const reanchor = trumanEvidenceReanchors.find(
      (record) => record.evidenceId === plan.retiringEvidenceId,
    );
    assert.ok(reanchor, `${plan.retiringEvidenceId}: missing master re-anchor record`);

    for (const replacement of plan.replacements) {
      replacementIds.push(replacement.id);
      assert.ok(
        !currentEvidenceIds.has(replacement.id),
        `${replacement.id}: replacement ID already exists in Film 001`,
      );

      assert.ok(replacement.chapterIds.length > 0);
      for (const chapterId of replacement.chapterIds) {
        assert.ok(
          trumanMasterChapters.some((chapter) => chapter.id === chapterId),
          `${replacement.id}: unknown chapter ${chapterId}`,
        );
      }

      if (replacement.grounding === "TRANSCRIPT") {
        assert.notEqual(
          replacement.anchorTimestampSeconds,
          undefined,
          `${replacement.id}: transcript replacement requires a master cue`,
        );
      }

      if (replacement.grounding === "VISUAL") {
        assert.equal(
          replacement.anchorTimestampSeconds,
          undefined,
          `${replacement.id}: visual-only replacement must not fake a transcript timestamp`,
        );
      }

      if (replacement.anchorTimestampSeconds !== undefined) {
        const containingChapter = trumanMasterChapters.find(
          (chapter) =>
            replacement.chapterIds.includes(chapter.id) &&
            replacement.anchorTimestampSeconds! >= chapter.startTimestampSeconds &&
            replacement.anchorTimestampSeconds! < chapter.endTimestampSeconds,
        );
        assert.ok(
          containingChapter,
          `${replacement.id}: anchor must fall inside one declared master chapter`,
        );

        assert.ok(
          reanchor?.anchors.some(
            (anchor) => anchor.timestampSeconds === replacement.anchorTimestampSeconds,
          ),
          `${replacement.id}: anchor must come from the measured re-anchor ledger`,
        );
      }
    }
  }

  assert.equal(new Set(replacementIds).size, replacementIds.length);
});


test("Film 001 master-derived metrics reconcile to the measured scan", () => {
  assert.equal(TRUMAN_SCENE_CHANGE_THRESHOLD, 0.32);
  assert.equal(trumanMasterChapterMetrics.length, 24);

  const ids = trumanMasterChapterMetrics.map((metric) => metric.chapterId);
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual(
    ids,
    trumanMasterChapters.map((chapter) => chapter.id),
  );

  for (const metric of trumanMasterChapterMetrics) {
    assert.ok(Number.isInteger(metric.sceneChangeCandidates));
    assert.ok(metric.sceneChangeCandidates >= 0);
    assert.ok(Number.isInteger(metric.embeddedEnglishSubtitleCues));
    assert.ok(metric.embeddedEnglishSubtitleCues >= 0);
  }

  assert.equal(
    trumanMasterChapterMetrics.reduce(
      (total, metric) => total + metric.sceneChangeCandidates,
      0,
    ),
    TRUMAN_MASTER_SCENE_CHANGE_CANDIDATES,
  );
  assert.equal(TRUMAN_MASTER_SCENE_CHANGE_CANDIDATES, 1036);

  assert.equal(
    trumanMasterChapterMetrics.reduce(
      (total, metric) => total + metric.embeddedEnglishSubtitleCues,
      0,
    ),
    TRUMAN_MASTER_ENGLISH_SUBTITLE_CUES,
  );
  assert.equal(TRUMAN_MASTER_ENGLISH_SUBTITLE_CUES, 695);
});

test("Film 001 derived chapter rates stay reproducible and bounded", () => {
  const derived = deriveTrumanMasterChapterMetrics();
  assert.equal(derived.length, 24);

  for (const metric of derived) {
    assert.ok(metric.durationSeconds > 0);
    assert.ok(Number.isFinite(metric.sceneChangeCandidatesPerMinute));
    assert.ok(Number.isFinite(metric.embeddedEnglishSubtitleCuesPerMinute));
    assert.ok(Number.isFinite(metric.meanSecondsPerCandidateSegment));
    assert.ok(metric.sceneChangeCandidatesPerMinute >= 0);
    assert.ok(metric.embeddedEnglishSubtitleCuesPerMinute >= 0);
    assert.ok(metric.meanSecondsPerCandidateSegment > 0);
  }

  const byId = new Map(derived.map((metric) => [metric.chapterId, metric]));
  assert.equal(byId.get("truman-ch-11")?.sceneChangeCandidatesPerMinute, 23.47);
  assert.equal(byId.get("truman-ch-20")?.sceneChangeCandidatesPerMinute, 19.74);
  assert.equal(byId.get("truman-ch-20")?.embeddedEnglishSubtitleCuesPerMinute, 4.82);
  assert.equal(byId.get("truman-ch-15")?.sceneChangeCandidatesPerMinute, 4.35);
  assert.equal(byId.get("truman-ch-15")?.embeddedEnglishSubtitleCuesPerMinute, 8.52);
  assert.equal(byId.get("truman-ch-21")?.embeddedEnglishSubtitleCues, 0);
  assert.equal(byId.get("truman-ch-24")?.sceneChangeCandidates, 1);
  assert.equal(byId.get("truman-ch-24")?.embeddedEnglishSubtitleCues, 0);
});


test("Film 001 evidence migration wave 2 is dependency-safe", () => {
  const currentEvidenceIds = new Set(
    (theTrumanShowDraftPackage.evidence ?? []).map((item) => item.id),
  );
  const source = readFileSync("src/data/films/the-truman-show.ts", "utf8");
  const wave1ReplacementIds = new Set(
    trumanEvidenceMigrationWave1.flatMap((plan) =>
      plan.replacements.map((replacement) => replacement.id),
    ),
  );
  const wave2ReplacementIds: string[] = [];

  assert.equal(trumanEvidenceMigrationWave2.length, 4);
  assert.equal(
    trumanEvidenceMigrationWave2.reduce(
      (total, plan) => total + plan.expectedSupportReferences,
      0,
    ),
    24,
  );

  const wave1RetiringIds = new Set(
    trumanEvidenceMigrationWave1.map((plan) => plan.retiringEvidenceId),
  );

  for (const plan of trumanEvidenceMigrationWave2) {
    assert.ok(
      currentEvidenceIds.has(plan.retiringEvidenceId),
      `${plan.retiringEvidenceId}: retiring evidence must still exist`,
    );
    assert.ok(
      !wave1RetiringIds.has(plan.retiringEvidenceId),
      `${plan.retiringEvidenceId}: retiring ID cannot appear in two migration waves`,
    );

    const occurrences = source.split(`"${plan.retiringEvidenceId}"`).length - 1;
    assert.equal(
      occurrences - 1,
      plan.expectedSupportReferences,
      `${plan.retiringEvidenceId}: support fan-out drifted`,
    );
    assert.ok(
      plan.expectedSupportReferences >= 4 &&
        plan.expectedSupportReferences <= 7,
      `${plan.retiringEvidenceId}: wave 2 must remain medium-fan-out`,
    );

    const reanchor = trumanEvidenceReanchors.find(
      (record) => record.evidenceId === plan.retiringEvidenceId,
    );
    assert.ok(reanchor, `${plan.retiringEvidenceId}: missing master re-anchor record`);

    for (const replacement of plan.replacements) {
      wave2ReplacementIds.push(replacement.id);
      assert.ok(
        !currentEvidenceIds.has(replacement.id),
        `${replacement.id}: replacement ID already exists in Film 001`,
      );
      assert.ok(
        !wave1ReplacementIds.has(replacement.id),
        `${replacement.id}: replacement ID collides with wave 1`,
      );
      assert.ok(replacement.chapterIds.length > 0);

      for (const chapterId of replacement.chapterIds) {
        assert.ok(
          trumanMasterChapters.some((chapter) => chapter.id === chapterId),
          `${replacement.id}: unknown chapter ${chapterId}`,
        );
      }

      if (replacement.grounding === "TRANSCRIPT") {
        assert.notEqual(
          replacement.anchorTimestampSeconds,
          undefined,
          `${replacement.id}: transcript replacement requires a master cue`,
        );
      }

      if (replacement.grounding === "VISUAL") {
        assert.equal(
          replacement.anchorTimestampSeconds,
          undefined,
          `${replacement.id}: visual-only replacement must remain untimestamped until visual review`,
        );
      }

      if (replacement.anchorTimestampSeconds !== undefined) {
        const containingChapter = trumanMasterChapters.find(
          (chapter) =>
            replacement.chapterIds.includes(chapter.id) &&
            replacement.anchorTimestampSeconds! >= chapter.startTimestampSeconds &&
            replacement.anchorTimestampSeconds! < chapter.endTimestampSeconds,
        );
        assert.ok(
          containingChapter,
          `${replacement.id}: anchor must fall inside a declared master chapter`,
        );
        assert.ok(
          reanchor?.anchors.some(
            (anchor) => anchor.timestampSeconds === replacement.anchorTimestampSeconds,
          ),
          `${replacement.id}: anchor must come from the measured re-anchor ledger`,
        );
      }
    }
  }

  assert.equal(new Set(wave2ReplacementIds).size, wave2ReplacementIds.length);
});


test("Film 001 evidence migration wave 3 guards high-fan-out and direct consumers", () => {
  const currentEvidenceIds = new Set(
    (theTrumanShowDraftPackage.evidence ?? []).map((item) => item.id),
  );
  const source = readFileSync("src/data/films/the-truman-show.ts", "utf8");

  const priorRetiringIds = new Set(
    [...trumanEvidenceMigrationWave1, ...trumanEvidenceMigrationWave2].map(
      (plan) => plan.retiringEvidenceId,
    ),
  );
  const priorReplacementIds = new Set(
    [...trumanEvidenceMigrationWave1, ...trumanEvidenceMigrationWave2].flatMap(
      (plan) => plan.replacements.map((replacement) => replacement.id),
    ),
  );
  const wave3ReplacementIds: string[] = [];

  assert.equal(trumanEvidenceMigrationWave3.length, 3);
  assert.equal(
    trumanEvidenceMigrationWave3.reduce(
      (total, plan) => total + plan.expectedSupportReferences,
      0,
    ),
    33,
  );

  for (const plan of trumanEvidenceMigrationWave3) {
    assert.ok(
      currentEvidenceIds.has(plan.retiringEvidenceId),
      `${plan.retiringEvidenceId}: retiring evidence must still exist`,
    );
    assert.ok(
      !priorRetiringIds.has(plan.retiringEvidenceId),
      `${plan.retiringEvidenceId}: retiring ID cannot appear in multiple waves`,
    );
    assert.ok(
      plan.expectedSupportReferences >= 8,
      `${plan.retiringEvidenceId}: wave 3 is reserved for high-fan-out evidence`,
    );

    const occurrences = source.split(`"${plan.retiringEvidenceId}"`).length - 1;
    assert.equal(
      occurrences - 1,
      plan.expectedSupportReferences,
      `${plan.retiringEvidenceId}: support/direct-reference fan-out drifted`,
    );

    const reanchor = trumanEvidenceReanchors.find(
      (record) => record.evidenceId === plan.retiringEvidenceId,
    );
    assert.ok(reanchor, `${plan.retiringEvidenceId}: missing master re-anchor record`);

    const replacementIdsForPlan = new Set(
      plan.replacements.map((replacement) => replacement.id),
    );

    for (const replacement of plan.replacements) {
      wave3ReplacementIds.push(replacement.id);
      assert.ok(
        !currentEvidenceIds.has(replacement.id),
        `${replacement.id}: replacement ID already exists in Film 001`,
      );
      assert.ok(
        !priorReplacementIds.has(replacement.id),
        `${replacement.id}: replacement ID collides with an earlier wave`,
      );
      assert.ok(replacement.chapterIds.length > 0);

      for (const chapterId of replacement.chapterIds) {
        assert.ok(
          trumanMasterChapters.some((chapter) => chapter.id === chapterId),
          `${replacement.id}: unknown chapter ${chapterId}`,
        );
      }

      if (replacement.grounding === "TRANSCRIPT") {
        assert.notEqual(
          replacement.anchorTimestampSeconds,
          undefined,
          `${replacement.id}: transcript replacement requires a master cue`,
        );
      }

      if (replacement.grounding === "VISUAL") {
        assert.equal(
          replacement.anchorTimestampSeconds,
          undefined,
          `${replacement.id}: visual-only replacement must remain untimestamped until visual review`,
        );
      }

      if (replacement.anchorTimestampSeconds !== undefined) {
        assert.ok(
          trumanMasterChapters.some(
            (chapter) =>
              replacement.chapterIds.includes(chapter.id) &&
              replacement.anchorTimestampSeconds! >= chapter.startTimestampSeconds &&
              replacement.anchorTimestampSeconds! < chapter.endTimestampSeconds,
          ),
          `${replacement.id}: anchor must fall inside a declared master chapter`,
        );
        assert.ok(
          reanchor?.anchors.some(
            (anchor) => anchor.timestampSeconds === replacement.anchorTimestampSeconds,
          ),
          `${replacement.id}: anchor must come from the measured re-anchor ledger`,
        );
      }
    }

    for (const directRewire of plan.directEvidenceRewires ?? []) {
      assert.ok(
        replacementIdsForPlan.has(directRewire.replacementId),
        `${directRewire.consumerId}: direct rewire must target a replacement from the same plan`,
      );

      const consumerNeedle = `id: "${directRewire.consumerId}"`;
      const consumerIndex = source.indexOf(consumerNeedle);
      assert.ok(
        consumerIndex >= 0,
        `${directRewire.consumerId}: direct evidence consumer must still exist`,
      );
      const consumerBlock = source.slice(consumerIndex, consumerIndex + 320);
      assert.ok(
        consumerBlock.includes(`evidenceId: "${plan.retiringEvidenceId}"`),
        `${directRewire.consumerId}: expected retiring evidence direct reference drifted`,
      );
    }
  }

  assert.equal(new Set(wave3ReplacementIds).size, wave3ReplacementIds.length);

  const exitPlan = trumanEvidenceMigrationWave3.find(
    (plan) => plan.retiringEvidenceId === "truman-ev-exit",
  );
  assert.deepEqual(exitPlan?.directEvidenceRewires, [
    {
      consumerId: "truman-anchor-bow",
      replacementId: "truman-ev-final-exit",
      note: "Scene Autopsy bow/door anchor must point specifically to the physical exit observation.",
    },
  ]);
});


test("Film 001 factual rewrite candidates preserve stable IDs and provenance boundaries", () => {
  const currentEvidenceIds = new Set(
    (theTrumanShowDraftPackage.evidence ?? []).map((item) => item.id),
  );
  const retiringEvidenceIds = new Set(
    [
      ...trumanEvidenceMigrationWave1,
      ...trumanEvidenceMigrationWave2,
      ...trumanEvidenceMigrationWave3,
    ].map((plan) => plan.retiringEvidenceId),
  );
  const source = readFileSync("src/data/films/the-truman-show.ts", "utf8");

  assert.equal(trumanEvidenceRewriteCandidates.length, 23);
  assert.equal(
    trumanEvidenceRewriteCandidates.reduce(
      (total, candidate) => total + candidate.expectedSupportReferences,
      0,
    ),
    92,
  );

  const counts = {
    TRANSCRIPT_ONLY: 0,
    TRANSCRIPT_PLUS_VISUAL: 0,
    VISUAL_ONLY: 0,
  };

  const ids: string[] = [];

  for (const candidate of trumanEvidenceRewriteCandidates) {
    ids.push(candidate.evidenceId);
    counts[candidate.verification] += 1;

    assert.ok(
      currentEvidenceIds.has(candidate.evidenceId),
      `${candidate.evidenceId}: stable rewrite ID must still exist in Film 001`,
    );
    assert.ok(
      !retiringEvidenceIds.has(candidate.evidenceId),
      `${candidate.evidenceId}: stable rewrite cannot overlap a retiring compound ID`,
    );

    const occurrences = source.split(`"${candidate.evidenceId}"`).length - 1;
    assert.equal(
      occurrences - 1,
      candidate.expectedSupportReferences,
      `${candidate.evidenceId}: support fan-out drifted`,
    );

    const reanchor = trumanEvidenceReanchors.find(
      (record) => record.evidenceId === candidate.evidenceId,
    );
    assert.ok(reanchor, `${candidate.evidenceId}: missing master re-anchor record`);
    assert.equal(
      reanchor?.status,
      candidate.sourceReanchorStatus,
      `${candidate.evidenceId}: rewrite verification must track re-anchor state`,
    );

    for (const chapterId of candidate.chapterIds) {
      assert.ok(
        trumanMasterChapters.some((chapter) => chapter.id === chapterId),
        `${candidate.evidenceId}: unknown chapter ${chapterId}`,
      );
    }

    if (candidate.verification === "TRANSCRIPT_ONLY") {
      assert.equal(candidate.sourceReanchorStatus, "TRANSCRIPT_ANCHORED");
      assert.notEqual(candidate.anchorTimestampSeconds, undefined);
      assert.ok(candidate.candidateObservation?.trim());
      assert.equal(candidate.visualReviewTarget, undefined);
    }

    if (candidate.verification === "TRANSCRIPT_PLUS_VISUAL") {
      assert.equal(candidate.sourceReanchorStatus, "MIXED_REVIEW_REQUIRED");
      assert.notEqual(candidate.anchorTimestampSeconds, undefined);
      assert.ok(candidate.candidateObservation?.trim());
      assert.ok(candidate.visualReviewTarget?.trim());
    }

    if (candidate.verification === "VISUAL_ONLY") {
      assert.equal(candidate.sourceReanchorStatus, "VISUAL_REVIEW_REQUIRED");
      assert.equal(candidate.anchorTimestampSeconds, undefined);
      assert.equal(candidate.candidateObservation, null);
      assert.ok(candidate.visualReviewTarget?.trim());
    }

    if (candidate.anchorTimestampSeconds !== undefined) {
      assert.ok(
        candidate.chapterIds.some((chapterId) => {
          const chapter = trumanMasterChapters.find(
            (item) => item.id === chapterId,
          );
          return (
            chapter !== undefined &&
            candidate.anchorTimestampSeconds! >= chapter.startTimestampSeconds &&
            candidate.anchorTimestampSeconds! < chapter.endTimestampSeconds
          );
        }),
        `${candidate.evidenceId}: candidate anchor must stay inside a declared chapter`,
      );

      assert.ok(
        reanchor?.anchors.some(
          (anchor) => anchor.timestampSeconds === candidate.anchorTimestampSeconds,
        ),
        `${candidate.evidenceId}: candidate anchor must come from the measured re-anchor ledger`,
      );
    }
  }

  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual(counts, {
    TRANSCRIPT_ONLY: 9,
    TRANSCRIPT_PLUS_VISUAL: 6,
    VISUAL_ONLY: 8,
  });

  const alreadyAtomicIds = new Set(trumanEvidenceAlreadyAtomicIds);
  assert.equal(alreadyAtomicIds.size, 2);
  for (const evidenceId of alreadyAtomicIds) {
    assert.ok(currentEvidenceIds.has(evidenceId));
    assert.ok(!retiringEvidenceIds.has(evidenceId));
    assert.ok(!ids.includes(evidenceId));
  }

  assert.equal(
    ids.length + retiringEvidenceIds.size + alreadyAtomicIds.size,
    (theTrumanShowDraftPackage.evidence ?? []).length,
    "rewrite candidates, retiring compound IDs and already-atomic records must partition all 39 research evidence records",
  );
});

test("Film 001 factual rewrite contract keeps visual-only prose fail-closed", () => {
  for (const candidate of trumanEvidenceRewriteCandidates) {
    if (candidate.verification === "VISUAL_ONLY") {
      assert.equal(candidate.candidateObservation, null);
      assert.ok(candidate.visualReviewTarget);
      continue;
    }

    assert.ok(candidate.candidateObservation);
  }
});


test("master segmentation requires a measured edition and complete contiguous coverage", () => {
  const targetOnly = buildResearchTierPackage();
  targetOnly.ingest = {
    edition: {
      state: "TARGET_ONLY",
      sourceId: "film-master",
      note: "Target only.",
    },
    masterSegmentation: {
      basis: "EMBEDDED_CHAPTERS",
      coverage: "COMPLETE",
      segments: [
        {
          id: "segment-1",
          sequenceIndex: 1,
          startTimestampSeconds: 0,
          endTimestampSeconds: 6000,
        },
      ],
    },
  };

  assert.ok(
    validateFilmPackage(targetOnly).includes(
      "film: masterSegmentation requires an identified/measured viewing master.",
    ),
  );

  const identified = buildResearchTierPackage();
  identified.ingest = {
    edition: {
      state: "MASTER_IDENTIFIED",
      sourceId: "film-master",
      editionIdentity: "Measured fixture master",
      measuredRuntimeSeconds: 6000,
      timestampConvention: "PTS from 00:00:00.000",
      identifiedAt: "2026-09-16",
      note: "Measured fixture.",
    },
    masterSegmentation: {
      basis: "EMBEDDED_CHAPTERS",
      coverage: "COMPLETE",
      segments: [
        {
          id: "segment-1",
          sequenceIndex: 1,
          startTimestampSeconds: 0,
          endTimestampSeconds: 3000,
        },
        {
          id: "segment-2",
          sequenceIndex: 2,
          startTimestampSeconds: 3000,
          endTimestampSeconds: 6000,
        },
      ],
    },
  };

  assert.deepEqual(validateFilmPackage(identified), []);

  identified.ingest.masterSegmentation!.segments[1]!.startTimestampSeconds = 3001;
  const gapErrors = validateFilmPackage(identified);
  assert.ok(
    gapErrors.includes(
      'masterSegmentation/segment-2: COMPLETE coverage must be gapless and non-overlapping with "segment-1".',
    ),
  );

  identified.ingest.masterSegmentation!.segments[1]!.startTimestampSeconds = 3000;
  identified.ingest.masterSegmentation!.segments[1]!.sequenceIndex = 3;
  assert.ok(
    validateFilmPackage(identified).includes(
      "masterSegmentation/segment-2: sequenceIndex must match one-based array order.",
    ),
  );

  identified.ingest.masterSegmentation!.segments[1]!.sequenceIndex = 2;
  identified.ingest.masterSegmentation!.segments[1]!.endTimestampSeconds = 5999;
  assert.ok(
    validateFilmPackage(identified).includes(
      "masterSegmentation: COMPLETE coverage must end at measuredRuntimeSeconds.",
    ),
  );
});

test("Film 001 ingest exposes the exact master segmentation without promoting scenes", () => {
  assert.deepEqual(
    theTrumanShowDraftPackage.ingest?.masterSegmentation,
    trumanMasterSegmentation,
  );
  assert.equal(trumanMasterSegmentation.basis, "EMBEDDED_CHAPTERS");
  assert.equal(trumanMasterSegmentation.coverage, "COMPLETE");
  assert.equal(trumanMasterSegmentation.segments.length, 24);
  assert.equal(
    trumanMasterSegmentation.segments[0]?.startTimestampSeconds,
    0,
  );
  assert.equal(
    trumanMasterSegmentation.segments[23]?.endTimestampSeconds,
    TRUMAN_MASTER_RUNTIME_SECONDS,
  );

  assert.equal(theTrumanShowDraftPackage.ingest?.edition.state, "MASTER_IDENTIFIED");
  assert.ok(
    (theTrumanShowDraftPackage.scenes ?? []).every(
      (scene) => scene.verificationState === "DRAFT",
    ),
    "master segmentation must not promote research scenes",
  );

  assert.deepEqual(validateFilmPackage(theTrumanShowDraftPackage), []);
});


test("Film 001 promotion readiness exhaustively covers the live research evidence graph", () => {
  const evidence = theTrumanShowDraftPackage.evidence ?? [];
  const currentEvidenceIds = evidence.map((item) => item.id).sort();
  const readinessIds = trumanEvidencePromotionReadiness
    .map((item) => item.evidenceId)
    .sort();
  const source = readFileSync("src/data/films/the-truman-show.ts", "utf8");

  assert.equal(evidence.length, 39);
  assert.equal(trumanEvidencePromotionReadiness.length, 39);
  assert.equal(new Set(readinessIds).size, readinessIds.length);
  assert.deepEqual(readinessIds, currentEvidenceIds);

  const pathCounts = trumanEvidencePromotionReadiness.reduce(
    (counts, item) => {
      counts[item.path] += 1;
      return counts;
    },
    {
      SPLIT_REQUIRED: 0,
      FACTUAL_REWRITE: 0,
      ALREADY_ATOMIC: 0,
    },
  );

  assert.deepEqual(pathCounts, {
    SPLIT_REQUIRED: 14,
    FACTUAL_REWRITE: 23,
    ALREADY_ATOMIC: 2,
  });

  const pathSupportTotals = trumanEvidencePromotionReadiness.reduce(
    (totals, item) => {
      totals[item.path] += item.currentSupportReferences;
      return totals;
    },
    {
      SPLIT_REQUIRED: 0,
      FACTUAL_REWRITE: 0,
      ALREADY_ATOMIC: 0,
    },
  );

  assert.deepEqual(pathSupportTotals, {
    SPLIT_REQUIRED: 71,
    FACTUAL_REWRITE: 92,
    ALREADY_ATOMIC: 19,
  });

  assert.deepEqual(trumanEvidencePromotionSummary, {
    evidenceRecords: 39,
    splitRequired: 14,
    factualRewrite: 23,
    alreadyAtomic: 2,
    currentSupportReferences: 182,
    visualReviewBlocked: 25,
  });
  assert.equal(trumanEvidencePromotionSummary.currentSupportReferences, 182);

  for (const item of trumanEvidencePromotionReadiness) {
    const occurrences = source.split(`"${item.evidenceId}"`).length - 1;
    assert.equal(
      occurrences - 1,
      item.currentSupportReferences,
      `${item.evidenceId}: live support fan-out drifted`,
    );

    assert.ok(
      item.blockers.includes("EDITORIAL_SCENE_VERIFICATION"),
      `${item.evidenceId}: pre-lock record must remain scene-verification blocked`,
    );
    assert.ok(
      item.blockers.includes("LOCKED_FILM_EDITION"),
      `${item.evidenceId}: pre-lock record must remain locked-source blocked`,
    );

    if (item.path === "SPLIT_REQUIRED") {
      assert.ok(item.blockers.includes("CONSUMER_REWIRE"));
      assert.ok(!item.blockers.includes("FACTUAL_REWRITE"));
    }

    if (item.path === "FACTUAL_REWRITE") {
      assert.ok(item.blockers.includes("FACTUAL_REWRITE"));
      assert.ok(!item.blockers.includes("CONSUMER_REWIRE"));
    }

    if (item.path === "ALREADY_ATOMIC") {
      assert.deepEqual(item.blockers, [
        "EDITORIAL_SCENE_VERIFICATION",
        "LOCKED_FILM_EDITION",
      ]);
    }
  }
});

test("Film 001 promotion readiness visual blockers derive from source contracts", () => {
  const readinessById = new Map(
    trumanEvidencePromotionReadiness.map((item) => [item.evidenceId, item]),
  );

  for (const candidate of trumanEvidenceRewriteCandidates) {
    const readiness = readinessById.get(candidate.evidenceId);
    assert.ok(readiness);

    assert.equal(
      readiness.blockers.includes("VISUAL_REVIEW"),
      candidate.verification !== "TRANSCRIPT_ONLY",
      `${candidate.evidenceId}: rewrite visual gate drifted`,
    );
  }

  for (const plan of [
    ...trumanEvidenceMigrationWave1,
    ...trumanEvidenceMigrationWave2,
    ...trumanEvidenceMigrationWave3,
  ]) {
    const readiness = readinessById.get(plan.retiringEvidenceId);
    assert.ok(readiness);

    const requiresPicture = plan.replacements.some(
      (replacement) =>
        replacement.grounding === "VISUAL" ||
        replacement.grounding === "MIXED",
    );
    assert.equal(
      readiness.blockers.includes("VISUAL_REVIEW"),
      requiresPicture,
      `${plan.retiringEvidenceId}: migration visual gate drifted`,
    );
  }

  for (const evidenceId of trumanEvidenceAlreadyAtomicIds) {
    const readiness = readinessById.get(evidenceId);
    assert.ok(readiness);
    assert.equal(readiness.blockers.includes("VISUAL_REVIEW"), false);
  }
});

test("Film 001 canonical scene inventory is contiguous and master-bounded", () => {
  assert.ok(trumanCanonicalScenes.length > 0);

  const ids = trumanCanonicalScenes.map((scene) => scene.id);
  assert.equal(new Set(ids).size, ids.length, "scene ids must be unique");

  const chapterIds = new Set(trumanMasterChapters.map((chapter) => chapter.id));
  const epsilon = 1e-6;

  trumanCanonicalScenes.forEach((scene, index) => {
    assert.equal(scene.sequenceIndex, index + 1, `${scene.id}: sequenceIndex must match array order`);
    assert.ok(scene.startTimestampSeconds >= 0, `${scene.id}: negative start`);
    assert.ok(
      scene.endTimestampSeconds > scene.startTimestampSeconds,
      `${scene.id}: end must exceed start`,
    );
    assert.ok(
      scene.endTimestampSeconds <= TRUMAN_INVENTORY_RUNTIME_SECONDS + epsilon,
      `${scene.id}: exceeds measured runtime`,
    );
    assert.ok(scene.chapterIds.length > 0, `${scene.id}: must be chapter-anchored`);
    for (const chapterId of scene.chapterIds) {
      assert.ok(chapterIds.has(chapterId), `${scene.id}: unknown chapter ${chapterId}`);
    }

    const previous = trumanCanonicalScenes[index - 1];
    if (!previous) {
      assert.ok(Math.abs(scene.startTimestampSeconds) <= epsilon, "inventory must start at 0");
      return;
    }
    assert.ok(
      Math.abs(previous.endTimestampSeconds - scene.startTimestampSeconds) <= epsilon,
      `${scene.id}: inventory must be gapless with ${previous.id}`,
    );
  });

  const finalScene = trumanCanonicalScenes[trumanCanonicalScenes.length - 1];
  assert.equal(finalScene.endTimestampSeconds, TRUMAN_CREDITS_START_SECONDS);
  assert.equal(trumanCanonicalSceneSummary.coveredUntilSeconds, TRUMAN_CREDITS_START_SECONDS);
  assert.equal(
    trumanCanonicalSceneSummary.verified + trumanCanonicalSceneSummary.pending,
    trumanCanonicalScenes.length,
  );

  assert.deepEqual(
    trumanNonSceneChapters.map((entry) => entry.chapterId),
    ["truman-ch-24"],
    "only the credits chapter is excluded from the editorial inventory",
  );
});

test("Film 001 visual verification covers the live evidence graph exactly once", () => {
  const liveEvidenceIds = (theTrumanShowDraftPackage.evidence ?? []).map((item) => item.id);
  const verifiedIds = trumanVisualVerifications.map((record) => record.evidenceId);

  assert.equal(verifiedIds.length, liveEvidenceIds.length);
  assert.equal(new Set(verifiedIds).size, verifiedIds.length, "duplicate verification record");
  assert.deepEqual([...verifiedIds].sort(), [...liveEvidenceIds].sort());

  assert.equal(trumanVisualVerificationSummary.records, liveEvidenceIds.length);
  assert.equal(
    trumanVisualVerificationSummary.visualConfirmed +
      trumanVisualVerificationSummary.transcriptConfirmed +
      trumanVisualVerificationSummary.pendingLocalReview +
      trumanVisualVerificationSummary.contradicted,
    liveEvidenceIds.length,
  );
});

test("Film 001 visual verification frames sit inside their scene and the master", () => {
  const scenesById = new Map(trumanCanonicalScenes.map((scene) => [scene.id, scene]));

  for (const record of trumanVisualVerifications) {
    const scene = scenesById.get(record.sceneId);
    assert.ok(scene, `${record.evidenceId}: unknown scene ${record.sceneId}`);
    assert.ok(record.frames.length > 0, `${record.evidenceId}: no observed frame`);

    for (const observed of record.frames) {
      assert.ok(
        Number.isFinite(observed.frameTimeSeconds) && observed.frameTimeSeconds >= 0,
        `${record.evidenceId}: invalid frame time`,
      );
      assert.ok(
        observed.frameTimeSeconds <= TRUMAN_INVENTORY_RUNTIME_SECONDS,
        `${record.evidenceId}: frame time beyond measured runtime`,
      );
      assert.ok(
        observed.frameTimeSeconds >= scene.startTimestampSeconds &&
          observed.frameTimeSeconds <= scene.endTimestampSeconds,
        `${record.evidenceId}: frame at ${observed.frameTimeSeconds}s is outside ${scene.id}`,
      );
      assert.ok(
        observed.observation.trim().length > 0,
        `${record.evidenceId}: empty observation`,
      );
    }
  }
});

test("Film 001 contradicted research records stay fail-closed", () => {
  const contradicted = trumanVisualVerifications.filter(
    (record) => record.status === "CONTRADICTED",
  );

  // The research ledger places a localized-rain beat in chapter 08. Picture review
  // and the embedded English subtitle track both fail to find it, so the record may
  // not be promoted as written.
  assert.deepEqual(
    contradicted.map((record) => record.evidenceId),
    ["truman-ev-raincloud"],
  );
  assert.equal(trumanVisualVerificationSummary.contradicted, 1);

  for (const record of contradicted) {
    assert.ok(
      record.note.toLowerCase().includes("may not be promoted"),
      `${record.evidenceId}: contradicted record must state its promotion block`,
    );
  }
});

test("Film 001 research scene rewire bridges the old registry to the canonical inventory", () => {
  const canonicalIds = new Set(trumanCanonicalScenes.map((scene) => scene.id));
  const researchIds = new Set((theTrumanShowDraftPackage.scenes ?? []).map((scene) => scene.id));

  assert.equal(researchIds.size, 15, "research registry size changed");
  assert.deepEqual(
    [...Object.keys(trumanResearchSceneRewire)].sort(),
    [...researchIds].sort(),
    "every research scene must be rewired exactly once",
  );

  const targets = new Set<string>();
  for (const [researchId, rewired] of Object.entries(trumanResearchSceneRewire)) {
    assert.ok(rewired.length > 0, `${researchId}: rewire must target at least one scene`);
    for (const targetId of rewired) {
      assert.ok(canonicalIds.has(targetId), `${researchId}: unknown canonical target ${targetId}`);
      targets.add(targetId);
    }
  }

  for (const sceneId of trumanCanonicalScenesWithoutResearchOrigin) {
    assert.ok(canonicalIds.has(sceneId), `${sceneId}: declared new coverage is not canonical`);
    assert.equal(targets.has(sceneId), false, `${sceneId}: cannot be both new and rewired`);
  }

  assert.equal(
    targets.size + trumanCanonicalScenesWithoutResearchOrigin.length,
    trumanCanonicalScenes.length,
    "every canonical scene must be either rewired or explicitly new",
  );
});

test("Film 001 canonical package satisfies the full integrity graph", () => {
  const errors = validateFilmPackage(theTrumanShowCanonicalPackage, {
    resolveArticleMeasurement: (ref) => Boolean(resolveTrumanMeasurement(ref)),
    articleMeasuredValues: trumanMeasuredDigitStrings,
    resolveArticleContextSources: () => new Set(theTrumanShowProductionDossier.sources.map((source) => source.id)),
    resolveIllustration: illustrationFacts,
  });
  assert.deepEqual(errors, [], `canonical package errors:\n${errors.join("\n")}`);
});

test("Film 001 canonical package is LOCKED, published, and free of the research tier", () => {
  const edition = theTrumanShowCanonicalPackage.ingest?.edition;
  assert.ok(edition);
  assert.equal(edition.state, "LOCKED");
  assert.equal(edition.sourceId, TRUMAN_LOCKED_EDITION_SOURCE_ID);
  assert.equal(theTrumanShowCanonicalPackage.research, undefined);
  // Published is an editorial decision taken on top of the evidence lock; the lock
  // itself is what the rest of this test holds.
  assert.equal(theTrumanShowCanonicalPackage.film.status, "published");

  const scenes = theTrumanShowCanonicalPackage.scenes ?? [];
  assert.equal(scenes.length, trumanCanonicalScenes.length);
  for (const scene of scenes) {
    assert.equal(scene.verificationState, "VERIFIED", `${scene.id}: canonical scenes must be VERIFIED`);
  }

  for (const item of theTrumanShowCanonicalPackage.evidence ?? []) {
    assert.ok(
      (item.sourceIds ?? []).includes(TRUMAN_LOCKED_EDITION_SOURCE_ID),
      `${item.id}: canonical evidence must cite the locked film-edition source`,
    );
    assert.ok(item.sceneId, `${item.id}: canonical evidence requires a sceneId`);
    assert.ok(
      typeof item.timestampSeconds === "number",
      `${item.id}: canonical evidence requires a numeric timestamp`,
    );
  }
});

test("Film 001 canonical evidence retires, splits and adds exactly as declared", () => {
  const canonicalIds = new Set(trumanCanonicalEvidence.map((item) => item.id));
  const researchIds = new Set((theTrumanShowDraftPackage.evidence ?? []).map((item) => item.id));
  const { retired, split, added, rewritten } = trumanCanonicalEvidenceSummary;

  // Retired records disappear from the canonical graph. The rain record is the
  // one that came back under a new id — see `rewritten` below and docs/47 §8; it
  // was retired for its placement, not because the beat is absent.
  for (const retiredId of retired) {
    assert.ok(researchIds.has(retiredId), `${retiredId}: must be an existing research record`);
    assert.equal(canonicalIds.has(retiredId), false, `${retiredId}: retired records cannot survive`);
  }

  // Compound research records were split into scene-accurate halves.
  for (const [researchId, replacements] of Object.entries(split)) {
    assert.ok(researchIds.has(researchId), `${researchId}: must exist in research tier`);
    for (const replacementId of replacements) {
      assert.ok(canonicalIds.has(replacementId), `${replacementId}: missing canonical replacement`);
    }
  }

  // New canonical records have no research-era counterpart.
  for (const addedId of added) {
    assert.ok(canonicalIds.has(addedId), `${addedId}: missing canonical record`);
    assert.equal(researchIds.has(addedId), false, `${addedId}: must be new, not inherited`);
  }

  // A rewritten record keeps a lineage: one retired research id comes back under
  // a new canonical id, and the count moves by exactly one.
  for (const [researchId, replacements] of Object.entries(rewritten)) {
    assert.ok(researchIds.has(researchId), `${researchId}: must exist in research tier`);
    assert.equal(canonicalIds.has(researchId), false, `${researchId}: rewritten records are retired`);
    for (const replacementId of replacements) {
      assert.ok(canonicalIds.has(replacementId), `${replacementId}: missing rewritten record`);
      assert.equal(researchIds.has(replacementId), false, `${replacementId}: must be a new id`);
    }
  }

  const inherited = [...researchIds].filter((id) => !(retired as readonly string[]).includes(id));
  const expected =
    inherited.length -
    Object.keys(split).length +
    Object.values(split).reduce((total, ids) => total + ids.length, 0) +
    added.length +
    Object.values(rewritten).reduce((total, ids) => total + ids.length, 0);
  assert.equal(canonicalIds.size, expected, "canonical evidence count drifted");
});

test("Film 001 article metrics agree with the recorded master measurements", () => {
  // docs/49-FILM-001-ARTICLE-V1.md quotes these numbers; the article must not
  // drift away from the recorded scan it claims to reproduce.
  assert.equal(TRUMAN_MASTER_ENGLISH_SUBTITLE_CUES, 695);
  assert.equal(TRUMAN_MASTER_SCENE_CHANGE_CANDIDATES, 1036);
  assert.equal(TRUMAN_SCENE_CHANGE_THRESHOLD, 0.32);

  const metrics = deriveTrumanMasterChapterMetrics();
  const silentWall = metrics.find((metric) => metric.chapterId === "truman-ch-21");
  assert.ok(silentWall);
  // The wall/stairs sequence: 28 cuts and not one line of dialogue.
  assert.equal(silentWall.sceneChangeCandidates, 28);
  assert.equal(silentWall.embeddedEnglishSubtitleCues, 0);

  const busiest = [...metrics].sort(
    (a, b) => b.sceneChangeCandidatesPerMinute - a.sceneChangeCandidatesPerMinute,
  )[0];
  assert.ok(busiest.sceneChangeCandidatesPerMinute > 0);
});

/* ------------------------------------------------------------------------- *
 * Film 001 — the article layer.
 *
 * The article is data, so it can be attacked like data: these tests mutate the
 * real text and assert that the validator refuses the mutation. A rule that is
 * never tested is a comment.
 * ------------------------------------------------------------------------- */

function trumanArticleContext(overrides: Record<string, unknown> = {}) {
  const filmPackage = theTrumanShowCanonicalPackage;
  const sourcesModule = filmPackage.modules.find(
    (filmModule) => filmModule.kind === "sources-method",
  );
  return {
    evidenceById: new Map((filmPackage.evidence ?? []).map((item) => [item.id, item])),
    sceneById: new Map((filmPackage.scenes ?? []).map((scene) => [scene.id, scene])),
    edition: filmPackage.ingest?.edition,
    realFilm: true,
    published: false,
    // The article may only place illustrations the registry declares, and only
    // generated ones: the resolver is what lets the integrity check ask.
    resolveIllustration: illustrationFacts,
    editorialRevision:
      sourcesModule?.kind === "sources-method" ? sourcesModule.editorialRevision : undefined,
    resolveMeasurement: (ref: Parameters<typeof resolveTrumanMeasurement>[0]) =>
      Boolean(resolveTrumanMeasurement(ref)),
    measuredValues: trumanMeasuredDigitStrings,
    moduleLevels: new Map(filmPackage.modules.map((filmModule) => [filmModule.id, filmModule.spoilerLevel])),
    contextSourceIds: new Set(theTrumanShowProductionDossier.sources.map((source) => source.id)),
    ...overrides,
  };
}

function firstParagraph(article: typeof theTrumanShowArticle) {
  const section = article.sections[0];
  const block = section.blocks.find((candidate) => candidate.kind === "paragraph");
  assert.ok(block && block.kind === "paragraph");
  return block;
}

test("Film 001 article is bound to the exact locked edition it names", () => {
  const base = structuredClone(theTrumanShowArticle);
  assert.deepEqual(validateFilmArticle(base, trumanArticleContext()), []);

  const wrongSource = structuredClone(base);
  wrongSource.edition.sourceId = "truman-src-some-other-file";
  assert.match(
    validateFilmArticle(wrongSource, trumanArticleContext()).join("\n"),
    /does not match the locked source/,
  );

  const wrongRuntime = structuredClone(base);
  wrongRuntime.edition.measuredRuntimeSeconds = 6000;
  assert.match(
    validateFilmArticle(wrongRuntime, trumanArticleContext()).join("\n"),
    /does not match the locked master/,
  );

  // A pre-lock edition cannot carry a public article at all.
  const unlocked = validateFilmArticle(base, trumanArticleContext({
    edition: {
      state: "MASTER_IDENTIFIED",
      sourceId: "truman-src-master-bdrip",
      editionIdentity: "test",
      measuredRuntimeSeconds: 6177.792,
      timestampConvention: "test",
      identifiedAt: "2026-09-15",
      note: "test",
    },
  }));
  assert.match(unlocked.join("\n"), /requires a LOCKED edition/);
});

test("Film 001 article prose may not carry a clock reading or a measured number", () => {
  const withClock = structuredClone(theTrumanShowArticle);
  firstParagraph(withClock).text = "Библиотечная сцена начинается на 22:00 и не режется.";
  assert.match(
    validateFilmArticle(withClock, trumanArticleContext()).join("\n"),
    /clock reading "22:00"/,
  );

  const withMeasurement = structuredClone(theTrumanShowArticle);
  firstParagraph(withMeasurement).text = "Детектор нашёл в фильме 1019 переходов.";
  assert.match(
    validateFilmArticle(withMeasurement, trumanArticleContext()).join("\n"),
    /measured value "1019"/,
  );

  // The escape hatch is narrow by design: a declared Scripture reference may
  // contain a colon, an undeclared one may not.
  const scripture = structuredClone(theTrumanShowArticle);
  const biblical = scripture.sections.find((section) => section.id === "truman-article-biblical");
  assert.ok(biblical);
  const paragraph = biblical.blocks.find((block) => block.kind === "paragraph");
  assert.ok(paragraph && paragraph.kind === "paragraph");
  paragraph.text = "Апостол говорит о пределах обитания (Деяния 17:26–27).";
  paragraph.scriptureRefs = ["Деяния 17:26–27"];
  assert.deepEqual(validateFilmArticle(scripture, trumanArticleContext()), []);

  paragraph.scriptureRefs = undefined;
  assert.match(
    validateFilmArticle(scripture, trumanArticleContext()).join("\n"),
    /clock reading "17:26"/,
  );
});

test("Film 001 article cannot quote a timestamp its evidence does not support", () => {
  const article = structuredClone(theTrumanShowArticle);
  const section = article.sections.find((candidate) => candidate.id === "truman-article-props");
  assert.ok(section);
  const timeline = section.blocks.find((block) => block.kind === "timeline");
  assert.ok(timeline && timeline.kind === "timeline");
  timeline.items[0].timestampSeconds = 1699;

  const errors = validateFilmArticle(article, trumanArticleContext()).join("\n");
  assert.match(errors, /does not match evidence "truman-ev-fingers"/);

  const unknownEvidence = structuredClone(theTrumanShowArticle);
  const section2 = unknownEvidence.sections.find(
    (candidate) => candidate.id === "truman-article-props",
  );
  assert.ok(section2);
  const timeline2 = section2.blocks.find((block) => block.kind === "timeline");
  assert.ok(timeline2 && timeline2.kind === "timeline");
  timeline2.items[0].evidenceId = "truman-ev-invented";
  assert.match(
    validateFilmArticle(unknownEvidence, trumanArticleContext()).join("\n"),
    /unknown evidence id "truman-ev-invented"/,
  );
});

test("Film 001 article measurement references must resolve against the dataset", () => {
  const article = structuredClone(theTrumanShowArticle);
  const section = article.sections.find((candidate) => candidate.id === "truman-article-craft");
  assert.ok(section);
  const figure = section.blocks.find((block) => block.kind === "measurement");
  assert.ok(figure && figure.kind === "measurement");
  figure.measurement = { table: "hold", id: "hold-99" };
  assert.match(
    validateFilmArticle(article, trumanArticleContext()).join("\n"),
    /unknown hold measurement "hold-99"/,
  );

  // Without the dataset an article cannot be validated at all: it would be a
  // page of numbers nobody can trace.
  assert.match(
    validateFilmArticle(theTrumanShowArticle, trumanArticleContext({
      resolveMeasurement: undefined,
    })).join("\n"),
    /require a measurement dataset/,
  );
});

test("Film 001 article is signed, and the publish gate still needs a signature", () => {
  // The shipped text carries a signature issued on delegated authority: the
  // editor authorised the date, the data says so, and the two never separate.
  assert.equal(theTrumanShowArticle.byline.reviewedAt, "2026-10-28");
  assert.equal(theTrumanShowArticle.byline.signatureBasis, "DELEGATED");
  assert.deepEqual(
    validateFilmArticle(theTrumanShowArticle, trumanArticleContext({ published: true })),
    [],
    "a signed article passes the publication gate",
  );

  // The gate is real: an unsigned text cannot be published.
  const unsigned = structuredClone(theTrumanShowArticle);
  delete unsigned.byline.reviewedAt;
  delete unsigned.byline.signatureBasis;
  assert.match(
    validateFilmArticle(unsigned, trumanArticleContext({ published: true })).join("\n"),
    /requires an editorial signature \(reviewedAt\)/,
  );

  // A date with no stated authority is an anonymous date, not a signature.
  const anonymous = structuredClone(theTrumanShowArticle);
  delete anonymous.byline.signatureBasis;
  assert.match(
    validateFilmArticle(anonymous, trumanArticleContext()).join("\n"),
    /reviewedAt requires signatureBasis/,
  );

  // A basis with no date is a promise, not a signature.
  const promised = structuredClone(theTrumanShowArticle);
  delete promised.byline.reviewedAt;
  assert.match(
    validateFilmArticle(promised, trumanArticleContext()).join("\n"),
    /signatureBasis is meaningless without reviewedAt/,
  );

  // And a signature cannot predate the draft it signs.
  const backdated = structuredClone(theTrumanShowArticle);
  backdated.byline.reviewedAt = "2026-10-01";
  assert.match(
    validateFilmArticle(backdated, trumanArticleContext()).join("\n"),
    /reviewedAt cannot precede draftedAt/,
  );
});

test("Film 001 article spoiler gating hides a suffix, never a hole", () => {
  const none = projectArticleSections(theTrumanShowArticle, "NONE");
  assert.deepEqual(none.visibleSections.map((section) => section.number), [1]);
  assert.equal(none.nextHiddenLevel, "MINOR");
  assert.equal(none.hiddenSections, theTrumanShowArticle.sections.length - 1);

  // Derive the expectation from the levels themselves: the rule is "a suffix
  // is hidden", not "these exact numbers". Adding a section must not need a
  // test edit, and a level regression must fail here.
  const readableAt = (limit: "MINOR" | "ENDING") =>
    theTrumanShowArticle.sections
      .filter((section) => canRevealSpoiler(limit, section.spoilerLevel))
      .map((section) => section.number);

  const minor = projectArticleSections(theTrumanShowArticle, "MINOR");
  assert.deepEqual(minor.visibleSections.map((section) => section.number), readableAt("MINOR"));

  const ending = projectArticleSections(theTrumanShowArticle, "ENDING");
  assert.deepEqual(ending.visibleSections.map((section) => section.number), readableAt("ENDING"));
  assert.equal(
    ending.hiddenSections,
    theTrumanShowArticle.sections.length - readableAt("ENDING").length,
  );

  const full = projectArticleSections(theTrumanShowArticle, "FULL");
  assert.equal(full.hiddenSections, 0);
  assert.equal(full.visibleSections.length, theTrumanShowArticle.sections.length);
  assert.equal(full.nextHiddenLevel, undefined);

  assert.ok(articleReadingMinutes(theTrumanShowArticle) >= 5);
});

test("article reading estimate measures only projected main prose", () => {
  const article = structuredClone(theTrumanShowArticle);
  const none = projectArticleSections(article, "NONE");
  const full = projectArticleSections(article, "FULL");
  const visibleWords = countArticleWords(article, none);
  assert.ok(visibleWords > 0 && visibleWords < countArticleWords(article, full));
  assert.ok(articleReadingMinutes(article, none) < articleReadingMinutes(article, full));
  assert.equal(countArticleWords(article, full), countArticleWords(article));

  // Changing hidden prose and the closing must not change the NONE estimate.
  const hidden = article.sections.find((section) => section.spoilerLevel !== "NONE");
  assert.ok(hidden);
  hidden.blocks.push({ kind: "paragraph", id: "test-hidden-prose", text: "hidden ".repeat(1000) });
  assert.ok(article.closing);
  article.closing.text = "hidden ".repeat(1000);
  assert.equal(countArticleWords(article, projectArticleSections(article, "NONE")), visibleWords);
  assert.ok(countArticleWords(article, projectArticleSections(article, "FULL")) > countArticleWords(theTrumanShowArticle));
});

test("Film 001 article prose carries no claim the module audit refuted", () => {
  const prose: string[] = [];
  for (const section of theTrumanShowArticle.sections) {
    for (const block of section.blocks) {
      if (block.kind === "paragraph" || block.kind === "pullquote" || block.kind === "subhead") {
        prose.push(block.text);
      }
    }
  }
  const text = prose.join(" ");
  for (const refuted of ["наушник", "булавк", "личный дождь"]) {
    assert.equal(
      text.toLowerCase().includes(refuted),
      false,
      `article prose still carries the refuted claim "${refuted}"`,
    );
  }
});

test("Film 001 article keeps the five refuted claims inside the corrections table", () => {
  const corrections = theTrumanShowArticle.sections
    .flatMap((section) => section.blocks)
    .find((block) => block.kind === "corrections");
  assert.ok(corrections && corrections.kind === "corrections");
  assert.equal(corrections.rows.length, 5);

  // The piece may *discuss* a corrected claim in prose (that is the point of the
  // section), but the correction itself must live in the table, with a source:
  // evidence for a rewritten fact and nothing hanging unsupported.
  //
  // This test used to require exactly one `absentFromMaster` row. That row was
  // the rain, and it was wrong: the beat is in the film. A correction may still
  // declare a beat absent, but nothing in this article does, and a new absence
  // claim has to bring its own reason — so the count is asserted at zero.
  assert.equal(
    corrections.rows.filter((row) => row.absentFromMaster).length,
    0,
    "no correction declares a beat absent: the last one was a misreading",
  );
  for (const row of corrections.rows) {
    assert.ok(row.commonClaim.length > 0 && row.onScreen.length > 0);
    assert.ok(
      Boolean(row.evidenceId) !== Boolean(row.absentFromMaster),
      `${row.id}: a correction cites evidence or declares absence, never both`,
    );
  }

  // The rain row is the regression this file exists for: it used to say the
  // episode does not exist. It must now point at a canonical record that does.
  const rainRow = corrections.rows.find((row) => row.id === "truman-article-correction-rain");
  assert.ok(rainRow, "the rain correction must stay in the table");
  assert.equal(rainRow.evidenceId, "truman-ev-rain");
  assert.equal(/нет ни в одной|отсутству/i.test(rainRow.onScreen), false, "the rain row must not claim absence");

  const claims = corrections.rows.map((row) => row.commonClaim.toLowerCase()).join(" | ");
  for (const marker of ["дождь", "нож", "полос", "пальц", "подкоп"]) {
    assert.ok(claims.includes(marker), `corrections table lost the "${marker}" claim`);
  }

  // The five corrected claims are exactly the ones the promoted evidence graph
  // can answer.
  const evidenceIds = new Set((theTrumanShowCanonicalPackage.evidence ?? []).map((item) => item.id));
  for (const row of corrections.rows) {
    if (row.evidenceId) {
      assert.ok(evidenceIds.has(row.evidenceId), `${row.id}: unknown evidence ${row.evidenceId}`);
    }
  }
});

test("Film 001 measured timing dataset is internally consistent", () => {
  assert.equal(trumanMasterTimingTotals.detectedTransitions, 1019);
  assert.equal(trumanMasterTimingTotals.subtitleCues, 695);
  assert.equal(trumanMasterTimingTotals.meanSecondsBetweenTransitions, 6.06);

  for (const window of trumanMasterWindows) {
    assert.ok(window.to > window.from, `${window.id}: window must move forward`);
    assert.ok(
      Math.abs(window.to - window.from - window.durationSeconds) < 0.001,
      `${window.id}: duration must match its bounds`,
    );
    assert.ok(window.startSceneId, `${window.id}: window must resolve to a scene`);
  }

  // Ranked longest-first: the article's "longest hold" claim depends on it.
  for (let index = 1; index < trumanMasterHolds.length; index += 1) {
    assert.ok(
      trumanMasterHolds[index - 1].durationSeconds >= trumanMasterHolds[index].durationSeconds,
      "holds must stay sorted by duration",
    );
  }
  assert.equal(trumanMasterHolds[0].id, "hold-01");
  assert.ok(trumanMasterHolds[0].durationSeconds > 120);
  assert.ok(trumanMasterSilences[0].durationSeconds > 240);
  assert.ok(trumanMasterSilences[0].detectedTransitions > 0);

  // Every measurement the article points at must render.
  for (const section of theTrumanShowArticle.sections) {
    for (const block of section.blocks) {
      if (block.kind === "measurement") {
        assert.ok(describeTrumanMeasurement(block.measurement), `${block.id}: no view`);
      }
      if (block.kind === "measurement-table") {
        for (const row of block.rows) {
          assert.ok(describeTrumanMeasurement(row.measurement), `${row.id}: no view`);
        }
      }
    }
  }

  // The generated dataset must still describe the template its article assumes.
  const library = trumanMasterWindows.find((window) => window.id === "library");
  assert.ok(library);
  assert.equal(library.detectedTransitions, 0);
  assert.equal(library.startSceneId, "truman-sc-lauren-sylvia");

  assert.equal(formatMasterTimecode(1320), "22:00");
  assert.equal(formatMasterTimecode(5755.382), "95:55");
});

test("a measured window is described by what was measured, not by the chapter it sits in", () => {
  const hold = trumanMasterHolds[0];
  const reunion = theTrumanShowCanonicalPackage.evidence?.find(
    (record) => record.id === "truman-ev-reunion",
  );
  assert.ok(hold && reunion?.timestampSeconds);
  // The sampled embrace is approximately at 59:51; the longest hold ends at 57:27.
  // Naming that hold «возвращение отца» was an attribution the data contradicts.
  assert.ok(
    reunion.timestampSeconds > hold.to,
    "the reunion sits outside the longest hold; the article may not name the hold after it",
  );
  const holdView = describeTrumanMeasurement({ table: "hold", id: hold.id });
  assert.equal(holdView?.title, "Самый длинный отрезок без обнаруженного перехода");

  // The 46:29–47:34 window is the repeating-street beat inside the scene the
  // inventory itself names for the flowers and the dented beetle — not a manhunt.
  const panic = trumanMasterWindows.find((window) => window.id === "panic");
  assert.ok(panic);
  assert.equal(panic.startSceneId, "truman-sc-lady-flowers-dented-beetle");
  const panicView = describeTrumanMeasurement({ table: "window", id: panic.id });
  assert.ok(panicView);
  assert.ok(!/идёт|переполох/i.test(panicView.title), "the label may not invent a manhunt");

  // Figures the prose prints must be the figures the dataset holds.
  const wall = trumanMasterWindows.find((window) => window.id === "wall");
  assert.ok(wall);
  const perMinute = (transitions: number, seconds: number) =>
    (transitions / seconds) * 60;
  const panicRate = perMinute(panic.detectedTransitions, panic.durationSeconds);
  const wallRate = perMinute(wall.detectedTransitions, wall.durationSeconds);
  assert.ok(panicRate / wallRate > 4 && panicRate / wallRate < 4.3, "the ratio is ~4.2");
  // The rates are derived in the view, not typed into prose: prose may not carry a
  // measured number, and a reader comparing a 65-second window with a 4-minute one
  // should not have to divide.
  const panicDetail = describeTrumanMeasurement({ table: "window", id: "panic" })?.detail ?? "";
  const wallDetail = describeTrumanMeasurement({ table: "window", id: "wall" })?.detail ?? "";
  assert.match(panicDetail, /28,6 перехода в минуту/);
  assert.match(wallDetail, /6,8 перехода в минуту/);
  const articleText = JSON.stringify(theTrumanShowArticle);
  assert.ok(!/\d,\d перехода в минуту/.test(articleText), "rates are rendered, not typed");
  // Four chosen windows cannot establish the film's maximum cutting rate.
  assert.ok(!articleText.includes("максимальный темп"));
  // Nor may a detection count be reported as a continuously moving camera.
  assert.ok(!articleText.includes("одна камера, один план"));
  assert.ok(!articleText.includes("монтаж не вмешивается"));

  // What the script counted is subtitle cues, and the interface now says so.
  assert.match(panicView.secondary, /строк/);
  const silenceView = describeTrumanMeasurement({ table: "silence", id: "silence-01" });
  assert.match(silenceView?.detail ?? "", /строк[аи]? субтитров/);
});

test("Film 001 measurement figures add up: end minus start equals the printed length", () => {
  const toSeconds = (timecode: string) => {
    const [minutes, seconds] = timecode.split(":").map(Number);
    return minutes * 60 + seconds;
  };

  const holdsAndSilences = [
    ...trumanMasterHolds.map((hold) => ({ table: "hold" as const, id: hold.id })),
    ...trumanMasterSilences.map((silence) => ({ table: "silence" as const, id: silence.id })),
  ];

  for (const ref of holdsAndSilences) {
    const view = describeTrumanMeasurement(ref);
    assert.ok(view, `${ref.table}/${ref.id}: no view`);
    const bounds = view.detail.match(/^(\d+:\d{2})–(\d+:\d{2})/);
    assert.ok(bounds, `${ref.table}/${ref.id}: detail has no span`);
    assert.equal(
      toSeconds(bounds[2]) - toSeconds(bounds[1]),
      toSeconds(view.primary),
      `${ref.table}/${ref.id}: printed span and printed length disagree`,
    );
  }

  for (const window of trumanMasterWindows) {
    const view = describeTrumanMeasurement({ table: "window", id: window.id });
    assert.ok(view && /^\d+:\d{2}–\d+:\d{2}/.test(view.detail), `${window.id}: window has no span`);
    assert.ok(!/undefined|NaN/.test(`${view.primary} ${view.secondary} ${view.detail}`));
  }
});

/* ------------------------------------------------------------------------- *
 * Film 001 — module prose audit.
 *
 * The article layer has structural guards; the module layer needs editorial
 * ones. These tests encode what the audit in docs/51 found: research-era
 * garbling, a prop misidentified as a knife, a lapel button attributed to the
 * wrong character, and an «earpiece» nobody could source.
 * ------------------------------------------------------------------------- */

type ProseString = { path: string; moduleKind: string; key: string; text: string };

function collectModuleStrings(
  value: unknown,
  moduleKind: string,
  path: string,
  out: ProseString[],
): void {
  if (typeof value === "string") {
    const key = path.split(".").at(-1) ?? "";
    out.push({ path, moduleKind, key, text: value });
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectModuleStrings(item, moduleKind, `${path}[${index}]`, out));
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      collectModuleStrings(item, moduleKind, `${path}.${key}`, out);
    }
  }
}

function packageProse(): ProseString[] {
  const out: ProseString[] = [];
  for (const filmModule of theTrumanShowCanonicalPackage.modules) {
    collectModuleStrings(filmModule, filmModule.kind, filmModule.id, out);
  }
  return out;
}

test("Film 001 module prose carries no research-era garbling", () => {
  // Typos and half-words that survived the promotion untouched.
  const garbled = ["вшейт", "немошен", "переназ", "сопережевании", "Аланис", "Ханна Гилл", "Omnicom"];
  const offenders = packageProse().filter((item) =>
    garbled.some((needle) => item.text.toLowerCase().includes(needle.toLowerCase())),
  );
  assert.deepEqual(
    offenders.map((item) => `${item.path}: ${item.text.slice(0, 80)}`),
    [],
  );
});

test("Film 001 modules state no refuted claim as a fact of the film", () => {
  // Every one of these was disproved against the locked master. Outside the
  // sources-method locators they must not appear at all; inside a locator they
  // are allowed only when the string also says who claims it and that the film
  // does not bear it out.
  const refuted = ["наушник", "подкоп", "кто нуждается в европе", "who needs europe", "личный дождь", "булавк"];
  const attribution = ["в источнике", "не подтверждено", "в фильме отсутствует", "не читается", "в фильме нет"];

  const offenders = packageProse().filter((item) => {
    const text = item.text.toLowerCase();
    if (!refuted.some((needle) => text.includes(needle))) return false;
    if (item.moduleKind !== "sources-method") return true;
    // A reference keeps its own title and URL; only its locator is our prose.
    if (item.key === "href" || item.key === "label") return false;
    return !attribution.some((marker) => text.includes(marker));
  });

  assert.deepEqual(
    offenders.map((item) => `${item.path}: ${item.text.slice(0, 90)}`),
    [],
  );
});

test("Film 001 modules attribute the lapel button and the grater to the right people", () => {
  const prose = packageProse();
  const byId = (id: string) => prose.filter((item) => item.path.includes(id));

  const sylvia = byId("truman-ch-sylvia").map((item) => item.text).join(" ");
  assert.equal(
    /как всё это закончится|how's it going to end/i.test(sylvia),
    false,
    "the «HOW'S IT GOING TO END?» button belongs to Truman's basement, not to Sylvia",
  );

  const merylRelationship = byId("truman-rel-knife").map((item) => item.text).join(" ");
  assert.equal(/нож/i.test(merylRelationship), false, "the scene has a grater, not a knife");
});

test("Film 001 post-lock evidence additions are ledgered and counted", () => {
  const canonicalIds = new Set((theTrumanShowCanonicalPackage.evidence ?? []).map((item) => item.id));
  const ledgered = new Map(
    trumanPostLockEvidenceVerifications.map((record) => [record.evidenceId, record]),
  );

  assert.deepEqual(
    [...trumanCanonicalEvidenceSummary.postLock].sort(),
    [...ledgered.keys()].sort(),
    "every post-lock record must have a post-lock ledger entry and vice versa",
  );

  for (const id of trumanCanonicalEvidenceSummary.postLock) {
    assert.ok(canonicalIds.has(id), `${id}: post-lock record is missing from the package`);
    assert.ok(
      (trumanCanonicalEvidenceSummary.added as readonly string[]).includes(id),
      `${id}: post-lock records are also records without a research counterpart`,
    );
    const record = ledgered.get(id);
    assert.ok(record);
    assert.equal(record.status, "TRANSCRIPT_CONFIRMED", `${id}: dialogue-only additions are transcript-checked`);
    assert.ok(record.frames.length > 0, `${id}: no observed second`);
  }

  // The research-era ledger stays pinned to its own 39 records.
  assert.equal(trumanVisualVerificationSummary.records, 39);
  assert.equal(trumanPostLockEvidenceSummary.visualConfirmed, 0);
});

test("Film 001 characters answer every docs/03 §5 question for a locked edition", () => {
  const charactersModule = theTrumanShowCanonicalPackage.modules.find(
    (module): module is CharactersModule => module.kind === "characters",
  );
  assert.ok(charactersModule, "the canonical package has a characters module");

  const presentations = Object.keys(characterPresentationLabels);
  const identifications = Object.keys(identificationLabels);
  const credibilities = Object.keys(arcCredibilityLabels);

  for (const character of charactersModule.characters) {
    assert.ok(character.presentation, `${character.id}: presentation`);
    assert.ok(character.identification, `${character.id}: identification`);
    assert.ok(character.loyalties?.trim(), `${character.id}: loyalties`);
    assert.ok(character.unchanged?.trim(), `${character.id}: unchanged`);

    const arc = character.arcCredibility;
    if (!arc) assert.fail(`${character.id}: arcCredibility`);
    assert.ok(arc.note.trim(), `${character.id}: arcCredibility.note`);

    assert.ok(presentations.includes(character.presentation), `${character.id}: unknown presentation`);
    assert.ok(identifications.includes(character.identification), `${character.id}: unknown identification`);
    assert.ok(credibilities.includes(arc.level), `${character.id}: unknown credibility`);
  }

  // Every label has to render, or the card silently prints an enum value.
  for (const value of presentations) assert.ok(characterPresentationLabels[value as never]);
  for (const value of identifications) assert.ok(identificationLabels[value as never]);
  for (const value of credibilities) assert.ok(arcCredibilityLabels[value as never]);
});

test("Film 001 spoiler projection keeps the profile measurements and drops the interpretation", () => {
  const charactersModule = theTrumanShowCanonicalPackage.modules.find(
    (module): module is CharactersModule => module.kind === "characters",
  );
  assert.ok(charactersModule);

  const projected = projectFilmModule(charactersModule, "NONE");
  assert.ok(projected && projected.kind === "characters");

  for (const character of projected.characters) {
    assert.ok(character.presentation, `${character.id}: presentation survives the spoiler gate`);
    assert.ok(character.identification, `${character.id}: identification survives the spoiler gate`);
    assert.ok(character.loyalties, `${character.id}: loyalties survive the spoiler gate`);
    assert.equal(character.believes, undefined, `${character.id}: interpretation stays hidden`);
    assert.equal(character.unchanged, undefined, `${character.id}: arc reading stays hidden`);
    assert.equal(character.arcCredibility, undefined, `${character.id}: arc verdict stays hidden`);
  }
});

test("Film 001 module order follows the analytical order of docs/03 §3", () => {
  const order = [
    "story",
    "characters",
    "relationship",
    "family-youth",
    "meaning",
    "teaching-signals",
    "craft",
    "autopsy",
    "decision",
    "moral-analysis",
    "permission",
    "biblical-synthesis",
    "final-synthesis",
    "sources-method",
  ];

  // Repeats (one module per relationship) are allowed; the first appearance is what orders.
  const actual = [...new Set(theTrumanShowCanonicalPackage.modules.map((module) => module.kind))];
  const expected = order.filter((kind) => actual.includes(kind as never));
  assert.deepEqual(actual, expected, "modules read in the documented order: analysis, then norms, then synthesis");

  const numbers = theTrumanShowCanonicalPackage.modules.map((module) => {
    const match = /^(\d+)\s*\//.exec(module.eyebrow ?? "");
    assert.ok(match, `${module.id}: eyebrow carries its reading position`);
    return Number(match[1]);
  });
  assert.deepEqual(
    numbers,
    [...numbers].sort((a, b) => a - b),
    "eyebrow numbers never run backwards",
  );
});

test("Film 001 article sections link only to modules the reader can open", () => {
  const article = structuredClone(theTrumanShowArticle);
  const method = article.sections.find((section) => section.id === "truman-article-method");
  assert.ok(method);
  assert.deepEqual(method.moduleIds, ["truman-mod-sources"]);
  assert.deepEqual(validateFilmArticle(article, trumanArticleContext()), []);

  // A section may not point at a module that sits behind a higher spoiler gate.
  method.moduleIds = ["truman-mod-final"];
  assert.match(
    validateFilmArticle(article, trumanArticleContext()).join("\n"),
    /truman-article-method: module "truman-mod-final" needs spoiler level "FULL", above the section's "NONE"/,
  );

  // Nor at a module that does not exist.
  method.moduleIds = ["truman-mod-does-not-exist"];
  assert.match(
    validateFilmArticle(article, trumanArticleContext()).join("\n"),
    /unknown module id "truman-mod-does-not-exist"/,
  );

  // And without a module index the check fails closed instead of passing silently.
  method.moduleIds = ["truman-mod-sources"];
  assert.match(
    validateFilmArticle(article, trumanArticleContext({ moduleLevels: undefined })).join("\n"),
    /module links require the package's module levels/,
  );

  // An empty list is a silent way of saying nothing: rejected rather than ignored.
  method.moduleIds = [];
  assert.match(
    validateFilmArticle(article, trumanArticleContext()).join("\n"),
    /moduleIds must name at least one module/,
  );

  // The same module twice would render as two identical links.
  method.moduleIds = ["truman-mod-sources", "truman-mod-sources"];
  assert.match(
    validateFilmArticle(article, trumanArticleContext()).join("\n"),
    /module "truman-mod-sources" is linked twice/,
  );

  // One bad id among good ones is still a broken link, not a warning.
  method.moduleIds = ["truman-mod-sources", "truman-mod-does-not-exist"];
  const mixed = validateFilmArticle(article, trumanArticleContext()).join("\n");
  assert.match(mixed, /unknown module id "truman-mod-does-not-exist"/);
  assert.doesNotMatch(mixed, /module "truman-mod-sources"/);

  // A section may read alongside more than one module: the shipped comparison of
  // marriage and friendship names both, and both open at the section's level.
  const bonds = theTrumanShowArticle.sections.find((section) => section.id === "truman-article-bonds");
  assert.ok(bonds);
  assert.deepEqual(bonds.moduleIds, ["truman-mod-relationship", "truman-mod-friendship"]);

  // Every shipped section that names modules names real ones, and never repeats.
  const levels = trumanArticleContext().moduleLevels as Map<string, string>;
  for (const section of theTrumanShowArticle.sections) {
    const ids = section.moduleIds ?? [];
    assert.equal(new Set(ids).size, ids.length, `${section.id}: module links must be unique`);
    for (const moduleId of ids) {
      assert.ok(levels.has(moduleId), `${section.id}: ${moduleId} is not a module of this package`);
    }
  }
});

test("Film 001 page metadata describes the page, not the site, and cannot spoil the ending", () => {
  const shareAsset = getFilmShareAsset("the-truman-show");
  assert.ok(shareAsset, "Film 001 has its own share art");
  const shareImage = shareImageFromAsset(shareAsset);
  assert.ok(shareImage);
  assert.equal(shareImage.url, "/og/truman-show-share.jpg");
  assert.equal(shareImage.width, 1200);
  assert.equal(shareImage.height, 630);
  assert.ok(shareImage.alt.length > 40, "share art carries a real alternative text");

  const filmPage = filmPageMetadata(theTrumanShowCanonicalPackage, shareImage);
  assert.equal(filmPage.title, "Шоу Трумана");
  assert.equal(filmPage.openGraph.url, "/films/the-truman-show");
  assert.equal(filmPage.openGraph.type, "article");
  assert.equal(
    filmPage.description,
    `Шоу Трумана (1998) — ${theTrumanShowCanonicalPackage.film.premise}`,
  );
  // A published description may not carry the ending: the premise stops at the first
  // anomaly, before the sea, the wall and the door.
  assert.doesNotMatch(filmPage.description, /финал|дверь|стен|море|уходит|выбирается/i);
  assert.equal(filmPage.twitter.title, filmPage.openGraph.title);
  // A page-level openGraph replaces the layout's object, images included: the
  // card must still carry artwork, or shares go out with no picture at all.
  assert.equal(filmPage.openGraph.images.length, 1);
  assert.equal(filmPage.openGraph.images[0].url, "/og/truman-show-share.jpg");
  assert.equal(filmPage.twitter.images[0], "/og/truman-show-share.jpg");
  assert.equal(filmPage.openGraph.siteName, "Глубокие воды");

  // A film without its own art still gets a card: the site image, never nothing.
  const siteFallback = filmPageMetadata(theTrumanShowCanonicalPackage);
  assert.equal(siteFallback.openGraph.images[0].url, "/og-home.png");
  assert.equal(siteFallback.twitter.images[0], "/og-home.png");

  const articlePage = articlePageMetadata(theTrumanShowCanonicalPackage, shareImage);
  assert.ok(articlePage);
  assert.equal(articlePage.openGraph.url, "/films/the-truman-show/article");
  assert.equal(
    articlePage.openGraph.images[0].url,
    "/og/truman-show-share.jpg",
    "the readable layer shares the film's own card",
  );
  // The snippet is either the standfirst fitted to the search result, or the
  // article's own declared snippet — never a summary written somewhere else.
  assert.equal(
    articlePage.description,
    fitDescription(theTrumanShowArticle.seoDescription ?? theTrumanShowArticle.standfirst),
    "the share card carries the standfirst (or its declared snippet) and nothing else",
  );
  assert.equal(articlePage.description.length <= 160, true);
  assert.equal(articlePage.title.length <= 49, true);
  // The film is named once. The old title said "Шоу Трумана" twice and ran 90
  // characters, which is two failures in one string.
  assert.equal(
    articlePage.title.split("Шоу Трумана").length - 1,
    1,
    "the film is named once in the title",
  );

  // A share card has no spoiler control next to it, so nothing above MINOR may
  // reach it: not a heading, not a section standfirst, not a block.
  const readableAtMinor = theTrumanShowArticle.sections
    .filter((section) => canRevealSpoiler("MINOR", section.spoilerLevel))
    .map((section) => section.id);
  const hiddenText = theTrumanShowArticle.sections
    .filter((section) => !readableAtMinor.includes(section.id))
    .flatMap((section) => [section.heading, section.standfirst ?? ""])
    .filter((value) => value.length > 24);
  for (const value of hiddenText) {
    assert.equal(
      articlePage.description.includes(value),
      false,
      `share card must not quote the hidden section "${value.slice(0, 40)}…"`,
    );
  }

  // A package without an article has no article card at all.
  assert.equal(articlePageMetadata(theTrumanShowDraftPackage), undefined);
});

test("dark palette keeps every text token above WCAG AA contrast", () => {
  const tokens = readFileSync("src/styles/tokens.css", "utf8");
  const value = (name: string): string => {
    const match = new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`).exec(tokens);
    assert.ok(match, `token --${name} must be a hex colour so contrast is checkable`);
    return match[1].toLowerCase();
  };

  const luminance = (hex: string): number => {
    const channels = [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255);
    const linear = channels.map((channel) =>
      channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
    );
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
  };
  const contrast = (foreground: string, background: string): number => {
    const [a, b] = [luminance(foreground), luminance(background)];
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  };

  // Every ink step is used for text at 0.68–1rem (meta labels, timecodes, table
  // heads), so the normal-text threshold applies to all four.
  const surfaces = ["surface-canvas", "surface-1", "surface-2", "surface-3", "surface-warm"];
  for (const ink of ["ink-1", "ink-2", "ink-3", "ink-4"]) {
    for (const surface of surfaces) {
      const ratio = contrast(value(ink), value(surface));
      assert.ok(
        ratio >= 4.5,
        `--${ink} on --${surface} is ${ratio.toFixed(2)}:1, below the 4.5:1 needed for normal text`,
      );
    }
  }

  // Media is not a token-coloured canvas: bound every possible source-image pixel.
  const scrim = /--surface-media-caption:\s*rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/.exec(tokens);
  assert.ok(scrim, "media caption scrim must expose its actual RGBA for verification");
  const alpha = Number(scrim[4]);
  assert.ok(alpha > 0 && alpha <= 1);
  const worstBackground = "#" + scrim.slice(1, 4).map(channel =>
    Math.ceil(Number(channel) * alpha + 255 * (1 - alpha)).toString(16).padStart(2, "0"),
  ).join("");
  for (const ink of ["ink-1", "ink-2", "ink-3"]) {
    assert.ok(contrast(value(ink), worstBackground) >= 4.5, `--${ink} over brightest possible media caption`);
  }
  const heroCss = readFileSync("src/styles/home/hero.css", "utf8");
  const workbenchCss = readFileSync("src/components/analysis-workbench.module.css", "utf8");
  for (const [css, selector] of [[heroCss, "frameMeta"], [heroCss, "frameCaption"], [workbenchCss, "frameMeta"]]) {
    const block = new RegExp(`\\.${selector}\\s*\\{([^}]+)\\}`).exec(css);
    assert.ok(block?.[1].includes("background: var(--surface-media-caption)"), `${selector} keeps image-independent text backing`);
  }

  // Accents: restoration is a text colour, fracture is not — it is far too dark
  // for text on this palette and may only be used for lines and fills.
  for (const surface of surfaces) {
    const ratio = contrast(value("accent-restoration"), value(surface));
    assert.ok(ratio >= 4.5, `--accent-restoration on --${surface} is ${ratio.toFixed(2)}:1`);
  }
  assert.ok(
    contrast(value("accent-fracture"), value("surface-canvas")) < 3,
    "--accent-fracture is a structural colour: if it ever becomes legible as text, this guard should be revisited along with a contrast fix",
  );

  const stylesheets = readdirSync("src/styles", { recursive: true })
    .map(String)
    .filter((file) => file.endsWith(".css"))
    .map((file) => [file, readFileSync(`src/styles/${file}`, "utf8")] as const);
  // `(?<![-a-z])` keeps `border-color`/`background-color` out of the text check.
  const fractureAsText = stylesheets.filter(([, css]) =>
    /(?<![-a-z])color:\s*var\(--accent-fracture\)/.test(css),
  );
  assert.deepEqual(
    fractureAsText.map(([file]) => file),
    [],
    "--accent-fracture must not be used as a text colour: it fails contrast on the dark palette",
  );
});

test("Film 001 share art is declared, validated and shaped like a card", () => {
  // One declaration feeds two readers: the visual-asset registry (validation)
  // and the page metadata (og:image). The suite reads the same module, so a
  // broken manifest fails here rather than at share time.
  assert.equal(filmShareAssets.length, 2, "the film has a card and the dossier has a cover");
  const asset = getFilmShareAsset("the-truman-show");
  assert.ok(asset);
  assert.deepEqual(validateVisualAssetManifest(asset), []);
  assert.equal(asset.role, "social");
  assert.equal(asset.filmSlug, "the-truman-show");
  assert.equal(asset.decorative, undefined, "share art is informative, so it carries alt text");
  assert.ok(asset.alt.length > 40);

  const shareCard = asset.variants.find((variant) => variant.purpose === "share-card");
  assert.ok(shareCard, "a share card variant is what og:image may point at");
  assert.equal(shareCard.width, 1200);
  assert.equal(shareCard.height, 630);
  assert.equal(shareCard.format, "jpg");

  // Every variant shares one aspect ratio, and the declared one is the card's.
  for (const variant of asset.variants) {
    assert.ok(
      Math.abs(variant.width / variant.height - asset.aspectRatio) / asset.aspectRatio <= 0.015,
      `${variant.id} must keep the manifest aspect ratio`,
    );
  }
  assert.ok(
    asset.variants.some((variant) => variant.purpose === "display" && !variant.minTier),
    "the static fallback needs a display variant open to LITE",
  );

  // Generated art must be able to say where it came from.
  assert.equal(asset.provenance.sourceKind, "generated");
  assert.ok(asset.provenance.promptVersion);
  assert.ok(asset.provenance.createdAt);

  // A film without art resolves to nothing and falls back to the site card.
  assert.equal(getFilmShareAsset("no-such-film"), undefined);
});

// The days this dossier's sources were actually opened, in order. Adding a
// source from a new session means adding its date here first.
// Variety, Gutenberg and the current archive page were reopened on 2026-10-30 UTC.
const RESEARCH_SITTINGS = ["2026-10-28", "2026-10-29", "2026-10-30"];

test("Film 001 production dossier holds its own register", () => {
  const dossier = theTrumanShowProductionDossier;
  assert.deepEqual(validateProductionDossier(dossier), []);

  // The request was 50+ links, and a register that big has to stay honest:
  // mostly primary or secondary, with tertiary material capped.
  assert.ok(
    dossier.sources.length >= PRODUCTION_SOURCE_MINIMUM,
    `register carries ${dossier.sources.length} sources, floor is ${PRODUCTION_SOURCE_MINIMUM}`,
  );
  const tertiary = dossier.sources.filter((source) => source.tier === "TERTIARY").length;
  const primary = dossier.sources.filter((source) => source.tier === "PRIMARY").length;
  assert.ok(primary >= 3, "a production history needs people who were there");
  assert.ok(tertiary / dossier.sources.length <= PRODUCTION_TERTIARY_MAX_SHARE);

  // Every URL is a real https document, and none of them is our own site or a
  // search engine — a "source" that finds sources is not a source.
  const hosts = new Set<string>();
  for (const source of dossier.sources) {
    const url = new URL(source.url);
    assert.equal(url.protocol, "https:");
    hosts.add(url.host);
    assert.equal(/google|bing|duckduckgo|yandex|localhost|127\.0\.0\.1/.test(url.host), false);
    // Each entry records the day it was actually opened.
    assert.ok(
      RESEARCH_SITTINGS.includes(source.checkedOn),
      `${source.id} claims a check on ${source.checkedOn}, which is not a recorded sitting`,
    );
    assert.ok(source.supports.length > 30, `${source.id}: supports must say what it backs`);
  }
  assert.ok(hosts.size > 25, "a register of 75 sources should not be 25 sites");

  // Sections read in order and each one carries something.
  assert.deepEqual(
    dossier.sections.map((section) => section.number),
    dossier.sections.map((_, index) => index + 1),
  );
  assert.equal(dossier.claims.filter((claim) => claim.status === "CONFIRMED").length > 60, true);
});

test("Film 001 production dossier never borrows the film's authority", () => {
  const dossier = theTrumanShowProductionDossier;
  const timecode = /(?<![\d:.])(\d{3,4}\.\d{3})(?![\d])/;

  // Production facts and measured film facts are different kinds of proof. The
  // guard is mechanical: no timecode may appear anywhere in this document.
  for (const claim of dossier.claims) {
    assert.equal(timecode.test(claim.text), false, `${claim.id}: timecode in a production claim`);
  }
  for (const section of dossier.sections) {
    const text = section.blocks
      .map((block) => JSON.stringify(block))
      .join(" ");
    assert.equal(timecode.test(text), false, `${section.id}: timecode in prose`);
  }

  // Nothing here may point at the evidence graph — that is the article's job.
  const serialized = JSON.stringify(dossier);
  assert.equal(serialized.includes("evidenceId"), false);
  assert.equal(serialized.includes("timestampSeconds"), false);

  // And the structure has no spoiler levels at all: the piece is written at a
  // single, spoiler-free level, which is a property of the data, not a promise.
  assert.equal(serialized.includes("spoilerLevel"), false);
});

test("Film 001 production dossier shows every claim it could not settle", () => {
  const dossier = theTrumanShowProductionDossier;
  const surfaced = new Map<string, string>();
  for (const section of dossier.sections) {
    for (const block of section.blocks) {
      if (block.kind !== "myths") continue;
      for (const row of block.rows) {
        assert.equal(surfaced.has(row.claimId), false, `${row.claimId} is surfaced twice`);
        surfaced.set(row.claimId, row.verdict);
      }
    }
  }

  const unsettled = dossier.claims.filter((claim) => claim.status !== "CONFIRMED");
  assert.ok(unsettled.length >= 5, "the dossier should admit at least a few unknowns");
  for (const claim of unsettled) {
    assert.ok(surfaced.has(claim.id), `${claim.id} (${claim.status}) is hidden from the reader`);
    assert.ok((surfaced.get(claim.id) ?? "").length > 40, `${claim.id}: a verdict, not a shrug`);
  }
  // A settled claim may not be smuggled into the myth register.
  for (const claimId of surfaced.keys()) {
    const claim = dossier.claims.find((candidate) => candidate.id === claimId);
    assert.ok(claim);
    assert.notEqual(claim.status, "CONFIRMED");
  }
});

test("Film 001 production dossier fails closed on the mistakes that matter", () => {
  const dossier = theTrumanShowProductionDossier;
  const errorsOf = (mutate: (copy: typeof dossier) => void): string => {
    const copy = structuredClone(dossier);
    mutate(copy);
    return validateProductionDossier(copy).join("\n");
  };

  // A timecode is the one thing a production text may never carry.
  assert.match(
    errorsOf((copy) => {
      const claim = copy.claims[0];
      claim.text = `Сцена на 3226.152 выглядит иначе.`;
    }),
    /may not carry a timecode/,
  );

  // An unsourced claim is a rumour.
  assert.match(
    errorsOf((copy) => {
      copy.claims[0].sourceIds = [];
    }),
    /a claim needs at least one source/,
  );

  // CONFIRMED cannot rest on a wiki alone.
  assert.match(
    errorsOf((copy) => {
      copy.claims[0].sourceIds = ["src-simple-wiki"];
    }),
    /CONFIRMED needs at least one primary or secondary source/,
  );

  // A number in a table without a source.
  assert.match(
    errorsOf((copy) => {
      const facts = copy.sections.flatMap((section) => section.blocks).find((block) => block.kind === "facts");
      assert.ok(facts && facts.kind === "facts");
      facts.rows[0].sourceIds = [];
    }),
    /a number without a source is a rumour/,
  );

  // A disputed claim that is not shown to the reader.
  assert.match(
    errorsOf((copy) => {
      copy.sections = copy.sections.map((section) => ({
        ...section,
        blocks: section.blocks.filter((block) => block.kind !== "myths"),
      }));
    }),
    /must be surfaced in a myths block/,
  );

  // A settled claim cannot be presented as a myth.
  assert.match(
    errorsOf((copy) => {
      const myths = copy.sections.flatMap((section) => section.blocks).find((block) => block.kind === "myths");
      assert.ok(myths && myths.kind === "myths");
      myths.rows[0].claimId = "claim-treatment-1991";
    }),
    /is CONFIRMED — a settled claim does not belong in the myth register/,
  );

  // A URL that is not a document.
  assert.match(
    errorsOf((copy) => {
      copy.sources[0].url = "http://example.com/truman";
    }),
    /url must be an absolute https URL/,
  );
  assert.match(
    errorsOf((copy) => {
      copy.sources[1].url = copy.sources[0].url;
    }),
    /duplicate url/,
  );

  // A register that shrinks below the floor.
  assert.match(
    errorsOf((copy) => {
      copy.sources = copy.sources.slice(0, 10);
    }),
    new RegExp(`needs at least ${PRODUCTION_SOURCE_MINIMUM} sources`),
  );

  // And a source nobody cites is decoration, not a register.
  assert.match(
    errorsOf((copy) => {
      copy.claims = copy.claims.map((claim) => ({
        ...claim,
        sourceIds: claim.sourceIds.filter((id) => id !== "src-bfi-niccol"),
      }));
    }),
    /no claim uses this source|unknown source id/,
  );
});

test("the production registry and its page metadata agree with the data", () => {
  assert.deepEqual(validateProductionDossierRegistry(productionDossiers), []);
  assert.equal(productionDossiers.length, 1);
  assert.equal(getProductionDossier("the-truman-show")?.id, "truman-production-dossier");
  assert.equal(getProductionDossier("no-such-film"), undefined);

  const filmPackage = theTrumanShowCanonicalPackage;
  const dossier = theTrumanShowProductionDossier;
  const shareImage = shareImageFromAsset(getFilmShareAsset("the-truman-show")!);
  const page = productionPageMetadata(filmPackage, dossier, shareImage);

  assert.equal(page.openGraph.url, "/films/the-truman-show/making");
  assert.equal(page.openGraph.type, "article");
  assert.equal(
    page.description,
    fitDescription(dossier.seoDescription ?? dossier.standfirst),
    "the card carries the standfirst (or its declared snippet) and nothing else",
  );
  assert.equal(page.description.length <= 160, true);
  assert.equal(page.title.length <= 49, true);
  assert.equal(page.title.includes("история создания"), true, "the tab shows the short title");
  assert.equal(page.openGraph.images[0].url, "/og/truman-show-share.jpg");
  assert.equal(page.twitter.images[0], "/og/truman-show-share.jpg");
  assert.match(page.title, /Шоу Трумана/);

  // The standfirst is the share description, so it must not describe the film's
  // plot at all: it is the one string that travels without a spoiler control.
  assert.equal(/Труман (выходит|покидает|умирает)/.test(dossier.standfirst), false);
});

test("Film 001 production cover is a 16:9 hero that shares as the dossier", () => {
  const cover = getProductionCoverAsset("the-truman-show");
  assert.ok(cover, "the production dossier has its own cover");
  assert.equal(cover.role, "hero");
  assert.equal(cover.id, "truman-making-cover-01");
  assert.deepEqual(validateVisualAssetManifest(cover), []);
  assert.equal(cover.aspectRatio, 16 / 9);
  for (const variant of cover.variants) {
    assert.equal(
      Math.abs(variant.width / variant.height - 16 / 9) < 0.001,
      true,
      `${variant.id} must be exactly 16:9: ${variant.width}×${variant.height}`,
    );
  }

  // The film card and the dossier cover are different pictures for different
  // documents: one query returning the other would be the quiet kind of mistake.
  const filmCard = getFilmShareAsset("the-truman-show");
  assert.ok(filmCard);
  assert.notEqual(filmCard.id, cover.id);
  assert.notEqual(
    shareImageFromAsset(filmCard)?.url,
    shareImageFromAsset(cover)?.url,
  );

  const hero = heroImageFromAsset(cover);
  assert.ok(hero);
  // The `<img>` is the guaranteed fallback — never AVIF-only.
  assert.equal(hero.src, "/og/truman-making-wide.jpg");
  assert.equal(hero.width, 1280);
  assert.equal(hero.height, 720);
  assert.ok(hero.alt.length > 40);

  // …and the `<picture>` offers the smaller format first, at the same pixels.
  assert.deepEqual(
    hero.sources.map((source) => [source.type, source.width, source.height]),
    [["image/avif", 1280, 720]],
  );
  const avif = cover.variants.find((variant) => variant.format === "avif");
  assert.ok(avif);
  const jpegTwin = cover.variants.find(
    (variant) => variant.format === "jpg" && variant.purpose === avif.purpose,
  );
  assert.ok(jpegTwin);
  assert.ok(
    (avif.byteSize ?? 0) > 0 && (avif.byteSize ?? 0) < (jpegTwin.byteSize ?? 0) * 0.6,
    "AVIF must actually be substantially smaller, or it is only decoration",
  );

  // The dossier's own card is 1200×675 — 16:9, not the 1.91:1 of the film card.
  const card = shareImageFromAsset(cover);
  assert.ok(card);
  assert.equal(card.url, "/og/truman-making-share.jpg");
  assert.equal(card.width, 1200);
  assert.equal(card.height, 675);
  // The share card stays JPEG on purpose: scrapers do not read AVIF reliably.
  assert.equal(card.url.endsWith(".jpg"), true);

  // And the metadata for the dossier page uses it, while the analysis page keeps
  // its own artwork.
  const filmPackage = theTrumanShowCanonicalPackage;
  const dossier = theTrumanShowProductionDossier;
  const makingPage = productionPageMetadata(filmPackage, dossier, card);
  assert.equal(makingPage.openGraph.images[0].url, "/og/truman-making-share.jpg");
  assert.equal(makingPage.twitter.images[0], "/og/truman-making-share.jpg");
  assert.equal(
    filmPageMetadata(filmPackage, shareImageFromAsset(filmCard)).openGraph.images[0].url,
    "/og/truman-show-share.jpg",
  );

  // A hero without a display variant is not a hero — refuse rather than guess.
  const noDisplay = structuredClone(cover);
  noDisplay.variants = noDisplay.variants.filter((variant) => variant.purpose !== "display");
  assert.equal(heroImageFromAsset(noDisplay), undefined);
  // As is an image with no alternative text: it cannot be informative.
  const noAlt = structuredClone(cover);
  noAlt.alt = "";
  assert.equal(heroImageFromAsset(noAlt), undefined);
});

test("Film 001 production dossier records the arguments about the film, not just its facts", () => {
  const dossier = theTrumanShowProductionDossier;
  const readings = dossier.sections.find((section) => section.id === "prod-readings");
  assert.ok(readings, "the dossier has a section on other people's readings");

  // Reception is data too: each named critic is a claim with a source, so an
  // opinion can never enter the text as if it were the film's own voice.
  const ids = ["claim-ebert-review", "claim-rosenbaum", "claim-knox", "claim-bishop", "claim-thomson"];
  for (const id of ids) {
    const claim = dossier.claims.find((candidate) => candidate.id === id);
    assert.ok(claim, `${id} is declared`);
    assert.equal(claim.status, "CONFIRMED", `${id} is a documented position, not a rumour`);
    assert.ok(claim.sourceIds.length > 0);
    const attributed = dossier.sections
      .flatMap((section) => section.blocks)
      .some((block) => block.kind === "paragraph" && (block.claimIds ?? []).includes(id));
    assert.ok(attributed, `${id} is actually cited in the prose`);
  }

  // The dissenting reading must be present — a dossier that only lists praise is
  // an advertisement. Rosenbaum is the one voice against the film.
  const text = readings.blocks.map((block) => JSON.stringify(block)).join(" ");
  assert.match(text, /Розенбаум/);
  assert.match(text, /умный, и глупый|и умный, и глупый/);

  // And the register must contain the actual documents behind those readings:
  // two peer-reviewed articles and a major daily review, not summaries of them.
  const hosts = dossier.sources.map((source) => new URL(source.url).host);
  for (const host of ["www.semanticscholar.org", "chicagoreader.com", "www.rogerebert.com", "www.theguardian.com"]) {
    assert.ok(hosts.includes(host), `the register cites ${host}`);
  }
  assert.ok(
    dossier.sources.filter((source) => source.tier === "SECONDARY").length >= 25,
    "a reception section needs actual criticism, not study-guide paraphrases",
  );
});

test("Metadata fits the places it is shown: tabs truncate at 60, snippets at 160", () => {
  // Budgets come from the medium, not from taste: a 127-character title is not
  // a longer title, it is a title whose second half nobody sees.
  assert.equal(fitTitle("Короткий заголовок"), "Короткий заголовок");
  const long = fitTitle("Как снимали «Шоу Трумана»: восемь лет, семь режиссёров и один город");
  assert.ok(long.length <= 49, `${long.length} characters`);
  assert.equal(long.endsWith("…"), true);
  assert.equal(long.includes("  "), false);
  // Never cut inside a word: the character after the ellipsis must not exist,
  // and the character before it must not be half a word.
  assert.equal(/[а-яa-z]$/i.test(long.slice(0, -1)), true);

  assert.equal(fitDescription("Коротко."), "Коротко.");
  const twoSentences =
    "Первое предложение целиком и полностью помещается в сниппет. " +
    "Второе предложение длинное, оно уже не помещается в сниппет целиком, и поэтому его окончание отбрасывается при сборке карточки.";
  assert.ok(twoSentences.length > 160);
  const fitted = fitDescription(twoSentences);
  assert.equal(fitted, "Первое предложение целиком и полностью помещается в сниппет.");
  const cut = fitDescription("слово ".repeat(80));
  assert.ok(cut.length <= 160);
  assert.equal(cut.endsWith("…"), true);

  // The declared snippet is validated where it lives, so a blank or an
  // over-long one fails the build rather than the search result.
  const dossier = theTrumanShowProductionDossier;
  assert.deepEqual(validateProductionDossier(dossier), []);
  assert.equal(
    validateProductionDossier({ ...dossier, seoTitle: " ".repeat(5) }).some((error) =>
      error.includes("seoTitle"),
    ),
    true,
  );
  assert.equal(
    validateProductionDossier({ ...dossier, seoDescription: "я".repeat(161) }).some((error) =>
      error.includes("seoDescription"),
    ),
    true,
  );
});

test("An aside may speak for the site's conviction, but never as a reading of the film", () => {
  const biblical = theTrumanShowArticle.sections.find(
    (section) => section.id === "truman-article-biblical",
  );
  assert.ok(biblical);
  const asides = biblical.blocks.filter((block) => block.kind === "aside");
  assert.equal(asides.length, 1, "the section carries exactly one note of this kind");
  const [aside] = asides;
  assert.ok(aside.label.trim().length > 0, "an aside says where it stands");
  assert.match(aside.label, /не про фильм/);

  // The distinction is structural, not tonal: an aside names no evidence, so it
  // cannot be read as a claim about what happens on screen or how to read it.
  assert.equal("support" in aside, false);

  // Every Scripture reference is declared, appears verbatim, and is resolved by
  // the same prose rules as the rest of the article.
  const refs = aside.scriptureRefs ?? [];
  assert.equal(refs.length >= 2, true);
  for (const ref of refs) assert.ok(aside.text.includes(ref), `${ref} appears in the text`);

  // Fail closed: the moment an aside starts citing the master, it stops being an
  // aside. The validator must refuse rather than quietly downgrade the claim.
  // The type itself refuses the field, which is the first line of defence; the
  // validator is the second, for data that arrives without a type.
  const smuggled = structuredClone(biblical);
  const index = smuggled.blocks.findIndex((block) => block.kind === "aside");
  smuggled.blocks[index] = {
    ...smuggled.blocks[index],
    support: { evidenceIds: ["truman-ev-dialog"] },
  } as unknown as (typeof smuggled.blocks)[number];
  const errors = validateFilmArticle(
    { ...theTrumanShowArticle, sections: [smuggled] },
    trumanArticleContext(),
  );
  assert.equal(
    errors.some((error) => error.includes("an aside may not carry evidence")),
    true,
    "citing the master inside an aside is an error",
  );
});

test("Moral judgement is grounded in Scripture inside the argument, not only in the aside", () => {
  const morality = theTrumanShowArticle.sections.find(
    (section) => section.id === "truman-article-morality",
  );
  assert.ok(morality, "the moral section exists");
  const refs = morality.blocks.flatMap((block) =>
    block.kind === "paragraph" ? (block.scriptureRefs ?? []) : [],
  );
  assert.ok(refs.length >= 2, `the moral account cites Scripture: ${refs.length}`);
  for (const ref of refs) {
    assert.match(
      ref,
      /^(Бытие|Марк|Лука|Иоанн|Исход|Деяния|Псалом|Второзаконие|Иона|Притчи|Иаков)\s/,
      `unexpected Scripture reference format: "${ref}"`,
    );
  }

  // Every citation is load-bearing: the paragraph carrying it must judge a
  // concrete act in the story and cite the moment it judges, otherwise the verse
  // is decoration in a section that is supposed to keep accounts.
  for (const block of morality.blocks) {
    if (block.kind !== "paragraph" || !block.scriptureRefs?.length) continue;
    assert.ok(block.support?.evidenceIds?.length, `${block.id} cites the film it judges`);
    for (const ref of block.scriptureRefs) assert.ok(block.text.includes(ref));
  }

  // The section's last word hands the reader to the next section rather than
  // stopping dead, so the labelled aside that follows does not read as an
  // appendix bolted onto the article.
  const lastParagraph = morality.blocks.filter((block) => block.kind === "paragraph").at(-1);
  assert.ok(lastParagraph && lastParagraph.kind === "paragraph");
  assert.match(lastParagraph.text, /следующий раздел/);
});

test("An in-article illustration must be a generated drawing, captioned as not a frame", () => {
  const context = trumanArticleContext();
  const withRegistry = {
    ...context,
    resolveIllustration: (id: string) =>
      // The real registry stays visible, so the illustrations actually placed in
      // the article resolve here too; the stubs below are the negatives.
      illustrationFacts(id) ??
      (id === "illu-ok"
        ? { alt: "Зрительный зал: ряд пустых кресел и много рук с попкорном", sourceKind: "generated", role: "illustration" }
        : id === "illu-still"
          ? { alt: "Кадр из фильма", sourceKind: "frame-grab", role: "illustration" }
          : id === "illu-card"
            ? { alt: "Карточка", sourceKind: "generated", role: "social" }
            : id === "illu-noalt"
              ? { alt: "   ", sourceKind: "generated", role: "illustration" }
              : undefined),
  };

  // Placed into the real article rather than into a two-line stub, so the check
  // also proves the block type coexists with the rules on section count and
  // evidence coverage.
  const articleWith = (block: Record<string, unknown>) => ({
    ...theTrumanShowArticle,
    sections: [
      {
        ...theTrumanShowArticle.sections[0],
        blocks: [...theTrumanShowArticle.sections[0].blocks, block as never],
      },
      ...theTrumanShowArticle.sections.slice(1),
    ],
  });

  const caption = "Иллюстрация: как выглядит соучастие. Это рисунок, не кадр из фильма.";
  const valid = validateFilmArticle(
    articleWith({ kind: "illustration", id: "illu-valid", assetId: "illu-ok", caption }),
    withRegistry,
  );
  assert.deepEqual(valid, []);

  const cases: Array<[Record<string, unknown>, string]> = [
    [{ assetId: "illu-unknown" }, 'unknown illustration "illu-unknown"'],
    [{ assetId: "illu-still" }, "stills require the scene-quotation path"],
    [{ assetId: "illu-card" }, 'has role "social"'],
    [{ assetId: "illu-noalt" }, "has no alternative text"],
    [{ assetId: "illu-ok", caption: "" }, "an illustration needs a caption"],
    [{ assetId: "illu-ok", caption: "Просто красивая картинка" }, "must say the picture is not a frame"],
  ];
  for (const [override, expected] of cases) {
    const errors = validateFilmArticle(
      articleWith({ kind: "illustration", id: "illu-case", assetId: "illu-ok", caption, ...override }),
      withRegistry,
    );
    assert.equal(
      errors.some((error) => error.includes(expected)),
      true,
      `expected an error containing "${expected}", got: ${errors.join(" | ")}`,
    );
  }

  // Without the registry the validator refuses rather than skipping the picture.
  const withoutRegistry = validateFilmArticle(
    articleWith({ kind: "illustration", id: "illu-x", assetId: "illu-ok", caption }),
    { ...context, resolveIllustration: undefined },
  );
  assert.equal(withoutRegistry.some((error) => error.includes("requires the illustration registry")), true);

  // And every picture actually placed in the article is declared in the registry.
  const placed = theTrumanShowArticle.sections
    .flatMap((section) => section.blocks)
    .filter((block) => block.kind === "illustration");
  for (const block of placed) {
    assert.ok(illustrationFacts(block.assetId), `${block.assetId} resolves`);
    const view = illustrationView(block.assetId);
    assert.ok(view, `${block.assetId} renders`);
    // A wide screen must actually reach the larger file: one source per format,
    // each carrying every width. Two sources would keep only the first.
    assert.equal(view.sources.length, 1, `${block.assetId}: one AVIF source`);
    assert.ok(view.sources.every((source) => source.srcSet.includes("800w") && source.srcSet.includes("1200w")));
    assert.ok(view.srcSet.includes("800w") && view.srcSet.includes("1200w"), `${block.assetId}: JPEG srcset`);
    assert.ok(view.sizes.includes("vw"), `${block.assetId}: sizes are declared`);
  }
});

test("Every registered illustration is placed, and a vignette stays a vignette", () => {
  const placed = theTrumanShowArticle.sections
    .flatMap((section) => section.blocks)
    .filter((block) => block.kind === "illustration");

  // No orphan artwork: a picture registered here but never placed would be a
  // file the build ships and no reader sees, and a silent place to hide a draft.
  for (const asset of articleIllustrations) {
    assert.ok(
      placed.some((block) => block.kind === "illustration" && block.assetId === asset.id),
      `${asset.id} is placed in the article`,
    );
    assert.equal(asset.provenance.sourceKind, "generated");
    // Alt text is prose about the drawing, not a filename with a capital letter.
    assert.ok(asset.alt.trim().length >= 80, `${asset.id} alt text describes the picture`);
  }

  const insets = placed.filter((block) => block.kind === "illustration" && block.layout === "inset");
  assert.ok(insets.length >= 5, `caricatures sit inside the text: ${insets.length}`);
  for (const block of insets) {
    assert.ok(block.caption.includes("не кадр"), `${block.id} says it is not a frame`);
  }
});

test("The moral account names the grey zones and the complicity of watching", () => {
  const morality = theTrumanShowArticle.sections.find(
    (section) => section.id === "truman-article-morality",
  );
  assert.ok(morality);
  const subheads = morality.blocks.filter((block) => block.kind === "subhead").map((block) => block.text);
  assert.deepEqual(subheads, ["Серые зоны", "Созерцание вместо помощи"]);

  const paragraphs = morality.blocks.filter((block) => block.kind === "paragraph");
  assert.ok(paragraphs.length >= 12, `the section grew: ${paragraphs.length} paragraphs`);

  const text = paragraphs.map((block) => (block.kind === "paragraph" ? block.text : "")).join(" ");
  // Named thinkers, so the argument is attributable rather than ventriloquised.
  for (const name of ["Бауман", "Бонхёффер", "Гавел", "Солженицын", "Милгрэм"]) {
    assert.ok(text.includes(name), `the section names ${name}`);
  }
  // And the two things the reader must not miss: feeling is not helping, and a
  // person is judged by acts without being reduced to them.
  assert.match(text, /сочувствие как способ не помогать|не переходит в действие|заменой/);
  assert.match(text, /оценивай поступок, не перечёркивая человека|не перечёркивая/);

  // The register behind it carries the actual documents, not paraphrases of them.
  const dossierHosts = theTrumanShowProductionDossier.sources.map((source) => new URL(source.url).host);
  for (const host of ["pmc.ncbi.nlm.nih.gov", "www.bps.org.uk", "history.hanover.edu"]) {
    assert.ok(dossierHosts.includes(host), `the dossier cites ${host}`);
  }
});

test("a breadcrumb names the film, never the edition's state", () => {
  // The trail is what a reader who lands from search uses to understand where
  // they are; "залоченное издание" is an editorial status, not a place in the
  // catalogue, and the schema markup on the same page already said "Шоу Трумана".
  const articleView = readFileSync("src/components/film-article/article-view.tsx", "utf8");
  const productionView = readFileSync("src/components/film-article/production-view.tsx", "utf8");
  for (const [name, source] of [
    ["article-view", articleView],
    ["production-view", productionView],
  ] as const) {
    assert.ok(
      !/kicker\.split/.test(source),
      `${name} must not build a crumb out of the kicker`,
    );
    assert.match(source, /filmTitle: string/, `${name} receives the film title explicitly`);
    assert.ok(
      source.includes("label: filmTitle, href: `/films/${filmSlug}`"),
      `${name} links the film crumb by title`,
    );
  }

  for (const page of ["src/app/films/[slug]/article/page.tsx", "src/app/films/[slug]/making/page.tsx"]) {
    const source = readFileSync(page, "utf8");
    assert.match(
      source,
      /filmTitle=\{filmPackage\.film\.title\}/,
      `${page} passes the film title from the package rather than prose`,
    );
  }
});

test("tilt never keeps a position the pointer no longer holds", () => {
  // Scrolling moves a card out from under a stationary pointer. Both surfaces
  // must recompute (or let go) instead of holding the pre-scroll angle, and the
  // work must stay inside a single animation frame.
  for (const file of ["src/components/tilt-surface.tsx", "src/components/living-frame.tsx"]) {
    const source = readFileSync(file, "utf8");
    assert.match(
      source,
      /addEventListener\("scroll", onViewportShift, \{ passive: true \}\)/,
      `${file} listens for scroll passively`,
    );
    assert.match(
      source,
      /addEventListener\("resize", onViewportShift, \{ passive: true \}\)/,
      `${file} listens for resize`,
    );
    assert.match(
      source,
      /removeEventListener\("scroll", onViewportShift\)/,
      `${file} removes the scroll listener on unmount`,
    );
    assert.match(
      source,
      /localX < 0 \|\| localY < 0 \|\| localX > bounds\.width \|\| localY > bounds\.height/,
      `${file} releases the effect when the pointer is outside the surface`,
    );
    assert.match(
      source,
      /requestAnimationFrame/,
      `${file} batches work into an animation frame`,
    );
  }
});

test("the page survives paper, anchors and the sticky header", () => {
  // Three failures that only a browser shows, and that are cheap to keep out:
  // a print render with no scroll timeline, a jump link that lands under the
  // header, and a grid that clips instead of wrapping.
  const optics = readStylesheet("src/styles/homepage-optics.css");
  assert.match(
    optics,
    /@media print \{[\s\S]*?\.sectionRule[\s\S]*?animation: none/,
    "print must turn the scroll-reveal off: a view() timeline never advances on paper",
  );

  const globals = readStylesheet("src/app/globals.css");
  assert.match(
    globals,
    /main :is\(\[id\]\)[\s\S]{0,80}scroll-margin-block-start/,
    "anchored targets need a scroll margin equal to the sticky header",
  );

  const header = readFileSync("src/components/site-header.tsx", "utf8");
  const label = /className="brand"[^>]*aria-label="([^"]+)"/.exec(header)?.[1] ?? "";
  const visible = /className="brandText">([^<]+)</.exec(header)?.[1]?.trim() ?? "";
  assert.ok(visible.length > 0, "the brand has visible text");
  assert.ok(
    label.includes(visible),
    `the brand's accessible name («${label}») must contain its visible text («${visible}»): WCAG 2.5.3`,
  );
  assert.match(
    header,
    /className="brandMark" aria-hidden="true" \/>/,
    "the monogram must be drawn by CSS, not typed into the link's name",
  );

  // A bare `1fr` track grows to its widest child's min-content; the shell clips
  // the result instead of scrolling, so the text simply disappears.
  for (const file of ["src/styles/homepage.css", "src/styles/film-modules.css"]) {
    const css = readStylesheet(file);
    const bad = css
      .split("\n")
      .map((line, index) => ({ line: line.trim(), index }))
      .filter(({ line }) => /^\.(discoverySection|filmMethodMeta|filmSourceList li|permissionField)\b/.test(line))
      .flatMap(({ index }) => {
        const block = css.split("\n").slice(index, index + 8).join("\n");
        return /grid-template-columns: 1fr;/.test(block) ? [`${file}:${index + 1}`] : [];
      });
    assert.deepEqual(bad, [], `${file}: these grids need minmax(0, 1fr), not 1fr`);
  }
});

test("the homepage is complete without scripting", () => {
  // A root `loading.tsx` makes every route stream, including the statically
  // prerendered homepage: its HTML then carries a skeleton instead of content,
  // so a reader without JavaScript gets "Готовим следующий кадр…" and nothing
  // else. Loading states belong to the segments that really stream.
  assert.equal(
    existsSync("src/app/loading.tsx"),
    false,
    "a root loading.tsx turns the static homepage into a streamed skeleton",
  );
  for (const file of ["src/app/films/loading.tsx", "src/app/films/[slug]/loading.tsx"]) {
    assert.equal(existsSync(file), false, `${file} would strand direct readers in a streamed fallback`);
  }
  assert.match(readFileSync("src/components/film-transition-link.tsx", "utf8"), /useLinkStatus/, "slow client navigation still has a pending state");

  // And the entrance choreography starts from opacity 0, so without scripting
  // the hero has to be released explicitly.
  const layout = readFileSync("src/app/layout.tsx", "utf8");
  assert.match(layout, /<noscript>/, "the layout declares a no-script fallback");
  assert.match(
    layout,
    /\.heroEnter \.heroCopy > \*,[\s\S]{0,160}animation: none !important/,
    "the no-script fallback releases the hero entrance",
  );
});

test("film index distinguishes an existing article from secondary-source research", () => {
  assert.ok(theTrumanShowCanonicalPackage.article);
  assert.equal(filmIndexStatusLabel(theTrumanShowCanonicalPackage), "опубликовано");
  const research = theFastAndTheFuriousDraftPackage;
  assert.equal(research.article, undefined);
  assert.equal(research.research?.state, "SECONDARY_SOURCES");
  assert.equal(research.ingest?.edition?.state, "TARGET_ONLY");
  assert.match(filmIndexStatusLabel(research), /исследовательский черновик · статьи нет/);
  assert.notEqual(research.film.status, "published");
});

test("article tables share an escaped caption with their native table and keyboard viewport", () => {
  for (const corrections of [false, true]) {
    const html = renderToStaticMarkup(createElement(ArticleTable, {
      blockId: corrections ? "corrections" : "measurements",
      caption: "Long caption <script> & evidence",
      corrections,
    }, createElement("tbody", null, createElement("tr", null,
        createElement("th", { scope: "row" }, "Evidence"),
        createElement("td", null, "123"),
      ))));
    const captionId = `article-table-${corrections ? "corrections" : "measurements"}-caption`;
    assert.ok(html.includes(`<figcaption id="${captionId}">Long caption &lt;script&gt; &amp; evidence</figcaption>`));
    assert.ok(html.includes(`role="region" aria-labelledby="${captionId}" tabindex="0"`));
    assert.ok(html.includes(`<table class="articleTable" aria-labelledby="${captionId}">`));
    assert.equal((html.match(/<figcaption/g) ?? []).length, 1);
    assert.ok(html.includes('<th scope="row">Evidence</th>'));
    assert.equal(html.includes("articleCorrections"), corrections);
    assert.ok(!html.includes("<script>"));
  }
});


test("browser failures retain measured details in escaped workflow annotations", () => {
  const { failureMessage, workflowError } = createRequire(`${process.cwd()}/package.json`)(
    "./scripts/lib/audit-report.mjs",
  ) as {
    failureMessage: (check: { name: string; details?: unknown }) => string;
    workflowError: (message: string) => string;
  };
  const message = failureMessage({ name: "table focus", details: { focused: false, width: 390 } });
  assert.equal(message, 'table focus\n{"focused":false,"width":390}');
  assert.equal(failureMessage({ name: "missing table" }), "missing table");
  assert.equal(workflowError("100%\r\n::error::injected"),
    "::error title=Browser audit::100%25%0D%0A::error::injected");
  assert.ok(!workflowError(message).includes("\n"));
  assert.ok(workflowError(message).includes('"focused":false'));
});

test("scene quotations disclose grid or clip provenance rather than claiming exact master PTS", () => {
  const article = structuredClone(theTrumanShowArticle);
  const items = article.sections.flatMap(section => section.blocks.flatMap(block =>
    block.kind === "timeline" ? block.items.filter(item => item.still) : []));
  assert.deepEqual(items.map((item) => item.evidenceId).sort(), [
    "truman-ev-exit", "truman-ev-knife", "truman-ev-knife-tools", "truman-ev-light",
    "truman-ev-marlon-retake", "truman-ev-meryl-held", "truman-ev-radio", "truman-ev-rain", "truman-ev-reunion",
  ].sort(), "each selected frame should illustrate a distinct evidence anchor");
  assert.equal(items.filter((item) => item.still?.samplingKind === "grid").length, 6);
  const clips = items.filter((item) => item.still?.samplingKind === "clip");
  assert.equal(clips.length, 3);
  assert.deepEqual(clips.map((item) => {
    assert.ok(item.still?.samplingKind === "clip");
    return [item.evidenceId, item.still.clip.file, item.still.clip.sha256, item.still.clip.sourceStartSeconds, item.still.clip.offsetSeconds];
  }), [
    ["truman-ev-knife-tools", "04-meryl-kitchen.mp4", "f4adfa6e7ffabeccab4f8d98633f8ed9b5b6715c062f286a8ca457dcc3738b4f", 3205, 60],
    ["truman-ev-meryl-held", "04-meryl-kitchen.mp4", "f4adfa6e7ffabeccab4f8d98633f8ed9b5b6715c062f286a8ca457dcc3738b4f", 3205, 70],
    ["truman-ev-reunion", "07-father-reunion.mp4", "5d4d696d6240124b86e287be108aab70bb2938caf064d742af4b8e8abb4dab18", 3585, 6],
  ]);
  assert.deepEqual(validateFilmArticle(article, trumanArticleContext()), []);
  const { createHash } = createRequire(`${process.cwd()}/package.json`)("node:crypto");
  for (const item of items) {
    const still = item.still!;
    // The bytes live outside `public` on purpose: a still in `public` is a public
    // URL, reachable even when the draft route is closed. The app serves them
    // through `src/app/film-stills/[file]/route.ts`, behind the preview gate.
    assert.equal(createHash("sha256").update(readFileSync(`assets${still.src}`)).digest("hex"), still.imageSha256);
    assert.equal(createHash("sha256").update(readFileSync(`assets${still.avifSrc}`)).digest("hex"), still.avifSha256);
    assert.equal(existsSync(`public${still.src}`), false, `${still.src}: a still must not be a public file`);
    assert.ok(Math.abs(still.sampleTimeSeconds - item.timestampSeconds) <= 15);
    assert.match(still.caption, /\S/);
    assert.equal(still.use, "critical-review");
    if (still.samplingKind === "clip") {
      assert.match(still.clip.sha256, /^[a-f0-9]{64}$/);
      assert.equal(still.sampleTimeSeconds, still.clip.sourceStartSeconds + still.clip.offsetSeconds);
    }
  }
  for (const [override, expected] of [
    [{ masterDigest: "sha256:" + "0".repeat(64) }, /locked edition/],
    [{ sourceId: "other-edition" }, /locked edition/],
    [{ sampleTimeSeconds: -1 }, /cited scene/],
    [{ sampleTimeSeconds: items[0].timestampSeconds + 120 }, /cited scene/],
    [{ src: "/film-stills/../private.jpg" }, /local JPEG/],
    [{ imageSha256: "invalid" }, /SHA-256/],
    [{ avifSrc: "/other.avif" }, /local JPEG/],
    [{ avifSha256: "invalid" }, /SHA-256/],
    [{ width: 1920 }, /bounded dimensions/],
    [{ samplingIntervalSeconds: 0 }, /sampling/],
    [{ sampleTimeSeconds: 211 }, /sampling/],
    [{ samplingKind: "unknown" }, /sampling kind/],
    [{ credit: "" }, /credit/],
    [{ caption: "" }, /caption/],
    [{ alt: "" }, /alt/],
    [{ use: "decoration" }, /critical-review/],
  ] as const) {
    const copy = structuredClone(article);
    const first = copy.sections.flatMap(section => section.blocks.flatMap(block =>
      block.kind === "timeline" ? block.items.filter(item => item.still) : []))[0];
    Object.assign(first.still!, override);
    assert.match(validateFilmArticle(copy, trumanArticleContext()).join("\n"), expected);
  }

  for (const override of [
    { file: "../private.mp4" }, { sha256: "invalid" }, { sourceStartSeconds: -1 },
    { sourceEndSeconds: 3205 }, { offsetSeconds: -1 }, { offsetSeconds: 125 },
    { offsetSeconds: 61 },
  ]) {
    const copy = structuredClone(article);
    const clipItem = copy.sections.flatMap(section => section.blocks.flatMap(block =>
      block.kind === "timeline" ? block.items : [])).find((item) => item.evidenceId === "truman-ev-knife-tools");
    assert.ok(clipItem?.still?.samplingKind === "clip");
    Object.assign(clipItem.still.clip, override);
    assert.match(validateFilmArticle(copy, trumanArticleContext()).join("\n"), /clip still needs/);
  }
});

test("Film 001 comparison panels refuse a verdict, an unsupported side and a clock reading", () => {
  // The duel block exists so that a comparison cannot become a scoreboard. These
  // three mutations are the ones that would turn it back into one.
  const base = structuredClone(theTrumanShowArticle);
  assert.deepEqual(validateFilmArticle(base, trumanArticleContext()), []);

  const duels = base.sections.flatMap((section) => section.blocks).filter((block) => block.kind === "duel");
  assert.equal(duels.length, 3, "the article carries three comparison panels");

  const noOpen = structuredClone(theTrumanShowArticle);
  const openless = noOpen.sections
    .flatMap((section) => section.blocks)
    .find((block) => block.kind === "duel");
  assert.ok(openless && openless.kind === "duel");
  openless.open = "   ";
  assert.match(
    validateFilmArticle(noOpen, trumanArticleContext()).join("\n"),
    /must state what the film leaves open/,
  );

  const unsupported = structuredClone(theTrumanShowArticle);
  const unsupportedDuel = unsupported.sections
    .flatMap((section) => section.blocks)
    .find((block) => block.kind === "duel");
  assert.ok(unsupportedDuel && unsupportedDuel.kind === "duel");
  unsupportedDuel.sides[0]!.evidenceIds = ["truman-ev-not-a-record"];
  assert.match(
    validateFilmArticle(unsupported, trumanArticleContext()).join("\n"),
    /unknown evidence id "truman-ev-not-a-record"/,
  );

  const oneSided = structuredClone(theTrumanShowArticle);
  const oneSidedDuel = oneSided.sections
    .flatMap((section) => section.blocks)
    .find((block) => block.kind === "duel");
  assert.ok(oneSidedDuel && oneSidedDuel.kind === "duel");
  oneSidedDuel.sides = [oneSidedDuel.sides[0]!];
  assert.match(
    validateFilmArticle(oneSided, trumanArticleContext()).join("\n"),
    /a duel needs at least two sides/,
  );
});

test("Film 001 every evidence anchor on the film page resolves", () => {
  // Character cards and the map itself link to `#evidence-<id>`. Only the records a
  // claim happened to cite got a card, so 39 of 47 anchors landed on nothing. The
  // register now gives every record an anchor, and this test holds that line.
  const filmPackage = theTrumanShowCanonicalPackage;
  const sourcesModule = filmPackage.modules.find((module) => module.kind === "sources-method");
  const html = renderToStaticMarkup(
    createElement(FilmEvidenceMap, {
      evidence: filmPackage.evidence ?? [],
      modules: filmPackage.modules,
      researchDraft: false,
      scenes: filmPackage.scenes ?? [],
      sources: sourcesModule?.kind === "sources-method" ? sourcesModule.sources : [],
      spoilerLevel: "FULL",
    }),
  );

  const idList = [...html.matchAll(/id="evidence-([a-z0-9-]+)"/g)].map((match) => match[1]!);
  const ids = new Set(idList);
  const toolsRow = /<tr[^>]*id="evidence-truman-ev-knife-tools"[^>]*>[\s\S]*?<\/tr>/.exec(html)?.[0] ?? "";
  assert.match(toolsRow, /<details class="evidenceRegisterBasis">/);
  assert.match(toolsRow, /кадры предоставленного фрагмента/);
  assert.match(toolsRow, /манифеста/, "the article's link must lead to the full review basis");
  // The anchors come from the character cards and the claim cards, which link to
  // `#evidence-<id>`. Rendering the module list here would pull the WebGL verdict
  // component into a CommonJS test build, so the same guarantee is checked against
  // the data the cards are built from: every id any module cites is a record.
  const cited = new Set(
    [...JSON.stringify(filmPackage.modules).matchAll(/"(truman-ev-[a-z0-9-]+)"/g)].map(
      (match) => match[1]!,
    ),
  );
  assert.ok(cited.size > 0, "modules must cite evidence");
  assert.deepEqual(
    [...cited].filter((id) => !ids.has(id)),
    [],
    "every cited evidence id must render an anchor target",
  );

  const noneHtml = renderToStaticMarkup(
    createElement(FilmEvidenceMap, {
      evidence: filmPackage.evidence ?? [],
      modules: filmPackage.modules,
      researchDraft: false,
      scenes: filmPackage.scenes ?? [],
      sources: sourcesModule?.kind === "sources-method" ? sourcesModule.sources : [],
      spoilerLevel: "NONE",
    }),
  );
  const noneIds = new Set(
    [...noneHtml.matchAll(/id="evidence-([a-z0-9-]+)"/g)].map((match) => match[1]!),
  );
  const endingRecords = (filmPackage.evidence ?? []).filter(
    (record) => record.spoilerLevel === "ENDING" || record.spoilerLevel === "FULL",
  );
  assert.ok(endingRecords.length > 0);
  for (const record of endingRecords) {
    assert.ok(!noneIds.has(record.id), `${record.id}: a level-NONE reader must not see this record`);
  }
});

test("a level-NONE reader is not told how the film ends", () => {
  // The first section is marked NONE, but one of its paragraphs described the set the
  // hero reaches only at the end, and a NONE evidence record spelled out the same
  // thing in its observation. A level is a promise about the text, not a label.
  const none = projectArticleSections(theTrumanShowArticle, "NONE");
  const text = JSON.stringify(none);
  for (const token of ["декораци", "нарисованн", "увидит только в", "Край неба", "EXIT"]) {
    assert.ok(!text.includes(token), `NONE projection leaked: ${token}`);
  }

  for (const record of theTrumanShowCanonicalPackage.evidence ?? []) {
    if (record.spoilerLevel !== "NONE") continue;
    assert.ok(
      !/декораци|нарисованн|шторм|дверь EXIT/i.test(record.observation ?? ""),
      `${record.id}: a NONE record may not describe the ending`,
    );
  }
});

test("Film 001 spoilers=NONE renders no scene from the last act", () => {
  const filmPackage = theTrumanShowCanonicalPackage;
  const render = (spoilerLevel: "NONE" | "FULL") =>
    renderToStaticMarkup(
      createElement(FilmSceneTable, {
        evidence: filmPackage.evidence ?? [],
        researchDraft: false,
        scenes: filmPackage.scenes ?? [],
        spoilerLevel,
      }),
    );

  // «Край неба и дверь» is the last scene of the film. It was in the table for every
  // reader, because the table was handed every scene and filtered none.
  const noneHtml = render("NONE");
  const fullHtml = render("FULL");
  assert.ok(fullHtml.includes("Край неба"), "the full level must show the ending scene");
  assert.ok(!noneHtml.includes("Край неба"), "level NONE must not show the ending scene");
  assert.match(noneHtml, /скрыто до выбранного уровня спойлеров/);
});

test("scene navigation counts only visible evidence and always reaches a register", () => {
  const film = theTrumanShowCanonicalPackage;
  const safe = film.evidence?.find((record) => record.id === "truman-ev-light");
  assert.ok(safe?.sceneId);
  const scene = film.scenes?.find((item) => item.id === safe.sceneId);
  assert.ok(scene && scene.spoilerLevel === "NONE");
  const hidden = { ...safe, id: "test-hidden-evidence", label: "HIDDEN EVIDENCE SENTINEL", spoilerLevel: "FULL" as const };
  const evidence = [safe, hidden];
  const table = renderToStaticMarkup(createElement(FilmSceneTable, {
    evidence, scenes: [scene], researchDraft: false, spoilerLevel: "NONE",
  }));
  assert.match(table, new RegExp(`id="scene-${scene.id}"`));
  assert.match(table, /Опоры сцены[^>]*: 1/);
  assert.match(table, new RegExp(`href="#evidence-${safe.id}"`));
  assert.doesNotMatch(table, /HIDDEN EVIDENCE SENTINEL|test-hidden-evidence/);

  // A package can have records but no module claims. The scene link must still
  // land on the one canonical register row, and that row links back to the scene.
  const register = renderToStaticMarkup(createElement(FilmEvidenceMap, {
    modules: [], evidence, scenes: [scene], sources: [], researchDraft: false, spoilerLevel: "NONE",
  }));
  assert.match(register, new RegExp(`id="evidence-${safe.id}"`));
  assert.match(register, new RegExp(`href="#scene-${scene.id}"`));
  assert.doesNotMatch(register, /HIDDEN EVIDENCE SENTINEL|test-hidden-evidence/);
  assert.equal((register.match(new RegExp(`id="evidence-${safe.id}"`, "g")) ?? []).length, 1);
});

test("Homepage projection keeps the spoiler budget instead of filling the page", () => {
  // The homepage projects at NONE. The published film's relationship, permission,
  // meaning and craft modules carry higher levels, so their panels are absent —
  // the projection returns null/empty rather than a module that would spoil the
  // film, and the page renders what is left without inventing a placeholder.
  const projection = projectHomepage(theTrumanShowCanonicalPackage);
  assert.equal(projection.relationship, null);
  assert.deepEqual(projection.permissions, []);
  assert.deepEqual(projection.craft, []);
  assert.ok(projection.storyBeats.length > 0, "the safe tier still carries the story");
  assert.ok(projection.characters.length > 0, "and the people");
  for (const beat of projection.storyBeats) {
    assert.equal(beat.spoilerSafe, true, `${beat.label}: homepage beats must be spoiler-safe`);
  }
});

test("Film 001 is published, and the stills carry their provenance", () => {
  // The editorial switch and the edition's publication are separate. The stills
  // carry an edition reference, image digests, approximate times and captions;
  // the supplied material does not independently prove the master association.
  // A page that cannot serve frames drops the picture and keeps the anchor.
  assert.equal(theTrumanShowCanonicalPackage.film.status, "published");
  assert.equal(publishedFilmStillsEnabled, true);

  for (const still of Object.values(trumanArticleStills)) {
    assert.match(still.credit, /Шоу Трумана.*1998.*Питер Уир/, "a still must identify the film and director");
    assert.equal(still.use, "critical-review");
    assert.ok(still.sampleTimeSeconds > 0);
    assert.match(still.imageSha256, /^[a-f0-9]{64}$/);
    assert.match(still.alt, /\S/);
  }

  const withFrames = projectArticleSections(theTrumanShowCanonicalPackage.article!, "FULL", { stills: true });
  const withoutFrames = projectArticleSections(theTrumanShowCanonicalPackage.article!, "FULL", { stills: false });

  const stillsOf = (projection: ReturnType<typeof projectArticleSections>) =>
    projection.visibleSections.flatMap((section) =>
      section.blocks.flatMap((block) => (block.kind === "timeline" ? block.items.filter((item) => item.still) : [])),
    );

  assert.equal(stillsOf(withFrames).length, 9);
  assert.equal(stillsOf(withoutFrames).length, 0, "a page with stills disabled must not cite a frame");
  for (const [level, expected] of [
    ["NONE", ["truman-ev-light"]],
    ["MINOR", ["truman-ev-light", "truman-ev-rain", "truman-ev-radio"]],
    ["MAJOR", ["truman-ev-light", "truman-ev-rain", "truman-ev-radio", "truman-ev-marlon-retake", "truman-ev-knife-tools", "truman-ev-meryl-held", "truman-ev-reunion"]],
  ] as const) {
    const projected = projectArticleSections(theTrumanShowCanonicalPackage.article!, level, { stills: true });
    assert.deepEqual(stillsOf(projected).map((item) => item.evidenceId).sort(), [...expected].sort(), `${level}: no higher-spoiler frame may leak`);
  }

  // Dropping the picture must not drop the anchor: the reader still gets the second.
  const anchorsOf = (projection: ReturnType<typeof projectArticleSections>) =>
    projection.visibleSections.flatMap((section) =>
      section.blocks.flatMap((block) => (block.kind === "timeline" ? block.items.map((item) => item.id) : [])),
    );
  assert.deepEqual(anchorsOf(withoutFrames), anchorsOf(withFrames));
});

test("Homepage never presents a generated illustration as a film frame", () => {
  // docs/54 §7: the cover is an illustration and is labelled as one. The page used
  // to print «Кадр фильма» over it and a «Кадр · 0001» meta chip — the one caption
  // this site cannot afford, because it is the same error the article spends a
  // section correcting.
  for (const file of ["src/app/page.tsx", "src/components/film-media-frame.tsx"]) {
    const source = readFileSync(file, "utf8");
    assert.ok(!source.includes("Кадр фильма"), `${file}: the cover must not be called a frame of the film`);
    assert.ok(!source.includes('metaLeft="Кадр'), `${file}: no art chip may claim a frame number`);
    assert.ok(!source.includes("Живой кадр"), `${file}: generated art is not a live frame`);
    assert.ok(source.includes("не кадр фильма"), `${file}: the cover must state that it is a drawing`);
  }
});

test("Film 001 every evidence card states the basis of its own verification", () => {
  // «Verified» is not a description. Each record must carry how it was checked,
  // what material was in front of the reviewer, and how wide the window was —
  // derived from the ledger, never typed next to the claim.
  const ledgerStatus = new Map(
    [...trumanVisualVerifications, ...trumanPostLockEvidenceVerifications].map((record) => [
      record.evidenceId,
      record.status,
    ]),
  );
  const expectedMaterial = {
    VISUAL_CONFIRMED: "frames",
    CONTRADICTED: "frames",
    TRANSCRIPT_CONFIRMED: "subtitle-track",
    PENDING_LOCAL_REVIEW: "frames",
  } as const;

  for (const record of theTrumanShowCanonicalPackage.evidence ?? []) {
    assert.ok(record.basis, `${record.id}: no review basis`);
    assert.ok(record.basis.observations > 0, `${record.id}: basis with no observations`);
    assert.deepEqual(
      record.basis.unrecorded,
      ["reviewer", "date"],
      `${record.id}: the ledger records neither reviewer nor date; say so`,
    );

    if (record.basis.window && record.timestampSeconds !== undefined) {
      assert.ok(
        record.timestampSeconds >= record.basis.window.from &&
          record.timestampSeconds <= record.basis.window.to,
        `${record.id}: the cited second is outside the reviewed window`,
      );
    } else {
      assert.ok(
        record.basis.inheritedFrom,
        `${record.id}: only a half of a split record may lack its own window`,
      );
    }

    const status = ledgerStatus.get(record.id);
    if (status) {
      if (record.basis.material === "clip-frames") {
        assert.ok(["truman-ev-knife", "truman-ev-reunion"].includes(record.id), `${record.id}: only a documented new clip check may supersede the ledger`);
        assert.equal(record.basis.windowApproximate, true);
        assert.match(record.basis.note ?? "", /предоставленного фрагмента/);
      } else {
        assert.equal(record.basis.material, expectedMaterial[status], `${record.id}: material drifted`);
      }
      assert.equal(record.basis.outcome === "refused", status !== "VISUAL_CONFIRMED" && status !== "TRANSCRIPT_CONFIRMED",
        `${record.id}: a record the ledger refused cannot read as seen`);
    }
  }

  // The rain rewrite is the one record with no research-era entry to inherit a
  // basis from, so its basis is stated in the record: two frames, 12:41 and 13:06.
  // The boat split was undeclared until this pass: the parent's check covers
  // 4830–4850 s, the sailing record cites 4970 s, so the card must not claim a
  // window — it says the second itself was never checked.
  const sail = theTrumanShowCanonicalPackage.evidence?.find((record) => record.id === "truman-ev-setting-sail");
  assert.ok(sail?.basis);
  assert.equal(sail.basis.inheritedFrom, "truman-ev-boat");
  assert.equal(sail.basis.window, undefined);
  assert.equal(sail.basis.outcome, "pending");

  // A tally over linked records, not over links: the map renders one card per
  // claim–record link, and counting those is how «47 опор» comes to read as
  // 47 separate truths.
  const tally = tallyReviewBasis(theTrumanShowCanonicalPackage.evidence ?? []);
  const records = theTrumanShowCanonicalPackage.evidence ?? [];
  assert.equal(tally.records, records.length);
  assert.equal(
    tally.seen + tally.subtitle + tally.refused + tally.pending + tally.unrecorded,
    tally.records,
    "every record lands in exactly one bucket",
  );
  assert.equal(
    tally.unrecorded,
    records.filter((record) => !record.basis).length,
    "a record with no ledger entry must be counted as unrecorded, not as checked",
  );
  // The edition keeps a record its own review refused; a tally that cannot show
  // that is not a tally. The rain record is a rewrite, so the refusal is carried
  // on the replacement rather than dropped with the retired record.
  assert.ok(
    tally.refused + tally.rewritten >= 1,
    "a refused check must be visible either as a refused record or as a carried ancestor",
  );

  const rain = theTrumanShowCanonicalPackage.evidence?.find((record) => record.id === "truman-ev-rain");
  assert.equal(rain?.basis?.refusedAncestor, "truman-ev-raincloud");
  assert.equal(tally.rewritten, 1);
  assert.ok(rain?.basis);
  assert.deepEqual(rain.basis.window, { from: 761, to: 786 });
  assert.equal(rain.basis.observations, 2);
  assert.equal(rain.basis.outcome, "seen");
});

test("review basis never upgrades a record the ledger did not confirm", () => {
  const frame = (frameTimeSeconds: number) => ({ frameTimeSeconds });

  assert.equal(reviewBasis(undefined), undefined);
  assert.equal(reviewBasis({ status: "VISUAL_CONFIRMED", frames: [] }), undefined);

  const pending = reviewBasis({ status: "PENDING_LOCAL_REVIEW", frames: [frame(10), frame(40)] });
  assert.ok(pending);
  // «Not checked yet» and «checked and did not hold» are different answers.
  assert.equal(pending.outcome, "pending");
  assert.match(evidenceBasisOutcomeLabels[pending.outcome], /не записана/);
  assert.deepEqual(pending.window, { from: 10, to: 40 });

  const transcript = reviewBasis({ status: "TRANSCRIPT_CONFIRMED", frames: [frame(3459.2), frame(3464.3)] });
  assert.ok(transcript);
  assert.equal(transcript.material, "subtitle-track");
  assert.equal(transcript.outcome, "subtitle");
  assert.equal(transcript.observations, 2);
});

test("the phone timeline keeps its basis, stills and captions in the one column", () => {
  const css = readStylesheet("src/styles/article/body.css");

  // Pinned to column 2 inside a one-column grid the basis created an implicit
  // track: the explicit 1fr track kept a character, so at 390px the timecode
  // stacked five lines high and every still rendered as a sliver.
  const pinned = css.indexOf(".articleTimelineBasis {\n  grid-column: 2;");
  const phone = css.lastIndexOf("  .articleTimelineBasis {\n    grid-column: 1 / -1;");
  assert.ok(pinned >= 0, "the split layout pins the basis to the evidence column");
  assert.ok(phone > pinned, "the phone override follows the pinned rule, so it wins on equal specificity");
  const phoneBlock = css.lastIndexOf("@media (max-width: 45em)", phone);
  assert.ok(phoneBlock >= 0 && !css.slice(phoneBlock, phone).includes("}"), "the override sits inside the phone block");
});


test("comparison is source-bound, symmetric, static without scripts and server-projected", () => {
  const film = theTrumanShowCanonicalPackage;
  const comparison = film.comparison;
  assert.ok(comparison);
  for (const level of ["NONE", "MINOR", "MAJOR"] as const) assert.equal(projectFilmComparison(comparison, level), null);
  for (const level of ["ENDING", "FULL"] as const) assert.equal(projectFilmComparison(comparison, level), comparison);
  for (const side of comparison.sides) {
    assert.deepEqual(Object.keys(side.cells), [...COMPARISON_DIMENSIONS]);
    for (const cell of Object.values(side.cells)) {
      assert.ok(cell.text.length > 50);
      assert.ok(side.kind === "FICTIONAL" ? cell.evidenceIds?.length : cell.sourceIds?.length);
    }
  }
  const markup = renderToStaticMarkup(createElement(FilmComparisonView, { comparison, evidence: film.evidence ?? [] }));
  assert.match(markup, /Труман Бёрбанк/);
  assert.match(markup, /Вацлав Гавел/);
  assert.match(markup, /Выбор сторон доступен после загрузки скриптов/);
  assert.match(markup, /Сила бессильных/);
  assert.equal((markup.match(/scope="row"/g) ?? []).length, 7);
  assert.match(markup, /id="truman-comparison"/);

  const broken = structuredClone(film);
  assert.ok(broken.comparison);
  broken.comparison.sides[0].cells.decision.evidenceIds = ["not-evidence"];
  broken.comparison.sides[1].cells.counterpoint.sourceIds = ["not-source"];
  const errors = validateFilmPackage(broken).join("\n");
  assert.match(errors, /unknown evidence "not-evidence"/);
  assert.match(errors, /unknown historical source "not-source"/);
});

test("article context sources resolve separately from film evidence", () => {
  const article = structuredClone(theTrumanShowArticle);
  const blocks = article.sections.flatMap((section) => section.blocks).filter((block) => block.kind === "paragraph" && block.contextSourceIds?.length);
  assert.ok(blocks.length >= 3);
  for (const block of blocks) {
    assert.ok(block.kind === "paragraph" && block.support?.evidenceIds?.length);
    assert.ok(block.contextSourceIds?.every((id) => theTrumanShowProductionDossier.sources.some((source) => source.id === id)));
  }
  const block = blocks[0];
  assert.ok(block.kind === "paragraph");
  block.contextSourceIds = ["missing-context-source", "missing-context-source"];
  const errors = validateFilmArticle(article, trumanArticleContext()).join("\n");
  assert.match(errors, /unknown context source id "missing-context-source"/);
  assert.match(errors, /duplicate context source id "missing-context-source"/);
});

test("character art and counter-readings remain registered and spoiler-scoped", () => {
  const source = theTrumanShowCanonicalPackage.modules.find((module) => module.kind === "characters");
  assert.ok(source && source.kind === "characters");
  assert.ok(source.characters.every((character) => character.counterpoint));
  for (const character of source.characters.filter((item) => item.visual)) {
    const visual = character.visual;
    assert.ok(visual);
    const asset = illustrationFacts(visual.assetId);
    assert.equal(asset?.sourceKind, "generated");
    assert.equal(asset?.role, "illustration");
    assert.match(visual.caption, /не кадр/i);
  }
  const none = projectFilmModule(source, "NONE");
  assert.ok(none && none.kind === "characters");
  assert.equal(none.characters.find((character) => character.id === "truman-ch-truman")?.counterpoint, undefined);
  assert.equal(none.characters.some((character) => character.id === "truman-ch-christof"), false);
  const major = projectFilmModule(source, "MAJOR");
  assert.ok(major && major.kind === "characters");
  assert.ok(major.characters.find((character) => character.id === "truman-ch-christof")?.visual);
  assert.ok(!JSON.stringify(source.characters).includes("вторым дублем"));
});

test("dossier deal and pending reunion do not overclaim the available records", () => {
  const dossier = theTrumanShowProductionDossier;
  assert.match(dossier.standfirst, /сделку.*включала условие о режиссуре/i);
  assert.doesNotMatch(dossier.seoDescription ?? "", /сценарий купили за миллион/i);
  const relationships = theTrumanShowCanonicalPackage.modules.filter((module) => module.kind === "relationship");
  const reunion = relationships.flatMap((module) => module.events).find((event) => event.id === "truman-friend-reunion");
  assert.ok(reunion);
  assert.match(reunion.change, /ещё нужно проверить/i);
  assert.match(reunion.dimensions?.[0].after ?? "", /остаётся на проверке/i);
});

test("scene clip findings distinguish sampled evidence from the original master", () => {
  const records = theTrumanShowCanonicalPackage.evidence ?? [];
  const find = (id: string) => {
    const record = records.find((item) => item.id === id);
    assert.ok(record, `${id} is required`);
    return record;
  };
  const packageFrame = find("truman-ev-knife");
  const tools = find("truman-ev-knife-tools");
  const holding = find("truman-ev-meryl-held");
  const reunion = find("truman-ev-reunion");
  assert.match(packageFrame.observation, /этот кадр.*не показывает/i);
  assert.match(tools.observation, /инструменты перед собой/i);
  assert.match(holding.observation, /удерживает Мэрил/i);
  assert.match(reunion.observation, /ограждения моста/i);
  assert.doesNotMatch(reunion.observation, /в дверях дома/i);
  for (const record of [packageFrame, tools, holding, reunion]) {
    assert.equal(record.basis?.material, "clip-frames");
    assert.equal(record.basis?.outcome, "seen");
    assert.equal(record.basis?.windowApproximate, true);
    assert.match(record.basis?.note ?? "", /манифест/);
  }
  const html = renderToStaticMarkup(createElement(EvidenceBasisLine, { basis: reunion.basis }));
  assert.match(html, /кадры предоставленного фрагмента/);
  assert.match(html, /наблюдения ≈/);
  assert.match(html, /исходный мастер независимо не пересчитан/);
  assert.match(html, /звук не проверен/);

  const blocks = theTrumanShowArticle.sections.flatMap((section) => section.blocks);
  const block = (id: string) => {
    const item = blocks.find((candidate) => candidate.id === id);
    assert.ok(item, `${id} is required`);
    return item;
  };
  const longest = block("truman-article-craft-hold-father");
  assert.ok(longest.kind === "measurement");
  assert.match(longest.text, /детектор действительно пропустил смены/i);
  const library = block("truman-article-craft-hold-library");
  assert.ok(library.kind === "measurement");
  assert.match(library.text, /не описание каждого момента/i);
  const verdict = block("truman-article-verdict-craft");
  assert.ok(verdict.kind === "paragraph");
  assert.match(verdict.text, /у моста.*аппаратной.*зрителями/i);
  const timeline = block("truman-article-bonds-anchors");
  assert.ok(timeline.kind === "timeline");
  assert.ok(timeline.items.find((item) => item.evidenceId === tools.id && /приблизительна/.test(item.label)));
  assert.ok(timeline.items.find((item) => item.evidenceId === holding.id && /приблизительна/.test(item.label)));
  assert.equal(timeline.items.find((item) => item.still === trumanArticleStills.merylTools)?.evidenceId, tools.id);
  assert.equal(timeline.items.find((item) => item.still === trumanArticleStills.merylHeld)?.evidenceId, holding.id);
  assert.equal(timeline.items.find((item) => item.still === trumanArticleStills.reunion)?.evidenceId, reunion.id);
  const props = block("truman-article-props-anchors");
  assert.ok(props.kind === "timeline");
  assert.equal(props.items.find((item) => item.still === trumanArticleStills.kitchen)?.evidenceId, packageFrame.id,
    "the packaging still cannot illustrate the later tools-in-hand moment");
});

test("light, subtitles and friendship keep observations separate from interpretation", () => {
  const records = theTrumanShowCanonicalPackage.evidence ?? [];
  const byId = (id: string) => {
    const record = records.find((item) => item.id === id);
    assert.ok(record, `${id} is required`);
    return record;
  };
  const light = byId("truman-ev-light");
  assert.match(light.observation, /крупном плане.*Sirius.*закрыто/i);
  assert.equal(light.basis?.material, "frames");
  assert.equal(light.basis?.windowApproximate, true);
  assert.match(trumanArticleStills.light.alt, /Sirius.*продолжение закрыто/i);
  assert.match(trumanArticleStills.light.caption, /Крупный план/);
  for (const id of ["truman-ev-light-explanation", "truman-ev-marlon", "truman-ev-marlon-retake"]) {
    assert.equal(byId(id).basis?.material, "subtitle-track");
    assert.equal(byId(id).basis?.outcome, "subtitle");
  }
  const friendship = theTrumanShowCanonicalPackage.modules.find((module) => module.id === "truman-mod-friendship");
  assert.ok(friendship && friendship.kind === "relationship");
  assert.match(friendship.summary, /не позволяют установить чувства/i);
  const autopsy = theTrumanShowCanonicalPackage.modules.find((module) => module.kind === "autopsy");
  assert.ok(autopsy && autopsy.kind === "autopsy");
  assert.match(autopsy.counterevidence ?? "", /фильм не доказывает/i);
  const blocks = theTrumanShowArticle.sections.flatMap((section) => section.blocks);
  for (const id of ["truman-article-machine-rain", "truman-article-rain-form", "truman-article-rain-meaning", "truman-article-rain-limits"]) {
    const block = blocks.find((item) => item.id === id);
    assert.ok(block && block.kind === "paragraph" && block.support?.evidenceIds.includes("truman-ev-rain"));
  }
  const camera = blocks.find((block) => block.id === "truman-article-camera-show");
  assert.ok(camera && camera.kind === "paragraph");
  assert.match(camera.text, /не устанавливает расположение конкретной камеры/);
  assert.ok(camera.support?.evidenceIds.includes("truman-ev-meryl-held"));
  const duel = blocks.find((block) => block.id === "truman-article-duel-promise");
  assert.ok(duel && duel.kind === "duel");
  assert.doesNotMatch(JSON.stringify(duel), /Что слышит Труман|между записями показана аппаратная/);
});

test("published methodology does not turn supplied metadata into a viewing or audio claim", () => {
  const sources = theTrumanShowCanonicalPackage.modules.find((module) => module.kind === "sources-method");
  assert.ok(sources && sources.kind === "sources-method");
  assert.match(sources.analyzedEdition, /фильм опубликован/i);
  assert.match(sources.analyzedEdition, /хеш повторно не пересчитан/i);
  assert.match(sources.analyzedEdition, /не означает, что её прослушали/i);
  assert.doesNotMatch(sources.analyzedEdition, /remains draft|scene-by-scene|Dialogue basis/i);
  const master = sources.sources.find((source) => source.kind === "film-edition");
  assert.match(master?.locator ?? "", /не прослушана/i);
  assert.equal(evidenceBasisMaterialLabels.frames, "отдельные кадры");
  assert.match(evidenceBasisOutcomeLabels.subtitle, /тексту субтитров/);

  const verdict = theTrumanShowCanonicalPackage.modules.find((module) => module.kind === "final-synthesis");
  assert.ok(verdict && verdict.kind === "final-synthesis");
  assert.ok(verdict.qualifications.some((item) => /не заменяют просмотр со звуком/.test(item)));
  assert.doesNotMatch(verdict.qualifications.join(" "), /фильм при этом остаётся черновиком/);
  assert.match(theTrumanShowArticle.closing?.text ?? "", /исходный файл здесь повторно не проверялся/i);
  assert.doesNotMatch(theTrumanShowArticle.standfirst, /на измеренном файле/i);
  const productionMethod = theTrumanShowProductionDossier.sections.flatMap((section) => section.blocks)
    .find((block) => block.id === "prod-met-1");
  assert.ok(productionMethod?.kind === "paragraph");
  assert.doesNotMatch(productionMethod.text, /просмотренному мастеру/i);
  const productionLimits = theTrumanShowProductionDossier.sections.flatMap((section) => section.blocks)
    .find((block) => block.id === "prod-met-4");
  assert.ok(productionLimits?.kind === "paragraph");
  assert.match(productionLimits.text, /не заменяет повторной проверки исходного файла/i);
  assert.match(productionLimits.text, /отмечено его отсутствие/i);
  assert.doesNotMatch(productionLimits.text, /каждая сцена привязана к мастеру/i);
  const articleLimits = theTrumanShowArticle.sections.flatMap((section) => section.blocks)
    .find((block) => block.id === "truman-article-method-4");
  assert.ok(articleLimits?.kind === "paragraph");
  assert.match(articleLimits.text, /прямо сказано, что он не записан/i);
  assert.match(articleLimits.text, /не заменяет просмотра всей сцены со звуком/i);
});
