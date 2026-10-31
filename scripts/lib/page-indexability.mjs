/** Verify a page's indexability against the served site policy.
 * The audit must fail closed if robots.txt or sitemap.xml is missing/ambiguous;
 * a preview and an indexable production deployment have opposite expectations.
 */
import { DOMParser } from "@xmldom/xmldom";

function attribute(tag, name) {
  return new RegExp(`(?:^|\\s)${name}\\s*=\\s*["']([^"']*)["']`, "i").exec(tag)?.[1];
}

export function checkPageCanonical(html, pathname) {
  const tags = html.match(/<link\b[^>]*>/gi) ?? [];
  const canonicals = tags.filter((tag) => attribute(tag, "rel")?.toLowerCase() === "canonical");
  if (canonicals.length !== 1) return `ожидается ровно один canonical, найдено ${canonicals.length}`;
  const href = attribute(canonicals[0], "href");
  try {
    const url = new URL(href);
    return ((url.protocol === "https:" || url.protocol === "http:") && url.pathname === pathname &&
      !url.search && !url.hash && !url.username && !url.password) || `неверный canonical: ${href}`;
  } catch {
    return `некорректный canonical: ${href ?? "отсутствует"}`;
  }
}

// The application emits one wildcard group. A more complex robots.txt needs a
// crawler-specific review: never borrow a root rule from a different group and
// call the result a pass. This deliberately is not a general robots.txt parser.
function parseRobots(robots) {
  if (typeof robots !== "string") return { error: "robots.txt отсутствует" };
  const groups = [], sitemaps = [];
  let group;
  for (const raw of robots.split(/\r?\n/)) {
    const line = raw.split("#", 1)[0].trim();
    if (!line) continue;
    const colon = line.indexOf(":");
    if (colon <= 0) return { error: "robots.txt содержит некорректную строку" };
    const name = line.slice(0, colon).trim().toLowerCase();
    const value = line.slice(colon + 1).trim();
    if (name === "user-agent") {
      if (!value) return { error: "robots.txt содержит пустой User-agent" };
      if (!group || group.hasRules) {
        group = { agents: [], rules: [], hasRules: false };
        groups.push(group);
      }
      group.agents.push(value.toLowerCase());
    } else if (name === "allow" || name === "disallow") {
      if (!group) return { error: "директива robots.txt не относится к User-agent" };
      group.hasRules = true;
      // An empty directive has no effect. Encoded, query-bearing or otherwise
      // ambiguous patterns need a real crawler-specific assessment, not a pass.
      if (!value) continue;
      if (!value.startsWith("/") || /[%?\s]|[^\x21-\x7e]/.test(value) ||
          (value.includes("$") && (value.indexOf("$") !== value.length - 1 || value.lastIndexOf("$") !== value.length - 1))) {
        return { error: `неподдерживаемый путь в robots.txt: ${value}` };
      }
      group.rules.push({ name, value });
    } else if (name === "sitemap") {
      if (!value) return { error: "robots.txt содержит пустой Sitemap" };
      sitemaps.push(value);
    } else if (name !== "host") {
      return { error: `неподдерживаемая директива robots.txt: ${name}` };
    }
  }
  if (groups.length !== 1 || groups[0].agents.length !== 1 || groups[0].agents[0] !== "*") {
    return { error: "robots.txt требует отдельной проверки групп User-agent" };
  }
  return { rules: groups[0].rules, sitemaps };
}

// Match the simple ASCII prefix / wildcard / trailing-$ syntax emitted or
// supported by this audit. The linear scan avoids compiling untrusted globs into
// a potentially exponential regular expression.
function ruleMatchesPath(rule, pathname) {
  const anchored = rule.endsWith("$");
  const pattern = anchored ? rule.slice(0, -1) : rule;
  const parts = pattern.split("*");
  if (!pathname.startsWith(parts[0])) return false;
  let cursor = parts[0].length;
  if (parts.length === 1) return !anchored || cursor === pathname.length;
  for (const part of parts.slice(1, -1)) {
    const position = pathname.indexOf(part, cursor);
    if (position < 0) return false;
    cursor = position + part.length;
  }
  const last = parts.at(-1);
  if (anchored && last) return pathname.endsWith(last) && pathname.length - last.length >= cursor;
  return pathname.indexOf(last, cursor) >= 0;
}

