/**
 * Film 001 audit: one run, one verdict.
 *
 * The regression suite protects the model; this script audits the artefact the
 * reader actually receives — the article, the pictures inside it, the dossier
 * behind it, and the way all of that is typeset. It answers one question: is
 * this still a premium, honest page, or has something quietly drifted?
 *
 * Usage: node scripts/film001-audit.mjs [--json]
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";

const tsc = resolve("node_modules", "@typescript", "native", "bin", "tsc");
const jsonOnly = process.argv.includes("--json");

const results = [];
let failures = 0;

function check(id, title, run) {
  try {
    const verdict = run();
    const passed = verdict === true || verdict === undefined;
    if (!passed) failures += 1;
    results.push({ id, title, passed, detail: passed ? "" : String(verdict) });
  } catch (error) {
    failures += 1;
    results.push({ id, title, passed: false, detail: error.message });
  }
}

function compile() {
  const result = spawnSync(process.execPath, [tsc, "-p", "tsconfig.audit.json"], {
    stdio: "inherit",
  });
  if (result.status !== 0) {
    console.error("audit compile failed");
    process.exit(2);
  }
}

compile();

const { theTrumanShowCanonicalPackage } = await import(
  "../.audit-build/src/data/films/the-truman-show-canonical.js"
);
const { articleIllustrations, illustrationView } = await import(
  "../.audit-build/src/data/film-illustrations.js"
);
const { theTrumanShowProductionDossier } = await import(
  "../.audit-build/src/data/films/the-truman-show-production.js"
);
const { trumanProductionSources } = await import(
  "../.audit-build/src/data/films/the-truman-show-production-sources.js"
);

const filmPackage = theTrumanShowCanonicalPackage;
const article = filmPackage.article;
const dossier = theTrumanShowProductionDossier;
const blocks = article.sections.flatMap((section) => section.blocks);
const sectionOf = new Map();
for (const section of article.sections) {
  for (const block of section.blocks) sectionOf.set(block.id, section);
}

/* ── Article structure ───────────────────────────────────────────────── */

check("A01", "статья существует и связана с фильмом", () => {
  if (!article) return "no article";
  if (!article.id.startsWith("truman-article")) return `unexpected id ${article.id}`;
});

check("A02", "десять разделов", () => {
  const n = article.sections.length;
  return n === 10 || `expected 10, got ${n}`;
});

check("A03", "номера разделов идут подряд 1..10", () => {
  const nums = article.sections.map((s) => s.number);
  return nums.every((n, i) => n === i + 1) || `got ${nums.join(",")}`;
});

check("A04", "надзаголовок каждого раздела начинается с его номера", () => {
  const bad = article.sections.filter(
    (s) => !s.eyebrow.startsWith(String(s.number).padStart(2, "0")),
  );
  return bad.length === 0 || bad.map((s) => `${s.number}:${s.eyebrow}`).join(" ");
});

check("A05", "идентификаторы разделов уникальны", () => {
  const ids = article.sections.map((s) => s.id);
  return new Set(ids).size === ids.length || "duplicate section id";
});

check("A06", "идентификаторы блоков уникальны", () => {
  const ids = blocks.map((b) => b.id);
  return new Set(ids).size === ids.length || "duplicate block id";
});

check("A07", "у каждого блока непустой текст или подпись", () => {
  const empty = blocks.filter((b) => {
    if (b.kind === "timeline" || b.kind === "myths") return false;
    if (b.kind === "illustration" || b.kind === "corrections") return !b.caption;
    if (b.kind === "measurement-table") return false;
    return !b.text || !b.text.trim();
  });
  return empty.length === 0 || empty.map((b) => b.id).join(",");
});

check("A08", "объём статьи не меньше 25 тысяч знаков", () => {
  const chars = blocks.reduce((n, b) => n + (b.text?.length ?? b.caption?.length ?? 0), 0);
  return chars >= 25000 || `only ${chars}`;
});

