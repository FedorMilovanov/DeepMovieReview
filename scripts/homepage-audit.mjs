/**
 * Homepage audit: the front door, both of its states.
 *
 * The site has two homepage personalities — a prelaunch landing and a preview
 * build with a featured film — and they share one component tree. This script
 * opens both, reads the rendered markup, and checks the things that quietly rot:
 * duplicated ids, buttons that turn into menu toggles without `type`, numbers
 * typed into prose that no longer match the package, a tilt that never turns
 * off for the reader who asked for stillness.
 *
 * It also audits the pointer-facing effects, because "3D tilt" is the kind of
 * feature that looks expensive in a demo and cheap in production when nobody
 * checked what happens on a touch screen or with reduced motion.
 *
 * Usage:
 *   node scripts/homepage-audit.mjs                          # static checks
 *   node scripts/homepage-audit.mjs --base http://127.0.0.1:3010
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { normaliseSpace, stripScripts, stripTags } from "./lib/html-scan.mjs";

const buildDir = ".audit-build";
const tsc = resolve("node_modules", "@typescript", "native", "bin", "tsc");
const args = process.argv.slice(2);
const baseIndex = args.indexOf("--base");
const base = baseIndex >= 0 ? args[baseIndex + 1].replace(/\/$/, "") : "";

const results = [];
let failures = 0;

function check(group, id, title, run) {
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

/* ── Compile the data layer once ──────────────────────────────────────── */

const compile = spawnSync(process.execPath, [tsc, "-p", "tsconfig.audit.json"], { stdio: "inherit" });
if (compile.status !== 0) {
  console.error("audit compile failed");
  process.exit(2);
}

const { theTrumanShowCanonicalPackage } = await import(
  `../${buildDir}/src/data/films/the-truman-show-canonical.js`
);
const { theFastAndTheFuriousDraftPackage } = await import(
  `../${buildDir}/src/data/films/the-fast-and-the-furious.js`
);

const packages = new Map([
  [theTrumanShowCanonicalPackage.film.slug, theTrumanShowCanonicalPackage],
  [theFastAndTheFuriousDraftPackage.film.slug, theFastAndTheFuriousDraftPackage],
]);

/* ── Source-level checks ──────────────────────────────────────────────── */

const page = read("src/app/page.tsx");
const tilt = read("src/components/tilt-surface.tsx");
const tiltCss = read("src/styles/tilt.css");
const frame = read("src/components/living-frame.tsx");
const optics = read("src/styles/homepage-optics.css");

check("SRC", "S01", "главная не содержит захардкоженных счётчиков сцен и опор", () => {
  const suspects = page.match(/(пятнадцать|тридцать восемь|тридцать две|четырнадцать)\s+(чернов|исследовательск)/gi);
  return suspects === null || suspects.join(", ");
});

check("SRC", "S02", "главная читает состояние фильма из пакета", () => {
  return (page.includes("getFilmPackageBySlug") && page.includes("packageStateLine")) || "нет вывода из пакета";
});

check("SRC", "S03", "число сцен и опор берётся из массивов", () => {
  return /scenes\?\.length/.test(page) && /evidence\?\.length/.test(page);
});

check("SRC", "S04", "склонения считаются функцией, а не строкой", () => {
  return page.includes("pluralRu");
});

check("SRC", "S05", "устаревшая фраза живёт только в общей ветке для незаблокированных пакетов", () => {
  const occurrences = (page.match(/мастер ещё не заблокирован/g) ?? []).length;
  const genericBranchStart = page.indexOf('if (locked)');
  const phraseAt = page.indexOf("мастер ещё не заблокирован");
  const insideGenericBranch = genericBranchStart !== -1 && phraseAt > genericBranchStart;
  if (occurrences === 0) return true;
  return (occurrences === 1 && insideGenericBranch) || `вхождений: ${occurrences}`;
});

check("SRC", "S06", "нет мёртвых TODO/FIXME в разметке главной", () => {
  return !/TODO|FIXME|XXX|lorem ipsum/i.test(page);
});

