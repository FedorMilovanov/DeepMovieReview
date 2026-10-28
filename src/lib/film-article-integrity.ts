import type {
  ArticleBlock,
  ArticleCorrectionRow,
  ArticleMeasurementRef,
  ArticleSection,
  ClaimSupport,
  EvidenceRecord,
  FilmEditionLock,
  FilmSceneRecord,
  FilmArticle,
} from "@/lib/film-package";
import { canRevealSpoiler, type SpoilerLevel } from "./spoilers";

/**
 * Article integrity.
 *
 * The article is prose, and prose is where a film site usually starts lying.
 * These rules exist so the readable layer cannot drift away from the locked
 * edition:
 *
 *   1. an article may only exist for a LOCKED edition, and it must name that
 *      edition's source id and measured runtime;
 *   2. every timestamp in the article is a `timeline` item whose number is
 *      *identical* to the cited evidence record's number — prose may not carry
 *      a timecode at all;
 *   3. every measured number is a `measurement` / `measurement-table` reference
 *      into the committed dataset — prose may not carry a number the master
 *      measured;
 *   4. every correction cites either evidence, a measurement, or an explicit
 *      `absentFromMaster` declaration;
 *   5. spoiler levels are monotone across sections, so the reader's level hides
 *      a suffix of the article instead of punching holes in it;
 *   6. a published article needs a human signature the build cannot supply.
 */

const PROSE_MAX_LENGTH = 1200;
const PROSE_MIN_TOTAL = 2000;
const PROSE_MAX_TOTAL = 60000;
const SECTION_MIN = 3;
const SECTION_MAX = 14;
const BLOCK_MIN = 1;
const BLOCK_MAX = 30;

const ISO_CALENDAR_DATE = /^\d{4}-\d{2}-\d{2}$/;
/** "12:34" / "123:45" — a clock reading, which belongs to a timeline block. */
const CLOCK_READING = /(?<![\d:])\d{1,3}:\d{2}(?![\d:])/;

const proseKinds = new Set(["paragraph", "subhead", "pullquote"]);

function isBlank(value: string | undefined | null): boolean {
  return !value || value.trim().length === 0;
}