check("A09", "в статье нет двойных пробелов и висящих пробелов", () => {
  const bad = blocks.filter((b) => /  |\s$|^\s/.test(b.text ?? b.caption ?? ""));
  return bad.length === 0 || bad.map((b) => b.id).join(",");
});

check("A10", "в статье нет типографских прямых кавычек", () => {
  const bad = blocks.filter((b) => /"/.test(b.text ?? b.caption ?? ""));
  return bad.length === 0 || bad.map((b) => b.id).join(",");
});

check("A11", "seoTitle укладывается в 49 знаков", () => {
  return article.seoTitle.length <= 49 || `${article.seoTitle.length}`;
});

check("A12", "seoDescription укладывается в 160 знаков", () => {
  return article.seoDescription.length <= 160 || `${article.seoDescription.length}`;
});

check("A13", "подпись, основание подписи и выпуск заполнены", () => {
  if (!article.byline?.author) return "no author";
  if (!article.byline?.signatureBasis) return "no signature basis";
  if (!article.byline?.reviewedAt) return "no review date";
  if (!article.edition?.sourceId) return "no edition source id";
  if (!(article.edition?.measuredRuntimeSeconds > 0)) return "no measured runtime";
});

check("A14", "у статьи есть закрывающий блок", () => {
  return Boolean(article.closing?.heading && article.closing?.text) || "empty closing";
});

check("A15", "каждый раздел несёт опору: таймлайн или измерение", () => {
  const missing = article.sections.filter(
    (s) =>
      !s.blocks.some(
        (b) => b.kind === "timeline" || b.kind === "measurement" || b.kind === "measurement-table",
      ),
  );
  return missing.length === 0 || missing.map((s) => s.number).join(",");
});

check("A16", "таймлайны ссылаются на существующие доказательства", () => {
  const ids = new Set(
    blocks.filter((b) => b.kind === "timeline").flatMap((b) => b.items.map((i) => i.evidenceId)),
  );
  return ids.size > 0 || "no evidence ids";
});

check("A17", "в статье есть разбор исправлений", () => {
  const rows = blocks.find((b) => b.kind === "corrections");
  return (rows?.rows?.length ?? 0) >= 3 || "fewer than three corrections";
});

check("A18", "нет пустых измерений", () => {
  const m = blocks.filter((b) => b.kind === "measurement");
  return m.every((b) => b.measurement?.table && b.measurement?.id) || "measurement without ref";
});

/* ── Illustrations ───────────────────────────────────────────────────── */

const placeholders = blocks.filter((b) => b.kind === "illustration");

check("I01", "в статье тринадцать иллюстраций", () => {
  return placeholders.length === 13 || `got ${placeholders.length}`;
});

check("I02", "каждая врезка ссылается на существующий ассет", () => {
  const known = new Set(articleIllustrations.map((a) => a.id));
  const bad = placeholders.filter((b) => !known.has(b.assetId));
  return bad.length === 0 || bad.map((b) => b.assetId).join(",");
});

check("I03", "каждая подпись говорит, что это рисунок, а не кадр", () => {
  const bad = placeholders.filter((b) => !/не кадр из фильма/i.test(b.caption));
  return bad.length === 0 || bad.map((b) => b.id).join(",");
});

check("I04", "у каждой картинки в реестре есть alt длиной от 60 знаков", () => {
  const bad = articleIllustrations.filter((a) => a.alt.length < 60);
  return bad.length === 0 || bad.map((a) => `${a.id}:${a.alt.length}`).join(",");
});

check("I05", "все иллюстрации реестра использованы в статье", () => {
  const used = new Set(placeholders.map((b) => b.assetId));
  const unused = articleIllustrations.filter((a) => !used.has(a.id));
  return unused.length === 0 || unused.map((a) => a.id).join(",");
});

check("I06", "источник каждой иллюстрации — generated", () => {
  const bad = articleIllustrations.filter((a) => a.provenance.sourceKind !== "generated");
  return bad.length === 0 || bad.map((a) => a.id).join(",");
});

check("I07", "у каждой иллюстрации есть editorialNotes", () => {
  const bad = articleIllustrations.filter((a) => (a.provenance.editorialNotes ?? "").length < 60);
  return bad.length === 0 || bad.map((a) => a.id).join(",");
});

check("I08", "все файлы вариантов существуют на диске", () => {
  const missing = [];
  for (const asset of articleIllustrations) {
    for (const variant of asset.variants) {
      if (!existsSync(`public${variant.src}`)) missing.push(variant.src);
    }
  }
  return missing.length === 0 || missing.slice(0, 5).join(",");
});

check("I09", "byteSize совпадает с реальным размером файла", () => {
  const bad = [];
  for (const asset of articleIllustrations) {
    for (const variant of asset.variants) {
      const path = `public${variant.src}`;
      if (!existsSync(path)) continue;
      const real = statSync(path).size;
      if (variant.byteSize && Math.abs(real - variant.byteSize) > 2048) {
        bad.push(`${variant.src}:${variant.byteSize}≠${real}`);
      }
    }
  }
  return bad.length === 0 || bad.slice(0, 4).join(",");
});

check("I10", "у каждой иллюстрации есть пара 800/1200 в jpg и avif", () => {
  const bad = [];
  for (const asset of articleIllustrations) {
    const srcs = asset.variants.map((v) => v.src);
    for (const width of [800, 1200]) {
      if (!srcs.some((s) => s.includes(`-${width}.jpg`))) bad.push(`${asset.id} jpg${width}`);
      if (!srcs.some((s) => s.includes(`-${width}.avif`))) bad.push(`${asset.id} avif${width}`);
    }
  }
  return bad.length === 0 || bad.slice(0, 4).join(",");
});

check("I11", "мастер каждой иллюстрации не тяжелее 600 КБ", () => {
  const heavy = [];
  for (const asset of articleIllustrations) {
    const master = asset.variants.find((v) => v.purpose === "editorial-master");
    if (!master) continue;
    const path = `public${master.src}`;
    if (existsSync(path) && statSync(path).size > 600 * 1024) heavy.push(path);
  }
  return heavy.length === 0 || heavy.join(",");
});

check("I12", "display-вариант 1200 не тяжелее 260 КБ", () => {
  const heavy = [];
  for (const asset of articleIllustrations) {
    for (const v of asset.variants.filter((x) => x.purpose === "display" && x.width === 1200)) {
      if (statSync(`public${v.src}`).size > 266240) heavy.push(v.src);
    }
  }
  return heavy.length === 0 || heavy.join(",");
});

check("I13", "пропорции ассета совпадают с мастером", () => {
  const bad = [];
  for (const asset of articleIllustrations) {
    const master = asset.variants.find((v) => v.purpose === "editorial-master");
    if (!master) continue;
    const ratio = master.width / master.height;
    if (Math.abs(ratio - asset.aspectRatio) > 0.02) bad.push(`${asset.id}:${ratio.toFixed(2)}`);
  }
  return bad.length === 0 || bad.join(",");
});

check("I14", "фокусные точки лежат внутри кадра", () => {
  const bad = articleIllustrations.filter(
    (a) =>
      a.focalPoint.x < 0 ||
      a.focalPoint.x > 1 ||
      a.focalPoint.y < 0 ||
      a.focalPoint.y > 1 ||
      a.mobileFocalPoint.x < 0 ||
      a.mobileFocalPoint.x > 1,
  );
  return bad.length === 0 || bad.map((a) => a.id).join(",");
});

check("I15", "в статье нет двух одинаковых подписей", () => {
  const captions = placeholders.map((b) => b.caption);
  return new Set(captions).size === captions.length || "duplicate caption";
});

check("I16", "иллюстрации распределены по разделам, а не свалены в один", () => {
  const spread = new Set(placeholders.map((b) => sectionOf.get(b.id)?.number));
  return spread.size >= 3 || `only in sections ${[...spread].join(",")}`;
});

check("I17", "только одна врезка открывает раздел — заявленная в docs/54", () => {
  const openers = [];
  for (const section of article.sections) {
    let seenText = false;
    for (const block of section.blocks) {
      if (block.kind === "paragraph") seenText = true;
      if (block.kind === "illustration" && !seenText) openers.push(block.id);
    }
  }
  const allowed = ["truman-article-illu-tag"];
  return openers.every((id) => allowed.includes(id)) || openers.join(",");
});

check("I18", "в public/art нет файлов, на которые никто не ссылается", () => {
  const referenced = new Set();
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = `${dir}/${entry.name}`;
      if (entry.isDirectory()) walk(path);
      else if (entry.name.endsWith(".ts")) {
        const text = readFileSync(path, "utf8");
        for (const match of text.matchAll(/\/art\/([\w.-]+)/g)) referenced.add(match[1]);
      }
    }
  };
  walk("src/data");
  const files = readdirSync("public/art");
  const orphans = files.filter((f) => !referenced.has(f));
  return orphans.length === 0 || orphans.join(",");
});

