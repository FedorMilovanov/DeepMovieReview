/** Verify a page's indexability against the served site policy.
 * The audit must fail closed if robots.txt or sitemap.xml is missing/ambiguous;
 * a preview and an indexable production deployment have opposite expectations.
 */

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

export function checkPageIndexability(html, robots, sitemap, pathname) {
  const allowsRoot = /^\s*Allow:\s*\/\s*$/im.test(robots);
  const disallowsRoot = /^\s*Disallow:\s*\/\s*$/im.test(robots);
  if (allowsRoot === disallowsRoot) return "robots.txt не задаёт однозначную политику для корня сайта";

  if (!/<urlset(?:\s|>)/i.test(sitemap) || !/<\/urlset\s*>/i.test(sitemap)) {
    return "sitemap.xml не является ожидаемым набором URL";
  }
  const canonicalTag = (html.match(/<link\b[^>]*>/gi) ?? [])
    .find((tag) => attribute(tag, "rel")?.toLowerCase() === "canonical");
  let canonical;
  try { canonical = new URL(attribute(canonicalTag ?? "", "href")); }
  catch { return "у страницы нет корректного canonical для проверки sitemap"; }
  if (canonical.pathname !== pathname || canonical.search || canonical.hash) return "canonical ведёт не на эту страницу";

  const metaTags = html.match(/<meta\b[^>]*>/gi) ?? [];
  const directives = metaTags
    .filter((tag) => attribute(tag, "name")?.toLowerCase() === "robots")
    .flatMap((tag) => (attribute(tag, "content") ?? "").toLowerCase().split(/\s*,\s*/));
  const noindex = directives.includes("noindex");
  const nofollow = directives.includes("nofollow");
  const locations = [...sitemap.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].flatMap((match) => {
    try { return [new URL(match[1])]; } catch { return []; }
  });
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