// Parse the actual XML and its sitemap namespace instead of treating a string
// containing <urlset> and <loc> as a valid sitemap. XML warnings, DTDs, wrong
// nesting and invalid loc URLs all require review rather than a green audit.
function parseSitemap(sitemap) {
  if (typeof sitemap !== "string" || /<!DOCTYPE(?:\s|>)/i.test(sitemap)) return { error: "некорректный sitemap.xml" };
  const errors = [];
  let document;
  try {
    document = new DOMParser({ onError: (level, message) => errors.push({ level, message }) })
      .parseFromString(sitemap, "application/xml");
  } catch {
    return { error: "sitemap.xml не является корректным XML" };
  }
  const namespace = "http://www.sitemaps.org/schemas/sitemap/0.9";
  const roots = Array.from(document.childNodes).filter((node) => node.nodeType === 1);
  const root = document.documentElement;
  if (errors.length || document.doctype || roots.length !== 1 || !root ||
      Array.from(document.childNodes).some((node) => [3, 4].includes(node.nodeType) && node.data.trim()) ||
      root.localName !== "urlset" || root.namespaceURI !== namespace) {
    return { error: "sitemap.xml не является корректным набором URL" };
  }
  const locations = [];
  for (const node of Array.from(root.childNodes)) {
    if ([3, 4].includes(node.nodeType) && node.data.trim()) return { error: "текст вне URL в sitemap.xml" };
    if (node.nodeType !== 1) continue;
    if (node.localName !== "url" || node.namespaceURI !== namespace) return { error: "неверная структура sitemap.xml" };
    const children = Array.from(node.childNodes);
    if (children.some((child) => [3, 4].includes(child.nodeType) && child.data.trim())) {
      return { error: "текст вне loc в sitemap.xml" };
    }
    const locs = children.filter((child) =>
      child.nodeType === 1 && child.localName === "loc" && child.namespaceURI === namespace,
    );
    if (locs.length !== 1 || Array.from(locs[0].childNodes).some((child) => child.nodeType === 1)) {
      return { error: "каждый URL в sitemap.xml должен иметь один loc" };
    }
    try {
      const url = new URL(locs[0].textContent.trim());
      if (!["https:", "http:"].includes(url.protocol) || url.username || url.password || url.hash) throw new Error("invalid URL");
      locations.push(url);
    } catch {
      return { error: "sitemap.xml содержит некорректный loc" };
    }
  }
  return { locations };
}

export function checkPageIndexability(html, robots, sitemap, pathname) {
  const canonicalCheck = checkPageCanonical(html, pathname);
  if (canonicalCheck !== true) return canonicalCheck;
  const policy = parseRobots(robots);
  if (policy.error) return policy.error;
  const allowsRoot = policy.rules.some((rule) => rule.name === "allow" && rule.value === "/");
  const disallowsRoot = policy.rules.some((rule) => rule.name === "disallow" && rule.value === "/");
  if (allowsRoot === disallowsRoot) return "robots.txt не задаёт однозначную политику для корня сайта";

  const matched = policy.rules.filter((rule) => ruleMatchesPath(rule.value, pathname));
  if (new Set(matched.map((rule) => rule.name)).size > 1 && matched.some((rule) => /[*$]/.test(rule.value))) {
    return "конфликтующие wildcard-правила robots.txt требуют отдельной проверки";
  }
  const winner = matched.reduce((best, rule) => !best || rule.value.length > best.value.length ||
    (rule.value.length === best.value.length && rule.name === "allow") ? rule : best, null);
  if (!winner || (winner.name === "allow") !== allowsRoot) {
    return allowsRoot ? "robots.txt запрещает проверяемую публичную страницу" : "robots.txt разрешает страницу на закрытом сайте";
  }

  const parsedSitemap = parseSitemap(sitemap);
  if (parsedSitemap.error) return parsedSitemap.error;
  const canonicalTag = (html.match(/<link\b[^>]*>/gi) ?? [])
    .find((tag) => attribute(tag, "rel")?.toLowerCase() === "canonical");
  const canonical = new URL(attribute(canonicalTag, "href"));
  if (allowsRoot && policy.sitemaps.length && !policy.sitemaps.some((value) => {
    try { return new URL(value).href === `${canonical.origin}/sitemap.xml`; } catch { return false; }
  })) return "robots.txt указывает sitemap другого адреса";

  const metaTags = html.match(/<meta\b[^>]*>/gi) ?? [];
  const directives = metaTags
    .filter((tag) => attribute(tag, "name")?.toLowerCase() === "robots")
    .flatMap((tag) => (attribute(tag, "content") ?? "").toLowerCase().split(/\s*,\s*/));
  const noindex = directives.includes("noindex");
  const nofollow = directives.includes("nofollow");
  const locations = parsedSitemap.locations;
  if (allowsRoot && locations.some((url) => url.origin !== canonical.origin)) {
    return "sitemap.xml содержит URL другого origin";
  }
  const samePath = locations.filter((url) => url.pathname === pathname && !url.search && !url.hash);
  const listedOnCanonicalOrigin = samePath.some((url) => url.origin === canonical.origin);

  if (disallowsRoot) {
    if (!noindex || !nofollow) return "закрытый сайт требует noindex, nofollow у страницы";
    if (samePath.length) return "закрытый сайт не должен включать страницу в sitemap";
  } else {
    if (noindex || nofollow) return "публичная страница остаётся noindex или nofollow";
    if (!listedOnCanonicalOrigin) return "публичная страница отсутствует в sitemap на canonical origin";
  }
  return true;
}
