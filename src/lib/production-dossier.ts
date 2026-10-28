/**
 * The production dossier: the readable layer over the *making* of a film.
 *
 * It exists because the article validator asked the right question and the
 * answer did not fit. `film-article-integrity.ts` requires a real-film section
 * to carry a claim backed by canonical evidence — a timestamp in the locked
 * master. That rule is what makes the analysis checkable, and it is also why a
 * production history cannot be written in the same structure: "the script was
 * bought for slightly over a million dollars in 1993" is not in the film. Putting
 * such a sentence behind an `evidenceId` would be a lie told in a schema, and a
 * lie in a schema is worse than a lie in prose, because the tooling repeats it.
 *
 * So this file defines a second, deliberately smaller shape:
 *
 *   - a **claim** is one sentence-shaped assertion with at least one source;
 *   - a **source** is a URL, a publisher, a tier and the date we last opened it;
 *   - a **section** is prose whose paragraphs point at claims, never at pictures.
 *
 * The rules below are the ones worth enforcing in code:
 *
 *   1. every claim has a source, and every source is used by a claim — a
 *      reference list nobody cites is decoration;
 *   2. a claim marked CONFIRMED cannot rest on tertiary material alone;
 *   3. a claim marked DISPUTED or UNVERIFIED must be surfaced in a `myths`
 *      block, so "we could not verify this" cannot silently disappear into a
 *      draft;
 *   4. prose may not contain a timecode. Production claims do not get to wear
 *      the clothes of measured evidence — this is the guard that keeps the two
 *      documents from blending;
 *   5. at least 50 sources, with a floor on primary/secondary material and a
 *      ceiling on tertiary. A dossier that is 90 % fan wikis is not a dossier.
 */

export type ProductionSourceTier = "PRIMARY" | "SECONDARY" | "TERTIARY";

/** `CONFIRMED` — at least one primary or secondary source says it. */
export type ProductionClaimStatus = "CONFIRMED" | "DISPUTED" | "UNVERIFIED";

export type ProductionSource = {
  id: string;
  label: string;
  publisher: string;
  /** Absolute https URL. Never a search result, never a shortener. */
  url: string;
  tier: ProductionSourceTier;
  /** ISO date the source was published, when the source states it. */
  publishedAt?: string;
  /** ISO date we last opened it. Every source carries one. */
  checkedOn: string;
  /** One line: what this source actually supports. */
  supports: string;
};

export type ProductionClaim = {
  id: string;
  /** The assertion, in one sentence. */
  text: string;
  sourceIds: string[];
  status: ProductionClaimStatus;
};

export type ProductionFactRow = {
  id: string;
  label: string;
  value: string;
  sourceIds: string[];
  claimIds?: string[];
};

export type ProductionTimelineItem = {
  id: string;
  /** `1991`, `1991-05` or `1991-05-14`. Sorted lexicographically. */
  date: string;
  label: string;
  sourceIds: string[];
  claimIds?: string[];
};

export type ProductionMythRow = {
  id: string;
  claim: string;
  verdict: string;
  /** The claim record this row exists to surface. */
  claimId: string;
  sourceIds: string[];
};

export type ProductionBlock =
  | { kind: "paragraph"; id: string; text: string; claimIds?: string[] }
  | { kind: "subhead"; id: string; text: string }
  | { kind: "pullquote"; id: string; text: string }
  | { kind: "facts"; id: string; caption: string; rows: ProductionFactRow[] }
  | { kind: "timeline"; id: string; caption: string; items: ProductionTimelineItem[] }
  | { kind: "myths"; id: string; caption: string; rows: ProductionMythRow[] };

export type ProductionSection = {
  id: string;
  number: number;
  eyebrow: string;
  heading: string;
  standfirst?: string;
  blocks: ProductionBlock[];
};

export type ProductionDossier = {
  id: string;
  kicker: string;
  title: string;
  standfirst: string;
  byline: {
    author: string;
    editorialRevision: string;
    draftedAt: string;
    reviewedAt?: string;
    signatureBasis?: "HUMAN" | "DELEGATED";
  };
  sections: ProductionSection[];
  closing?: { heading: string; text: string };
  claims: ProductionClaim[];
  sources: ProductionSource[];
};

