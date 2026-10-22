/**
 * Batch 3 tooling: preview of future VERIFIED scenes for TRANSCRIPT-anchored candidates.
 * Does NOT mutate FilmPackage. Produces docs/48-PREVIEW-TRANSCRIPT-MIGRATION.md
 * for editorial review.
 *
 * Usage: node scripts/prepare-canonical-migration.mjs
 * Requires: npm run build (to validate integrity) — but script itself is standalone.
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";

const root = resolve(dirname(new URL(import.meta.url).pathname), "..");

function loadTsModule(path) {
  // Minimal TS extraction via regex — we avoid full TS compilation here.
  // For honest preview we parse candidate TS files as text.
  return readFileSync(resolve(root, path), "utf8");
}

const rewriteSrc = loadTsModule("src/data/films/the-truman-show-evidence-rewrite.ts");
const segmentationSrc = loadTsModule("src/data/films/the-truman-show-master-segmentation.ts");

console.log("=== Batch 3: transcript-anchored preview ===");

// Count transcript-only candidates
const transcriptOnlyMatches = [...rewriteSrc.matchAll(/verification:\s*\"TRANSCRIPT_ONLY\"/g)];
console.log(`Found ${transcriptOnlyMatches.length} TRANSCRIPT_ONLY rewrite candidates (expected 9)`);
if (transcriptOnlyMatches.length !== 9) {
  console.warn("⚠️  Count mismatch — docs/44 says 9 TRANSCRIPT_ONLY");
}

// Extract chapter map
const chapterBlocks = [...segmentationSrc.matchAll(/\{\s*id:\s*\"(truman-ch-\d+)\"[\s\S]*?startTimestampSeconds:\s*([\d.]+)[\s\S]*?endTimestampSeconds:\s*([\d.]+)/g)];
const chapters = chapterBlocks.map(m => ({ id: m[1], start: Number(m[2]), end: Number(m[3]) }));
console.log(`Found ${chapters.length} chapters (expected 24)`);
const contiguous = chapters.every((c, i) => i===0 || Math.abs(c.start - chapters[i-1].end) < 0.001);
console.log(`Chapters contiguous: ${contiguous ? "✓" : "⚠️  GAP"}`);

// Preview output
const outLines = [];
outLines.push("# Batch 3 — Preview: TRANSCRIPT-anchored migration (no VISUAL)");
outLines.push("");
outLines.push("> Статус: **preview, не мутация FilmPackage**. Сгенерирован скриптом `scripts/prepare-canonical-migration.mjs`.");
outLines.push(`> Дата: ${new Date().toISOString().slice(0,10)} · Master: SHA-256 \`E8543F61…\` · Chapters: ${chapters.length} · TRANSCRIPT_ONLY: ${transcriptOnlyMatches.length}`);
outLines.push("");
outLines.push("## Что это и что не это");
outLines.push("");
outLines.push("- ✅ Это — проверочный артефакт: какие будущие VERIFIED сцены можно построить **только** из subtitle-anchors без просмотра картинки.");
outLines.push("- ❌ Это — не публикация. VISUAL_ONLY и MIXED остаются `VISUAL_REVIEW_REQUIRED`.");
outLines.push("- ❌ Не меняет `the-truman-show.ts` (`MASTER_IDENTIFIED + SECONDARY_SOURCES` сохранён).");
outLines.push("");
outLines.push("## Кандидаты TRANSCRIPT_ONLY (9)");
outLines.push("");
outLines.push("| evidenceId | chapter | anchor | candidateObservation |");
outLines.push("|---|---|---|---|");

// Extract rewrite candidates (robust: split by evidenceId blocks)
const rawBlocks = rewriteSrc.split(/evidenceId:\s*\"/).slice(1);
let transcriptCount = 0;
for (const block of rawBlocks) {
  const id = block.split('"')[0];
  const verMatch = block.match(/verification:\s*\"([^\"]+)\"/);
  const ver = verMatch?.[1];
  if (ver !== "TRANSCRIPT_ONLY") continue;
  transcriptCount++;
  const chapRawMatch = block.match(/chapterIds:\s*\[([^\]]*)\]/);
  const chapRaw = chapRawMatch?.[1] ?? "";
  const tsMatch = block.match(/anchorTimestampSeconds:\s*([\d.]+)/);
  const ts = tsMatch?.[1] ?? "?";
  const obsMatch = block.match(/candidateObservation:\s*\"([^\"]*)\"/);
  const obs = obsMatch?.[1] ?? "—";
  const chap = chapRaw.match(/\"(truman-ch-\d+)\"/)?.[1] ?? "?";
  outLines.push(`| \`${id}\` | \`${chap}\` | \`${ts}\` | ${obs} |`);
}
if (transcriptCount !== transcriptOnlyMatches.length) {
  outLines.push(`| | | | ⚠️ mismatch: regex found ${transcriptOnlyMatches.length} but block parse found ${transcriptCount} |`);
}

outLines.push("");
outLines.push("## Дополнительно: TRANSCRIPT-заземлённые замены из волн миграции");
outLines.push("");
outLines.push("Волны 1-3 содержат смешанные замены; часть из них — TRANSCRIPT-anchored и потому тоже может быть preview без VISUAL:");
outLines.push("");

const migSrcSingle = loadTsModule("src/data/films/the-truman-show-evidence-migration.ts");
const replBlocks = migSrcSingle.split(/replacements:\s*\[/).slice(1).join("\n").split(/\{\s*id:\s*\"/).slice(1);
let transcriptReplacements = [];
for (const block of replBlocks) {
  const id = block.split('"')[0];
  if (!id.startsWith("truman-ev-")) continue;
  const groundMatch = block.match(/grounding:\s*\"([^\"]+)\"/);
  const ground = groundMatch?.[1];
  if (ground !== "TRANSCRIPT") continue;
  const chapRawMatch = block.match(/chapterIds:\s*\[([^\]]*)\]/);
  const chapRaw = chapRawMatch?.[1] ?? "";
  const tsMatch = block.match(/anchorTimestampSeconds:\s*([\d.]+)/);
  const ts = tsMatch?.[1];
  if (!ts) continue; // TRANSCRIPT must have anchor
  transcriptReplacements.push({ id, chapRaw, ts });
}
outLines.push(`| replacementId | chapter | anchor | note |`);
outLines.push(`|---|---|---|---|`);
for (const r of transcriptReplacements) {
  const chap = r.chapRaw.match(/\"(truman-ch-\d+)\"/)?.[1] ?? "?";
  outLines.push(`| \`${r.id}\` | \`${chap}\` | \`${r.ts}\` | TRANSCRIPT |`);
}
outLines.push("");
outLines.push(`Всего TRANSCRIPT-заземлённых замен в волнах: **${transcriptReplacements.length}**`);
outLines.push("");
outLines.push("## Следующий ручной шаг (Batch 4, нельзя автоматизировать)");
outLines.push("");
outLines.push("- Просмотр BDRip по `docs/38-VIEWING-MASTER-INTAKE`.");
outLines.push("- Для каждой `VISUAL_REVIEW_REQUIRED` — picture-fact + staging → новый atomic ID.");
outLines.push("- Пересборка `15 DRAFT (30–4680s)` → `N VERIFIED` с точными `start/endTimestampSeconds`.");
outLines.push("- Атомарный переход `MASTER_IDENTIFIED + SECONDARY_SOURCES` → `LOCKED`.");
outLines.push("");

const outPath = resolve(root, "docs/48-PREVIEW-TRANSCRIPT-MIGRATION.md");
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, outLines.join("\n"), "utf8");
console.log(`✓ Wrote ${outPath}`);