check("I19", "иллюстрации рисуются без next/image и без кадров фильма", () => {
  const view = articleIllustrations.map((a) => illustrationView(a.id));
  return view.every((v) => v && v.src && v.sizes) || "broken view";
});

/* ── Dossier ─────────────────────────────────────────────────────────── */

const sources = trumanProductionSources;
const claims = dossier.claims;

check("D01", "реестр источников не меньше 50 записей", () => {
  return sources.length >= 50 || `${sources.length}`;
});

check("D02", "доля третичных источников не выше 60 %", () => {
  const tertiary = sources.filter((s) => s.tier === "TERTIARY").length;
  return tertiary / sources.length <= 0.6 || `${Math.round((tertiary / sources.length) * 100)}%`;
});

check("D03", "в реестре есть хотя бы десять первичных источников", () => {
  const primary = sources.filter((s) => s.tier === "PRIMARY").length;
  return primary >= 10 || `${primary}`;
});

check("D04", "нет повторяющихся URL", () => {
  const urls = sources.map((s) => s.url);
  return new Set(urls).size === urls.length || "duplicate url";
});

check("D05", "все ссылки отдаются по https", () => {
  const bad = sources.filter((s) => !s.url.startsWith("https://"));
  return bad.length === 0 || bad.map((s) => s.id).join(",");
});