export const PRODUCTION_SOURCE_MINIMUM = 50;
export const PRODUCTION_SECTION_MINIMUM = 6;
export const PRODUCTION_TERTIARY_MAX_SHARE = 0.6;
export const PRODUCTION_SECONDARY_MINIMUM = 20;

/** A production document may not borrow the article's measurement vocabulary. */
const TIMECODE = /(?<![\d:.])(\d{3,4}\.\d{3})(?![\d])/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isBlank(value: string | undefined): boolean {
  return typeof value !== "string" || value.trim() === "";
}

function isIsoDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/** `1991`, `1991-05`, `1991-05-14` — enough to order a production timeline. */
function isPartialDate(value: string): boolean {
  if (/^\d{4}$/.test(value)) return true;
  if (/^\d{4}-\d{2}$/.test(value)) {
    const month = Number(value.slice(5));
    return month >= 1 && month <= 12;
  }
  return isIsoDate(value);
}

function duplicates(values: string[]): string[] {
  const seen = new Set<string>();
  const found = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) found.add(value);
    seen.add(value);
  }
  return [...found];
}

function blockText(block: ProductionBlock): string {
  switch (block.kind) {
    case "paragraph":
    case "subhead":
    case "pullquote":
      return block.text;
    case "facts":
      return [block.caption, ...block.rows.flatMap((row) => [row.label, row.value])].join(" ");
    case "timeline":
      return [block.caption, ...block.items.map((item) => item.label)].join(" ");
    case "myths":
      return [block.caption, ...block.rows.flatMap((row) => [row.claim, row.verdict])].join(" ");
  }
}

/** Claim ids a block actually cites. */
function citedClaims(block: ProductionBlock): string[] {
  switch (block.kind) {
    case "paragraph":
      return block.claimIds ?? [];
    case "facts":
      return block.rows.flatMap((row) => row.claimIds ?? []);
    case "timeline":
      return block.items.flatMap((item) => item.claimIds ?? []);
    case "myths":
      return block.rows.map((row) => row.claimId);
    case "subhead":
    case "pullquote":
      return [];
  }
}

function citedSources(block: ProductionBlock): string[] {
  switch (block.kind) {
    case "facts":
      return block.rows.flatMap((row) => row.sourceIds);
    case "timeline":
      return block.items.flatMap((item) => item.sourceIds);
    case "myths":
      return block.rows.flatMap((row) => row.sourceIds);
    case "paragraph":
    case "subhead":
    case "pullquote":
      return [];
  }
}