function isIsoCalendarDate(value: string | undefined): boolean {
  const normalized = value?.trim();
  if (!normalized || !ISO_CALENDAR_DATE.test(normalized)) return false;
  const [year, month, day] = normalized.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
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

function blockIds(section: ArticleSection): string[] {
  const ids: string[] = [];
  for (const block of section.blocks) {
    ids.push(block.id);
    if (block.kind === "timeline") ids.push(...block.items.map((item) => item.id));
    if (block.kind === "measurement-table") ids.push(...block.rows.map((row) => row.id));
    if (block.kind === "corrections") ids.push(...block.rows.map((row) => row.id));
  }
  return ids;
}

function blockText(block: ArticleBlock): string {
  switch (block.kind) {
    case "paragraph":
    case "subhead":
    case "pullquote":
    case "measurement":
      return block.text;
    case "timeline":
      return block.items.map((item) => item.label).join(" ");
    case "measurement-table":
      return block.caption;
    case "corrections":
      return block.caption;
  }
}

export type ArticleIntegrityContext = {
  evidenceById: Map<string, EvidenceRecord>;
  sceneById: Map<string, FilmSceneRecord>;
  edition?: FilmEditionLock;
  /** A real film (not a fixture): claims need canonical evidence. */
  realFilm: boolean;
  published: boolean;
  /** `editorialRevision` of the package's sources-method module, when present. */
  editorialRevision?: string;
  /** Resolves a measurement reference against the committed dataset. */
  resolveMeasurement?: (ref: ArticleMeasurementRef) => boolean;
  /** Spoiler level of every module in the package, keyed by module id. */
  moduleLevels?: Map<string, SpoilerLevel>;
  /**
   * Digit strings the master measured (1019, 6177.792, 124.75 …). Prose may not
   * contain any of them: measured numbers are rendered from the dataset so they
   * cannot drift.
   */
  measuredValues?: string[];
};

function checkSupport(
  support: ClaimSupport | undefined,
  path: string,
  level: SpoilerLevel,
  context: ArticleIntegrityContext,
  errors: string[],
  required: boolean,
) {
  if (!support) {
    if (required) errors.push(`${path}: real-film article claims require canonical evidence support.`);
    return;
  }
  if (support.evidenceIds.length === 0) {
    errors.push(`${path}: evidenceIds must not be empty.`);
    return;
  }
  const refs = [...support.evidenceIds, ...(support.counterevidenceIds ?? [])];
  for (const id of duplicates(refs)) errors.push(`${path}: duplicate evidence reference "${id}".`);
  for (const id of refs) {
    const evidence = context.evidenceById.get(id);
    if (!evidence) {
      errors.push(`${path}: unknown evidence id "${id}".`);
      continue;
    }
    if (context.realFilm && !canRevealSpoiler(level, evidence.spoilerLevel)) {
      errors.push(
        `${path}: support evidence "${id}" spoiler level "${evidence.spoilerLevel}" exceeds section level "${level}".`,
      );
    }
  }
}

function checkMeasurementRef(
  ref: ArticleMeasurementRef,
  path: string,
  context: ArticleIntegrityContext,
  errors: string[],
) {
  if (isBlank(ref.id)) {
    errors.push(`${path}: measurement id is required.`);
    return;
  }
  if (!context.resolveMeasurement) {
    errors.push(`${path}: article measurements require a measurement dataset to resolve against.`);
    return;
  }
  if (!context.resolveMeasurement(ref)) {
    errors.push(`${path}: unknown ${ref.table} measurement "${ref.id}".`);
  }
}

function checkProse(
  text: string,
  path: string,
  context: ArticleIntegrityContext,
  errors: string[],
  scriptureRefs: string[] = [],
) {
  if (isBlank(text)) {
    errors.push(`${path}: text is required.`);
    return;
  }
  if (text.length > PROSE_MAX_LENGTH) {
    errors.push(`${path}: prose exceeds ${PROSE_MAX_LENGTH} characters; split it into paragraphs.`);
  }
  let withoutScripture = text;
  for (const ref of scriptureRefs) {
    if (!text.includes(ref)) {
      errors.push(`${path}: declared Scripture reference "${ref}" does not appear in the text.`);
      continue;
    }
    withoutScripture = withoutScripture.split(ref).join(" ");
  }
  const clock = withoutScripture.match(CLOCK_READING);
  if (clock) {
    errors.push(
      `${path}: prose contains the clock reading "${clock[0]}"; timecodes belong to a timeline block that cites evidence.`,
    );
  }
  for (const value of context.measuredValues ?? []) {
    const pattern = new RegExp(`(?<![\\d.,])${value.replace(/[.]/g, "\\.")}(?![\\d])`);
    if (pattern.test(text)) {
      errors.push(
        `${path}: prose contains the measured value "${value}"; measured numbers are rendered from the dataset, not typed into prose.`,
      );
    }
  }
}

function checkCorrectionRow(
  row: ArticleCorrectionRow,
  path: string,
  context: ArticleIntegrityContext,
  errors: string[],
) {
  if (isBlank(row.commonClaim)) errors.push(`${path}: commonClaim is required.`);
  if (isBlank(row.onScreen)) errors.push(`${path}: onScreen is required.`);
  const cited = [
    row.evidenceId ? "evidence" : null,
    row.measurement ? "measurement" : null,
    row.absentFromMaster ? "absent" : null,
  ].filter(Boolean);
  if (cited.length === 0) {
    errors.push(`${path}: a correction must cite evidence, a measurement, or declare absentFromMaster.`);
    return;
  }
  if (row.absentFromMaster && cited.length > 1) {
    errors.push(`${path}: a correction for an absent beat cannot also cite evidence or a measurement.`);
  }
  if (row.evidenceId) {
    if (!context.evidenceById.has(row.evidenceId)) {
      errors.push(`${path}: unknown evidence id "${row.evidenceId}".`);
    }
  }
  if (row.measurement) checkMeasurementRef(row.measurement, `${path}/measurement`, context, errors);
}

function checkBlock(
  block: ArticleBlock,
  sectionLevel: SpoilerLevel,
  path: string,
  context: ArticleIntegrityContext,
  errors: string[],
) {
  if (proseKinds.has(block.kind)) {
    checkProse(
      blockText(block),
      path,
      context,
      errors,
      block.kind === "paragraph" ? block.scriptureRefs : undefined,
    );
    checkSupport(
      "support" in block ? block.support : undefined,
      path,
      sectionLevel,
      context,
      errors,
      false,
    );
    return;
  }

  switch (block.kind) {
    case "timeline": {
      if (block.items.length === 0) errors.push(`${path}: a timeline needs at least one item.`);
      for (const item of block.items) {
        const itemPath = `${path}/${item.id}`;
        if (isBlank(item.label)) errors.push(`${itemPath}: label is required.`);
        const evidence = context.evidenceById.get(item.evidenceId);
        if (!evidence) {
          errors.push(`${itemPath}: unknown evidence id "${item.evidenceId}".`);
          continue;
        }
        if (evidence.timestampSeconds !== item.timestampSeconds) {
          errors.push(
            `${itemPath}: timestamp ${item.timestampSeconds}s does not match evidence "${item.evidenceId}" at ${String(evidence.timestampSeconds)}s.`,
          );
        }
        const scene = evidence.sceneId ? context.sceneById.get(evidence.sceneId) : undefined;
        if (!scene) {
          errors.push(`${itemPath}: evidence "${item.evidenceId}" has no verified scene.`);
        } else if (scene.verificationState !== "VERIFIED") {
          errors.push(`${itemPath}: evidence "${item.evidenceId}" belongs to unverified scene "${scene.id}".`);
        }
        if (context.realFilm && !canRevealSpoiler(sectionLevel, evidence.spoilerLevel)) {
          errors.push(
            `${itemPath}: evidence "${item.evidenceId}" spoiler level "${evidence.spoilerLevel}" exceeds section level "${sectionLevel}".`,
          );
        }
      }
      if (duplicates(block.items.map((item) => item.evidenceId)).length > 0) {
        errors.push(`${path}: duplicate timeline evidence reference.`);
      }
      return;
    }
    case "measurement": {
      checkMeasurementRef(block.measurement, `${path}/measurement`, context, errors);
      checkProse(block.text, `${path}/text`, context, errors);
      checkSupport(block.support, path, sectionLevel, context, errors, false);
      return;
    }
    case "measurement-table": {
      if (isBlank(block.caption)) errors.push(`${path}: caption is required.`);
      if (block.rows.length === 0) errors.push(`${path}: a measurement table needs at least one row.`);
      for (const row of block.rows) {
        const rowPath = `${path}/${row.id}`;
        if (isBlank(row.label)) errors.push(`${rowPath}: label is required.`);
        checkMeasurementRef(row.measurement, `${rowPath}/measurement`, context, errors);
      }
      return;
    }
    case "corrections": {
      if (isBlank(block.caption)) errors.push(`${path}: caption is required.`);
      if (block.rows.length === 0) errors.push(`${path}: a corrections block needs at least one row.`);
      for (const row of block.rows) {
        checkCorrectionRow(row, `${path}/${row.id}`, context, errors);
      }
      return;
    }
  }
}

export function validateFilmArticle(
  article: FilmArticle | undefined,
  context: ArticleIntegrityContext,
): string[] {
  if (!article) return [];
  const errors: string[] = [];
  const path = "article";

  if (isBlank(article.id)) errors.push(`${path}: id is required.`);
  if (isBlank(article.kicker)) errors.push(`${path}: kicker is required.`);
  if (isBlank(article.title)) errors.push(`${path}: title is required.`);
  if (isBlank(article.standfirst)) errors.push(`${path}: standfirst is required.`);

  // 1. Edition binding. An article is a reading of one measured file.
  const edition = context.edition;
  if (!edition) {
    errors.push(`${path}: an article requires a declared edition.`);
  } else if (edition.state !== "LOCKED") {
    errors.push(`${path}: an article requires a LOCKED edition; found "${edition.state}".`);
  } else {
    if (article.edition.sourceId !== edition.sourceId) {
      errors.push(
        `${path}/edition: source id "${article.edition.sourceId}" does not match the locked source "${edition.sourceId}".`,
      );
    }
    if (article.edition.measuredRuntimeSeconds !== edition.measuredRuntimeSeconds) {
      errors.push(
        `${path}/edition: measured runtime ${article.edition.measuredRuntimeSeconds}s does not match the locked master's ${edition.measuredRuntimeSeconds}s.`,
      );
    }
  }

  // 2. Byline.
  if (isBlank(article.byline.author)) errors.push(`${path}/byline: author is required.`);
  if (isBlank(article.byline.editorialRevision)) {
    errors.push(`${path}/byline: editorialRevision is required.`);
  } else if (context.editorialRevision && article.byline.editorialRevision !== context.editorialRevision) {
    errors.push(
      `${path}/byline: editorialRevision "${article.byline.editorialRevision}" does not match the sources-method revision "${context.editorialRevision}".`,
    );
  }
  if (!isIsoCalendarDate(article.byline.draftedAt)) {
    errors.push(`${path}/byline: draftedAt must be a valid YYYY-MM-DD date.`);
  }
  if (article.byline.reviewedAt !== undefined) {
    if (!isIsoCalendarDate(article.byline.reviewedAt)) {
      errors.push(`${path}/byline: reviewedAt must be a valid YYYY-MM-DD date.`);
    } else if (
      isIsoCalendarDate(article.byline.draftedAt) &&
      article.byline.reviewedAt < article.byline.draftedAt
    ) {
      errors.push(`${path}/byline: reviewedAt cannot precede draftedAt.`);
    }
  }
  // A signature is a claim about an editorial act, so it has to say on whose
  // authority it was issued. A date with no basis is an unsigned text wearing a
  // date; a basis with no date is a promise.
  if (article.byline.reviewedAt !== undefined && article.byline.signatureBasis === undefined) {
    errors.push(`${path}/byline: reviewedAt requires signatureBasis ("HUMAN" or "DELEGATED").`);
  }
  if (article.byline.signatureBasis !== undefined && article.byline.reviewedAt === undefined) {
    errors.push(`${path}/byline: signatureBasis is meaningless without reviewedAt.`);
  }
  if (context.published && article.byline.reviewedAt === undefined) {
    errors.push(
      `${path}/byline: a published article requires an editorial signature (reviewedAt).`,
    );
  }

  // 3. Sections.
  if (article.sections.length < SECTION_MIN) {
    errors.push(`${path}: an article needs at least ${SECTION_MIN} sections.`);
  }
  if (article.sections.length > SECTION_MAX) {
    errors.push(`${path}: an article may not exceed ${SECTION_MAX} sections.`);
  }
  const numbers = article.sections.map((section) => section.number);
  for (const duplicate of duplicates(numbers.map(String))) {
    errors.push(`${path}: duplicate section number ${duplicate}.`);
  }
  article.sections.forEach((section, index) => {
    if (section.number !== index + 1) {
      errors.push(`${path}/${section.id}: section numbers must run 1..n in reading order; found ${section.number} at position ${index + 1}.`);
    }
    if (index > 0 && article.sections[index - 1].spoilerLevel !== section.spoilerLevel) {
      const previous = article.sections[index - 1].spoilerLevel;
      if (!canRevealSpoiler(section.spoilerLevel, previous)) {
        errors.push(
          `${path}/${section.id}: spoiler level "${section.spoilerLevel}" may not drop below the previous section's "${previous}"; gating hides a suffix.`,
        );
      }
    }
  });

  const allIds = [...article.sections.map((section) => section.id), ...article.sections.flatMap(blockIds)];
  for (const duplicate of duplicates(allIds)) {
    errors.push(`${path}: duplicate article id "${duplicate}".`);
  }

  let proseLength = 0;
  for (const section of article.sections) {
    const sectionPath = `${path}/${section.id}`;
    if (isBlank(section.eyebrow)) errors.push(`${sectionPath}: eyebrow is required.`);
    if (isBlank(section.heading)) errors.push(`${sectionPath}: heading is required.`);
    if (section.blocks.length < BLOCK_MIN) errors.push(`${sectionPath}: a section needs at least one block.`);
    if (section.blocks.length > BLOCK_MAX) errors.push(`${sectionPath}: too many blocks (${section.blocks.length}).`);

    checkSupport(section.support, `${sectionPath}/support`, section.spoilerLevel, context, errors, false);

    // A section may point at the modules it reads alongside — but only at ones
    // the reader can open without being sent to a higher spoiler level.
    if (section.moduleIds !== undefined) {
      if (section.moduleIds.length === 0) {
        errors.push(`${sectionPath}: moduleIds must name at least one module when present.`);
      }
      const linked = new Set<string>();
      for (const moduleId of section.moduleIds) {
        if (isBlank(moduleId)) {
          errors.push(`${sectionPath}: moduleIds must not contain a blank id.`);
          continue;
        }
        if (linked.has(moduleId)) {
          errors.push(`${sectionPath}: module "${moduleId}" is linked twice.`);
          continue;
        }
        linked.add(moduleId);
        if (!context.moduleLevels) {
          errors.push(`${sectionPath}: module links require the package's module levels to resolve against.`);
          continue;
        }
        const moduleLevel = context.moduleLevels.get(moduleId);
        if (moduleLevel === undefined) {
          errors.push(`${sectionPath}: unknown module id "${moduleId}".`);
        } else if (!canRevealSpoiler(section.spoilerLevel, moduleLevel)) {
          errors.push(
            `${sectionPath}: module "${moduleId}" needs spoiler level "${moduleLevel}", above the section's "${section.spoilerLevel}".`,
          );
        }
      }
    }

    let supported = Boolean(section.support);
    for (const block of section.blocks) {
      if ("support" in block && block.support) supported = true;
      if (block.kind === "timeline" || block.kind === "corrections") supported = true;
      checkBlock(block, section.spoilerLevel, `${sectionPath}/${block.id}`, context, errors);
      if (proseKinds.has(block.kind)) proseLength += blockText(block).length;
    }

    if (context.realFilm && !supported) {
      errors.push(
        `${sectionPath}: a real-film section needs at least one evidence-supported claim, timeline or correction.`,
      );
    }
  }

  if (article.closing) {
    checkProse(article.closing.text, `${path}/closing/text`, context, errors);
    if (isBlank(article.closing.heading)) errors.push(`${path}/closing: heading is required.`);
    checkSupport(
      article.closing.support,
      `${path}/closing`,
      article.sections.at(-1)?.spoilerLevel ?? "NONE",
      context,
      errors,
      false,
    );
    proseLength += article.closing.text.length;
  }

  if (context.published && proseLength < PROSE_MIN_TOTAL) {
    errors.push(`${path}: a published article needs at least ${PROSE_MIN_TOTAL} characters of prose; found ${proseLength}.`);
  }
  if (proseLength > PROSE_MAX_TOTAL) {
    errors.push(`${path}: prose exceeds ${PROSE_MAX_TOTAL} characters.`);
  }

  return errors;
}
