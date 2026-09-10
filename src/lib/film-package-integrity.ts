import type { ClaimSupport, FilmModule, FilmPackage, SourcesMethodModule } from "@/lib/film-package";

function duplicateIds(values: string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates];
}

function checkSupport(
  support: ClaimSupport | undefined,
  path: string,
  evidenceIds: Set<string>,
  errors: string[],
  required: boolean,
) {
  if (!support) {
    if (required) errors.push(`${path}: published interpretive claims require evidence support.`);
    return;
  }
  if (support.evidenceIds.length === 0) errors.push(`${path}: evidenceIds must not be empty.`);
  const refs = [...support.evidenceIds, ...(support.counterevidenceIds ?? [])];
  for (const id of duplicateIds(refs)) errors.push(`${path}: duplicate evidence reference "${id}".`);
  for (const id of refs) {
    if (!evidenceIds.has(id)) errors.push(`${path}: unknown evidence id "${id}".`);
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
  const evidence = filmPackage.evidence ?? [];
  const evidenceRawIds = evidence.map((item) => item.id);
  const evidenceIds = new Set(evidenceRawIds);
  const sourcesModules = sourceModules(filmPackage);
  const sources = sourcesModules[0];
  const sourceRawIds = sources?.sources.map((item) => item.id) ?? [];
  const sourceIds = new Set(sourceRawIds);
  const characterRawIds = filmPackage.modules.flatMap((filmModule) =>
    filmModule.kind === "characters" ? filmModule.characters.map((character) => character.id) : [],
  );
  const characterIds = new Set(characterRawIds);

  for (const id of duplicateIds(filmPackage.modules.map((filmModule) => filmModule.id))) errors.push(`modules: duplicate module id "${id}".`);
  for (const id of duplicateIds(evidenceRawIds)) errors.push(`evidence: duplicate evidence id "${id}".`);
  for (const id of duplicateIds(sourceRawIds)) errors.push(`sources: duplicate source id "${id}".`);
  for (const id of duplicateIds(characterRawIds)) errors.push(`characters: duplicate character id "${id}".`);

  if (published && sourcesModules.length !== 1) {
    errors.push(`published package requires exactly one sources-method module; found ${sourcesModules.length}.`);
  }
  if (published && evidenceIds.size === 0) errors.push("published package requires canonical evidence records.");
  if (published && !filmPackage.modules.some((filmModule) => filmModule.kind === "final-synthesis")) {
    errors.push("published package requires a final-synthesis module.");
  }

  for (const item of evidence) {
    if (!item.id.trim()) errors.push("evidence: id is required.");
    if (!item.label.trim()) errors.push(`evidence/${item.id}: label is required.`);
    if (!item.observation.trim()) errors.push(`evidence/${item.id}: observation is required.`);
    if (published && (item.sourceIds?.length ?? 0) === 0) {
      errors.push(`evidence/${item.id}: published evidence requires at least one source reference.`);
    }
    for (const id of item.sourceIds ?? []) {
      if (!sourceIds.has(id)) errors.push(`evidence/${item.id}: unknown source id "${id}".`);
    }
  }

  for (const filmModule of filmPackage.modules) {
    if (!filmModule.id.trim()) errors.push(`module/${filmModule.kind}: id is required.`);
    for (const id of duplicateIds(nestedIds(filmModule))) errors.push(`module/${filmModule.id}: duplicate nested id "${id}".`);

    switch (filmModule.kind) {
      case "characters":
        for (const item of filmModule.characters) {
          const interpretive = Boolean(item.believes || item.selfDeception || item.arcSummary || item.roleInArgument);
          checkSupport(item.support, `${filmModule.id}/${item.id}`, evidenceIds, errors, published && interpretive);
        }
        break;
      case "relationship": {
        if (published && !filmModule.participantIds) {
          errors.push(`${filmModule.id}: published relationship requires participantIds.`);
        }
        if (filmModule.participantIds) {
          const participants = [...filmModule.participantIds];
          if (duplicateIds(participants).length > 0) {
            errors.push(`${filmModule.id}: relationship participants must be distinct character ids.`);
          }
          for (const id of participants) {
            if (!characterIds.has(id)) errors.push(`${filmModule.id}: unknown participant character id "${id}".`);
          }
        }
        for (const item of filmModule.events) {
          checkSupport(item.support, `${filmModule.id}/${item.id}`, evidenceIds, errors, published);
          const dimensions = (item.dimensions ?? []).map((shift) => shift.dimension);
          for (const dimension of duplicateIds(dimensions)) {
            errors.push(`${filmModule.id}/${item.id}: duplicate relationship dimension "${dimension}".`);
          }
        }
        break;
      }
      case "family-youth":
        for (const item of filmModule.observations) checkSupport(item.support, `${filmModule.id}/${item.id}`, evidenceIds, errors, published);
        break;
      case "meaning":
        checkSupport(filmModule.support, filmModule.id, evidenceIds, errors, published);
        break;
      case "teaching-signals":
        for (const item of filmModule.signals) checkSupport(item.support, `${filmModule.id}/${item.id}`, evidenceIds, errors, published);
        break;
      case "permission":
        for (const item of filmModule.assessments) {
          if (published && !item.confidence) errors.push(`${filmModule.id}/${item.id}: published permission assessment requires confidence.`);
          checkSupport(item.support, `${filmModule.id}/${item.id}`, evidenceIds, errors, published);
        }
        break;
      case "craft": {
        const observationIds = new Set(filmModule.observations.map((item) => item.id));
        for (const item of filmModule.observations) checkSupport(item.support, `${filmModule.id}/${item.id}`, evidenceIds, errors, published);
        for (const item of filmModule.pressureAssessments ?? []) {
          for (const id of item.craftObservationIds) {
            if (!observationIds.has(id)) errors.push(`${filmModule.id}/${item.id}: unknown craft observation id "${id}".`);
          }
          checkSupport(item.support, `${filmModule.id}/${item.id}`, evidenceIds, errors, published);
        }
        break;
      }
      case "autopsy":
        if (published && !filmModule.confidence) errors.push(`${filmModule.id}: published autopsy requires confidence.`);
        checkSupport(filmModule.support, filmModule.id, evidenceIds, errors, published);
        for (const anchor of filmModule.anchors ?? []) {
          if (!evidenceIds.has(anchor.evidenceId)) errors.push(`${filmModule.id}/${anchor.id}: unknown evidence id "${anchor.evidenceId}".`);
          if (anchor.point && (anchor.point.x < 0 || anchor.point.x > 1 || anchor.point.y < 0 || anchor.point.y > 1)) {
            errors.push(`${filmModule.id}/${anchor.id}: anchor point must use normalized 0..1 coordinates.`);
          }
        }
        break;
      case "decision":
        for (const id of duplicateIds(filmModule.decidingCharacters ?? [])) {
          errors.push(`${filmModule.id}: duplicate deciding character id "${id}".`);
        }
        for (const id of filmModule.decidingCharacters ?? []) {
          if (!characterIds.has(id)) errors.push(`${filmModule.id}: unknown deciding character id "${id}".`);
        }
        if (filmModule.editorialJudgment) checkSupport(filmModule.editorialJudgment.support, `${filmModule.id}/editorial-judgment`, evidenceIds, errors, published);
        break;
      case "moral-analysis":
        for (const item of filmModule.events) {
          checkSupport(item.support, `${filmModule.id}/${item.id}`, evidenceIds, errors, published);
          if ((item.valence === "VIRTUE" || item.valence === "PRUDENTIAL") && (item.severity || item.culpability)) {
            errors.push(`${filmModule.id}/${item.id}: severity/culpability do not apply to virtue or prudential events.`);
          }
        }
        break;
      case "biblical-synthesis": checkSupport(filmModule.support, filmModule.id, evidenceIds, errors, published); break;
      case "final-synthesis": checkSupport(filmModule.support, filmModule.id, evidenceIds, errors, published); break;
      case "story":
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