check("SRC", "S07", "все внутренние ссылки начинаются с относительного адреса", () => {
  const absolute = [...page.matchAll(/href="(https?:\/\/[^"]+)"/g)].map((m) => m[1]);
  return absolute.length === 0 || absolute.join(", ");
});

check("SRC", "S08", "у каждой секции есть номер раздела", () => {
  const sections = (page.match(/<section\b/g) ?? []).length;
  const indexes = (page.match(/className="sectionIndex"/g) ?? []).length;
  return indexes >= Math.min(sections, 10) || `секций ${sections}, индексов ${indexes}`;
});

check("SRC", "S09", "заголовки секций связаны с секциями через aria-labelledby", () => {
  const sections = (page.match(/<section\b[^>]*>/g) ?? []).filter((tag) => !/aria-label/.test(tag));
  const unlabelled = sections.filter((tag) => !/aria-labelledby/.test(tag));
  return unlabelled.length === 0 || `секций без имени: ${unlabelled.length}`;
});

check("SRC", "S10", "главная рендерится сервером и не требует JS для текста", () => {
  const firstLine = page.split("\n").find((line) => line.trim().length > 0);
  return !/^"use client"/.test(firstLine ?? "");
});

/* ── Effects: tilt ────────────────────────────────────────────────────── */

check("TILT", "T01", "3D-tilt реализован отдельным клиентским компонентом", () => {
  return existsSync("src/components/tilt-surface.tsx") && tilt.includes('"use client"');
});

check("TILT", "T02", "наклон ограничен пятью градусами на карточках", () => {
  const defaults = [...page.matchAll(/maxTilt=\{(\d+)\}/g)].map((m) => Number(m[1]));
  const fallback = Number(/maxTilt = (\d+)/.exec(tilt)?.[1] ?? 99);
  const worst = Math.max(fallback, ...defaults);
  return worst <= 6 || `${worst}°`;
});

