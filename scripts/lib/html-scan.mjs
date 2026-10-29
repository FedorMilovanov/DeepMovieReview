/**
 * Small, dependency-free scanners for the audit scripts.
 *
 * The audits have to look at real rendered HTML, and they used to do it with
 * regular expressions. That is fine for a tag, and wrong for a `<script>`
 * element: the payload contains its own closing tokens, the tags may be in any
 * case, and a pattern that "removes scripts" is exactly the pattern a static
 * analyser flags as an injection hazard. These helpers walk the string instead,
 * so every step is explicit.
 */

/** Removes every `<script>…</script>` element, tags included. */
export function stripScripts(html) {
  const lower = html.toLowerCase();
  let output = "";
  let cursor = 0;
  for (;;) {
    const open = lower.indexOf("<script", cursor);
    if (open === -1) return output + html.slice(cursor);
    output += html.slice(cursor, open);
    const tagEnd = lower.indexOf(">", open);
    if (tagEnd === -1) return output;
    const close = lower.indexOf("</script", tagEnd);
    if (close === -1) return output;
    const closeEnd = lower.indexOf(">", close);
    if (closeEnd === -1) return output;
    cursor = closeEnd + 1;
  }
}

/** Removes markup, leaving the text a reader would see. */
export function stripTags(fragment) {
  let output = "";
  let cursor = 0;
  for (;;) {
    const open = fragment.indexOf("<", cursor);
    if (open === -1) return output + fragment.slice(cursor);
    output += fragment.slice(cursor, open);
    const close = fragment.indexOf(">", open);
    if (close === -1) return output + fragment.slice(open);
    cursor = close + 1;
  }
}

/** Collapses runs of whitespace, the way a browser would when rendering. */
export function normaliseSpace(text) {
  return text.replace(/\s+/g, " ").trim();
}

/**
 * Every `<script type="application/ld+json">…</script>` payload on the page.
 *
 * Returned raw: the caller decides whether a payload is valid JSON, and one
 * broken block should not hide the others.
 */
export function extractJsonLd(html) {
  const lower = html.toLowerCase();
  const blocks = [];
  let cursor = 0;
  for (;;) {
    const open = lower.indexOf("<script", cursor);
    if (open === -1) return blocks;
    const tagEnd = lower.indexOf(">", open);
    if (tagEnd === -1) return blocks;
    const tag = html.slice(open, tagEnd + 1);
    const close = lower.indexOf("</script", tagEnd);
    if (close === -1) return blocks;
    if (/application\/ld\+json/i.test(tag)) blocks.push(html.slice(tagEnd + 1, close));
    const closeEnd = lower.indexOf(">", close);
    if (closeEnd === -1) return blocks;
    cursor = closeEnd + 1;
  }
}