export function validateProductionDossier(dossier: ProductionDossier): string[] {
  const errors: string[] = [];
  const path = dossier.id?.trim() ? dossier.id : "production-dossier";

  if (isBlank(dossier.id)) errors.push("production: id is required.");
  if (isBlank(dossier.kicker)) errors.push(`${path}: kicker is required.`);
  if (isBlank(dossier.title)) errors.push(`${path}: title is required.`);
  if (isBlank(dossier.standfirst)) errors.push(`${path}: standfirst is required.`);

  // Byline — same rule as the article: a signature states its own authority.
  if (isBlank(dossier.byline.author)) errors.push(`${path}/byline: author is required.`);
  if (isBlank(dossier.byline.editorialRevision)) {
    errors.push(`${path}/byline: editorialRevision is required.`);
  }
  if (!isIsoDate(dossier.byline.draftedAt)) {
    errors.push(`${path}/byline: draftedAt must be a valid YYYY-MM-DD date.`);
  }
  if (dossier.byline.reviewedAt !== undefined) {
    if (!isIsoDate(dossier.byline.reviewedAt)) {
      errors.push(`${path}/byline: reviewedAt must be a valid YYYY-MM-DD date.`);
    } else if (
      isIsoDate(dossier.byline.draftedAt) &&
      dossier.byline.reviewedAt < dossier.byline.draftedAt
    ) {
      errors.push(`${path}/byline: reviewedAt cannot precede draftedAt.`);
    }
    if (dossier.byline.signatureBasis === undefined) {
      errors.push(`${path}/byline: reviewedAt requires signatureBasis ("HUMAN" or "DELEGATED").`);
    }
  } else if (dossier.byline.signatureBasis !== undefined) {
    errors.push(`${path}/byline: signatureBasis is meaningless without reviewedAt.`);
  }

  // Sources.
  const sourceIds = new Set<string>();
  const urls = new Map<string, string>();
  for (const source of dossier.sources) {
    const sourcePath = `${path}/source/${source.id || "(blank)"}`;
    if (isBlank(source.id)) errors.push(`${path}: a source needs an id.`);
    if (sourceIds.has(source.id)) errors.push(`${sourcePath}: duplicate source id.`);
    sourceIds.add(source.id);
    if (isBlank(source.label)) errors.push(`${sourcePath}: label is required.`);
    if (isBlank(source.publisher)) errors.push(`${sourcePath}: publisher is required.`);
    if (isBlank(source.supports)) errors.push(`${sourcePath}: supports is required — say what it backs.`);
    if (!/^https:\/\/[^\s]+$/.test(source.url)) {
      errors.push(`${sourcePath}: url must be an absolute https URL without spaces.`);
    }
    if (urls.has(source.url)) {
      errors.push(`${sourcePath}: duplicate url, already listed as "${urls.get(source.url)}".`);
    }
    urls.set(source.url, source.id);
    if (!["PRIMARY", "SECONDARY", "TERTIARY"].includes(source.tier)) {
      errors.push(`${sourcePath}: unknown tier "${source.tier}".`);
    }
    if (!isIsoDate(source.checkedOn)) {
      errors.push(`${sourcePath}: checkedOn must be a valid YYYY-MM-DD date.`);
    }
    if (source.publishedAt !== undefined && !isIsoDate(source.publishedAt)) {
      errors.push(`${sourcePath}: publishedAt must be a valid YYYY-MM-DD date.`);
    }
  }

  if (dossier.sources.length < PRODUCTION_SOURCE_MINIMUM) {
    errors.push(
      `${path}: a dossier needs at least ${PRODUCTION_SOURCE_MINIMUM} sources; found ${dossier.sources.length}.`,
    );
  }
  const tierCount = { PRIMARY: 0, SECONDARY: 0, TERTIARY: 0 };
  for (const source of dossier.sources) {
    if (source.tier in tierCount) tierCount[source.tier as keyof typeof tierCount] += 1;
  }
  if (tierCount.PRIMARY + tierCount.SECONDARY < PRODUCTION_SECONDARY_MINIMUM) {
    errors.push(
      `${path}: needs at least ${PRODUCTION_SECONDARY_MINIMUM} primary or secondary sources; found ${tierCount.PRIMARY + tierCount.SECONDARY}.`,
    );
  }
  if (tierCount.PRIMARY < 3) {
    errors.push(`${path}: needs at least 3 primary sources; found ${tierCount.PRIMARY}.`);
  }
  if (dossier.sources.length > 0 && tierCount.TERTIARY / dossier.sources.length > PRODUCTION_TERTIARY_MAX_SHARE) {
    errors.push(
      `${path}: tertiary material is ${Math.round((tierCount.TERTIARY / dossier.sources.length) * 100)} % of the register; the ceiling is ${PRODUCTION_TERTIARY_MAX_SHARE * 100} %.`,
    );
  }

  // Claims.
  const claimIds = new Set<string>();
  const claimById = new Map<string, ProductionClaim>();
  for (const claim of dossier.claims) {
    const claimPath = `${path}/claim/${claim.id || "(blank)"}`;
    if (isBlank(claim.id)) errors.push(`${path}: a claim needs an id.`);
    if (claimIds.has(claim.id)) errors.push(`${claimPath}: duplicate claim id.`);
    claimIds.add(claim.id);
    claimById.set(claim.id, claim);
    if (isBlank(claim.text)) errors.push(`${claimPath}: text is required.`);
    if (!["CONFIRMED", "DISPUTED", "UNVERIFIED"].includes(claim.status)) {
      errors.push(`${claimPath}: unknown status "${claim.status}".`);
    }
    if (claim.sourceIds.length === 0) {
      errors.push(`${claimPath}: a claim needs at least one source.`);
    }
    for (const sourceId of claim.sourceIds) {
      if (!sourceIds.has(sourceId)) errors.push(`${claimPath}: unknown source id "${sourceId}".`);
    }
    if (TIMECODE.test(claim.text)) {
      errors.push(
        `${claimPath}: production claims may not carry a timecode — measured film facts belong to the evidence graph.`,
      );
    }
    if (claim.status === "CONFIRMED") {
      const backed = claim.sourceIds.some((sourceId) => {
        const source = dossier.sources.find((candidate) => candidate.id === sourceId);
        return source && source.tier !== "TERTIARY";
      });
      if (!backed) {
        errors.push(`${claimPath}: CONFIRMED needs at least one primary or secondary source.`);
      }
    }
  }
  for (const duplicate of duplicates(dossier.claims.map((claim) => claim.id))) {
    if (isBlank(duplicate)) continue;
    errors.push(`${path}/claim/${duplicate}: duplicate claim id.`);
  }

  // Sections.
  if (dossier.sections.length < PRODUCTION_SECTION_MINIMUM) {
    errors.push(
      `${path}: a dossier needs at least ${PRODUCTION_SECTION_MINIMUM} sections; found ${dossier.sections.length}.`,
    );
  }
  const blockIds: string[] = [];
  const usedClaimIds = new Set<string>();
  const usedSourceIds = new Set<string>();

  dossier.sections.forEach((section, index) => {
    const sectionPath = `${path}/${section.id || "(blank)"}`;
    if (isBlank(section.id)) errors.push(`${path}: section ${index + 1} has no id.`);
    if (isBlank(section.eyebrow)) errors.push(`${sectionPath}: eyebrow is required.`);
    if (isBlank(section.heading)) errors.push(`${sectionPath}: heading is required.`);
    if (section.number !== index + 1) {
      errors.push(`${sectionPath}: sections are numbered 1..n in reading order; found ${section.number} at position ${index + 1}.`);
    }
    if (section.blocks.length === 0) errors.push(`${sectionPath}: a section needs at least one block.`);

    for (const block of section.blocks) {
      const blockPath = `${sectionPath}/${block.id || "(blank)"}`;
      if (isBlank(block.id)) errors.push(`${sectionPath}: a block has no id.`);
      blockIds.push(block.id);
      const prose = blockText(block);
      if (isBlank(prose)) errors.push(`${blockPath}: block text is required.`);
      if (TIMECODE.test(prose)) {
        errors.push(`${blockPath}: prose may not contain a timecode; link to the analysis instead.`);
      }
      for (const claimId of citedClaims(block)) {
        usedClaimIds.add(claimId);
        if (!claimIds.has(claimId)) errors.push(`${blockPath}: unknown claim id "${claimId}".`);
      }
      for (const sourceId of citedSources(block)) {
        usedSourceIds.add(sourceId);
        if (!sourceIds.has(sourceId)) errors.push(`${blockPath}: unknown source id "${sourceId}".`);
      }
      if (block.kind === "facts") {
        if (block.rows.length === 0) errors.push(`${blockPath}: a facts block needs rows.`);
        for (const row of block.rows) {
          if (isBlank(row.label)) errors.push(`${blockPath}/${row.id}: label is required.`);
          if (isBlank(row.value)) errors.push(`${blockPath}/${row.id}: value is required.`);
          if (row.sourceIds.length === 0) {
            errors.push(`${blockPath}/${row.id}: a number without a source is a rumour.`);
          }
        }
      }
      if (block.kind === "timeline") {
        const items = block.items;
        if (items.length < 2) errors.push(`${blockPath}: a timeline needs at least two points.`);
        let previous = "";
        for (const item of items) {
          if (!isPartialDate(item.date)) {
            errors.push(`${blockPath}/${item.id}: date must be YYYY, YYYY-MM or YYYY-MM-DD.`);
          } else if (previous && item.date < previous) {
            errors.push(`${blockPath}/${item.id}: timeline runs backwards (${item.date} after ${previous}).`);
          }
          previous = item.date;
          if (isBlank(item.label)) errors.push(`${blockPath}/${item.id}: label is required.`);
          if (item.sourceIds.length === 0) {
            errors.push(`${blockPath}/${item.id}: a date without a source is a guess.`);
          }
        }
      }
      if (block.kind === "myths") {
        for (const row of block.rows) {
          if (isBlank(row.claim)) errors.push(`${blockPath}/${row.id}: claim text is required.`);
          if (isBlank(row.verdict)) errors.push(`${blockPath}/${row.id}: verdict is required.`);
          if (row.sourceIds.length === 0) errors.push(`${blockPath}/${row.id}: a myth needs evidence of the myth.`);
          const claim = claimById.get(row.claimId);
          if (!claim) {
            errors.push(`${blockPath}/${row.id}: unknown claim id "${row.claimId}".`);
          } else if (claim.status === "CONFIRMED") {
            errors.push(
              `${blockPath}/${row.id}: "${row.claimId}" is CONFIRMED — a settled claim does not belong in the myth register.`,
            );
          }
        }
      }
    }
  });

  for (const duplicate of duplicates(blockIds)) {
    if (isBlank(duplicate)) continue;
    errors.push(`${path}: duplicate block id "${duplicate}".`);
  }

  // No dead weight in either direction.
  for (const claim of dossier.claims) {
    if (!usedClaimIds.has(claim.id)) {
      errors.push(`${path}/claim/${claim.id}: no block cites this claim.`);
    }
  }
  for (const source of dossier.sources) {
    const citedByClaim = dossier.claims.some((claim) => claim.sourceIds.includes(source.id));
    if (!citedByClaim) {
      errors.push(`${path}/source/${source.id}: no claim uses this source.`);
    }
    if (!usedSourceIds.has(source.id) && !citedByClaim) {
      errors.push(`${path}/source/${source.id}: unused.`);
    }
  }

  // Every disputed or unverified claim is visible to the reader.
  const mythClaims = new Set<string>();
  for (const section of dossier.sections) {
    for (const block of section.blocks) {
      if (block.kind === "myths") {
        for (const row of block.rows) mythClaims.add(row.claimId);
      }
    }
  }
  for (const claim of dossier.claims) {
    if (claim.status !== "CONFIRMED" && !mythClaims.has(claim.id)) {
      errors.push(
        `${path}/claim/${claim.id}: status ${claim.status} must be surfaced in a myths block — the reader has to see it.`,
      );
    }
  }

  return errors;
}

export function assertValidProductionDossier(dossier: ProductionDossier): void {
  const errors = validateProductionDossier(dossier);
  if (errors.length > 0) {
    throw new Error(`Invalid production dossier:\n${errors.join("\n")}`);
  }
}

/** Registry check: ids and slugs are unique, and every dossier validates. */
export function validateProductionDossierRegistry(
  entries: Array<{ slug: string; dossier: ProductionDossier }>,
): string[] {
  const errors: string[] = [];
  const slugs = new Set<string>();
  const ids = new Set<string>();
  for (const entry of entries) {
    if (isBlank(entry.slug)) errors.push("production registry: an entry has no film slug.");
    if (slugs.has(entry.slug)) errors.push(`production registry: duplicate slug "${entry.slug}".`);
    slugs.add(entry.slug);
    if (ids.has(entry.dossier.id)) {
      errors.push(`production registry: duplicate dossier id "${entry.dossier.id}".`);
    }
    ids.add(entry.dossier.id);
    errors.push(...validateProductionDossier(entry.dossier));
  }
  return errors;
}