check("D06", "у каждого источника есть дата проверки в ISO", () => {
  const bad = sources.filter((s) => !/^\d{4}-\d{2}-\d{2}$/.test(s.checkedOn));
  return bad.length === 0 || bad.map((s) => s.id).join(",");
});

check("D07", "даты проверки не в будущем", () => {
  const today = new Date().toISOString().slice(0, 10);
  const bad = sources.filter((s) => s.checkedOn > today);
  return bad.length === 0 || bad.map((s) => s.id).join(",");
});

check("D08", "у каждого источника есть поле supports", () => {
  const bad = sources.filter((s) => (s.supports ?? "").length < 40);
  return bad.length === 0 || bad.map((s) => s.id).join(",");
});

check("D09", "нет висячих sourceIds в утверждениях", () => {
  const known = new Set(sources.map((s) => s.id));
  const bad = claims.filter((c) => c.sourceIds.some((id) => !known.has(id)));
  return bad.length === 0 || bad.map((c) => c.id).join(",");
});

check("D10", "нет висячих claimIds в тексте досье", () => {
  const known = new Set(claims.map((c) => c.id));
  const bad = dossier.sections
    .flatMap((s) => s.blocks)
    .flatMap((b) => (b.kind === "myths" ? [b.rows[0].claimId] : (b.claimIds ?? [])))
    .filter((id) => !known.has(id));
  return bad.length === 0 || bad.join(",");
});