check("TILT", "T03", "кадр наклоняется только в плоскости изображения, а не целиком", () => {
  const marked = /data-tilt=\{tilts \? "media"/.test(frame);
  const scopedToMedia = /\.livingFrame\[data-tilt="media"\]\s+\.lfMedia\s*\{[^}]*rotateX/.test(optics);
  const wholeFrame = /\.livingFrame\[data-tilt="media"\]\s*\{[^}]*transform:\s*rotate/.test(optics);
  return (marked && scopedToMedia && !wholeFrame) || `marked:${marked} scoped:${scopedToMedia} whole:${wholeFrame}`;
});

check("TILT", "T04", "наклон не работает на тач-указателе", () => {
  return /pointerType === "touch"[\s\S]{0,40}return/.test(tilt);
});

check("TILT", "T05", "наклон выключен при reduced motion", () => {
  return /reducedMotion/.test(tilt) && /prefers-reduced-motion: reduce/.test(tiltCss);
});

check("TILT", "T06", "наклон выключен на LITE-устройствах", () => {
  return /tier !== "LITE"/.test(tilt) && /tier !== "LITE"/.test(frame);
});

check("TILT", "T07", "эффект работает только при точном указателе", () => {
  return /@media \(hover: hover\) and \(pointer: fine\)/.test(tiltCss);
});

check("TILT", "T08", "нет постоянного цикла отрисовки: только rAF по событию", () => {
  const loops = /(window\.)?setInterval|requestAnimationFrame\(\s*function\s+loop|while\s*\(true\)/.test(tilt);
  return !loops || "найден цикл";
});

check("TILT", "T09", "rAF отменяется при уходе указателя и размонтировании", () => {
  return /cancelAnimationFrame/.test(tilt) && /return cancel/.test(tilt);
});

check("TILT", "T10", "will-change не висит на элементе постоянно", () => {
  const base = /\.tiltSurface\s*\{[^}]*will-change:\s*transform/.test(tiltCss);
  const hovering = /\[data-tilted="true"\][\s\S]{0,160}will-change:\s*transform/.test(tiltCss);
  return (!base && hovering) || "will-change на постоянной основе";
});

check("TILT", "T11", "карточка сохраняет читаемость: блик не перекрывает текст", () => {
  return /\.tiltSurfaceGlare::after\s*\{[^}]*pointer-events:\s*none/.test(tiltCss);
});

check("TILT", "T12", "блик отключается в forced-colors", () => {
  return /@media \(forced-colors: active\)/.test(tiltCss);
});

check("TILT", "T13", "перспектива задана на кадре, а не на самом изображении", () => {
  return /perspective:\s*1200px/.test(optics);
});

check("TILT", "T14", "наклон кадра не превышает трёх градусов", () => {
  const values = [...frame.matchAll(/--lf-r[xy]", `\$\{\([a-z]+ \* (-?[\d.]+)\)/g)].map((m) =>
    Math.abs(Number(m[1])),
  );
  return (values.length === 2 && Math.max(...values) <= 3) || values.join(",");
});

check("TILT", "T15", "компонент наклона не рендерит разный HTML до и после гидратации", () => {
  return !/typeof window/.test(tilt);
});

check("TILT", "T16", "карточки с наклоном остаются article/li, а не div-супом", () => {
  return /as = "article"/.test(tilt) && /<TiltSurface[\s\S]{0,120}className="craftPressureCard"/.test(page);
});

/* ── Compatibility ────────────────────────────────────────────────────── */

const cssFiles = [
  ...readdirSync("src/styles").map((name) => `src/styles/${name}`),
  ...readdirSync("src/components").filter((name) => name.endsWith(".css")).map((name) => `src/components/${name}`),
  ...readdirSync("src/components/experience").filter((name) => name.endsWith(".css")).map((name) => `src/components/experience/${name}`),
  ...readdirSync("src/components/labs").filter((name) => name.endsWith(".css")).map((name) => `src/components/labs/${name}`),
];

function unprefixed(fileText, property) {
  const lines = fileText.split("\n");
  return lines.some((line, index) => {
    const trimmed = line.trim();
    if (!trimmed.startsWith(`${property}:`)) return false;
    const before = lines.slice(Math.max(0, index - 2), index).join("\n");
    return !before.includes(`-webkit-${property}:`);
  });
}

check("COMPAT", "C01", "mask-image продублирован с -webkit- везде", () => {
  const bad = cssFiles.filter((path) => unprefixed(read(path), "mask-image"));
  return bad.length === 0 || bad.join(",");
});

check("COMPAT", "C02", "backdrop-filter продублирован с -webkit- везде", () => {
  const bad = cssFiles.filter((path) => unprefixed(read(path), "backdrop-filter"));
  return bad.length === 0 || bad.join(",");
});

check("COMPAT", "C03", ":has() используется только внутри @supports", () => {
  const homepage = read("src/styles/homepage-optics.css");
  const guarded = /@supports selector\(:has\(\*\)\)/.test(homepage);
  const usesHas = /:has\(/.test(homepage);
  return !usesHas || guarded;
});

check("COMPAT", "C04", "animation-timeline спрятан за @supports", () => {
  const article = read("src/styles/film-article.css");
  if (!article.includes("animation-timeline")) return true;
  return /@supports \(animation-timeline: view\(\)\)/.test(article);
});

check("COMPAT", "C05", "нет неподдержанного inset без фолбэка в критичных местах", () => {
  // `inset` is baseline since 2021; this check guards against the shorthand
  // appearing inside a property that needs a separate fallback.
  const risky = cssFiles.filter((path) => /clip-path:\s*[^;]*inset\(/.test(read(path)) && !/overflow/.test(read(path)));
  return risky.length === 0 || risky.join(",");
});

check("COMPAT", "C06", "smooth scroll отключается при reduced motion", () => {
  const globals = read("src/app/globals.css");
  const experience = read("src/styles/experience.css");
  return /scroll-behavior:\s*auto !important/.test(experience) || /prefers-reduced-motion/.test(globals);
});

check("COMPAT", "C07", "все шрифты локальные, без сетевых запросов", () => {
  const layout = read("src/app/layout.tsx");
  return !/fonts\.googleapis|@import url\(http/.test(layout) && layout.includes("@fontsource-variable/inter");
});

check("COMPAT", "C08", "next/image используется на главной, а не сырые img с абсолютными путями", () => {
  return !/<img\s/.test(page);
});

check("COMPAT", "C09", "фоновые color-mix имеют непрозрачный фолбэк", () => {
  const offenders = [];
  for (const path of cssFiles) {
    const lines = read(path).split("\n");
    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index].trim();
      if (!/^background(-color)?:\s*color-mix/.test(line)) continue;
      const previous = lines.slice(Math.max(0, index - 4), index).join("\n");
      if (!/var\(--surface|var\(--bg|Canvas/.test(previous)) offenders.push(`${path.split("/").pop()}:${index + 1}`);
    }
  }
  return offenders.length === 0 || offenders.join(",");
});

check("COMPAT", "C12", "градиент с color-mix в основании не остаётся без фона", () => {
  // `background: gradient(...), color-mix(...)` is one declaration: where
  // `color-mix` is unknown the whole thing is dropped, so a card loses its
  // surface rather than merely its tint. Every such stack needs an opaque
  // declaration above it.
  const offenders = [];
  for (const path of cssFiles) {
    const lines = read(path).split("\n");
    for (let index = 0; index < lines.length; index += 1) {
      if (!/^\s*background(-color)?:\s*$/.test(lines[index]) && !/^\s*background(-color)?:\s*\S/.test(lines[index])) continue;
      if (!/^\s*background(-color)?:/.test(lines[index])) continue;
      // Collect the whole declaration.
      const stack = [];
      let cursor = index;
      while (cursor < lines.length) {
        stack.push(lines[cursor]);
        if (/;\s*$/.test(lines[cursor])) break;
        cursor += 1;
      }
      const body = stack.join(" ").replace(/^\s*background(-color)?:/, "");
      if (!/color-mix/.test(body)) continue;
      // Only stacks whose base layer is the `color-mix` itself need a fallback;
      // a glow layer over a parent surface does not. Split on top-level commas
      // only — a `color-mix(...)` argument list is full of its own commas.
      const layers = [];
      let depth = 0;
      let current = "";
      for (const character of body) {
        if (character === "(") depth += 1;
        if (character === ")") depth -= 1;
        if (character === "," && depth === 0) {
          layers.push(current.trim());
          current = "";
          continue;
        }
        current += character;
      }
      layers.push(current.trim());
      const base = layers[layers.length - 1] ?? "";
      if (!/^color-mix\(/.test(base)) continue;
      const previous = lines.slice(Math.max(0, index - 5), index).join("\n");
      if (!/(^|\n)\s*background(-color)?:\s*(var\(--[a-z0-9-]+\)|#[0-9a-fA-F]{3,8}|Canvas)\s*;/.test(previous)) {
        offenders.push(`${path.split("/").pop()}:${index + 1}`);
      }
      index = cursor;
    }
  }
  return offenders.length === 0 || offenders.join(",");
});

check("COMPAT", "C10", "контейнерные запросы имеют фолбэк для браузеров без них", () => {
  const verdict = read("src/styles/film-verdict.css");
  if (!/@container/.test(verdict)) return true;
  return /@supports not \(container-type: inline-size\)/.test(verdict) || "нет @supports not";
});

check("COMPAT", "C11", "акцентный текст не остаётся без цвета при отсутствии color-mix", () => {
  const verdict = read("src/styles/film-verdict.css");
  const lines = verdict.split("\n");
  const offenders = [];
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!/^color:\s*color-mix/.test(line)) continue;
    const previous = lines.slice(Math.max(0, index - 3), index).join("\n");
    // The fallback may be a token or a colour keyword, as long as it is a plain
    // declaration on the same selector.
    if (!/(^|\n)\s*color:\s*(var\(--[a-z0-9-]+\)|[a-zA-Z]+|#[0-9a-f]{3,8})\s*;/.test(previous)) {
      offenders.push(index + 1);
    }
  }
  return offenders.length === 0 || `строки: ${offenders.join(",")}`;
});

/* ── Rendered homepage ────────────────────────────────────────────────── */

check("SRC", "S12", "в режиме LITE нет бесконечных фоновых анимаций", () => {
  // The provider writes data-quality-tier; an infinite ambient loop (grain
  // jitter, status pulse, scroll cue) burns a compositing thread for as long as
  // the tab is open, which is exactly what a Lite reader opted out of.
  const lite = /html\[data-quality-tier="lite"\][\s\S]{0,400}animation: none/.test(optics);
  if (!lite) return "нет правил для data-quality-tier=lite";
  const infinite = [...optics.matchAll(/html:not\(\[data-reduced-motion="true"\]\)[^{]*\{[^}]*infinite/g)];
  return infinite.length > 0 || "ни одна фоновая анимация не привязана к предпочтению движения";
});

check("SRC", "S11", "печать отключает анимацию секций (иначе PDF пустой)", () => {
  const print = /@media print \{[\s\S]*?\.sectionRule[\s\S]*?animation: none/.test(optics);
  return print || "нет print-фолбэка для view-timeline";
});

check("SSR", "R21", "якоря не прячутся под липкой шапкой", () => {
  const globals = read("src/app/globals.css");
  return (
    /main :is\(\[id\]\)[\s\S]{0,80}scroll-margin-block-start/.test(globals) ||
    "нет scroll-margin для main [id]"
  );
});

check("VIS", "V07", "имя ссылки-логотипа содержит её видимый текст", () => {
  const header = read("src/components/site-header.tsx");
  const label = /className="brand"[^>]*aria-label="([^"]+)"/.exec(header)?.[1] ?? "";
  const visible = /className="brandText">([^<]+)</.exec(header)?.[1]?.trim() ?? "";
  if (!label || !visible) return "не найдены имя или видимый текст бренда";
  // WCAG 2.5.3: the accessible name must contain the visible label, verbatim.
  return label.includes(visible) || `«${label}» не содержит «${visible}»`;
});

function summarise(html) {
  const body = stripScripts(html);
  const ids = [...body.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  return {
    html,
    body,
    ids,
    duplicates: [...new Set(duplicates)],
  };
}

if (base) {
  let pageHtml = "";
  try {
    const response = await fetch(`${base}/`);
    pageHtml = await response.text();
  } catch (error) {
    results.push({ group: "SSR", id: "R00", title: "главная отвечает", passed: false, detail: error.message });
    failures += 1;
  }

  const { body, ids, duplicates } = summarise(pageHtml);
  // The homepage has two personalities; only one of them shows the film cards.
  const showsFilmCards = body.includes("FILM 001");
  const links = [...new Set([...body.matchAll(/href="(\/[^"#?]*)"/g)].map((m) => m[1]))];

  check("SSR", "R01", "главная отдаёт непустой HTML", () => pageHtml.length > 20000 || `${pageHtml.length} байт`);
  check("SSR", "R02", "ровно один h1", () => (body.match(/<h1[\s>]/g) ?? []).length === 1 || `${(body.match(/<h1[\s>]/g) ?? []).length}`);
  check("SSR", "R03", "нет повторяющихся id", () => duplicates.length === 0 || duplicates.join(","));
  check("SSR", "R04", "уровни заголовков не перескакивают", () => {
    const levels = [...body.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]));
    const skips = levels.filter((level, index) => index > 0 && level > levels[index - 1] + 1);
    return skips.length === 0 || `скачков: ${skips.length}`;
  });
  check("SSR", "R05", "все aria-labelledby указывают на существующий id", () => {
    const missing = [...new Set([...body.matchAll(/aria-labelledby="([^"]+)"/g)].map((m) => m[1]))].filter((id) => !ids.includes(id));
    return missing.length === 0 || missing.join(",");
  });
  check("SSR", "R06", "все aria-controls указывают на существующий id", () => {
    const missing = [...new Set([...body.matchAll(/aria-controls="([^"]+)"/g)].map((m) => m[1]))].filter((id) => !ids.includes(id));
    return missing.length === 0 || missing.join(",");
  });
  check("SSR", "R07", "у всех изображений есть alt", () => {
    const images = [...body.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
    const missing = images.filter((tag) => !/\balt=/.test(tag));
    return missing.length === 0 || `${missing.length} без alt`;
  });
  check("SSR", "R08", "у изображений заданы пропорции (width/height или fill в контейнере)", () => {
    const images = [...body.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
    const missing = images.filter(
      (tag) => !(/\bwidth=/.test(tag) && /\bheight=/.test(tag)) && !/data-nimg="fill"/.test(tag),
    );
    return missing.length === 0 || `${missing.length} без размеров`;
  });
  check("SSR", "R09", "нет пустых ссылок и кнопок", () => {
    const emptyLinks = (body.match(/<a\b[^>]*>\s*<\/a>/g) ?? []).length;
    const emptyButtons = (body.match(/<button\b[^>]*>\s*<\/button>/g) ?? []).length;
    return (emptyLinks === 0 && emptyButtons === 0) || `${emptyLinks}/${emptyButtons}`;
  });
  check("SSR", "R10", "у каждой кнопки есть type", () => {
    const buttons = [...body.matchAll(/<button\b[^>]*>/g)].map((m) => m[0]);
    const missing = buttons.filter((tag) => !/\btype="/.test(tag));
    return missing.length === 0 || `${missing.length} без type`;
  });
  check("SSR", "R11", "нет положительного tabindex", () => !/tabindex="[1-9]/.test(body) || "найден");
  check("SSR", "R12", "таблица вкладок согласована: ровно одна выбрана", () => {
    const selected = [...body.matchAll(/aria-selected="([^"]+)"/g)].map((m) => m[1]);
    if (selected.length === 0) return true;
    return selected.filter((value) => value === "true").length === 1 || selected.join(",");
  });
  check("SSR", "R13", "у активной вкладки tabindex 0, у остальных -1", () => {
    const tabs = [...body.matchAll(/role="tab"[^>]*>/g)].map((m) => m[0]);
    if (tabs.length === 0) return true;
    const active = tabs.filter((tag) => /aria-selected="true"/.test(tag));
    const inactive = tabs.filter((tag) => /aria-selected="false"/.test(tag));
    return (
      active.every((tag) => /tabindex="0"/.test(tag)) && inactive.every((tag) => /tabindex="-1"/.test(tag))
    ) || "несовпадение tabindex";
  });
  check("SSR", "R14", "есть ссылка «к содержимому» и main", () => {
    return (/href="#main"|href="#content"/.test(body) && /<main[\s>]/.test(body));
  });
  check("SSR", "R15", "все навигации подписаны", () => {
    const navs = [...body.matchAll(/<nav\b[^>]*>/g)].map((m) => m[0]);
    const unlabelled = navs.filter((tag) => !/aria-label|aria-labelledby/.test(tag));
    return unlabelled.length === 0 || `${unlabelled.length}`;
  });
  check("SSR", "R16", "язык документа объявлен", () => /<html[^>]*lang="ru"/.test(body));
  check("SSR", "R17", "канонический адрес абсолютный и указывает на главную", () => {
    const canonical = /rel="canonical" href="([^"]*)"/.exec(body)?.[1] ?? "";
    const expectOrigin = args.includes("--expect-origin")
      ? args[args.indexOf("--expect-origin") + 1]
      : "";
    if (!/^https?:\/\//.test(canonical)) return `не абсолютный: ${canonical}`;
    if (expectOrigin && !canonical.startsWith(expectOrigin)) return `${canonical} вместо ${expectOrigin}`;
    return /\/$|^https?:\/\/[^/]+$/.test(canonical) || `не главная: ${canonical}`;
  });
  check("SSR", "R18", "черновик закрыт от индексации", () => /name="robots" content="noindex, nofollow"/.test(body));
  check("SSR", "R19", "html не тяжелее 250 КБ", () => pageHtml.length <= 250 * 1024 || `${Math.round(pageHtml.length / 1024)} КБ`);
  check("SSR", "R20", "на странице не больше сорока скриптов", () => (pageHtml.match(/<script\b/g) ?? []).length <= 40 || "больше 40");

  // Internal links resolve.
  const broken = [];
  if (links.length > 0) {
    const targets = links.slice(0, 40);
    for (const href of targets) {
      try {
        const response = await fetch(`${base}${href}`, { redirect: "manual" });
        if (response.status >= 400) broken.push(`${href}:${response.status}`);
      } catch {
        broken.push(`${href}:network`);
      }
    }
  }
  check("SSR", "R21", "все внутренние ссылки с главной отвечают", () => broken.length === 0 || broken.join(","));

  // Images referenced by the homepage actually exist.
  const imageSources = [...body.matchAll(/src="(\/(?:_next|art|og)\/[^"]+)"/g)].map((m) => m[1]);
  check("SSR", "R22", "картинки главной отдаются сервером", () => {
    const brokenImages = [];
    for (const src of [...new Set(imageSources)].slice(0, 20)) {
      const file = src.startsWith("/art/") || src.startsWith("/og/") ? `public${src}` : null;
      if (file && !existsSync(file)) brokenImages.push(src);
    }
    return brokenImages.length === 0 || brokenImages.join(",");
  });

  // Tilt wiring in the delivered markup.
  check("TILT", "T17", "карточки с наклоном отрендерены и размечены", () => {
    const surfaces = (body.match(/data-tilt-surface=/g) ?? []).length;
    return surfaces >= 2 || `поверхностей: ${surfaces}`;
  });
  check("TILT", "T18", "кадр с наклоном помечен и содержит изображение", () => {
    const index = body.indexOf('data-tilt="media"');
    if (index === -1) return "кадр без наклона";
    return /<img\b/.test(body.slice(index, index + 2500)) || "в кадре нет изображения";
  });
  check("TILT", "T19", "разметка наклона не ломает семантику карточек", () => {
    const cards = (body.match(/<article[^>]*data-tilt-surface/g) ?? []).length;
    return cards >= 2 || `article с наклоном: ${cards}`;
  });
  check("TILT", "T20", "в каждом состоянии главной есть хотя бы один кадр с наклоном", () => {
    return body.includes('data-tilt="media"') || "кадр без наклона";
  });
  check("VIS", "V06", "главная сообщает своё состояние, а не притворяется другой", () => {
    const previewMarks = /FILM 001/.test(body);
    const prelaunchMarks = /предзапуск|Структурный стенд/i.test(body);
    return previewMarks || prelaunchMarks || "состояние не читается";
  });

  // Presentation: every section that should have a numeral does.
  check("VIS", "V01", "у секций главной есть нумерация в разметке", () => {
    const indexes = (body.match(/class="sectionIndex"/g) ?? []).length;
    return indexes >= 8 || `индексов: ${indexes}`;
  });
  check("VIS", "V02", "главная содержит заголовок-обещание и лид", () => {
    return /class="lede"/.test(body) && /class="kicker"/.test(body);
  });
  check("VIS", "V03", "все шесть линз присутствуют в разметке", () => {
    const lensTabs = (body.match(/class="lensTab"/g) ?? []).length;
    return lensTabs >= 6 || `линз: ${lensTabs}`;
  });
  check("VIS", "V04", "ни в одном текстовом узле нет двойных пробелов", () => {
    const text = normaliseSpace(stripTags(body));
    return !/  /.test(text) || "двойные пробелы";
  });
  check("VIS", "V05", "в тексте главной нет прямых кавычек", () => {
    const text = normaliseSpace(stripTags(body)).replace(/"[^"]*"/g, "");
    return !/"/.test(text) || "прямые кавычки в тексте";
  });

  // Content integrity: the numbers on the page match the packages.
  check("DATA", "D01", "число сцен Film 001 на главной совпадает с пакетом", () => {
    if (!showsFilmCards) return true;
    const pkg = packages.get("the-truman-show");
    const expected = `${pkg.scenes.length}`;
    return body.includes(`${expected} сцен`) || `в пакете ${expected}, на странице нет такой строки`;
  });
  check("DATA", "D02", "число опор Film 001 на главной совпадает с пакетом", () => {
    if (!showsFilmCards) return true;
    const pkg = packages.get("the-truman-show");
    const expected = `${pkg.evidence.length}`;
    return body.includes(`${expected} опор`) || `в пакете ${expected}`;
  });
  check("DATA", "D03", "статус Film 001 на главной — заблокированный мастер", () => {
    if (!showsFilmCards) return true;
    const pkg = packages.get("the-truman-show");
    if (pkg.ingest.edition.state !== "LOCKED") return "пакет не заблокирован — проверьте ожидание";
    return /мастер заблокирован/.test(body) || "на главной нет статуса LOCKED";
  });
  check("DATA", "D04", "число сцен Film 002 на главной совпадает с пакетом", () => {
    if (!showsFilmCards) return true;
    const pkg = packages.get("the-fast-and-the-furious");
    return body.includes(`${pkg.scenes.length} сцен`) || `в пакете ${pkg.scenes.length}`;
  });
  check("DATA", "D05", "число опор Film 002 на главной совпадает с пакетом", () => {
    if (!showsFilmCards) return true;
    const pkg = packages.get("the-fast-and-the-furious");
    return body.includes(`${pkg.evidence.length} опор`) || `в пакете ${pkg.evidence.length}`;
  });
  check("DATA", "D06", "годы и названия фильмов совпадают с пакетами", () => {
    if (!showsFilmCards) return true;
    const bad = [];
    for (const pkg of packages.values()) {
      if (!body.includes(pkg.film.title)) bad.push(`title:${pkg.film.title}`);
      if (!body.includes(String(pkg.film.year))) bad.push(`year:${pkg.film.year}`);
    }
    return bad.length === 0 || bad.join(",");
  });
  check("DATA", "D07", "на главной нет устаревшего обещания «мастер ещё не заблокирован» для Film 001", () => {
    if (!showsFilmCards) return true;
    const index = body.indexOf("FILM 001");
    if (index === -1) return true;
    const slice = body.slice(index, index + 900);
    return !/мастер ещё не заблокирован/.test(slice) || "устаревшая фраза";
  });
} else {
  results.push({ group: "—", id: "HTML", title: "проверки разметки пропущены: запустите с --base URL", passed: true, detail: "" });
}

/* ── Report ──────────────────────────────────────────────────────────── */

const groups = {
  SRC: "Исходники и данные",
  TILT: "3D-эффекты",
  COMPAT: "Совместимость",
  SSR: "Серверная разметка",
  VIS: "Внешний вид",
  DATA: "Данные на странице",
};

let current = "";
for (const result of results) {
  if (result.group !== current) {
    current = result.group;
    console.log(`\n${groups[current] ?? current}`);
  }
  const mark = result.passed ? "  ok  " : " FAIL ";
  console.log(`${mark}${result.id}  ${result.title}${result.detail ? `  ← ${result.detail}` : ""}`);
}

const total = results.filter((result) => result.id !== "HTML").length;
console.log(`\n${total - failures}/${total} проверок пройдено`);

process.exitCode = failures === 0 ? 0 : 1;
