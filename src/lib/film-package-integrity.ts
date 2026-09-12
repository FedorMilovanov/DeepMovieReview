import type {
  ClaimSupport,
  EvidenceRecord,
  FilmModule,
  FilmPackage,
  FinalSynthesisFacetKey,
  SourcesMethodModule,
} from "@/lib/film-package";
import { canRevealSpoiler, type SpoilerLevel } from "./spoilers";

const ROUTE_SAFE_FILM_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const REQUIRED_FINAL_FACETS: FinalSynthesisFacetKey[] = [
  "CRAFT",
  "MORAL_CLARITY",
  "DEPICTED_EVIL",
  "ROMANTICIZATION",
  "DECISION_COMPLEXITY",
  "REDEMPTIVE_DIRECTION",
];

function duplicateIds(values: string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates];
}

function isBlank(value: string | undefined): boolean {
  return !value?.trim();
}

function isIsoCalendarDate(value: string | undefined): boolean {
  const normalized = value?.trim();
  if (!normalized || !/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return false;

  const [year, month, day] = normalized.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

function isSafeSourceHref(value: string): boolean {
  const href = value.trim();
  if (href.includes("\\")) return false;
  if (href.startsWith("/") && !href.startsWith("//")) return true;
  if (!/^https?:\/\//i.test(href)) return false;

  try {
    const url = new URL(href);
    return (
      (url.protocol === "https:" || url.protocol === "http:") &&
      Boolean(url.hostname) &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

function checkSupport(
  support: ClaimSupport | undefined,
  path: string,
  evidenceIds: Set<string>,
  errors: string[],
  required: boolean,
) {
  if (!support) {
    if (required) errors.push(`${path}: real-film interpretive claims require canonical evidence support.`);
    return;
  }
  if (support.evidenceIds.length === 0) errors.push(`${path}: evidenceIds must not be empty.`);
  const refs = [...support.evidenceIds, ...(support.counterevidenceIds ?? [])];
  for (const id of duplicateIds(refs)) errors.push(`${path}: duplicate evidence reference "${id}".`);
  for (const id of refs) {
    if (!evidenceIds.has(id)) errors.push(`${path}: unknown evidence id "${id}".`);
  }
}

function checkSupportSpoilerCeiling(
  support: ClaimSupport | undefined,
  path: string,
  claimLevel: SpoilerLevel,
  evidenceById: Map<string, EvidenceRecord>,
  errors: string[],
  enabled: boolean,
) {
  if (!enabled || !support) return;
  const refs = [...support.evidenceIds, ...(support.counterevidenceIds ?? [])];
  for (const id of refs) {
    const evidence = evidenceById.get(id);
    if (evidence && !canRevealSpoiler(claimLevel, evidence.spoilerLevel)) {
      errors.push(
        `${path}: support evidence "${id}" spoiler level "${evidence.spoilerLevel}" exceeds claim level "${claimLevel}".`,
      );
    }
  }
}

function nestedIds(filmModule: FilmModule): string[] {
  switch (filmModule.kind) {
    case "story": return filmModule.beats.map((item) => item.id);
    case "characters": return filmModule.characters.map((item) => item.id);
    case "relationship": return filmModule.events.map((item) => item.id);
    case "family-youth": return filmModule.observations.map((item) => item.id);
    case "teaching-signals": return filmModule.signals.map((item) => item.id);
    case "permission": return filmModule.assessments.map((item) => item.id);
    case "craft": return [...filmModule.observations.map((item) => item.id), ...(filmModule.pressureAssessments ?? []).map((item) => item.id)];
    case "autopsy": return (filmModule.anchors ?? []).map((item) => item.id);
    case "decision": return [...filmModule.options.map((item) => item.id), ...filmModule.facts.map((item) => item.id), ...filmModule.pressures.map((item) => item.id), ...filmModule.dutiesOrGoods.map((item) => item.id)];
    case "moral-analysis": return filmModule.events.map((item) => item.id);
    case "meaning":
    case "biblical-synthesis":
    case "final-synthesis":
    case "sources-method": return [];
  }
}

function sourceModules(filmPackage: FilmPackage): SourcesMethodModule[] {
  return filmPackage.modules.filter((candidate): candidate is SourcesMethodModule => candidate.kind === "sources-method");
}

export function validateFilmPackage(filmPackage: FilmPackage): string[] {
  const errors: string[] = [];
  const published = filmPackage.film.status === "published";
  const realFilm = filmPackage.film.status !== "fixture";
  const research = filmPackage.research?.state === "SECONDARY_SOURCES";
  const scenes = filmPackage.scenes ?? [];
  const sceneRawIds = scenes.map((scene) => scene.id);
  const scenesById = new Map(scenes.map((scene) => [scene.id, scene]));
  const evidence = filmPackage.evidence ?? [];
  const evidenceRawIds = evidence.map((item) => item.id);
  const evidenceIds = new Set(evidenceRawIds);
  const evidenceById = new Map(evidence.map((item) => [item.id, item]));
  const sourcesModules = sourceModules(filmPackage);
  const allSources = sourcesModules.flatMap((sourceModule) => sourceModule.sources);
  const sourceRawIds = allSources.map((item) => item.id);
  const sourceIds = new Set(sourceRawIds);
  const sourcesById = new Map(allSources.map((source) => [source.id, source]));
  const characterRawIds = filmPackage.modules.flatMap((filmModule) =>
    filmModule.kind === "characters" ? filmModule.characters.map((character) => character.id) : [],
  );
  const characterIds = new Set(characterRawIds);
  const checkScopedSupport = (
    support: ClaimSupport | undefined,
    path: string,
    claimLevel: SpoilerLevel,
    required: boolean,
  ) => {
    checkSupport(support, path, evidenceIds, errors, required);
    checkSupportSpoilerCeiling(support, path, claimLevel, evidenceById, errors, realFilm);
  };

  if (isBlank(filmPackage.film.slug)) {
    errors.push("film: slug is required.");
  } else if (!ROUTE_SAFE_FILM_SLUG.test(filmPackage.film.slug)) {
    errors.push("film: slug must use lowercase kebab-case URL-safe segments.");
  }
  if (isBlank(filmPackage.film.title)) errors.push("film: title is required.");
  if (published && isBlank(filmPackage.film.director)) errors.push("film: published package requires director attribution.");
  if (published && filmPackage.film.genre.length === 0) errors.push("film: published package requires at least one genre.");
  if (published && isBlank(filmPackage.film.premise)) errors.push("film: published package requires a premise.");
  if (published && isBlank(filmPackage.film.thesisQuestion)) errors.push("film: published package requires a thesis question.");

  for (const id of duplicateIds(filmPackage.modules.map((filmModule) => filmModule.id))) errors.push(`modules: duplicate module id "${id}".`);
  for (const id of duplicateIds(sceneRawIds)) errors.push(`scenes: duplicate scene id "${id}".`);
  for (const index of duplicateIds(scenes.map((scene) => String(scene.sequenceIndex)))) {
    errors.push(`scenes: duplicate sequence index "${index}".`);
  }
  for (const id of duplicateIds(evidenceRawIds)) errors.push(`evidence: duplicate evidence id "${id}".`);
  for (const id of duplicateIds(sourceRawIds)) errors.push(`sources: duplicate source id "${id}".`);
  for (const id of duplicateIds(characterRawIds)) errors.push(`characters: duplicate character id "${id}".`);

  // Research tier: declares a secondary-source research draft. It is the only
  // way a real-film package may carry scenes, evidence and analytical modules
  // while the edition is still TARGET_ONLY — and it can never be published.
  if (filmPackage.research) {
    if (filmPackage.research.state !== "SECONDARY_SOURCES") {
      errors.push(`research: unknown research state "${String(filmPackage.research.state)}".`);
    }
    if (isBlank(filmPackage.research.note)) errors.push("research: SECONDARY_SOURCES tier requires a note.");
    if (!isIsoCalendarDate(filmPackage.research.assembledAt)) {
      errors.push("research: assembledAt must use a valid YYYY-MM-DD calendar date.");
    }
    if (published) {
      errors.push("research: a published package cannot remain in the SECONDARY_SOURCES research tier.");
    }
  }
  if (research && filmPackage.ingest?.edition.state === "LOCKED") {
    errors.push("research: the SECONDARY_SOURCES tier is only valid while the edition is TARGET_ONLY.");
  }

  if (sourcesModules.length > 1) {
    errors.push(`package requires at most one sources-method module; found ${sourcesModules.length}.`);
  }
  if (published && sourcesModules.length !== 1) {
    errors.push(`published package requires exactly one sources-method module; found ${sourcesModules.length}.`);
  }
  if (published && evidenceIds.size === 0) errors.push("published package requires canonical evidence records.");
  if (published && !filmPackage.modules.some((filmModule) => filmModule.kind === "final-synthesis")) {
    errors.push("published package requires a final-synthesis module.");
  }

  for (const scene of scenes) {
    if (isBlank(scene.id)) errors.push("scenes: scene id is required.");
    if (published && realFilm && scene.verificationState !== "VERIFIED") {
      errors.push(`scene/${scene.id}: published real-film scenes must be VERIFIED.`);
    }
    if (isBlank(scene.shortLabel)) errors.push(`scene/${scene.id}: shortLabel is required.`);
    if (!Number.isInteger(scene.sequenceIndex) || scene.sequenceIndex < 0) {
      errors.push(`scene/${scene.id}: sequenceIndex must be a non-negative integer.`);
    }
    if (!Number.isFinite(scene.startTimestampSeconds) || scene.startTimestampSeconds < 0) {
      errors.push(`scene/${scene.id}: startTimestampSeconds must be a non-negative finite number.`);
    }
    if (scene.endTimestampSeconds !== undefined) {
      if (!Number.isFinite(scene.endTimestampSeconds) || scene.endTimestampSeconds <= scene.startTimestampSeconds) {
        errors.push(`scene/${scene.id}: endTimestampSeconds must be greater than startTimestampSeconds.`);
      }
    } else if (scene.verificationState === "VERIFIED") {
      errors.push(`scene/${scene.id}: VERIFIED scene requires endTimestampSeconds.`);
    }
  }

  const orderedScenes = [...scenes].sort((a, b) => a.sequenceIndex - b.sequenceIndex);
  for (let index = 1; index < orderedScenes.length; index += 1) {
    const previous = orderedScenes[index - 1]!;
    const current = orderedScenes[index]!;
    if (current.startTimestampSeconds < previous.startTimestampSeconds) {
      errors.push(
        `scene/${current.id}: startTimestampSeconds must not precede earlier sequence scene "${previous.id}".`,
      );
    }
    if (
      previous.endTimestampSeconds !== undefined &&
      current.startTimestampSeconds < previous.endTimestampSeconds
    ) {
      errors.push(`scene/${current.id}: scene range overlaps previous scene "${previous.id}".`);
    }
  }

  if (realFilm) {
    const edition = filmPackage.ingest?.edition;
    if (!edition) {
      errors.push("film: real-film package requires ingest.edition metadata.");
    } else {
      const editionSource = sourcesById.get(edition.sourceId);
      if (!editionSource) {
        errors.push(`film: ingest edition references unknown source id "${edition.sourceId}".`);
      } else if (editionSource.kind !== "film-edition") {
        errors.push(`film: ingest edition source "${edition.sourceId}" must have kind "film-edition".`);
      }

      if (edition.state === "TARGET_ONLY") {
        if (isBlank(edition.note)) errors.push("film: TARGET_ONLY edition state requires a note.");
        if (published) errors.push("film: published package requires a LOCKED edition.");
        if (scenes.length > 0 && !research) {
          errors.push("film: canonical scene registry requires a LOCKED edition, not TARGET_ONLY.");
        }
        if (evidence.length > 0 && !research) {
          errors.push("film: canonical evidence requires a LOCKED edition, not TARGET_ONLY.");
        }
        for (const scene of scenes) {
          if (research && scene.verificationState === "VERIFIED") {
            errors.push(`scene/${scene.id}: research-tier scenes must stay DRAFT until the viewing master is LOCKED.`);
          }
        }
        for (const filmModule of filmPackage.modules) {
          if (filmModule.kind !== "sources-method" && !research) {
            errors.push(
              `module/${filmModule.id}: TARGET_ONLY real-film packages may contain only sources-method modules until the viewing master is LOCKED.`,
            );
          }
        }
      } else {
        if (isBlank(edition.editionIdentity)) errors.push("film: LOCKED edition requires editionIdentity.");
        if (!Number.isFinite(edition.measuredRuntimeSeconds) || edition.measuredRuntimeSeconds <= 0) {
          errors.push("film: LOCKED edition requires positive measuredRuntimeSeconds.");
        }
        if (isBlank(edition.timestampConvention)) errors.push("film: LOCKED edition requires timestampConvention.");
        if (isBlank(edition.verifiedAt)) {
          errors.push("film: LOCKED edition requires verifiedAt.");
        } else if (!isIsoCalendarDate(edition.verifiedAt)) {
          errors.push("film: LOCKED edition verifiedAt must use a valid YYYY-MM-DD calendar date.");
        }

        for (const scene of scenes) {
          if (scene.startTimestampSeconds >= edition.measuredRuntimeSeconds) {
            errors.push(`scene/${scene.id}: startTimestampSeconds must be inside the locked edition runtime.`);
          }
          if (
            scene.endTimestampSeconds !== undefined &&
            scene.endTimestampSeconds > edition.measuredRuntimeSeconds
          ) {
            errors.push(`scene/${scene.id}: endTimestampSeconds exceeds the locked edition runtime.`);
          }
        }

        for (const item of evidence) {
          if (!(item.sourceIds ?? []).includes(edition.sourceId)) {
            errors.push(
              `evidence/${item.id}: real-film canonical evidence must reference locked film-edition source "${edition.sourceId}".`,
            );
          }
        }
      }
    }
  }

  for (const sourceModule of sourcesModules) {
    if (realFilm && isBlank(sourceModule.methodologyVersion)) errors.push(`${sourceModule.id}: methodologyVersion is required for real-film analysis.`);
    if (realFilm && isBlank(sourceModule.editorialRevision)) errors.push(`${sourceModule.id}: editorialRevision is required for real-film analysis.`);
    if (realFilm && isBlank(sourceModule.analyzedEdition)) errors.push(`${sourceModule.id}: analyzedEdition is required for real-film analysis.`);
    if (published && isBlank(sourceModule.lastReviewedAt)) {
      errors.push(`${sourceModule.id}: lastReviewedAt is required for published analysis.`);
    } else if (sourceModule.lastReviewedAt && !isIsoCalendarDate(sourceModule.lastReviewedAt)) {
      errors.push(`${sourceModule.id}: lastReviewedAt must use a valid YYYY-MM-DD calendar date.`);
    }

    for (const source of sourceModule.sources) {
      if (isBlank(source.id)) errors.push(`${sourceModule.id}: source id is required.`);
      if (isBlank(source.label)) errors.push(`${sourceModule.id}/${source.id}: source label is required.`);
      if (source.href && !isSafeSourceHref(source.href)) {
        errors.push(`${sourceModule.id}/${source.id}: source href must be http(s) or an app-root path.`);
      }
    }
  }

  for (const item of evidence) {
    if (isBlank(item.id)) errors.push("evidence: id is required.");
    if (isBlank(item.label)) errors.push(`evidence/${item.id}: label is required.`);
    if (isBlank(item.observation)) errors.push(`evidence/${item.id}: observation is required.`);
    if (published && (item.sourceIds?.length ?? 0) === 0) {
      errors.push(`evidence/${item.id}: published evidence requires at least one source reference.`);
    }
    if (research && (item.sourceIds?.length ?? 0) === 0) {
      errors.push(`evidence/${item.id}: research-tier evidence requires at least one secondary source reference.`);
    }
    if (research && filmPackage.ingest?.edition.state === "TARGET_ONLY") {
      const editionSourceId = filmPackage.ingest.edition.sourceId;
      for (const sourceId of item.sourceIds ?? []) {
        const source = sourcesById.get(sourceId);
        if (source?.kind !== "film-edition") continue;
        if (sourceId === editionSourceId) {
          errors.push(`evidence/${item.id}: research-tier evidence must not cite the target film-edition source "${editionSourceId}" (the master is not locked).`);
        } else {
          errors.push(`evidence/${item.id}: research-tier evidence must not cite film-edition source "${sourceId}" before the viewing master is LOCKED.`);
        }
      }
    }
    for (const id of duplicateIds(item.sourceIds ?? [])) {
      errors.push(`evidence/${item.id}: duplicate source reference "${id}".`);
    }
    for (const id of item.sourceIds ?? []) {
      if (!sourceIds.has(id)) errors.push(`evidence/${item.id}: unknown source id "${id}".`);
    }

    if (item.timestampSeconds !== undefined && (!Number.isFinite(item.timestampSeconds) || item.timestampSeconds < 0)) {
      errors.push(`evidence/${item.id}: timestampSeconds must be a non-negative finite number.`);
    }

    if (realFilm) {
      if (!item.sceneId) {
        errors.push(`evidence/${item.id}: real-film evidence requires a canonical sceneId.`);
      }
      if (item.timestampSeconds === undefined) {
        errors.push(`evidence/${item.id}: real-film evidence requires timestampSeconds.`);
      }
      if (item.timestamp !== undefined) {
        errors.push(`evidence/${item.id}: real-film evidence must use timestampSeconds instead of legacy timestamp text.`);
      }
      if (item.timestampSeconds !== undefined && !item.sceneId) {
        errors.push(`evidence/${item.id}: timestampSeconds requires a canonical sceneId.`);
      }
      if (item.sceneId) {
        const scene = scenesById.get(item.sceneId);
        if (!scene) {
          errors.push(`evidence/${item.id}: unknown scene id "${item.sceneId}".`);
        } else {
          if (scene.verificationState !== "VERIFIED" && !research) {
            errors.push(`evidence/${item.id}: canonical evidence cannot reference unverified scene "${item.sceneId}".`);
          }
          if (!canRevealSpoiler(item.spoilerLevel, scene.spoilerLevel)) {
            errors.push(
              `evidence/${item.id}: spoiler level "${item.spoilerLevel}" cannot be lower than scene "${item.sceneId}" level "${scene.spoilerLevel}".`,
            );
          }
          if (item.timestampSeconds !== undefined) {
            if (item.timestampSeconds < scene.startTimestampSeconds) {
              errors.push(`evidence/${item.id}: timestampSeconds falls before scene "${item.sceneId}".`);
            }
            if (
              scene.endTimestampSeconds !== undefined &&
              item.timestampSeconds >= scene.endTimestampSeconds
            ) {
              errors.push(`evidence/${item.id}: timestampSeconds falls at or after scene end "${item.sceneId}".`);
            }
          }
        }
      }
    }
  }

  for (const filmModule of filmPackage.modules) {
    if (isBlank(filmModule.id)) errors.push(`module/${filmModule.kind}: id is required.`);
    if (published && isBlank(filmModule.heading)) errors.push(`module/${filmModule.id}: published module requires a heading.`);
    for (const id of duplicateIds(nestedIds(filmModule))) errors.push(`module/${filmModule.id}: duplicate nested id "${id}".`);

    switch (filmModule.kind) {
      case "story":
        checkScopedSupport(
          filmModule.summarySupport,
          `${filmModule.id}/summary`,
          filmModule.spoilerLevel,
          realFilm,
        );
        if (realFilm && filmModule.beats.length === 0) {
          errors.push(`${filmModule.id}: real-film story module requires at least one plot beat.`);
        }
        for (const beat of filmModule.beats) {
          checkScopedSupport(
            beat.support,
            `${filmModule.id}/${beat.id}`,
            beat.spoilerLevel,
            realFilm,
          );
        }
        break;
      case "characters":
        for (const item of filmModule.characters) {
          if (isBlank(item.id)) errors.push(`${filmModule.id}: character id is required.`);
          if (published && isBlank(item.name)) errors.push(`${filmModule.id}/${item.id}: published character requires a name.`);

          const profileLevel = item.profileSpoilerLevel ?? filmModule.spoilerLevel;
          const interpretiveLevel = item.interpretiveSpoilerLevel ?? profileLevel;
          if (!canRevealSpoiler(interpretiveLevel, profileLevel)) {
            errors.push(
              `${filmModule.id}/${item.id}: interpretiveSpoilerLevel "${interpretiveLevel}" cannot be lower than profile level "${profileLevel}".`,
            );
          }

          checkScopedSupport(
            item.profileSupport,
            `${filmModule.id}/${item.id}/profile`,
            profileLevel,
            realFilm,
          );

          const hasInterpretiveFields = [item.believes, item.selfDeception, item.arcSummary, item.roleInArgument]
            .some((value) => !isBlank(value));
          checkScopedSupport(
            item.interpretiveSupport,
            `${filmModule.id}/${item.id}/interpretation`,
            interpretiveLevel,
            realFilm && hasInterpretiveFields,
          );
        }
        break;
      case "relationship": {
        checkScopedSupport(
          filmModule.summarySupport,
          `${filmModule.id}/summary`,
          filmModule.spoilerLevel,
          realFilm,
        );
        if (published && !filmModule.participantCharacterIds) {
          errors.push(`${filmModule.id}: published relationship requires participantCharacterIds.`);
        }
        if (filmModule.participantCharacterIds) {
          const participants = [...filmModule.participantCharacterIds];
          if (duplicateIds(participants).length > 0) {
            errors.push(`${filmModule.id}: relationship participants must be distinct character ids.`);
          }
          for (const id of participants) {
            if (!characterIds.has(id)) errors.push(`${filmModule.id}: unknown participant character id "${id}".`);
          }
        }
        if (published && filmModule.events.length === 0) errors.push(`${filmModule.id}: published relationship requires at least one event.`);
        for (const item of filmModule.events) {
          checkScopedSupport(item.support, `${filmModule.id}/${item.id}`, item.spoilerLevel, realFilm);
          const dimensions = (item.dimensions ?? []).map((shift) => shift.dimension);
          for (const dimension of duplicateIds(dimensions)) {
            errors.push(`${filmModule.id}/${item.id}: duplicate relationship dimension "${dimension}".`);
          }
          for (const shift of item.dimensions ?? []) {
            if (isBlank(shift.before) || isBlank(shift.after)) {
              errors.push(`${filmModule.id}/${item.id}/${shift.dimension}: relationship dimension shifts require before and after values.`);
            }
          }
        }
        break;
      }
      case "family-youth":
        if (!isBlank(filmModule.summary)) {
          checkScopedSupport(
            filmModule.summarySupport,
            `${filmModule.id}/summary`,
            filmModule.spoilerLevel,
            realFilm,
          );
        }
        for (const item of filmModule.observations) checkScopedSupport(item.support, `${filmModule.id}/${item.id}`, item.spoilerLevel, realFilm);
        break;
      case "meaning":
        checkScopedSupport(filmModule.support, filmModule.id, filmModule.spoilerLevel, realFilm);
        break;
      case "teaching-signals":
        for (const item of filmModule.signals) checkScopedSupport(item.support, `${filmModule.id}/${item.id}`, item.spoilerLevel, realFilm);
        break;
      case "permission":
        for (const item of filmModule.assessments) {
          if (published && !item.confidence) errors.push(`${filmModule.id}/${item.id}: published permission assessment requires confidence.`);
          checkScopedSupport(item.support, `${filmModule.id}/${item.id}`, item.spoilerLevel, realFilm);
        }
        break;
      case "craft": {
        const observationsById = new Map(filmModule.observations.map((item) => [item.id, item]));
        const observationIds = new Set(observationsById.keys());
        for (const item of filmModule.observations) {
          checkScopedSupport(item.support, `${filmModule.id}/${item.id}`, item.spoilerLevel, realFilm);
        }
        for (const item of filmModule.pressureAssessments ?? []) {
          if (published && item.craftObservationIds.length === 0) {
            errors.push(`${filmModule.id}/${item.id}: published pressure assessment requires craft observation references.`);
          }
          for (const id of duplicateIds(item.craftObservationIds)) {
            errors.push(`${filmModule.id}/${item.id}: duplicate craft observation reference "${id}".`);
          }
          for (const id of item.craftObservationIds) {
            if (!observationIds.has(id)) {
              errors.push(`${filmModule.id}/${item.id}: unknown craft observation id "${id}".`);
              continue;
            }
            const observation = observationsById.get(id);
            if (realFilm && observation && !canRevealSpoiler(item.spoilerLevel, observation.spoilerLevel)) {
              errors.push(
                `${filmModule.id}/${item.id}: craft observation "${id}" spoiler level "${observation.spoilerLevel}" exceeds assessment level "${item.spoilerLevel}".`,
              );
            }
          }
          checkScopedSupport(item.support, `${filmModule.id}/${item.id}`, item.spoilerLevel, realFilm);
        }
        break;
      }
      case "autopsy":
        if (published && !filmModule.confidence) errors.push(`${filmModule.id}: published autopsy requires confidence.`);
        if (published && (filmModule.anchors?.length ?? 0) === 0) errors.push(`${filmModule.id}: published autopsy requires at least one evidence anchor.`);
        if (published && !filmModule.sceneId) errors.push(`${filmModule.id}: published autopsy requires a canonical sceneId.`);
        if (filmModule.sceneId && realFilm) {
          const scene = scenesById.get(filmModule.sceneId);
          if (!scene) {
            errors.push(`${filmModule.id}: unknown scene id "${filmModule.sceneId}".`);
          } else {
            if (scene.verificationState !== "VERIFIED" && !research) {
              errors.push(`${filmModule.id}: autopsy cannot reference unverified scene "${filmModule.sceneId}".`);
            }
            if (!canRevealSpoiler(filmModule.spoilerLevel, scene.spoilerLevel)) {
              errors.push(
                `${filmModule.id}: spoiler level "${filmModule.spoilerLevel}" cannot be lower than scene "${filmModule.sceneId}" level "${scene.spoilerLevel}".`,
              );
            }
          }
        }
        checkScopedSupport(filmModule.support, filmModule.id, filmModule.spoilerLevel, realFilm);
        for (const anchor of filmModule.anchors ?? []) {
          if (!evidenceIds.has(anchor.evidenceId)) {
            errors.push(`${filmModule.id}/${anchor.id}: unknown evidence id "${anchor.evidenceId}".`);
          } else if (realFilm) {
            const anchorEvidence = evidenceById.get(anchor.evidenceId);
            if (filmModule.sceneId && anchorEvidence?.sceneId !== filmModule.sceneId) {
              errors.push(
                `${filmModule.id}/${anchor.id}: anchor evidence must belong to autopsy scene "${filmModule.sceneId}".`,
              );
            }
            if (anchorEvidence && !canRevealSpoiler(filmModule.spoilerLevel, anchorEvidence.spoilerLevel)) {
              errors.push(
                `${filmModule.id}/${anchor.id}: anchor evidence "${anchor.evidenceId}" spoiler level "${anchorEvidence.spoilerLevel}" exceeds autopsy level "${filmModule.spoilerLevel}".`,
              );
            }
          }
          if (anchor.point && (anchor.point.x < 0 || anchor.point.x > 1 || anchor.point.y < 0 || anchor.point.y > 1)) {
            errors.push(`${filmModule.id}/${anchor.id}: anchor point must use normalized 0..1 coordinates.`);
          }
        }
        break;
      case "decision": {
        if (published && (filmModule.decidingCharacters?.length ?? 0) === 0) {
          errors.push(`${filmModule.id}: published decision requires at least one deciding character id.`);
        }
        for (const id of duplicateIds(filmModule.decidingCharacters ?? [])) {
          errors.push(`${filmModule.id}: duplicate deciding character id "${id}".`);
        }
        for (const id of filmModule.decidingCharacters ?? []) {
          if (!characterIds.has(id)) errors.push(`${filmModule.id}: unknown deciding character id "${id}".`);
        }
        if (published && filmModule.options.length < 2) {
          errors.push(`${filmModule.id}: published decision requires at least two explicit options.`);
        }
        if (published && !filmModule.options.some((option) => option.availableAtDecisionTime)) {
          errors.push(`${filmModule.id}: published decision requires at least one option available at decision time.`);
        }
        for (const option of filmModule.options) {
          checkScopedSupport(
            option.support,
            `${filmModule.id}/option/${option.id}`,
            option.spoilerLevel ?? filmModule.spoilerLevel,
            realFilm,
          );
        }
        for (const fact of filmModule.facts) {
          checkScopedSupport(
            fact.support,
            `${filmModule.id}/fact/${fact.id}`,
            fact.spoilerLevel,
            realFilm,
          );
        }
        for (const pressure of filmModule.pressures) {
          checkScopedSupport(
            pressure.support,
            `${filmModule.id}/pressure/${pressure.id}`,
            pressure.spoilerLevel,
            realFilm,
          );
        }
        for (const duty of filmModule.dutiesOrGoods) {
          checkScopedSupport(
            duty.support,
            `${filmModule.id}/duty/${duty.id}`,
            duty.spoilerLevel,
            realFilm,
          );
        }
        if (filmModule.editorialJudgment) {
          checkScopedSupport(
            filmModule.editorialJudgment.support,
            `${filmModule.id}/editorial-judgment`,
            filmModule.editorialJudgment.spoilerLevel,
            realFilm,
          );
        }
        break;
      }
      case "moral-analysis":
        if (!isBlank(filmModule.summary)) {
          checkScopedSupport(
            filmModule.summarySupport,
            `${filmModule.id}/summary`,
            filmModule.spoilerLevel,
            realFilm,
          );
        }
        for (const item of filmModule.events) {
          const actorIds = item.actorCharacterIds ?? [];
          for (const id of duplicateIds(actorIds)) {
            errors.push(`${filmModule.id}/${item.id}: duplicate actor character id "${id}".`);
          }
          for (const id of actorIds) {
            if (!characterIds.has(id)) errors.push(`${filmModule.id}/${item.id}: unknown actor character id "${id}".`);
          }
          if (published && (item.valence === "WRONGDOING" || item.valence === "VIRTUE") && actorIds.length === 0) {
            errors.push(`${filmModule.id}/${item.id}: published wrongdoing/virtue event requires at least one actor character id.`);
          }
          checkScopedSupport(item.support, `${filmModule.id}/${item.id}`, item.spoilerLevel, realFilm);
          if ((item.valence === "VIRTUE" || item.valence === "PRUDENTIAL") && (item.severity || item.culpability)) {
            errors.push(`${filmModule.id}/${item.id}: severity/culpability do not apply to virtue or prudential events.`);
          }
          if (published && item.valence === "WRONGDOING" && !item.severity) {
            errors.push(`${filmModule.id}/${item.id}: published wrongdoing requires severity.`);
          }
          if (published && item.valence === "WRONGDOING" && !item.culpability) {
            errors.push(`${filmModule.id}/${item.id}: published wrongdoing requires culpability.`);
          }
        }
        break;
      case "biblical-synthesis":
        if (published && filmModule.scriptureRefs.length === 0) errors.push(`${filmModule.id}: published biblical synthesis requires Scripture references.`);
        for (const ref of duplicateIds(filmModule.scriptureRefs)) errors.push(`${filmModule.id}: duplicate Scripture reference "${ref}".`);
        checkScopedSupport(filmModule.support, filmModule.id, filmModule.spoilerLevel, realFilm);
        break;
      case "final-synthesis": {
        const facetKeys = filmModule.facets.map((facet) => facet.key);
        for (const key of duplicateIds(facetKeys)) errors.push(`${filmModule.id}: duplicate synthesis facet "${key}".`);
        if (published) {
          for (const key of REQUIRED_FINAL_FACETS) {
            if (!facetKeys.includes(key)) errors.push(`${filmModule.id}: published synthesis is missing facet "${key}".`);
          }
          if (isBlank(filmModule.thesis)) errors.push(`${filmModule.id}: published synthesis requires a thesis.`);
          if (isBlank(filmModule.verdict)) errors.push(`${filmModule.id}: published synthesis requires a verdict.`);
        }
        checkScopedSupport(filmModule.support, filmModule.id, filmModule.spoilerLevel, realFilm);
        break;
      }
      case "sources-method": break;
    }
  }

  return errors;
}

export function assertValidFilmRegistry(packages: FilmPackage[]): void {
  const errors: string[] = [];
  for (const slug of duplicateIds(packages.map((item) => item.film.slug))) errors.push(`registry: duplicate film slug "${slug}".`);
  for (const filmPackage of packages) {
    errors.push(...validateFilmPackage(filmPackage).map((error) => `${filmPackage.film.slug}: ${error}`));
  }
  if (errors.length > 0) throw new Error(`Invalid film registry:\n${errors.map((error) => `- ${error}`).join("\n")}`);
}