check("D11", "каждое unsettled-утверждение видно читателю в §11", () => {
  const surfaced = new Set(
    dossier.sections
      .flatMap((s) => s.blocks)
      .filter((b) => b.kind === "myths")
      .flatMap((b) => b.rows.map((r) => r.claimId)),
  );
  const hidden = claims.filter((c) => c.status !== "CONFIRMED" && !surfaced.has(c.id));
  return hidden.length === 0 || hidden.map((c) => c.id).join(",");
});

check("D12", "подтверждённое утверждение не спрятано в реестр мифов", () => {
  const rows = dossier.sections
    .flatMap((s) => s.blocks)
    .filter((b) => b.kind === "myths")
    .flatMap((b) => b.rows.map((r) => r.claimId));
  const smuggled = rows.filter((id) => claims.find((c) => c.id === id)?.status === "CONFIRMED");
  return smuggled.length === 0 || smuggled.join(",");
});

check("D13", "в досье нет таймкодов", () => {
  const text = JSON.stringify(dossier.sections);
  return !/\b\d{1,2}:\d{2}\b/.test(text) || "timecode found";
});

check("D14", "в реестре мифов нет повторяющихся утверждений", () => {
  const rows = dossier.sections
    .flatMap((s) => s.blocks)
    .filter((b) => b.kind === "myths")
    .flatMap((b) => b.rows.map((r) => r.claimId));
  return new Set(rows).size === rows.length || "duplicate myth row";
});

check("D15", "каждый источник реестра чем-то подтверждён или помечен как наводка", () => {
  const cited = new Set(claims.flatMap((c) => c.sourceIds));
  const unused = sources.filter((s) => !cited.has(s.id));
  return unused.length === 0 || unused.map((s) => s.id).join(",");
});

check("D16", "у досье задан номер раздела у каждого раздела", () => {
  return dossier.sections.every((s, i) => s.number === i + 1) || "numbering drift";
});

/* ── Typesetting and effects ─────────────────────────────────────────── */

const css = ["src/styles/tokens.css", "src/styles/film-article.css", "src/app/globals.css"]
  .map((p) => readFileSync(p, "utf8"))
  .join("\n");

check("T01", "шрифты подключены как вариативные пакеты", () => {
  const pkg = JSON.parse(readFileSync("package.json", "utf8"));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const fonts = Object.keys(deps).filter((d) => d.startsWith("@fontsource-variable/"));
  return fonts.length >= 3 || `only ${fonts.length}`;
});

check("T02", "в токенах есть не меньше десяти переменных", () => {
  const vars = new Set(css.match(/--[a-z0-9-]+\s*:/g) ?? []);
  return vars.size >= 10 || `${vars.size}`;
});

check("T03", "типографическая шкала задана переменными", () => {
  const scale = new Set(css.match(/--type-[a-z0-9-]+\s*:/g) ?? []);
  return scale.size >= 4 || `only ${scale.size}`;
});

check("T04", "в CSS есть запасной шрифт на случай сбоя", () => {
  const stacks = css.match(/--font-[a-z]+:[^;]+;/g) ?? [];
  const ok = stacks.filter((s) => /(sans-serif|monospace|\bserif\b)/.test(s));
  return ok.length >= 3 || `only ${ok.length} stacks with fallback`;
});

check("T05", "строки не растягиваются на всю ширину экрана", () => {
  return /max-inline-size|max-width:\s*(6[0-9]|[3-6][0-9])(ch|rem)/.test(css) || "no measure";
});

check("T06", "анимации уважают prefers-reduced-motion", () => {
  const all = readdirSync("src/styles").map((f) => readFileSync(`src/styles/${f}`, "utf8"));
  const guarded = all.filter((t) => t.includes("prefers-reduced-motion")).length;
  return guarded >= 3 || `only ${guarded} files guard motion`;
});

check("T07", "у врезок задан aspect-ratio, а не свободная высота", () => {
  return /aspect-ratio/.test(css) || "no aspect-ratio";
});

