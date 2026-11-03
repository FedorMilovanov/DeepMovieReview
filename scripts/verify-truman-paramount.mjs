import { pathToFileURL } from "node:url";

export const PARAMOUNT_FILM_URL = "https://www.paramount.com/movies/the-truman-show";

/**
 * A 200 response is not enough: the former URL redirects to Paramount's home
 * page. Check the final origin/path and visible card content, not metadata or
 * scripts that could also appear on an unrelated page. The runtime is the
 * studio's rounded display, not a measurement of the viewing master.
 */
export function assertParamountFilmPage({ status, finalUrl, html }) {
  if (status !== 200) throw new Error(`Paramount returned HTTP ${status}, not 200`);

  let actual;
  try {
    actual = new URL(finalUrl);
  } catch {
    throw new Error("Paramount final URL is invalid");
  }
  if (actual.protocol !== "https:" || actual.hostname !== "www.paramount.com" ||
      actual.port || actual.username || actual.password ||
      actual.pathname.replace(/\/$/, "") !== "/movies/the-truman-show") {
    throw new Error(`Paramount final URL is not the film card: ${actual.href}`);
  }
  if (typeof html !== "string") throw new Error("Paramount response body is not text");

  const text = html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(head|script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&(?:nbsp|#160|#x0*a0);/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!/\bThe\s+Truman\s+Show\b/i.test(text)) throw new Error("Film title is absent from the card");
  if (!/\bYear\s+1998\b/i.test(text)) throw new Error("Film card does not show Year 1998");
  if (!/\bRunning\s+Time\s+104\s+MIN\b/i.test(text)) throw new Error("Film card does not show Running Time 104 MIN");
}

export async function verifyParamountFilmPage(fetchPage = fetch) {
  const response = await fetchPage(PARAMOUNT_FILM_URL, {
    redirect: "follow",
    signal: AbortSignal.timeout(15000),
    headers: { "user-agent": "DeepMovieReview source verification" },
  });
  const html = await response.text();
  assertParamountFilmPage({ status: response.status, finalUrl: response.url, html });
  return { finalUrl: response.url, status: response.status };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const result = await verifyParamountFilmPage();
    console.log(`Paramount film card verified: ${result.finalUrl} (HTTP ${result.status}; The Truman Show / 1998 / 104 MIN)`);
  } catch (error) {
    console.error(`Paramount film card not verified: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}
