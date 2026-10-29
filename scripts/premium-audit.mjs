import { readStylesheet, listStyles } from "./lib/style-sources.mjs";
/**
 * Premium audit: is this page actually good, or merely correct?
 *
 * The regression suite protects the data model and `film001-audit.mjs` protects
 * the editorial promises. This script asks the harder question a reader asks in
 * the first three seconds: does the thing feel made, or assembled?
 *
 * It measures what can be measured — contrast ratios computed from the tokens
 * themselves, type scale, measure, weight budgets, motion guards, semantics in
 * the rendered HTML — and it refuses to guess. Anything that needs a human eye
 * (composition, tone, taste) is out of scope on purpose.
 *
 * Usage:
 *   node scripts/premium-audit.mjs                     # static checks only
 *   node scripts/premium-audit.mjs --base http://127.0.0.1:3000   # + rendered HTML
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { extractJsonLd, normaliseSpace, stripScripts, stripTags } from "./lib/html-scan.mjs";

const args = process.argv.slice(2);
const baseIndex = args.indexOf("--base");
const base = baseIndex >= 0 ? args[baseIndex + 1].replace(/\/$/, "") : "";
const onlyGroup = args.includes("--group") ? args[args.indexOf("--group") + 1] : "";

const results = [];
let failures = 0;

function check(group, id, title, run) {
  if (onlyGroup && group !== onlyGroup) return;
  let verdict;
  try {
    verdict = run();
  } catch (error) {
    verdict = `threw: ${error.message}`;
  }
  const passed = verdict === true || verdict === undefined;
  if (!passed) failures += 1;
  results.push({ group, id, title, passed, detail: passed ? "" : String(verdict) });
}

const read = (path) => readFileSync(path, "utf8");
const stylesDir = "src/styles";
const styleFiles = listStyles();
const allCss = [...styleFiles, "src/app/globals.css"].map(read).join("\n");
const tokensCss = read(`${stylesDir}/tokens.css`);
const articleCss = readStylesheet(`${stylesDir}/film-article.css`);

/* ── Colour maths ─────────────────────────────────────────────────────── */

const HEX = /#([0-9a-f]{3,8})\b/gi;
const tokens = new Map();
for (const match of tokensCss.matchAll(/(--[a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\))/g)) {
  tokens.set(match[1], match[2]);
}

function parseColor(value) {
  if (/^#/.test(value)) {
    const hex = value.slice(1);
    const full = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
    return {
      r: parseInt(full.slice(0, 2), 16),
      g: parseInt(full.slice(2, 4), 16),
      b: parseInt(full.slice(4, 6), 16),
      a: 1,
    };
  }
  const [r, g, b, a = 1] = value
    .replace(/rgba?\(|\)/g, "")
    .split(",")
    .map((part) => Number(part.trim()));
  return { r, g, b, a };
}

function over(foreground, background) {
  const a = foreground.a ?? 1;
  return {
    r: foreground.r * a + background.r * (1 - a),
    g: foreground.g * a + background.g * (1 - a),
    b: foreground.b * a + background.b * (1 - a),
    a: 1,
  };
}