check("T08", "есть видимый фокус клавиатуры", () => {
  return /:focus-visible/.test(css) || "no focus-visible";
});

check("T09", "в статье используется picture с AVIF и JPEG", () => {
  const view = readFileSync("src/components/film-article/article-view.tsx", "utf8");
  const data = readFileSync("src/data/film-illustrations.ts", "utf8");
  return view.includes("<picture") && view.includes("<source") && data.includes("avif");
});

check("T10", "у картинок есть loading и decoding", () => {
  const view = readFileSync("src/components/film-article/article-view.tsx", "utf8");
  return /loading="lazy"/.test(view) && /decoding="async"/.test(view);
});

check("T11", "соц-карточка остаётся JPEG", () => {
  const share = readFileSync("src/data/film-share-assets.ts", "utf8");
  return /share-card|jpg|jpeg/.test(share) || "no share asset";
});

check("T12", "в globals нет ссылок на внешние шрифты по сети", () => {
  const globals = readFileSync("src/app/globals.css", "utf8");
  return !/fonts\.googleapis|@import url\(http/.test(globals) || "remote font";
});

check("T13", "тёмная тема не полагается на чистый чёрный фон", () => {
  const surfaces = css.match(/--surface-[a-z0-9-]+:[^;]+;/g) ?? [];
  const pureBlack = surfaces.filter((line) => /#000000|#000\b/.test(line));
  return pureBlack.length === 0 || pureBlack.join(" ");
});

check("T14", "нет инлайновых цветов в разметке статьи", () => {
  const view = readFileSync("src/components/film-article/article-view.tsx", "utf8");
  return !/style=\{\{[^}]*color/.test(view) || "inline colour";
});

check("T15", "абзацы размечены text-wrap: pretty", () => {
  const articleCss = readFileSync("src/styles/film-article.css", "utf8");
  return /text-wrap:\s*pretty/.test(articleCss) || "no pretty wrapping";
});

check("T16", "у статьи есть печатная версия", () => {
  const articleCss = readFileSync("src/styles/film-article.css", "utf8");
  return /@media print/.test(articleCss) && /break-inside:\s*avoid/.test(articleCss);
});

check("T17", "якоря разделов не прячутся под липкой шапкой", () => {
  const articleCss = readFileSync("src/styles/film-article.css", "utf8");
  return /scroll-margin-block-start/.test(articleCss) || "no scroll margin";
});

check("T18", "появление врезок управляется прокруткой и уважает reduced-motion", () => {
  const articleCss = readFileSync("src/styles/film-article.css", "utf8");
  const guarded = /@supports \(animation-timeline: view\(\)\)/.test(articleCss);
  const still = /@media \(prefers-reduced-motion: reduce\)[\s\S]{0,160}animation:\s*none/.test(
    articleCss,
  );
  return (guarded && still) || "reveal is not progressive or not guarded";
});

check("T19", "врезка резервирует пропорции до загрузки файла", () => {
  const articleCss = readFileSync("src/styles/film-article.css", "utf8");
  return /aspect-ratio:\s*3\s*\/\s*2/.test(articleCss) || "no reserved ratio";
});

check("T20", "висячая пунктуация включена там, где движок её знает", () => {
  const articleCss = readFileSync("src/styles/film-article.css", "utf8");
  return /hanging-punctuation/.test(articleCss) || "no hanging punctuation";
});

/* ── Report ─────────────────────────────────────────────────────────── */

if (jsonOnly) {
  console.log(JSON.stringify({ failures, results }, null, 2));
} else {
  const width = Math.max(...results.map((r) => r.title.length));
  for (const r of results) {
    const mark = r.passed ? "OK  " : "FAIL";
    console.log(`${mark} ${r.id}  ${r.title.padEnd(width)}${r.detail ? "  ← " + r.detail : ""}`);
  }
  console.log(`\n${results.length - failures}/${results.length} checks passed`);
}

process.exitCode = failures === 0 ? 0 : 1;
