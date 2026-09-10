import type {
  ClaimSupport,
  FilmModule,
  FilmPackage,
  SourcesMethodModule,
} from "@/lib/film-package";

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
  for (const id of [...support.evidenceIds, ...(support.counterevidenceIds ?? [])]) {
    if (!evidenceIds.has(id)) errors.push(`${path}: unknown evidence id "${id}".`);
  }
}

function nestedIds(module: FilmModule): string[] {
  switch (module.kind) {
    case "story":
      return module.beats.map((item) => item.id);
    case "characters":
      return module.characters.map((item) => item.id);
    case "relationship":
      return module.events.map((item) => item.id);
    case "family-youth":
      return module.observations.map((item) => item.id);
    case "teaching-signals":
      return module.signals.map((item) => item.id);
    case "permission":
      return module.assessments.map((item) => item.id);
    case "craft":
      return [
        ...module.observations.map((item) => item.id),
        ...(module.pressureAssessments ?? []).map((item) => item.id),
      ];
    case "autopsy":
      return (module.anchors ?? []).map((item) => item.id);
    case "decision":
      return [
        ...module.options.map((item) => item.id),
        ...module.facts.map((item) => item.id),
        ...module.pressures.map((item) => item.id),
        ...module.dutiesOrGoods.map((item) => item.id),
      ];
    case "moral-analysis":
      return module.events.map((item) => item.id);
    case "meaning":
    case "biblical-synthesis":
    case "final-synthesis":
    case "sources-method":
      return [];
  }
}

function sourceModule(filmPackage: FilmPackage): SourcesMethodModule | undefined {
  return filmPackage.modules.find((module): module is SourcesMethodModule => module.kind === "sources-method");
}

/**
 * Validates cross-module IDs and evidence/source references. Fixtures may omit
 * editorial evidence while the UI is being developed; published packages may not.
 */
export function validateFilmPackage(filmPackage: FilmPackage): string[] {
  const errors: string[] = [];
  const published = filmPackage.film.status === "published";
  const moduleIds = filmPackage.modules.map((module) => module.id);
  const evidenceIds = new Set((filmPackage.evidence ?? []).map((item) => item.id));
  const sources = sourceModule(filmPackage);
  const sourceIds = new Set(sources?.sources.map((item) => item.id) ?? []);

  for (const id of duplicateIds(moduleIds)) errors.push(`modules: duplicate module id "${id}".`);
  for (const id of duplicateIds([...evidenceIds])) errors.push(`evidence: duplicate evidence id "${id}".`);

  if (published && !sources) errors.push("published package requires a sources-method module.");
  if (published && evidenceIds.size === 0) errors.push("published package requires canonical evidence records.");

  for (const evidence of filmPackage.evidence ?? []) {
    if (!evidence.id.trim()) errors.push("evidence: id is required.");
    if (!evidence.observation.trim()) errors.push(`evidence/${evidence.id}: observation is required.`);
    for (const id of evidence.sourceIds ?? []) {
      if (!sourceIds.has(id)) errors.push(`evidence/${evidence.id}: unknown source id "${id}".`);
    }
  }

  for (const module of filmPackage.modules) {
    if (!module.id.trim()) errors.push(`module/${module.kind}: id is required.`);
    for (const id of duplicateIds(nestedIds(module))) {
      errors.push(`module/${module.id}: duplicate nested id "${id}".`);
    }

    switch (module.kind) {
      case "characters":
        for (const item of module.characters) {
          const interpretive = Boolean(item.believes || item.selfDeception || item.arcSummary || item.roleInArgument);
          checkSupport(item.support, `${module.id}/${item.id}`, evidenceIds, errors, published && interpretive);
        }
        break;
      case "relationship":
        for (const item of module.events) {
          checkSupport(item.support, `${module.id}/${item.id}`, evidenceIds, errors, published);
        }
        break;
      case "family-youth":
        for (const item of module.observations) {
          checkSupport(item.support, `${module.id}/${item.id}`, evidenceIds, errors, published);
        }
        break;
      case "meaning":
        checkSupport(module.support, module.id, evidenceIds, errors, published);
        break;
      case "teaching-signals":
        for (const item of module.signals) {
          checkSupport(item.support, `${module.id}/${item.id}`, evidenceIds, errors, published);
        }
        break;
      case "permission":
        for (const item of module.assessments) {
          if (published && !item.confidence) errors.push(`${module.id}/${item.id}: published permission assessment requires confidence.`);
          checkSupport(item.support, `${module.id}/${item.id}`, evidenceIds, errors, published);
        }
        break;
      case "craft": {
        const observationIds = new Set(module.observations.map((item) => item.id));
        for (const item of module.observations) {
          checkSupport(item.support, `${module.id}/${item.id}`, evidenceIds, errors, published);
        }
        for (const item of module.pressureAssessments ?? []) {
          for (const id of item.craftObservationIds) {
            if (!observationIds.has(id)) errors.push(`${module.id}/${item.id}: unknown craft observation id "${id}".`);
          }
          checkSupport(item.support, `${module.id}/${item.id}`, evidenceIds, errors, published);
        }
        break;
      }
      case "autopsy":
        if (published && !module.confidence) errors.push(`${module.id}: published autopsy requires confidence.`);
        checkSupport(module.support, module.id, evidenceIds, errors, published);
        for (const anchor of module.anchors ?? []) {
          if (!evidenceIds.has(anchor.evidenceId)) errors.push(`${module.id}/${anchor.id}: unknown evidence id "${anchor.evidenceId}".`);
          if (anchor.point && (anchor.point.x < 0 || anchor.point.x > 1 || anchor.point.y < 0 || anchor.point.y > 1)) {
            errors.push(`${module.id}/${anchor.id}: anchor point must use normalized 0..1 coordinates.`);
          }
        }
        break;
      case "decision":
        if (module.editorialJudgment) {
          checkSupport(module.editorialJudgment.support, `${module.id}/editorial-judgment`, evidenceIds, errors, published);
        }
        break;
      case "moral-analysis":
        for (const item of module.events) {
          checkSupport(item.support, `${module.id}/${item.id}`, evidenceIds, errors, published);
          if (item.valence !== "WRONGDOING" && (item.severity || item.culpability)) {
            errors.push(`${module.id}/${item.id}: severity/culpability are reserved for wrongdoing events.`);
          }
        }
        break;
      case "biblical-synthesis":
        checkSupport(module.support, module.id, evidenceIds, errors, published);
        break;
      case "final-synthesis":
        checkSupport(module.support, module.id, evidenceIds, errors, published);
        break;
      case "story":
      case "sources-method":
        break;
    }
  }

  return errors;
}

export function assertValidFilmRegistry(packages: FilmPackage[]): void {
  const errors: string[] = [];
  for (const slug of duplicateIds(packages.map((item) => item.film.slug))) {
    errors.push(`registry: duplicate film slug "${slug}".`);
  }
  for (const filmPackage of packages) {
    errors.push(...validateFilmPackage(filmPackage).map((error) => `${filmPackage.film.slug}: ${error}`));
  }
  if (errors.length > 0) throw new Error(`Invalid film registry:\n${errors.map((error) => `- ${error}`).join("\n")}`);
}