function luminance({ r, g, b }) {
  const channel = (value) => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(fg, bg) {
  const painted = over(parseColor(fg), parseColor(bg));
  const l1 = luminance(painted);
  const l2 = luminance(parseColor(bg));
  const [light, dark] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (light + 0.05) / (dark + 0.05);
}

const token = (name) => tokens.get(name) ?? "";

const contrastChecks = [
  ["CO01", "основной текст на фоне ≥ 7:1 (AAA)", "--ink-1", "--surface-canvas", 7],
  ["CO02", "вторичный текст ≥ 4.5:1", "--ink-2", "--surface-canvas", 4.5],
  ["CO03", "третичный текст ≥ 4.5:1", "--ink-3", "--surface-canvas", 4.5],
  ["CO04", "служебный текст ≥ 4.5:1", "--ink-4", "--surface-canvas", 4.5],
  ["CO05", "мета-текст на приподнятой поверхности ≥ 4.5:1", "--ink-4", "--surface-2", 4.5],
  ["CO06", "тёплый акцент ≥ 4.5:1", "--accent-restoration", "--surface-canvas", 4.5],
  ["CO07", "тёплый акцент на тёплой поверхности ≥ 4.5:1", "--accent-restoration", "--surface-warm", 4.5],
  ["CO08", "красный акцент как графика ≥ 3:1", "--accent-fracture", "--surface-canvas", 3],
  ["CO09", "яркий красный как графика ≥ 3:1", "--accent-fracture-bright", "--surface-1", 3],
  ["CO10", "индикатор фокуса ≥ 3:1", "--focus-color", "--surface-canvas", 3],
  ["CO11", "выделение текста ≥ 4.5:1", "--selection-ink", "--selection-bg", 4.5],
];

for (const [id, title, fg, bg, min] of contrastChecks) {
  check("CO", id, title, () => {
    if (!token(fg) || !token(bg)) return `token missing (${fg} / ${bg})`;
    const ratio = contrast(token(fg), token(bg));
    return ratio >= min || `${ratio.toFixed(2)}:1 при минимуме ${min}`;
  });
}

/* ── Typography ───────────────────────────────────────────────────────── */

const typeScale = [...tokensCss.matchAll(/--type-([a-z0-9-]+):\s*([^;]+);/g)].map((m) => ({
  name: m[1],
  value: m[2].trim(),
}));
const scaleMax = (value) => {
  const numbers = [...value.matchAll(/([\d.]+)rem/g)].map((m) => Number(m[1]));
  return numbers.length ? Math.max(...numbers) : 0;
};
const scaleValue = new Map(typeScale.map((entry) => [entry.name, scaleMax(entry.value)]));

check("TY", "TY01", "типографическая шкала из шести ступеней", () => {
  return typeScale.length >= 6 || `ступеней: ${typeScale.length}`;
});

check("TY", "TY02", "шкала убывает без инверсий", () => {
  const display1 = scaleValue.get("display-1") ?? 0;
  const display2 = scaleValue.get("display-2") ?? 0;
  const display3 = scaleValue.get("display-3") ?? 0;
  const lede = scaleValue.get("lede") ?? 0;
  const body = scaleValue.get("body") ?? 0;
  return (display1 > display2 && display2 > display3 && display3 > lede && lede > body) || `${display1}/${display2}/${display3}/${lede}/${body}`;
});

check("TY", "TY03", "шкала набрана через clamp, а не фиксированные кегли", () => {
  const fluid = typeScale.filter((entry) => entry.value.includes("clamp(")).length;
  return fluid >= 5 || `плавных ступеней: ${fluid}`;
});

check("TY", "TY04", "все три семейства имеют запасной стек", () => {
  const stacks = [...tokensCss.matchAll(/--font-[a-z]+:\s*([^;]+);/g)].map((m) => m[1]);
  const withFallback = stacks.filter((stack) => /(sans-serif|monospace|serif)/.test(stack));
  return withFallback.length >= 3 || `стеков с фолбэком: ${withFallback.length}`;
});

check("TY", "TY05", "шрифтов не больше трёх семейств", () => {
  const families = new Set(
    [...tokensCss.matchAll(/--font-[a-z]+:\s*"([^"]+)"/g)].map((m) => m[1]),
  );
  return families.size <= 3 || `семейств: ${families.size}`;
});

check("TY", "TY06", "только вариативные шрифты, без набора статических весов", () => {
  const pkg = JSON.parse(read("package.json"));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const fontDeps = Object.keys(deps).filter((name) => name.startsWith("@fontsource"));
  const statics = fontDeps.filter((name) => !name.startsWith("@fontsource-variable/"));
  return statics.length === 0 || `статические: ${statics.join(",")}`;
});

check("TY", "TY07", "длина строки основного текста ≤ 68ch", () => {
  const measure = Number(/--reading-max:\s*([\d.]+)ch/.exec(tokensCss)?.[1]);
  return measure <= 68 || `${measure}ch`;
});

check("TY", "TY08", "интерлиньяж основного текста в коридоре 1.5–1.8", () => {
  const leading = Number(/--leading-body:\s*([\d.]+)/.exec(tokensCss)?.[1]);
  return (leading >= 1.5 && leading <= 1.8) || String(leading);
});

check("TY", "TY09", "дисплейный интерлиньяж плотный (< 1.1)", () => {
  const tight = Number(/--leading-display-tight:\s*([\d.]+)/.exec(tokensCss)?.[1]);
  const display = Number(/--leading-display:\s*([\d.]+)/.exec(tokensCss)?.[1]);
  return (tight < 1.1 && display < 1.1) || `${tight}/${display}`;
});

check("TY", "TY10", "служебный текст имеет разрядку ≥ 0.1em", () => {
  const tracking = Number(/--tracking-meta:\s*([\d.]+)em/.exec(tokensCss)?.[1]);
  return tracking >= 0.1 || String(tracking);
});

check("TY", "TY11", "заголовки размечены text-wrap: balance", () => {
  return /h1,\s*\n?\s*h2,\s*\n?\s*h3[\s\S]{0,120}text-wrap:\s*balance/.test(allCss) ||
    /text-wrap:\s*balance/.test(allCss);
});

check("TY", "TY12", "абзацы размечены text-wrap: pretty", () => {
  return /text-wrap:\s*pretty/.test(articleCss);
});

check("TY", "TY13", "числа в таблицах и мете — табличные", () => {
  const tabular = (allCss.match(/font-variant-numeric:\s*tabular-nums/g) ?? []).length;
  return tabular >= 3 || `объявлений: ${tabular}`;
});

check("TY", "TY14", "язык документа задан как ru", () => {
  return /<html lang="ru">/.test(read("src/app/layout.tsx"));
});

check("TY", "TY15", "переносы включены для узкой колонки", () => {
  return /hyphens:\s*(auto|manual)/.test(allCss) || "hyphens не объявлены";
});

/* ── Layout and rhythm ───────────────────────────────────────────────── */

const baseTokens = tokensCss.slice(0, tokensCss.indexOf("@media"));
const spaceSteps = [...baseTokens.matchAll(/--space-(\d+):\s*([\d.]+)rem/g)].map((m) => ({
  step: Number(m[1]),
  value: Number(m[2]),
}));

check("LA", "LA01", "вертикальный ритм задан не меньше чем десятью шагами", () => {
  return spaceSteps.length >= 10 || `шагов: ${spaceSteps.length}`;
});

check("LA", "LA02", "шаги ритма строго возрастают", () => {
  const values = spaceSteps.sort((a, b) => a.step - b.step).map((entry) => entry.value);
  return values.every((value, index) => index === 0 || value > values[index - 1]) || values.join(",");
});

check("LA", "LA03", "контейнер ограничен и не шире 1600px", () => {
  const max = Number(/--container-max:\s*([\d.]+)px/.exec(tokensCss)?.[1]);
  return (max > 0 && max <= 1600) || String(max);
});

check("LA", "LA04", "боковые отступы плавные (clamp), а не фиксированные", () => {
  return /--gutter:\s*clamp/.test(tokensCss);
});

check("LA", "LA05", "текстовая колонка уже контейнера", () => {
  const content = Number(/--content-max:\s*([\d.]+)px/.exec(tokensCss)?.[1]);
  const container = Number(/--container-max:\s*([\d.]+)px/.exec(tokensCss)?.[1]);
  return content < container || `${content} vs ${container}`;
});

check("LA", "LA06", "врезки-инсеты ограничены по ширине", () => {
  const width = Number(/\[data-layout="inset"\][\s\S]{0,120}?width:\s*min\(100%,\s*(\d+)px\)/.exec(articleCss)?.[1]);
  return (width > 0 && width <= 460) || String(width);
});

check("LA", "LA07", "мобильные кегли переопределены явно", () => {
  return /@media \(max-width: 720px\)[\s\S]{0,400}--type-display-1/.test(tokensCss);
});

check("LA", "LA08", "точечных px в статье немного — вёрстка на токенах", () => {
  const literals = new Set([...articleCss.matchAll(/:\s*-?(\d+)px/g)].map((m) => m[1]));
  return literals.size <= 8 || `уникальных px: ${literals.size} (${[...literals].join(",")})`;
});

check("LA", "LA09", "контрольных точек не больше шести (кроме фолбэка контейнерных запросов)", () => {
  // Media queries inside `@supports not (container-type)` are a translation of
  // container thresholds, not a second breakpoint system, so they are excluded.
  const withoutFallback = allCss.replace(
    /@supports not \(container-type: inline-size\)\s*\{[\s\S]*?\n\}/g,
    "",
  );
  const breakpoints = new Set(
    [...withoutFallback.matchAll(/@media \(max-width:\s*(\d+)px\)/g)].map((m) => m[1]),
  );
  return breakpoints.size <= 6 || `${breakpoints.size}: ${[...breakpoints].join(",")}`;
});

check("LA", "LA10", "сетка держится на gap-токене", () => {
  return /--grid-gap:\s*clamp/.test(tokensCss);
});

/* ── Motion ──────────────────────────────────────────────────────────── */

const durations = [...tokensCss.matchAll(/--duration-[a-z]+:\s*(\d+)ms/g)].map((m) => Number(m[1]));

check("MO", "MO01", "длительности анимаций заданы токенами", () => {
  return durations.length >= 3 || `токенов: ${durations.length}`;
});

check("MO", "MO02", "самая длинная анимация ≤ 800 мс", () => {
  const longest = Math.max(...durations);
  return longest <= 800 || `${longest}ms`;
});

check("MO", "MO03", "кривые ускорения заданы токенами", () => {
  const easings = (tokensCss.match(/--ease-[a-z]+:\s*cubic-bezier/g) ?? []).length;
  return easings >= 2 || `кривых: ${easings}`;
});

check("MO", "MO04", "длительности берутся из токенов, а не из воздуха", () => {
  const bespoke = [];
  for (const path of styleFiles) {
    for (const line of read(path).split("\n")) {
      if (!/(transition|animation):/.test(line)) continue;
      if (/delay/.test(line) || /infinite/.test(line) || /var\(--duration/.test(line)) continue;
      const match = /\b(\d*\.?\d+)(m?s)\b/.exec(line);
      if (!match) continue;
      const ms = match[2] === "s" ? Number(match[1]) * 1000 : Number(match[1]);
      if (ms >= 300) bespoke.push(`${path.split("/").pop()}:${match[0]}`);
    }
  }
  return bespoke.length <= 6 || bespoke.join(",");
});

check("MO", "MO05", "prefers-reduced-motion учтён минимум в трёх файлах", () => {
  const files = styleFiles.filter((path) => read(path).includes("prefers-reduced-motion"));
  return files.length >= 3 || `файлов: ${files.length}`;
});

check("MO", "MO06", "бесконечная анимация всегда имеет выход для «меньше движения»", () => {
  // Motion and its accessibility fallback may have separate owners. Check
  // each composed surface, not an isolated imported fragment.
  const surfaces = readdirSync(stylesDir).filter((name) => name.endsWith(".css"));
  const offenders = surfaces.filter((name) => {
    const text = readStylesheet(`${stylesDir}/${name}`);
    return /animation:[^;]*infinite/.test(text) && !text.includes("prefers-reduced-motion");
  });
  return offenders.length === 0 || offenders.join(",");
});

check("MO", "MO07", "появление по прокрутке спрятано за @supports", () => {
  return /@supports \(animation-timeline: view\(\)\)/.test(articleCss);
});

/* ── Imagery ─────────────────────────────────────────────────────────── */

const artFiles = readdirSync("public/art");
const artBytes = artFiles.reduce((sum, name) => sum + statSync(`public/art/${name}`).size, 0);
const illustrations = read("src/data/film-illustrations.ts");
const illustrationIds = [...illustrations.matchAll(/id:\s*"(illu-[a-z0-9-]+)"/g)].map((m) => m[1]);
const articleSource = read("src/data/films/the-truman-show-article.ts");
const illustrationBlocks = [...articleSource.matchAll(/kind:\s*"illustration",[\s\S]{0,400}?caption:\s*\n?\s*"([^"]+)"/g)].map((m) => m[1]);
const captions = illustrationBlocks;

check("IM", "IM01", "в реестре иллюстраций не меньше тринадцати ассетов", () => {
  return illustrationIds.length >= 13 || `${illustrationIds.length}`;
});

check("IM", "IM02", "у каждого ассета есть AVIF и JPEG на двух ширинах", () => {
  const registered = [...illustrations.matchAll(/src:\s*"\/art\/([a-z0-9.-]+)"/g)].map((m) => m[1]);
  const bases = new Set(
    registered
      .map((name) => name.replace(/\.(jpg|avif|png|webp)$/i, ""))
      .map((name) => name.replace(/-(800|1200)(-avif)?$/, ""))
      .map((name) => name.replace(/-master$/, "")),
  );
  const bad = [];
  for (const base of bases) {
    for (const width of [800, 1200]) {
      for (const ext of ["jpg", "avif"]) {
        if (!registered.includes(`${base}-${width}.${ext}`)) bad.push(`${base}-${width}.${ext}`);
      }
    }
  }
  return bad.length === 0 || bad.slice(0, 4).join(",");
});

check("IM", "IM03", "в public/art нет ни одного PNG", () => {
  const pngs = artFiles.filter((name) => name.endsWith(".png"));
  return pngs.length === 0 || pngs.join(",");
});

check("IM", "IM04", "общий вес иллюстраций ≤ 10 МБ", () => {
  return artBytes <= 10 * 1024 * 1024 || `${(artBytes / 1024 / 1024).toFixed(1)} МБ`;
});

check("IM", "IM05", "мастер иллюстрации ≤ 600 КБ", () => {
  const heavy = artFiles
    .filter((name) => name.includes("master") && name.endsWith(".jpg"))
    .filter((name) => statSync(`public/art/${name}`).size > 600 * 1024);
  return heavy.length === 0 || heavy.join(",");
});

check("IM", "IM06", "каждая подпись говорит, что это рисунок", () => {
  const bad = captions.filter((text) => !/не кадр из фильма/i.test(text));
  return bad.length === 0 || bad.slice(0, 3).join(" | ");
});

check("IM", "IM07", "подписи не дублируются", () => {
  return new Set(captions).size === captions.length || "есть повторы";
});

check("IM", "IM08", "у каждого ассета описан alt длиной от 60 знаков", () => {
  const alts = [...illustrations.matchAll(/alt:\s*\n?\s*"([^"]+)"/g)].map((m) => m[1]);
  const short = alts.filter((text) => text.length < 60);
  return short.length === 0 || `${short.length} коротких`;
});

check("IM", "IM09", "соц-карточка не тяжелее 300 КБ", () => {
  const shares = readdirSync("public/og").filter((name) => name.includes("share") && name.endsWith(".jpg"));
  const heavy = shares.filter((name) => statSync(`public/og/${name}`).size > 300 * 1024);
  return heavy.length === 0 || heavy.join(",");
});

check("IM", "IM10", "мастера обложки не тяжелее 600 КБ", () => {
  const masters = readdirSync("public/og").filter((name) => name.endsWith(".jpg"));
  const heavy = masters.filter((name) => statSync(`public/og/${name}`).size > 600 * 1024);
  return heavy.length === 0 || heavy.map((name) => `${name}:${Math.round(statSync(`public/og/${name}`).size / 1024)}КБ`).join(",");
});

check("IM", "IM11", "пропорция иллюстраций единая (3:2)", () => {
  const ratios = [...illustrations.matchAll(/aspectRatio:\s*(\d+)\s*\/\s*(\d+)/g)].map(
    (m) => Number(m[1]) / Number(m[2]),
  );
  const unique = new Set(ratios.map((ratio) => ratio.toFixed(3)));
  return unique.size === 1 || `пропорций: ${[...unique].join(",")}`;
});

check("IM", "IM12", "фокусные точки заданы в нормализованных координатах", () => {
  const points = [...illustrations.matchAll(/focalPoint:\s*\{\s*x:\s*([\d.]+),\s*y:\s*([\d.]+)\s*\}/g)];
  const bad = points.filter((m) => Number(m[1]) > 1 || Number(m[2]) > 1);
  return (points.length >= 13 && bad.length === 0) || `точек: ${points.length}, вне кадра: ${bad.length}`;
});

/* ── Rendered HTML ───────────────────────────────────────────────────── */

const pages = {};
async function fetchPage(path) {
  if (!base) return null;
  if (pages[path]) return pages[path];
  const response = await fetch(`${base}${path}`);
  if (!response.ok) throw new Error(`${path} → ${response.status}`);
  const html = await response.text();
  pages[path] = html;
  return html;
}

const articlePath = "/films/the-truman-show/article?spoilers=full";
const filmPath = "/films/the-truman-show";

if (base) {
  let articleHtml = "";
  try {
    articleHtml = (await fetchPage(articlePath)) ?? "";
  } catch (error) {
    articleHtml = "";
    results.push({ group: "SE", id: "SE00", title: `страница статьи доступна (${articlePath})`, passed: false, detail: error.message });
    failures += 1;
  }

  // Scripts are removed with a scanner rather than a pattern: the payload
  // contains its own closing tokens, and a regex here is both slower and easier
  // to get subtly wrong on edge cases such as an unclosed tag.
  const doc = stripScripts(articleHtml);

  check("SE", "SE01", "на странице ровно один h1", () => {
    const count = (doc.match(/<h1[\s>]/g) ?? []).length;
    return count === 1 || `h1: ${count}`;
  });

  check("SE", "SE02", "заголовки не перескакивают уровни", () => {
    const levels = [...doc.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]));
    const skips = levels.filter((level, index) => index > 0 && level > levels[index - 1] + 1);
    return skips.length === 0 || `скачков: ${skips.length}`;
  });

  check("SE", "SE03", "на странице один main", () => {
    const count = (doc.match(/<main[\s>]/g) ?? []).length;
    return count === 1 || `main: ${count}`;
  });

  check("SE", "SE04", "есть ссылка «к содержимому»", () => {
    return /href="#main"|href="#content"/.test(doc);
  });

  check("SE", "SE05", "у всех изображений есть alt", () => {
    const images = [...doc.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
    const missing = images.filter((tag) => !/\balt=/.test(tag));
    return missing.length === 0 || `${missing.length} без alt`;
  });

  check("SE", "SE06", "у всех изображений заданы размеры", () => {
    const images = [...doc.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
    const missing = images.filter((tag) => !(/\bwidth=/.test(tag) && /\bheight=/.test(tag)));
    return missing.length === 0 || `${missing.length} без размеров`;
  });

  check("SE", "SE07", "картинки грузятся лениво и декодируются асинхронно", () => {
    const images = [...doc.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
    const bad = images.filter((tag) => !/loading="lazy"/.test(tag) || !/decoding="async"/.test(tag));
    return bad.length === 0 || `${bad.length} без lazy/async`;
  });

  check("SE", "SE08", "нет пустых ссылок", () => {
    const empty = [...doc.matchAll(/<a\b[^>]*>\s*<\/a>/g)].length;
    return empty === 0 || `пустых: ${empty}`;
  });

  check("SE", "SE09", "нет положительного tabindex", () => {
    return !/tabindex="[1-9]/.test(doc);
  });

  check("SE", "SE10", "навигация подписана", () => {
    const navs = [...doc.matchAll(/<nav\b[^>]*>/g)].map((m) => m[0]);
    const unlabelled = navs.filter((tag) => !/aria-label|aria-labelledby/.test(tag));
    return unlabelled.length === 0 || `${unlabelled.length} навигаций без имени`;
  });

  check("SE", "SE11", "врезки оформлены figure + figcaption", () => {
    const figures = (doc.match(/<figure\b/g) ?? []).length;
    const captions = (doc.match(/<figcaption\b/g) ?? []).length;
    return figures >= 13 && captions >= figures || `figure: ${figures}, figcaption: ${captions}`;
  });

  check("SE", "SE12", "картинки отдаются через picture с AVIF", () => {
    const pictures = (doc.match(/<picture\b/g) ?? []).length;
    const avif = (doc.match(/type="image\/avif"/g) ?? []).length;
    return (pictures >= 13 && avif >= 13) || `picture: ${pictures}, avif: ${avif}`;
  });

  check("SE", "SE13", "в разметке нет inline-стилей", () => {
    const inline = [...doc.matchAll(/<[a-z]+[^>]*\bstyle="/g)].length;
    return inline === 0 || `inline-стилей: ${inline}`;
  });

  check("SE", "SE14", "документ объявляет язык", () => {
    return /<html[^>]*lang="ru"/.test(doc);
  });

  check("ME", "ME01", "title не длиннее 60 знаков", () => {
    const title = /<title>([^<]*)<\/title>/.exec(doc)?.[1] ?? "";
    return title.length > 0 && title.length <= 60 || `${title.length}: ${title}`;
  });

  check("ME", "ME02", "description не длиннее 160 знаков", () => {
    const description = /<meta name="description" content="([^"]*)"/.exec(doc)?.[1] ?? "";
    return description.length > 0 && description.length <= 160 || `${description.length}`;
  });

  check("ME", "ME03", "Open Graph заполнен целиком", () => {
    const needed = ["og:title", "og:description", "og:type", "og:image", "og:url", "og:site_name"];
    const missing = needed.filter((property) => !new RegExp(`property="${property}"`).test(doc));
    return missing.length === 0 || missing.join(",");
  });

  check("ME", "ME04", "карточка Twitter объявлена как large image", () => {
    return /name="twitter:card" content="summary_large_image"/.test(doc);
  });

  check("ME", "ME05", "у og:image указаны размеры и alt", () => {
    return (
      /property="og:image:width" content="1200"/.test(doc) &&
      /property="og:image:height" content="630"/.test(doc) &&
      /property="og:image:alt"/.test(doc)
    );
  });

  check("ME", "ME06", "соц-карточка — JPEG", () => {
    const image = /property="og:image" content="([^"]*)"/.exec(doc)?.[1] ?? "";
    return /\.jpe?g$/.test(image) || image;
  });

  check("ME", "ME07", "черновик закрыт от индексации", () => {
    return /name="robots" content="noindex, nofollow"/.test(doc);
  });

  check("ME", "ME09", "у статьи есть размеченные хлебные крошки в разметке схемы", () => {
    // Scripts are stripped from `doc` on purpose, so the schema is read from the
    // raw payload instead.
    const blocks = extractJsonLd(articleHtml);
    const trail = blocks
      .map((raw) => {
        try {
          return JSON.parse(raw);
        } catch {
          return null;
        }
      })
      .find((value) => value && value["@type"] === "BreadcrumbList");
    return (trail && trail.itemListElement.length >= 3) || "BreadcrumbList не найдена";
  });

  check("ME", "ME10", "видимые хлебные крошки совпадают с разметкой схемы", () => {
    // The trail is rendered from props while the schema is built from the film
    // package, so they can drift: a crumb once read "залоченное издание" while
    // the schema said "The Truman Show". Compare the labels, not just the count.
    const nav = /<nav[^>]*aria-label="Хлебные крошки"[^>]*>([\s\S]*?)<\/nav>/.exec(doc)?.[1] ?? "";
    const visible = [...nav.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)].map((m) =>
      normaliseSpace(stripTags(m[1])),
    );
    const blocks = extractJsonLd(articleHtml);
    const trail = blocks
      .map((raw) => {
        try {
          return JSON.parse(raw);
        } catch {
          return null;
        }
      })
      .find((value) => value && value["@type"] === "BreadcrumbList");
    const names = (trail?.itemListElement ?? []).map((item) => String(item.name).trim());
    if (visible.length !== names.length) return `${visible.length} != ${names.length}: ${visible.join(" | ")}`;
    const mismatch = visible.findIndex((label, index) => label !== names[index]);
    return mismatch === -1 || `позиция ${mismatch + 1}: «${visible[mismatch]}» вместо «${names[mismatch]}»`;
  });

  check("SE", "SE16", "хлебные крошки — это nav со списком, а не абзац ссылок", () => {
    return /<nav[^>]*aria-label="Хлебные крошки"[^>]*>\s*<ol/.test(doc);
  });

  check("ME", "ME08", "у черновика нет канонического адреса, который врёт", () => {
    const canonical = /rel="canonical" href="([^"]*)"/.exec(doc)?.[1];
    return !canonical || canonical.includes("/films/the-truman-show");
  });

  check("PE", "PE01", "HTML статьи не тяжелее 300 КБ", () => {
    return articleHtml.length <= 300 * 1024 || `${Math.round(articleHtml.length / 1024)} КБ`;
  });

  check("PE", "PE02", "картинки статьи в сумме ≤ 2.5 МБ на первый экран", () => {
    const sources = [...doc.matchAll(/srcSet="([^"]+)"/g)].map((m) => m[1]).join(",");
    const files = [...new Set([...sources.matchAll(/\/art\/([a-z0-9.-]+)\s+1200w/g)].map((m) => m[1]))];
    if (files.length === 0) return "не найдено 1200w-источников";
    const bytes = files.reduce((sum, name) => sum + (existsSync(`public/art/${name}`) ? statSync(`public/art/${name}`).size : 0), 0);
    return bytes <= 2.5 * 1024 * 1024 || `${(bytes / 1024 / 1024).toFixed(2)} МБ (${files.length} файлов)`;
  });

  check("PE", "PE03", "нет внешних шрифтовых запросов", () => {
    return !/fonts\.googleapis|fonts\.gstatic/.test(doc);
  });

  check("PE", "PE04", "критический CSS инлайнится или отдаётся одним файлом", () => {
    const links = (doc.match(/rel="stylesheet"/g) ?? []).length;
    return links <= 3 || `таблиц стилей: ${links}`;
  });

  check("PE", "PE05", "скриптов на странице не больше тридцати", () => {
    const scripts = (articleHtml.match(/<script\b/g) ?? []).length;
    return scripts <= 30 || `скриптов: ${scripts}`;
  });

  try {
    const filmHtml = stripScripts((await fetchPage(filmPath)) ?? "");
    check("SE", "SE15", "у карточки фильма есть заголовок и хлебные крошки", () => {
      const hasHeading = /<h1[\s>]/.test(filmHtml);
      const hasTrail = /aria-label="Хлебные крошки"/.test(filmHtml);
      return (hasHeading && hasTrail) || `h1: ${hasHeading}, крошки: ${hasTrail}`;
    });
  } catch (error) {
    results.push({ group: "SE", id: "SE15", title: "карточка фильма отвечает", passed: false, detail: error.message });
    failures += 1;
  }
} else {
  results.push({ group: "—", id: "HTML", title: "проверки разметки пропущены: запустите с --base URL", passed: true, detail: "" });
}

