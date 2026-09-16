import type {
  EvidenceRecord,
  FilmEditionLock,
  FilmModule,
  FilmPackage,
  FilmSceneRecord,
} from "./film-package";
import { validateFilmPackage } from "./film-package-integrity";

export type LockedFilmPromotionInput = {
  verifiedAt: string;
  scenes: FilmSceneRecord[];
  evidence: EvidenceRecord[];
  modules: FilmModule[];
};

export type LockedFilmPromotionSuccess = {
  ok: true;
  filmPackage: FilmPackage;
};

export type LockedFilmPromotionFailure = {
  ok: false;
  errors: string[];
};

export type LockedFilmPromotionResult =
  | LockedFilmPromotionSuccess
  | LockedFilmPromotionFailure;

const carryOptionalEditionFields = (
  edition: Extract<FilmEditionLock, { state: "MASTER_IDENTIFIED" }>,
): Partial<Extract<FilmEditionLock, { state: "LOCKED" }>> => ({
  ...(edition.frameRate !== undefined ? { frameRate: edition.frameRate } : {}),
  ...(edition.audioTrack !== undefined ? { audioTrack: edition.audioTrack } : {}),
  ...(edition.subtitleTrack !== undefined
    ? { subtitleTrack: edition.subtitleTrack }
    : {}),
  ...(edition.masterDigest !== undefined
    ? { masterDigest: edition.masterDigest }
    : {}),
});

/**
 * Builds and validates an atomic canonical-promotion candidate.
 *
 * This function never mutates the research package and never partially
 * promotes it. Only MASTER_IDENTIFIED packages may enter this transition.
 * The returned LOCKED candidate is accepted only when the existing full
 * FilmPackage integrity validator reports zero errors.
 */
export function prepareLockedFilmPromotion(
  sourcePackage: FilmPackage,
  input: LockedFilmPromotionInput,
): LockedFilmPromotionResult {
  const sourceEdition = sourcePackage.ingest?.edition;

  if (!sourceEdition) {
    return {
      ok: false,
      errors: ["promotion: source package requires ingest.edition metadata."],
    };
  }

  if (sourceEdition.state !== "MASTER_IDENTIFIED") {
    return {
      ok: false,
      errors: [
        `promotion: source edition must be MASTER_IDENTIFIED; received ${sourceEdition.state}.`,
      ],
    };
  }

  const sourceErrors = validateFilmPackage(sourcePackage);
  if (sourceErrors.length > 0) {
    return {
      ok: false,
      errors: sourceErrors.map((error) => `promotion/source: ${error}`),
    };
  }

  const lockedEdition: Extract<FilmEditionLock, { state: "LOCKED" }> = {
    state: "LOCKED",
    sourceId: sourceEdition.sourceId,
    editionIdentity: sourceEdition.editionIdentity,
    measuredRuntimeSeconds: sourceEdition.measuredRuntimeSeconds,
    timestampConvention: sourceEdition.timestampConvention,
    verifiedAt: input.verifiedAt,
    ...carryOptionalEditionFields(sourceEdition),
  };

  const clonedSource = structuredClone(sourcePackage);
  const { research: _research, ...withoutResearch } = clonedSource;

  const candidate: FilmPackage = {
    ...withoutResearch,
    ingest: {
      edition: lockedEdition,
      ...(clonedSource.ingest?.masterSegmentation !== undefined
        ? {
            masterSegmentation: structuredClone(
              clonedSource.ingest.masterSegmentation,
            ),
          }
        : {}),
    },
    scenes: structuredClone(input.scenes),
    evidence: structuredClone(input.evidence),
    modules: structuredClone(input.modules),
  };

  const errors = validateFilmPackage(candidate);
  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, filmPackage: candidate };
}
