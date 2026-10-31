import { DOMParser } from "@xmldom/xmldom";

// Extract a separately fetched, server-rendered NONE baseline. Do not guess a
// hard-coded number of sections: editorial content can legitimately change.
export function parseArticleSectionIds(html) {
  const errors = [];
  const document = new DOMParser({ onError: (level, message) => errors.push({ level, message }) })
    .parseFromString(html, "text/html");
  if (errors.length) throw new Error("Could not parse the NONE article baseline");
  const ids = Array.from(document.getElementsByTagName("section"))
    .filter((element) => (element.getAttribute("class") ?? "").split(/\s+/).includes("articleSection"))
    .map((element) => element.getAttribute("id"));
  if (!ids.length || ids.some((id) => !id)) throw new Error("NONE article baseline has missing section IDs");
  if (new Set(ids).size !== ids.length) throw new Error("NONE article baseline has duplicate section IDs");
  return ids;
}

// A changed URL, a blank page or a partially updated DOM is not proof that the
// native browser reached the same projection as the independent NONE response.
export function noneArticleProjectionReached(state, { expectedUrl, beforeSections, expectedSectionIds }) {
  if (!state || !Number.isInteger(beforeSections) || beforeSections < 2 ||
      !Array.isArray(expectedSectionIds) || expectedSectionIds.length < 1 || expectedSectionIds.length >= beforeSections ||
      !Array.isArray(state.sectionIds) || state.sectionIds.length !== expectedSectionIds.length ||
      !expectedSectionIds.every((id, index) => typeof id === "string" && id && state.sectionIds[index] === id) ||
      state.noneSelected !== true || state.lastSectionPresent !== false) return false;
  try {
    const observed = new URL(state.url);
    const expected = new URL(expectedUrl);
    const levels = observed.searchParams.getAll("spoilers");
    return observed.origin === expected.origin && observed.pathname === expected.pathname && !observed.username && !observed.password &&
      (levels.length === 0 || (levels.length === 1 && levels[0].toLowerCase() === "none"));
  } catch {
    return false;
  }
}