/* ── Craft ───────────────────────────────────────────────────────────── */

check("CR", "CR01", "есть печатная версия статьи", () => {
  return /@media print/.test(articleCss);
});

check("CR", "CR02", "фокус клавиатуры виден", () => {
  return /:focus-visible/.test(allCss);
});

check("CR", "CR03", "выделение текста оформлено", () => {
  return /::selection/.test(allCss);
});

check("CR", "CR04", "у якорей есть отступ под липкую шапку", () => {
  return /scroll-margin/.test(allCss);
});

check("CR", "CR05", "!important живёт только в отключении анимаций", () => {
  // Comments are prose, not declarations: a stylesheet may say the word without
  // using it.
  const uncommented = allCss.replace(/\/\*[\s\S]*?\*\//g, "");
  // Two ways to ask for stillness are accepted: the media query and the
  // attribute the site sets from JavaScript.
  const guarded = uncommented
    .split(/@media \(prefers-reduced-motion|\[data-reduced-motion/)
    .slice(1)
    .join("\n");
  const total = (uncommented.match(/!important/g) ?? []).length;
  const inside = (guarded.match(/!important/g) ?? []).length;
  return inside >= total || `вне reduced-motion: ${total - inside}`;
});

check("CR", "CR06", "CSS документирован: комментарии объясняют решения", () => {
  const comments = (allCss.match(/\/\*[\s\S]*?\*\//g) ?? []).length;
  return comments >= 40 || `комментариев: ${comments}`;
});

check("CR", "CR07", "ни один литеральный цвет не дублирует токен", () => {
  const tokenColors = new Set(
    [...tokens.values()].map((value) => value.toLowerCase().replace(/\s/g, "")),
  );
  const duplicates = [];
  for (const path of styleFiles.filter((name) => !name.endsWith("tokens.css"))) {
    for (const match of read(path).matchAll(HEX)) {
      const raw = match[0].toLowerCase();
      const expanded =
        raw.length === 4
          ? `#${raw[1]}${raw[1]}${raw[2]}${raw[2]}${raw[3]}${raw[3]}`
          : raw;
      if (tokenColors.has(raw) || tokenColors.has(expanded)) {
        duplicates.push(`${path.split("/").pop()}:${raw}`);
      }
    }
  }
  return duplicates.length === 0 || duplicates.slice(0, 6).join(",");
});

check("CR", "CR08", "загрузка объявлена там, где идёт стриминг, и есть состояния ошибки", () => {
  // A `loading.tsx` at the app root wraps *every* route in Suspense — including
  // the statically prerendered homepage, whose HTML then ships a skeleton and
  // its real content in a hidden streamed template. Without scripting that is
  // a blank page. Loading belongs to the segments that actually stream.
  return (
    existsSync("src/app/films/loading.tsx") &&
    existsSync("src/app/films/[slug]/loading.tsx") &&
    existsSync("src/app/error.tsx") &&
    existsSync("src/app/not-found.tsx") &&
    !existsSync("src/app/loading.tsx")
  );
});

check("CR", "CR09", "есть prefers-contrast: more", () => {
  return /@media \(prefers-contrast: more\)/.test(tokensCss);
});

check("CR", "CR10", "интерактив не меньше 44px по короткой стороне (правило объявлено)", () => {
  return /min-height:\s*(44|2\.75rem)|--tap-target/.test(allCss) || "правило не найдено";
});

check("CR", "CR11", "нет мёртвых стилей: каждый класс статьи используется", () => {
  const components = [
    ...readdirSync("src/components/film-article")
      .filter((name) => name.endsWith(".tsx"))
      .map((name) => read(`src/components/film-article/${name}`)),
    read("src/app/films/[slug]/page.tsx"),
    read("src/app/films/[slug]/article/page.tsx"),
    read("src/app/films/[slug]/making/page.tsx"),
  ].join("\n");
  const classes = [...new Set([...articleCss.matchAll(/\.([a-zA-Z][a-zA-Z0-9]+)/g)].map((m) => m[1]))];
  const orphans = classes.filter((name) => !components.includes(name));
  return orphans.length === 0 || `не найдено в разметке: ${orphans.slice(0, 6).join(",")}`;
});

check("CR", "CR12", "ассеты не сироты: каждый файл public/art упомянут в данных", () => {
  const dataText = read("src/data/film-illustrations.ts") + read("src/data/visual-assets.ts") + read("src/data/film-share-assets.ts");
  const orphans = artFiles.filter((name) => !dataText.includes(name));
  return orphans.length === 0 || orphans.join(",");
});

/* ── Report ──────────────────────────────────────────────────────────── */

const groups = {
  CO: "Контраст и цвет",
  TY: "Типографика",
  LA: "Ритм и сетка",
  MO: "Движение",
  IM: "Изображения",
  SE: "Семантика и доступность",
  ME: "Метаданные и соцкарточки",
  PE: "Бюджет веса",
  CR: "Ремесло",
};

let currentGroup = "";
for (const result of results) {
  if (result.group !== currentGroup) {
    currentGroup = result.group;
    console.log(`\n${groups[currentGroup] ?? currentGroup}`);
  }
  const mark = result.passed ? "  ok  " : " FAIL ";
  console.log(`${mark}${result.id}  ${result.title}${result.detail ? `  ← ${result.detail}` : ""}`);
}

const total = results.length;
console.log(`\n${total - failures}/${total} проверок пройдено`);
console.log(`оценка: ${Math.round(((total - failures) / total) * 100)} / 100`);

process.exitCode = failures === 0 ? 0 : 1;
